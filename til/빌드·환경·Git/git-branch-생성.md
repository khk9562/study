---
title: "git branch 생성"
tags: ["Git"]
date: 2025-02-03
notion_id: 18f922cf-26a8-8038-8e8c-ff5253553d4c
notion_last_edited: 2026-06-28T08:30:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2025-02-03

develop 브랜치에서 새로운 feature 브랜치를 만들기

1. develop 브랜치로 이동

`git checkout develop`

1. develop 브랜치를 최신 상태로 업데이트

`git pull origin develop`

1. 새로운 feature 브랜치 생성 및 이동

`git checkout -b feature/stella`

1. 새 브랜치를 원격에 푸시

`git push -u origin feature/stella`
