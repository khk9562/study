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
  const lines = [
    "---",
    `title: "${yamlEscape(page.title)}"`,
    `tags: [${tags}]`,
    `date: ${page.date ?? page.createdTime.slice(0, 10)}`,
    `notion_id: ${page.id}`,
    `synced_at: ${syncedAt}`,
    "---",
    "",
  ];
  return lines.join("\n");
}

/** 노션 페이지 본문을 마크다운 문자열로 변환한다. */
export async function pageToMarkdown(notion: Client, pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const blocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(blocks);
  return (md.parent ?? "").trim();
}
