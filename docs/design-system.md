# 디자인 시스템 — 김현경 포트폴리오 (재사용/이식용 스펙)

> **목적**: 이 포트폴리오의 디자인 느낌을 **다른 프로젝트에서 그대로 재현**하고, 나중에 **여러 사이트를 하나로 합칠 때**의 기준이 되는 단일 문서.
> 이 문서만 보고도 다른 AI/개발자가 동일한 룩앤필을 구현할 수 있도록 실제 토큰·코드 패턴을 그대로 담았다.
> 출처 구현체: `app/globals.css`, `app/layout.tsx`, `components/**`.

---

## 0. 한눈에 보는 디자인 철학

- **콘텐츠 우선 · 미니멀**: 장식보다 여백·타이포·정렬로 위계를 만든다. 데이터(`lib/*.ts`)와 표현(컴포넌트)을 분리한다.
- **단색 기반 + 단 하나의 강조색(초록)**: 무채색(흰/검/회) 위에 초록 accent 하나만. 강조색은 라벨·링크·포인트(이름 뒤 마침표 `.`)·상태에만 절제해 쓴다.
- **모노스페이스 라벨**: 섹션 eyebrow·메타정보·기간·카테고리는 `font-mono` + 대문자 + 자간 확대로 "기술 문서" 톤을 준다.
- **라이트/다크 동등성**: 모든 색은 CSS 변수 토큰으로만 쓰고, 라이트·다크 두 세트를 1:1로 정의한다. 하드코딩 색 금지.
- **접근성·모션 절제**: 스크롤 진입 페이드 정도의 은은한 모션. `prefers-reduced-motion` 존중. 포커스/키보드 고려.
- **인쇄(PDF) 일급 지원**: 화면 = 1뷰, 같은 데이터를 PDF로도 출력. 인쇄 전용 유틸리티 클래스 체계를 갖춘다.

---

## 1. 기술 스택 (이식 시 동일하게 권장)

| 영역 | 선택 | 비고 |
| --- | --- | --- |
| 프레임워크 | **Next.js (App Router) + React 19 + TypeScript** | `app/` 디렉터리 |
| 스타일 | **Tailwind CSS v4** | **config 파일 없음** — CSS의 `@theme`로 토큰 정의 (`@tailwindcss/postcss`) |
| 테마 전환 | **next-themes** | `attribute="class"`, class 전략(`.dark`) |
| 애니메이션 | **framer-motion** | 스크롤 reveal, hero stagger |
| 아이콘 | **lucide-react** | 커스텀 아이콘은 `components/ui/icons.tsx` |
| 폰트(KR) | **Pretendard Variable** | CDN `@import` (아래) |
| 폰트(라틴/모노) | **Geist Sans / Geist Mono** | `next/font/google` |

`package.json` 핵심 의존성:
```
framer-motion · lucide-react · next · next-themes · react · react-dom
devDeps: tailwindcss@4 · @tailwindcss/postcss
```

> 다른 스택(Vite 등)으로 옮길 경우: Tailwind v4 + PostCSS만 맞추면 토큰/유틸리티는 그대로 동작한다. 테마 전환은 `next-themes` 대신 `.dark` 클래스를 토글하는 동등 로직이면 된다.

---

## 2. 색상 토큰 (Source of Truth)

색은 **반드시 아래 CSS 변수로만** 사용한다. `globals.css`에 그대로 복사:

```css
:root {
  --background: #ffffff;
  --surface: #ffffff;
  --surface-2: #f5f5f5;
  --foreground: #111111;
  --muted: #333333;
  --muted-2: #555555;
  --border: #cccccc;
  --accent: #15803d;          /* 초록 (라이트) */
  --accent-soft: #f0fdf4;     /* 초록 배경틴트 */
  --accent-foreground: #ffffff;
}

.dark {
  --background: #0a0a0b;
  --surface: #141417;
  --surface-2: #1c1c20;
  --foreground: #ededed;
  --muted: #a1a1aa;
  --muted-2: #71717a;
  --border: #27272a;
  --accent: #4ade80;          /* 초록 (다크, 더 밝게) */
  --accent-soft: #0c2818;
  --accent-foreground: #052e16;
}
```

### 토큰 의미(용도)
| 토큰 | 용도 |
| --- | --- |
| `background` | 페이지 바탕 |
| `surface` | 카드·헤더 등 표면 (라이트에선 흰색=배경과 동일, 다크에선 한 톤 위) |
| `surface-2` | 더 들어간 표면 / 태그·배지 바탕 |
| `foreground` | 본문 기본 텍스트·제목 |
| `muted` | 보조 본문 |
| `muted-2` | 더 약한 보조(메타·기간·캡션) |
| `border` | 모든 경계선 (구분선·카드 테두리) |
| `accent` | 강조색(초록) — 라벨·링크 hover·포인트·상태 |
| `accent-soft` | accent 배경 틴트(배지·아이콘 칩 바탕) |
| `accent-foreground` | accent 위 텍스트(주 버튼 글자) |

> **강조색을 바꾸려면** `--accent / --accent-soft / --accent-foreground` 세 값만 라이트·다크 각각 교체하면 전체 톤이 바뀐다. (예: 초록 → 파랑) 나머지는 손대지 않는다.

---

## 3. Tailwind v4 연결 (`@theme`)

`globals.css` 상단에 폰트 import + 토큰을 Tailwind 유틸리티로 노출:

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');
@import 'tailwindcss';

/* next-themes class 전략 → .dark 기준 dark 변형 */
@custom-variant dark (&:where(.dark, .dark *));

/* (위 :root / .dark 토큰 블록) */

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-2: var(--muted-2);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-accent-foreground: var(--accent-foreground);
  --font-sans: 'Pretendard Variable', Pretendard, var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

/* 모든 요소의 기본 border 색을 토큰으로 → border 유틸만 써도 일관 */
* { border-color: var(--border); }

html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
::selection { background: var(--accent); color: var(--accent-foreground); }
```

→ 이렇게 하면 `bg-background`, `text-foreground`, `text-muted`, `text-muted-2`, `border-border`, `bg-surface`, `bg-surface-2`, `text-accent`, `bg-accent-soft`, `text-accent-foreground` 유틸리티가 라이트/다크 자동 대응한다. 투명도도 가능: `border-accent/50`, `bg-accent/10`.

---

## 4. 타이포그래피

- **본문 폰트**: Pretendard(한글) → Geist Sans → system. `font-sans`(기본).
- **모노 폰트**: Geist Mono. `font-mono` — **라벨·메타 전용** (섹션 eyebrow, 카테고리, 기간, 회사명, 연락처 라벨).
- `app/layout.tsx`에서 Geist를 `next/font`로 로드하고 변수 연결:

```tsx
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// <html className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

### 텍스트 스케일 관례
| 용도 | 클래스 |
| --- | --- |
| Hero 이름(H1) | `text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15] tracking-tight` |
| 섹션 제목(H2) | `text-2xl md:text-3xl font-bold tracking-tight text-foreground` |
| 카드 제목(H3) | `text-lg font-bold tracking-tight` |
| 섹션 eyebrow | `font-mono text-xs uppercase tracking-[0.2em] text-accent` |
| 본문 | `text-base md:text-lg leading-relaxed text-muted` |
| 보조/캡션 | `text-sm text-muted` / 메타 `font-mono text-xs text-muted-2` |

**시그니처 모티프**: 이름·로고 끝에 강조색 마침표 — `김현경<span className="text-accent">.</span>`

---

## 5. 레이아웃 & 스페이싱

- **콘텐츠 폭**: 모든 섹션 `mx-auto max-w-5xl px-5` (= 최대 64rem, 좌우 패딩 1.25rem).
- **섹션 세로 리듬**: `py-20 md:py-28` (인쇄 시 `print:py-10`).
- **섹션 구분**: 일부 섹션은 `bg-surface/40` + `border-y border-border`(또는 `border-t`)로 줄무늬처럼 분리 (예: Skills, Contact). 나머지는 배경색 그대로.
- **페이지 골격**: `Header(sticky)` → `main.flex-1` → `Footer`. body는 `min-h-full flex flex-col`.
- **페이지 구성 순서**(참고): Hero → About(소개+경력 타임라인) → Education(학력 타임라인 + 자격증/활동) → Skills → Projects → Contact.
- **둥근 모서리 스케일**: 점/아바타 `rounded-full`, 배지/태그 `rounded-md`, 버튼/토글/아이콘칩 `rounded-lg`, 카드 `rounded-xl`.

---

## 6. 핵심 컴포넌트 패턴

### 6.1 SectionHeading (모든 섹션 머리)
```tsx
<div className="mb-10 md:mb-14">
  <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
  <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
  {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{description}</p>}
</div>
```

### 6.2 버튼 / 링크
- **주 버튼**: `inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90`
- **보조 버튼**: `inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent`
- 버튼 내 아이콘 `h-4 w-4` (lucide).

### 6.3 Badge (3 variant)
```tsx
// rounded-md px-2.5 py-1 text-xs font-medium
default: "bg-surface-2 text-muted border border-border"
accent:  "bg-accent-soft text-accent border border-accent/30"
outline: "bg-transparent text-muted border border-border"
```

### 6.4 카드 (Project/Contact 등)
```
rounded-xl border border-border bg-surface p-6
transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5
```
- 카드 내 작은 기술 태그: `rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-2`
- 카드 hover 시 우상단 화살표 아이콘이 `text-muted-2 → text-accent`로 변하는 패턴(`group`/`group-hover:`).

### 6.5 아이콘 칩 (연락처 등)
```
inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent
```

### 6.6 타임라인 (경력/학력) — ⚠️ 점 정렬 주의
세로선 + 점 패턴. **점이 선 중앙에 오도록** 오프셋을 계산해야 한다.
```tsx
<ol className="relative space-y-7 border-l border-border pl-6">
  <li className="relative">
    {/* 점: 세로선 중앙 정렬. ol이 border(1px)+pl-6(24px)이고 점이 10px일 때 -left-[1.84rem] */}
    <span className="absolute -left-[1.84rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" />
    <p className="font-mono text-xs text-muted-2">{기간}</p>
    <p className="mt-1 font-semibold text-foreground">{제목}</p>
    <p className="text-sm text-muted">{부제}</p>
  </li>
</ol>
```
> 점 중앙 정렬 공식: `left = -(pl + dot/2 - line/2)`. 여기선 `-(24 + 5 - 0.5) = -29.5px ≈ -1.84rem`. pl·점 크기를 바꾸면 재계산할 것.

### 6.7 헤더 (sticky, 스크롤 시 반투명 블러)
```
no-print sticky top-0 z-50 w-full border-b transition-colors
// 스크롤 전: border-transparent bg-transparent
// 스크롤 후(scrollY>8): border-border bg-background/80 backdrop-blur-md
```
높이 `h-16`, 내부 `max-w-5xl px-5`. 우측에 PDF 메뉴 + 테마 토글.

---

## 7. 테마(라이트/다크) 운영

```tsx
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
```
- `html`에 `suppressHydrationWarning`.
- **테마 토글**(`components/ui/ThemeToggle.tsx`): `useTheme()` + 마운트 가드(`mounted`)로 하이드레이션 불일치 방지. 마운트 전엔 빈 아이콘 슬롯. 아이콘: 다크일 때 `Sun`, 라이트일 때 `Moon`.
- 토글 버튼 스타일: `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:border-accent hover:text-accent`.

---

## 8. 모션 규칙 (framer-motion)

- **스크롤 진입 Reveal**(공용): 페이드 + 16px 슬라이드업.
```tsx
initial={{ opacity: 0, y: 16 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
// 래퍼에 className "print-flat" 부착 (인쇄 시 강제 노출)
```
- **Hero 스태거**: 항목 인덱스 `i`마다 `delay: i * 0.12`, `duration: 0.6`, 같은 ease.
- **ease 표준값**: `[0.25, 1, 0.5, 1]` (부드러운 감속). 프로젝트 전반에서 동일하게 사용.
- 리스트 그리드 진입은 `delay`를 인덱스로 살짝 흘려준다(`i * 0.05` 등).
- `@media (prefers-reduced-motion: reduce)`에서 장식 애니메이션 정지.

---

## 9. 시그니처 장식 효과 (선택)

### 9.1 Hero 배경 글로우 (라이트/다크 공통, 화면 전용)
```tsx
<div aria-hidden className="no-print pointer-events-none absolute inset-0 -z-10">
  <div className="absolute left-1/2 top-[-10%] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
</div>
```

### 9.2 다크모드 별 반짝임 Starfield (`components/ui/Starfield.tsx`)
- 박스섀도 점들로 별을 흩뿌리고 `star-twinkle`(opacity 0.2↔1) + `star-drift`(translateY) 키프레임으로 반짝/표류.
- **SSR/CSR 좌표 불일치 방지**: 결정적 PRNG(mulberry32, 고정 seed)로 좌표 생성. `useMemo`.
- `dark:block`(다크에서만), `no-print`, 마스크 그라데이션으로 한쪽만 진하게 페이드.
```css
@keyframes star-twinkle { 0%,100%{opacity:.2} 50%{opacity:1} }
@keyframes star-drift { from{transform:translateY(0)} to{transform:translateY(-40px)} }
@media (prefers-reduced-motion: reduce){ .star-layer{ animation:none !important } }
```

> 이 두 효과는 "느낌"의 핵심 시그니처다. 다른 프로젝트에서도 Hero에 동일하게 넣으면 브랜드 일관성이 산다. (성격에 안 맞으면 글로우만 써도 됨.)

---

## 10. 인쇄 / PDF 출력 시스템

화면과 같은 데이터를 PDF로도 뽑는다(이력서·경력기술서·포트폴리오). 별도 라우트 `app/print/[type]/page.tsx`에 `.force-light`를 적용해 테마와 무관하게 흰 문서 톤으로 고정.

유틸리티 클래스(‌`globals.css`의 `@media print` 참고):
| 클래스 | 의미 |
| --- | --- |
| `.no-print` | 인쇄 시 숨김 (헤더·토글·스크롤유도 등) |
| `.print-only` | 화면에선 숨고 인쇄 시에만 표시 |
| `.print-page-break` | 해당 지점에서 페이지 나눔(`break-before: page`) |
| `.print-avoid-break` | 내부 페이지 깨짐 방지(`break-inside: avoid`) |
| `.print-flat` | 그림자/transform 제거 + `opacity:1` 강제(모션으로 숨은 요소 노출) |
| `.force-light` | /print 라우트 컨테이너에 부여 → 라이트 토큰 강제 + `color-scheme: light` |

추가 인쇄 규칙: `@page { margin: 14mm 12mm }`, `print-color-adjust: exact`, 다크 PDF 여백 검정 방지 위해 `html{ color-scheme: light !important }`.

> 다른 사이트로 합칠 때 이 PDF 체계를 공유하면 "한 데이터 → 화면 + 여러 PDF 뷰" 전략을 그대로 재사용할 수 있다.

---

## 11. 파일/폴더 컨벤션

```
app/            라우트(App Router), globals.css, layout.tsx
  print/[type]/ 인쇄 전용 라우트 (resume·career·portfolio)
  projects/[slug]/ 프로젝트 상세 (generateStaticParams)
components/
  ui/         프리미티브 (Badge, Reveal, SectionHeading, ThemeToggle, Starfield, icons …)
  sections/   페이지 섹션 (Hero, About, Education, Skills, Projects, Contact)
  layout/     Header, Footer
  documents/  인쇄용 문서 컴포넌트 (ResumeDocument 등)
lib/          데이터 단일 출처 (profile.ts, projects.ts) — 표현과 분리
types/        타입 (Profile, Project, …)
public/projects/<slug>/  프로젝트 스크린샷 (자체 호스팅)
```
- **데이터-표현 분리 원칙**: 텍스트/목록은 전부 `lib/*.ts`에. 컴포넌트는 `map`으로 렌더만. → 콘텐츠 수정이 컴포넌트 수정과 분리된다.

---

## 12. 새 프로젝트에 이식하는 체크리스트

1. Next.js(App Router)+TS, Tailwind v4(`@tailwindcss/postcss`), next-themes, framer-motion, lucide-react 설치.
2. `globals.css`에 **§2 토큰 + §3 `@theme`/base** 그대로 복사 (폰트 `@import` 포함).
3. `app/layout.tsx`에 Geist 폰트 + `ThemeProvider`(class/light/no-system) 세팅.
4. 프리미티브 복사: `Badge`, `Reveal`, `SectionHeading`, `ThemeToggle`, (원하면) `Starfield`.
5. 섹션은 §5 레이아웃 규칙(`max-w-5xl px-5 py-20 md:py-28`)과 §6 패턴으로 구성.
6. 색 톤을 바꾸려면 `--accent` 3종만 교체. 나머지 토큰 유지.
7. 콘텐츠는 `lib/`에 데이터로 두고 컴포넌트는 렌더만.

---

## 13. 나중에 "한 사이트로 합치기" 가이드

- **토큰을 단일 소스로**: `globals.css`의 토큰 블록(§2)·`@theme`(§3)을 공유 패키지(예: `packages/ui` 또는 `@org/design-tokens`)로 추출해 모든 사이트가 같은 파일을 import 하게 한다. 색을 한 곳에서 바꾸면 전부 반영.
- **프리미티브 공유**: `Badge/Reveal/SectionHeading/ThemeToggle/Starfield`를 공유 컴포넌트 라이브러리로. 사이트별 차이는 `props`/variant로.
- **섹션 셸 통일**: `max-w-5xl px-5 py-20 md:py-28` + `SectionHeading`을 레이아웃 프리미티브(`<Section eyebrow title>`)로 묶으면 사이트 간 리듬이 자동 일치.
- **라우트 네임스페이스**: 합칠 때 각 프로젝트를 `/<project>`로 두고, 공통 Header/Footer·테마 토글·PDF 시스템을 루트 레이아웃에서 한 번만 제공.
- **모션·인쇄 규칙 공유**: §8 ease 표준값과 §10 인쇄 유틸리티를 공통 CSS로 둬서 일관 유지.
- **주의**: 합칠 때 `id` 기반 앵커(`#about` 등)와 `scroll-padding-top`(헤더 높이 5rem)이 충돌하지 않게 섹션 id를 네임스페이스화.

---

## 14. 빠른 요약 (TL;DR 토큰표)

| 항목 | 값 |
| --- | --- |
| 강조색 | 초록 `#15803d`(light) / `#4ade80`(dark) |
| 폰트 | Pretendard(본문) + Geist Mono(라벨) |
| 콘텐츠 폭 | `max-w-5xl` + `px-5` |
| 섹션 패딩 | `py-20 md:py-28` |
| 라운드 | dot `full` · badge `md` · button `lg` · card `xl` |
| 모션 ease | `[0.25, 1, 0.5, 1]`, reveal `dur .5 / y16`, hero stagger `.12` |
| 테마 | next-themes class 전략, light 기본, system off |
| 라벨 톤 | `font-mono text-xs uppercase tracking-[0.2em] text-accent` |
| 시그니처 | 이름 뒤 `text-accent` 마침표, 다크 Starfield, Hero accent glow |
</content>
