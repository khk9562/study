---
title: "tanstak-query 적용"
tags: []
date: 2025-03-11
notion_id: 1b3922cf-26a8-80e3-b88e-fed416181147
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-03-11

### 구성

- 페이지 컴포넌트 `Home.jsx`
- api 호출하는 컴포넌트 `apiHome.js`
- 페이지 컴포넌트에 필요한 모든 데이터 관리 로직을 캡슐화한 커스텀 훅 `useHome.js`
<details>
<summary>`apiHome.js` → every api fetching functions</summary>

```javascript
import apiClient from "./apiClient"

export const getUserCoachId = async (user_id) => {
  if (!user_id) return null

  const { data } = await apiClient.get("user_coach_id", {
    params: { user_id },
  })
  return data
}

// 유저 타입 조회 (스토어, 클럽 정보)
export const getUserType = async (userId) => {
  if (!userId) {
    return { userType: 4 }
  }

  const [{ data: store }, { data: club }] = await Promise.all([
    apiClient.get(`/user/getstore/${userId}`),
    apiClient.get(`/user/home/club/${userId}`),
  ])

  let userType
  if (store.store_id && club.club_id) {
    userType = 1
  } else if (store.store_id && !club.club_id) {
    userType = 2
  } else if (!store.store_id && club.club_id) {
    userType = 3
  } else {
    userType = 4
  }

  const storeData = store
    ? {
        store_id: store.store_id,
        store_name: store.store_name,
        bank_name: store.bank,
        bank_owner: store.bank_owner,
        account_num: store.account_num,
        state: store.state,
        lesson_ticket_id: store.lesson_ticket_id,
        payment_amount: store.payment_amount,
        payment_deadline: store.payment_deadline,
      }
    : null

  return {
    userType,
    storeData,
    clubData: club || null,
  }
}

// 오늘의 레슨 정보 조회
export const getTodayLesson = async (userId) => {
  if (!userId) return null

  const { data } = await apiClient.get("/lessoncounts/today", {
    params: { user_id: userId },
  })
  return data
}

// 스토어, 클럽, 게시판 데이터 조회
export const getHomeData = async (key, url, params = {}) => {
  let p = { ...params }
  if (p.store_region === 0 || !p.store_region) {
    delete p.store_region
  }
  const { data } = await apiClient.get(url, { params: p })
  return data || []
}

// 광고 배너 조회
export const getAdBanners = async () => {
  const params = {
    is_enabled: true,
    is_active: true,
    limit: 100,
  }

  const [{ data: topBannerResp }, { data: middleBannerResp }] =
    await Promise.all([
      apiClient.get("/admin/banner", { params }),
      apiClient.get("/admin/banner", { params }),
    ])

  return {
    topBanner: topBannerResp.data,
    middleBanner: middleBannerResp.data,
  }
}

// 푸시 토큰 업데이트
export const updatePushToken = async (userId, token) => {
  if (!token || token.trim() === "" || !userId) {
    console.warn("푸시 토큰이 유효하지 않습니다.")
    return null
  }

  const { data } = await apiClient.put(`/user/${userId}/push-token`, {
    push_token: token,
  })
  return data
}
```


</details>

<details>
<summary>`useHome.js` → Home 컴포넌트에 필요한 모든 **데이터 관리 로직을 캡슐화한 커스텀 훅**</summary>

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "@/utils/AuthProvider"
import { useLocation } from "react-router-dom"
import {
  getUserCoachId,
  getUserType,
  getTodayLesson,
  getHomeData,
  getAdBanners,
  updatePushToken,
} from "@/api/apiHome"

export const homeQueryKeys = {
  userData: "userData",
  coachId: "coachId",
  todayLesson: "todayLesson",
  homeData: "homeData",
  adBanners: "adBanners",
  storeKey: (key) => ["homeData", key],
}

export const useHome = () => {
  const queryClient = useQueryClient()
  const location = useLocation()
  const state = location.state
  const { user: loggedInData } = useAuth()
  const userId = loggedInData?.id
  const userRole = loggedInData?.user_role || 1
  const regionCode = loggedInData?.user_region || 0
  const regionName = loggedInData?.region_name || "전국"

  // 코치 ID
  const { data: coachIdData } = useQuery({
    queryKey: [homeQueryKeys.coachId, userId],
    queryFn: () => getUserCoachId(userId),
    enabled: !!userId,
    onSuccess: (data) => {
      localStorage.setItem("user_coach_id", data?.coach_id)
    },
  })

  // 유저 타입 쿼리 (스토어, 클럽 데이터 포함)
  const { data: userTypeData } = useQuery({
    queryKey: [homeQueryKeys.userData, userId],
    queryFn: () => getUserType(userId),
    enabled: true,
  })

  // 유저 타입 (+ 스토어, 클럽 데이터)
  const { data: todayLessonData } = useQuery({
    queryKey: [homeQueryKeys.todayLesson, userId],
    queryFn: () => getTodayLesson(userId),
    enabled:
      !!userId &&
      (userTypeData?.userType === 1 || userTypeData?.userType === 2),
  })

  // 인기 스토어
  const { data: popularStores } = useQuery({
    queryKey: homeQueryKeys.storeKey("popularStores"),
    queryFn: () =>
      getHomeData("popularStores", "/store/", {
        store_region: regionCode === 0 ? undefined : regionCode,
        sort: "like",
        page: 1,
        limit: 12,
      }),
  })

  // 할인 스토어 쿼리
  const { data: discountedStores } = useQuery({
    queryKey: homeQueryKeys.storeKey("discountedStores"),
    queryFn: () =>
      getHomeData("discountedStores", "/store/stores/coupons", {
        store_region: regionCode === 0 ? undefined : regionCode,
        sort: "distance",
        user_id: userId,
        page: 1,
        limit: 12,
      }),
    enabled: !!userId,
  })

  // 클럽 리크루트 쿼리
  const { data: clubRecruits } = useQuery({
    queryKey: homeQueryKeys.storeKey("clubRecruits"),
    queryFn: () =>
      getHomeData("clubRecruits", "/clublist", {
        type: "club_recruits",
        sort: "recent",
        club_region: regionCode === 0 ? undefined : regionCode,
        page: 1,
        limit: 3,
      }),
  })

  // 스토어 리크루트 쿼리
  const { data: storeRecruits } = useQuery({
    queryKey: homeQueryKeys.storeKey("storeRecruits"),
    queryFn: () =>
      getHomeData("storeRecruits", "/community/recruit/recruitlist", {
        sort: "like",
        region: regionCode === 0 ? undefined : regionCode,
        page: 1,
        limit: 3,
      }),
  })

  // 코치 데이터 쿼리
  const { data: coaches } = useQuery({
    queryKey: homeQueryKeys.storeKey("coaches"),
    queryFn: () =>
      getHomeData("coaches", "/coaches", {
        page: 1,
        limit: 4,
        is_active: true,
        region: regionCode === 0 ? undefined : regionCode,
      }),
  })

  // 광고 배너 쿼리
  const { data: adBanners } = useQuery({
    queryKey: [homeQueryKeys.adBanners],
    queryFn: getAdBanners,
  })

  // 푸시 토큰 뮤테이션
  const pushTokenMutation = useMutation({
    mutationFn: (token) => updatePushToken(userId, token),
    onError: (error) => {
      console.error("푸시 토큰 업데이트 실패:", error)
    },
  })

  // 푸시 토큰 업데이트 (location state에서 토큰을 가져온 경우)
  useEffect(() => {
    if (state?.pushToken && userId) {
      pushTokenMutation.mutate(state.pushToken)
    }
  }, [state, userId])

  useEffect(() => {
    console.log("popularStores", popularStores)
  }, [popularStores])

  // 쿼리 로딩 상태 확인
  const isLoading =
    !userTypeData ||
    (!!userId && !coachIdData) ||
    ((userTypeData?.userType === 1 || userTypeData?.userType === 2) &&
      !todayLessonData) ||
    !popularStores ||
    !clubRecruits ||
    !storeRecruits ||
    !coaches ||
    !adBanners

  return {
    // 유저 정보
    userId,
    userRole,
    regionCode,
    regionName,

    // 유저 타입 정보
    userType: userTypeData?.userType || 4,
    storeData: userTypeData?.storeData || null,
    clubData: userTypeData?.clubData || null,

    // 레슨 정보
    userLessonTicketData: todayLessonData || [],
    userReservationInfos: todayLessonData?.lesson_counts || [],
    totalReservationCount: todayLessonData?.lesson_counts?.length || 0,

    // 홈 데이터
    data: {
      popularStores: popularStores?.stores || [],
      discountedStores: discountedStores || [],
      clubRecruits: clubRecruits?.data || [],
      storeRecruits: storeRecruits || [],
      coaches: coaches?.coaches || [],
    },

    // 광고 데이터
    adBannerData: {
      topBanner: adBanners?.topBanner || [],
      middleBanner: adBanners?.middleBanner || [],
    },

    // 로딩 상태
    isLoading,
  }
}
```


</details>


1. 데이터 페칭과 상태 관리 추상화:
tanstack-query의 useQuery와 useMutation을 사용하여 서버 통신 로직과 상태 관리를 추상화합니다.
데이터 로딩, 에러, 캐싱 상태를 자동으로 관리합니다.

2. 데이터 의존성 관리:
데이터 간의 의존성을 설정하여 필요한 순서대로 데이터를 불러옵니다.
enabled 옵션을 통해 조건부 데이터 로딩을 구현합니다.

3. 데이터 가공 및 통합:
여러 API 응답을 컴포넌트에서 사용하기 좋은 형태로 가공합니다.
널 체크와 기본값 처리를 통해 데이터 안정성을 보장합니다.

4. 상태 로직 분리:
UI 컴포넌트에서 데이터 관리 로직을 분리하여 관심사 분리를 구현합니다.
컴포넌트는 단순히 이 훅에서 제공하는 데이터를 소비하기만 하면 됩니다.

5. 캐시 관리:
tanstack-query의 캐싱 기능을 활용하여 불필요한 네트워크 요청을 방지합니다.
쿼리 키를 체계적으로 관리하여 데이터 무효화와 리패칭을 효율적으로 제어합니다.
