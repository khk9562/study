# D3 공식 문서 기반 집중 학습 로드맵

## 1주차: D3 공식 문서 + 기초 개념

### 공식 문서 읽는 순서:

D3 Introduction - D3가 무엇인지 이해
Selections - D3의 핵심 개념
Data Joins - enter/update/exit 패턴
Scales - 데이터를 시각적 속성으로 변환

### 문서 읽는 방법:

```
// 문서의 예제를 그대로 따라하지 말고, 변형해보기
// 공식 문서 예제:
const svg = d3.select("body").append("svg")
.attr("width", 960)
.attr("height", 500);

// 나만의 변형:
const svg = d3.select("#my-chart").append("svg")
.attr("width", 800)
.attr("height", 400)
.style("border", "1px solid #ccc"); // 디버깅용 테두리
```

### 1주차 일일 실습:

Day 1-2: Selection API 완전 이해 (select, selectAll, append, attr, style)
Day 3-4: Data binding 패턴 (data(), enter(), exit())
Day 5-7: 간단한 bar chart 만들면서 개념 정착

## 2주차: Scales & Shapes 집중

### 읽을 공식 문서:

d3-scale - 모든 scale 타입
d3-shape - line, area, pie 등
d3-axis - 축 그리기

### 문서 읽으면서 바로 실습:

```
/ 문서 예제를 복붙하지 말고 이해하면서 타이핑
// scaleLinear 문서 예제
const x = d3.scaleLinear()
.domain([0, 100])
.range([0, 960]);

// 내가 변형해보기
const myScale = d3.scaleLinear()
.domain(d3.extent(myData, d => d.value)) // 실제 데이터 범위
.range([margin.left, width - margin.right]);
```

### 2주차 목표:

모든 scale 타입 한 번씩 사용해보기
line(), area(), pie() 함수로 다양한 모양 그리기
axis 컴포넌트로 깔끔한 축 만들기

## 3주차: 애니메이션과 인터랙션

### 읽을 공식 문서:

d3-transition - 애니메이션
d3-selection events - 이벤트 처리
d3-drag, d3-zoom - 인터랙션

### 문서 읽는 팁:

```
// 공식 문서의 간단한 예제부터 시작
selection.transition()
.duration(750)
.attr("r", 5);

// 점점 복잡하게 만들어가기
selection.transition()
.duration(750)
.delay((d, i) => i _ 10) // 순차 애니메이션
.attr("r", d => d.value _ 2)
.style("fill", "red");
```

## 4주차: 고급 시각화 패턴

### 읽을 공식 문서:

d3-hierarchy - 트리, 트리맵
d3-force - 네트워크 그래프
d3-geo - 지리적 시각화

### 문서 + 예제 조합 학습법:

공식 문서에서 API 이해
Observable에서 실제 구현 예제 보기
내 데이터로 변형해서 구현

## 5주차: 실무 통합

### Next.js + TypeScript 환경에서 D3 활용:

```
// D3 공식 문서의 예제를 React 컴포넌트로 변환하는 연습
import { useEffect, useRef } from 'react';
import \* as d3 from 'd3';

// 공식 문서 예제 그대로 가져와서
function D3Component() {
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
// 여기에 D3 공식 문서 코드를 그대로 붙여넣고
const svg = d3.select(svgRef.current);

    // 점진적으로 TypeScript 타입 추가
    interface DataPoint {
      value: number;
      label: string;
    }

    const data: DataPoint[] = [...];

}, []);

return <svg ref={svgRef}></svg>;
}
```

## 효율적인 공식 문서 활용법

### 1. 코드부터 보기

문서의 긴 설명보다 코드 예제부터 보세요. D3는 코드로 이해하는 게 더 빠릅니다.

### 2. 브라우저 콘솔에서 바로 실험

```
// 공식 문서 읽으면서 콘솔에서 바로 테스트
const data = [1, 2, 3, 4, 5];
const scale = d3.scaleLinear().domain([1, 5]).range([0, 100]);
console.log(scale(3)); // 50
```

### 3. API 레퍼런스는 필요할 때 찾기

처음부터 모든 API를 외우려 하지 말고, 필요할 때마다 찾아보세요.

### 4. 공식 예제 Observable 컬렉션 활용

D3 Gallery
매일 하나씩 분석하고 따라 만들어보기

## 학습 검증 방법

### 주차별 체크포인트:

1주차 끝: 데이터 배열로 SVG 요소들 동적 생성 가능
2주차 끝: 실제 데이터셋으로 bar/line/scatter 차트 구현
3주차 끝: 클릭, 호버, 애니메이션이 있는 인터랙티브 차트
4주차 끝: 네트워크 그래프나 트리맵 같은 복잡한 시각화
5주차 끝: Next.js 앱에서 완전히 동작하는 대시보드
