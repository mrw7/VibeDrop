# Exec #011: 分享卡片定制 (OG Image)

## 日期: 2026-07-02

## 实际变更

### 重写文件

`src/app/api/og/route.tsx` — 完全重写（180 行 → 带 3 模板的组件化架构）:

**架构**:
- 3 个独立模板组件: `GradientTemplate`, `DarkCardTemplate`, `MinimalTemplate`
- 共享组件: `AccentBar` (底部渐变条), `Logo`, `StatsRow` (统计行)
- 通过 `?template=gradient|dark|minimal` 选择模板
- 默认 `gradient`

**模板详情**:

| 模板 | 背景 | 特色 |
|------|------|------|
| Gradient | 深蓝→紫渐变 | 升级版现有样式 + Stats 行 |
| Dark Card | 深色卡片 + 左侧渐变条 | 现代卡片风格，品牌红渐变条 |
| Minimal | 浅灰背景 | 简洁文字排版，底部 VibeDrop 标记 |

**新增数据展示**:
- `👤 author` 作者名
- `❤️ N` 点赞数
- `💬 N` 评论数
- `🛠 tool` AI 工具标签

### 修改文件

`src/app/apps/[id]/page.tsx` — `generateMetadata()` OG URL 添加 `&template=gradient`
`src/app/metadata.ts` — 全局 OG URL 添加 `&template=gradient`
