# Exec: 测试基础设施 + Critical 修复

## 日期: 2026-07-02
## 关联: Spec #008, C0, C0.2

---

### 新建文件
- `playwright.config.ts` — Playwright 配置（chromium, baseURL, webServer auto-start）
- `vitest.config.ts` — Vitest 配置（node env, @ path alias）
- `tests/e2e/smoke.spec.ts` — 4 个 E2E smoke tests
- `tests/integration/prisma.test.ts` — DB 连接 + 环境变量测试
- `tests/integration/like.test.ts` — Server Action 导入测试
- `.gitignore` — 标准 Next.js gitignore
- `.claude/plans/008-testing-infra.md` — Plan 文档

### 修改文件
- `package.json` — 添加 `fflate` 依赖, `test`/`test:watch`/`test:e2e` 脚本
- `CLAUDE.md` — 更新文档索引
- `.claude/specs/008-testing-infra.md` — 已有 Spec

### 与 Plan 的偏差
- Vitest 集成测试当前只测试导入和环境变量，完整 DB 事务测试需要额外的测试基础设施（mock session），留到 Phase 2

### 验证结果
- [x] 配置文件语法正确
- [x] npm scripts 已添加
- [x] fflate 已加入 dependencies
- [x] .gitignore 已创建（覆盖 .env*.local）
