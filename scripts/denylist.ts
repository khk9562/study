/**
 * 두 종류의 규칙:
 *  - MASK_RULES : 이메일/IP 같은 일반 PII는 자동으로 placeholder 치환 후 발행한다.
 *  - BLOCK_RULES: 토큰·키·AWS 자격증명 등 진짜 시크릿이 남아 있으면 그 글을 발행 차단한다.
 *
 * 회사 고유의 도메인/식별자는 여기 적지 말고 Secret(REDACTION_MAP)으로 치환할 것.
 */

export interface MaskRule {
  name: string;
  regex: RegExp; // 반드시 g 플래그 (replace 용)
  placeholder: string;
}

export interface DenyRule {
  name: string;
  regex: RegExp;
}

/** 자동 마스킹: 발행은 하되 값만 가린다. */
export const MASK_RULES: MaskRule[] = [
  // 이메일 주소 → <email>
  { name: "email", regex: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, placeholder: "<email>" },
  // IPv4 주소 → <ip주소> (각 옥텟 0~255 검증)
  {
    name: "ip",
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    placeholder: "<ip주소>",
  },
];

/** 발행 차단: 남아 있으면 그 글을 통째로 막는다. */
export const BLOCK_RULES: DenyRule[] = [
  // AWS Access Key ID (AKIA 영구 키 / ASIA 임시 STS 키)
  { name: "aws-key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  // AWS Secret Access Key 패턴 — aws_secret 키워드 동반 시
  { name: "aws-secret", regex: /aws_secret[_a-z]*\s*[:=]\s*['"]?[A-Za-z0-9/+]{30,}/i },
  // AWS presigned URL (노션 업로드 이미지 등) — 임시 자격증명/서명 포함
  { name: "aws-presigned-url", regex: /X-Amz-(?:Signature|Credential|Security-Token)=/i },
  // OpenAI / 일반 sk- 토큰
  { name: "sk-token", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  // GitHub 토큰
  { name: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  // JWT (header.payload.signature)
  { name: "jwt", regex: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  // 흔한 시크릿 키워드 + 값 할당
  {
    name: "secret-assignment",
    regex: /\b(password|passwd|secret|api[_-]?key|access[_-]?token|private[_-]?key)\b\s*[:=]\s*['"][^'"\n]{6,}['"]/i,
  },
];

/** 마스킹 규칙을 적용해 이메일/IP 등을 placeholder로 바꾼다. */
export function applyMasks(text: string): string {
  let out = text;
  for (const rule of MASK_RULES) out = out.replace(rule.regex, rule.placeholder);
  return out;
}

/** 차단 규칙에 걸린 규칙 이름 목록을 반환한다. (민감값 자체는 반환하지 않음) */
export function scanDenylist(text: string): string[] {
  const hits: string[] = [];
  for (const rule of BLOCK_RULES) if (rule.regex.test(text)) hits.push(rule.name);
  return hits;
}
