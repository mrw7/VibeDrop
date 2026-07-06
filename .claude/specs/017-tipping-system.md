# Spec #017: 支付/打赏系统

## 状态: done (Phase 3)

## 创建日期: 2026-07-03

---

## 用户故事

As a **visitor impressed by an app**,
I want **to send a monetary tip to the creator**,
so that **I can show appreciation and support their work**.

As an **app creator**,
I want **to receive tips and see my earnings**,
so that **I'm motivated to share more apps on VibeDrop**.

---

## 问题描述

VibeDrop 没有任何变现/打赏机制。优秀的创作者没有获得经济激励的途径。需要添加打赏系统。

---

## 功能范围

### In Scope

- Stripe Checkout 集成（托管的支付页面，PCI 合规）
- 预设打赏金额：¥5 / ¥10 / ¥20 / ¥50
- 可选留言（最多 200 字符）
- Stripe Webhook 处理支付确认
- Tip 记录持久化（含金额、留言、Stripe Session ID）
- App 详情页展示打赏按钮 + 打赏统计
- 用户资料页展示打赏统计
- 支付成功后显示 toast 通知
- 无 Stripe 密钥时优雅降级（隐藏打赏 UI）

### Out of Scope

- 自定义打赏金额
- 支付方式扩展（Alipay、WeChat Pay）
- 平台抽成
- 创作者提现/ payout
- 打赏历史页面
- 邮件通知

---

## 验收标准

- [x] **Given** 登录用户查看他人 App, **When** 点击打赏, **Then** 看到金额选择弹窗
- [x] **Given** 选择金额后, **When** 点确认, **Then** 跳转到 Stripe Checkout 页面
- [x] **Given** 支付成功, **When** Stripe webhook 触发, **Then** Tip 记录创建 + App 计数更新
- [x] **Given** 支付完成, **When** 返回 App 页, **Then** 看到成功 toast
- [x] **Given** 创作者资料页, **When** 查看统计, **Then** 看到 "打赏" 统计
- [x] **Given** 未配置 Stripe, **When** 查看 App 页, **Then** 不显示打赏按钮

---

## 技术方案

### Schema

```prisma
model Tip {
  id              String   @id @default(uuid())
  tipperId        String
  appId           String
  recipientId     String
  amount          Int                    // 金额（分）
  currency        String   @default("cny")
  message         String?
  stripeSessionId String   @unique
  createdAt       DateTime @default(now())
}
```

App 模型新增: `tipsCount Int @default(0)`, `tipsTotal Int @default(0)`

### 支付流程

```
用户 → TipDialog (选金额) → createCheckoutSession (server action)
  → Stripe.checkout.sessions.create() → redirect to Stripe
  → Stripe 支付页 → 支付成功/取消
  → redirect to /apps/[id]?tipped=success (或取消)
  → Stripe Webhook → POST /api/webhooks/stripe
  → 验证签名 → 创建 Tip 记录 → 更新 App 计数
```

### 新增依赖

- `stripe` — 服务端 SDK（创建 Checkout Session + 验证 Webhook）

### 新增文件 (7)

| 文件 | 说明 |
|------|------|
| `src/lib/stripe.ts` | Stripe 客户端 + 预设金额常量 |
| `src/app/apps/[id]/tips/actions.ts` | createCheckoutSession |
| `src/app/api/webhooks/stripe/route.ts` | Stripe Webhook 处理器 |
| `src/app/apps/[id]/TipButton.tsx` | 打赏按钮 + 金额弹窗 |
| `src/app/apps/[id]/TipStats.tsx` | 打赏统计展示 |
| `src/app/apps/[id]/TipSuccessToast.tsx` | 支付成功 toast |

### 修改文件 (7)

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | +Tip 模型, +tipsCount/tipsTotal, +relations |
| `package.json` | +stripe |
| `src/lib/validations.ts` | +createTipSchema |
| `src/lib/env.ts` | +STRIPE_SECRET_KEY, +STRIPE_WEBHOOK_SECRET |
| `src/middleware.ts` | Webhook 路径绕过速率限制 |
| `src/app/apps/[id]/page.tsx` | +TipButton, +TipStats, +TipSuccessToast |
| `src/app/apps/[id]/actions.ts` | deleteApp cascade + Tip 清理 |
| `src/app/users/[id]/page.tsx` | +打赏统计 |

### 开发测试

- Stripe 测试密钥 (`sk_test_...`)
- 测试卡号: `4242 4242 4242 4242`
- Webhook 转发: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
