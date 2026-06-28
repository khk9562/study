---
title: "[React] react-hook-form"
tags: []
date: 2024-07-05
notion_id: 19879674-e32a-4357-ae39-65e7880b7575
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-07-05

```javascript
import React from 'react';
import { useForm } from 'react-hook-form';

const SignupForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // 서버에 데이터 전송 로직 구현
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          {...register('name', { required: '이름을 입력해주세요.' })}
        />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: '이메일을 입력해주세요.',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '유효한 이메일 주소를 입력해주세요.',
            },
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            minLength: {
              value: 8,
              message: '비밀번호는 최소 8자 이상이어야 합니다.',
            },
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <button type="submit">회원가입</button>
    </form>
  );
};

export default SignupForm;
```
