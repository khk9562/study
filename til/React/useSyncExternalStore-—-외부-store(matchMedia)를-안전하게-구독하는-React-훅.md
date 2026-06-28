---
title: "useSyncExternalStore — 외부 store(matchMedia)를 안전하게 구독하는 React 훅"
tags: ["React", "Typescript"]
date: 2026-06-24
notion_id: 388922cf-26a8-817b-bd00-cb078b44e5b1
notion_last_edited: 2026-06-28T08:29:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2026-06-24

## 한 줄 요약


`useState` 는 "내가 만든 상태", **`useSyncExternalStore`** **는 "남(브라우저·외부 라이브러리)이 가진 상태를 안전하게 구독해서 읽는 것"**. 공용 `useBreakpoint` 훅을 만들면서, 뷰포트(matchMedia)는 React 바깥의 상태라 이 훅이 정석이라 채택했다.


---


## 1. useSyncExternalStore 가 어떤 훅인가


React 18 에서 추가된, **React 바깥에 있는 상태(external store)를 렌더링과 동기화하며 구독**하기 위한 공식 훅이다. 이름 = External(외부) Store(저장소) 를 Sync(동기화).


### React 가 모르는 상태들

- 브라우저 API — 뷰포트 크기(`matchMedia`), `navigator.onLine`, URL 등
- 외부 상태 라이브러리 — Redux, Zustand store
- 전역 변수, 웹소켓 연결 상태 등

예전엔 이런 값을 `useState` + `useEffect` 로 **React 안에 복제**해서 썼는데, React 18 동시성 렌더링에서 이 복제 방식이 **tearing**(한 화면 안에서 컴포넌트마다 외부값을 다르게 보는 현상)을 일으킬 수 있게 됐다. 그래서 "외부 상태는 복제하지 말고 이 훅으로 직접 구독하라"며 나온 게 `useSyncExternalStore`.


### 시그니처


```typescript
const snapshot = useSyncExternalStore(
  subscribe,          // (1) 변화 알림 구독 → 해지 함수 반환
  getSnapshot,        // (2) 지금 이 순간의 현재값 읽기
  getServerSnapshot?, // (3) SSR용 현재값 (선택)
);
```


| 인자                    | 역할                                  | 비유               |
| --------------------- | ----------------------------------- | ---------------- |
| `subscribe(cb)`       | 외부가 바뀌면 `cb` 호출하도록 리스너 등록, 해지 함수 반환 | "바뀌면 이 번호로 전화 줘" |
| `getSnapshot()`       | **렌더할 때마다** 외부 최신값을 직접 읽어 반환        | "지금 값이 뭐야?"      |
| `getServerSnapshot()` | 서버 렌더링 시 폴백값                        | SSR엔 뷰포트 없음      |


핵심은 **"값을 React state 로 옮겨 담지 않고, 필요할 때마다 원본에서 직접 읽는다"**. `getSnapshot()` 이 이전과 같은 값(`===`)을 반환하면 리렌더를 건너뛰므로 boolean·primitive 반환이 안전·효율적이다.


---


## 2. 어떤 맥락에서 사용하기로 했나


프로젝트에 **반응형 breakpoint 분기 전용 훅이 없어**, 11개 컴포넌트가 각자 `window.matchMedia('(max-width: ...)')` 의 "초기값 + change 리스너 등록/해제" 보일러플레이트를 복붙하고 있었다. 경계값도 `767/768/1279/1280/1300` 으로 파일마다 제각각이라 SCSS `$breakpoints` 와 어긋났다.


이를 공용 `useBreakpoint(name)` 훅으로 통합했는데:

- 처음엔 흔한 `useState` + `useEffect` 로 구현 → eslint(`react-hooks/set-state-in-effect`)가 **effect 내 동기** **`setState`** 를 막음 (cascading render 경고)
- 그 `setState` 한 줄은 "마운트~effect 등록 사이의 변화도 잡으려는" 동기화 목적이었는데 — 바로 그 욕구가 `useSyncExternalStore` 가 설계로 해결하는 문제였다
- **뷰포트는 브라우저(React 바깥)가 가진 상태** → 외부 store 구독이라는 이 훅의 본질에 정확히 부합 → 채택

```typescript
export function useBreakpoint(name: BreakpointName): boolean {
  const query = `(max-width: ${BREAKPOINTS[name]}px)`;

  // (1) 뷰포트 변화 구독
  const subscribe = useCallback((onChange) => {
    if (!isMatchMediaSupported()) return () => {};
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  // (2) 현재 매칭 여부를 그때그때 직접 읽음
  const getSnapshot = () =>
    isMatchMediaSupported() ? window.matchMedia(query).matches : false;

  // (3) 서버엔 뷰포트가 없으니 false
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```


`BREAKPOINTS = { mobile:767, tablet:1279, hd:1679, fhd:2559 }` 를 SCSS `$breakpoints` 와 동일 값으로 두어, `useBreakpoint('mobile')` 이 SCSS `@include respond-to(mobile)` 과 1:1 대응되게 했다(JS↔CSS SSOT).


---


## 3. 사용해서 거둔 성과

- **eslint 동기 setState 경고 해소**: effect 내 `setState` 자체가 사라져 cascading render 원인 제거
- **tearing 방지**: 여러 컴포넌트가 동시에 `useBreakpoint('mobile')` 을 써도 한 렌더 안에서 항상 같은 값을 봄
- **mount↔effect 갭 원천 제거**: `getSnapshot` 이 렌더 시점 최신값을 직접 읽으므로, 복제 방식이 필요로 했던 "한 번 더 동기화" 자체가 불필요
- **SSR 안전**: `getServerSnapshot` 으로 서버 폴백을 명시적으로 처리
- **중복 제거 + 경계 통일**: 11곳의 matchMedia 보일러플레이트를 한 훅으로 수렴, `768→767`·`1280/1300→1279` 를 SCSS 기준으로 통일
- **검증**: 프로덕션 빌드 통과 + 이관 파일 eslint 0

### 트레이드오프


`getSnapshot` 이 렌더마다 `matchMedia(query)` 객체를 새로 만들지만, 매우 가벼운 호출이고 반환이 boolean 이라 스냅샷이 안정적 → 리렌더 루프 위험 없음. 이 정도 비용으로 위 이점을 모두 얻으니 남는 거래.


---


## 언제 쓰나 / 안 쓰나

- ✅ **씀**: React 가 모르는 외부 상태(브라우저 API, 외부 store)를 읽을 때
- ❌ **안 씀**: 컴포넌트가 자체적으로 만드는 상태 → 그냥 `useState`. 외부 store 가 아닌데 쓰면 과함
