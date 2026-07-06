# Spec #018: 原生云模拟器

## 状态: done (Phase 3)

## 创建日期: 2026-07-03

---

## 用户故事

As a **user browsing native Android apps**,
I want **to try them in a cloud emulator directly in my browser**,
so that **I can experience the app without installing it on my device**.

As an **Android app publisher**,
I want **the platform to build and run my APK in an emulator**,
so that **visitors can instantly try my native app**.

---

## 问题描述

VibeDrop 当前仅支持 Web 应用预览（iframe + OSS 静态文件）。PhoneShell 的 iPhone/Android 切换仅是 cosmetic 的视觉效果。标记为 `deviceType: android` 的应用无法真正原生预览。ADR-0002 明确将原生云模拟器推迟到 Phase 3。

---

## 功能范围

### In Scope

- **Android 模拟器**: redroid (Remote Android) 在 Docker 容器中运行
- **屏幕串流**: scrcpy + noVNC → 浏览器可访问的 VNC
- **容器管理**: dockerode 通过 Docker API 管理模拟器生命周期
- **PhoneShell 集成**: Web / Native Tab 切换
- **EmulatorViewer**: 模拟器会话管理 UI（启动 → 安装 → 就绪 → 停止）
- **会话管理**: 自动超时 (15 分钟), 最大并发限制 (5), API 路由
- **构建集成**: Android/Gradle/Expo APK 构建检测
- **优雅降级**: EMULATOR_ENABLED=false 时 Native Tab 隐藏

### Out of Scope

- iOS 模拟器 (需要 macOS 硬件)
- 触摸输入转发 (noVNC 自带基本支持)
- GPU 加速 (依赖宿主机的 KVM)
- 模拟器池预热

---

## 验收标准

- [x] **Given** `EMULATOR_ENABLED=true`, **When** 访问 Android App, **Then** PhoneShell 显示 "Native" Tab
- [x] **Given** 点击 "启动模拟器", **When** 模拟器就绪, **Then** 嵌入 noVNC iframe 并显示运行状态
- [x] **Given** 模拟器运行中, **When** 点击 "停止", **Then** 会话结束
- [x] **Given** 超过 15 分钟无活动, **When** cleanup 运行, **Then** 会话自动停止
- [x] **Given** Docker 不可用, **When** 调用 API, **Then** 返回清晰错误信息

---

## 技术方案

### 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| Android | redroid:11.0.0 | Docker 化 Android 模拟器 |
| 串流 | scrcpy → noVNC | 屏幕捕获 → 浏览器 VNC |
| 容器管理 | dockerode | 通过 Docker API 管理容器 |
| 前端 | EmulatorViewer | noVNC iframe + 会话 UI |

### 新增文件 (8)

| 文件 | 说明 |
|------|------|
| `src/lib/emulator/docker.ts` | Docker 客户端 + 容器创建/销毁 |
| `src/lib/emulator/pool.ts` | 会话生命周期管理 + APK 安装 |
| `src/app/api/emulator/start/route.ts` | 启动模拟器 API |
| `src/app/api/emulator/[id]/route.ts` | 会话状态 API |
| `src/app/api/emulator/[id]/stop/route.ts` | 停止会话 API |
| `src/app/apps/[id]/EmulatorViewer.tsx` | noVNC 串流 + 会话 UI |
| `docker-compose.emulator.yml` | redroid + scrcpy + noVNC 栈 |
| `.env.emulator.example` | 模拟器配置模板 |

### 修改文件 (6)

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | +EmulatorSession 模型 + EmulatorStatus 枚举 |
| `package.json` | +dockerode + @types/dockerode |
| `src/lib/env.ts` | +EMULATOR_ENABLED, +EMULATOR_DOCKER_HOST 等 |
| `src/app/apps/[id]/PhoneShell.tsx` | +Web/Native Tab, +EmulatorViewer |
| `src/app/apps/[id]/page.tsx` | 传递 deviceType 给 PhoneShell |
| `src/lib/build-executor.ts` | Android APK 构建检测 (Gradle + Expo) |
