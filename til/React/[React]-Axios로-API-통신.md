---
title: "[React] Axios로 API 통신"
tags: ["React"]
date: 2024-06-11
notion_id: f1faf390-bcf9-4cd6-8282-433cc1b12d29
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-11

# Axios

- Node.js와 브라우저를 위한 Promise 기반 HTTP 비동기 통신 라이브러리
- 비동기로 HTTP 통신을 가능하게 해주고, REST API에 데이터를 요청할 떄, promise 객체로 return 해주기 때문에 response 데이터를 다루기 쉽다
- 요청(Request), 응답(Reply)을 JSON 형태로 자동 변경
- 설치: `npm install axios`
- 모듈 불러올 때: `import axios from “axios”`

## Promise

- js에서 제공하는 비동기를 간편하게 처리할 수 있게 도와주는 객체
- 동기: 이전 작업의 실행이 끝나야 다음 작업 실행 시작
- 비동기 : 이전 작업의 실행과 무관하게 다음 작업을 실행
즉, 웹페이지를 리로드 하지 않아도 데이터를 불러와주는 방식
서버에 요청을 한 후 멈추는 것이 아닌 그 프로그램을 계속 돌아간다는 의미
- promise는 성공할 수도, 실패할 수도 있음
- promise 성공시 **resolve** 함수 호출
- promise 실패 시 **reject** 함수 호출

```javascript
axios.get("url")
	.then(function (res) {
		// 성공 핸들링
		console.log(res.data);
	})
	.catch(function (error) {
		// 에러 핸들링
		console.log(error);
	})
	.then(function () {
		// 항상 실행되는 영역
	})
	
	
axios.post("url", {
		fir: "KIM",
		last:"what"
	},
	{
    'Content-type': 'application/json',
    'Accept': 'application/json'
	}
	)
	.then(function (res) {
		// 성공 핸들링
		console.log(res.data);
	})
	.catch(function (error) {
		// 에러 핸들링
		console.log(error);
	})
	.then(function () {
		// 항상 실행되는 영역
	})
	
	
axios.delete('http://localhost:3000/api/user/delete',{
	params: {
		user_id: 1
	}
})
//성공시 then 실행
.then(function (response) {
	console.log(response);
})
//실패 시 catch 실행
.catch(function (error) {
	console.log(error);
});


//전체 데이터 수정
axios.put('http://localhost:3000/api/users/update', {
  id: 1,
  name: '개발이 취미인 사람',
})
//성공시 then 실행
.then(function (response) {
	console.log(response);	
})
//실패 시 catch 실행
.catch(function (error) {
	console.log(error);
});


//특정 데이터 수정
axios.patch(`http://localhost:3000/api/user/update/${1}`, {
	name: '개발이 취미인 사람'
})
//성공시 then 실행
.then(function (response) {
	console.log(response);
})
//실패 시 catch 실행
.catch(function (error) {
	console.log(error);
});
```


```javascript
axios.get('/user/12345')
  .then(function (response) {
    console.log(response.data);          // 서버가 제공하는 응답 출력
    console.log(response.status);        // HTTP 상태 코드 출력
    console.log(response.statusText);    // HTTP 상태 메시지 출력
    console.log(response.headers);       // HTTP 헤더 출력
    console.log(response.config);        // 
  });
```
