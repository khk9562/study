---
title: "Nginx + proxy + origin + CORS"
tags: []
date: 2024-06-14
notion_id: 8e409258-820e-4de1-9e88-6d22d486fc55
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-14

# CORS


### ⇒ Cross Origin Resource Sharing
     (교차 출처 리소스 공유)


추가 HTTP 헤더를 사용하여, 한 출처에서 실행 중인 웹 애플리케이션이 다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 브라우저에 알려주는 체제.

- React에서 외부 api로 요청을 보내는 경우, CORS 에러가 뜸.
- 서로 다른 출처 간에 자원을 공유하는 것
- 기본적으로 브라우저는 동일 출처 정책 (Same Origin Policy)을 따름.
즉, 서로 다른 도메인에서 자원을 공유하는 것을 금지함.
즉, 프론트엔드에서 html, css, js 등 정적 파일을 받고, 백엔드에서 데이터를 받아오는 경우 동일 출처 정책을 위반하게 되고 CORS 에러가 뜬다.
- 이 에러를 해결하기 위해서는 프록시 서버를 구축해야한다.

# Proxy

- 요청을 중계하는 컴퓨터, 혹은 프로그램.
- 프록시 서버를 사용하면 브라우저와 서버 사이에서 요청을 중계해줌.
- 브라우저는 모든 요청과 응답을 프록시 서버를 통해서만 주고 받고, 프록시 서버가 브라우저를 대신해서 서버와 통신.

*(이미지 생략)*

- 즉, Proxy 설정을 통해 프론트엔드 요청과 백엔드 요청을 프록시 서버로 받으면 브라우저는 동일 출처로 보고 CORS 에러를 띄우지 않는 것이다.

# 개발용 Proxy 설정

- 개발 단계에서는 직접 서버를 새로 구축할 필요 없이 리액트 내에서 간단히 해결 가능. 방법은 두가지.

**[package.json]**


```python
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    ...
  },
  "scripts": {
    ...
  },
  "eslintConfig": {
    ...
  },
  "browserslist": {
    ...
  },
  
"proxy": "http://<ip주소>:5000"
 // 사용하는 백엔드 주소
}
```


→ 이제 프록시 설정을 통해 도메인이 적용되기 때문에, 리액트에서는 도메인 이하 uri만 작성해서 요청을 보내면 됨.
`const response = await axios.get(`/test`);`


## [**http-proxy-middleware**](https://www.npmjs.com/package/http-proxy-middleware)

- `npm i http-proxy-middleware`
- `/src/setUpProxy.js` 파일 작성
    - 다수의 api를 사용하는 경우 다음과 같이 uri를 통해 라우팅 하듯이 프록시를 설정해줄 수 있다.

    ```python
    const { createProxyMiddleware } = require("http-proxy-middleware");
    
    module.exports = function (app) {
      app.use(
        "/api1",
        createProxyMiddleware({
          target: "http://<domain>:<portNum>",
          changeOrigin: true,
        })
      );
      app.use(
        "/api2",
        createProxyMiddleware({
          target: "http://<domain>:<portNum>",
          changeOrigin: true,
        })
      );
    };
    ```


# **배포용 Proxy 설정**

- 웹서버로 Nginx를 사용 중이라면, reverse proxy 지원
- `Nginx.conf`

    ```python
    upstream App1 {
        server app1:5000;
    }
    upstream App2 {
        server app2:7000;
    }
    
    server {
        listen 80;
        location /api1 {
            rewrite /api1/(.*) /$1 break; // `/api1` -> 빈 문자열
            proxy_pass http://App1;
        }
        location /api2 {
            rewrite /api2/(.*) /$1 break; // `/api2` -> 빈 문자열
            proxy_pass http://App2;
        }
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
    }
    ```


# Nginx 설정


**[/etc/nginx/conf.d/default.conf]**


```python
server {
    server_name api.booklog.dev;

    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, PATCH, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 86400;
            return 204;
        }
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Content-Type' 'application/json' always;
        proxy_pass http://localhost:3000/;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.booklog.dev/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.booklog.dev/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

- Content-Type이 application/json인 경우 실제 요청을 전송하기 전 OPTIONS 메서드를 이용하여 요청이 안전한지 확인.
⇒ 사전 요청(Preflighted Request)이라고 함.
- 사전 요청에 관해서는 204 No Content를 반환하는 것을 권장
- 백엔드 API의 일부 요청에 Bearer 토큰을 이용한 인증을 요구함으로 Authorization 헤더도 허용하도록 설정
- always 설정을 하여 실패한 요청에도 CORS 설정을 해줌
- 설정을 마친 후 `nginx -t` 명령어를 사용하여 설정 파일이 정상적인지 체크 후 `nginx -s reload` 명령어로 nginx 서버를 재구동.

# Origin

- Origin request 헤더는 fetch가 시작되는 위치.
- 경로 정보는 포함하지 않고 서버 이름만 포함

### 문법


```plain text
Origin: null
Origin: <scheme> "://" <hostname> [ ":" <port> ]
```


→ 예제 : `Origin: https://developer.mozilla.org`


### 지시


[`<scheme>`](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Origin#scheme)

- 사용하는 프로토콜. 일반적으로 HTTP 프로토콜 혹은 보안 버전인 HTTPS를 사용합니다.

[`<hostname>`](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Origin#hostname)

- 서버(가상 호스팅)의 이름 또는 IP 입니다.

[`<port>`](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Origin#port)[ ](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Origin#port)Optional

- 서버와 연결을 맺기 위한 TCP 포트 번호. 포트번호를 입력하지 않으면, 요청한 서비스의 기본 포트(HTTP의 경우 "80")가 사용됩니다.

## 프리플라이트 요청

- “preflighted” request는 위에서 논의한 “simple requests”와는 달리, 먼저 OPTIONS 메서드를 통해 다른 도메인의 리소스로 HTTP 요청을 보내 실제 요청이 전송하기에 안전한지 확인
- cross-origin 요청은 유저 데이터에 영향을 줄 수 있기 때문에 이와같이 미리 전송(preflighted)함
- 예제

```plain text
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://bar.other/resources/post-here/');
xhr.setRequestHeader('Ping-Other', 'pingpong');
xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.onreadystatechange = handler;
xhr.send('<person><name>Arun</name></person>');
```
