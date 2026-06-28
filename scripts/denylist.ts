/**
 * 일반 위험 패턴 정규식 모음 (공개 레포 커밋 OK — 특정 회사명/프로젝트명은 포함하지 않음).
 * 치환 사전으로 대체한 뒤에도 이 중 하나라도 남아 있으면 해당 글은 "발행 차단" 한다.
 *
 * 회사 고유의 도메인/식별자는 여기 적지 말고 Secret(REDACTION_MAP)으로 치환할 것.
 */

export interface DenyRule {
  name: string;
  regex: RegExp;
}

export const DENY_RULES: DenyRule[] = [
  // 이메일 주소 (사내 메일 노출 방지)
  { name: "email", regex: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  // 사설 IP 대역
  { name: "private-ip", regex: /\b(?:10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/ },
  // AWS Access Key ID (AKIA 영구 키 / ASIA 임시 STS 키)
  { name: "aws-key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  // AWS Secret Access Key 패턴(긴 base64류) — aws_secret 키워드 동반 시
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
  { name: "secret-assignment", regex: /\b(password|passwd|secret|api[_-]?key|access[_-]?token|private[_-]?key)\b\s*[:=]\s*['"][^'"\n]{6,}['"]/i },
];

/** 본문에서 매치된 위험 규칙 이름 목록을 반환한다. (민감값 자체는 반환하지 않음) */
export function scanDenylist(text: string): string[] {
  const hits: string[] = [];
  for (const rule of DENY_RULES) {
    if (rule.regex.test(text)) hits.push(rule.name);
  }
  return hits;
}
