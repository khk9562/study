/**
 * 환경 변수 로딩 및 검증.
 * 로컬 실행 시 .env 를 직접 export 하거나, GitHub Actions 에서는 Secrets 로 주입한다.
 */

import { readFileSync, existsSync } from "node:fs";

/**
 * 의존성 없는 간단 .env 로더. 로컬 실행/테스트용.
 * 이미 process.env 에 있는 값은 덮어쓰지 않는다(실제 환경변수 우선).
 */
export function loadDotenv(path = ".env"): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trimStart().startsWith("#")) continue;
    const key = m[1];
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

export interface Config {
  notionToken: string;
  databaseId: string;
  /** 민감어 → 대체어 치환 사전. 공개 레포에 커밋하지 않고 Secret(REDACTION_MAP)으로 주입. */
  redactionMap: Record<string, string>;
  dryRun: boolean;
  /** 전체 재빌드(증분 무시). 치환사전/denylist 변경 후 전 글에 재적용할 때 사용. */
  force: boolean;
  /** Telegram 알림(선택). 둘 다 있을 때만 활성화. */
  telegram: { token?: string; chatId?: string };
}

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`환경 변수 ${name} 가 비어 있습니다. (.env 또는 GitHub Secrets 확인)`);
  }
  return v.trim();
}

export function loadConfig(): Config {
  loadDotenv();
  let redactionMap: Record<string, string> = {};
  const raw = process.env.REDACTION_MAP;
  if (raw && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        redactionMap = parsed;
      } else {
        throw new Error("객체(JSON object) 형태가 아닙니다.");
      }
    } catch (e) {
      throw new Error(`REDACTION_MAP 파싱 실패: ${(e as Error).message}`);
    }
  }

  return {
    notionToken: required("NOTION_TOKEN"),
    databaseId: required("NOTION_DATABASE_ID"),
    redactionMap,
    dryRun: process.argv.includes("--dry-run"),
    force: process.argv.includes("--force") || process.env.FORCE_REBUILD === "true",
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN?.trim(),
      chatId: process.env.TELEGRAM_CHAT_ID?.trim(),
    },
  };
}
