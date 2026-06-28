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

/** 노션 페이지 본문을 마크다운 문자열로 변환한다. (이미지는 보안상 제거) */
export async function pageToMarkdown(notion: Client, pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const blocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(blocks);
  return stripImages((md.parent ?? "").trim());
}
