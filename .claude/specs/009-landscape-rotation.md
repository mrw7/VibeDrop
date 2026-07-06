# Spec #009: 横屏/旋转支持

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As a **visitor**,
I want **to rotate the phone shell to landscape mode**,
so that **I can play games and watch videos in widescreen**.

As a **mobile visitor**,
I want **the phone shell to auto-adapt when I rotate my device**,
so that **I get a native-like fullscreen experience on my phone**.

---

## 问题描述

当前 PhoneShell 仅支持竖屏模式。许多 vibe-coded apps 是游戏或视频类应用，在横屏下有更好的体验。PRD Phase 2 明确要求横屏/旋转支持。

---

## 功能范围

### In Scope
- PhoneShell 新增旋转按钮（竖屏 ↔ 横屏切换）
- 横屏模式下手机外壳适配（更宽、更矮、状态栏位置调整）
- CSS transition 过渡动画（旋转时平滑切换）
- 自动检测：移动端设备横放时自动切换横屏模式（`screen.orientation` API）
- 横屏全屏模式（去掉手机外壳，仅 iframe）
- 桌面端默认竖屏，手动切换

### Out of Scope
- 传感器级别的重力感应（只用 orientation API）
- iPad/平板专用外壳
- 自定义旋转角度（仅支持 0° / 90°）

---

## 验收标准

- [x] **Given** 桌面端用户在 App 详情页, **When** 点击旋转按钮, **Then** 手机外壳从竖屏变为横屏
- [x] **Given** 移动端用户横放设备, **When** `orientation` 变为 landscape, **Then** PhoneShell 自动切换为横屏模式
- [x] **Given** 横屏模式, **When** 查看 iframe 内容, **Then** 内容在横屏比例下正常显示
- [x] **Given** 横屏 + 全屏, **When** 查看 iframe, **Then** 去掉手机外壳，iframe 填充整个可用区域
- [x] **Given** 切换方向, **When** CSS transition 播放, **Then** 旋转动画 < 400ms 且流畅

---

## 非功能需求

- **性能**: 旋转使用 CSS transform + transition，不重新加载 iframe
- **可访问性**: 旋转按钮有 aria-label="切换横竖屏"
- **兼容性**: `screen.orientation` 降级处理（不支持的浏览器仅显示手动按钮）

---

## 技术方案

### 方向状态管理

```typescript
type Orientation = "portrait" | "landscape"

// PhoneShell 内部 useState
const [orientation, setOrientation] = useState<Orientation>("portrait")

// 自动检测: screen.orientation API
useEffect(() => {
  const handleChange = () => {
    const type = screen.orientation?.type
    if (type?.startsWith("landscape")) setOrientation("landscape")
    else setOrientation("portrait")
  }
  screen.orientation?.addEventListener("change", handleChange)
  return () => screen.orientation?.removeEventListener("change", handleChange)
}, [])
```

### PhoneShell 尺寸

| 模式 | 竖屏 | 横屏 |
|------|------|------|
| iPhone | w320 × h650 | w650 × h340 |
| Android | w320 × h650 | w650 × h340 |
| 全屏 | 100vw × 100vh | 100vw × 100vh |

### 旋转按钮

```
PhoneShell 右上角新增 RotateCw 图标按钮
点击 → orientation toggle → CSS transition
```

---

## 依赖

- 无外部依赖
- 复用现有 PhoneShell.tsx + iframe

---

## 参考

- PRD Story #20 (全屏模式) — 横屏是其自然延伸
- PRD Phase 2: Horizontal orientation / rotation support
- CSS `screen.orientation` API: https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
