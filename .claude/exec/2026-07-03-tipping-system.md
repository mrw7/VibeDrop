# Exec #017: 支付/打赏系统

## 日期: 2026-07-03

## 实际变更

### 新增文件 (7)

- `src/lib/stripe.ts` — 惰性初始化 Stripe 客户端 + `TIP_PRESETS` 常量 + 金额限制常量
- `src/app/apps/[id]/tips/actions.ts` — `createCheckoutSession` server action
- `src/app/api/webhooks/stripe/route.ts` — Stripe Webhook 处理器 (签名验证 + Tip 记录 + 计数更新)
- `src/app/apps/[id]/TipButton.tsx` — 打赏按钮 + 金额选择弹窗（shadcn Dialog）
- `src/app/apps/[id]/TipStats.tsx` — 打赏统计展示组件
- `src/app/apps/[id]/TipSuccessToast.tsx` — 支付成功 toast（useSearchParams + sonner）
- `.claude/specs/017-tipping-system.md` — Spec 文档

### 修改文件 (8)

- `prisma/schema.prisma` — +Tip 模型 (+3 索引), App 增加 tipsCount/tipsTotal, User 增加 tipsSent/tipsReceived
- `package.json` — +stripe@^17.0.0
- `src/lib/validations.ts` — +createTipSchema (appId, amount 100-999999 分, message)
- `src/lib/env.ts` — +STRIPE_SECRET_KEY, +STRIPE_WEBHOOK_SECRET
- `src/middleware.ts` — `/api/webhooks/` 路径绕过速率限制
- `src/app/apps/[id]/actions.ts` — deleteApp cascade 增加 `prisma.tip.deleteMany`
- `src/app/apps/[id]/page.tsx` — +TipButton, +TipStats, +TipSuccessToast (Suspense)
- `src/app/users/[id]/page.tsx` — +tipAgg 查询 + 打赏 StatBadge

### 关键决策

- **Stripe Checkout（托管支付页）**: 不需要前端 Stripe SDK，仅服务端创建 Checkout Session + redirect
- **金额预设**: ¥5/¥10/¥20/¥50，最小 ¥1.00，最大 ¥9,999.99
- **货币**: 硬编码 CNY（中文平台）
- **Webhook 签名验证**: `stripe.webhooks.constructEvent()` — 防止伪造回调
- **幂等性**: `stripeSessionId @unique` — 重复 webhook 事件静默忽略
- **优雅降级**: `getStripe()` 返回 null 时，打赏 UI 隐藏
- **中间件**: Webhook 路径跳过速率限制（Stripe 服务器不受 IP 限制）
- **denormalized counters**: `tipsCount`/`tipsTotal` 在 App 表作为缓存（与 `likesCount`/`commentsCount` 模式一致）

### 部署须知

1. 运行 `npm install` 安装 stripe
2. 运行 `npx prisma db push` 同步 schema
3. 配置 Stripe 密钥:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
4. 开发环境 Webhook 转发:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
5. 生产环境在 Stripe Dashboard 配置 Webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
