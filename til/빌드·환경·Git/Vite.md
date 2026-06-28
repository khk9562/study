---
title: "Vite"
tags: ["Vite"]
date: 2024-06-10
notion_id: 9951494b-6a43-4726-9934-bfdb94f2ac3e
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-10

### `index.html` 그리고 프로젝트의 루트

- `index.html` 파일이 public 디렉터리가 아니라 프로젝트의 루트에 위치
- 추가적인 번들링 과정 없이 `index.html` 파일이 앱의 진입점이 되게끔 하기 위함
- Vite는 `index.html` 파일을 소스 코드이자 Javascript 모듈 그래프를 구성하는 요소 중 하나로 취급
- `<script type="module" src="...">` 태그를 이용해 JavaScript 소스 코드를 가져온다
- 인라인으로 작성된 `<script type="module">`이나 `<link href>`와 같은 CSS 역시 Vite에서 취급이 가능
- `index.html` 내에 존재하는 URL에 대해 `%PUBLIC_URL%`과 같은 자리 표시자 없이 사용할 수 있도록 URL 베이스를 자동으로 맞춰줍니다

### **NPM을 이용한 디펜던시** **`import`** **그리고 사전 번들링**

- Vite를 통해 ESM 스타일로 [**사전에 번들링 된**](https://ko.vitejs.dev/guide/dep-pre-bundling.html) CommonJS 및 UMD 모듈. 이 과정은 [**Esbuild**](https://esbuild.github.io/)를 통해 이루어지며, JavaScript 기반의 다른 번들러보다 빠른 콜드 스타트가 가능
- `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`와 같이 URL을 이용해 ESM을 지원하는 브라우저에서 모듈을 가져올 수 있도록 `import` 구문을 수정.
- vite는 HTTP 헤더를 이용해 요청한 디펜던시를 브라우저에서 캐싱하도록 합

### **Hot Module Replacement**

- ESM을 통해 HMR API 제공
- HMR 기능이 있는 프레임워크는 API를 활용하여 페이지를 다시 로드하거나 애플리케이션 상태를 날려버리지 않고 즉각적이고 정확한 업데이트를 제공

### CSS

- `.css` 파일을 가져오면 HMR을 지원하는 `<style>` 태그를 통해 페이지에 해당 콘텐츠가 주입
- vite는 `postcss-import`를 이용해 CSS의 `@import`를 처리합니다. 또한, CSS `url()`로 참조되는 모든 리소스들(다른 디렉터리에 존재한다 해도)에 대해 별다른 설정 없이 자동으로 Base를 맞추어주는 재정의(Rebasing) 작업 역시 진행해주고 말이죠.
- CSS Modules → `.module.css` 확장자로 끝나는 모든 CSS 파일들은 [**CSS 모듈 파일**](https://github.com/css-modules/css-modules)로 취급

### **Glob Import**

- vite는 `import.meta.glob` 함수를 이용해 여러 모듈을 한 번에 가져올 수 있도록 지원
- 기본적으로 `import.meta.glob` 함수를 이용하면, 동적(Dynamic) Import를 이용해 파일의 청크를 가져옴

```javascript
const modules = import.meta.glob('./dir/*.js')

// Vite를 통해 변환된 코드
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}

for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

- 동적으로 Import하는 것이 아니라 직접 모듈을 가져오고자 한다면, 두번째 인자로 `{ eager: true }` 객체를 전달

```javascript
const modules = import.meta.glob('./dir/*.js', { eager: true })

// Vite를 통해 변환된 코드
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```


### Glob 패턴 배열

- 첫 번째 인자는 Glob 패턴의 배열로 전달할 수 있습니다.

```javascript
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```


### 네거티브 Glob 패턴

- `!` 접두사를 이용해 네거티브 Glob 패턴도 나타낼 수 O
- Glob 패턴 매칭 결과에서 일부 파일을 무시하고자 하는 경우, 첫 번째 인수에 제외할 네거티브 Glob 패턴을 추가

```javascript
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])

// 아래는 Vite에 의해 생성되는 코드입니다.
const modules = {
  './dir/foo.js': () => import('./dir/foo.js')
}
```


### 커스텀 쿼리


```javascript
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})


// 아래는 Vite에 의해 생성되는 코드입니다:
const moduleStrings = {
  './dir/foo.svg': () => import('./dir/foo.js?raw').then((m) => m['default']),
  './dir/bar.svg': () => import('./dir/bar.js?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/foo.svg': () => import('./dir/foo.js?url').then((m) => m['default']),
  './dir/bar.svg': () => import('./dir/bar.js?url').then((m) => m['default']),
}
```


### Glob Import 유의사항

- Glob 패턴 사용 시, 상대 경로(`./`) 또는 절대 경로(`/`) 또는 [**`resolve.alias`**](https://ko.vitejs.dev/config/shared-options.html#resolve-alias)[ **옵션**](https://ko.vitejs.dev/config/shared-options.html#resolve-alias)을 통해 별칭으로 지정된 경로 만을 이용
- Glob 패턴 매칭은 [**`fast-glob`**](https://github.com/mrmlnc/fast-glob)을 이용
- `import.meta.glob`으로 전달되는 모든 인자는 **리터럴 값을 전달해야 합니다**. 변수나 표현식을 사용할 수 없습니다.

### 동적 Import

- 변수를 사용한 동적인 Import 지원

```javascript
const module = await import(`./dir/${file}.js`)
```

- 변수 `file`은 깊이가 1인 파일에 대해서만 나타낼 수 있습니다. 가령 `file`이 `foo/bar`인 경우에는 Import가 실패함.

### **Preload Directives Generation**

- vite는 빌드 시 Direct Import 구문에 대해 `<link ref="modulepreload">` 디렉티브를 이용해 미리 모듈을 캐싱하도록 자동으로 변환합니다. 덕분에 해당 모듈을 필요로 하는 경우 이를 바로 사용할 수 있게 됩니다.

### **Async Chunk Loading Optimization**

- 빌드 시, 때때로 Rollup은 "공통(Common)" 청크 파일을 생성합니다. 보통 두 개 이상의 모듈에서 공유되는 청크가 이러한데, 이를 Dynamic Import를 이용해 불러오는 경우 다음과 같은 상황이 발생
- 최적화되지 않은 경우, 먼저 비동기적으로 `A` 청크가 불러와지게 되고, `A` 청크가 모두 파싱된 후에서야 `C` 청크가 필요하다는 사실을 알게 되기에 다음과 같은 네트워크 왕복이 필요합니다.
`Entry ---> A ---> C`
- vite는 Preload 스텝을 이용해 `A`를 가져올 때 `C` 청크를 **병렬적(Parallel)으로** 가져올 수 있도록 Dynamic Import 구문을 자동으로 재작성합니다.
`Entry ---> (A + C)`
vite는 모든 Direct Import 구문에 대해 Preload 하도록 함으로써, 쓸 데 없이 낭비되는 네트워크 왕복을 줄이도록 구성합니다.

### **플러그인 순서 정하기**

- `pre` : VIte의 코어 플러그인보다 먼저 실행
- `default` : VIte의 코어 플러그인 이후에 실행
- `post` : Vite의 빌드 플러그인 이후 실행

### 조건부 플러그인

- 기본적으로 플러그인은 개발 서버(’`serve`’)와 빌드(’`build`’)시 모두 동작
- 조건부로 동작 원하면 apply 프로퍼티를 이용해 ‘`build`’ 또는 ‘`serve`’ 중에만 플러그인이 동작하도록 할 수 o
