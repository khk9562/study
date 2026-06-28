---
title: "[CSS] 스크롤 안보이게"
tags: ["CSS"]
date: 2024-07-08
notion_id: a1e3846e-a375-4143-9db6-8194bd8c8117
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-07-08

```css
/* overflow-y: scroll; */
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
```
