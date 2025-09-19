# D3.js 집중 학습 로드맵

## 1주차: D3.js 기초 이해하기

### D3.js 패러다임 이해

```
// D3.js (명령형, DOM 직접 조작)
const svg = d3.select("#chart")
const bars = svg.selectAll("rect")
.data(data)
.enter()
.append("rect")
```

### 핵심 개념 집중 학습:

Selection: select(), selectAll(), enter(), exit(), update()
Data Binding: 데이터와 DOM 요소 연결하는 D3만의 방식
Method Chaining: D3의 fluent interface 패턴

## 1주차 실습:

```
javascript// 매일 하나씩 구현
// Day 1: 정적 bar chart (Chart.js에서 했던 것과 비교)
// Day 2: 데이터 업데이트되는 bar chart
// Day 3: enter/update/exit 패턴 완전 이해
// Day 4-5: 기본 line chart, scatter plot
```

## 2주차: Scales & Axes 마스터하기

### Scale 완전 정복:

```
javascript// 다양한 scale 타입별 용도
const linearScale = d3.scaleLinear() // 연속형 → 연속형
const ordinalScale = d3.scaleBand() // 범주형 → 연속형
const colorScale = d3.scaleOrdinal(d3.schemeCategory10) // 색상
const timeScale = d3.scaleTime() // 시간 데이터
```

### 실무에서 자주 쓰는 패턴:

```
typescript// TypeScript와 함께 사용하는 Scale 패턴
interface DataPoint {
date: Date;
value: number;
category: string;
}

const createScales = (data: DataPoint[], width: number, height: number) => {
const xScale = d3.scaleTime()
.domain(d3.extent(data, d => d.date) as [Date, Date])
.range([0, width]);

const yScale = d3.scaleLinear()
.domain(d3.extent(data, d => d.value) as [number, number])
.range([height, 0]);

return { xScale, yScale };
};
```

## 2주차 실습:

복잡한 시간 축 처리 (Chart.js time scale과 비교)
다중 Y축 차트
로그, 파워 스케일 활용
색상 스케일로 히트맵 구현

## 3주차: 인터랙션과 애니메이션

### Chart.js의 tooltip, hover → D3.js 인터랙션

```
javascript// Chart.js처럼 쉬운 tooltip을 D3로 구현
const tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

circles
.on("mouseover", function(event, d) {
tooltip.transition().duration(200).style("opacity", .9);
tooltip.html(`Value: ${d.value}`)
.style("left", (event.pageX + 10) + "px")
.style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
tooltip.transition().duration(500).style("opacity", 0);
});
```

### 고급 인터랙션 패턴:

```
javascript// 브러싱과 줌 (Chart.js에서 불가능한 기능들)
const brush = d3.brushX()
.extent([[0, 0], [width, height]])
.on("end", brushed);

const zoom = d3.zoom()
.scaleExtent([1, 40])
.on("zoom", zoomed);
```

### 3주차 실습:

드래그 가능한 차트 요소
브러시 셀렉션으로 필터링
줌/팬 기능
복잡한 애니메이션 시퀀스

### 4주차: 복잡한 시각화 패턴

### 데이터 시각화 회사에서 자주 쓰는 고급 차트:

```
javascript// 1. Force-directed graph (네트워크 시각화)
const simulation = d3.forceSimulation(nodes)
.force("link", d3.forceLink(links))
.force("charge", d3.forceManyBody())
.force("center", d3.forceCenter(width / 2, height / 2));

// 2. Hierarchical data (조직도, 트리맵 등)
const hierarchy = d3.hierarchy(data)
const treemap = d3.treemap().size([width, height]);

// 3. Geographic visualization
const projection = d3.geoMercator();
const path = d3.geoPath(projection);
```

## 4주차 실습:

네트워크 다이어그램
트리맵, 써클패킹
지리적 데이터 시각화
산키 다이어그램 (데이터 플로우)

## 5주차: Next.js + TypeScript + D3.js 완전 통합

### 실무 수준 아키텍처 패턴:

```
typescript// 재사용 가능한 D3 차트 컴포넌트 패턴
import { useEffect, useRef } from 'react';
import \* as d3 from 'd3';

interface D3ChartProps<T> {
data: T[];
width: number;
height: number;
onDataPointClick?: (dataPoint: T) => void;
}

function D3Chart<T>({ data, width, height, onDataPointClick }: D3ChartProps<T>) {
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 클린업

    // D3 로직
    renderChart(svg, data, width, height, onDataPointClick);

}, [data, width, height]);

return <svg ref={svgRef} width={width} height={height} />;
}
```

### 성능 최적화 패턴:

```
typescript// 대용량 데이터 처리
const processLargeDataset = useMemo(() => {
if (rawData.length > 10000) {
// 샘플링 또는 aggregation
return sampleData(rawData, 1000);
}
return rawData;
}, [rawData]);

// Canvas 활용 (SVG 대신)
const drawOnCanvas = (canvas: HTMLCanvasElement, data: DataPoint[]) => {
const context = canvas.getContext('2d');
const customBase = document.createElement('custom');
const custom = d3.select(customBase);

// D3로 가상 DOM 조작 후 Canvas에 렌더링
};
```

<br/>
<br/>
<br/>

# 점진적 학습

## 1. TypeScript 기초 다지기 (1-2주)

컴포넌트 props, state, 이벤트 핸들러에 타입 정의하는 연습
interface와 type 차이점, Generic 활용법 익히기

## 2. Next.js 핵심 개념 (1주)

Server Components vs Client Components 구분
데이터 페칭 패턴 (SSG, SSR, ISR)
API Routes 활용

데이터 시각화 관점에서 중요한 부분:

대용량 데이터 처리를 위한 서버사이드 렌더링
동적 임포트로 D3 라이브러리 최적화
이미지 최적화 (차트를 이미지로 내보낼 때)

# 3. D3.js 체계적 학습 (3-4주)

Chart.js와 D3.js 차이점 이해:

Chart.js: 선언적, 미리 정의된 차트 타입
D3.js: 명령형, DOM 조작을 통한 완전한 커스터마이징

## 학습 순서 (중요도 순):

### 3-1주차: D3 핵심 개념

javascript// Selection과 Data Binding 마스터하기
d3.select("svg")
.selectAll("circle")
.data(data)
.enter()
.append("circle")
.attr("r", d => d.value)

### 3-2주차: Scale과 Axis

javascript// Chart.js의 축 설정과 비교하여 학습
const xScale = d3.scaleLinear()
.domain(d3.extent(data, d => d.x))
.range([0, width]);

const yScale = d3.scaleLinear()
.domain(d3.extent(data, d => d.y))
.range([height, 0]);

### 3-3주차: 인터랙션과 애니메이션

javascript// Chart.js의 hover, click 이벤트와 비교
circle
.on("mouseover", handleMouseOver)
.transition()
.duration(750)
.attr("r", d => d.value \* 2);

### 3-4주차: 복잡한 시각화 패턴

Force-directed graphs
Hierarchical visualizations
Geographic visualizations

## 4. Next.js + TypeScript + D3.js 실무 수준 프로젝트 구축

## 5. 성능 최적화 및 고급 패턴

실무에서 중요한 최적화 기법:

Canvas vs SVG 선택 기준
대용량 데이터 처리 (가상화, 샘플링)
메모이제이션 활용
웹워커를 통한 계산 최적화

## 효율적 학습을 위한 팁

1. 병렬 학습 전략

TypeScript는 실제 코드 작성하면서 점진적으로 학습
Next.js 기본 개념은 빠르게 훑고 필요할 때 깊게 파기
D3.js는 매일 1-2시간씩 꾸준히 실습

2. 실습 중심 학습
   typescript// 매일 작은 차트 하나씩 구현해보기
   // Day 1: 기본 Bar Chart
   // Day 2: Line Chart with animations  
   // Day 3: Scatter Plot with interactions
   // Day 4: 복합 차트 (Bar + Line)
3. 기존 경험 최대 활용

Chart.js에서 구현했던 차트들을 D3.js로 다시 만들어보기
React 컴포넌트 패턴을 D3.js와 결합하는 방법 연구
상태 관리 패턴을 D3.js 차트에 적용하기

4. 커뮤니티 활용

Observable (D3.js 창시자 Mike Bostock의 플랫폼)에서 예제 연구
GitHub에서 실무 프로젝트 코드 분석
Stack Overflow에서 자주 나오는 D3.js 문제들 미리 학습
