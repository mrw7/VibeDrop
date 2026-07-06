# Spec #012: Fork 机制

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As a **vibe coder**,
I want **to fork another user's app with one click**,
so that **I can remix and improve their work as my own starting point**.

As an **original author**,
I want **forked apps to show attribution back to my original**,
so that **I get credit for my work**.

---

## 问题描述

当前没有 Fork 功能。社区的核心价值之一是 remix — 看到一个好作品，一键 fork，在其基础上改进。PRD Phase 2 明确要求。

---

## 功能范围

### In Scope
- App 详情页显示 "Fork" 按钮（已登录、非作者可见）
- Fork 创建新 App：
  - 复制 title、description、coverImage、sourceType、sourceUrl、tags
  - `forkedFromId` 指向原始 App
  - 自动创建 pending Build（Worker 将重新构建）
- Fork 后跳转到新 App 详情页
- Fork 后的 App 显示 "Forked from [原 App 名]" 链接
- Fork 计数 `forksCount` 在原始 App 上显示

### Out of Scope
- 浏览器内代码编辑器（Phase 2+）
- Fork chain 可视化（谁 fork 了谁）
- Fork 前修改标题/描述
- 私有 fork（所有 fork 公开）

---

## 验收标准

- [x] **Given** 已登录用户查看他人 App, **When** 看到 Fork 按钮, **Then** 按钮可点击
- [x] **Given** 用户点击 Fork, **When** Fork 完成, **Then** 跳转到新 App 详情页
- [x] **Given** Fork 创建的 App, **When** 查看详情页, **Then** 顶部显示 "Forked from [原 App]" 链接
- [x] **Given** 原始 App 被 Fork, **When** 查看详情页, **Then** forksCount 增加
- [x] **Given** 用户查看自己 App, **When** 查看详情页, **Then** 没有 Fork 按钮

---

## 技术方案

### Schema 变更

```prisma
model App {
  // ... existing fields ...
  forkedFromId String?
  forksCount   Int @default(0)
  forkedFrom   App?  @relation("ForkRelation", fields: [forkedFromId], references: [id])
  forks        App[] @relation("ForkRelation")
  
  @@index([forkedFromId])
}
```

### Server Action

```typescript
async function forkApp(appId: string) {
  // 1. auth check
  // 2. find original app
  // 3. create new app with forkedFromId
  // 4. increment forksCount on original
  // 5. create pending Build
  // 6. redirect to new app
}
```

### Fork 按钮位置

App 详情页 — LikeButton 旁边（非作者可见时显示）

---

## 依赖

- Prisma schema migration（`forkedFromId` + `forksCount`）
- 现有 `publish/actions.ts` `createApp` 逻辑（参考）
