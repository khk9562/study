---
title: "[CSS] image loading: lazy vs eager"
tags: ["CSS"]
date: 2024-06-24
notion_id: 3c7257ba-651a-43d1-99a3-c221ffd9d755
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-24

## Lazy Loading

- 시스템 리소스를 보존하고 전반적인 속도와 성능을 개선하기 위해 필요한 페이지 에셋만 필요 시 로드하는 작업.
- 이미지의 경우, lazy loading이란 즉시 필요하지 않은 이미지는 호출될 때까지 로드되지 않는다는 것.

## Eager Loading

- 한 페이지에 있는 모든 에셋을 한꺼번에 강제로 로드하는 동작

### 메인 이미지 슬라이더 첫 이미지만 eager 처리하고 나머지는 lazy


```python
<img
  src={item.download_url}
  alt={item.title || `메인 슬라이더 이미지${index}`}
  className={styles.img}
  loading={index == 0 ? "eager" : "lazy"}
/>
```
