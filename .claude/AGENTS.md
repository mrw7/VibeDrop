# VibeDrop Agent Workflow

**English** | [简体中文](AGENTS.zh-CN.md)

## Development workflow: Spec → Plan → Exec

Every feature or improvement follows a three-stage process:

### 1. Spec (requirements) — `.claude/specs/XXX-name.md`

**What & Why.** Product perspective: defines the problem and goals, without code details.

- User story
- Scope
- Acceptance criteria
- Out of scope

### 2. Plan (implementation plan) — `.claude/plans/XXX-name.md`

**How.** Technical perspective: designs the implementation.

- Technical choices
- List of file changes
- Data flow / component tree
- Risks and alternatives

### 3. Exec (execution record) — `.claude/exec/YYYY-MM-DD-name.md`

**Done.** Records the work actually completed.

- Files created / modified
- Deviations from the plan
- How the change was verified

---

## Numbering

Specs and Plans share a number, incrementing sequentially:
`001` → `002` → `003` ...

Exec records use a date prefix: `2026-07-02-xxx.md`

---

## Current document index

### Active Specs
(Specs currently in progress)

### Completed Specs
- `001-build-worker` — Docker build worker
- `002-user-profile` — User profiles
- `003-app-edit-delete` — App edit / delete
- `004-ui-design-system` — UI design system standardization
- `005-comment-delete` — Comment deletion
- `006-masonry-layout` — Masonry layout
- `007-build-log-ui` — Build log viewer
- `008-testing-infra` — Testing infrastructure

See `.claude/specs/_completed.md` for the full list (including Phase 2 and Phase 3 specs).

### Next Up
See `.scratch/` for open issues.

---

## Related documents

- `CONTEXT.md` — domain model glossary
- `STATUS.md` — project status overview
- `docs/prd-mvp.md` — full PRD
- `docs/adr/` — architecture decision records
- `.scratch/` — issue tracker
- `.claude/optimization/audit.md` — code audit and optimization roadmap
