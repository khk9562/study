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
 * 1) 치환 사전 적용 → 2) denylist 이중 스캔.
 * 위험 패턴은 **원본**과 **치환 후** 양쪽에서 검사한다.
 * 치환이 회사 도메인을 가려 이메일 정규식을 빠져나가는 엣지 케이스(dev@회사B.com)까지
 * 원본 검사로 잡아내기 위함. 어느 한쪽이라도 걸리면 safe=false (발행 차단).
 */
export function redact(text: string, map: Record<string, string>): RedactionResult {
  const redacted = applyRedactionMap(text, map);
  const blockedBy = [...new Set([...scanDenylist(text), ...scanDenylist(redacted)])];
  return {
    text: redacted,
    safe: blockedBy.length === 0,
    blockedBy,
  };
}
