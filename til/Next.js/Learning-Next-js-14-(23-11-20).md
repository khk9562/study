---
title: "Learning Next js 14 (23-11-20)"
tags: ["Next.js"]
date: 2023-11-20
notion_id: be7a73e8-052c-4ebe-9033-09867fdaa974
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2023-11-20

### Learning Next js 14 


---

<details>
<summary>글꼴 추가</summary>

*(이미지 생략)*


</details>

<details>
<summary>병렬 데이터 가져오기</summary>

*(이미지 생략)*


</details>

<details>
<summary>정적 렌더링 선택 해제 - unstable_noStore</summary>

*(이미지 생략)*


</details>

<details>
<summary>경로 그룹을 이용한 로딩페이지</summary>

*(이미지 생략)*


</details>

<details>
<summary>구성요소 렌더링 전 “기다리는” 로드 상태 지정 - Suspense</summary>

*(이미지 생략)*


# 서스펜스를 통해 할 수 있는 일


그렇다면 서스펜스의 요점은 무엇입니까? 이에 대해 우리가 대답할 수 있는 몇 가지 방법이 있습니다:

- **데이터 가져오기 라이브러리를 React와 긴밀하게 통합할 수 있습니다.**

    데이터 가져오기 라이브러리가 Suspense 지원을 구현하는 경우 React 구성 요소에서 이를 사용하는 것이 매우 자연스럽게 느껴집니다.

- **의도적으로 설계된 로드 상태를 조정할 수 있습니다.**

    데이터가 어떻게 표시되는지는 말하지 않습니다. 가져오지만 이를 통해 앱의 시각적 로드 순서를 면밀히 제어할 수 있습니다.

- **경합 상태를 방지하는 데 도움이 됩니다.**`await`_동기적으로_

    를 사용하더라도 비동기 코드는 오류가 발생하기 쉬운 경우가 많습니다. Suspense는 마치 데이터가 이미 로드된 것처럼


    데이터를 읽는 것과 같은 느낌입니다.


</details>
