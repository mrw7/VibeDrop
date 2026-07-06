# Spec #006: 瀑布流布局

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As a **visitor**,
I want **apps displayed in a masonry/waterfall layout**,
so that **I can visually scan many apps with varying cover image heights at once**.

---

## 问题描述

PRD Story #12 明确要求瀑布流布局（masonry layout），当前是固定高度 `aspect-video` + 统一卡片。封面图被裁剪为统一比例，无法展示完整画面，视觉单调。

---

## 功能范围

### In Scope
- CSS-only masonry（`columns` 属性）或轻量 JS masonry
- 封面图按原始比例展示（限制最大高度）
- 响应式：3列（lg）、2列（md）、1列（sm）

### Out of Scope
- 无限滚动加载（仍用分页或一次性加载）
- 拖拽排序
- 个性化推荐排序

---

## 验收标准

- [x] 桌面端 ≥3 列瀑布流
- [x] 平板端 2 列
- [x] 移动端 1 列
- [x] 卡片高度随封面图自适应
- [x] 动画过渡平滑

---

## 非功能需求

- **性能**: 纯 CSS 方案优先（避免 JS 布局闪烁），`columns` 属性或 `grid` + `masonry`（实验性）
- **可访问性**: 不影响键盘导航和屏幕阅读器

---

## 依赖

- 无

---

## 技术备注

CSS `column-count` 是最简单的纯 CSS 瀑布流方案，但 item 顺序是竖向排列（column 1 → column 2 → ...），可能不符合"最新在上"的期望。替代方案：
1. `display: grid` + `grid-template-rows: masonry`（Chrome 实验性，Safari TP 支持）
2. JS-based: `react-masonry-css` 或 `masonry-layout` 库
3. 手动 CSS columns + 数据预排

推荐方案 3（纯 CSS columns），对于社区浏览场景，竖向排列可接受。
