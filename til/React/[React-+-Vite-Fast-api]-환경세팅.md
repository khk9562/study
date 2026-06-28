---
title: "[React + Vite / Fast api] 환경세팅"
tags: ["React", "Vite", "FastAPI"]
date: 2024-06-04
notion_id: b3ac355e-7d67-4a7b-8a43-cf9f932a9527
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-04

### npm create vite@latest 프로젝트명


### cd 프로젝트명

- 프로젝트 폴더 이동

### code .

- vscode 새 창 열어주기

### npm install 

- 라이브러리 설치 → node_modules 폴더 생성

### npm run dev 

- 실행명령어

---


### python —v OR python3 —v

- 파이썬 설치 확인

## 디렉토리 생성


### mkdir fastapi


### cd fastapi

- 원하는 곳에 이도앟여 프로젝트 진행할 디렉터리 생성

## 가상 환경 구성


### python -m venv venv


venv를 생성하는 곳을 venv로 동일하게 o → 동일하지 않아도 무방하지만 많이 사용


### source venv/bin/activate


→ activate가 안될 경우


### source venv/Scripts/activate


### which python

- 가상환경 설치 확인

## Fast api 설치 및 세팅


### pip install fastapi[all]


아래 사항 모두 설치

- [`uvicorn`](http://www.uvicorn.org/) - 애플리케이션을 로드하고 제공하는 서버.
Fast Api는 개발용 내장 서버가 없어서

    서버 이용해서 실행하기 위해서는 Uvicorn 설치

- [`orjson`](https://github.com/ijl/orjson) - `ORJSONResponse`을 사용하려면 필요.
- [`ujson`](https://github.com/esnme/ultrajson) - `UJSONResponse`를 사용하려면 필요.

### **uvicorn main:app --reload
→ main:app을 uvicorn으로 실행하겠다. 
→ reload는 업데이트 등이 일어났을 때 reload하겠다.**


    ## CGI

    - 웹 어플리케이션 서버(WAS)에 동적인 요청 들어오면 처리하고 응답줘야o
    - 서버마다, 형태마다 형태가 다르면 곤란 → 공통 규약(인터페이스)만듦
    - ⇒ Common Gatewqy Interface(CGI)

    ## WSGI

    - Web Server Gateway Interface의 약자
    - CGI의 단점(요청이 들어오면 새로운 프로세스 생성하는 등)을 보완한 방법
    - callable object 등으로 요청 처리
    - 역할마다 WSGI application, WSGI Middleware 등으로 세부적으로 나뉘어 있기도 함

    ## ASGI

    - WSGI는 비동기 처리에 단점이 있음
    - ASGI는 이를 개선하기 위해 만들어진 비동기 서버 게이트웨이 인터페이스(Asynchronous Server Gateway Interface)
    - Uvicorn은 이 ASGI에서 활용됨
