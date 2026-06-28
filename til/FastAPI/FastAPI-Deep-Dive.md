---
title: "FastAPI Deep Dive"
tags: ["FastAPI"]
date: 2024-06-11
notion_id: 653925cf-da7e-4a96-8bbf-ee86bfe84af7
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-11

- `django` : 풀스택프레임워크
RDBMS와 상호접근 ORM
- `Flask` : 마이크로 프레임워크
DB ORM 지원안돼서 SQLAlchemy와 같은 패키지 사용
- `FastAPI`

# FastAPI

- 파이썬 기반의 웹 프레임워크

### uvicorn

- ASGI 서버
(Asynchronous Server Gateway Interface)
⇒ 비동기 파이썬 웹서버

*(이미지 생략)*


WSGI 와 다르게 매개변수가 3개

- `scope`
- `send` : 어플리케이션이 클라이언트로 메세지를 돌려보낼 수 있게 해주는 어싱크 콜러블
- `receive` : 메세지를 수신할 수 있게 해주는 어싱크 콜러블

⇒ ASGI의 가장 큰 특징은 함수 전반에서 이 비동기 메타포를 사용한다는 점


### `uvloop` : uvicorn의 핵심 모듈


*(이미지 생략)*

- `Asynio` : 파이썬 표준 라이브러리와 함께 제공되는 비동기 Io 프레임워크
→ async await 를 사용해서 비동기 코드를 작성하는 데 사용되는 라이브러리
→ 대규모 아이오 처리, 복잡하게 설계된 서버구조에 적합
- `uvloop`는 이 Asynio를 대체하기 위해 만들어짐

### Pydantic

- 파이썬에서 다루는 어노테이션을 사용해서 데이터를 검증하고 타입 힌트를 주는 라이브러리
- 데이터 유효성 검증
- 데이터 파싱

*(이미지 생략)*


### Deployent Concept


*(이미지 생략)*
