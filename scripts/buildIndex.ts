/** README 인덱스 생성: 태그별 그룹, 각 그룹은 날짜 내림차순. */

export interface IndexEntry {
  title: string;
  tags: string[];
  date: string;
  /** 레포 루트 기준 상대 경로 (예: til/React/foo.md) */
  path: string;
}

const HEADER = `# 🌱 TIL

> 이 레포는 [Notion TIL](https://www.notion.so)에서 **자동 생성**됩니다. 직접 수정하지 마세요 — 매일 동기화 시 덮어쓰여집니다.
> 작성은 Notion에서, \`공개\` 체크박스를 켠 글만 여기로 흡수됩니다. (회사/보안 정보는 레드액션으로 필터링)

`;

const OVERVIEW = `
## 📖 이 레포는?

Notion의 \`🌱 TIL\` 데이터베이스를 **GitHub로 단방향 자동 동기화**하는 미러입니다. 작성은 Notion에서 하고, 공개해도 되는 글만 골라 마크다운으로 흡수합니다.

### 동작 방식
- **매일 한국시간 오후 8시(20:00)** GitHub Actions가 Notion을 읽어 마크다운으로 변환 후 커밋합니다. (수동 실행도 가능)
- Notion에서 \`공개\` 체크박스를 켠 글만 대상이 됩니다.
- **증분 동기화** — Notion에서 마지막으로 편집한 글만 덮어쓰고, 안 바뀐 글은 그대로 둡니다. 변경이 없는 날은 커밋도 생기지 않습니다.
- 공개를 끄거나 삭제한 글은 레포에서도 제거됩니다. (치환사전/denylist를 바꾼 뒤 전 글에 재적용하려면 *force* 재빌드 사용)
- 각 글에는 학습 날짜(또는 기간)가 표기되고, Notion의 **\`폴더\` 속성값**으로 폴더가 정해집니다(없으면 첫 태그 → 기타). 새 분류가 필요하면 Notion에서 \`폴더\` 옵션을 새로 만들면 그게 곧 새 폴더입니다. 아래 인덱스도 **폴더별**로 자동 갱신됩니다.

### 보안 필터 (공개 레포 안전장치)
- **치환 사전** — 회사명·프로젝트명·벤더명 등 민감어를 대체어로 치환. 매핑은 \`REDACTION_MAP\` GitHub Secret에만 두고 레포엔 커밋하지 않습니다.
- **자동 마스킹** — 이메일은 \`<email>\`, IP 주소는 \`<ip주소>\` 로 가린 뒤 발행합니다.
- **위험 차단** — AWS 키(AKIA/ASIA)·presigned URL·각종 토큰/JWT·시크릿 할당이 남아 있으면 **그 글은 발행 차단 + 로그**.
- **이미지 자동 제외** — 노션 업로드 이미지는 스크린샷 유출·presigned URL(임시 AWS 토큰) 위험이 있어 본문에서 제거합니다.

### 알림
- Telegram으로 **🔄 시작 / ✅ 완료(발행·차단 목록 포함) / ❌ 실패** 알림을 보냅니다. (봇 시크릿 미설정 시 자동 비활성화)

`;

const FOOTER = `
---

## 🛠️ 로컬에서 실행하기

> 최초 설정(시크릿 등록·Notion 연결 등) 자세한 내용은 [SETUP.md](./SETUP.md) 참고.

\`\`\`bash
npm install                 # 의존성 설치 (최초 1회)
cp .env.example .env        # 로컬 환경변수 준비 (최초 1회) → .env 에 토큰/치환사전 채우기

npm run sync:dry            # 테스트 동기화: 무엇이 발행/차단될지만 출력 (파일·커밋 없음)

npm run telegram:test               # 텔레그램 봇 연동 테스트
npm run telegram:test -- "메시지"    # 임의 메시지 전송

# 치환 사전(REDACTION_MAP)을 터미널에서 GitHub 시크릿으로 업로드 (GUI 타이핑 불필요)
cp secrets/redaction.example.json secrets/redaction.json   # 최초 1회, 편집
npm run secrets:redaction
\`\`\`

- **수동 동기화**: GitHub Actions 탭 → *Sync TIL from Notion* → *Run workflow* (기본은 커밋 없는 테스트 실행, 실제 반영하려면 체크 해제).
- **자동 동기화**: 매일 한국시간 오후 8시(20:00).
`;

export function buildReadme(entries: IndexEntry[]): string {
  if (entries.length === 0) {
    return HEADER + OVERVIEW + "\n_아직 공개된 글이 없습니다._\n" + FOOTER;
  }

  // 폴더별 그룹화 (파일 경로 til/<폴더>/... 의 폴더 = 실제 디렉터리와 일치, 글은 한 폴더에만)
  const byFolder = new Map<string, IndexEntry[]>();
  for (const e of entries) {
    const parts = e.path.split("/");
    const folder = parts.length >= 3 ? parts[1] : "기타";
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder)!.push(e);
  }

  // 글 많은 폴더 먼저, 동수면 가나다순
  const folders = [...byFolder.keys()].sort(
    (a, b) => byFolder.get(b)!.length - byFolder.get(a)!.length || a.localeCompare(b, "ko")
  );

  let out = HEADER + OVERVIEW;
  out += `총 **${entries.length}**개의 글 · **${folders.length}**개 폴더\n\n`;

  for (const folder of folders) {
    const list = byFolder
      .get(folder)!
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
    out += `## ${folder} (${list.length})\n\n`;
    for (const e of list) {
      const link = encodeURI(e.path);
      const tags = e.tags.length ? ` _(${e.tags.join(", ")})_` : "";
      out += `- ${e.date} · [${e.title}](${link})${tags}\n`;
    }
    out += "\n";
  }

  return out + FOOTER;
}
