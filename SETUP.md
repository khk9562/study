# 설정 가이드 — Notion TIL 자동 동기화

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

> `REDACTION_MAP`은 회사명/프로젝트명 → 대체어 매핑이다. **이 값 자체가 민감 정보이므로 레포에 절대 커밋하지 말 것** (그래서 Secret으로만 둔다).

### 1-4. Actions 쓰기 권한
**Settings → Actions → General → Workflow permissions → "Read and write permissions"** 선택.

## 2. 동작 방식
- 매일 한국시간 06:00 자동 실행 (`.github/workflows/sync-til.yml`).
- 수동 실행: **Actions 탭 → Sync TIL from Notion → Run workflow**.
- `til/` 는 매 실행마다 전체 재생성 → Notion에서 `공개` 해제/삭제한 글은 레포에서도 사라진다.
- `README.md`는 태그별 인덱스로 자동 갱신된다.

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

## 4. 보안 레이어 요약
1. **게이트**: `공개` 체크된 글만 대상.
2. **치환**: `REDACTION_MAP`의 민감어를 대체어로 (제목·본문 전체).
3. **fail-safe**: `scripts/denylist.ts`의 일반 위험 패턴이 잔존하면 그 글 발행 차단 + 로그.
