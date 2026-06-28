---
title: "리액트 명령형 VS 함수형 문법"
tags: []
date: 2025-11-28
notion_id: 2b8922cf-26a8-8032-a679-de67f5951a26
notion_last_edited: 2026-06-28T08:29:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-11-28

# 📂 SSE(Server-Sent Events) 구현 패턴 분석: Class(Singleton) vs Functional(Hook)

> 요약  
> 현재 프로젝트의 SSE 코드가 왜 Class형태의 싱글톤 패턴으로 작성되었는지 분석하고, 이를 최신 React 트렌드인 Functional(Hook + Context) 방식으로 변경했을 때의 장단점을 비교 정리한 문서입니다.

---


## 1. 현재 코드 분석 (Class형 싱글톤)


### 🧐 왜 Class로 작성되었는가?


현재 코드는 **싱글톤 패턴(Singleton Pattern)**을 사용하여 전역에서 **단 하나의 SSE 연결 인스턴스**만 존재하도록 강제하고 있습니다.

- **코드 특징:** `private static instance`, `getInstance()` 사용
- **데이터 전파:** `document.dispatchEvent` (브라우저 네이티브 이벤트) 사용
- **React 의존성:** 낮음 (React 렌더링 사이클 외부에서 동작)

### ❓ "Instance 관리를 수동으로 한다"는 의미


React의 생명주기(Lifecycle) 시스템 바깥에 존재하므로, 개발자가 직접 코드로 제어해야 하는 영역이 존재합니다.

1. **중복 생성 방지:** `if (!instance)` 로직을 직접 짜서 연결이 여러 개 생기는 것을 막아야 함.
2. **연결 종료(Cleanup):** 컴포넌트가 사라질 때 리액트가 알아서 꺼주지 않으므로, 적절한 시점에 `close()`를 명시적으로 호출해줘야 함.

| **특징**     | **Class형 (현재 코드)**                                                 | **함수형 (Context + Hook)**                                               |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **장점**     | React 렌더링과 완전히 분리되어 성능 영향이 적음. 
 어디서든(React 밖에서도) 접근 가능.           | React 생명주기(`useEffect`)와 자연스럽게 통합됨. 
 `useContext`로 상태 공유가 쉬움.         |
| **단점**     | 코드가 다소 길고(Boilerplate), React스러움이 떨어짐. 
 `instance` 관리를 수동으로 해야 함. | Context Provider로 최상단을 감싸줘야 함. 
 의존성 배열(`deps`) 관리를 잘못하면 무한 재연결 발생 가능. |
| **이벤트 처리** | `document.dispatchEvent` (브라우저 이벤트) 사용                             | React State, Zustand, React Query 등을 주로 사용                             |


---


## 2. React스러움(React-like)에 대한 고찰


### 🤔 "리액트스러움이 떨어진다"는 것은 단점인가?


무조건 단점은 아니지만, **유지보수와 생산성 측면에서 트레이드오프(Trade-off)**가 있습니다.


| 구분         | Class형 (현재 방식)                          | Functional형 (React 방식)                       |
| ---------- | --------------------------------------- | -------------------------------------------- |
| **패러다임**   | **명령적 (Imperative)** <br> "이벤트 쏴! 받아!"  | **선언적 (Declarative)** <br> "상태가 변했으니 화면 그려!" |
| **데이터 흐름** | `Event Listener` → `dispatchEvent` (방송) | `Context` / `State` / `Store` 구독             |
| **디버깅**    | 브라우저 이벤트 탭 확인 필요 (추적 어려움)               | React DevTools로 흐름 파악 용이                     |
| **장점**     | 렌더링 이슈 없음, React 외부에서도 사용 가능            | 코드 일관성 유지, 상태 관리 라이브러리와 통합 용이                |

> 결론: 성능 최적화가 극도로 필요하거나 React 외부와 통신해야 한다면 Class형이 유리하지만, 일반적인 React 애플리케이션 개발 생산성은 Functional형이 더 높습니다.

---


## 3. 리팩토링 가이드: Functional(Context + Hook) 방식


만약 이 코드를 리액트 친화적으로 변경한다면 `Context API`와 `Custom Hook`을 사용합니다.


### ✅ 구현 예시 코드


```typescript
// SseContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { v4 as uuidv4 } from 'uuid';

interface SseContextType {
  isConnected: boolean;
}

const SseContext = createContext<SseContextType | null>(null);

export const SseProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

  useEffect(() => {
    // 1. 연결 함수
    const connect = () => {
      if (eventSourceRef.current) return; // 중복 방지

      const sseId = uuidv4();
      const es = new EventSourcePolyfill(`${SERVER_URL}/...`, config);

      // 2. 이벤트 리스너 등록 (여기서 React State나 React Query 업데이트)
      es.addEventListener('alarm', (e: any) => {
        const data = JSON.parse(e.data);
        console.log('알림 수신:', data);
        // dispatch(setAlarm(data)); // 전역 상태 업데이트 예시
      });

      eventSourceRef.current = es;
      setIsConnected(true);
    };

    connect();

    // 3. 클린업 (컴포넌트 언마운트 시 자동 연결 종료)
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SseContext.Provider value={{ isConnected }}>
      {children}
    </SseContext.Provider>
  );
};

// 사용하는 곳
export const useSse = () => useContext(SseContext);
```
