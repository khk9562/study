/**
 * Velog(@<username>) 글을 마크다운으로 아카이빙한다.
 * - velog/<연도>/<slug>.md 로 저장, velog/README.md 인덱스 생성
 * - TIL과 동일한 치환·마스킹·차단 파이프라인 통과 (velog 이미지는 공개 CDN이라 유지)
 * - 증분: updated_at 이 바뀐 글만 다시 받아 덮어씀. 삭제/비공개 글은 정리.
 *
 *   npm run velog          실제 동기화
 *   npm run velog -- --dry-run    미리보기(쓰기 없음)
 *   npm run velog -- --force      전체 재빌드
 */
import { mkdir, writeFile, readFile, readdir, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadDotenv } from "./config.js";
import { redact } from "./redact.js";
import { slugify, tagToDir } from "./convert.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VELOG_DIR = join(ROOT, "velog");
const API = "https://v2.velog.io/graphql";

loadDotenv();
const USERNAME = (process.env.VELOG_USERNAME || "steela").trim();
const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force") || process.env.FORCE_REBUILD === "true";

let redactionMap: Record<string, string> = {};
if (process.env.REDACTION_MAP?.trim()) {
  try {
    const p = JSON.parse(process.env.REDACTION_MAP);
    if (p && typeof p === "object" && !Array.isArray(p)) redactionMap = p;
  } catch {
    console.warn("⚠ REDACTION_MAP 파싱 실패 — 치환 없이 진행");
  }
}

/**
 * velog 글을 TIL과 동일한 폴더 분류 체계로 매핑한다(태그·제목 우선순위 규칙).
 * 코딩테스트/React Native는 사용자 합의로 신설된 폴더.
 */
function classify(title: string, tags: string[]): string {
  const t = title.toLowerCase();
  const norm = (s: string) => s.toLowerCase().replace(/[\s._-]/g, "");
  const tagsN = tags.map(norm);
  const hasTag = (...ks: string[]) => ks.some((k) => tagsN.includes(norm(k)));
  const tagIncl = (sub: string) => tagsN.some((x) => x.includes(sub));
  const titleHas = (...subs: string[]) => subs.some((s) => t.includes(s.toLowerCase()));

  if (hasTag("코딩테스트", "프로그래머스", "백준", "코테", "programmers", "codingtest") || titleHas("백준", "프로그래머스"))
    return "코딩테스트";
  if (hasTag("reactnative", "react native", "expo", "rn") || tagIncl("reactnative") || titleHas("[rn", "얼레벌레", "react native", "reactnative"))
    return "React Native";
  if (titleHas("정보처리기사") || hasTag("정보처리기사")) return "자격증";
  if (hasTag("css", "styledcomponent", "styledcomponents", "sticky", "globalstyle", "jsx") || titleHas("[css]", "styled", "스크롤", "접기", "폰트"))
    return "CSS·UI";
  if (hasTag("vite", "webpack", "npm", "git", "github", "prettier") || titleHas("개발환경", "세팅", "번들러", "폴더 구조", "prettier", "npm"))
    return "빌드·환경·Git";
  if (hasTag("fastapi", "sqlalchemy") || titleHas("fastapi", "백엔드")) return "백엔드·인프라";
  if (hasTag("zustand", "recoil", "jotai", "reduxtoolkit", "contextapi", "reactquery", "tanstackquery") || titleHas("상태 관리", "데이터 교환"))
    return "데이터·상태관리";
  if (tagIncl("nextjs") || titleHas("[next.js")) return "Next.js";
  if (hasTag("typescript", "javascript") || titleHas("[typescript]")) return "JavaScript·TypeScript";
  if (tagIncl("react") || titleHas("[react]")) return "React";
  return "기타";
}

interface VelogListItem {
  id: string;
  title: string;
  url_slug: string;
  released_at: string;
  updated_at: string | null;
  tags: string[];
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json: any = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 300));
  return json.data;
}

/** 전체 글 목록 (커서 페이지네이션) */
async function listPosts(): Promise<VelogListItem[]> {
  const q = `query($username:String,$cursor:ID){posts(username:$username,cursor:$cursor,limit:50){id title url_slug released_at updated_at tags}}`;
  const all: VelogListItem[] = [];
  let cursor: string | undefined = undefined;
  for (;;) {
    const data: { posts: VelogListItem[] } = await gql(q, { username: USERNAME, cursor });
    const batch: VelogListItem[] = data.posts ?? [];
    all.push(...batch);
    if (batch.length < 50) break;
    cursor = batch[batch.length - 1].id;
  }
  return all;
}

async function fetchBody(url_slug: string): Promise<string> {
  const q = `query($username:String,$url_slug:String){post(username:$username,url_slug:$url_slug){body}}`;
  const data = await gql<{ post: { body: string } | null }>(q, { username: USERNAME, url_slug });
  return data.post?.body ?? "";
}

function toPosix(p: string): string {
  return p.split("\\").join("/");
}

interface Existing {
  rel: string;
  updated: string;
  title: string;
}

async function readExisting(): Promise<Map<string, Existing>> {
  const map = new Map<string, Existing>();
  let entries: string[] = [];
  try {
    entries = await readdir(VELOG_DIR, { recursive: true });
  } catch {
    return map;
  }
  for (const e of entries) {
    if (!e.endsWith(".md") || e.endsWith("README.md")) continue;
    const rel = toPosix(join("velog", e));
    let content: string;
    try {
      content = await readFile(join(ROOT, rel), "utf8");
    } catch {
      continue;
    }
    const m = content.match(/^---\n([\s\S]*?)\n---/);
    const b = m?.[1] ?? "";
    const id = b.match(/^velog_id:\s*(.+)$/m)?.[1]?.trim();
    const updated = b.match(/^velog_updated:\s*(.+)$/m)?.[1]?.trim() ?? "";
    const title = b.match(/^title:\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\"/g, '"') ?? "";
    if (id) map.set(id, { rel, updated, title });
  }
  return map;
}

function frontmatter(p: VelogListItem, redactedTitle: string, syncedAt: string): string {
  const tags = p.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(", ");
  const url = `https://velog.io/@${USERNAME}/${p.url_slug}`;
  return [
    "---",
    `title: "${redactedTitle.replace(/"/g, '\\"')}"`,
    `tags: [${tags}]`,
    `date: ${p.released_at.slice(0, 10)}`,
    `velog_id: ${p.id}`,
    `velog_url: ${url}`,
    `velog_updated: ${p.updated_at ?? p.released_at}`,
    `synced_at: ${syncedAt}`,
    "---",
    "",
    `> 🔗 원본: [velog.io/@${USERNAME}/${p.url_slug}](${url}) · 📅 ${p.released_at.slice(0, 10)}`,
    "",
  ].join("\n");
}

function buildIndex(items: { title: string; date: string; rel: string; url: string; tags: string[] }[]): string {
  const header = `# 📦 Velog 아카이브 (@${USERNAME})\n\n> [velog.io/@${USERNAME}](https://velog.io/@${USERNAME}/posts) 글을 마크다운으로 자동 아카이빙합니다. 직접 수정하지 마세요 — 동기화 시 덮어쓰여집니다.\n\n`;
  if (!items.length) return header + "_아직 글이 없습니다._\n";
  const byFolder = new Map<string, typeof items>();
  for (const it of items) {
    const parts = it.rel.split("/");
    const folder = parts.length >= 3 ? parts[1] : "기타";
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder)!.push(it);
  }
  const folders = [...byFolder.keys()].sort(
    (a, b) => byFolder.get(b)!.length - byFolder.get(a)!.length || a.localeCompare(b, "ko")
  );
  let out = header + `총 **${items.length}**개 · **${folders.length}**개 폴더\n\n`;
  for (const folder of folders) {
    const list = byFolder.get(folder)!.slice().sort((a, b) => b.date.localeCompare(a.date));
    out += `## ${folder} (${list.length})\n\n`;
    for (const it of list) {
      const tags = it.tags.length ? ` _(${it.tags.join(", ")})_` : "";
      out += `- ${it.date} · [${it.title}](${encodeURI(it.rel)})${tags}\n`;
    }
    out += "\n";
  }
  return out;
}

async function main() {
  const syncedAt = new Date().toISOString().slice(0, 10);
  console.log(`▶ Velog 아카이빙 시작 (@${USERNAME}, dry-run=${DRY}, force=${FORCE})`);

  const existing = await readExisting();
  const posts = await listPosts();
  console.log(`  velog 글: ${posts.length}개 / 기존 파일: ${existing.size}개`);
  if (!DRY) await mkdir(VELOG_DIR, { recursive: true });

  const indexItems: { title: string; date: string; rel: string; url: string; tags: string[] }[] = [];
  const keep = new Set<string>();
  const blocked: { title: string; reasons: string[] }[] = [];
  let updated = 0;
  let skipped = 0;

  for (const p of posts) {
    const ex = existing.get(p.id);
    const url = `https://velog.io/@${USERNAME}/${p.url_slug}`;
    const curUpdated = p.updated_at ?? p.released_at;
    const unchanged = !FORCE && ex && ex.updated === curUpdated;

    if (unchanged) {
      keep.add(ex!.rel);
      indexItems.push({ title: ex!.title || p.title, date: p.released_at.slice(0, 10), rel: ex!.rel, url, tags: p.tags });
      skipped++;
      continue;
    }

    const rawBody = await fetchBody(p.url_slug);
    const titleR = redact(p.title, redactionMap);
    const bodyR = redact(rawBody, redactionMap);
    const reasons = [...new Set([...titleR.blockedBy, ...bodyR.blockedBy])];
    if (reasons.length) {
      blocked.push({ title: p.title, reasons });
      console.log(`  ⛔ 차단: "${p.title}" → [${reasons.join(", ")}]`);
      continue;
    }

    const rel = `velog/${tagToDir(classify(p.title, p.tags))}/${slugify(p.url_slug)}.md`;
    keep.add(rel);
    const content = frontmatter(p, titleR.text, syncedAt) + bodyR.text + "\n";
    if (!DRY) {
      const abs = join(ROOT, rel);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, "utf8");
    }
    indexItems.push({ title: titleR.text, date: p.released_at.slice(0, 10), rel, url, tags: p.tags });
    updated++;
    console.log(`  ${DRY ? "[쓸 예정] " : ""}${ex ? "✏️" : "🆕"} ${rel}`);
  }

  // 정리: 더 이상 없는 글 파일 제거
  const removed: string[] = [];
  for (const [, ex] of existing) {
    if (!keep.has(ex.rel)) {
      removed.push(ex.title || ex.rel);
      console.log(`  ${DRY ? "[삭제 예정] " : ""}🗑️ ${ex.rel}`);
      if (!DRY) await unlink(join(ROOT, ex.rel)).catch(() => {});
    }
  }

  if (!DRY) await writeFile(join(VELOG_DIR, "README.md"), buildIndex(indexItems), "utf8");

  console.log("\n── 요약 ──");
  console.log(`  총 ${indexItems.length}개 (갱신 ${updated} · 유지 ${skipped}) · 삭제 ${removed.length} · 차단 ${blocked.length}`);
  if (blocked.length) for (const b of blocked) console.log(`    ⛔ ${b.title}: [${b.reasons.join(", ")}]`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## 📦 Velog 아카이빙 결과",
      `- 총 **${indexItems.length}** (갱신 ${updated} · 유지 ${skipped})`,
      `- 삭제 **${removed.length}** · 차단 **${blocked.length}**`,
      ...blocked.map((b) => `  - ⛔ ${b.title} → \`${b.reasons.join(", ")}\``),
    ];
    await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n", { flag: "a" });
  }
}

main().catch((e) => {
  console.error("Velog 아카이빙 실패:", e);
  process.exit(1);
});
