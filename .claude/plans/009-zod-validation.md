# Plan #009: Zod 运行时校验

## 技术方案

创建 `src/lib/validations.ts` 集中所有 Zod schema，然后更新 Server Actions 使用这些 schema。

### 文件变更

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/lib/validations.ts` | 所有 Zod schema 定义 |
| 修改 | `src/app/publish/actions.ts` | createApp 入参校验 |
| 修改 | `src/app/apps/[id]/actions.ts` | like/unlike/comment/report/edit/delete 校验 |
| 修改 | `src/app/apps/[id]/build/actions.ts` | triggerBuild 校验 |
| 修改 | `src/app/api/apps/route.ts` | GET query + POST body 校验 |
| 修改 | `src/lib/build-executor.ts` | 消除 `any` 类型 |

### Schema 设计

```ts
// App
const createAppSchema = z.object({ title: z.string().min(1).max(100), ... })
const editAppSchema = z.object({ title: z.string().min(1).max(100), ... })

// Interaction
const likeAppSchema = z.object({ appId: z.string().uuid() })
const addCommentSchema = z.object({ appId: z.string().uuid(), content: z.string().min(1).max(1000) })
const reportAppSchema = z.object({ appId: z.string().uuid(), reason: z.string().min(1).max(500) })

// Build
const triggerBuildSchema = z.object({ appId: z.string().uuid() })
```
