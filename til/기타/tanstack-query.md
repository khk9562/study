---
title: "tanstack-query"
tags: []
date: 2025-03-04
notion_id: 1ac922cf-26a8-805d-bd38-e9b8576e6bdd
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-03-04

```javascript
const [todoItem, setTodoItem] = useState("");
  const fetchTodos = async () => {
  await axios.get('url')
  };

  const {
    data: todos,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });
  
  const addTodo = async (newTodo) => {
    await axios.post("http://localhost:4000/todos", newTodo);
  };

const { mutate } = useMutation({
	mutationFn: addTodo,
	onSuccess: () => {
	// alert("데이터 삽입이 성공했습니다.");
	// 이때 해당 컴포넌트에서 사용한 queryKey를 배열 형태로 집어넣어 줘야한다.
	queryClient.invalidateQueries(["todos"]);
	},
});
```
