# Exec #012: Fork 机制

## 日期: 2026-07-02

## 实际变更

### Schema 变更

`prisma/schema.prisma`:
- `App.forksCount Int @default(0)` — Fork 次数计数
- `App.forkedFromId String?` — 指向原始 App
- `App.forkedFrom App? @relation("ForkRelation")` — 自引用关系
- `App.forks App[] @relation("ForkRelation")` — 反向关系
- `@@index([forkedFromId])` — Fork 查询索引

### 新建文件

`src/app/apps/[id]/ForkButton.tsx` — Fork 按钮客户端组件:
- 已登录、非作者用户可见
- 点击 → `forkApp` action → 跳转到新 App
- 显示 forksCount

### 修改文件

`src/app/apps/[id]/actions.ts`:
- 新增 `forkApp(appId)` Server Action
- 校验: 不能 Fork 自己的作品
- 创建复制 App: 标题+"(Fork)"、描述、封面、源码、标签
- 自动创建 pending Build
- 更新原始 App 的 forksCount

`src/app/apps/[id]/page.tsx`:
- include `forkedFrom` 关联（显示原作品链接）
- Fork 按钮在 action bar（Like/Report/Fork）
- forkedFrom 提示行（Fork 的 App 顶部）

### 关键决策

- Fork 自动创建 pending Build（Worker 立即构建）
- 标题自动添加 "(Fork)" 后缀
- 不允许 Fork 自己的 App
