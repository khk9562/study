# 🌱 TIL

> 이 레포는 [Notion TIL](https://www.notion.so)에서 **자동 생성**됩니다. 직접 수정하지 마세요 — 매일 동기화 시 덮어쓰여집니다.
> 작성은 Notion에서, `공개` 체크박스를 켠 글만 여기로 흡수됩니다. (회사/보안 정보는 레드액션으로 필터링)


_아직 공개된 글이 없습니다._

---

## 🛠️ 로컬에서 실행하기

> 최초 설정(시크릿 등록·Notion 연결 등) 자세한 내용은 [SETUP.md](./SETUP.md) 참고.

```bash
npm install                 # 의존성 설치 (최초 1회)
cp .env.example .env        # 로컬 환경변수 준비 (최초 1회) → .env 에 토큰/치환사전 채우기

npm run sync:dry            # 테스트 동기화: 무엇이 발행/차단될지만 출력 (파일·커밋 없음)

npm run telegram:test               # 텔레그램 봇 연동 테스트
npm run telegram:test -- "메시지"    # 임의 메시지 전송

# 치환 사전(REDACTION_MAP)을 터미널에서 GitHub 시크릿으로 업로드 (GUI 타이핑 불필요)
cp secrets/redaction.example.json secrets/redaction.json   # 최초 1회, 편집
npm run secrets:redaction
```

- **수동 동기화**: GitHub Actions 탭 → *Sync TIL from Notion* → *Run workflow* (기본은 커밋 없는 테스트 실행, 실제 반영하려면 체크 해제).
- **자동 동기화**: 매일 한국시간 06:00.
