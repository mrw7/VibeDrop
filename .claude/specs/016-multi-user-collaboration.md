# Spec #016: 多用户协作

## 状态: done (Phase 3)

## 创建日期: 2026-07-03

---

## 用户故事

As an **app author**,
I want **to add collaborators to my app**,
so that **we can edit code and manage the app together as a team**.

As a **collaborator**,
I want **to edit code, trigger rebuilds, and manage the app**,
so that **I can contribute without being the original author**.

As a **non-collaborator**,
I want **collaborated apps to be clearly marked**,
so that **I understand who maintains the app**.

---

## 问题描述

VibeDrop 当前是单作者模型：只有 `app.authorId` 可以编辑、删除、访问编辑器或触发构建。一起协作的用户无法共享应用管理权限。

---

## 功能范围

### In Scope

- App 作者可以添加协作者（通过用户名搜索）
- 协作者可以编辑代码、编辑元数据、触发构建、回滚
- 协作者不能删除 App 或管理其他协作者
- 权限检查抽象化：`canEditApp()` / `requireEditAccess()`
- App 详情页展示协作者列表
- 用户资料页展示协作的 App
- Fork 按钮对协作者隐藏

### Out of Scope

- 邀请邮件通知
- 查看者（viewer）角色
- 所有权转移
- 协作者角色变更（MVP 仅 editor 角色）

---

## 验收标准

- [x] **Given** App 作者, **When** 在协作者管理弹窗搜索用户, **Then** 可添加为协作者
- [x] **Given** 协作者, **When** 访问 App 详情页, **Then** 看到编辑按钮和 Edit Code 链接
- [x] **Given** 协作者, **When** 访问 `/apps/[id]/editor`, **Then** 可正常编辑代码
- [x] **Given** 协作者, **When** 触发 Save & Rebuild, **Then** 构建正常触发
- [x] **Given** 协作者, **When** 查看页面, **Then** 不显示删除按钮和协作者管理按钮
- [x] **Given** 非协作者, **When** 尝试访问编辑器, **Then** 重定向到 App 详情页
- [x] **Given** App 作者, **When** 移除协作者, **Then** 协作者失去所有编辑权限
- [x] **Given** 用户, **When** 查看协作者的资料页, **Then** 看到 "协作的 N 个作品"

---

## 技术方案

### Schema

新增 `Collaborator` 模型和 `CollaboratorRole` 枚举：

```prisma
model Collaborator {
  id        String           @id @default(uuid())
  appId     String
  userId    String
  role      CollaboratorRole @default(editor)
  createdAt DateTime         @default(now())

  app  App  @relation(fields: [appId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([appId, userId])
  @@index([appId])
  @@index([userId])
}

enum CollaboratorRole {
  owner
  editor
}
```

### 新增文件 (6)

| 文件 | 说明 |
|------|------|
| `src/lib/permissions.ts` | `canEditApp()`, `requireEditAccess()`, `canManageApp()`, `requireOwnerAccess()` |
| `src/app/apps/[id]/collaborators/actions.ts` | addCollaborator, removeCollaborator, listCollaborators |
| `src/app/apps/[id]/CollaboratorSection.tsx` | 协作者列表 + 管理入口 |
| `src/app/apps/[id]/AddCollaboratorDialog.tsx` | 搜索用户 + 添加/移除协作者弹窗 |
| `src/app/api/users/search/route.ts` | 用户搜索 API |

### 修改文件 (10)

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | +Collaborator 模型, +CollaboratorRole 枚举, +User/App relations |
| `src/lib/validations.ts` | +addCollaboratorSchema, +removeCollaboratorSchema |
| `src/app/apps/[id]/actions.ts` | editApp/rollbackApp/forkApp/deleteComment/deleteApp → 权限辅助函数 |
| `src/app/apps/[id]/build/actions.ts` | triggerBuild → requireEditAccess |
| `src/app/apps/[id]/editor/page.tsx` | authorId → canEditApp |
| `src/app/api/apps/[id]/files/route.ts` | authorId → canEditApp |
| `src/app/api/apps/[id]/save/route.ts` | authorId → canEditApp |
| `src/app/api/apps/[id]/deploy/route.ts` | authorId → canEditApp |
| `src/app/apps/[id]/page.tsx` | +CollaboratorSection, isAuthor→canEdit, Fork/comment 逻辑 |
| `src/app/apps/[id]/BuildHistory.tsx` | isAuthor → canEdit |
| `src/app/users/[id]/page.tsx` | +协作的 App 区域 |

### 权限模型

| 操作 | owner (authorId) | editor (collaborator) |
|------|:---:|:---:|
| 编辑元数据 | ✅ | ✅ |
| 编辑代码 | ✅ | ✅ |
| 触发构建 | ✅ | ✅ |
| 回滚 | ✅ | ✅ |
| 删除评论 | ✅ | ✅ |
| 删除 App | ✅ | ❌ |
| 管理协作者 | ✅ | ❌ |
| Fork | ❌ | ❌ |
