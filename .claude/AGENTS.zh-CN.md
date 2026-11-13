# VibeDrop Agent Workflow

**简体中文** | [English](AGENTS.md)

## 开发流程：Spec → Plan → Exec

每个功能或改进遵循三段式流程：

### 1. Spec（需求说明）— `.claude/specs/XXX-name.md`

**What & Why**。产品视角，定义问题和目标，不写代码细节。

- 用户故事 (User Story)
- 功能范围 (Scope)
- 验收标准 (Acceptance Criteria)
- 不做什么 (Out of Scope)

### 2. Plan（实施方案）— `.claude/plans/XXX-name.md`

**How**。技术视角，设计实现方案。

- 技术选型
- 文件变更清单
- 数据流 / 组件树
- 风险点与备选方案

### 3. Exec（执行记录）— `.claude/exec/YYYY-MM-DD-name.md`

**Done**。记录实际完成的工作。

- 创建/修改了哪些文件
- 与 Plan 的偏差
- 验证方式

---

## 编号规则

Spec 和 Plan 共享编号，按顺序递增：
- `001` → `002` → `003` ...

Exec 使用日期前缀：`2026-07-02-xxx.md`

---

## 当前文档索引

### Active Specs
（当前正在进行的 spec）

### Completed Specs
- `001-build-worker` — Docker 构建 Worker
- `002-user-profile` — 用户个人主页
- `003-app-edit-delete` — App 编辑/删除
- `004-ui-design-system` — UI 设计系统标准化
- `005-comment-delete` — 评论删除
- `006-masonry-layout` — 瀑布流布局
- `007-build-log-ui` — 构建日志查看
- `008-testing-infra` — 测试基础设施

完整列表（含 Phase 2 / Phase 3）见 `.claude/specs/_completed.md`。

### Next Up
见 `.scratch/` 中未关闭的 issue。

---

## 关联文档

- `CONTEXT.md` — 领域模型术语表
- `STATUS.md` — 项目状态总览
- `docs/prd-mvp.md` — 完整 PRD
- `docs/adr/` — 架构决策记录
- `.scratch/` — Issue 跟踪
- `.claude/optimization/audit.md` — 代码审计与优化路线图
