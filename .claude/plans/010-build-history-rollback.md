# Plan #010: App 版本管理/回滚

## 技术方案

### 架构

```
App 详情页 (Server Component)
├── PhoneShell (已有)
├── BuildLogPanel (已有) 
├── BuildHistory (新增 Client Component) ← 本次
│   ├── 构建时间线 UI
│   ├── 展开日志 (复用 BuildLogPanel 逻辑)
│   └── RollbackButton → rollbackApp action
└── actions.ts → rollbackApp (新增 Server Action)
```

### 文件变更

| 文件 | 变更 | 说明 |
|------|------|------|
| `src/app/apps/[id]/BuildHistory.tsx` | **新建** | 构建历史时间线组件 |
| `src/app/apps/[id]/actions.ts` | 修改 | 新增 `rollbackApp` action |
| `src/app/apps/[id]/page.tsx` | 修改 | include builds + 传入 BuildHistory |

### 数据查询

```typescript
// page.tsx — 补充 builds 查询
const builds = await prisma.build.findMany({
  where: { appId: params.id },
  orderBy: { startedAt: "desc" },
  take: 10,
})
```

### Server Action

```typescript
// actions.ts
export async function rollbackApp(appId: string, buildId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()
  
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app || app.authorId !== session.user.id) throw AppError.forbidden()
  
  const build = await prisma.build.findUnique({ where: { id: buildId } })
  if (!build || build.appId !== appId) throw AppError.notFound("构建记录不存在")
  if (build.status !== "success" || !build.artifactUrl) {
    throw AppError.badRequest("只能回滚到构建成功的版本")
  }
  
  await prisma.app.update({
    where: { id: appId },
    data: { playUrl: build.artifactUrl, buildId: build.id },
  })
  
  revalidatePath(`/apps/${appId}`)
}
```

### BuildHistory 组件设计

```
┌─ 构建历史 (展开/折叠) ──────────────────────────┐
│                                                   │
│  ● 2026-07-02 14:30  ✅ 构建成功  [当前活跃]      │
│  │                                                 │
│  ● 2026-07-02 14:00  ❌ 构建失败  [查看日志 ▸]    │
│  │                                                 │
│  ○ 2026-07-02 13:00  ✅ 构建成功  [回滚到此版本]   │
│  │                                                 │
│  ○ 2026-07-01 12:00  ✅ 构建成功  [回滚到此版本]   │
│                                                   │
└───────────────────────────────────────────────────┘
```
