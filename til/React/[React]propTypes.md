---
title: "[React]propTypes"
tags: ["React"]
date: 2024-06-11
notion_id: 131ac3a5-55ba-4fd9-9e60-02ee5d9cf7da
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-11

### propTypes를 통한 props 검증

- 컴포넌트의 필수 props를 지정하거나 props의 타입(type)을 지정할 때는 propTypes를 사용한다.
- 컴포넌트의 propTypes를 지정하는 방법은 defaultProp을 설정하는 것과 비슷하다.
- 우선 propTypes를 사용하려면 코드 상단에 import로 불러오기.

```javascript
import React from "react";
import PropTypes from "prop-types";

const MyComponent = (props) => {
	return();
}

MyComponent.propTypes = {
	name: PropTypes.string
}

export default MyComponent;
```

- 이렇게 설정해주면 name 값은 무조건 문자열 형태로 전달해야 된다는 것.

[link_preview](https://github.com/facebook/prop-types)
