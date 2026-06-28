import { rm, mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.js";
import { createClient, getPublishedPages, type TilPage } from "./notion.js";
import { pageToMarkdown, buildFrontmatter, slugify, tagToDir } from "./convert.js";
import { redact } from "./redact.js";
import { buildReadme, type IndexEntry } from "./buildIndex.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIL_DIR = join(ROOT, "til");

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function primaryTag(page: TilPage): string {
  return page.tags.length ? tagToDir(page.tags[0]) : "기타";
}

async function main() {
  const cfg = loadConfig();
  const syncedAt = todayIso();
  const notion = createClient(cfg.notionToken);

  console.log(`▶ Notion TIL 동기화 시작 (dry-run=${cfg.dryRun})`);
  if (Object.keys(cfg.redactionMap).length === 0) {
    console.warn("⚠ REDACTION_MAP 이 비어 있습니다. 치환 없이 denylist만 동작합니다.");
  }

  const pages = await getPublishedPages(notion, cfg.databaseId);
  console.log(`  공개(공개=✓) 글: ${pages.length}개`);

  const written: IndexEntry[] = [];
  const blocked: { title: string; reasons: string[] }[] = [];
  const usedPaths = new Set<string>();

  // 멱등성: til/ 전체 재생성 (dry-run이 아닐 때만 실제 삭제)
  if (!cfg.dryRun) {
    await rm(TIL_DIR, { recursive: true, force: true });
    await mkdir(TIL_DIR, { recursive: true });
  }

  for (const page of pages) {
    const rawBody = await pageToMarkdown(notion, page.id);

    // 치환 사전 적용 + denylist 이중 스캔(원본 + 치환 후). 어느 한쪽이라도 걸리면 발행 차단.
    const titleR = redact(page.title, cfg.redactionMap);
    const bodyR = redact(rawBody, cfg.redactionMap);
    const reasons = [...new Set([...titleR.blockedBy, ...bodyR.blockedBy])];
    if (reasons.length > 0) {
      blocked.push({ title: page.title, reasons });
      console.log(`  ⛔ 차단: "${page.title}" → [${reasons.join(", ")}]`);
      continue;
    }
    const redactedTitle = titleR.text;
    const redactedBody = bodyR.text;

    // 파일 경로 결정 (태그 폴더 + 슬러그, 충돌 시 notion_id 접미사)
    const dir = primaryTag(page);
    let slug = slugify(redactedTitle);
    let rel = join("til", dir, `${slug}.md`);
    if (usedPaths.has(rel)) {
      slug = `${slug}-${page.id.replace(/-/g, "").slice(0, 8)}`;
      rel = join("til", dir, `${slug}.md`);
    }
    usedPaths.add(rel);

    const redactedPage: TilPage = { ...page, title: redactedTitle };
    const content = buildFrontmatter(redactedPage, syncedAt) + redactedBody + "\n";

    if (!cfg.dryRun) {
      const abs = join(ROOT, rel);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, "utf8");
    }

    written.push({
      title: redactedTitle,
      tags: page.tags,
      date: page.date ?? page.createdTime.slice(0, 10),
      path: rel.split("\\").join("/"),
    });
    console.log(`  ✅ ${cfg.dryRun ? "[쓸 예정] " : ""}${rel}`);
  }

  // README 인덱스 생성
  const readme = buildReadme(written);
  if (!cfg.dryRun) {
    await writeFile(join(ROOT, "README.md"), readme, "utf8");
  }

  console.log("\n── 요약 ──");
  console.log(`  발행: ${written.length}개`);
  console.log(`  차단: ${blocked.length}개`);
  if (blocked.length) {
    for (const b of blocked) console.log(`    - ${b.title}: [${b.reasons.join(", ")}]`);
  }

  // GitHub Actions Job Summary 출력
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## 🌱 TIL 동기화 결과",
      `- 발행: **${written.length}**개`,
      `- 차단: **${blocked.length}**개`,
      ...blocked.map((b) => `  - ⛔ ${b.title} → \`${b.reasons.join(", ")}\``),
    ];
    await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n", { flag: "a" });
  }
}

main().catch((e) => {
  console.error("동기화 실패:", e);
  process.exit(1);
});
