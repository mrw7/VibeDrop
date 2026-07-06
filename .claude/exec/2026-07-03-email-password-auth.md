# Exec #015: 邮箱/密码认证

## 日期: 2026-07-03

## 实际变更

### 新增文件 (10)

- `src/lib/password.ts` — bcryptjs 密码哈希/验证（SALT_ROUNDS=12）
- `src/lib/tokens.ts` — crypto.randomBytes token 生成（验证 24h 过期，重置 1h 过期）
- `src/lib/email.ts` — nodemailer 邮件发送，dev 模式 console.log 验证链接
- `src/app/auth/actions.ts` — 5 个 server actions: signUp, signInWithPassword, requestPasswordReset, resetPassword, resendVerificationEmail
- `src/app/api/auth/verify/route.ts` — GET handler 验证邮箱 token
- `src/app/auth/signup/page.tsx` — 注册表单（名称/邮箱/密码/确认密码 + 客户端校验）
- `src/app/auth/verify/page.tsx` — 验证通知页（重发/错误展示）
- `src/app/auth/reset-password/page.tsx` — 忘记密码请求页
- `src/app/auth/reset-password/[token]/page.tsx` — 新密码设置页
- `.claude/specs/015-email-password-auth.md` — Spec 文档

### 修改文件 (14)

- `prisma/schema.prisma` — User 模型: githubId/githubLogin 改为可选，新增 name/passwordHash/resetToken/resetTokenExpiry，email 添加 @unique + @@index
- `package.json` — +nodemailer@^6.9.0, +@types/nodemailer@^6.4.0
- `src/lib/auth.ts` — +Credentials provider (email/password → bcrypt verify → return user)，signIn callback 添加 name 字段，session callback 添加 email
- `src/lib/validations.ts` — +signUpSchema, +signInSchema, +passwordResetRequestSchema, +passwordResetSchema，+AppError.tooManyRequests, +AppError.emailNotVerified
- `src/lib/utils.ts` — +getUserDisplayName(name||githubLogin||"用户"), +getUserAvatarUrl(image||avatarUrl||default)
- `src/app/auth/signin/page.tsx` — 完全重构为 Tab 切换 (GitHub / 邮箱)，github tab 用 next-auth/react signIn，email tab 用 server action
- `src/app/apps/[id]/page.tsx` — author/comments 改用 getUserDisplayName/getUserAvatarUrl，Prisma select 增加 name 字段
- `src/app/apps/page.tsx` — SQL 增加 u."name"，author 映射增加 name 字段
- `src/app/users/[id]/page.tsx` — 使用 getUserDisplayName/getUserAvatarUrl，条件显示 "通过 GitHub 登录" / "通过邮箱注册"
- `src/components/AppCard.tsx` — AppCardAuthor 接口增加 name 字段，githubLogin 改为可选，使用显示名辅助函数
- `src/components/Header.tsx` — "GitHub 登录" → "登录"
- `src/components/MobileMenu.tsx` — "GitHub 登录" → "登录"
- `src/middleware.ts` — +auth 路径专用速率限制 (5 req/min)，matcher 扩展为 /api|/publish|/auth
- `src/lib/env.ts` — +SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM 到 OPTIONAL_VARS

### 关键决策

- **邮件发送**: 使用 nodemailer（零外部依赖，支持任意 SMTP），dev 模式打印链接到控制台
- **Token 复用**: 邮箱验证和密码重置共用 User 表的 resetToken/resetTokenExpiry 字段（简化 schema）
- **密码哈希**: bcryptjs（已有依赖，rounds=12）
- **凭证验证**: 返回 `null` 而非抛错（防止邮箱枚举），但 email_not_verified 需抛特定错误
- **邮件枚举防护**: requestPasswordReset 和 resendVerificationEmail 无论邮箱是否存在都返回 success
- **速率限制**: auth 端点 5 req/min vs 普通端点 20 req/min

### 部署须知

1. 运行 `npm install` 安装 nodemailer
2. 运行 `npx prisma db push` 同步 schema 变更
3. 配置 SMTP 环境变量（可选，不配置时 dev 模式打印链接到控制台）
4. GitHub OAuth 继续正常工作，无需额外配置
