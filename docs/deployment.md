# VibeDrop 部署指南

本地 Docker 测试 → 阿里云 ECS 生产部署。

---

## 一、本地 Docker 测试

本地栈使用 `docker-compose.yml`，包含 postgres + app(dev 热重载) + worker。

### 步骤

```bash
# 1. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 GitHub OAuth、OSS 等（DATABASE_URL 已由 compose 覆盖到本地 db）

# 2. 启动本地栈
docker compose up --build

# 3. 首次需要创建数据库 schema（另开终端）
docker compose exec app npx prisma migrate dev --name init
# 或（开发用）:
docker compose exec app npx prisma db push

# 4. 验证
curl http://localhost:3000          # 应返回首页
```

### 连接云端 Supabase（可选）

如果想本地连云数据库而非本地 postgres，编辑 `.env.local` 的 `DATABASE_URL`，
然后在 compose 里注释掉 `app`/`worker` 的 `DATABASE_URL` 覆盖和 `db` 服务的 `depends_on`。

---

## 二、阿里云 ECS 生产部署

生产栈使用 `docker-compose.prod.yml`，包含 app(standalone) + worker + nginx + certbot。
**不含 postgres**——连接阿里云 Supabase/RDS。

### 2.1 ECS 准备

1. **购买 ECS**：建议 4 核 8G+（worker 构建用户项目较吃资源）
2. **安装 Docker**：
   ```bash
   # Alibaba Cloud Linux 3
   dnf install -y docker
   systemctl enable --now docker
   # docker compose v2 已内置于新版 Docker
   ```
3. **安全组开放端口**：80 (HTTP) + 443 (HTTPS)
4. **DNS**：A 记录指向 ECS 公网 IP

### 2.2 部署代码

```bash
# 在 ECS 上
git clone <repo> /opt/vibedrop
cd /opt/vibedrop

# 配置生产环境变量（在此生成所有密钥，勿从开发机拷贝）
cp .env.production.example .env.production
openssl rand -hex 16    # → NEXTAUTH_SECRET
openssl rand -hex 32    # → ENCRYPTION_KEY
vi .env.production       # 填入所有真实值 + DOMAIN=your.domain
```

### 2.3 构建并启动

```bash
# 传入 DOMAIN（nginx 模板需要）
export DOMAIN=your.domain

docker compose -f docker-compose.prod.yml up -d --build
```

首次启动后，app 容器的 entrypoint 会自动执行 `prisma migrate deploy` 应用迁移。

### 2.4 申请 SSL 证书（Let's Encrypt）

```bash
# 确保 DNS 已生效
DOMAIN=your.domain EMAIL=you@example.com ./nginx/init-letsencrypt.sh
```

完成后 HTTPS 自动可用。证书由 certbot 容器每 12 小时检查续期。

### 2.5 更新部署

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
# app entrypoint 会自动 migrate deploy
```

---

## 三、Worker 镜像：扩展构建能力

worker 默认能构建：**Node.js / 静态 HTML**（含 `npm install` + `npm run build`）。
要支持 **Expo / Flutter / 原生 Android**，需在 `Dockerfile` 的 `worker-runner` 阶段加装 SDK：

```dockerfile
# Flutter（~1.5GB）
# RUN apk add --no-cache flutter

# JDK（Android Gradle 构建）
# RUN apk add --no-cache openjdk17
```

加装后重建 worker：
```bash
docker compose -f docker-compose.prod.yml build worker
docker compose -f docker-compose.prod.yml up -d worker
```

---

## 四、备份与运维

| 任务 | 命令 |
|------|------|
| 查看日志 | `docker compose -f docker-compose.prod.yml logs -f app` |
| 查看构建日志 | `docker compose -f docker-compose.prod.yml logs -f worker` |
| 重启服务 | `docker compose -f docker-compose.prod.yml restart app` |
| 进入容器 | `docker compose -f docker-compose.prod.yml exec app sh` |
| 数据库状态 | `docker compose -f docker-compose.prod.yml exec app npx prisma migrate status` |
| 手动续期证书 | `docker compose -f docker-compose.prod.yml run --rm certbot renew` |

**数据库备份**：由阿里云 Supabase/RDS 自动备份，无需本地操作。

---

## 五、安全检查清单（上线前）

- [ ] 所有密钥已重新生成（`NEXTAUTH_SECRET`、`ENCRYPTION_KEY`、OSS key、GitHub OAuth secret、DB 密码）
- [ ] `.env.production` 已加入 `.gitignore`，未提交
- [ ] `ENCRYPTION_KEY` 轮换已协调（会让已加密的 GitHub token 失效）
- [ ] ECS 安全组仅开放 80/443
- [ ] GitHub OAuth 回调 URL 已改为生产域名
- [ ] Stripe webhook 端点已在 Dashboard 配置为 `https://YOUR_DOMAIN/api/webhooks/stripe`
- [ ] `NEXTAUTH_URL` 与实际域名一致

---

## 六、已知限制

- **单 worker 副本**：轮询无原子锁，多 worker 副本会重复领取 Build。当前生产仅跑 1 个 worker 容器。
- **PgBouncer**：若云 DB 走 PgBouncer，`DATABASE_URL` 需 `&connection_limit=1`，迁移用 directUrl。
- **云模拟器 (#018)**：默认 `EMULATOR_ENABLED=false`。需 KVM 实例，单独部署。
