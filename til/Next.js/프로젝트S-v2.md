---
title: "프로젝트S v2"
tags: ["Next.js", "React", "Typescript", "SCSS", "d3.js", "TanstackQuery", "architecture"]
date: 2026-03-03
notion_id: 379922cf-26a8-817c-8739-d1fb2c133ab6
notion_last_edited: 2026-06-28T08:29:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2026-03-03

> 🛰️ **프로젝트S v2** — Server·Network·Storage 통합 인프라 모니터링 시스템의 Next.js(App Router) 프론트엔드. 대용량 테이블·실시간 차트·d3 토폴로지·멀티 테마가 얽힌 운영 대시보드에서 발생한 **버그·렌더링 병목·타이밍 이슈를 근본 원인까지 추적해 해결**한 기록.

## 📌 한 줄 요약


약 4.5개월간 인프라 모니터링 대시보드의 프론트엔드를 단독에 가깝게 담당하며 **765건의 버그 수정·트러블슈팅**을 수행했다. FOUC·View Transition 깜빡임, AG Grid 대용량 테이블, d3 토폴로지 수백 노드 레이아웃, 차트 리렌더링 병목 등 **재현 난도 높은 이슈를 증상→근본원인→구조적 해결**로 다뤘다.


---


## 🏆 대표 성과 (3줄 요약)

1. **구버전 브라우저 납품 요건 충족** — 폐쇄망/금융권의 **Chrome 102** 고정 환경에서 깨지던 AG Grid·그라데이션·SVG 필터를 트랜스파일·벤더 프리픽스·필터 재구성으로 정상화하고 Playwright 멀티버전 회귀 테스트까지 구축(6개 커밋).
2. **운영 버그 대량 진단·수정** — 4.5개월간 **765건의 FIX**를 수행하며 FOUC/View Transition 잔상, ResizeObserver 무한루프, 차트 툴팁 좌표 등 **브라우저·React 렌더 타이밍 이슈를 구조적으로** 해결.
3. **PC/터치 겸용 + 재발 차단 공통화** — 터치 DnD 라이브러리 교체와 브레이크포인트 중앙화로 데스크톱~태블릿 겸용 UI 완성, 툴팁·게이지(**25개 사용처**) 공통화로 같은 류 버그 재발을 구조적으로 차단.

## 📊 정량 지표


| 지표            | 값                                               |
| ------------- | ----------------------------------------------- |
| 기여 커밋 / 기간    | 1,297개 (FIX 765 · 59%) / 약 4.5개월                |
| 구버전 대응        | Chrome 102 대응 6개 커밋 · 멀티 테마 3종(Blue·Dark·White) |
| 게이지 공통화       | 25개 사용처를 단일 `Gauge` 컴포넌트로 통합                    |
| 허니콤 차트 필터     | 복잡한 SVG 필터 체인 52줄 제거 → 28줄로 재구성                 |
| AG Grid 트랜스파일 | 2개 패키지 ES2022+ → ES5                            |
| 토폴로지 동적 레이아웃  | 10~150+ 노드 규모 자동 대응                             |

> 💡 "FIX 59%"는 코드 불안정이 아니라 **운영 중인 대형 대시보드의 실사용 이슈를 빠르게 진단·수정한 비중**이다. 렌더 횟수 등 런타임 수치는 미측정이라 제외하고, git·코드로 검증된 카운트만 기재.

---


## 🗂️ 프로젝트 개요


| 항목      | 내용                                                                           |
| ------- | ---------------------------------------------------------------------------- |
| 프로젝트    | 프로젝트S v2 (Server·Network·Storage 통합 모니터링)                              |
| 역할      | 프론트엔드 개발                                                                     |
| 기간      | 2025.10 ~ 2026.03 (약 4.5개월)                                                  |
| 기여 규모   | 커밋 **1,297개** · 그 중 **FIX 765 / FEAT 186 / REFACTOR 57**                     |
| 핵심 기술   | Next.js 14 App Router · React · TypeScript · Zustand · TanStack Query · SCSS |
| 데이터/시각화 | d3.js(토폴로지 2D·Isometric) · 커스텀 차트 · AG Grid(대용량 테이블)                         |
| 특징      | 멀티 테마(Blue·Dark·White) · 실시간 폴링 · 대규모 노드/행 렌더링                               |

> 💡 커밋의 **59%가 FIX** 였던 만큼, 이 프로젝트의 핵심 역량은 **운영 환경에서 터지는 문제를 빠르고 정확하게 진단·수정**하는 데 있었다. 아래는 그 중 재현 난도와 임팩트가 컸던 대표 트러블슈팅을 STAR로 정리한 것이다.

---


## 🎨 A. 테마 시스템 & FOUC


### A-1. 테마 토글 시 직전 테마가 번쩍이는 깜빡임 (View Transition)

- **Situation** — Blue→Dark→White 테마 전환 시, 라디얼 마스크 애니메이션이 끝난 직후 **이전 테마가 순간적으로 다시 노출**되는 플래시 발생.
- **Task** — View Transitions API로 만든 전환 애니메이션의 잔상을 제거한다.
- **Action** — 원인은 애니메이션 종료 후 CSS 변수 `--click-radius` 가 초기값으로 리셋되면서 `::view-transition-new(root)` 마스크가 축소 → 그 아래 `::view-transition-old(root)`(이전 테마)가 드러나는 것. `documentElement.animate()` 옵션에 **`fill: 'forwards'`** 를 추가해 종료 후에도 마스크가 완전히 열린 상태를 유지하도록 고정. `flushSync` 로 상태 반영 시점도 동기화.
- **Result** — 전환 잔상 완전 제거. (`ThemeToggle.tsx`, `globals.scss` / commit `749efae8`)

```typescript
transition.ready.then(() => {
  documentElement.animate(
    { '--click-radius': ['0', `${endRadius + 500}px`] },
    { duration: 1000, easing: 'cubic-bezier(0.25,1,0.5,1)',
      fill: 'forwards', // ← 종료 후 마스크 유지 = 잔상 제거
      pseudoElement: '::view-transition-new(root)' },
  );
});
```


### A-2. 새로고침 시 기본 테마로 번쩍였다가 바뀌는 FOUC

- **Situation** — 사용자가 저장한 테마(예: Dark)로 새로고침하면 **초기 로딩 순간 기본 테마(Blue)로 표시 후** 올바른 테마로 전환되는 FOUC.
- **Task** — SSR 첫 HTML부터 올바른 테마가 적용되게 한다.
- **Action** — SSR 단계(`layout.tsx`)에서 **요청 쿠키를 파싱해** **`<html data-theme={theme}>`** **에 즉시 반영** → CSS 변수가 첫 렌더부터 적용. 클라이언트는 `initTheme()`(상태+DOM만, 쿠키 중복 저장 X)과 `setTheme()`(사용자 액션, 쿠키까지 저장)을 **역할 분리**해 하이드레이션 시점 중복 쓰기를 차단.
- **Result** — 새로고침 깜빡임 제거 + 쿠키 중복 저장 방지. (`layout.tsx`, `useThemeStore.ts`, `Providers.tsx`)

### A-3. 색상 토큰 2계층화 + 접근성 대비 확보

- **Situation** — 원시 색상 토큰과 테마별 시맨틱 변수가 뒤섞여 일관성이 없고, 다크 모드에서 대비가 부족한 색상이 산재.
- **Action** — **Level 1 원시 토큰 최소화 + Level 2 테마별 시맨틱 변수**(`--text-primary`, `--bg-secondary` 등) 체계로 정리. 미사용 토큰 대량 삭제, 다크 모드 텍스트/배경 대비를 **WCAG AA(4.5:1) 기준**으로 재조정.
- **Result** — 3개 테마(Blue·Dark·White)에서 일관된 색상 + 접근성 확보. (`themes/*.scss` / commits `2b51d9e5`, `491aa77d`)

---


## 📊 B. AG Grid 대용량 테이블


### B-1. 컬럼 순서·정렬·필터 상태가 페이지 이동하면 초기화

- **Situation** — 사용자가 테이블 컬럼을 재정렬/정렬/필터링한 뒤 다른 페이지·탭으로 이동했다 돌아오면 **상태가 모두 초기화**됨.
- **Task** — 페이지/탭 단위로 컬럼 상태를 보존·복구한다.
- **Action** — 원인은 `ColumnState` 가 컴포넌트 로컬 state에만 있어 언마운트 시 소실되는 것. **GridApi 레지스트리 + Zustand 전역 스토어**를 두고, ① 탭 전환 직전 ② 메뉴 이동 직전 두 시점에 `saveColumnStateFromApi()` 로 `api.getColumnState()` 를 영속화. 복구는 마운트 시 저장된 state 주입, 초기화는 ref 메서드 `resetColumnState()` 제공.
- **Result** — 페이지/탭을 오가도 컬럼 레이아웃 유지. (`usePageTabStore.ts`, `AgGridTable.tsx` / commits `f0f10098`, `6c049998`)

### B-2. 셀 편집(input/textarea) 중 화살표 키로 테이블이 가로 스크롤

- **Situation** — 셀 편집 모드에서 ArrowLeft/Right 입력 시 의도치 않게 그리드가 좌우 스크롤됨.
- **Action** — 가로 스크롤 키 핸들러가 입력 요소 포커스를 구분하지 못한 것이 원인. `onKeyDown` 진입 시 `target.tagName === 'INPUT'|'TEXTAREA' || isContentEditable` 이면 **조기 반환**해 스크롤 로직 차단.
- **Result** — 편집 중 커서 이동과 그리드 스크롤 충돌 제거. (`useAgGridScroll.ts` / commit `670d4b9a`)

### B-3. 트리 테이블 상세 행 높이 고정으로 내용 잘림

- **Situation** — TreeTable 마스터 행 확장 시 상세 콘텐츠가 고정 높이라 내용이 잘리거나 빈 공간 발생.
- **Action** — **ResizeObserver** 로 내부 콘텐츠 높이를 감지해 `node.setRowHeight()` + `api.onRowHeightChanged()` 로 재계산. 변화량 1px 초과일 때만 갱신해 **무한 루프 방지**.
- **Result** — 상세 콘텐츠에 맞춘 동적 높이. (`AgGridTreeTable.tsx` / commit `e2371a99`)

---


## 🌐 C. d3 토폴로지 시각화 (2D + Isometric)


### C-1. 노드 호버 시 연결 링크 하이라이팅이 동작하지 않음

- **Situation** — 노드에 호버해도 연결된 링크가 제대로 강조되지 않고 시각적 우선순위가 뭉개짐.
- **Action** — 호버 노드 id와 각 링크의 source/target을 비교해 연결 여부 판정 → 연결 링크는 `#45D4FF`·굵기 3·opacity 1, 비연결은 흐리게(0.3), 에러 링크는 `#ff4d4f` 로 분기. **`parentNode.appendChild(this)`** **로 렌더 레이어 순서를 끌어올려** 강조 링크가 위에 오도록 처리. 호버 시 데이터 플로우 애니메이션(`g[class^=flow-group]`)은 opacity 0.2로 dim, 해제 시 복구.
- **Result** — 호버 노드 중심의 명확한 연결 시각화. (`D3Tree.tsx`, `D3TreeDataFlowAnimation.ts` / commits `6c32aa3b`, `c0da596b`)

### C-2. 수백 개 노드에서 깨지는 레이아웃 — 동적 레이아웃 계산

- **Situation** — 노드 수(10~150+)와 무관하게 간격이 고정돼, 노드가 적으면 흩어지고 많으면 겹침. API의 `displayOrder` 도 무시됨.
- **Action** — `getAdaptiveLayoutConfig(nodeCount, screenWidth)` 로 **노드 수·화면 폭에 따라 cols/xGap/yGap/타일 크기를 동적 산출**(≤10개 가로 배치, 30+개는 150 기준 선형 스케일). 정렬은 `displayOrder` 최우선, fallback으로 serverType 그룹핑. 스위치 그룹은 nwSwitch/sanSwitch로 분리해 X 좌표 독립 제어.
- **Result** — 노드 규모와 무관하게 안정적 배치 + 의도한 순서 반영. (`D3IsometricTree.tsx` / commit `94c32dcc`)

### C-3. 2D·Isometric 뷰 공통화 + 장치 팝업 relation 캐싱

- **Action** — 두 뷰의 노드-링크 매핑/툴팁/타입을 공통 유틸·타입으로 추출(`d3Types.ts`, `tooltipUtils.ts`)해 Isometric 변환만 차이나게 구조화. 장치 상세 팝업에서 topology relation API를 React Query(`useServerRelation` 등)로 호출해 **queryKey 기반 캐싱**.
- **Result** — 중복 제거 + 팝업 재오픈 시 네트워크 절감. (commit `736fb34f`)

---


## ⚡ D. 렌더링 성능 최적화


### D-1. 정적 리포트인데 백그라운드 API 폴링이 계속 도는 문제

- **Situation** — 통계 리포트의 리소스 트렌드 그래프가 지정 기간만 보면 되는데도 실시간 폴링이 계속 돌아 불필요한 API 호출 발생.
- **Action** — `useChartTimeSettings` 에 `enableRealTimeUpdate?: boolean` 를 추가하고, 리포트의 메모리/디스크 트렌드 그래프에 **`enableRealTimeUpdate={false}`** 명시 → 초기 로드만 수행.
- **Result** — 리포트 페이지 백그라운드 폴링 제거. (`MultiServerReport.tsx`, `ServerMemoryTransition.tsx`)

### D-2. 업무 그룹 변경 시 서버 목록 쿼리가 중복 실행

- **Action** — `groupId ?? ''` 가 매 렌더 새 값처럼 보여 쿼리가 재실행되던 것을, **stable한** **`gid`** **로 분리해 모든 쿼리에 동일 참조 전달** + 짧은 `staleTime(30s)` 제거(기본값으로). useCallback 의존성 정리.
- **Result** — 불필요한 재요청/리렌더 제거. (`MultiServerReport.tsx`)

### D-3. Select / DatePicker / Sidebar 리렌더 병목

- **Action** — Select·DatePicker를 `React.memo` + `useCallback` 으로 메모이제이션, DatePicker의 maxDate `new Date()` 매번 생성을 `useMemo` 로 고정. 키보드 옵션 선택 시 `scrollIntoView({block:'nearest'})` 로 가시성 보강. StatisticsSidebar의 interval 필터링 로직을 `useEffect` → **`useMemo`** **로 이동**해 cascading 상태 업데이트 제거.
- **Result** — 기간/주기 변경 시 렌더 횟수 감소 + 키보드 UX 개선. (`CustomSelect.tsx`, `CustomDatePicker.tsx`, `StatisticsSidebar.tsx`)

### D-4. reduce 다중 순회 → 단일 reduce

- **Action** — 계산값 항목별로 배열을 여러 번 `reduce` 하던 것을 단일 패스로 통합.
- **Result** — 집계 연산 순회 횟수 절감. (commit `REFACTOR: 계산값 항목별 reduce 에서 단일 reduce로`)

---


## 🧩 E. 차트 / 게이지 공통화


### E-1. 차트 툴팁이 차트 경계를 벗어나면 잘리는 문제 + 좌표 로직 중복

- **Situation** — 커스텀 툴팁이 차트 로컬 좌표로만 계산돼 경계를 벗어나면 클리핑되고, 차트마다 위치 계산 로직이 중복.
- **Action** — `useChartTooltip` 공통 훅으로 분리해 **뷰포트(****`clientX/Y`** **+** **`window`** **경계) 기준으로 좌표 계산**을 통일, 툴팁을 **FloatingMenu 포탈(****`position:fixed`****,** **`z-index:9999`****)** 로 렌더해 `overflow:hidden` 부모 밖에서도 표시.
- **Result** — 모든 차트 일관 동작 + 클리핑 제거 + 중복 제거. (`useChartTooltip.ts`, `MultiLineChart.tsx`, `RangeBandLineChart.tsx`)

### E-2. 6곳에 흩어진 게이지 구현 통일

- **Action** — 공용 `Gauge` 에 `getColorByPercent()` 를 내장(0~25 녹색 … 80~100 빨강)해 호출처의 color/배경 계산 중복을 제거.
- **Result** — 중복 50+줄 삭제, `<Gauge percent={v} />` 만으로 색상 자동. (`Gauge.tsx` / commit `7119f286`)

### E-3. 차트 에러 시 하단 메타정보까지 사라지던 ErrorBoundary 범위

- **Action** — ErrorBoundary 가 차트 본체만 감싸 시간/주기 메타 UI가 경계 밖이던 것을, **메타 UI를 경계 바깥으로 이동**해 차트 에러 시에도 메타정보는 유지.
- **Result** — 부분 장애 시 graceful degradation. (commit `cbf21b55`)

---


## 🌐 F. 사업 대응 — 구형 브라우저(Chrome 102) 지원

> 💡 폐쇄망 고객사(금융권 등) 환경은 보안 정책상 브라우저를 업데이트할 수 없어 **Chrome 102** 같은 고정 구버전에서 동작해야 했다. 최신 문법·CSS·SVG 기능이 줄줄이 깨지는 것을 하나씩 추적해 대응했다.

### F-1. AG Grid가 Chrome 102에서 화면 깨짐 (ES2022+ 파싱 실패)

- **Situation** — 신버전 AG Grid가 ES2022+ 문법으로 배포돼 Chrome 102가 파싱하지 못해 테이블이 통째로 깨짐.
- **Action** — `next.config.mjs`에 **`transpilePackages: ['ag-grid-community','ag-grid-react']`** 를 지정하고 **Babel 트랜스파일**로 ES5까지 낮춤. (코드에 `// NOTE: Chrome 102 호환성` 주석으로 의도 명시)
- **Result** — 구버전 크롬에서 테이블 정상 렌더. (commit `28bb170f`)

### F-2. 그라데이션 타이틀이 Chrome 102에서 안 보임

- **Situation** — 랜딩/로그인 타이틀의 `background-clip: text` 그라데이션 텍스트가 표시되지 않음.
- **Action** — **벤더 프리픽스** `-webkit-background-clip: text` + `-webkit-text-fill-color: transparent` 를 보강하고 `!important` 제거.
- **Result** — 구버전에서도 그라데이션 타이틀 표시. (`Login.module.scss` / commit `6bacdadb`)

### F-3. 허니콤 차트 glow가 Chrome 102에서 미렌더

- **Situation** — 복잡한 SVG 필터 체인(`feMorphology` erode + `feComposite` xor + blur)이 구버전 크롬에서 제대로 합성되지 않음.
- **Action** — 동일한 시각 효과를 **단순 필터(****`feGaussianBlur`** **+** **`feFlood`** **기반 외곽 glow)** 로 재구성해 호환성 확보. (복잡한 필터 체인 52줄 제거, 28줄로 재구성)
- **Result** — 구버전에서도 선택 glow 정상 표시. (`HoneycombChart.tsx` / commit `8645a27f`)

### F-4. 버전별 회귀를 막을 테스트 인프라 구축

- **Action** — **Playwright multi-version** 구성(`chrome-102` project + 실제 실행 경로 지정)으로 Chrome 102를 띄워 회귀 검증. `browsers/`에 버전별 크로미움을 받아 CI 외에서도 재현 가능하게 함.
- **Result** — 구버전 깨짐을 수정 후 즉시 재검증하는 루프 확보. (commits `f76b41f6`, `c6d81ffc`)
> 🔁 **후속 진화** — 다음 버전 [[프로젝트S v3]] 에서는 이 "런타임 땜빵" 방식을 **빌드 도구 레벨로 체계화**했다. `@vitejs/plugin-legacy` 로 `Chrome ≥ 90 / Edge ≥ 90` 타겟 + `modernPolyfills: true` + `regenerator-runtime` 을 적용하고, "구형 브라우저 대응 계획/지침" 문서로 정리. (v3 `vite.config.ts`)

---


## 📱 G. 모바일 / 반응형 대응


### G-1. 터치 디바이스에서 드래그앤드롭이 동작하지 않음

- **Situation** — 플로어플랜 장치 배치·랙 실장도 편집의 DnD가 `react-dnd` HTML5 백엔드(마우스 전용)라 모바일/태블릿 터치에서 무동작.
- **Action** — **`react-dnd-multi-backend`** **+** **`rdndmb-html5-to-touch`** (HTML5↔Touch 파이프라인)로 교체해 **PC 마우스 / 터치 겸용** DnD 구현.
- **Result** — 같은 편집 화면이 데스크톱·터치 양쪽에서 동작. (`DeviceList.tsx`, `RackPositionEditForm.tsx` / commit `e5eeb715`)

### G-2. 드래그-스크롤 직후 클릭이 오작동

- **Situation** — 가로 드래그-스크롤이 끝나는 순간 click 이벤트가 이어져 팝업 열림 등 의도치 않은 동작 발생.
- **Action** — `isDragging` 플래그로 드래그 종료를 추적하고, **1회성 click capture 리스너**를 등록해 직후 클릭을 `preventDefault/stopPropagation` 으로 무력화. DnD 드롭 시 팝업이 닫히던 버블링도 차단.
- **Result** — 드래그와 클릭 동작 분리. (드래그→클릭 중단 commit `2026-02-10`)

### G-3. 태블릿에서 date picker 포커스 시 소프트 키패드가 튐

- **Action** — 날짜 입력 포커스 시 모바일 소프트 키보드가 올라오는 이벤트를 방지.
- **Result** — 태블릿에서 달력 UI만 노출. (commit `2026-01-21`)

### G-4. 반응형 레이아웃 전반 + 브레이크포인트 중앙화

- **Action** — 흩어져 있던 태블릿 너비 변수를 제거하고 **`useResponsiveStore`** **(Zustand) 브레이크포인트로 중앙화** → CSS뿐 아니라 JS 분기에서도 일관 사용. 서버/스토리지/NAS 상세 팝업, 서버랙 그리드 레이아웃, 통계 리포트, 탭 메뉴 개수 등을 **태블릿 가로 너비까지** 대응. AG Grid 가로 드래그 스크롤도 추가. 랙 편집은 드래그 대상이 매 렌더 재생성돼 끊기던 것을 **컴포넌트 분리**로 안정화.
- **Result** — 데스크톱~태블릿 전 구간에서 깨지지 않는 레이아웃. (`useResponsiveStore.ts` 외 다수)

---


## 🧠 회고 & 배운 점

- **증상이 아니라 근본 원인** — 401·깜빡임·스크롤 오작동을 "재시도/임시 처리"로 덮지 않고, View Transition의 `fill`, SSR 쿠키 주입, 포커스 분기처럼 **원인 지점을 정확히 짚어 구조적으로** 해결했다.
- **타이밍·생명주기 감각** — FOUC(SSR↔하이드레이션), ResizeObserver 무한 루프, 폴링 생명주기, 언마운트 시 상태 소실 등 **React/브라우저 렌더 타이밍**에서 비롯된 버그가 많았고, 여기서 가장 많이 성장했다.
- **"고치다 보니 공통화"** — 같은 류의 버그가 반복되면 툴팁·게이지·테마 토큰처럼 **공통 훅/컴포넌트로 묶어 재발을 구조적으로 차단**했다.
- **대규모 데이터 UI** — 수백 노드 토폴로지, 대용량 AG Grid처럼 **스케일이 커질 때 깨지는 UI**를 동적 레이아웃·가상 스크롤·상태 영속화로 다루는 경험을 쌓았다.
> 이 경험은 후속 프로젝트 [[프로젝트S v3]] 의 접근성·UI 스케일링·안정성 작업으로 이어졌다.

**프로젝트S V2 Images**

| 이름 | 생성일 | 태그 |
| --- | --- | --- |
| 스토리지 기준 및 서버 기준 | 2026-06-26 |  |
| SAN Switch 상세정보 | 2026-06-26 |  |
| 서버 상세정보 | 2026-06-26 |  |
| 스토리지 상세정보 | 2026-06-26 |  |
| 서버랙 관리 | 2026-06-26 |  |
| 통계 레포트 | 2026-06-26 |  |
| 통계 분석 | 2026-06-26 |  |
| 자산 운용 현황 | 2026-06-26 |  |
| Rack 실장도 | 2026-06-26 |  |
| 전체 시스템 구성 | 2026-06-26 |  |
| 초기 랜딩 | 2026-06-26 |  |
