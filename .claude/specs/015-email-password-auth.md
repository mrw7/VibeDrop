# Spec #015: 邮箱/密码认证

## 状态: done (Phase 3)

## 创建日期: 2026-07-03

---

## 用户故事

As a **visitor without a GitHub account**,
I want **to sign up with my email and password**,
so that **I can use VibeDrop without creating a GitHub account**.

As a **registered email user**,
I want **to reset my forgotten password**,
so that **I can regain access to my account**.

As an **existing GitHub user**,
I want **GitHub login to continue working unchanged**,
so that **my workflow is not disrupted**.

---

## 问题描述

VibeDrop 当前仅支持 GitHub OAuth 登录 (ADR-0003)，没有 GitHub 账号的用户无法使用平台。需要添加邮箱/密码认证作为替代方式。

---

## 功能范围

### In Scope

- 邮箱 + 密码注册（名称 + 邮箱 + 密码）
- 邮箱验证（发送验证链接 → 点击确认）
- 邮箱 + 密码登录（NextAuth Credentials Provider）
- 密码重置（忘记密码 → 邮件链接 → 设新密码）
- 登录页改造（GitHub / 邮箱 Tab 切换）
- 与 GitHub OAuth 并存，互不影响
- 显示名称：邮箱用户使用注册名称，GitHub 用户使用 GitHub 名称
- 速率限制：auth 端点 5 req/min（防暴力破解）

### Out of Scope

- OAuth 账号关联（GitHub 用户绑定密码）
- 2FA / 多因素认证
- 社交登录扩展（Google, Apple 等）
- 账户删除 / 数据导出

---

## 验收标准

- [x] **Given** 新用户, **When** 在 `/auth/signup` 注册, **Then** 收到验证邮件，数据库创建未验证用户
- [x] **Given** 未验证用户, **When** 点击验证链接, **Then** emailVerified 更新，可正常登录
- [x] **Given** 已验证邮箱用户, **When** 在 `/auth/signin` 邮箱 Tab 登录, **Then** 成功登录并跳转到首页
- [x] **Given** 已有 GitHub 用户, **When** 在 `/auth/signin` GitHub Tab 登录, **Then** 仍正常工作
- [x] **Given** 用户忘记密码, **When** 请求重置并设置新密码, **Then** 可用新密码登录
- [x] **Given** 邮箱用户没有 GitHub token, **When** 发布 ZIP App, **Then** 正常发布

---

## 技术方案

### Schema 变更

- `User.githubId` → 改为可选 (`String?`)
- `User.githubLogin` → 改为可选 (`String?`)
- 新增: `name`, `passwordHash`, `resetToken`, `resetTokenExpiry`
- `email` 添加 `@unique` 约束
- 添加 `@@index([email])`

### 新增依赖

- `nodemailer` + `@types/nodemailer` (SMTP 邮件发送)

### 新增文件 (10)

| 文件 | 说明 |
|------|------|
| `src/lib/password.ts` | bcrypt 密码哈希/验证 |
| `src/lib/tokens.ts` | crypto 随机 token 生成 |
| `src/lib/email.ts` | nodemailer 邮件发送（dev 模式 console.log） |
| `src/app/auth/actions.ts` | signUp, signInWithPassword, requestPasswordReset, resetPassword, resendVerification |
| `src/app/api/auth/verify/route.ts` | 邮箱验证 GET handler |
| `src/app/auth/signup/page.tsx` | 注册页（含客户端校验） |
| `src/app/auth/verify/page.tsx` | 验证结果/重发页 |
| `src/app/auth/reset-password/page.tsx` | 忘记密码页 |
| `src/app/auth/reset-password/[token]/page.tsx` | 设置新密码页 |

### 修改文件 (10)

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | User 模型字段变更 |
| `package.json` | +nodemailer, +@types/nodemailer |
| `src/lib/auth.ts` | +Credentials provider, 更新 callbacks |
| `src/lib/validations.ts` | +5 auth schemas, +2 AppError methods |
| `src/lib/utils.ts` | +getUserDisplayName, +getUserAvatarUrl |
| `src/app/auth/signin/page.tsx` | 改为 Tab 切换 (GitHub/邮箱) |
| `src/app/apps/[id]/page.tsx` | 使用 getUserDisplayName |
| `src/app/apps/page.tsx` | SQL + 映射更新 |
| `src/app/users/[id]/page.tsx` | 使用 getUserDisplayName，条件显示 provider |
| `src/components/AppCard.tsx` | 使用 getUserDisplayName/getUserAvatarUrl |
| `src/components/Header.tsx` | "GitHub 登录" → "登录" |
| `src/components/MobileMenu.tsx` | "GitHub 登录" → "登录" |
| `src/middleware.ts` | Auth 端点速率限制 (5 req/min) |
| `src/lib/env.ts` | +SMTP 可选变量 |
