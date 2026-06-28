---
title: "[React] App.css VS index.css"
tags: ["React"]
date: 2024-06-18
notion_id: 79b634cb-2599-4f9f-a4ec-401b76aed32f
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-18

## App.js

- 프로젝트 진행 시 서버 설정 / 미들웨어 정의 / 라우트 정의 / 인증 등 여러가지 설정
- 주로 컴포넌트를 App.js에 연결.
- This is the main component of your React application. It contains the structure and logic for your app’s user interface. You can define the layout, components, and functionality within this file.
- 

## index.js

- App의 상위 파일
- index.html과 연결하여 화면에 렌더링을 하는 역할
- App.js를 index.js에 import 해서 index.html과 연결.
- 즉 여기에 직접 화면 구현을 위한 코드를 짤 일이 많지 않음.
- This is the entry point of your React application. It is responsible for rendering the root component (App.js) and attaching it to the HTML document. It sets up the React DOM and provides the initial rendering of your app.

## App.css

- This file contains the CSS styles specific to the App.js component. It allows you to style the elements and apply visual formatting to your app.

## index.css

- This contains global CSS styles that apply to the entire application. It allows you to define styles that should be applied globally, affecting all components within the app.
