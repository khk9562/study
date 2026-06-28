---
title: "React Dev Tools (Chrome Extensions)"
tags: ["React", "Extension"]
date: 2025-10-13
notion_id: 28b922cf-26a8-80f2-8d49-e8b9dfd9b9b6
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-10-13

## **⚙️ Settings**


### 렌더링 시 하이라이팅 기능


_"General > Highlight updates when components render" 체크_


파란색 -> 녹색 -> 노란색 -> 빨간색 순으로 갈수록 빈번하게 렌더링 됨


## **⚛️ Components Tab**


⇒ 코드 디버깅


**1) state, props, hooks 확인**


**2) 컴포넌트 탐색 및 계층 구조 확인**

    - 검색창에 컴포넌트명을 입력하여 앱 내의 컴포넌트를 쉽게 검색
    - 해당 컴포넌트를 더블 클릭 해보면 하위 컴포넌트를 확인할 수 있으므로 아래와 같이 컴포넌트 트리 구조를 한 눈에 파악가능
    - 컴포넌트가 선택된 상태에서 하단의 `rendered by` 영역을 참조하면 어떤 상위 컴포넌트에 의해 그 하위 컴포넌트가 렌더링되었는지 계층 구조로 확인할 수 있다. 해당 컴포넌트의 모든 상위 컴포넌트가 표시되기 때문에 상위 컴포넌트에는 어떤 것들이 있는지 추적이 용이하다.

**3) 컴포넌트 데이터 로깅**

    - 클릭 한 번으로 컴포넌트가 보유하고 있는 모든 데이터를 콘솔 창에 기록할 수 있다. 이 데이터에는 `props`, `hooks`, DOM에 있는 노드, 시스템에서의 파일 위치 등 컴포넌트와 관련된 모든 내용이 포함된다.

**4) 컴포넌트 필터링**


_"Components > Hide components where... > Add filter"_


## **⚛️ Profiler Tab**


⇒ 컴포넌트 성능 테스트


**1) 프로파일링 시작하기**

- 처음 프로파일러 탭을 열면, "🔵" 버튼을 눌러 기록을 진행하기 전까지는 아무 내용도 확인할 수 없다.
- 기록을 시작하면 애플리케이션이 렌더링될 때 마다 성능 정보가 자동으로 수집된다. 기록 중에는 평소처럼 앱을 사용하면 된다. 수집을 중단하려면, "🔴" 버튼을 누른다.

**2) Commit Chart 보는 법**


> React는 개념적으로 두 단계를 거쳐 작동한다.  
> - **렌더링 단계(render)**: DOM과 같은 요소에 어떤 변경이 필요한지 결정하는 단계. React는 이 단계에서 `render` 메서드를 호출하여 결과를 이전 렌더링과 비교한다.  
>   
> - **커밋 단계(commit)**: React가 실제 변경 사항을 적용하는 단계. 예를 들면 React DOM에서 노드를 삽입, 삭제, 업데이트 하는 것. 이 단계에서 React 수명 주기 메서드가 호출된다.


으악 리액트 이전 버전이라 프로파일러 못쓴다!


> Profiling not supported.  
> Profiling support requires either a development or profiling build of React v16.5+.
