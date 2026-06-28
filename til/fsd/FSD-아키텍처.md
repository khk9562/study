---
title: "FSD 아키텍처"
tags: ["fsd", "architecture"]
date: 2025-11-16
notion_id: 2ad922cf-26a8-8012-8282-f67cb2acc52d
notion_last_edited: 2026-06-28T08:29:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-11-16

```markdown
# FSD 아키텍처 가이드

> Feature-Sliced Design 아키텍처 원칙 및 참조 방향 가이드

## 목차

1. [FSD란?](#fsd란)
2. [계층 구조](#계층-구조)
3. [의존성 규칙](#의존성-규칙)
4. [현재 프로젝트 구조](#현재-프로젝트-구조)
5. [올바른 참조 패턴](#올바른-참조-패턴)
6. [위반 사례 및 수정 방법](#위반-사례-및-수정-방법)
7. [ESLint 규칙](#eslint-규칙)

---

## FSD란?

**Feature-Sliced Design (FSD)**는 프론트엔드 애플리케이션을 계층(layer)과 슬라이스(slice)로 구조화하는 아키텍처 방법론입니다.

### 핵심 원칙

1. **단방향 의존성**: 상위 레이어는 하위 레이어를 import할 수 있지만, **하위 레이어는 상위 레이어를 절대 import하면 안 됩니다**.
2. **계층 분리**: 각 레이어는 명확한 책임을 가지며, 레이어 간 경계가 명확해야 합니다.
3. **모듈 독립성**: 같은 레벨의 슬라이스는 서로 독립적이어야 합니다.

---

## 계층 구조

FSD는 다음과 같은 계층 구조를 권장합니다 (고수준 → 저수준):

```
┌─────────────────────────────────────┐
│  App (앱 초기화, 라우팅)              │  ← 최상위 레이어
├─────────────────────────────────────┤
│  Processes (복잡한 비즈니스 프로세스)  │
├─────────────────────────────────────┤
│  Pages (페이지 컴포넌트)              │
├─────────────────────────────────────┤
│  Widgets (복잡한 UI 블록)             │
├─────────────────────────────────────┤
│  Features (비즈니스 로직)             │
├─────────────────────────────────────┤
│  Entities (도메인 엔티티)             │
├─────────────────────────────────────┤
│  Shared (공유 유틸리티, 컴포넌트)      │  ← 최하위 레이어
└─────────────────────────────────────┘
```

### 의존성 방향

```
App → Processes → Pages → Widgets → Features → Entities → Shared
  ↓       ↓         ↓        ↓         ↓          ↓         ↓
[하위 레이어로만 import 가능]
```

---

## 의존성 규칙

### ✅ 허용되는 참조

- **하향 참조**: 상위 레이어 → 하위 레이어
  ```typescript
  // ✅ Widget이 Feature를 import (허용)
  import { formatDateTime } from '@features/date.features';

  // ✅ Feature가 Shared를 import (허용)
  import { convertComma } from '@shared/convert.shared';

  // ✅ Page가 Widget을 import (허용)
  import BorderFrame from '@widgets/BorderFrame';
  ```

### ❌ 금지되는 참조

- **상향 참조**: 하위 레이어 → 상위 레이어
  ```typescript
  // ❌ Hook이 Widget을 import (위반)
  import Skeleton from '@widgets/components/feedback/Skeleton';

  // ❌ Feature가 Hook을 import (위반)
  import { useMeta } from '../hooks/api/useMeta';

  // ❌ Constant가 Widget을 import (위반)
  import { OptionProps } from '@/app/src/client/widgets/components/form/SelectBox';
  ```

---

## 현재 프로젝트 구조

### 디렉토리 매핑

현재 프로젝트를 FSD 계층에 매핑하면:

```
app/
├── (client)/               → Pages Layer
│   ├── dashboard/
│   ├── devices/
│   └── personal/
│
└── src/
    ├── client/
    │   ├── widgets/        → Widgets Layer
    │   ├── features/       → Features Layer
    │   ├── hooks/          → Cross-cutting (중간 레이어)
    │   ├── store/          → Cross-cutting (중간 레이어)
    │   ├── proxy/          → Infrastructure (하위 레이어)
    │   ├── utils/          → Shared Layer
    │   └── classes/        → Shared Layer
    │
    ├── shared/             → Shared Layer (최하위)
    └── constant/           → Shared Layer (최하위)
```

### 레이어별 책임

| 레이어 | 디렉토리 | 책임 | Import 가능 레이어 |
|--------|----------|------|-------------------|
| **Pages** | `app/(client)/*` | 페이지 구성 | Widgets, Features, Hooks, Shared |
| **Widgets** | `src/client/widgets/` | 재사용 가능한 UI 블록 | Features, Proxy, Shared |
| **Features** | `src/client/features/` | 비즈니스 로직 | Proxy, Shared |
| **Hooks** | `src/client/hooks/` | React 훅 (로직만) | Features, Proxy, Store, Shared |
| **Store** | `src/client/store/` | 전역 상태 관리 | Features (제한적), Shared |
| **Proxy** | `src/client/proxy/` | API 추상화 | Shared만 |
| **Shared** | `src/shared/`, `src/constant/` | 순수 유틸리티 | Shared 내부만 |

---

## 올바른 참조 패턴

### 1. Widget → Feature → Shared (✅ 올바름)

```typescript
// app/src/client/widgets/popup/deivcesDetail/nas/NasPopup.tsx
import { convertToLocalTime } from '@/app/src/client/features/date.features';
import { flattenObject } from '@/app/src/shared/object.shared';

// ✅ Widget이 하위 레이어(Feature, Shared)를 참조
```

### 2. Feature → Shared (✅ 올바름)

```typescript
// app/src/client/features/sanPerformance.features.ts
import { convertComma, roundTo7 } from '../../shared/convert.shared';

// ✅ Feature가 하위 레이어(Shared)를 참조
```

### 3. Hook → Proxy, Store (✅ 올바름)

```typescript
// app/src/client/hooks/useStorageDeviceSSE.ts
import { getClientId } from '@/app/src/client/features/auth.features';
import { useDataStore } from '@store/useDataStore';

// ✅ Hook이 동등/하위 레이어를 참조
```

### 4. Page → Widget (✅ 올바름)

```typescript
// app/(client)/personal/profile/page.tsx
import BorderFrame from '@/app/src/client/widgets/BorderFrame';
import ProfileForm from '@widgets/form/ProfileForm';

// ✅ Page가 하위 레이어(Widget)를 참조
```

---

## 위반 사례 및 수정 방법

### 위반 사례 1: Hook이 Widget을 import

**현재 코드** (`app/src/client/hooks/useLifecycleState.ts`):

```typescript
// ❌ 위반: Hook이 상위 레이어인 Widget을 import
import { useState, useEffect } from 'react';
import Skeleton from '@widgets/components/feedback/Skeleton';

export function useLifecycleState() {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return {
    isMounted,
    isLoading,
    isInitialized,
    setIsInitialized,
    setIsLoading,
    Skeleton,  // ❌ UI 컴포넌트를 Hook에서 return하면 안 됨
  };
}
```

**문제점:**
- Hook은 **순수 로직**만 담당해야 하는데 UI 컴포넌트를 의존하고 있음
- Hook이 Widget(상위 레이어)을 참조하여 **상향 의존성 위반**

**수정 방법:**

```typescript
// ✅ 수정: Skeleton import 제거
import { useState, useEffect } from 'react';

export function useLifecycleState() {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return {
    isMounted,
    isLoading,
    isInitialized,
    setIsInitialized,
    setIsLoading,
    // Skeleton 제거 - 사용처에서 직접 import하도록 변경
  };
}
```

**사용처 수정:**

```typescript
// ✅ 컴포넌트에서 직접 import
import { useLifecycleState } from '@hooks/useLifecycleState';
import Skeleton from '@widgets/components/feedback/Skeleton';

function MyComponent() {
  const { isLoading } = useLifecycleState();

  if (isLoading) {
    return <Skeleton />;  // 직접 사용
  }

  return <div>Content</div>;
}
```

---

### 위반 사례 2: Constant가 Widget 타입을 import

**현재 코드** (`app/src/constant/alalrmCustomSetting.ts:1`):

```typescript
// ❌ 위반: Constant(최하위)가 Widget(상위)의 타입을 import
import { OptionProps as SelectOption } from '@/app/src/client/widgets/components/form/SelectBox';

export const DEVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'STORAGE', text: 'Storage' },
  { value: 'SERVER', text: 'Server' },
  { value: 'SAN_SWITCH', text: 'SAN Switch' },
];
```

**문제점:**
- Constant는 **최하위 레이어**인데 Widget을 참조하여 **상향 의존성 위반**
- 타입 정의가 UI 컴포넌트에 종속됨

**수정 방법 1: Shared 레이어에 타입 정의**

```typescript
// ✅ app/src/shared/types/option.types.ts (새 파일)
export interface OptionProps {
  value: string;
  text: string;
}
```

```typescript
// ✅ app/src/constant/alalrmCustomSetting.ts (수정)
import type { OptionProps as SelectOption } from '@/app/src/shared/types/option.types';

export const DEVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'STORAGE', text: 'Storage' },
  { value: 'SERVER', text: 'Server' },
  { value: 'SAN_SWITCH', text: 'SAN Switch' },
];
```

```typescript
// ✅ app/src/client/widgets/components/form/SelectBox.tsx (수정)
import type { OptionProps } from '@/app/src/shared/types/option.types';

export type { OptionProps }; // re-export

interface SelectBoxProps {
  options: OptionProps[];
  // ...
}

export default function SelectBox({ options }: SelectBoxProps) {
  // ...
}
```

**수정 방법 2: Constant에 자체 타입 정의**

```typescript
// ✅ app/src/constant/alalrmCustomSetting.ts (수정)
// Widget import 제거하고 자체 타입 정의
interface SelectOption {
  value: string;
  text: string;
}

export const DEVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'STORAGE', text: 'Storage' },
  { value: 'SERVER', text: 'Server' },
  { value: 'SAN_SWITCH', text: 'SAN Switch' },
];
```

**권장:** 수정 방법 1 (타입을 Shared로 이동) - 재사용성과 일관성 향상

---

### 위반 사례 3: Feature가 Hook을 import

**현재 코드** (`app/src/client/features/sanTableColumns.features.ts:3`):

```typescript
// ❌ 위반: Feature가 Hook을 import
import { useMeta } from '../hooks/api/useMeta';

const getTableColumns = (item: string, unit: string) => {
  // useMeta hook을 사용하려고 했으나, Feature는 hook을 호출할 수 없음
  // ...
};

export const getSanTableColumns = (item: string, unit: string) => {
  const baseColumns = getBaseColumns();
  let itemColumns = getTableColumns(item, unit);
  return [...baseColumns, ...itemColumns];
};
```

**문제점:**
- Feature는 **순수 비즈니스 로직**이어야 하는데 React Hook을 의존
- Hook은 React 컴포넌트/Hook에서만 사용 가능한데, Feature 함수에서는 사용 불가
- Feature가 Hook을 참조하여 **계층 혼란** 발생

**수정 방법 1: Hook으로 변환**

```typescript
// ✅ app/src/client/hooks/useSanTableColumns.ts (새 파일)
import { useMeta } from './api/useMeta';

export function useSanTableColumns(item: string, unit: string) {
  const meta = useMeta(); // Hook 내부에서 Hook 호출 가능

  const baseColumns = [
    {
      headerName: '시간',
      field: 'time',
      width: 190,
      cellStyle: { textAlign: 'center' },
    },
    // ...
  ];

  const itemColumns = getItemColumns(item, unit, meta);

  return [...baseColumns, ...itemColumns];
}

// 순수 함수로 분리
function getItemColumns(item: string, unit: string, meta: any) {
  // ... 기존 로직
}
```

**수정 방법 2: Proxy를 직접 사용**

```typescript
// ✅ app/src/client/features/sanTableColumns.features.ts (수정)
// useMeta hook 대신 proxy를 직접 사용
import { fetchMeta } from '../proxy/api/metaProxy';

export const getSanTableColumns = async (item: string, unit: string) => {
  // Hook 대신 직접 API 호출
  const meta = await fetchMeta();

  const baseColumns = getBaseColumns();
  const itemColumns = getTableColumns(item, unit, meta);

  return [...baseColumns, ...itemColumns];
};
```

**수정 방법 3: 매개변수로 받기**

```typescript
// ✅ app/src/client/features/sanTableColumns.features.ts (수정)
// useMeta 결과를 외부에서 주입받기
export const getSanTableColumns = (item: string, unit: string, meta?: any) => {
  const baseColumns = getBaseColumns();
  const itemColumns = getTableColumns(item, unit, meta);

  return [...baseColumns, ...itemColumns];
};
```

```typescript
// ✅ 사용처 (컴포넌트)
import { useMeta } from '@hooks/api/useMeta';
import { getSanTableColumns } from '@features/sanTableColumns.features';

function SanTable() {
  const meta = useMeta();
  const columns = getSanTableColumns('portTx', 'KB', meta);

  return <AgGridReact columnDefs={columns} />;
}
```

**권장:** 현재 코드가 실제로 `useMeta`를 사용하지 않는다면 **import만 제거**, 사용한다면 **수정 방법 3** (의존성 주입) 권장

---

## ESLint 규칙

### 권장 ESLint 설정

프로젝트에 다음 ESLint 규칙을 추가하여 FSD 위반을 자동으로 검출할 수 있습니다:

```javascript
// .eslintrc.js 또는 eslint.config.js

module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // 1. Hook이 Widget을 import하는 것 금지
          {
            group: ['**/widgets/**'],
            importNames: ['*'],
            message: '❌ Hooks cannot import from Widgets (upward dependency violation)',
          },

          // 2. Feature가 Hook을 import하는 것 금지
          {
            group: ['**/features/**'],
            importNames: ['use*'], // use로 시작하는 hook
            message: '❌ Features cannot import hooks (should use proxy or dependency injection)',
          },

          // 3. Shared/Constant가 상위 레이어를 import하는 것 금지
          {
            group: ['**/shared/**', '**/constant/**'],
            importNames: ['**/widgets/**', '**/features/**', '**/hooks/**'],
            message: '❌ Shared/Constant layers cannot import from higher layers',
          },

          // 4. Proxy가 Feature를 import하는 것 금지
          {
            group: ['**/proxy/**'],
            importNames: ['**/features/**'],
            message: '❌ Proxy should be pure API abstraction (cannot depend on features)',
          },
        ],
      },
    ],
  },
};
```

### 검증 명령어

```bash
# ESLint 실행하여 위반 검출
npm run lint

# 자동 수정 가능한 항목 수정
npm run lint -- --fix
```

---

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD 예제 프로젝트](https://github.com/feature-sliced/examples)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 요약

### ✅ 핵심 원칙

1. **하향 의존성만 허용**: 상위 → 하위로만 import
2. **계층 분리**: 각 레이어는 명확한 책임 보유
3. **순수성 유지**:
   - Features = 순수 비즈니스 로직 (Hook 사용 ❌)
   - Hooks = 순수 React 로직 (UI 컴포넌트 사용 ❌)
   - Shared = 순수 유틸리티 (상위 레이어 참조 ❌)

### 🛠️ 위반 수정 우선순위

| 우선순위 | 파일 | 수정 방법 |
|---------|------|----------|
| 🔴 높음 | `hooks/useLifecycleState.ts` | Skeleton import 제거 |
| 🔴 높음 | `constant/alalrmCustomSetting.ts` | 타입을 Shared로 이동 |
| 🟡 중간 | `features/sanTableColumns.features.ts` | useMeta를 매개변수로 받기 |

### 📊 현재 상태

- **FSD 준수율**: 약 95%
- **주요 위반**: 3건 (상향 참조)
- **개선 후 예상 준수율**: 99%+

이 가이드를 따르면 **확장 가능하고 유지보수하기 쉬운** 아키텍처를 유지할 수 있습니다.
```
