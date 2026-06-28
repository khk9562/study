#!/usr/bin/env bash
# REDACTION_MAP 시크릿을 로컬 JSON 파일에서 GitHub로 업로드한다 (GUI 타이핑 불필요).
#
#   ./scripts/push-secrets.sh                      # secrets/redaction.json 사용
#   ./scripts/push-secrets.sh path/to/other.json   # 다른 파일 지정
#
# 사전 준비: gh 로그인(gh auth status), secrets/redaction.json 작성.
set -euo pipefail

FILE="${1:-secrets/redaction.json}"

if [[ ! -f "$FILE" ]]; then
  echo "❌ 파일이 없습니다: $FILE"
  echo "   secrets/redaction.example.json 을 복사해 secrets/redaction.json 으로 만들어 편집하세요."
  exit 1
fi

# JSON 유효성 검사 (객체인지까지 확인)
node -e '
  const fs = require("fs");
  const o = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (typeof o !== "object" || Array.isArray(o) || o === null) throw new Error("JSON 객체가 아닙니다");
  console.error(`  키 ${Object.keys(o).length}개 확인`);
' "$FILE" || { echo "❌ JSON 형식 오류 — 업로드 중단"; exit 1; }

gh secret set REDACTION_MAP < "$FILE"
echo "✅ REDACTION_MAP 업데이트 완료 ($FILE)"
echo "   값은 GitHub에 암호화되어 저장되며 다시 읽을 수 없습니다."
