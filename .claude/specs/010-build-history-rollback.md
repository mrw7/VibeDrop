# Spec #010: App 版本管理/回滚

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As an **app publisher**,
I want **to see all past builds of my app with their status and timestamps**,
so that **I can track build history and debug issues**.

As an **app publisher**,
I want **to rollback to a previous successful build**,
so that **I can quickly revert to a working version if the latest build breaks something**.

---

## 问题描述

当前 Build 表已记录所有构建，但：
1. 前端只在 App 详情页显示最新一次构建的状态/日志
2. 没有查看历史构建的 UI
3. 没有回滚机制 — 如果新构建有问题，用户无法恢复旧版本

---

## 功能范围

### In Scope
- App 详情页新增"构建历史"区域（BuildLogPanel 下方）
- 显示最近 10 次构建：状态图标、时间、简短描述
- 点击展开查看该次构建的完整日志
- 成功的构建显示"回滚到此版本"按钮（仅作者可见）
- 回滚操作：更新 App.playUrl 和 App.buildId 指向旧构建
- 当前活跃版本高亮显示
- 回滚后触发 revalidatePath 刷新页面

### Out of Scope
- 版本号/语义化版本标记（Phase 2+）
- 构建产物差异对比
- 构建产物文件系统浏览
- 自动回滚策略
- 构建配置快照

---

## 验收标准

- [x] **Given** App 有多于 1 次构建, **When** 查看详情页, **Then** 看到构建历史列表
- [x] **Given** 我是 App 作者, **When** 查看历史构建, **Then** 成功的旧构建旁有"回滚"按钮
- [x] **Given** 我点击回滚, **When** 确认操作, **Then** playUrl 和 buildId 更新为旧构建的值，页面刷新
- [x] **Given** 回滚完成, **When** 用户试玩, **Then** 看到的是回滚后的旧版本
- [x] **Given** 我不是 App 作者, **When** 查看构建历史, **Then** 可以看到历史但看不到回滚按钮

---

## 非功能需求

- **性能**: 构建历史复用 App 详情页已有的 Build include 查询（无需额外查询）
- **安全**: 回滚 action 校验作者身份
- **原子性**: 回滚使用单次 prisma update（非 transaction）

---

## 技术方案

### 数据模型

无 Schema 变更。回滚操作：

```typescript
async function rollbackApp(appId: string, buildId: string) {
  const build = await prisma.build.findUnique({ where: { id: buildId } })
  await prisma.app.update({
    where: { id: appId },
    data: { playUrl: build.artifactUrl, buildId: build.id }
  })
}
```

### 前端组件

新建 `src/app/apps/[id]/BuildHistory.tsx` (Client Component):
- 展开/折叠面板
- 构建时间线（左侧竖线 + 状态圆点）
- 成功(绿) / 失败(红) / 构建中(黄) / 等待(灰)
- 当前活跃版本: 蓝色边框高亮
- 回滚按钮: 作者可见，二次确认

### App 详情页修改

`apps/[id]/page.tsx`:
- prisma query 已 include builds (需要确认或以 `build.findMany` 补充)
- 传入 builds 数据给 BuildHistory 组件

---

## 依赖

- 现有 Build 模型 + App.playUrl/App.buildId
- 现有 BuildLogPanel（可复用日志展示逻辑）

---

## 关联

- Spec #001 (Docker 构建 Worker)
- Spec #007 (构建日志查看)
