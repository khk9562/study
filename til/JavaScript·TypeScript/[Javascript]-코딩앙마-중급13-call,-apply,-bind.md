---
title: "[Javascript] 코딩앙마 중급#13 call, apply, bind"
tags: ["Javascript"]
date: 2023-05-03
notion_id: ebb529f1-1852-4321-8f5c-1c3cf4720088
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2023-05-03

⇒ this값을 바꿀 수 있는 함수들

- call

call 메서드는 모든 함수에서 사용할 수 있으며, this를 특정값으로 지정할 수 있습니다.


```javascript
const mike = {
	name: "Mike",
}

const tome = {
	name: "Tom",
}

function showThisName(){
	console.log(this.name);
}

showThisName();
// 이 때 this는 Window라 빈문자열만 나옴

showThisName.call(mike); // Mike
// 주어진 객체가 메소드인 것처럼 사용 가능

function update(birthYear, occupation) {
	this.birthYear = birthYear;
	this.occupation = occupation;
}

update.call(mike, 1999, 'singer');
console.log(mike);
// {name: "Mike", birthYear: 1999, occupation: "singer"}
// 객체에 정보가 업데이트 됨


update.apply(mike, [1999, 'singer']);
console.log(mike);
```

- apply

apply는 함수 매개변수를 처리하는 방법을 제외하면 call 과 완전히 같습니다.


call 은 일반적인 함수와 마찬가지로 매개변수를 직접 받지만, apply는 매개변수를 배열로 받습니다


```javascript
function update(birthYear, occupation) {
	this.birthYear = birthYear;
	this.occupation = occupation;
}

update.apply(mike, [1999, 'singer']);
console.log(mike);
```


```javascript
const nums = [3, 10, 1, 6, 4];
// const minNum = Math.min(...nums);
//const maxNum = Math.max(...nums);

// 두번째 매개변수로 배열을 전달하면 그 요소를 차례대로 인수로 사용
const minNum = Math.min.apply(null, nums); 
const minNum = Math.max.call(null, ...nums);

console.log(minNum);
console.log(maxNum);
```


call 과 apply는 동작 방식은 같음. 매개변수를 받아들이는 방법이 다를 뿐!


call은 순서대로 직접 받고,


apply는 배열형태로 받음


apply는 array를 받는다 a로 묶어서 외워

- bind

함수의 this값을 영구히 바꿀 수 있음


```javascript
const mike = {
	name: "Mike",
}

function upadate(birthYear, occupation) {
	this.birthYear = birthYear;
	this.occupation = occupation;
}

const updateMike = update.bind(mike);

updateMike(1980, "police");
console.log(mike);
// {name: "Mike", birthYear: 1980, occupation: "police"}}


const user = {
	name: "Mike",
	showNAme: function (){
		console.log(`hello, ${this.name}`);
	}

}
user.showName();

let fn = user.showNAme;

fncall(user);
fn.apply(user);

let boundFn = fn.bind(user);
```
