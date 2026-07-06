# Exec #018: 原生云模拟器

## 日期: 2026-07-03

## 实际变更

### 新增文件 (9)

- `src/lib/emulator/docker.ts` — Docker 客户端 (dockerode), 容器创建/停止/端口分配
- `src/lib/emulator/pool.ts` — 会话池管理: startSession, installApk, stopSession, cleanupStaleSessions
- `src/app/api/emulator/start/route.ts` — POST: 创建模拟器会话 + 异步安装 APK
- `src/app/api/emulator/[id]/route.ts` — GET: 查询会话状态 (starting/running/installing/ready/error)
- `src/app/api/emulator/[id]/stop/route.ts` — POST: 停止会话 + 清理容器
- `src/app/apps/[id]/EmulatorViewer.tsx` — 客户端组件: 会话生命周期 UI (idle→starting→ready→error) + noVNC iframe
- `docker-compose.emulator.yml` — redroid + scrcpy + noVNC 参考架构
- `.env.emulator.example` — 模拟器环境变量模板
- `.claude/specs/018-native-cloud-emulator.md` — Spec 文档

### 修改文件 (6)

- `prisma/schema.prisma` — +EmulatorSession 模型 + EmulatorStatus 枚举 + User/App relations
- `package.json` — +dockerode@^4.0.0 + @types/dockerode@^3.3.0
- `src/lib/env.ts` — +EMULATOR_ENABLED, +EMULATOR_DOCKER_HOST, +EMULATOR_MAX_SESSIONS, +EMULATOR_SESSION_TIMEOUT
- `src/app/apps/[id]/PhoneShell.tsx` — +playMode state, +Web/Native Tab switcher, +EmulatorViewer 集成, +deviceType prop
- `src/app/apps/[id]/page.tsx` — 传递 deviceType 到 PhoneShell
- `src/lib/build-executor.ts` — +Android Gradle 项目检测 (assembleRelease) + Expo Android 检测 (expo run:android)

### 关键决策

- **redroid + scrcpy + noVNC**: 成熟的 Android-in-Docker 方案，浏览器通过 VNC 访问
- **dockerode**: 服务端通过 Docker API 创建/管理容器，替代 shell 脚本
- **按需创建**: 每个用户点击"启动模拟器"后创建独立容器，非预热池模式
- **会话状态机**: starting → running → installing → ready (5 种状态)
- **自动清理**: 15 分钟超时 + 最大 5 并发限制
- **优雅降级**: `EMULATOR_ENABLED=false` (默认) 时完全不加载 Docker 逻辑
- **APK 构建**: build-executor 新增 Android 项目检测 (Gradle + Expo Android)
- **Android only**: iOS 模拟器需要 macOS 硬件，明确 out of scope

### 部署须知

1. 运行 `npm install` 安装 dockerode
2. 运行 `npx prisma db push` 同步 schema
3. 配置环境变量:
   ```bash
   EMULATOR_ENABLED=true
   NEXT_PUBLIC_EMULATOR_ENABLED=true
   EMULATOR_DOCKER_HOST=/var/run/docker.sock
   EMULATOR_MAX_SESSIONS=5
   EMULATOR_SESSION_TIMEOUT=15
   ```
4. 确保宿主机支持 KVM:
   ```bash
   # Linux
   ls /dev/kvm && echo "KVM available" || echo "KVM not available"
   # WSL2: needs nested virtualization enabled in Windows
   ```
5. 拉取 redroid 镜像: `docker pull redroid/redroid:11.0.0-latest`
6. 实际生产部署推荐使用支持 KVM 的云服务器（如阿里云 ECS 裸金属实例）
