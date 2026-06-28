import { scanDenylist } from "./denylist.js";

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
    out = out.replace(re, map[key]);
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
 * 1) 치환 사전 적용 → 2) denylist 스캔.
 * 잔존 위험 패턴이 있으면 safe=false 로 표시(호출부에서 발행 차단).
 */
export function redact(text: string, map: Record<string, string>): RedactionResult {
  const redacted = applyRedactionMap(text, map);
  const blockedBy = scanDenylist(redacted);
  return {
    text: redacted,
    safe: blockedBy.length === 0,
    blockedBy,
  };
}
