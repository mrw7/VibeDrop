# 已完成的 Specs

## Spec #001: Docker 构建 Worker

**状态**: done (2026-07-02)

### 用户故事
As an app publisher, I want the platform to actually build my GitHub repo and host the output, so that my app is playable.

### 功能范围
- Worker 进程轮询 DB 中 pending 状态的 Build
- 克隆 GitHub 仓库（支持私有仓库通过 OAuth Token）
- 自动检测构建命令（package.json scripts）
- 执行 npm install + npm build
- 上传构建产物到 OSS
- 更新 Build 状态和 App playUrl

### Out of Scope
- Docker-in-Docker 构建隔离
- 非 Node.js 项目构建（Flutter、Expo 等 → Phase 2）
- 构建缓存

### 验收标准
- [x] Worker 启动后自动捡取 pending 构建
- [x] 构建成功 → status "success" + playUrl 更新
- [x] 构建失败 → status "failed" + buildLog 记录错误
- [x] 并发控制（最大 2 个并行构建）

### 关联文件
- `scripts/build-worker.ts`
- `src/lib/build-executor.ts`
- `src/app/apps/[id]/build/actions.ts`

---

## Spec #002: 用户个人主页

**状态**: done (2026-07-02)

### 用户故事
As a visitor, I want to see an app's author profile, so that I can follow their work. (PRD Story #17)

### 功能范围
- `/users/[id]` 展示用户头像、名称、GitHub 登录名
- 统计：作品数、获赞数、评论数
- 用户发布的所有 App（按时间倒序）
- 从 App 卡片/详情页作者名可跳转

### 验收标准
- [x] 页面正确展示用户信息和作品列表
- [x] 统计数字准确
- [x] App 卡片和详情页的作者名可点击跳转

---

## Spec #003: App 编辑/删除

**状态**: done (2026-07-02)

### 用户故事
As an app publisher, I want to edit or delete my published app, so that I can fix mistakes or remove outdated content.

### 功能范围
- 编辑弹窗：标题、描述、AI 工具标签、技术栈标签、目标设备
- 删除确认弹窗：级联删除关联数据
- 仅作者本人可见编辑/删除按钮

### Out of Scope
- 封面图更换
- 源码更换（ZIP/GitHub 重选）

### 验收标准
- [x] 作者在详情页看到编辑/删除按钮
- [x] 编辑表单预填当前值，提交后刷新
- [x] 删除需二次确认，确认后级联删除并跳转

---

## Spec #004: UI 设计系统标准化

**状态**: done (2026-07-02)

### 功能范围
- 消除所有硬编码颜色，替换为 CSS 变量令牌
- 新增 success/warning/info 语义色
- 创建缺失组件：PhoneShell、Footer、MobileMenu、ThemeToggle
- 创建缺失状态页：loading、error、not-found
- 可访问性改进

### 验收标准
- [x] 所有页面在亮/暗模式下颜色正确
- [x] PhoneShell 支持 iPhone/Android 切换 + 全屏
- [x] 移动端汉堡菜单可用
- [x] 暗色模式可手动切换 + 跟随系统偏好

---

## Spec #005: 评论删除

**状态**: done (2026-07-02)

### 功能范围
- 评论作者删除自己的评论
- App 作者删除其作品下的任何评论
- 删除前二次确认（CommentDeleteButton）
- 删除后 `$transaction` 原子更新 `commentsCount`

### 关联文件
- `src/app/apps/[id]/actions.ts` — `deleteComment` action
- `src/app/apps/[id]/CommentDeleteButton.tsx`

---

## Spec #006: 瀑布流布局

**状态**: done (2026-07-02)

### 功能范围
- CSS-only masonry: `columns-1 sm:columns-2 lg:columns-3`
- 封面图按原始比例展示
- `break-inside-avoid` 防止卡片断裂

### 关联文件
- `src/app/apps/page.tsx`
- `src/components/AppCard.tsx`

---

## Spec #007: 构建日志查看

**状态**: done (2026-07-02)

### 功能范围
- App 详情页构建日志面板（PhoneShell 下方）
- 构建中轮询展示最新日志
- 构建失败自动展开，JetBrains Mono 等宽字体

### 关联文件
- `src/app/apps/[id]/BuildLogPanel.tsx`

---

## Spec #008: 测试基础设施

**状态**: done — Phase 1 (2026-07-02)

### 功能范围
- Playwright E2E: 5 smoke + 5 navigation tests
- Vitest Integration: 4 test suites (actions, prisma, like, sanitize)
- GitHub Actions CI: lint → typecheck → test → build

### 关联文件
- `tests/e2e/`, `tests/integration/`, `tests/helpers/`
- `.github/workflows/ci.yml`
- `playwright.config.ts`, `vitest.config.ts`

---

## Spec #009: 横屏/旋转支持

**状态**: done (2026-07-02)

### 功能范围
- PhoneShell 横屏外壳 (650×340px)
- screen.orientation API 移动端自动检测
- 手动旋转按钮 (RotateCw)
- 横屏 Notch/状态栏/Home Indicator 适配
- CSS transition 平滑过渡

### 关联文件
- `src/app/apps/[id]/PhoneShell.tsx`

---

## Spec #010: App 版本管理/回滚

**状态**: done (2026-07-02)

### 功能范围
- 构建历史时间线 (最近 10 次)
- 状态图标 + 耗时显示
- 回滚到任意成功构建
- 作者权限校验

### 关联文件
- `src/app/apps/[id]/BuildHistory.tsx`
- `src/app/apps/[id]/actions.ts` — `rollbackApp`

---

## Spec #011: 分享卡片定制 (OG Image)

**状态**: done (2026-07-02)

### 功能范围
- 3 模板: Gradient / Dark Card / Minimal
- Stats 行: 👤 author · 🛠 tool · ❤️ likes · 💬 comments
- 通过 `?template=` URL param 切换

### 关联文件
- `src/app/api/og/route.tsx`
- `src/app/metadata.ts`

---

## Spec #012: Fork 机制

**状态**: done (2026-07-02)

### 功能范围
- 一键 Fork (复制源码/标签/封面)
- Schema 自引用: `forkedFromId` + `forksCount`
- 自动创建 pending Build
- "Forked from" 归属显示

### 关联文件
- `prisma/schema.prisma` — forkedFromId, forksCount, ForkRelation
- `src/app/apps/[id]/ForkButton.tsx`
- `src/app/apps/[id]/actions.ts` — `forkApp`

---

## Spec #013: Expo/Flutter 自动 Web 构建

**状态**: done (2026-07-02)

### 功能范围
- Expo 检测: `package.json` 含 `expo` → `npx expo export:web`
- Flutter 检测: `pubspec.yaml` → `flutter build web`
- 静态 HTML 检测 (已有)
- 标准 Node 构建 (已有)

### 关联文件
- `src/lib/build-executor.ts` — `detectBuildCommand()`
- `playwright.config.ts`, `vitest.config.ts`

---

## Spec #015: 邮箱/密码认证

**状态**: done (2026-07-03)

### 用户故事
As a visitor without GitHub, I want to sign up with email + password, so that I can use the platform.

### 功能范围
- 邮箱 + 密码注册 + 邮箱验证
- 邮箱 + 密码登录（Credentials Provider）
- 密码重置流程
- 登录页 Tab 切换（GitHub / 邮箱）
- 显示名称适配（name || githubLogin || "用户"）
- Auth 端点速率限制 (5 req/min)

### Out of Scope
- OAuth 账号关联
- 2FA / 多因素认证

### 验收标准
- [x] 注册 → 收到验证邮件 → 验证 → 可登录
- [x] 邮箱用户发布 ZIP App 正常工作
- [x] GitHub 登录继续正常工作
- [x] 密码重置流程完整可用

### 关联文件
- `prisma/schema.prisma` — User 模型变更
- `src/lib/auth.ts` — +Credentials provider
- `src/lib/password.ts`, `src/lib/tokens.ts`, `src/lib/email.ts` — 工具库
- `src/app/auth/actions.ts` — 5 个 server actions
- `src/app/auth/signin/page.tsx` — Tab 切换重构
- `src/app/auth/signup/page.tsx` — 注册页
- `src/app/auth/verify/page.tsx` — 验证页
- `src/app/auth/reset-password/page.tsx` — 忘记密码
- `src/app/auth/reset-password/[token]/page.tsx` — 设新密码
- `src/app/api/auth/verify/route.ts` — 验证 API
- `src/middleware.ts` — Auth 速率限制

---

## Spec #016: 多用户协作

**状态**: done (2026-07-03)

### 用户故事
As an app author, I want to add collaborators to my app, so that we can edit and manage it together as a team.

### 功能范围
- App 作者通过用户名搜索添加协作者（editor 角色）
- 协作者可编辑代码、编辑元数据、触发构建、回滚
- 协作者不能删除 App 或管理其他协作者
- 权限抽象化: `src/lib/permissions.ts` — canEditApp, canManageApp, requireEditAccess, requireOwnerAccess
- App 详情页展示协作者列表 + 管理弹窗
- 用户资料页展示 "协作的作品"
- Fork 按钮对作者和协作者均隐藏
- 用户搜索 API: GET `/api/users/search?q=`

### Out of Scope
- 邀请邮件通知
- Viewer 角色
- 所有权转移

### 验收标准
- [x] Owner 可搜索用户并添加为协作者
- [x] 协作者看到编辑按钮、Edit Code 链接，可访问编辑器
- [x] 协作者可触发 Save & Rebuild
- [x] 协作者看不到删除按钮和协作者管理按钮
- [x] 非协作者访问编辑器时重定向
- [x] Owner 可移除协作者
- [x] 用户资料页展示协作的 App

### 关联文件
- `prisma/schema.prisma` — +Collaborator 模型 + CollaboratorRole 枚举
- `src/lib/permissions.ts` — 权限检查抽象层
- `src/app/apps/[id]/collaborators/actions.ts` — 协作者 CRUD
- `src/app/apps/[id]/CollaboratorSection.tsx` — 协作者列表
- `src/app/apps/[id]/AddCollaboratorDialog.tsx` — 管理弹窗
- `src/app/api/users/search/route.ts` — 用户搜索 API
- `src/app/apps/[id]/actions.ts` — 权限检查更新
- `src/app/apps/[id]/build/actions.ts` — triggerBuild 权限
- `src/app/apps/[id]/editor/page.tsx` — 编辑器权限
- `src/app/api/apps/[id]/files/route.ts` — 文件 API 权限
- `src/app/api/apps/[id]/save/route.ts` — 保存 API 权限
- `src/app/api/apps/[id]/deploy/route.ts` — 部署 API 权限
- `src/app/apps/[id]/page.tsx` — UI 权限 + 协作者展示
- `src/app/apps/[id]/BuildHistory.tsx` — isAuthor→canEdit
- `src/app/users/[id]/page.tsx` — +协作作品
- `src/lib/validations.ts` — +2 schemas

---

## Spec #017: 支付/打赏系统

**状态**: done (2026-07-03)

### 功能范围
- Stripe Checkout 集成（托管支付页，PCI 合规）
- 预设金额 ¥5/¥10/¥20/¥50 + 可选留言
- Stripe Webhook 处理支付确认 + Tip 记录
- App 详情页打赏按钮 + 统计，用户资料页打赏统计
- 未配置 Stripe 时优雅降级

### 验收标准
- [x] 登录用户点击打赏 → 选金额 → 跳转 Stripe Checkout
- [x] 支付成功后 webhook 创建 Tip 记录 + 更新计数
- [x] 返回 App 页显示成功 toast
- [x] 创作者资料页显示打赏统计
- [x] 未配置 Stripe 时打赏 UI 隐藏

### 关联文件
- `prisma/schema.prisma` — +Tip 模型 + tipsCount/tipsTotal on App
- `src/lib/stripe.ts` — Stripe 客户端 + 预设金额
- `src/app/apps/[id]/tips/actions.ts` — createCheckoutSession
- `src/app/api/webhooks/stripe/route.ts` — Webhook 处理器
- `src/app/apps/[id]/TipButton.tsx` — 打赏按钮 + 金额弹窗
- `src/app/apps/[id]/TipStats.tsx` — 打赏统计
- `src/app/apps/[id]/TipSuccessToast.tsx` — 成功 toast
- `src/app/apps/[id]/page.tsx` — +TipButton/TipStats
- `src/app/users/[id]/page.tsx` — +打赏统计
- `src/middleware.ts` — webhook 绕过速率限制
- `src/lib/validations.ts` — +createTipSchema
- `src/lib/env.ts` — +STRIPE vars
- `package.json` — +stripe

---

## Spec #018: 原生云模拟器

**状态**: done (2026-07-03)

### 功能范围
- Android 模拟器 (redroid in Docker, KVM 加速)
- 屏幕串流 (scrcpy → noVNC → 浏览器)
- 容器管理 (dockerode API)
- PhoneShell Web/Native Tab 切换
- EmulatorViewer 会话 UI (启动→安装→就绪→停止)
- 自动超时 (15 分钟) + 并发限制 (5)
- Android APK 构建检测 (Gradle + Expo)
- 优雅降级 (EMULATOR_ENABLED=false 时隐藏)

### Out of Scope
- iOS 模拟器 (需要 macOS)
- 模拟器池预热
- GPU 加速配置

### 验收标准
- [x] EMULATOR_ENABLED=true 时 Android App 显示 Native Tab
- [x] 启动模拟器 → noVNC iframe 嵌入 → 运行状态指示
- [x] 停止按钮终止会话 + 清理容器
- [x] Docker 不可用时 API 返回清晰错误
- [x] 构建检测 Android/Gradle/Expo-Android 项目

### 关联文件
- `prisma/schema.prisma` — +EmulatorSession 模型 + EmulatorStatus 枚举
- `src/lib/emulator/docker.ts` — Docker 容器操作
- `src/lib/emulator/pool.ts` — 会话池管理 + APK 安装
- `src/app/api/emulator/start/route.ts` — 启动 API
- `src/app/api/emulator/[id]/route.ts` — 状态 API
- `src/app/api/emulator/[id]/stop/route.ts` — 停止 API
- `src/app/apps/[id]/EmulatorViewer.tsx` — noVNC 串流 + 会话 UI
- `src/app/apps/[id]/PhoneShell.tsx` — Web/Native Tab + EmulatorViewer
- `docker-compose.emulator.yml` — Docker 基础设施参考
- `src/lib/build-executor.ts` — Android APK 构建
- `package.json` — +dockerode
