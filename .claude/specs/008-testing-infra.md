# Spec #008: 测试基础设施

## 状态: done (Phase 1 complete)

## 创建日期: 2026-07-02

---

## 用户故事

As a **developer**,
I want **tests to exist for critical flows**,
so that **I can refactor without fear of breaking existing functionality**.

---

## 问题描述

当前测试覆盖率为 0%。PRD 明确要求 Vitest + Playwright。任何后续开发都在没有安全网的情况下进行。

---

## 功能范围

### In Scope — Phase 1: Smoke Tests

**Playwright (E2E)**:
1. 未登录访问首页 → 看到 hero
2. 未登录浏览 /apps → 看到作品列表
3. 未登录点击 App → 看到详情页（PhoneShell）
4. 访问 /auth/signin → 看到登录按钮

**Vitest (Integration)**:
1. App CRUD: create → read → update → delete
2. Like toggle: like → unlike → count 正确
3. Comment add → delete (Spec #005)
4. Build trigger → status poll → 状态变化

### In Scope — Phase 2: Full Coverage

- 所有 Server Actions 的成功/失败路径
- 边界情况：空列表、超大输入、并发操作
- 权限测试：未登录访问受保护路由

### Out of Scope
- 100% 代码覆盖率
- 视觉回归测试
- 性能/负载测试

---

## 验收标准

- [x] `npm test` 运行 Vitest 集成测试
- [x] `npm run test:e2e` 运行 Playwright E2E
- [x] CI 中测试自动运行 (GitHub Actions)
- [x] 核心流程至少有一个测试覆盖

---

## 非功能需求

- **速度**: Vitest 测试应在 30s 内完成
- **隔离**: 使用测试数据库（独立 DATABASE_URL）或事务回滚
- **确定性**: 测试不依赖外部服务（OSS、GitHub API 使用 mock）

---

## 技术方案（备选）

### 方案 A: 测试数据库 (推荐)
- 独立的 Supabase 项目或本地 PostgreSQL Docker
- 每个 test suite 前后运行 `prisma migrate reset`
- 优点：接近真实环境
- 缺点：速度较慢

### 方案 B: 事务回滚
- 每个 test 包裹在 Prisma 事务中，完成后 rollback
- 优点：快，不需要额外数据库
- 缺点：不能测试真实的并发行为

**推荐**: 方案 A 用于 CI，方案 B 用于本地开发
