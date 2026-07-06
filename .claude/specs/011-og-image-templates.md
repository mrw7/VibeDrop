# Spec #011: 分享卡片定制 (OG Image)

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As an **app publisher**,
I want **my shared links to have beautiful preview cards on Twitter/Discord/Slack**,
so that **my app looks professional and attracts more players**.

As a **platform operator**,
I want **VibeDrop links to stand out in social feeds**,
so that **the platform gets organic growth through link sharing**.

---

## 问题描述

当前 OG Image (`/api/og`) 只有一个基础模板 — 深蓝渐变 + 标题。缺少:
1. 多种视觉模板选择
2. Stats 展示（点赞/评论数）
3. 品牌视觉增强

---

## 功能范围

### In Scope

**3 个 OG Image 模板** (通过 `?template=` 选择):

| 模板 | 参数值 | 风格 | 适用场景 |
|------|--------|------|----------|
| Gradient (默认) | `gradient` | 深蓝→紫渐变 + 白色标题 | 通用，现有升级版 |
| Dark Card | `dark` | 深色卡片 + 左侧色条 | 技术感，代码类 App |
| Minimal | `minimal` | 浅灰背景 + 黑色文字 | 简洁优雅 |

**新增数据展示**:
- 点赞数 + 评论数（通过 searchParams 传入）
- 作者名显示
- AI 工具标签
- 模板参数 `?template=gradient|dark|minimal`

### Out of Scope
- 封面图嵌入（Edge Runtime 不支持外部图片 fetch）
- 动态字体加载
- 视频/动图 OG
- 用户自定义模板

---

## 验收标准

- [x] `?template=dark` 返回暗色卡片风格 OG 图
- [x] `?template=minimal` 返回简洁风格 OG 图
- [x] 传入 `?likes=5&comments=3` 在图中显示统计数据
- [x] 未指定 template 时默认使用 gradient
- [x] 1200×630 尺寸不变

---

## 技术方案

Edge Runtime 约束:
- 仅支持 JSX 渲染 → 无外部图片
- Google Fonts 不可用 → 使用系统字体
- 所有数据通过 URL params 传入

### URL 参数设计

```
/api/og?title=MyApp&author=username&tool=Cursor&type=app&template=dark&likes=12&comments=5
```

### generateMetadata 更新

`apps/[id]/page.tsx` 的 `generateMetadata()` 传入新参数:
```typescript
const ogImageUrl = `${BASE_URL}/api/og?title=...&tool=...&type=app&author=...&likes=${app.likesCount}&comments=${app.commentsCount}&template=gradient`
```

---

## 依赖

- 现有 `/api/og/route.tsx` (Edge Runtime, ImageResponse)
