import { Client } from "@notionhq/client";

export interface TilPage {
  id: string;
  title: string;
  tags: string[];
  /** ISO date (YYYY-MM-DD) 또는 null */
  date: string | null;
  createdTime: string;
}

/** 페이지 속성에서 안전하게 값 추출 */
function readTitle(props: any): string {
  const t = props?.["제목"]?.title;
  if (Array.isArray(t)) return t.map((x: any) => x.plain_text).join("").trim();
  return "";
}

function readTags(props: any): string[] {
  const m = props?.["태그"]?.multi_select;
  if (Array.isArray(m)) return m.map((x: any) => x.name);
  return [];
}

function readDate(props: any): string | null {
  const d = props?.["날짜"]?.date?.start;
  if (typeof d === "string") return d.slice(0, 10);
  return null;
}

export function createClient(token: string): Client {
  return new Client({ auth: token });
}

/**
 * `공개` 체크박스가 켜진 페이지만 모두(페이지네이션 포함) 가져온다.
 */
export async function getPublishedPages(
  notion: Client,
  databaseId: string
): Promise<TilPage[]> {
  const pages: TilPage[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res: any = await notion.databases.query({
      database_id: databaseId,
      filter: { property: "공개", checkbox: { equals: true } },
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of res.results) {
      const props = page.properties;
      pages.push({
        id: page.id,
        title: readTitle(props) || "(제목 없음)",
        tags: readTags(props),
        date: readDate(props),
        createdTime: page.created_time,
      });
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}
