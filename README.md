# VibeDrop

VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台。

## 技术栈

- Next.js 15 + App Router
- React 19 + TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL (阿里云 Supabase)
- NextAuth.js (GitHub OAuth)
- 阿里云 OSS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的配置
```

### 3. 数据库迁移

```bash
npx prisma migrate dev
```

### 4. 启动开发服务器

```bash
npm run dev
```

或使用 Docker：

```bash
docker-compose up
```

## 许可证

SSPL (Server Side Public License)
