# Exec #009: 横屏/旋转支持

## 日期: 2026-07-02

## 实际变更

### 修改文件

`src/app/apps/[id]/PhoneShell.tsx` — 完全重写核心逻辑:

1. **新增 orientation 状态** — `"portrait" | "landscape"`，默认竖屏
2. **旋转按钮** — `RotateCw` 图标按钮，工具栏第三位（设备切换 → 旋转 → 全屏）
3. **横屏外壳尺寸** — `650×340px`（竖屏 `320×650px`）
4. **横屏 Notch 适配** — iPhone 动态岛水平放置（竖屏顶部居中 → 横屏左侧居中）
5. **横屏状态栏** — 时间 + WiFi/电池图标从水平排列改为垂直排列
6. **横屏 Home Indicator** — 从底部水平条 → 右侧垂直条
7. **横屏内容区** — padding 从 `pt-12 pb-6` 改为 `pl-8 pr-0`
8. **screen.orientation API 监听** — 移动端自动检测设备方向，不支持时降级为手动按钮
9. **CSS transition** — `transition-all duration-400 ease-in-out` 平滑切换
10. **lucide-react 图标替换** — Loader2 (代替 spinner SVG)、AlertTriangle (代替 warning SVG)、Play (代替 play SVG)、Maximize/Minimize (代替 fullscreen SVG)、RotateCw (新增)

### 技术决策

- **自动检测 + 手动按钮共存**: 移动端自动跟随设备方向，桌面端可手动切换（`screen.orientation` 桌面端通常不支持，自动降级）
- **不重新加载 iframe**: 仅 CSS transform 切换，iframe 内容保持运行状态
- **横屏外壳圆角调整**: `rounded-[2rem]` 适配更宽的边框

### 未涉及

- 横屏 PhoneShell 未添加独立的 Android 状态栏布局（当前复用竖屏元素）
- 未使用 Device Orientation API 的重力感应（`deviceorientation` 事件）
