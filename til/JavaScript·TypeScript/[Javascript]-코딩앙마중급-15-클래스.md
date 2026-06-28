---
title: "[Javascript] 코딩앙마중급 #15 클래스"
tags: ["Javascript"]
date: 2023-05-03
notion_id: bd83887e-40fb-45f9-b002-4c3f3501931a
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2023-05-03

지금까지는 비슷한 형태의 객체를 생성하기 위해 생성자 함수를 사용함


```javascript
const User = function(name, age) {
	this.name = name;
	this.age = age;
	this.showName = function(){
		console.log(this.name);
	}
}

const mike = new User("Mike", 30);
```


```javascript
class User2 {
	// constructor는 객체를 만들어주는 생성자 메소드
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}
// showName처럼 클래스가 정의한 메소드는 User2의 프로토타입에 저장됨
		// Mike는 객체 내부에 showName이 있는 반면,
		// 아래 Tom은 프로토타입 내부에 있음
	showName(){
		console.log(this.name);
	}
}

const tom = new User2("Tom", 19);
//new 를 통해 호출하면 자동으로 실행됨
```


```javascript
const User = function(name, age) {
	this.name = name;
	this.age = age;

}

User.prototype.showName= function(){
	console.log(this.name);
}

const mike = new User("Mike", 30);

// new 빼고 실행하면 undefined 출력됨. 이 코드는 문제 없음
// 위에 User 객체에서 아무것도 반환하지 않으니까(return이 없으니까)
// 벗뜨 클래스에서는 new 빼고 실행하면 TypeError 발생


class User2 {
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}

	showName(){
		console.log(this.name);
	}
}

const tom = User2("Tom", 19);
// 벗뜨 클래스에서는 new 빼고 실행하면 TypeError 발생
```

- Class 상속

    생성자 함수는 프로토타입을 이용하여 상속


    class함수에서는 extends를 통해 구현


```javascript
// extends

class Car {
	constructor(color) {
		this.color = color;
		this.wheels = 4;
	}
	drive() {
		console.log("drive..");
	}
	stop() {
		console.log("STOP!");
	}
}

class Bmw extends Car {
	park() {
		console.log("PARK");
	}
}

const z4 = new Bmw("blue");
```

- Class 메소드 오버라이딩(method overriding)

bmw 내부에 car에서 정의한 메소드와 동일한 이름의 메소드가 존재한다면?


    덮어쓰게 됨 ㅇㅇ


    부모의 메소드를 사용하면서 그대로 확장하고 싶다면 super라는 메소드 사용하면 됨


```javascript
// method overriding

class Car {
	constructor(color) {
		this.color = color;
		this.wheels = 4;
	}
	drive() {
		console.log("drive..");
	}
	stop() {
		console.log("STOP!");
	}
}

class Bmw extends Car {
	park() {
		console.log("PARK");
	}
	stop() {
		super.stop();
		// super로 부모 클래스에 정의된 메소드를 사용할 수 있음 => 오버라이딩
		console.log("OFF!");
	}
}

const z4 = new Bmw("blue");
```


```javascript
// overriding

class Car {
	constructor(color) { // {}
		this.color = color;
		this.wheels = 4;
	}
	drive() {
		console.log("drive..");
	}
	stop() {
		console.log("STOP!");
	}
}

class Bmw extends Car {
	constructor(color) {
		super(color); // 항상 부모 클래스의 constructor을 가져와줘야 함
		this.navigation = 1;
	}
	park() {
		console.log("PARK");
	}
	stop() {
		super.stop();
		console.log("OFF!");
	}
}

const z4 = new Bmw("blue");
// 자식 클래스의 constructor에 동일한 인수를 받는 작업을 해줘야함
// constructor()와 super()안에 color 넣어주야 ㅇㅇ
```
