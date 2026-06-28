---
title: "[Typescript] 코딩앙마 강의 기록"
tags: ["Typescript"]
date: 2023-05-03
notion_id: aa6e60fb-cee3-46d3-bbd8-c84dfbded3e2
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2023-05-03

<details>
<summary>#1 기본 타입</summary>

```typescript
let age:number = 30;
let isAdult:boolean = true;
let a:number[] = [1,2,3];
let a2:Array<number> = [1,2,3];

let week1:string[] = ['mon','tue','wed'];
let week2:Array<string> = ['mon', 'tue', 'wed'];

week1.push(3) // 문자열 배열에 숫자를 넣으려고 하니까 이거는 당연히 에러 발생



// 튜플 Tuple - 배열과 비슷한 모양. 인덱스별로 타입이 다를 때 유용
let b:[string, number;]
// 첫번째 요소는 string, 두번째 요소는 number를 넣을 수 있다는 의미
b = ['z', 1];
b[0].toLowerCase(); // toLowerCase는 문자만 가능하니까 인덱스 0번만 가능



// void, never
//:never는 에러를 반환하거나 영원히 끝나지 않는 타입 반환할 수 o
function showError():never{ 
	throw new Error();
}
function infLoop():never{
	while (true) {
		// do something...
	}
}


// enum - 비슷한 값끼리 묶었다 생각

enum Os {
	Window,  // 0
	Ios,  // 1
	Android,  // 2
}

enum Os {
	Window = 3,
	Ios = 10,
	Android,  // 11
// 값이 자동으로 연속적으로 할당
}

enum Os {
	Window = 'win',
	Ios = 'ios',
	Android = 'and',
// 숫자가 아니기 때문에 단방향 맵핑만 가능
}

let myOs:Os;
// myOs는 Os라고 이렇게 선언을 하게 되면 
// myOs에는 window, ios, android만 입력 가능하게 됨
myOs = Os.Window;
// 특정 값만 입력하고 싶고, 그 값들이 공통점이 있을 떄 enum 사용





// Null, undefined
let a:null = null;
le b:undefined = undefined;
```


</details>

<details>
<summary>#2 인터페이스</summary>

```typescript
let user:object;

user = {
	name: 'xx',
	age: 30
}

console.log(user.name);
//오브젝트에는 특정 속성값이 없기 때문에 에러(오브젝트에는 네임이 없다) 발생


type Score = 'A' | 'B' | 'C' | 'F';


// 프로퍼티를 정해서 객체를 표현하고자 할 때는 Interface 사용
interface User {
	name : string;
	age : number;
	gender? : string;
	// 입력을 안해도 되는 거에는 물음표(?) 붙여주면 아래에서 gender를 안넣어도 에러 발생x
	readonly birthYear : number;
	// 읽기전용이라 아래서 수정 안됨

//	1? : string;
//  2? : string;
//	3? : string;
//	4? : string;
//	[grade:number] : string;
	[grade:number] : Score;

}

let user : User = {
	name : 'xx',
	age : 30,
	//birthYear :2000,
	1 : 'A',
	2 : 'B', // Score에 해당하는 문자 외에는 입력할 수 없음
}

user.age = 10;
user.gender = 'male';

console.log(user.age);







interface Add {
	(num1:number, num2:number): number;
}

// interface 에선 num1, num2 라고 정의했지만 x, y로 사용해도 Number타입인 게 체크됨
const add : Add = function (x, y) {
	return x + y;
}

add(10, 20);

interface IsAdult {
	(age:number):boolean;
}

const a:IsAdult = (age) => {
	return age > 19;
}

a(33); // true





// interface 로 클래스 정의 가능
// 이 때는 implements 라는 키워드 사용

interface Car {
	color: string;
	wheels: number;
	start(): void;
}

class Bmw implements Car {
	color;
	wheels = 4;

	constructor(c:string) {
		this.color = c;
	}
	
	start(){
		console.log("go..");
	}
}


// extends
// Car 가 갖고 있던 속성을 그대로 받게 됨
interface Benz extends Car {
	// 추가로 정의 가능
	door: number;
	stop(): void;

}

const benz : Benz = {
	door: 5,
	stop() {
		console.log("stop");
	}

	// 위 속성(Car) 그대로 써줘야 에러가 사라짐
	color: string;
	wheels: number;
	constructor(c:string) {
		this.color = c;
	}
	start(){
		console.log("go...");
	}
}


const b = new BMw("green");
console.log(b);
// [LOG]: Bmw : {
//	"wheels" : 4,
//	"color": green
//}
b.start();
// [LOG]: "go..."







// implements 
interface Car {
	color: string;
	wheels: number;
	start(): void;
}

interface Toy {
	name: string;
}


interface ToyCar extends Car, Toy {
	price : number;
}
```


</details>

<details>
<summary>#3 함수</summary>

```typescript
// 각 매개변수의 타입을 지정해주고, 괄호 뒤에는 반환값의 타입(void자리)을 지정
function add(num1:number, num2:number):void {
	//return num1 + num2;
	// 아무것도 반환하지 않은 경우에는 괄호 뒤에 void를 써주면 됨
	console.log(num1 + num2);
}

function isAdult(age: number): boolean {
	return age > 19;
}

// 이 name 은 있어도 되고 없어도 되는 옵셔널 파라미터("선택적 매개변수")니까 반드시 ?를 붙여줘야 에러 사라짐
function hello(name?: string) {
	return `Hello, ${name || "world"}`;
}

function hello2(name = "world") {
	return `Hello, ${name}`;
}

const result = hello();
const result 2 = hello("Sam");


// 선택적 매개변수는 항상 필수 매개변수의 뒤에 자리해야 함
function hello(name: string, age?:number):string {
	if (age !== undefined) {
		return `Hello, ${name}. You are ${age}.`;
	} else {
		return `Hello, ${name}`;
	}
}
console.log(hello("Sam"));
console.log(hello("Sam", 30));

// 선택적 매개변수를 필수 매개변수의 앞에서 사용하고 싶다면
function hello( age:number | undefined, name: string):string {
	if (age !== undefined) {
		return `Hello, ${name}. You are ${age}.`;
	} else {
		return `Hello, ${name}`;
	}
}

console.log(hello(30, "Sam"));
console.log(hello(undefined, "Sam"));




// 나머지 매개변수 -> 매개변수의 개수가 매번 바뀔 수 o
function add(...nums) {
	return nums.reduce((result, num) => result + num, 0);
}

// 배열 형태로도 나타낼 수 있음
function add(...nums: number[]) {
	return nums.reduce((result, num) => result + num, 0);
}

add(1, 2, 3);  // 6
add(1,2,3,4,5,6,7,8,9,10);  // 55







// this
interface User {
	name: string;
}

const Sam: User = {name: 'Sam'}

// this의 타입을 정할 땐, 함수의 첫번째 매개변수 자리에 this를 쓰고 타입을 정해주면 됨
function showName(this:User, age:number, gender: 'm' | 'f'){
	console.log(this.name, age, gender);
}

// bind를 이용해 Sam 객체를 this 에 강제
const a = showName.bind(Sam); // [LOG]: "Sam"
a(30, 'm');





interface User {
	name: string;
	age: number;
}

// 오버로드=> 전달받은 매개변수의 개수나 타입에 따라 다른 동작을 하게 하는 것
function join(name: string, age: string): string;
function join(name: string, age: number): User;
function join(name: string, age: number | string): User | string {
	if (typeof age === "number") {
		return {
			name,
			age,
		};
	} else {
			return "나이는 숫자로 입력해주세요.";
	}
}

const sam: User = join("Sam", 30);
const jane: string = join("Jane", "30");
```


</details>

<details>
<summary>#4 리터럴, 유니온/교차 타입</summary>

```typescript
// Literal Types

// userName1처럼 정해진 스트링 값을 가진 것을 "문자열 리터럴 타입"이라고 함
const userName1 = "Bob";
let userName2 = "Tom";
// let으로 정의한 변수는 언제든 다른 값으로 변할 수 있으니 마우스 호버하면 string으로 표시됨

userNAme2 = 3; // 에러안뜨게 하려면 let userNAme2: string | number = "Tom";

type Job = "police" | "developer" | "teacher";

interface User {
	name : string;
	job : Job;
}

const user: User = {
	name : "Bob",
	job : "developer" // job은 위에 정해진 값만 사용 가능

}


// "숫자형 리터럴 타입"

const user: User = {
	name: "Bob",
	job: "developer",
}

interface HighSchoolStudent {
	name: number | string;
	grade : 1 | 2 | 3;
	// 이 세로줄은 유니온 타입이라고 함
}


// Union Types

interface Car {
	name: "car",
	color: string,
	start(): void;

}

interface Mobile {
	name: "mobile";
	color: string;
	call(): void;
}

function getGift(gift: Car | Mobile){
	console.log(gift.color);
	// 그냥 gift.start(); 하면 에러남 => 둘(카 모바일) 중 하나 어딘지 모르니까
	// if 조건 걸어서 식별해주기
	if(gift.name === "car") {
		gift.start();
	}  else {
		gift.call();
	}
}


// Intersection Types 교차 타입 여러 타입 합쳐서 사용
// 유니온이 or 이라면 교차 타입은 and

interface Car {
	name: string;
	start(): void;
}

interface Toy {
	name: string;
	color: string;
	price: number;
}

// 모든 속성을 기입해줘야 함
const toyCar: Toy & Car = {
	name : "타요",
	start(){},
	color: "red",
	price: 1000,


}
```


</details>

<details>
<summary>#5 클래스</summary>

```typescript
class Car {
	// color:string;
	constructor(public color:string) {
		this.color = color;
	}
	start() {
		console.log("start");
	}

}
```


```typescript
// 접근 제한자(Access modifier)
//  - public, private, protected

// public 자식 클래스나 클래스 인스턴스에서 접근 가능.
// 아무것도 표기하지 않고 접근하면 public

// private name: string = "car"
// class 내부에서만 사용가능하게 됨
// #name => private

// protected
// 자식 클래스에서 퍼블리과 마찬가지로 접근 가능
// 그러나 클래스 인스턴스로는 접근 불가
// 키 값이 인스턴스라고 생각하면ㅇㅋ

/*
public - 자식 클래스, 클래스 인스턴스 모두 접근 가능
private - 자식 클래스에서 접근 가능
protected - 해당 클래스 내부에서만 접근 가능
*/

class Car {
	protected name: string = "car";
		// 이 name은 Car class 내부에서만 사용가능하게 됨
	color: string;
		// static 프로퍼티 => 정적 멤버? 변수를 만들 수 o
		// this를 쓰는 게 아니라 클래스 명을 사용해서 불러와야 함
	static wheels = 4;
	constructor(color: string) {
		this.color = color;
	}
	start() {
		console.log("start");
		console.log(this.name);
		console.log(Car.wheels);
	}

}

class Bmw extends Car {
	constructor(color: string) {
		super(color);
	}
	showName() {
		console.log(super.name);
		// private으로 되어있으면 에러 뜸
	}

}

const z4 = new Bmw("black");
console.log(z4.name); // protected되어있으면 접근 안됨
console.log(Car.wheels)
```


```typescript
// 추상 클래스
abstract class Car {
	// color:string;
	constructor(color:string) {
		this.color = color;
	}
	start() {
		console.log("start");
	}
	abstract doSomething():void;
}
// 추상 클래스 내부의 추상 메소드는 반드시 상속받은 쪽에서 메소드를 구현해줘야 함
// 상속하는 쪽에서는 프로퍼티나 이름만 선언

// const car = new Car("red");
// 추상 클래스는 new를 통해서 객체를 만들 수 없고 확장 통해서만 가능?

class Bmw extends Car {
	// color:string;
	constructor(color:string) {
		super(color);
	}
	doSomething(){
		alert(3);
		// 이렇게 상속받는 쪽에서 구체적인 메소드 구현해줘야 함
	}
}

const z4 = new Bmw("black");
```


</details>

<details>
<summary>#6 제너릭</summary>

클래스나 함수 인터페이스를 다양한 타입으로 재사용할 수 있음


선언할 때는 그냥 타입 파라미터만 적어주고 생성하는 시점에 타입 파라미터 결정


```typescript
// Generic

//function getSize(arr:number[]):number {
//	return arr.length;
//}

//function getSize(arr:number[] | string[]):number {
//	return arr.length;
//}
// 함수 오버로드 사용하거나 유니온타입으로 타입을 여러개 설정해줘야 타입을 바꿔서 재사용 가능
// 근데 타입이 늘어날때마다 유니온으로 쓰는 거 오바임; 그래서 제너릭

// <T> typeParameter x나 a도 상관 없음
// 이 티는 어떤 타입을 전달받아서 이 함수에서 사용할 ㅅ ㅜ있도록
//이 매ㅐㄱ변수의 사용은 티의 배열
function getSize<T>(arr: T[]):number {
	return arr.length;
}

const arr1 = [1,2,3];
getSize<number>(arr1); // 3
// 꺽쇄안에 넘버 적으면 위의 함수의 의미는 아래와 같음
// function getSize(arr: number[]): number {return arr.length;}


const arr2 = ["a", "b", "c"];
getSize<string>(arr2);

const arr3 = [false, true, true];
getSize<boolean>(arr3);
```


```typescript
interface Mobile<T> {
	name: string;
	price: number;
	option: T;
}

const m1: Mobile<object> {
// Mobile<{ color: string; coupon: boolean; }>
	name: "s21",
	price: 1000,
	option: {
		color: "red",
		coupon: false,
	},
};

const m2: Mobile<string> = {
	name: "s20",
	price: 900, 
	option: "good",
}
```


```typescript
interface User {
	name: string;
	age: number;
}

interface Car {
	name: string;
	color: string;
}

interface Book {
	price: number;
}

const user: User = { name: "a", age: 10 };
const car: Car = { name:"bmw", color: "red" };
const book: Book = { price: 3000 };

function showName<T extends { name: string }>(data:T): string {
	return data.name;
}

showName(user);
showName(car);
showName(book);
```


</details>

<details>
<summary>#7 유틸리티 타입</summary>

```typescript
// keyof

interface User {
	id: number;
	name: string;
	age: number;
	gender: "m" | "f";
}

type UserKey = keyof User; // 'id' | 'name' | 'age' | 'gender'

const uk:UserKey = "id";
```


```typescript
// Partial<T>
// 프로퍼티를 모두 옵션으로 바꿔줍니다 그래서 일부만 사용 가능

interface User {
	id: number;
	name: string;
	age: number;
	gender: "m" | "f";
}

// partial로 감싼 모습과 동일한 모습
/* interface User {
	id?: number;
	name?: string;
	age?: number;
	gender?: "m" | "f";
}*/

let admin:Partial<User> = {
	id: 1,
	name: "Bob",
	job: "",
}
```


```typescript
// Required<T>
// 

interface User {
	id: number;
	name: string;
	age?: number;
}

let admin: Required<User> {
	id: number;
	name: string;
	age: number; // age도 필수 프로퍼티가 됨
}
```


```typescript
// Readonly<T>
// 처음 할당만 가능하고 뒤에 수정은 불가능

interface User {
	id: number;
	name: string;
	age?: number;
}
let admin: Readonly<User> {
	id: 1;
	name: "Bob";
};

admin.id = 4; // 에러
```


```typescript
// Record<K, T>
// K Key T type

/*
interface Score {
	"1": "A" | "B" | "C" | "D"; 
	"2": "A" | "B" | "C" | "D";
	"3": "A" | "B" | "C" | "D";
	"4": "A" | "B" | "C" | "D";
}

const score:Score = {
	1 : 'A',
	2 : 'B',
	3 : 'C',
	4 : 'D'

};
*/

/* const score:Record<"1"|"2"|"3"|"4", "A"|"B"|"C"|"D"> = {
	1: "A",
	2: "B",
	3: "C",
	4: "D"
}*/

type Grade = "1"|"2"|"3"|"4";
type Score = "A"|"B"|"C"|"D"|"F";
const score:Record<Grade, Score> = {
	1: "A",
	2: "B",
	3: "C",
	4: "D"
}




interface User {
	id: number;
	name: string;
	age: number;
}

function isValid(user:User){
	const result: Record<keyof User, boolean> = {
		id : user.id > 0,
		name : user.name !== '',
		age : user.age > 0
	}
	return result;
}
```


```typescript
// Pick<T,K>
// 특정 프로퍼티만 빼내서 사용 가능

interface User {
	id: number;
	name: string;
	age: number;
	gender: "M" | "W";
}

const admin: Pick<USer, "id" | "name"> = {
	id :0,
	name: "Bob,
}



// Omit<T,K>
// 특정 프로퍼티 생략하고 사용 가능
const admin: Pick<USer, "age" | "gender"> = {
	id :0,
	name: "Bob,
}


// Exclude<T1,T2>
// 오밋은 프로퍼티 제거, 익스클루드는 타입으로 제거
// T1 중에서 T2타입과 겹치는 거 제거

type T1 = string | number | boolean;
type T2 = Exclude<T1, number | string>; //boolean;
```


```typescript
// NonNullable<Type>

type T1 = string | null | undefined | void;
type T2 = NonNullable<T1>; // string | void
```


</details>
