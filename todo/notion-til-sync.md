# 플랜: Notion TIL → study 레포 자동 동기화 파이프라인

> 참고: 실행 단계에서 본 문서를 프로젝트 루트 `todo/notion-til-sync.md`에도 복사합니다(개인 전역 지침: 플랜은 `todo/`에 보관). 현재는 플랜 모드 제약으로 지정 플랜 파일에만 작성.

## Context (왜 하는가)

- 현재 `study` 레포는 초기 학습노트(`.txt`)와 기초 실습(FastAPI 로그인 등)이 섞인 상태로, 4년차 프론트엔드 실력 대비 신호가 약하고 노션 TIL DB와 내용이 중복된다.
- 실제 학습 기록은 노션 `🌱 TIL` DB(`collection://1bde8d44-e66f-48d4-8217-4e2a1be15514`)에 더 체계적으로 쌓이고 있다.
- 목표: 레포를 **TIL 전용**으로 새출발시키고, **노션에 글을 쓰면 하루 1회 자동으로 레포에 마크다운으로 흡수**되게 한다. 단 **회사/보안/개발 외 내용은 게이트 + 레드액션으로 차단**한다.
- 결과물: 노션은 작성 공간(source of truth), 레포는 공개용 읽기 전용 미러. 단방향 동기화.

## 확정된 결정 사항 (인터뷰 결과)

| 항목 | 결정 |
|------|------|
| 실행 주체/주기 | **GitHub Actions, 하루 1회** (cron) + 수동 실행(workflow_dispatch) |
| 1차 게이트 | 노션 TIL DB에 **`공개` 체크박스** 추가(완료) → 체크된 것만 동기화 |
| 레드액션 | 회사 태그가 없으므로 **공개된 모든 글에 항상** 치환 사전 적용 (회사 태그 개념 폐기) |
| fail-safe | 치환 후에도 위험 패턴(사내 도메인·IP·토큰·키)이 남으면 **그 글 발행 차단 + 로그** |
| 레포 초기화 | **`archive/2026` 태그 + 아카이브 브랜치**로 보존 후, `main`을 TIL 전용으로 재구성 |
| 구현 언어 | **Node.js + TypeScript** (`@notionhq/client` + `notion-to-md`) |
| 파일 구조 | **태그별 폴더** + 루트 **README 자동 인덱스** |

## 보안 설계 (핵심)

- **치환 사전은 공개 레포에 커밋하지 않는다.** `bmtsys→회사A` 같은 맵 자체가 민감 정보이므로 **GitHub Secret `REDACTION_MAP`(JSON)** 로 주입.
- denylist 정규식(이메일 도메인 `@...`, 사설 IP, `sk-`/JWT/AWS 키 패턴 등 **일반 패턴**)은 레포에 커밋 가능.
- 적용 순서: (1) 공개된 모든 글에 치환 사전 적용 → (2) denylist 스캔, 잔존 매치 시 **발행 차단**. (회사 태그 구분 없음)
- `til/` 디렉터리는 매 실행마다 **전체 재생성**(clean rebuild) → 노션에서 `공개` 해제/삭제한 글이 레포에서도 사라짐.

## 최종 레포 구조 (TIL 전용)

```
/
├─ .github/workflows/sync-til.yml     # 매일 cron + 수동 dispatch
├─ scripts/
│  ├─ sync.ts        # 엔트리: fetch → filter → redact → write → index → commit
│  ├─ notion.ts      # Notion 클라이언트, 공개 페이지 쿼리
│  ├─ convert.ts     # notion-to-md 변환 + frontmatter 생성
│  ├─ redact.ts      # 치환 사전 + denylist fail-safe
│  └─ buildIndex.ts  # README 인덱스 생성
├─ til/
│  ├─ React/<slug>.md
│  ├─ Typescript/<slug>.md
│  └─ ...            # 태그별 폴더
├─ denylist.ts       # 일반 위험 패턴 정규식(커밋 OK)
├─ package.json
├─ tsconfig.json
├─ .gitignore
└─ README.md         # 자동 생성 인덱스
```

각 `.md` frontmatter 예:
```yaml
---
title: useSyncExternalStore — 외부 store 구독 훅
tags: [React]
date: 2026-06-23
notion_id: 388922cf-26a8-817b-bd00-cb078b44e5b1
synced_at: 2026-06-28
---
```

## 동기화 흐름 (scripts/sync.ts)

1. Notion DB 쿼리: `공개 = checked` (옵션: `상태 = 완료`)인 페이지 목록.
2. 각 페이지 블록 → 마크다운 변환(`notion-to-md`).
3. 레드액션: 치환 사전 적용(전 글) → denylist 스캔.
   - 잔존 위험 매치 → **건너뜀**, `blocked[]`에 사유 기록(제목/매치 종류만, 민감값 미출력).
5. 통과한 글을 `til/<주태그>/<slug>.md`로 기록(frontmatter 포함).
6. `til/` 선삭제 후 재생성으로 멱등성 확보.
7. `buildIndex.ts`로 README 인덱스(태그별 그룹, 날짜 정렬) 생성.
8. diff 있으면 `git add/commit/push` (`chore: sync TIL (YYYY-MM-DD)`), `blocked` 요약을 Actions 로그/Job Summary에 출력.

## 구현 단계

1. **아카이브 보존**: `git tag archive/2026 && git branch archive/2026-study` 후 원격 push. (실행 시 사용자 확인)
2. **레포 초기화**: `main`에서 기존 학습 파일 제거, 위 구조의 스캐폴드 생성. (히스토리는 유지 — study엔 민감정보 없음, 과거는 태그/브랜치로 접근)
3. **스크립트 작성**: `notion.ts → convert.ts → redact.ts → buildIndex.ts → sync.ts`. `--dry-run` 플래그(커밋·쓰기 없이 "쓸 것/차단할 것"만 출력) 지원.
4. **denylist.ts**: 이메일 도메인, 사설 IP(10./172.16./192.168.), `AKIA`, `sk-`, JWT, 일반 secret 키워드 정규식.
5. **워크플로우**: `sync-til.yml` — `schedule: cron`(매일) + `workflow_dispatch`, Node 셋업, `npm ci`, `npm run sync`, secrets 주입, `contents: write` 권한.
6. **문서**: README 상단에 "이 레포는 노션 TIL에서 자동 생성됨" 안내.

## 사용자가 직접 해야 하는 수동 작업 (코드 아님)

1. 노션 **Internal Integration** 생성 → `NOTION_TOKEN` 발급.
2. `🌱 TIL` DB를 그 integration에 **연결(공유)**.
3. TIL DB에 **`공개` 체크박스** 속성 추가.
4. GitHub 레포 Secrets 등록:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID` = `1bde8d44-e66f-48d4-8217-4e2a1be15514`
   - `REDACTION_MAP` = `{"bmtsys":"회사A","cruiser":"프로젝트X", ...}` (JSON)
5. Actions 쓰기 권한 확인(Settings → Actions → Workflow permissions: Read and write).

## 검증 (Verification)

- **로컬 dry-run**: `NOTION_TOKEN=... NOTION_DATABASE_ID=... REDACTION_MAP=... npm run sync -- --dry-run`
  - `공개` 미체크 글이 목록에서 **제외**되는지.
  - 회사 태그 글에서 회사명/프로젝트명이 **치환**되는지.
  - 일부러 사내 도메인/IP를 넣은 테스트 글이 **발행 차단 + 로그**되는지.
- **실제 1회 실행**: `--dry-run` 없이 실행 → `til/` 생성, README 인덱스 정상, 민감어 미포함 확인 후 push.
- **워크플로우 수동 트리거**: GitHub Actions에서 `workflow_dispatch`로 1회 실행 성공 확인.
- **회귀**: 노션에서 한 글 `공개` 해제 → 다음 실행 후 레포에서 사라지는지(멱등성).

## 미해결/실행 시 결정할 소소한 기본값

- 이미지: 노션 이미지 URL은 만료되므로 `til/<태그>/assets/`로 **다운로드 후 링크 치환**(기본값). 부담되면 v1은 이미지 스킵 가능.
- 슬러그: 제목 기반 kebab-case, 충돌 시 `notion_id` suffix.
