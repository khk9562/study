import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { TilPage } from "./notion.js";

/** 파일/폴더 이름으로 안전한 문자열로 변환. 한글은 보존한다. */
export function slugify(title: string): string {
  return (
    title
      .trim()
      .replace(/[\\/:*?"<>|#%{}]/g, "") // 파일시스템/URL 위험 문자 제거
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

/** 태그명을 폴더명으로 안전하게. (슬래시만 치환, 나머지는 보존) */
export function tagToDir(tag: string): string {
  return tag.replace(/[\\/]/g, "-").trim() || "기타";
}

function yamlEscape(s: string): string {
  return s.replace(/"/g, '\\"');
}

export function buildFrontmatter(page: TilPage, syncedAt: string): string {
  const tags = page.tags.map((t) => `"${yamlEscape(t)}"`).join(", ");
  const start = page.date ?? page.createdTime.slice(0, 10);
  const lines = [
    "---",
    `title: "${yamlEscape(page.title)}"`,
    `tags: [${tags}]`,
    `date: ${start}`,
  ];
  if (page.dateEnd && page.dateEnd !== start) lines.push(`end_date: ${page.dateEnd}`);
  lines.push(
    `notion_id: ${page.id}`,
    `notion_last_edited: ${page.lastEdited}`,
    `synced_at: ${syncedAt}`,
    "---",
    ""
  );
  return lines.join("\n");
}

/** 본문 상단에 보이는 학습 날짜 줄. 종료일이 있으면 기간으로 표기. */
export function buildDateLine(page: TilPage): string {
  const start = page.date ?? page.createdTime.slice(0, 10);
  if (page.dateEnd && page.dateEnd !== start) {
    return `> 📅 **학습 기간**: ${start} ~ ${page.dateEnd}\n\n`;
  }
  return `> 📅 **학습일**: ${start}\n\n`;
}

/** 기존 .md 파일의 frontmatter에서 증분 동기화에 필요한 값만 파싱한다. */
export function parseFrontmatter(
  content: string
): { notionId?: string; lastEdited?: string; title?: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const block = m[1];
  const id = block.match(/^notion_id:\s*(.+)$/m)?.[1]?.trim();
  const edited = block.match(/^notion_last_edited:\s*(.+)$/m)?.[1]?.trim();
  const title = block.match(/^title:\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\"/g, '"');
  return { notionId: id, lastEdited: edited, title };
}

/**
 * 마크다운에서 이미지 임베드를 제거한다.
 * 이유(공개 레포 보안): ① 노션 업로드 이미지는 회사 대시보드 스크린샷 등 민감 자료일 수 있고,
 * ② 그 URL은 AWS presigned(임시 STS 토큰 포함, 1시간 만료)라 커밋하면 자격증명이 히스토리에 남는다.
 * 따라서 이미지는 기본적으로 본문에서 빼고 자리표시만 남긴다.
 */
export function stripImages(md: string): string {
  return md.replace(/!\[[^\]]*\]\([^)]*\)/g, "*(이미지 생략)*");
}

/** 노션 DB 속성 1칸을 표 셀 텍스트로 변환. (파이프/줄바꿈 이스케이프) */
function cellToText(p: any): string {
  let v = "";
  switch (p?.type) {
    case "title": v = (p.title ?? []).map((t: any) => t.plain_text).join(""); break;
    case "rich_text": v = (p.rich_text ?? []).map((t: any) => t.plain_text).join(""); break;
    case "number": v = p.number == null ? "" : String(p.number); break;
    case "select": v = p.select?.name ?? ""; break;
    case "status": v = p.status?.name ?? ""; break;
    case "multi_select": v = (p.multi_select ?? []).map((s: any) => s.name).join(", "); break;
    case "date": v = p.date ? (p.date.end ? `${p.date.start} ~ ${p.date.end}` : p.date.start ?? "") : ""; break;
    case "checkbox": v = p.checkbox ? "✓" : "✗"; break;
    case "url": v = p.url ?? ""; break;
    case "email": v = p.email ?? ""; break;
    case "phone_number": v = p.phone_number ?? ""; break;
    case "people": v = (p.people ?? []).map((x: any) => x.name).filter(Boolean).join(", "); break;
    case "created_time": v = (p.created_time ?? "").slice(0, 10); break;
    case "last_edited_time": v = (p.last_edited_time ?? "").slice(0, 10); break;
    case "formula": v = p.formula ? String(p.formula[p.formula.type] ?? "") : ""; break;
    case "rollup": v = p.rollup?.type === "number" ? String(p.rollup.number ?? "") : ""; break;
    case "relation": v = (p.relation ?? []).length ? `(${p.relation.length})` : ""; break;
    default: v = "";
  }
  return v.replace(/\|/g, "\\|").replace(/\r?\n+/g, " ").trim();
}

/**
 * child 데이터베이스(인라인 + 링크드 뷰)를 마크다운 표로 렌더링. 이미지/파일 컬럼은 제외.
 * 링크드 뷰도 Notion이 `child_database` 블록으로 내려주므로 동일 경로로 처리된다.
 * (원본 DB resolve가 안 되는 일부 링크드 뷰는 호출부에서 catch → 제목 폴백)
 */
async function renderChildDatabase(notion: Client, databaseId: string): Promise<string> {
  const db: any = await notion.databases.retrieve({ database_id: databaseId });
  const cols = Object.entries<any>(db.properties)
    .filter(([, p]) => p.type !== "files") // 이미지/파일 컬럼 제외
    .map(([name, p]) => ({ name, type: p.type }))
    .sort((a, b) =>
      a.type === "title" ? -1 : b.type === "title" ? 1 : a.name.localeCompare(b.name, "ko")
    );
  if (cols.length === 0) return "";

  const rows: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res: any = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  if (rows.length === 0) return "";

  const header = `| ${cols.map((c) => c.name).join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((r) => `| ${cols.map((c) => cellToText(r.properties?.[c.name])).join(" | ")} |`)
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

/** 노션 페이지 본문을 마크다운 문자열로 변환한다. (이미지 제거 + child DB는 표로 렌더링) */
export async function pageToMarkdown(notion: Client, pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  // child DB(인라인·링크드 뷰) → 표. 행이 없거나 파일/이미지 전용이면 false → 기본 동작(제목)으로 폴백.
  n2m.setCustomTransformer("child_database", async (block: any) => {
    const title = block.child_database?.title;
    try {
      const table = await renderChildDatabase(notion, block.id);
      if (!table) {
        console.warn(`ℹ child_database 행없음/파일전용: id=${block.id} title=${title}`);
        return false;
      }
      return `${title ? `**${title}**\n\n` : ""}${table}`;
    } catch (e: any) {
      console.warn(
        `⚠ child_database 접근불가(링크드뷰 추정): id=${block.id} title=${title} err=${e?.code || e?.message}`
      );
      return false;
    }
  });
  const blocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(blocks);
  return stripImages((md.parent ?? "").trim());
}
