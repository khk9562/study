import { mkdir, writeFile, readFile, readdir, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.js";
import { createClient, getPublishedPages, type TilPage } from "./notion.js";
import {
  pageToMarkdown,
  buildFrontmatter,
  buildDateLine,
  slugify,
  tagToDir,
  parseFrontmatter,
} from "./convert.js";
import { redact } from "./redact.js";
import { buildReadme, type IndexEntry } from "./buildIndex.js";
import { sendTelegram, telegramEnabled } from "./telegram.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIL_DIR = join(ROOT, "til");

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toPosix(p: string): string {
  return p.split("\\").join("/");
}

function primaryTag(page: TilPage): string {
  return page.tags.length ? tagToDir(page.tags[0]) : "기타";
}

interface ExistingFile {
  rel: string;
  lastEdited: string;
  title: string;
}

/** 기존 til 폴더의 .md 파일을 훑어 notion_id → {경로, 마지막편집, 제목} 맵을 만든다. */
async function readExisting(): Promise<Map<string, ExistingFile>> {
  const map = new Map<string, ExistingFile>();
  let entries: string[] = [];
  try {
    entries = await readdir(TIL_DIR, { recursive: true });
  } catch {
    return map; // til/ 없음(최초 실행)
  }
  for (const e of entries) {
    if (!e.endsWith(".md")) continue;
    const rel = toPosix(join("til", e));
    let content: string;
    try {
      content = await readFile(join(ROOT, rel), "utf8");
    } catch {
      continue;
    }
    const fm = parseFrontmatter(content);
    if (fm.notionId) {
      map.set(fm.notionId, { rel, lastEdited: fm.lastEdited ?? "", title: fm.title ?? "" });
    }
  }
  return map;
}

async function main() {
  const cfg = loadConfig();
  const syncedAt = todayIso();
  const notion = createClient(cfg.notionToken);

  console.log(`▶ Notion TIL 동기화 시작 (dry-run=${cfg.dryRun}, force=${cfg.force})`);
  if (Object.keys(cfg.redactionMap).length === 0) {
    console.warn("⚠ REDACTION_MAP 이 비어 있습니다. 치환 없이 denylist만 동작합니다.");
  }

  const runTag = cfg.dryRun ? "🧪 [테스트] " : "";
  await sendTelegram(cfg.telegram, `${runTag}🔄 TIL 동기화 시작`);

  const existing = await readExisting();
  const pages = await getPublishedPages(notion, cfg.databaseId);
  console.log(`  공개(공개=✓) 글: ${pages.length}개 / 기존 파일: ${existing.size}개`);

  if (!cfg.dryRun) await mkdir(TIL_DIR, { recursive: true });

  const indexEntries: IndexEntry[] = []; // 전체 공개 글(인덱스용)
  const blocked: { title: string; reasons: string[] }[] = [];
  const usedPaths = new Set<string>();
  const updatedTitles: string[] = [];
  let skipped = 0;

  // 1) 변경 없는 글: 파일을 건드리지 않고 경로만 예약 + 인덱스에 포함
  const changedPages: TilPage[] = [];
  for (const page of pages) {
    const ex = existing.get(page.id);
    const unchanged = !cfg.force && ex && ex.lastEdited === page.lastEdited;
    if (unchanged) {
      usedPaths.add(ex!.rel);
      indexEntries.push({
        title: ex!.title || page.title,
        tags: page.tags,
        date: page.date ?? page.createdTime.slice(0, 10),
        path: ex!.rel,
      });
      skipped++;
    } else {
      changedPages.push(page);
    }
  }

  // 2) 새 글 / 편집된 글: 본문을 가져와 치환·검사 후 덮어쓰기
  for (const page of changedPages) {
    const rawBody = await pageToMarkdown(notion, page.id);

    // 치환 + denylist 이중 스캔(원본/치환 후). 하나라도 걸리면 발행 차단.
    const titleR = redact(page.title, cfg.redactionMap);
    const bodyR = redact(rawBody, cfg.redactionMap);
    const reasons = [...new Set([...titleR.blockedBy, ...bodyR.blockedBy])];
    if (reasons.length > 0) {
      blocked.push({ title: page.title, reasons });
      console.log(`  ⛔ 차단: "${page.title}" → [${reasons.join(", ")}]`);
      continue; // 발행 안 함 → 기존 파일이 있으면 아래 정리 단계에서 삭제됨
    }
    const redactedTitle = titleR.text;
    const redactedBody = bodyR.text;

    // 경로 결정 (태그 폴더 + 슬러그, 충돌 시 notion_id 접미사)
    const dir = primaryTag(page);
    let slug = slugify(redactedTitle);
    let rel = `til/${dir}/${slug}.md`;
    if (usedPaths.has(rel)) {
      slug = `${slug}-${page.id.replace(/-/g, "").slice(0, 8)}`;
      rel = `til/${dir}/${slug}.md`;
    }
    usedPaths.add(rel);

    const redactedPage: TilPage = { ...page, title: redactedTitle };
    const content =
      buildFrontmatter(redactedPage, syncedAt) + buildDateLine(redactedPage) + redactedBody + "\n";

    if (!cfg.dryRun) {
      const abs = join(ROOT, rel);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, "utf8");
    }

    indexEntries.push({
      title: redactedTitle,
      tags: page.tags,
      date: page.date ?? page.createdTime.slice(0, 10),
      path: rel,
    });
    updatedTitles.push(redactedTitle);
    const isNew = !existing.has(page.id);
    console.log(`  ${cfg.dryRun ? "[쓸 예정] " : ""}${isNew ? "🆕" : "✏️"} ${rel}`);
  }

  // 3) 정리: 공개 해제/삭제/차단/경로변경으로 더 이상 유효하지 않은 파일 제거
  const removed: string[] = [];
  for (const [, ex] of existing) {
    if (!usedPaths.has(ex.rel)) {
      removed.push(ex.title || ex.rel);
      console.log(`  ${cfg.dryRun ? "[삭제 예정] " : ""}🗑️ ${ex.rel}`);
      if (!cfg.dryRun) await unlink(join(ROOT, ex.rel)).catch(() => {});
    }
  }

  // README 인덱스 (내용 동일하면 git diff 없음)
  if (!cfg.dryRun) {
    await writeFile(join(ROOT, "README.md"), buildReadme(indexEntries), "utf8");
  }

  console.log("\n── 요약 ──");
  console.log(`  공개 총 ${indexEntries.length}개 (갱신 ${updatedTitles.length} · 유지 ${skipped})`);
  console.log(`  삭제 ${removed.length}개 · 차단 ${blocked.length}개`);
  if (blocked.length) for (const b of blocked) console.log(`    ⛔ ${b.title}: [${b.reasons.join(", ")}]`);

  // GitHub Actions Job Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## 🌱 TIL 동기화 결과",
      `- 공개 총 **${indexEntries.length}** (갱신 ${updatedTitles.length} · 유지 ${skipped})`,
      `- 삭제 **${removed.length}** · 차단 **${blocked.length}**`,
      ...blocked.map((b) => `  - ⛔ ${b.title} → \`${b.reasons.join(", ")}\``),
    ];
    await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n", { flag: "a" });
  }

  // Telegram 완료 알림 — 오늘 실제로 바뀐 것 위주로
  if (telegramEnabled(cfg.telegram)) {
    const cap = 30;
    const fmtList = (arr: string[]) =>
      arr.length
        ? arr.slice(0, cap).map((t) => `• ${t}`).join("\n") +
          (arr.length > cap ? `\n…외 ${arr.length - cap}건` : "")
        : "(없음)";
    const msg = [
      `${runTag}✅ TIL 동기화 완료`,
      `(공개 총 ${indexEntries.length} · 변경없음 ${skipped})`,
      "",
      `🔄 갱신 ${updatedTitles.length}건:`,
      fmtList(updatedTitles),
      "",
      `🗑️ 삭제 ${removed.length}건:`,
      fmtList(removed),
      "",
      `⛔ 발행 실패 ${blocked.length}건 (보안 필터):`,
      fmtList(blocked.map((b) => `${b.title} — ${b.reasons.join(", ")}`)),
    ].join("\n");
    await sendTelegram(cfg.telegram, msg);
  }
}

main().catch(async (e) => {
  console.error("동기화 실패:", e);
  // 스크립트 자체가 죽은 경우(API 장애·설정 오류 등) 실패 알림. config 로딩 실패도 커버하도록 env 직접 사용.
  const dry = process.argv.includes("--dry-run") ? "🧪 [테스트] " : "";
  await sendTelegram(
    { token: process.env.TELEGRAM_BOT_TOKEN?.trim(), chatId: process.env.TELEGRAM_CHAT_ID?.trim() },
    `${dry}❌ TIL 동기화 실패\n\n사유: ${(e as Error).message}`
  );
  process.exit(1);
});
