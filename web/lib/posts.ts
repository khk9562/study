import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export interface Post {
  folder: string;
  slug: string;
  source: "til" | "velog";
  title: string;
  tags: string[];
  created: string; // 작성일 (YYYY-MM-DD)
  createdEnd?: string; // 학습 기간 종료일(TIL 범위)
  edited: string; // 편집일 (YYYY-MM-DD)
  velogUrl?: string;
  body: string;
  excerpt: string; // 목록용 본문 발췌(평문)
}

export interface FolderSummary {
  folder: string;
  count: number;
  latest: string; // 최근 작성일
}

// web/ 기준 상위 레포 루트
const ROOT = join(process.cwd(), "..");
const SOURCES: Post["source"][] = ["til", "velog"];

// 원본에 섞인 제어문자(예: 백스페이스 U+0008) 제거 — js-yaml 파싱 깨짐 방지 (\t \n \r 은 유지)
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir, { recursive: true }) as string[]) {
    const p = name.split("\\").join("/");
    if (p.endsWith(".md") && !p.endsWith("README.md")) out.push(p);
  }
  return out;
}

function dateOnly(v: unknown): string {
  return typeof v === "string" ? v.slice(0, 10) : "";
}

/** 마크다운 본문 → 목록용 평문 발췌. 메타 인용구·코드·이미지·서식 제거. */
function toExcerpt(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ") // 코드블록
    .split("\n")
    .filter((l) => !l.trim().startsWith(">")) // 메타 인용구(📅 학습일 / 🔗 원본)
    .join("\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크 → 텍스트
    .replace(/^#{1,6}\s+/gm, "") // 헤딩 마커
    .replace(/^\s*[-*+]\s+/gm, "") // 글머리표
    .replace(/^\s*\d+\.\s+/gm, "") // 번호목록
    .replace(/[*_`~|]/g, " ") // 강조/표 기호
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

let _cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (_cache) return _cache;
  const posts: Post[] = [];
  const usedKeys = new Set<string>(); // `${folder}/${slug}` 충돌 방지

  for (const source of SOURCES) {
    const base = join(ROOT, source);
    for (const rel of listMarkdown(base)) {
      const folder = rel.split("/")[0];
      if (!folder || rel.split("/").length < 2) continue;
      const raw = readFileSync(join(base, rel), "utf8").replace(CONTROL_CHARS, "");
      const { data, content } = matter(raw);

      let slug = rel.slice(folder.length + 1).replace(/\.md$/, "");
      let key = `${folder}/${slug}`;
      if (usedKeys.has(key)) {
        slug = `${slug}-${source}`;
        key = `${folder}/${slug}`;
      }
      usedKeys.add(key);

      const created = dateOnly(data.date) || dateOnly(data.synced_at);
      const edited =
        dateOnly(data.notion_last_edited) || dateOnly(data.velog_updated) || created;

      posts.push({
        folder,
        slug,
        source,
        title: typeof data.title === "string" ? data.title : slug,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        created,
        createdEnd: dateOnly(data.end_date) || undefined,
        edited,
        velogUrl: typeof data.velog_url === "string" ? data.velog_url : undefined,
        body: content.trim(),
        excerpt: toExcerpt(content),
      });
    }
  }

  posts.sort((a, b) => b.created.localeCompare(a.created));
  _cache = posts;
  return posts;
}

/** 폴더 요약: 글 수 내림차순, 동수면 가나다순 */
export function getFolders(): FolderSummary[] {
  const map = new Map<string, Post[]>();
  for (const p of getAllPosts()) {
    if (!map.has(p.folder)) map.set(p.folder, []);
    map.get(p.folder)!.push(p);
  }
  return [...map.entries()]
    .map(([folder, list]) => ({
      folder,
      count: list.length,
      latest: list.reduce((m, p) => (p.created > m ? p.created : m), ""),
    }))
    .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder, "ko"));
}

export function getPostsByFolder(folder: string): Post[] {
  return getAllPosts().filter((p) => p.folder === folder);
}

export function getPost(folder: string, slug: string): Post | undefined {
  return getAllPosts().find((p) => p.folder === folder && p.slug === slug);
}
