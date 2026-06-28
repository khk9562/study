# 설정 가이드 — Notion TIL · Velog 자동 동기화 (archive_studying)

Notion `🌱 TIL` DB의 `공개` 체크된 글을 매일 한 번 이 레포로 마크다운 변환·커밋한다.
회사명·프로젝트명 등 민감어는 **치환 사전**으로 대체하고, 그래도 위험 패턴(이메일/IP/토큰 등)이
남으면 그 글은 **발행을 차단**한다.

## 1. 한 번만 하면 되는 수동 설정

### 1-1. Notion Internal Integration 생성
1. https://www.notion.so/my-integrations → **New integration** (Internal)
2. 발급된 **Internal Integration Secret** 복사 → 아래 `NOTION_TOKEN`
3. `🌱 TIL` 데이터베이스 페이지 우상단 `•••` → **Connections** → 만든 integration 연결(공유)

### 1-2. `공개` 체크박스
이미 추가됨. 공개하고 싶은 글에만 체크하면 된다. (기본값: 비공개)

### 1-3. GitHub Secrets 등록
레포 **Settings → Secrets and variables → Actions → New repository secret**:

| 이름 | 값 |
|------|----|
| `NOTION_TOKEN` | 위에서 발급한 Integration Secret |
| `NOTION_DATABASE_ID` | `8216a0e8-6034-4f7c-8937-d958bcedf06e` |
| `REDACTION_MAP` | 치환 사전(JSON). 예: `{"bmtsys":"회사A","cruiser":"프로젝트X","사내도메인.com":"example.com"}` |
| `TELEGRAM_BOT_TOKEN` | (선택) Telegram 봇 토큰. 알림 받으려면 등록 |
| `TELEGRAM_CHAT_ID` | (선택) 알림 받을 챗 ID |

#### Telegram 챗 ID 찾는 법
1. 본인 봇과 1:1 대화를 열고 아무 메시지나 보낸다.
2. 브라우저에서 `https://api.telegram.org/bot<봇토큰>/getUpdates` 접속.
3. 응답 JSON의 `result[].message.chat.id` 숫자가 챗 ID (그룹이면 `-`로 시작).

> 두 값 모두 없으면 알림은 조용히 비활성화되고 동기화 자체는 정상 동작한다.

> `REDACTION_MAP`은 회사명/프로젝트명 → 대체어 매핑이다. **이 값 자체가 민감 정보이므로 레포에 절대 커밋하지 말 것** (그래서 Secret으로만 둔다).

### 1-4. Actions 쓰기 권한
**Settings → Actions → General → Workflow permissions → "Read and write permissions"** 선택.

## 2. 동작 방식
- 매일 한국시간 오후 8시(20:00) 자동 실행 (`.github/workflows/sync-til.yml`).
- 수동 실행: **Actions 탭 → Sync TIL from Notion → Run workflow**. 이때 **`테스트 실행`(dry_run) 기본 체크** → 파일/커밋 없이 발행·차단 결과만 확인(공개 레포 안전). 실제 반영하려면 체크 해제.
- **증분 동기화**: Notion `last_edited_time`이 바뀐 글만 덮어쓰고, 안 바뀐 글은 그대로 둔다(변경 없는 날은 커밋도 없음). `공개` 해제/삭제한 글은 레포에서도 제거된다.
- **전체 재빌드**: 치환사전(`REDACTION_MAP`)이나 denylist를 바꾼 뒤 **모든 글에 재적용**하려면, 수동 실행 시 `force_rebuild` 체크(또는 로컬 `npm run sync -- --force`).
- `README.md`는 태그별 인덱스로 자동 갱신된다.

### Telegram 알림 (3종)
- 🔄 **시작**: 동기화 시작 시.
- ✅ **완료**: 발행된 글 목록 + 발행 실패(보안 필터 차단) 글·사유.
- ❌ **실패**: 스크립트/워크플로우가 죽으면 사유 또는 로그 링크.

## 3. 로컬 테스트 (dry-run)
실제 파일을 쓰거나 커밋하지 않고 "무엇이 발행/차단될지"만 출력:

```bash
npm install
NOTION_TOKEN=secret_xxx \
NOTION_DATABASE_ID=8216a0e8-6034-4f7c-8937-d958bcedf06e \
REDACTION_MAP='{"bmtsys":"회사A"}' \
npm run sync:dry
```

확인할 것:
- `공개` 미체크 글이 목록에서 제외되는가
- 회사명/프로젝트명이 대체어로 치환되는가
- 사내 이메일/IP/토큰이 들어간 글이 `⛔ 차단` 되는가

## 3-1. 터미널에서 시크릿 관리 (GUI 타이핑 불필요)

### REDACTION_MAP — 로컬 JSON 파일로 관리
GitHub 웹 GUI에 JSON을 매번 붙여넣는 대신, 로컬 파일을 편집하고 한 줄로 업로드한다.

```bash
cp secrets/redaction.example.json secrets/redaction.json   # 최초 1회
# secrets/redaction.json 을 에디터로 편집 (회사명 → 대체어)
npm run secrets:redaction                                   # = gh secret set REDACTION_MAP < secrets/redaction.json
```

- `secrets/redaction.json` 은 `.gitignore` 로 **커밋되지 않는다**(예시 파일만 추적).
- JSON 유효성 검사 후 업로드하며, 값은 GitHub에 암호화 저장된다.
- 수정할 때도 파일만 고쳐 `npm run secrets:redaction` 다시 실행하면 덮어쓴다.

### 그 외 단순 문자열 시크릿
```bash
gh secret set NOTION_TOKEN          # 입력 프롬프트가 뜨면 값 붙여넣기
gh secret set NOTION_DATABASE_ID
gh secret set TELEGRAM_BOT_TOKEN
gh secret set TELEGRAM_CHAT_ID
gh secret list                      # 등록된 시크릿 목록 확인
```

## 3-2. 로컬에서 Telegram 연동 테스트
`.env` 에 `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` 를 넣은 뒤:

```bash
cp .env.example .env     # 최초 1회, 값 채우기
npm run telegram:test                  # 기본 메시지 전송
npm run telegram:test -- "원하는 내용"  # 임의 메시지 전송
```

성공하면 `✅ 전송 성공`, 실패하면 원인(토큰 오류/챗 ID 오류 등)을 출력한다.

## 4. 보안 레이어 요약
1. **게이트**: `공개` 체크된 글만 대상.
2. **치환**: `REDACTION_MAP`의 민감어를 대체어로 (제목·본문 전체).
3. **fail-safe**: `scripts/denylist.ts`의 일반 위험 패턴이 잔존하면 그 글 발행 차단 + 로그.
