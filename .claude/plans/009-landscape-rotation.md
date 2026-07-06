# Plan #009: 横屏/旋转支持

## 技术方案

### 架构

```
PhoneShell (Client Component)
├── orientation: "portrait" | "landscape"  ← 新增状态
├── deviceType toggle (iPhone/Android)      ← 已有
├── fullscreen toggle                       ← 已有
├── rotate toggle                           ← 新增
└── screen.orientation listener             ← 新增
```

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/app/apps/[id]/PhoneShell.tsx` | 修改 | 核心改动：新增 orientation 状态、旋转按钮、横屏外壳尺寸、orientation API 监听 |
| `src/app/globals.css` | 可能需要 | 旋转动画 keyframe |

### 数据模型

无 Schema 变更。

### PhoneShell 状态机

```
┌──────────┐  rotate   ┌───────────┐
│ portrait │ ────────→ │ landscape │
│  竖屏    │ ←──────── │   横屏    │
└────┬─────┘  rotate   └─────┬─────┘
     │ fullscreen            │ fullscreen
     ↓                       ↓
┌──────────┐           ┌───────────┐
│ portrait │           │ landscape │
│ fullscreen│          │ fullscreen│
└──────────┘           └───────────┘
```

### 外壳尺寸映射

```typescript
const SHELL_DIMENSIONS = {
  portrait:  { width: 320, height: 650 },
  landscape: { width: 650, height: 340 },
}

// iPhone 动态岛 + 底部 bar 在横屏时水平放置
```

### 实现步骤

1. 添加 `orientation` state + `RotateCw` 按钮到 PhoneShell 工具栏
2. 根据 orientation 调整外壳容器尺寸和 iframe 尺寸
3. 添加 `screen.orientation` 事件监听（移动端自动检测）
4. 全屏模式下横屏外壳也去掉
5. CSS transition 平滑过渡

### 风险

| 风险 | 概率 | 缓解 |
|------|------|------|
| screen.orientation 兼容性 | 中 | try/catch 降级，仅手动按钮 |
| iframe 内容在横屏下布局异常 | 低 | 横屏 iframe 宽度 630px，与桌面端网站一致 |
| CSS transition 卡顿 | 低 | 使用 transform 而非 width/height 动画 |
