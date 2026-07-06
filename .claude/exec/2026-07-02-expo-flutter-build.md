# Exec #013: Expo / Flutter 自动 Web 构建

## 日期: 2026-07-02

## 实际变更

### 修改文件

`src/lib/build-executor.ts` — `detectBuildCommand()` 函数扩展:

**新增框架检测** (按优先级):

1. **Expo / React Native Web** — `package.json` 含 `expo` 或 `react-native`
   → `npx expo export:web` → 输出 `dist/`

2. **Flutter** — 目录含 `pubspec.yaml`
   → `flutter pub get && flutter build web` → 输出 `build/web/`

3. **纯静态** (已有) — 目录含 `.html` 文件
   → 无构建 → 直接上传

4. **标准 Node** (已有) — `package.json` + build script
   → `npm install && npm run build` → 自动检测输出目录

### 检测顺序

```
package.json?
├── Yes → expo/react-native? → Expo 构建
│         → No → Node.js 标准构建
│
pubspec.yaml?
├── Yes → Flutter 构建
│
*.html?
├── Yes → 纯静态 (无构建)
│
Fallback → npm install && npm run build
```

### 关键决策

- Expo 构建优先使用 `npm run export:web` (如果 scripts 中有)，否则 fallback 到 `npx expo export:web`
- Flutter 需要 Worker 环境预装 Flutter SDK（运维/文档事项）
- 纯静态项目直接上传整个工作目录
