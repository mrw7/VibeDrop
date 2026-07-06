# Spec #014: 浏览器内代码编辑器

## 状态: done (Phase 3 MVP)

## 创建日期: 2026-07-02

---

## 用户故事

As a **vibe coder who just forked an app**,
I want **to edit the code directly in my browser**,
so that **I can remix and improve it without leaving VibeDrop**.

As an **app author**,
I want **to make quick fixes to my app in the browser**,
so that **I don't need to clone the repo locally for small changes**.

---

## 问题描述

当前 Fork 流程是: Fork → 自动构建 → 等待 → 试玩。完整的 remix 闭环缺失了最关键的"编辑"环节。用户需要浏览器内代码编辑器来修改源码并触发重新构建。

---

## 功能范围

### In Scope (Phase 3 MVP)

**编辑器页面**: `/apps/[id]/editor`
- 全屏 IDE 布局: 左侧文件树 + 右侧 Monaco Editor
- 支持 GitHub 源 App（通过 GitHub API 获取文件列表和内容）
- 文件树: 展开/折叠目录，点击文件在编辑器中打开
- Monaco Editor: 语法高亮、自动补全、多文件 Tab
- "Save & Rebuild" 按钮: 上传修改后的文件 → 创建新 Build
- 构建状态实时显示（复用 BuildLogPanel 轮询逻辑）
- 仅 App 作者可访问编辑器

### Out of Scope
- ZIP 源 App 的在线编辑（需要解压/重打包，Phase 3.1）
- Git 版本控制（commit/push/diff）
- 多文件同时编辑（Tab 切换，不同时显示）
- 实时预览（iframe 不跟随编辑实时刷新）
- 协作编辑
- 终端/命令行

---

## 验收标准

- [x] **Given** 作者进入 `/apps/[id]/editor`, **When** 页面加载, **Then** 看到文件树 + 空编辑器
- [x] **Given** 文件树显示, **When** 点击文件, **Then** Monaco Editor 加载并显示文件内容
- [x] **Given** 修改文件, **When** 点击 "Save & Rebuild", **Then** 触发新构建并显示状态
- [x] **Given** 非作者, **When** 访问编辑器, **Then** 重定向到 App 详情页
- [x] **Given** 构建完成, **When** 查看 App, **Then** 试玩的是修改后的版本

---

## 技术方案

### 页面结构

```
/apps/[id]/editor
├── Header (minimal: logo + back link)
├── FileTree (左侧 ~250px)
│   ├── 目录展开/折叠
│   └── 文件点击 → 加载内容
└── EditorArea (右侧 flex-1)
    ├── Tab bar (当前打开的文件)
    ├── Monaco Editor
    └── Toolbar: [Save & Rebuild] [Back to App]
```

### 数据流

```
1. 进入编辑器
   → GET /api/apps/[id]/files      ← GitHub API (src/ 目录)
   → 返回文件树 JSON
   
2. 点击文件
   → GET /api/apps/[id]/files?path=src/App.tsx
   → 返回文件内容

3. Save & Rebuild
   → POST /api/apps/[id]/save       ← 上传修改的文件
   → 创建 ZIP → 上传 OSS → 创建 Build
   → Worker 捡取构建
```

### 依赖

- `@monaco-editor/react` — Monaco Editor React 封装 (~2MB lazy loaded)
- GitHub REST API (通过用户 OAuth token)
- 现有 Build Worker

### 安全

- 编辑器 API 校验作者身份
- 限制编辑文件路径 (防止路径遍历)
- 文件大小限制 (单个文件 ≤ 1MB)
