---
title: "Git 협업 전략"
tags: []
date: 2025-11-16
notion_id: 2ad922cf-26a8-80fe-80d6-eaef005ecf9f
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-11-16

> ✅ 로컬 main은 절대 건드리지 말고 **읽기 전용**으로 사용  
> main 병합은 **무조건 PR/MR**로  
>   
> feature 브랜치에서 pull origin main 대신 **fetch + merge origin/main** 사용


**1. 원격 변경사항 확인**


`git fetch origin main`


**2. 어떤 변경이 있는지 먼저 확인**


`git log HEAD..origin/main` --oneline  # 새로운 커밋들 확인

- 옵션
    - -graph --oneline --decorate --date=relative

`git diff HEAD origin/main`            # 변경 내용 확인


**3. 머지 전략 선택**


> **방법 A:** [**일반 merge**](/2ad922cf26a880fe80d6eaef005ecf9f#2ad922cf26a880f0ab48d60dfab3e613)  
> git merge origin/main  
>   
> **방법 B:** [**fast-forward**](/2ad922cf26a880fe80d6eaef005ecf9f#2ad922cf26a880848ddce3225d2d226e)**만 허용** (충돌 가능성 줄임)  
>   
> git merge --ff-only origin/main  
>   
> **방법 C: squash merge** (여러 커밋을 하나로)  
>   
> git merge --squash origin/main


## **충돌 관리 팁**

1. 충돌 발생 시

`git status`  # 충돌 파일 확인

1. 충돌 파일 내용 확인

`git diff`  # 현재 충돌 상태


`git diff --ours origin/main`  # 내 변경사항


`git diff --theirs origin/main`  # 상대방 변경사항

1. 특정 버전 선택

`git checkout --ours path/to/file`    # 내 버전 선택


`git checkout --theirs path/to/file`  # 상대방 버전 선택

1. merge 취소

`git merge --abort`


## Merge 전략


**Fast-forward vs 일반 Merge 차이**


## Fast-forward (--ff-only)


```markdown
`Before:
A---B---C (origin/feature/report)
    \
     D---E (HEAD: 로컬)

After (불가능 - 에러 발생):
Fast-forward만으로는 병합 불가능`

`Before:
A---B---C---D (origin/feature/report)
            \
             (HEAD: 로컬, 뒤처진 상태)

After (성공):
A---B---C---D (HEAD: 로컬)`
```

- **조건**: 로컬에 추가 커밋이 없고, 원격이 앞서 있을 때만 가능
- **결과**: 브랜치 포인터만 이동, 병합 커밋 없음
- **히스토리**: 일직선으로 깔끔
- **장점**: 히스토리가 단순, 불필요한 병합 커밋 없음
- **단점**: 로컬 작업이 있으면 실패

## 일반 Merge (기본)


```markdown
Before:
A---B---C (origin/feature/report)
    \
     D---E (HEAD: 로컬)

After:
A---B---C-------M (HEAD: 로컬)
    \         /
     D---E---
```

- **조건**: 양쪽 모두 커밋이 있을 때
- **결과**: 병합 커밋(M) 생성
- **히스토리**: 브랜치 구조 유지
- **장점**: 언제나 성공, 병합 이력 명확
- **단점**: 병합 커밋이 많아지면 히스토리 복잡

## 협업 시 권장 전략


**pull = fetch + merge 환경에서:**


```bash
# 1. 로컬 작업 전 항상 최신화 (fast-forward 시도)

git fetch origin feature/report
git merge --ff-only origin/feature/report


# 2. 작업 후 push 전 최신화

git fetch origin feature/report
git log HEAD..origin/feature/report --oneline  
# 확인

git merge origin/feature/report  
# 일반 merge (병합 커밋 생성)
```


**충돌 최소화 팁:**

- `-ff-only`로 먼저 시도 → 실패하면 일반 merge
- 작업 전후로 자주 fetch + merge
- 충돌 발생 시 `git mergetool` 또는 VS Code 병합 도구 활용

**현재 설정(****`pull.rebase false`****)에서는** 일반 merge가 기본이므로, 병합 커밋이 자주 생성됩니다. 이게 싫다면 작업 시작 전 `--ff-only`로 최신화하는 습관을 들이시면 됩니다.


## git branch 관리 전략


**1. 원격에서 삭제된 브랜치 로컬에서도 제거**


git fetch origin --prune


**2. merge된 로컬 브랜치 확인**


git branch --merged development


**3. merge된 브랜치 일괄 삭제 (main, development 제외)**


git branch --merged development | grep -v "main\|development\|feature/ui" | xargs git branch -d
