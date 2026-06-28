---
title: "[React + vite] 폴더구조로 route 구성하기"
tags: ["React", "Vite"]
date: 2024-06-11
notion_id: 40a14d73-092d-4e78-9826-430c81e6a1be
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-11

Vite는 import.meta.glob 함수를 이용해 여러 모듈을 한 번에 가져올 수 있는 기능을 지원하고 있다!


[참고] [https://vitejs.dev/guide/features.html#glob-import](https://vitejs.dev/guide/features.html#glob-import)


```javascript
// @/src/App.tsx

const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
```

- pages/ 폴더에 있는 모든 모듈 로드

```javascript
const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
const routes = [];

for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes("$")
    ? fileName.replace("$", ":")
    : fileName.replace(/\/index/, "");

  routes.push({
    path: fileName === "index" ? "/" : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader: pages[path]?.loader,
    action: pages[path]?.action,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  });
}
```


가져온 모듈의 파일명 `ex)index`만 정규표현식으로 가져와서, `$`가 포함되어있으면 `:`로 바꿔서 동적라우팅 처리를 하고, `index`인 경우 빈 경로`''`로 처리를 한다.


그리고 `routes` 배열에

- `path` - 등록하려는 경로
- `Element` - 경로에 할당하려는 React 컴포넌트
- `loader` - 데이터 가져오기 기능 (선택)
- `action` - form data 제출 기능 (선택)
- `ErrorBoundary` - path 오류가 났을 때 처리하는 React 컴포넌트 (선택)

을 넣는다.


### react-router-dom 설치


`npm install react-router-dom`


### 절대경로 구현

<details>
<summary>**[vite.config.js]**</summary>

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/

// __dirname 대체 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});
```


</details>

<details>
<summary>**[jsconfig.json]**</summary>

```javascript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@styles/*": ["./src/styles/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```


</details>


### 폴더 구조 라우팅 구현

<details>
<summary>**[App.jsx]**</summary>

```javascript
import React from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
const routes = [];

for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.jsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes("$")
    ? fileName.replace("$", ":")
    : fileName.replace(/\/index/, "");

  // 페이지 컴포넌트가 제대로 불러와졌는지 확인
  const pageComponent = pages[path].default;
  if (!pageComponent) {
    console.error(
      `Component for path ${path} is not found or not exported correctly.`
    );
    continue;
  }

  routes.push({
    path: fileName === "index" ? "/" : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader: pages[path]?.loader,
    action: pages[path]?.action,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  });
}

console.log("Generated routes:", routes);

if (routes.length === 0) {
  throw new Error("No routes found. Check your page components and paths.");
}

const router = createBrowserRouter(
  routes.map(({ Element, ErrorBoundary, ...rest }) => ({
    ...rest,
    element: <Element />,
    ...(ErrorBoundary && { errorElement: React.createElement(ErrorBoundary) }),
  }))
);
const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
```


</details>

<details>
<summary>**[@/src/index.jsx]**</summary>

```javascript
const Main = () => {
  return (
    <article className="box">
      <h2>??? test</h2>
    </article>
  );
};

export default Main;
```


</details>
