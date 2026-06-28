---
title: "PageLayout의 페이지 header, nav 컨트롤 방법"
tags: []
date: 2025-01-16
notion_id: 17d922cf-26a8-8047-b416-d4acde4b5fc7
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-01-16

PageLayout 마다 헤더, 버튼이 ui 요소가 대부분 동일해서 일일이 복붙말고 다르게 처리해봄


### 컨트롤 가능 사항


**헤더**

- 제목, 스타일

**하단 네비**

- 존재 여부
- 버튼들
- 각 버튼 이름
- 각 버튼 스타일
- 각 버튼 비활성화
- 각 버튼 클릭 함수
<details>
<summary>src/layout/page/PageLayout.jsx</summary>

```javascript
import LoadingOverlay from '@/components/utils/LoadingOverlay';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './PageLayout.module.css';
import NavInnerTwoBtns from '../nav/NavInnerTwoBtns';
import HeaderWithBack from '../header/HeaderWithBack';
import { usePageLayout } from '@/hooks/contexts/usePageLayout';

export default function PageLayout() {
  const { layoutConfig } = usePageLayout();
  const { header, nav } = layoutConfig;

  return (
    <div className={styles.container}>
      <Suspense fallback={LoadingOverlay}>
        <HeaderWithBack title={header?.title} style={header?.style} />
        <main className={`main`}>
          <Outlet />
        </main>
        {nav?.show && (
          <NavInnerTwoBtns>
            {nav?.buttons.map((btn, index) => (
              <button
                key={index}
                type="button"
                onClick={btn.onClick}
                disabled={btn.disabled}
                style={btn.style}
              >
                {btn.text}
              </button>
            ))}
          </NavInnerTwoBtns>
        )}
        {/* <Footer /> */}
      </Suspense>
    </div>
  );
}
```


</details>

<details>
<summary>src/hooks/contexts/PageLayoutContext.jsx</summary>

```javascript
import { createContext, useContext, useState } from 'react';

export const PageLayoutContext = createContext();

export const PageLayoutProvider = ({ children }) => {
  const [layoutConfig, setLayoutConfig] = useState({
    header: {
      title: '',
      style: {},
    },
    nav: {
      show: true,
      buttons: [
        {
          text: '',
          disabled: false,
          style: {},
          onClick: () => {},
        },
        {
          text: '',
          disabled: false,
          style: {},
          onClick: () => {},
        },
      ],
    },
  });

  return (
    <PageLayoutContext.Provider value={{ layoutConfig, setLayoutConfig }}>
      {children}
    </PageLayoutContext.Provider>
  );
};
```


</details>

<details>
<summary>src/hooks/contexts/usePageLayout.js</summary>

```javascript
import { useContext } from 'react';
import { PageLayoutContext } from './PageLayoutContext';

export const usePageLayout = () => {
  const context = useContext(PageLayoutContext);
  if (!context) {
    throw new Error('usePageLayout must be used within a HeaderProvider');
  }
  return context;
};
```


</details>

<details>
<summary>src/hooks/contexts/layoutUtils.js</summary>

버튼 disabled 로직이 함수로 동적으로 변화하는 용도로 필요.


그 밖에 동적인 함수 변환 가능


```javascript
export const updateNavButtonState = (setLayoutConfig, buttonIndex, updates) => {
  setLayoutConfig((prev) => ({
    ...prev,
    nav: {
      ...prev.nav,
      buttons: prev.nav.buttons.map((button, index) =>
        index === buttonIndex ? { ...button, ...updates } : button
      ),
    },
  }));
};
```


</details>

<details>
<summary>**`사용 방법`**</summary>

src/pages/Auth/Withdraw


```javascript
import { usePageLayout } from '@/hooks/contexts/usePageLayout';

const Withdraw = () => {
  const { setLayoutConfig } = usePageLayout();
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [detailReason, setDetailReason] = useState('');

  const isButtonDisabled = () => {
    if (selectedReason === '기타') {
      return !detailReason.trim();
    }
    return !selectedReason;
  };
  
  useEffect(() => {
    setLayoutConfig({
      header: {
        title: '회원 탈퇴',
        style: { backgroundColor: '#fff' },
      },
      nav: {
        show: true,
        buttons: [
          {
            text: '취소',
            style: { flex: 1 },
            onClick: () => navigate(-1),
          },
          {
            text: '다음',
            onClick: handleNext,
            disabled: isButtonDisabled(),
          },
        ],
      },
    });
  }, []);

  useEffect(() => {
    if (selectedReason != '기타') {
      setDetailReason('');
    }
  }, [selectedReason]);

  useEffect(() => {
    updateNavButtonState(setLayoutConfig, 1, { disabled: isButtonDisabled() });
  }, [selectedReason, detailReason]);
```


</details>
