import { applyMasks, scanDenylist } from "./denylist.js";

// 제어문자(백스페이스 등). \t(09) \n(0A) \r(0D)은 제외.
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

/** 정규식 메타문자를 이스케이프한다. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 치환 사전을 적용한다. 키를 대소문자 무시하고 전역 치환한다.
 * 긴 키부터 적용해 부분 치환으로 인한 누락을 줄인다.
 */
export function applyRedactionMap(text: string, map: Record<string, string>): string {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let out = text;
  for (const key of keys) {
    if (!key) continue;
    const re = new RegExp(escapeRegExp(key), "gi");
    // 함수 치환으로 대체어의 `$&`/`$1` 등 특수 시퀀스가 해석되지 않게 한다.
    out = out.replace(re, () => map[key]);
  }
  return out;
}

export interface RedactionResult {
  text: string;
  /** 발행해도 안전하면 true. denylist 잔존 매치가 있으면 false. */
  safe: boolean;
  /** 차단 사유(매치된 규칙 이름). safe=false 일 때만 채워진다. */
  blockedBy: string[];
}

/**
 * 1) 마스킹(이메일/IP → placeholder) → 2) 치환 사전(회사명 등) → 3) 차단 규칙 검사.
 *
 * 마스킹은 **원본 기준**으로 먼저 적용한다. 회사명 치환이 도메인을 한글로 바꿔
 * 이메일 정규식을 빠져나가는 엣지(dev@회사B.com)를 막기 위함.
 * 차단 규칙(토큰/키 등)은 원본·결과 양쪽에서 검사해 하나라도 걸리면 safe=false(발행 차단).
 */
export function redact(text: string, map: Record<string, string>): RedactionResult {
  // 제어문자 제거(\t \n \r 유지) — 마크다운/YAML 파싱 깨짐 방지
  const cleaned = text.replace(CONTROL_CHARS, "");
  const masked = applyMasks(cleaned);
  const redacted = applyRedactionMap(masked, map);
  const blockedBy = [...new Set([...scanDenylist(text), ...scanDenylist(redacted)])];
  return {
    text: redacted,
    safe: blockedBy.length === 0,
    blockedBy,
  };
}
