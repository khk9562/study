---
title: "생활코딩! React 리액트 프로그래밍"
tags: ["React"]
date: 2024-06-10
notion_id: 67fbdde9-d83a-4792-9323-d9bdb1f25352
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-10

## Part 01 리액트 기초


    ### 빌드


    `npm run build`

    - 배포판을 만드는 과정을 빌드(build)라고 함.
    - 빌드를 마치면 프로젝트에 build라는 폴더가 생기고, build 폴더에는 Index.html을 의존하는 다른 파일들이 존재하게 됨.

    ### 리액트는 사용자 정의 태그를 만드는 기술이다.


    ### 원시 데이터 타입(Primitive Type)


    `string`, `number`, `boolean`, `bigint`, `undefined`, `symbol`, `null`


    ### 범 객체 수정 방법

    - 범 객체라면 오리지널 값을 변경하는 것이 아닌, 복제본({…value})을 바꾸고, 그리고 나서 setValue로 newValue를 넣어주면 그때 비로소 데이터/컴포넌트가 다시 실행됨.

    ```python
    onCreate={(_title, _body)=>{
    	const newTopic = {id:nextId, title:_title, body:_body}
    	const newTopics = [...topics]
    	newTopics.push(newTopic);
    	setTopics(newTopics);
    	}
    }
    ```


    ### onChange 이벤트

    - HTML의 OnChange는 값이 바뀌거나 마우스 포인터가 바깥쪽으로 빠져나갈 때 호출됨
    - 리액트에서는 값을 입력할 때마다 값이 호출됨

## Part 02 React Router DOM


    ### 기본 라우팅


    ```javascript
    import { BrowserRouter, Route, Routes } from 'reac-router-dom';
    
    ...생략...
    
    <Routes>
    	<Route path="/" element={<Home />} />
    	<Route path="/topics" element={<Topics />} />
    	<Route path="/contact" element={<Contact />} />
    </Routes>
    ```


    ### Not Found Page


    사용자가 존재하지 않는 페이지로 접근했을 떄 NotFound 같은 페이지를 보여주려면?


    ```javascript
    <Route path="/*" element={"Not Found"} />
    ```


    ### Link

    - SPA(단일 페이지 애플리케이션: Single Page Application) 만들 떄 중요한 점은 페이지가 리로드되지 않고 동적으로 가져오는 데이터는 코드를 작성해서 만들거나 Ajax 같은 기술을 이용해 비동기적으로 데이터를 가져와서 페이지를 만드는 것
    - Link 컴포넌트는 페이지가 리로드되지 않게 자동으로 구현하는 컴포넌트

    ```javascript
    <Link to"/">Home</Link>
    <Link to"/topics">Topics</Link>
    <Link to"/contact">Contact</Link>
    ```


    ### HashRouter

    - 기존 BrowserRouter 사용과 다르게 URL에 #이 끼어듦
    - #이 붙어있으면 뒤의 내용은 북마크라는 뜻
    - 웹 서버는 # 문자 뒷부분의 주소를 무시
    - 하지만 자바스크립트를 이용해 # 뒷부분의 내용을 알 수 있기 때문에 react-router-dom은 URL을 읽어서 적절한 컴포넌트로 라우팅 가능
    - 웹 서버 설정에 따라 어떤 패스로 들어오든 루트 페이지에 있는 HTML 파일을 서비스 할 수 있다면 BrowserRouter를 사용하고, 그렇지 않다면 HashRouter를 사용

    ### NavLink

    - class=”active”라는 속성 보유
    - 사용자가 현재 자신이 어떤 페이지에 위치하고 있는지 직관적으로 알 수 있게 내비게이션에 사용자가 위치한 곳을 표시
    - index.css에 .active 클래스로 스타일 설정 가능

        ## Nested Routing

        - Topics 안에 또 다른 페이지 만듦

        Topics 컴포넌트


        ```javascript
        <NavLink to="/topics/1">HTML</NavLink>
        <NavLink to="/topics/2">JS</NavLink>
        <NavLink to="/topics/3">React</NavLink>
        <Routes>
        	<Route path="/1" element={'HTML is...'} />
        	<Route path="/2" element={'HTML is...'} />
        	<Route path="/3" element={'HTML is...'} />
        </Routes>
        
        
        
        // 개수를 알 수 없는 경우
        function Topics(){
        	var lis = [];
        	for (var i=0; i<contents.length; i++) {
        		lis.push(
        			<li key={contents[i].id}><NavLink to={"/topics/" + contents[i].id}></li>
        		)
        	}
        	
        	return (
        		<>
        			<ul>
        				{lis}
        			</ul>
        			<Routes>
        				<Route path="/:topic_id" element={<Topic />} />
        			</Routes>
        		</>
        	)
        }
        ```


        App


        ```javascript
        <Route path="/topics/*" element={<Topics />} />
        ```

    - 

## Part 05 useReducer

    - useState와 useReducer은 똑같은 일을 하지만 서로 다른 취지를 가짐

    ```javascript
    function reducer(oldState, action) {
    	if(action === 'up') {
    		return oldState + 1;
    	}
    }
    [state, dispatch] = useReducer(reducer, 0)
    dispatch('up')
    ```

    - useState는 고객이 장부를 사용하는 방법을 직접 배워서 장부를 바꿀 때마다 직접 스테이트를 바꿔주는 방식
    - useReducer은 은행을 만드는 코드. 은행에 두 개의 파라미터가 필요한데 첫 번째 파라미터인 couterReducer은 장부를 기록하는 회계 직원. 두 번째 파라미터로는 이 장부의 초깃값 설정. 장부를 변경할 때는 countDispatch 사용
    - useReducer 예시

    ```javascript
    const [count, countDispatch] = useReducer(countReducer, 0);
    
    // countDispatch = 창구 직원
    // useReducer = 은행을 만드는 코드
    // countReducer = 장부를 기록하는 회계 직원
    // 0 = 장부의 초깃값
    ```


    ```javascript
    const countReducer = (oldCount, action) => {
        switch (action) {
          case "UP":
            return oldCount + 1;
          case "DOWN":
            return oldCount - 1;
          case "RESET":
            return 0;
          default:
            return oldCount;
        }
      };
      const [count, countDispatch] = useReducer(countReducer, 0);
    
      const down = () => {
        // setCount(count - 1);
        countDispatch("DOWN");
      };
    
      const reset = () => {
        // setCount(0);
        countDispatch("RESET");
      };
    
      const up = () => {
        // setCount(count + 1);
        countDispatch("UP");
      };
    
      return (
        <>
          <article className="box">
            <h2>useReducer test</h2>
            <form>
              <input type="button" value="-" onClick={down} />
              <input type="button" value="0" onClick={reset} />
              <input type="button" value="+" onClick={up} />
            </form>
            <span>{count}</span>
          </article>
    ```

    - 리듀서를 사용하면 스테이트를 사용자가 직접 사용하는 것이 아니라 주문만, 즉 액션값만 주고 스테이트에 대한 구체적인 처리를 countReducer라는 전문가 함수가 독점적으로 처리

## Part 06 react-redux


    ```javascript
    import { createStore } from "react-redux";
    
    function App() {
      const reducer = (currentState, action) => {
        // 현재의 스테이트 값 = currentState
        //  혅의 값을 어떻게 바꿀 것인지에 대한 요청 = action
        // 이렇게 받은 값을 리턴하면 리턴한 값이 새로운 스테이트의 값이 됨
        return;
      };
      const store = createStore(reducer);
    ```


    ```javascript
    const reducer = (currentState, action) => {
        if (currentState === undefined) {
          return { number: 1 };
        }
        const newState = { ...currentState };
        return newState;
      };
    ```

    - 리덕스는 각각의 스테이트의 변화를 불변하게 유지해야 하는데, 그러기 위한 방법은 새로운 스테이트를 만들 때 과거의 스테이트 복제
    - 스테이트가 정의되지 않았을 때 기본 스테이트 값을 리턴함으로써 기본값 설정 가능.

    ### 리액트 리덕스 4인방


    `Provider` : 스테이트를 어떤 컴포넌트들에 제공할 것인지 가장 바깥쪽에 있는 울타리를 정하는 역할. props 중에 store을 반드시 정의해야함. Provider 컴포넌트 안에 있는 컴포넌트들을 스토어 사용 가능


    `useSelector` : Provider로 감싸진 컴포넌트가 state를 받아오려면 useSelector 사용.


    `useDispatch` : count로 따지면 플러스할지 마이너스 할지 리셋할지 type 선택하여 함수 실행하는 용도


    `connect` : 이 책에서 생략됨


## Part 07 redux-toolkit
