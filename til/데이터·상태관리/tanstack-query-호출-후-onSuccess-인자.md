---
title: "tanstack query 호출 후 onSuccess 인자"
tags: ["TanstackQuery"]
date: 2025-04-07
notion_id: 1ce922cf-26a8-8026-a388-d3dd34e32083
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-04-07

- onSuccess의 첫번째 인자 data는 앞서 updateAppliedSiteState의 return data값이고, varaiables는 해당 api 호출 시에 내가 넣은 인자가 출력됨

```javascript
export function useUpdateApplyState() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateAppliedSiteState,
    
onSuccess: (data, variables)
 => {

      console.log("data", data)
      console.log("variables", variables)

      queryClient.invalidateQueries(["appliedSiteList"])
 
     const { application_ids } = variables

      if (Array.isArray(application_ids)) {
        application_ids.forEach((id) => {
          queryClient.invalidateQueries(["appliedSite", id])
        })
      }
    },
    onError: (error) => {
      console.error("현장 지원 상태 변경 실패:", error)
      alert(
        error?.message ||
          "현장 지원 상태 변경에 실패했습니다. 다시 시도해주세요."
      )
    },
  })
```
