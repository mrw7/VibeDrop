# Plan #008: 测试基础设施

## 关联 Spec: #008

## 技术方案

### Phase 1: Playwright E2E

- 安装 `@playwright/test`
- 创建 `playwright.config.ts`，指向 `http://localhost:3000`
- 创建 4 个 smoke tests：
  1. 首页加载 → hero 可见
  2. `/apps` 列表页加载
  3. App 详情页加载（用已知 ID 或 mock）
  4. 登录页渲染 GitHub 按钮

### Phase 2: Vitest 集成测试

- 安装 `vitest` + `@vitejs/plugin-react`
- 创建 `vitest.config.ts`
- 创建 2 个集成测试：
  1. Prisma client 连接测试
  2. Server Action: likeApp / unlikeApp 事务正确性

### 文件变更

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `playwright.config.ts` | Playwright 配置 |
| 新建 | `vitest.config.ts` | Vitest 配置 |
| 新建 | `tests/e2e/smoke.spec.ts` | Playwright smoke tests |
| 新建 | `tests/integration/prisma.test.ts` | DB 连接测试 |
| 新建 | `tests/integration/like.test.ts` | Like 事务测试 |
| 修改 | `package.json` | 添加 test / test:e2e 脚本 |

### 风险

| 风险 | 缓解 |
|------|------|
| 测试依赖真实数据库 | 使用 `.env.test` 或跳过无 DB 环境的测试 |
| Playwright 需要浏览器 | `npx playwright install chromium` |
