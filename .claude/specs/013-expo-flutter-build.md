# Spec #013: Expo / Flutter 自动 Web 构建

## 状态: done

## 创建日期: 2026-07-02

---

## 用户故事

As a **Flutter/Expo developer**,
I want **VibeDrop to automatically build my web app from my GitHub repo**,
so that **I can share my cross-platform app without manually building for web**.

---

## 问题描述

当前 Worker 仅支持标准 Node.js 项目（`npm install && npm build`）。Expo 和 Flutter 项目需要不同的构建命令和输出目录。

---

## 功能范围

### In Scope

**框架自动检测** (按优先级):
1. **React Native / Expo** — `package.json` 含 `expo` 依赖
2. **Flutter** — 目录含 `pubspec.yaml`
3. **纯静态** — 目录含 `index.html`（无需构建）
4. **标准 Node** — `package.json` 含 build script（现有逻辑）

**构建命令映射**:

| 框架 | 检测条件 | 构建命令 | 输出目录 |
|------|----------|----------|----------|
| Expo | `package.json` 含 `expo` | `npx expo export:web` | `dist` |
| Flutter | `pubspec.yaml` 存在 | `flutter build web` | `build/web` |
| Static | `index.html` 存在 | (无) | `.` (根目录) |
| Node (默认) | `package.json` 有 `build` | `npm run build` | `out` / `dist` / `build` |

### Out of Scope
- Docker Worker 中预装 Flutter SDK（运维文档说明）
- iOS/Android 原生构建
- 构建缓存优化

---

## 验收标准

- [x] **Given** Expo 项目, **When** Worker 检测, **Then** 使用 `npx expo export:web` 构建
- [x] **Given** Flutter 项目, **When** Worker 检测, **Then** 使用 `flutter build web` 构建
- [x] **Given** 纯静态项目, **When** Worker 检测, **Then** 直接上传文件
- [x] **Given** 未知项目类型, **When** 检测失败, **Then** 构建失败并记录日志

---

## 依赖

- 现有 `src/lib/build-executor.ts` — `detectBuildCommand` 函数
- Worker Docker 镜像需包含 Flutter SDK（仅 Flutter 项目需要）
