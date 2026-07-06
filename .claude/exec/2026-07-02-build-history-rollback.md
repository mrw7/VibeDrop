# Exec #010: App 版本管理/回滚

## 日期: 2026-07-02

## 实际变更

### 新建文件

`src/app/apps/[id]/BuildHistory.tsx` — 构建历史时间线组件:
- 展开/折叠面板（ChevronDown/ChevronRight）
- 构建时间线（左侧竖线连接器 + 状态圆点）
- 状态图标: CheckCircle(成功)/XCircle(失败)/Loader2(构建中)/Clock(等待)
- 当前版本: 蓝色边框高亮 + "当前版本" Badge
- 回滚按钮: 作者可见，仅对非当前的成功构建显示
- 内联日志展开（点击"查看日志"展开 monospace 日志）
- 耗时显示（completedAt - startedAt）

### 修改文件

`src/app/apps/[id]/actions.ts`:
- 新增 `rollbackApp(appId, buildId)` Server Action
- 权限校验: 作者身份
- 状态校验: 只能回滚到成功的构建
- 去重校验: 不允许回滚到当前版本
- 原子操作: 单次 `prisma.app.update` 更新 playUrl + buildId

`src/app/apps/[id]/page.tsx`:
- 新增 `builds` 查询: `prisma.build.findMany({ where: { appId }, orderBy: { startedAt: "desc" }, take: 10 })`
- 新增 `isAuthor` 计算结果
- 新增 `<BuildHistory>` 组件，放置在 BuildLogPanel 下方

### 关键决策

- 回滚不需要 transaction（单次 update 足够）
- 构建历史限制最近 10 条（`take: 10`）
- 组件默认折叠，减少视觉干扰
