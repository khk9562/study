import { Client } from "@notionhq/client";

export interface TilPage {
  id: string;
  title: string;
  tags: string[];
  /** 학습 시작일 ISO date (YYYY-MM-DD) 또는 null */
  date: string | null;
  /** 학습 종료일(날짜 범위일 때만). 단일 날짜면 null */
  dateEnd: string | null;
  /** 폴더 분류(Select). 없으면 null → 첫 태그/기타로 폴백 */
  folder: string | null;
  createdTime: string;
  /** Notion 마지막 편집시각(ISO). 증분 동기화 변경 감지에 사용 */
  lastEdited: string;
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

function readFolder(props: any): string | null {
  const f = props?.["폴더"]?.select?.name;
  return typeof f === "string" && f.trim() ? f.trim() : null;
}

function readDate(props: any): string | null {
  const d = props?.["날짜"]?.date?.start;
  if (typeof d === "string") return d.slice(0, 10);
  return null;
}

function readDateEnd(props: any): string | null {
  const d = props?.["날짜"]?.date?.end;
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
        dateEnd: readDateEnd(props),
        folder: readFolder(props),
        createdTime: page.created_time,
        lastEdited: page.last_edited_time,
      });
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}
