# VibeDrop 项目状态文档

> 最后更新: 2026-07-02
> 覆盖: 43 个 Spec | 120+ 文件 | 8 Sprint MVP + 5 Phase 2 + 5 Phase 3 | Phase 3 完成

---

## 一、项目概述

**VibeDrop** — 面向 Vibe Coding 社区的 App 分享与试玩平台。

- **技术栈**: Next.js 15 + React 19 + TypeScript + TailwindCSS v4 + shadcn/ui + Prisma + PostgreSQL
- **认证**: NextAuth.js v5 + GitHub / Google OAuth + 邮箱密码
- **数据库**: Alibaba Cloud Supabase (PostgreSQL)
- **文件存储**: Alibaba Cloud OSS
- **构建**: Docker Worker (`scripts/build-worker.ts`)
- **测试**: Vitest + Playwright + GitHub Actions CI
- **许可证**: MIT (见 `LICENSE` / ADR-0005)

---

## 二、已完成的 Sprint

### Sprint 1: 基础设施 (Issues #2-#4)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| GitHub OAuth 登录 | ✅ | `src/lib/auth.ts`, `src/app/auth/signin/page.tsx` |
| ZIP 上传发布 | ✅ | `src/app/publish/page.tsx`, `src/app/publish/actions.ts` |
| GitHub 自动构建 | ✅ | `src/app/apps/[id]/build/`, `scripts/build-worker.ts` |
| Docker 构建 Worker | ✅ | `scripts/build-worker.ts`, `src/lib/build-executor.ts` |
| ZIP 静态文件托管 (fflate) | ✅ | `src/app/api/apps/[id]/deploy/route.ts` |

### Sprint 2: 社区功能 (Issues #5-#7)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| 社区大厅 + 搜索 + 筛选 | ✅ | `src/app/apps/page.tsx` |
| 混合排序算法 (DB 级别) | ✅ | PostgreSQL `EXTRACT(EPOCH...)` 表达式 |
| 手机外壳播放器 | ✅ | `src/app/apps/[id]/PhoneShell.tsx` (iPhone/Android/全屏) |
| 点赞/取消赞 ($transaction) | ✅ | `src/app/apps/[id]/LikeButton.tsx` |
| 评论 | ✅ | `src/app/apps/[id]/CommentForm.tsx` |
| 举报 | ✅ | `src/app/apps/[id]/ReportButton.tsx` |

### Sprint 3: UI 设计系统 (Spec #004)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| CSS 变量设计令牌 (oklch) | ✅ | `src/app/globals.css` — 20+ tokens + dark mode |
| 语义色 (success/warning/info) | ✅ | `globals.css` @theme block |
| PhoneShell 组件 | ✅ | `src/app/apps/[id]/PhoneShell.tsx` |
| Footer 组件 | ✅ | `src/components/Footer.tsx` |
| MobileMenu 汉堡菜单 | ✅ | `src/components/MobileMenu.tsx` |
| ThemeToggle 暗色切换 | ✅ | `src/components/ThemeToggle.tsx` (localStorage + matchMedia) |
| UserMenu 用户下拉菜单 | ✅ | `src/components/UserMenu.tsx` |
| 骨架屏 (loading.tsx ×2) | ✅ | `src/app/apps/loading.tsx`, `src/app/apps/[id]/loading.tsx` |
| 404 页面 ×3 | ✅ | `not-found.tsx` (全局 + App + 用户) |
| 全局 Error Boundary | ✅ | `src/app/error.tsx` |
| 可访问性 | ✅ | skip-to-content, aria, prefers-reduced-motion |

### Sprint 4: shadcn/ui 迁移

| 组件 | 状态 | 关键文件 |
|------|------|----------|
| Button (7 variants, 4 sizes) | ✅ | `src/components/ui/button.tsx` |
| Card 系列 | ✅ | `src/components/ui/card.tsx` |
| Dialog (Radix, 焦点陷阱) | ✅ | `src/components/ui/dialog.tsx` |
| Input / Textarea | ✅ | `src/components/ui/input.tsx`, `textarea.tsx` |
| Badge (6 variants) | ✅ | `src/components/ui/badge.tsx` |
| Label (Radix) | ✅ | `src/components/ui/label.tsx` |
| cn() 工具 | ✅ | `src/lib/utils.ts` (clsx + tailwind-merge) |
| lucide-react 图标全迁移 | ✅ | 替代手写 SVG，全项目统一 |

### Sprint 5: 补充功能 (Specs #002-#003, #005-#007)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| 用户个人主页 | ✅ | `src/app/users/[id]/page.tsx` |
| App 编辑/删除 | ✅ | `EditAppButton.tsx`, `DeleteAppButton.tsx` |
| 评论删除 (作者+App作者) | ✅ | `CommentDeleteButton.tsx`, `deleteComment` action |
| 瀑布流布局 (CSS columns) | ✅ | `columns-1 sm:columns-2 lg:columns-3` |
| 构建日志面板 | ✅ | `BuildLogPanel.tsx` |
| AppCard 共享组件 | ✅ | `src/components/AppCard.tsx` |
| 举报管理后台 | ✅ | `src/app/admin/reports/page.tsx` |

### Sprint 6: 安全加固

| 措施 | 状态 | 关键文件 |
|------|------|----------|
| XSS 防护 (sanitize-html) | ✅ | `src/lib/sanitize.ts` — Zod transform 层 |
| CSRF 防护 (Origin/Referer) | ✅ | `src/lib/csrf.ts` |
| CSP Headers (per-page) | ✅ | `next.config.ts` |
| HSTS + 6 安全 Headers | ✅ | `next.config.ts` |
| 速率限制 (20 req/min) | ✅ | `src/middleware.ts` |
| 环境变量启动校验 | ✅ | `src/lib/env.ts` |
| AES-256-GCM 加密 (node:crypto) | ✅ | `src/lib/encryption.ts` (替代 crypto-js) |
| Auth Cookie 安全配置 | ✅ | `src/lib/auth.ts` (secure, httpOnly, sameSite) |

### Sprint 7: 测试 + 性能 + CI

| 措施 | 状态 | 关键文件 |
|------|------|----------|
| Vitest 集成测试 (4 suites) | ✅ | `tests/integration/` |
| Playwright E2E (10 tests) | ✅ | `tests/e2e/` |
| GitHub Actions CI (3 jobs) | ✅ | `.github/workflows/ci.yml` |
| next/font/google 自托管字体 | ✅ | `src/app/layout.tsx` (Inter + JetBrains Mono) |
| 懒加载 PhoneShell | ✅ | `next/dynamic` |
| useAction Hook + Sonner Toast | ✅ | `src/lib/use-action.ts` |
| Zod 全链路校验 | ✅ | `src/lib/validations.ts` — 10 schemas |
| AppError 统一错误处理 | ✅ | `AppError` 类 (401/403/404/409/400) |
| DB 级别热排序 | ✅ | PostgreSQL EXTRACT(EPOCH...) |
| Prisma $transaction 竞态修复 | ✅ | Like/Unlike/Delete 全原子化 |
| DB 显式索引 (9 个) | ✅ | `prisma/schema.prisma` |

### Sprint 8: SEO + 打磨

| 措施 | 状态 | 关键文件 |
|------|------|----------|
| Sitemap (动态) | ✅ | `src/app/sitemap.ts` |
| Robots.txt | ✅ | `src/app/robots.ts` |
| Per-app OG Metadata | ✅ | `generateMetadata()` in `apps/[id]/page.tsx` |
| OG Image (Edge Runtime) | ✅ | `src/app/api/og/route.tsx` |
| 全局 404 + 用户 404 | ✅ | `not-found.tsx` ×2 |
| 移动端响应式打磨 | ✅ | columns/gap/padding 断点适配 |

### Sprint 9: Phase 2 功能 (#009-#013)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| 横屏/旋转支持 | ✅ | `PhoneShell.tsx` — orientation state + rotate button + screen.orientation API |
| App 版本管理/回滚 | ✅ | `BuildHistory.tsx`, `rollbackApp` action |
| 分享卡片定制 (3 模板) | ✅ | `api/og/route.tsx` — gradient/dark/minimal |
| Fork 机制 | ✅ | `ForkButton.tsx`, `forkApp` action, `prisma.schema` forkedFrom |
| Expo/Flutter 自动构建 | ✅ | `build-executor.ts` — detectBuildCommand 扩展 |

### Sprint 10: 代码审计 + 修复

| 类别 | 问题数 | 状态 |
|------|--------|------|
| Critical (P0) | 4 | ✅ 全部修复 |
| High (P1) | 6 | ✅ 全部修复 |
| Medium (P2) | 5 | ✅ 全部修复 |
| Low (P3) | 4 | ✅ 3/4 修复 |

---

## 三、数据库 Schema

| Model | 关键字段 | 索引 |
|-------|----------|------|
| User | githubId (unique), githubLogin, githubAccessToken (AES加密) | — |
| App | authorId, sourceType, buildStatus, tags, counters | authorId, buildStatus, aiToolTag, techStackTag, createdAt |
| Build | appId, status, buildLog, artifactUrl | appId, startedAt |
| Like | userId+appId (unique) | appId |
| Comment | userId, appId, content | appId, userId |
| Report | appId, reporterId, reason, resolved | appId, resolved |

---

## 四、待完成 (Phase 2+)

### Phase 2 功能 (全部完成)

| 任务 | 状态 |
|------|------|
| 横屏/旋转支持 | ✅ #009 |
| App 版本管理/回滚 | ✅ #010 |
| 分享卡片定制 (OG Image) | ✅ #011 |
| Fork 机制 | ✅ #012 |
| Expo / Flutter 自动 web 构建 | ✅ #013 |
| CDN 配置 | ⏸ 阿里云控制台 (非代码) |

### Phase 3 (全部完成)

| 任务 | 状态 |
|------|------|
| 浏览器内代码编辑器 | ✅ #014 |
| 邮箱/密码认证 | ✅ #015 |
| 多用户协作 | ✅ #016 |
| 支付/打赏系统 | ✅ #017 |
| 原生云模拟器 | ✅ #018 |

---

## 五、环境变量

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."          # ≥16 字符
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
OSS_REGION="oss-us-west-1"
OSS_BUCKET="vibedrop"
OSS_ACCESS_KEY_ID="..."
OSS_ACCESS_KEY_SECRET="..."
ENCRYPTION_KEY="..."           # ≥32 字符
ADMIN_GITHUB_IDS="..."         # 可选，逗号分隔的 GitHub user IDs
```

---

## 六、启动命令

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev                    # 开发服务器 (Turbopack)
npm run build-worker           # 构建 Worker
npm test                       # Vitest 集成测试
npm run test:e2e               # Playwright E2E
npm run typecheck              # TypeScript 检查
```

---

## 七、文档索引

| 文档 | 路径 |
|------|------|
| 工作流指南 | `.claude/AGENTS.md` |
| Spec 索引 | `.claude/specs/_completed.md` |
| 领域模型 | `CONTEXT.md` |
| 产品需求 | `docs/prd-mvp.md` (27 User Stories) |
| 架构决策 | `docs/adr/0001-0005` |
| 代码审计 | `.claude/optimization/audit-2026-07-02.md` |
| Issue 跟踪 | `.scratch/` |
