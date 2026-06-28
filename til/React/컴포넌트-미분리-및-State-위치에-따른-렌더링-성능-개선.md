---
title: "컴포넌트 미분리 및 State 위치에 따른 렌더링 성능 개선"
tags: ["React"]
date: 2026-05-20
end_date: 2026-05-21
notion_id: 366922cf-26a8-80b2-8ee6-c2208082c668
notion_last_edited: 2026-06-28T08:29:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습 기간**: 2026-05-20 ~ 2026-05-21

<details>
<summary>이벤트 규칙 페이지 — `이벤트 규칙 탭` 폼 입력 렌더링 성능 개선</summary>

```markdown
Situation

회귀 테스트 중 "이벤트 규칙 추가" 모달에서 한 글자 입력할 때마다 미세한 lag 와 포커스
튐 현상을 발견했다. 모달은 부모 컴포넌트(EventRulesTab) 본문에 직접 배치되어 있었고,
폼 state(useState) 도 부모에 있었다. 입력마다 부모 전체와 보이지도 않는 규칙
테이블까지 재렌더되는 구조가 의심됐다.

Task

- "한 글자 입력 시 어디까지 commit 되는가" 를 수치로 확인한다.
- 한 글자당 commit 비용을 60fps frame budget(16ms) 안으로 들이민다.
- 외부 라이브러리 추가 없이 React 표준 API 로만 해결한다.

Action

1. 측정 코드 삽입
React 내장 <Profiler> 3개를 ①부모 전체 ②테이블 section ③모달 영역에 끼웠다.
onRender(id, phase, actualDuration, baseDuration) 콜백으로 한 글자 입력 시 각 영역의
commit 시간을 콘솔에 출력. 0.5ms 미만은 노이즈로 필터링.
2. 데이터로 원인 특정
한 글자 입력당 결과:
- TableSection.actual ≈ 29ms (보이지도 않는데 매번 commit)
- 전체 EventRulesTab.actual ≈ 32ms
- actual ≈ base → 메모이제이션 효과 0, 모든 행이 매번 재평가

→ 가설 확정: 폼 state 가 부모에 있어 입력마다 부모 set state → 자식 트리(테이블 포함)
전부 재렌더.

1. 모달 컴포넌트 분리
- EventRuleAddModal.tsx 로 추출. 폼 state / useMutation / 메트릭 등급 참조 조회를 전부
모달 내부로 이동.
- 부모는 {open && <EventRuleAddModal ... />} 형태의 conditional mount 만 담당.
- 모달 닫힐 때 컴포넌트 자체가 unmount 되도록 설계 → form state 자동 초기화. 기존의
"닫을 때 form 명시적 reset" 로직 제거.
1. 동일 시나리오로 재측정
모달 새로 열고 "test" 4글자 입력한 뒤 콘솔 로그 비교.

Result

┌──────────────────────┬────────┬───────────────┬──────────────────┐
│ 측정 (글자당 commit) │ Before │     After     │       변화       │
├──────────────────────┼────────┼───────────────┼──────────────────┤
│ TableSection.actual  │ ~29ms  │ 0ms (안 찍힘) │ 완전 차단        │
├──────────────────────┼────────┼───────────────┼──────────────────┤
│ EventRulesTab.actual │ ~32ms  │ ~6ms          │ 약 80% 절감      │
├──────────────────────┼────────┼───────────────┼──────────────────┤
│ AddModal.actual      │ ~3ms   │ ~5~7ms        │ 모달 자체 commit │
└──────────────────────┴────────┴───────────────┴──────────────────┘

- 보이지 않는 테이블이 입력마다 재평가되던 사슬을 끊었다.
- 한 글자 commit 이 60fps frame budget(16ms) 내에 안정적으로 들어와 입력 lag 가
사라졌다.
- 동일 패턴(부모 본문에 모달 + 폼 state) 을 가진 다른 페이지(StatusGradeMappingsTab,
IncidentPage, GroupsPage 등) 에 일반화 적용 가능한 패턴을 확보했다.

배운 점

- 화면에 안 보이는 비용을 무시하지 않기. 모달만 최적화했으면 80% 의 비용(테이블
재평가) 을 영영 못 잡았을 것이다. Profiler 가 가르쳐 줬다.
- 추측보다 측정. 처음엔 "행 메모이제이션" 을 가장 큰 개선안으로 봤지만, 측정 결과는
"form state 위치" 라는 더 근본적인 원인을 가리켰다. 데이터가 우선순위를 뒤집었다.
- 간단한 도구의 위력. 외부 라이브러리 없이 React 내장 Profiler 만으로 충분히 정량
데이터를 얻었다. 측정 코드 삽입과 제거에 각 5분.
```


</details>

<details>
<summary>이벤트 규칙 페이지 - `상태 등급 매핑 탭` 성능 개선</summary>

```markdown
상태 등급 매핑 화면 — 폼/편집 입력 렌더링 성능 개선
  
  Situation

  "상태 등급 매핑" 관리 화면에서 모달 입력 시 글자 하나당 800ms 가까이 브라우저 main 
  thread 가 묶이는 입력 lag 가 발생했다. 인라인 편집(테이블에서 한 행의 등급/레이블
  수정) 도 동일하게 lag 가 체감됐다. 동일 패턴(부모 본문에 모달 + 폼/편집 state) 을 가진
   이벤트 규칙 화면에서 이미 한 차례 같은 문제를 잡은 적이 있어, 본 화면에도 정량적으로
  검증하고 처리하기로 했다.
  
  Task

  - "한 글자 입력 시 어디까지 commit 되는가" 를 수치로 확정하고, 원인을 데이터 기반으로
  좁힌다.
  - 60fps frame budget(16ms) 안에 안정적으로 들이민다.
  - 외부 라이브러리 추가 없이 React 표준 API 만 사용한다.

  Action

  1. 측정 코드 삽입 (Before baseline)
  React 내장 <Profiler> 3개를 ①부모 전체 ②테이블 section ③모달 영역에 끼웠다.
  onRender(id, phase, actualDuration, baseDuration) 콜백으로 commit 시간을 콘솔에 출력.
  두 시나리오(모달 입력 / 인라인 편집) 각각 측정.
  
  Before 데이터 (글자당):
  TableSection.update   actual=120ms  base=110ms   ← actual ≈ base, memo 효과 0
  StatusGradeMappingsTab actual=120ms  base=110ms
  [Violation] 'input handler took 800ms' ← main thread 블록

  2. 데이터로 원인 특정
  - actual ≈ base 가 일관되게 나옴 → 메모이제이션이 전혀 작동하지 않고 있다.
  - 모달이든 인라인이든 동일하게 ~120ms commit → 두 경우 모두 부모 set state 가 자식
  트리 전체를 다시 그리고 있다.
  - 원인: 폼 state (form) 와 편집 state (editingId / editGrade / editLabel) 가 모두 부모
   컴포넌트 본문에 있었음. 입력 한 글자 → 부모 set state → 자식 모두 재렌더.

  3. 세 갈래로 분리
  
  ┌──────────┬──────────────────────┬───────────────────────────────────────────────┐
  │   변경   │         파일         │                     효과                      │
  ├──────────┼──────────────────────┼───────────────────────────────────────────────┤
  │ 모달     │ StatusGradeAddModal. │ 폼 state·createMutation 모달 내부로. 부모는   │
  │ 분리     │ tsx 신규             │ {open && <Modal/>} 로 mount/unmount → 닫힐 때 │
  │          │                      │  state 자동 초기화                            │
  ├──────────┼──────────────────────┼───────────────────────────────────────────────┤
  │ 행 분리  │ StatusGradeRow.tsx   │ <tr> 컴포넌트화. mapping reference 가 안      │
  │ + React. │ 신규                 │ 바뀌면 행은 re-render 스킵                    │
  │ memo     │                      │                                               │
  ├──────────┼──────────────────────┼───────────────────────────────────────────────┤
  │ 편집     │                      │                                               │
  │ state 행 │ StatusGradeRow.tsx   │ editGrade/editLabel 을 행 내부 state 로. 편집 │
  │  안으로  │                      │  input 입력이 부모를 흔들지 않음              │
  │ 이동     │                      │                                               │
  ├──────────┼──────────────────────┼───────────────────────────────────────────────┤
  │ 부모     │ StatusGradeMappingsT │ handleStartEdit/handleCancelEdit/handleSave/h │
  │ callback │ ab.tsx               │ andleDelete 를 useCallback 으로 → memo 비교   │
  │  안정화  │                      │ 통과                                          │
  ├──────────┼──────────────────────┼───────────────────────────────────────────────┤
  │ handleSa │                      │ row 가 mapping reference 를 직접 넘기게 해서  │
  │ ve dep   │ 동상                 │ mappings 배열을 dep 에서 제외 → 데이터 fetch  │
  │ 최적화   │                      │ 후에도 callback 안정성 유지                   │
  └──────────┴──────────────────────┴───────────────────────────────────────────────┘
  
  4. After 측정
  같은 두 시나리오를 똑같이 반복.

  Result
  
  ┌──────────────────────────────────┬───────────┬───────────────┬──────┐
  │               측정               │  Before   │     After     │ 절감 │
  ├──────────────────────────────────┼───────────┼───────────────┼──────┤
  │ 시나리오 1 — TableSection.update │ ~120ms    │ 0ms (안 찍힘) │ 100% │
  ├──────────────────────────────────┼───────────┼───────────────┼──────┤
  │ 시나리오 1 — 부모 전체           │ ~120ms    │ ~3ms          │ 97%  │
  ├──────────────────────────────────┼───────────┼───────────────┼──────┤
  │ 시나리오 2 — TableSection.update │ ~124ms    │ ~1.5ms        │ 99%  │
  ├──────────────────────────────────┼───────────┼───────────────┼──────┤
  │ 시나리오 2 — 부모 전체           │ ~124ms    │ ~1.5ms        │ 99%  │
  ├──────────────────────────────────┼───────────┼───────────────┼──────┤
  │ 'input handler took' violation   │ 600~860ms │ 사라짐        │ —    │
  └──────────────────────────────────┴───────────┴───────────────┴──────┘

  핵심 시그널:
  - 시나리오 2 의 After 로그에서 actual=1.5ms / base=227ms. base 는 "memo 없이 다 그렸을
   때" 추정치고 actual 은 실제 든 시간. React.memo 가 다른 행 약 200개를 commit 에서 
  스킵하고 있다는 직접 증거.
  - Before 에 매 입력마다 발생하던 [Violation] 'input handler took 800ms' 가 After
  에서는 한 번도 찍히지 않음 → 사용자가 체감하던 입력 lag 가 사실상 사라짐.
  - 60fps frame budget(16ms) 대비 약 1/10 수준으로 진입.
  
  회고

  - 추측보다 측정. 첫 인상은 "행 수가 많아서 느린 거 아닌가" 였지만, Profiler 데이터가
  actual ≈ base 라고 가리키자 원인은 state 의 위치 라는 더 근본적인 곳이라는 걸 알게
  됐다. 측정이 진단을 정확하게 만들었다.
  - 분리는 비용이 아니라 자산. 컴포넌트를 잘게 나누는 게 가독성 측면에서만 의미 있는 게
  아니라, React.memo 의 경계가 생기면서 렌더링 성능의 단위 가 되어 준다. 분리 자체가
  최적화의 기반.
  - 동일 패턴 재현. 이전에 EventRulesTab 에서 한 차례 같은 패턴을 잡았던 경험이 있어, 본
   화면은 baseline 측정 → 원인 가설 → 적용 → 검증을 거의 같은 흐름으로 빠르게 처리할 수
  있었다. 개별 화면의 fix 가 아니라 재사용 가능한 진단·개선 패턴 으로 정착했다는 점이 큰
   수확.
  - 다음 단계. 동일 구조가 의심되는 다른 화면들(IncidentPage, GroupsPage,
  ReportCreatePage) 도 같은 사이클로 점검 예정. 측정→분석→분리→재측정 4 스텝이 표준
  절차가 될 만하다.
```


</details>

<details>
<summary>이벤트 규칙 페이지 - `상태 등급 매핑 탭 모달` 성능 개선</summary>

```markdown
상태 등급 매핑 탭 — 모달 토글 성능 개선

  1. 문제 상황

  StatusGradeMappingsTab 에서 "매핑 추가" 버튼 클릭(모달 열기) /
   모달 외부 mousedown(모달 닫기) 시 브라우저가 동기 핸들러 시간
   위반 경고를 띄움.

  [Violation] 'click' handler took 451ms        ← 모달 열기
  [Violation] 'mousedown' handler took 443ms    ← 모달 닫기
  (useOutsideClick 경로)

  사용자 체감: 버튼/외부 클릭 시 명백한 입력 지연.

  useOutsideClick 훅에 Profiler 를 넣어 측정하려 했으나 훅은 JSX
   를 반환하지 않아 불가, 차선책으로 StatusGradeAddModal 에
  Profiler 를 둘러 측정.

  [Profiler] StatusGradeAddModal (mount) — actual=0.60ms /
  base=0.10ms

  → 모달 자체 mount 비용은 0.60ms. 451ms 중 나머지 ~450ms 는
  다른 곳에서 발생 중.

  2. 문제 원인

  브라우저의 'handler took Xms' 는 그 핸들러 내부에서 동기적으로
   실행된 모든 작업 시간. React 18 의 setState 는 같은 동기
  컨텍스트에서 commit 까지 끝내므로:

  click → setAddOpen(true)
        → 부모 StatusGradeMappingsTab 동기 re-render
        → 그 안의 모든 자식 검토 (특히 mappings.map 의
  StatusGradeRow N개)
        → 모달 mount(0.60ms)
        → 핸들러 종료

  이론적으로는 StatusGradeRow 가 React.memo 라 props 가 동일하면
   skip 되어야 하지만, 실제로는 모든 Row 가 매번 재렌더되고 
  있었음. 원인은 useCallback deps:

  // Before — StatusGradeMappingsTab.tsx
  const updateGrade = useUpdateStatusGrade();
  const deleteGrade = useDeleteStatusGrade();

  const handleSave = useCallback(..., [updateGrade]);
  const handleDelete = useCallback(..., [deleteGrade]);

  useUpdateStatusGrade() / useDeleteStatusGrade() 는 TanStack
  Query 의 useMutation 결과 객체를 통째로 반환. 이 객체는 내부
  상태(isPending, data, variables 등)를 스프레드한 결과라 매 
  렌더 새 reference.

  updateGrade(매 렌더 새 ref)
    → handleSave (useCallback deps 무효화로 매 렌더 새 함수)
    → <StatusGradeRow onSave={handleSave}> props 변경
    → React.memo 의 얕은 비교 실패
    → 행 N개 전부 재렌더 (행이 수백 개면 수백 ms)

  useOutsideClick 은 무죄 — 그 안에서 호출되는 onClose() →
  setAddOpen(false) 가 같은 부모 재렌더를 일으킬 뿐. 사실 기존
  "취소" 버튼으로 닫을 때도 동일한 비용이 났겠으나, outside
  mousedown 경로가 생기며 브라우저가 violation 으로 노출시켰을
  뿐.

  3. 해결 방법안

  안: A
  내용: useMutation 결과에서 mutate / isPending 만 destructure
  해    
    deps 안정화
  효과: Row 들의 memo 정상 작동, 즉시 효과 큼
  변경 범위: 1개 파일, 수 줄 
  ────────────────────────────────────────
  안: B 
  내용: addOpen state + AddModal 트리거 버튼을 별도 자식
    컴포넌트로 격리
  효과: 토글이 mappings 테이블 트리를 아예 건드리지 않음
  변경 범위: 새 컴포넌트 1개
  ────────────────────────────────────────
  안: C
  내용: StatusGradeRow 의 props 를 더 줄여 의존성 최소화
    (onStartEdit, onCancelEdit 등)
  효과: 부차적
  변경 범위: 다수 파일 수정
  ────────────────────────────────────────
  안: D
  내용: 가상 스크롤(react-window 등) 도입해 row 수와 무관하게
    렌더 비용 일정화
  효과: 근본적, but 과한 도입
  변경 범위: 큰 변경

  4. 선택 이유 — A 채택

  - A 만으로 충분 — 원인이 명확히 deps 무효화이고, 그것만 고치면
   memo 가 본래 의도대로 작동.
  - 변경 범위 최소 — TanStack Query 의 일반 패턴 따라가는
  destructure 1줄 + deps 갱신만. 위험 거의 없음.
  - B 는 A 위에 얹는 추가 격리 — A 로 해결되면 굳이 컴포넌트를
  더 쪼개는 추상화는 premature. 향후 row 수가 더 늘거나 다른
  state 가 추가될 때 고려.
  - D 는 row 수가 1만 단위로 증가하기 전까지 ROI 없음.

  5. 성능 개선 전/후

  측정 환경

  - 브라우저: Chrome DevTools 의 핸들러 violation 로그 + React
  <Profiler> onRender 콜백
  - 화면: 이벤트 규칙 관리 > 상태 등급 매핑 탭 (mappings 다수
  로딩 상태)

  Before

  ┌───────────────────────────────┬─────────────────────────┐
  │             항목              │           값            │
  ├───────────────────────────────┼─────────────────────────┤
  │ 'click' handler took (모달    │ 451ms                   │
  │ 열기)                         │                         │
  ├───────────────────────────────┼─────────────────────────┤
  │ 'mousedown' handler took      │ 443ms                   │
  │ (외부 클릭으로 닫기)          │                         │
  ├───────────────────────────────┼─────────────────────────┤
  │ [Profiler]                    │ actual=0.60ms /         │
  │ StatusGradeAddModal (mount)   │ base=0.10ms             │
  ├───────────────────────────────┼─────────────────────────┤
  │ [Profiler]                    │ (미측정 — Profiler 적용 │
  │ StatusGradeMappingsTab        │  전)                    │
  │ (update)                      │                         │
  ├───────────────────────────────┼─────────────────────────┤
  │ 토글당 재렌더되는             │ N개 전체 (props ref     │
  │ StatusGradeRow                │ 변경으로 memo 통과      │
  │                               │ 불가)                   │
  └───────────────────────────────┴─────────────────────────┘

  After

  ┌──────────────────────────────────┬───────────────────────┐
  │               항목               │          값           │
  ├──────────────────────────────────┼───────────────────────┤
  │ [Profiler] StatusGradeAddModal   │ actual=1.80ms /       │
  │ (mount)                          │ base=1.40ms           │
  ├──────────────────────────────────┼───────────────────────┤
  │ [Profiler]                       │ actual=4.50ms /       │
  │ StatusGradeMappingsTab (update)  │ base=257.70ms         │
  ├──────────────────────────────────┼───────────────────────┤
  │ 토글당 재렌더되는 StatusGradeRow │ 0개 (memo skip 정상   │
  │                                  │ 작동)                 │
  └──────────────────────────────────┴───────────────────────┘

  핵심 지표 해석

  ┌────────────┬──────────────┬──────────────┬────────────┐
  │    비교    │    Before    │    After     │    개선    │ 
  ├────────────┼──────────────┼──────────────┼────────────┤
  │ 부모       │ ~450ms       │              │            │ 
  │ 재렌더     │ (핸들러      │ 4.50ms       │ 약 100배 ↓ │ 
  │ 실측 비용  │ violation    │              │            │ 
  │            │ 기준)        │              │            │
  ├────────────┼──────────────┼──────────────┼────────────┤ 
  │ 부모 트리  │              │              │ (memo 없이 │
  │ 잠재 렌더  │ —            │ 257.70ms     │  다 그렸을 │ 
  │ 비용       │              │              │  때의      │
  │ (base)     │              │              │ 상한)      │
  ├────────────┼──────────────┼──────────────┼────────────┤
  │            │              │ (257.70 −    │ 자식       │
  │ memo skip  │ 0%           │ 4.50) /      │ 트리의 98% │
  │ 비율       │              │ 257.70 ≈     │  가 skip   │
  │            │              │ 98.3%        │            │
  └────────────┴──────────────┴──────────────┴────────────┘

  ▎ base=257.70ms 는 "memo 없이 자식까지 전부 다시 그렸다면 
  ▎ 257.70ms 걸렸을 것" 이라는 React 의 추정치. actual=4.50ms 는
  ▎  실제로 걸린 시간 — 두 값의 큰 격차가 memo 가 제대로 작동 중
  ▎  이라는 결정적 증거. Before 에는 actual ≈ base 였을 것 (둘 
  ▎ 다 ~450ms).

  ▎ 모달 mount 의 actual=1.80ms / base=1.40ms 는 mount(첫 
  ▎ 렌더)라 자식 트리 전부를 그릴 수밖에 없어 actual 이 base 
  ▎ 보다 약간 큰 게 정상. 절댓값 자체가 작아 무시 가능.

  적용 diff 요약

  - const updateGrade = useUpdateStatusGrade();
  - const deleteGrade = useDeleteStatusGrade();
  + const { mutate: updateMutate, isPending: updatePending } = 
  useUpdateStatusGrade();
  + const { mutate: deleteMutate, isPending: deletePending } = 
  useDeleteStatusGrade();

  - const handleSave = useCallback(..., [updateGrade]);
  + const handleSave = useCallback(..., [updateMutate]);

  - const handleDelete = useCallback(..., [deleteGrade]);
  + const handleDelete = useCallback(..., [deleteMutate]);

  - deletePending={deleteGrade.isPending}
  - savePending={updateGrade.isPending}
  + deletePending={deletePending}
  + savePending={updatePending}

  검증 체크리스트

  - [Violation] 'click' handler took ... 경고 사라짐 (실측
  ~450ms → 한 자릿수 ms 수준)
  - [Violation] 'mousedown' handler took ... 경고 사라짐
  - React Profiler 의 StatusGradeMappingsTab.update
  actual=4.50ms ≪ base=257.70ms 로 memo skip 비율 98.3% 확인
  - (후속) <Profiler> 디버그 코드 두
  군데(StatusGradeMappingsTab, StatusGradeAddModal) 제거

  ---
  추가 질문 답변 (재게재): useMutation 을 destructure 하는 게 
  일반적으로 적절한가?
  
  상황에 따라 다릅니다. 항상 강제할 필요는 없지만, 다음 
  케이스에서는 destructure 가 안전합니다.

  항상 destructure 가 더 나은 경우

  1. useCallback / useMemo deps 에 들어갈 때 — mutation 객체
  전체는 매 렌더 새 ref 라 deps 가 무효화됨.
  2. memo 자식에 prop 으로 전달할 때 — 객체 전체를 넘기면 memo
  가 절대 작동 안 함.
  3. useEffect deps 에 들어갈 때 — 매 렌더 effect 가 다시
  실행되어 의도치 않은 side-effect 발생.

  Destructure 안 해도 무방한 경우

  function MyComponent() {
    const createUser = useCreateUser();

    return (
      <button onClick={() => createUser.mutate(data)}
  disabled={createUser.isPending}>
        추가
      </button>
    );
  }
  - 같은 컴포넌트 안에서 직접 mutation.mutate(...),
  mutation.isPending 으로 쓰기만 하면 매 렌더 새 ref 여도 문제
  없음.
  - 단, 컴포넌트가 커지거나 자식에 콜백을 넘기기 시작하는 순간
  함정이 됨.

  어떤 게 stable 한지

  ┌───────────────────────┬────────────┬────────────────────┐
  │         속성          │   안정성   │        비고        │
  ├───────────────────────┼────────────┼────────────────────┤
  │ mutate, mutateAsync,  │ ✅ stable  │ useCallback / 자식 │
  │ reset                 │            │  prop 용도로 안전  │
  ├───────────────────────┼────────────┼────────────────────┤
  │ isPending, isError,   │ ❌ 매 렌더 │ 값 자체가 안       │
  │ isSuccess, data,      │  변할 수   │ 바뀌면 primitive   │
  │ error, variables      │ 있음       │ 비교는 통과        │
  ├───────────────────────┼────────────┼────────────────────┤
  │ 객체 전체 (mutation)  │ ❌ 매 렌더 │ deps / prop 에     │
  │                       │  새 ref    │ 통째 넣지 말 것    │
  └───────────────────────┴────────────┴────────────────────┘

  권장 컨벤션

  ▎ "mutation 결과를 콜백/effect deps 에 쓰거나 자식에 넘기는 
  ▎ 순간, 반드시 mutate 만 destructure 한다. 그 외의 단순 호출은
  ▎  자유."

  이 규칙만 지키면 이번 같은 함정을 일관되게 회피할 수 있습니다.
   팀에서 ESLint 의 react-hooks/exhaustive-deps 만 신뢰하면 잡을
   수 없는 종류의 버그(린트는 만족하지만 ref 가 매번 새로
  만들어지는)라, 컨벤션 문서화가 유효합니다.
```


</details>
