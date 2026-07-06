# VibeDrop

VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台。

## 开发工作流

每个功能走三段式：**Spec（需求）→ Plan（方案）→ Exec（记录）**

详见 `.claude/AGENTS.md`。

### 文档索引

| 文档 | 位置 | 用途 |
|------|------|------|
| 工作流指南 | `.claude/AGENTS.md` | Spec/Plan/Exec 流程说明 |
| 项目状态 | `STATUS.md` | 已完成/进行中/待办总览 |
| 领域模型 | `CONTEXT.md` | 术语表 + 实体关系 |
| 产品需求 | `docs/prd-mvp.md` | 完整 PRD (27 个 User Story) |
| 架构决策 | `docs/adr/` | 架构决策记录 |
| 代码审计 | `.claude/optimization/audit-2026-07-02.md` | 代码质量审计 + 优化路线图 |
| 已完成 Specs | `.claude/specs/_completed.md` | #001-#013 已完成功能 |
| Phase 2 Specs | `.claude/specs/009-013-*.md` | #009-#013 Phase 2 已完成 |
| Phase 3 Specs | `.claude/specs/014-*.md` | #014+ Phase 3 规划中 |
| Issue 跟踪 | `.scratch/` | 本地 markdown issue 文件 |

### Issue tracker

Issues 通过本地 markdown 文件跟踪，存放在 `.scratch/` 目录。详见 `docs/agents/issue-tracker.md`。

### Triage labels

使用默认的五个标准标签：`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`。详见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文仓库结构。`CONTEXT.md` 位于仓库根目录，`docs/adr/` 存放架构决策记录。详见 `docs/agents/domain.md`。
