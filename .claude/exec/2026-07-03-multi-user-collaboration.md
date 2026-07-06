# Exec #016: 多用户协作

## 日期: 2026-07-03

## 实际变更

### 新增文件 (6)

- `src/lib/permissions.ts` — 权限检查辅助函数: `canEditApp()`, `requireEditAccess()`, `canManageApp()`, `requireOwnerAccess()`
- `src/app/apps/[id]/collaborators/actions.ts` — 3 个 server actions: addCollaborator, removeCollaborator, listCollaborators
- `src/app/apps/[id]/CollaboratorSection.tsx` — 协作者列表展示组件
- `src/app/apps/[id]/AddCollaboratorDialog.tsx` — 搜索用户 + 管理协作者弹窗
- `src/app/api/users/search/route.ts` — GET 用户搜索 API (按 name/githubLogin 模糊匹配)
- `.claude/specs/016-multi-user-collaboration.md` — Spec 文档

### 修改文件 (11)

- `prisma/schema.prisma` — +Collaborator 模型, +CollaboratorRole 枚举, User/App 增加 collaborations/collaborators 关联
- `src/lib/validations.ts` — +addCollaboratorSchema, +removeCollaboratorSchema
- `src/app/apps/[id]/actions.ts` — editApp→requireEditAccess, deleteApp→requireOwnerAccess, rollbackApp→requireEditAccess, forkApp→防止协作者 Fork 自己的项目, deleteComment→canEditApp, deleteApp cascade 增加 collaborator 清理
- `src/app/apps/[id]/build/actions.ts` — triggerBuild→requireEditAccess
- `src/app/apps/[id]/editor/page.tsx` — authorId 检查 → canEditApp
- `src/app/api/apps/[id]/files/route.ts` — authorId 检查 → canEditApp
- `src/app/api/apps/[id]/save/route.ts` — authorId 检查 → canEditApp
- `src/app/api/apps/[id]/deploy/route.ts` — authorId 检查 → canEditApp
- `src/app/apps/[id]/page.tsx` — +CollaboratorSection, isAuthor→canEdit/canManage, Fork 按钮对协作者隐藏, 评论删除权限扩展
- `src/app/apps/[id]/BuildHistory.tsx` — isAuthor prop → canEdit
- `src/app/users/[id]/page.tsx` — +协作的 App 区域

### 关键决策

- **权限抽象**: 创建 `src/lib/permissions.ts` 集中管理所有权限检查，替代分散在 10+ 个位置的 `authorId` 内联检查
- **保持 authorId**: 不修改现有 `authorId` 字段作为所有权来源，Collaborator 仅用于非 owner 的额外权限授予
- **两种角色**: owner (原始作者) 和 editor (协作者)，editor 不能删除 App 或管理协作者
- **直接添加**: MVP 不需要邀请/接受流程，owner 直接搜索用户名即可添加
- **搜索 API**: GET `/api/users/search?q=` 按 name 和 githubLogin 模糊匹配，最多返回 10 条结果，需要登录

### 部署须知

1. 运行 `npx prisma db push` 同步 schema 变更
2. 无需额外的环境变量配置
3. 现有功能和权限向后兼容
