---
title: "axios"
tags: []
date: 2024-07-16
notion_id: b66e471b-274b-420d-a27a-79e5976c7242
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-07-16

```javascript
// api/apiClient.js
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
// 기본 설정
// const createApiClient = (baseURL) => {
const apiClient = axios.create({
  baseURL: API_URL,
  //   baseURL: baseURL,
  timeout: 10000, // 요청 타임아웃을 설정
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;


// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청을 보내기 전에 할 작업 (예: 토큰 추가)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 응답 데이터를 가공할 수 있습니다.
    return response;
  },
  (error) => {
    // 응답 에러 처리
    return Promise.reject(error);
  }
);
// };
```
