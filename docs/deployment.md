# VibeDrop Deployment Guide

**English** | [简体中文](deployment.zh-CN.md)

Local Docker testing → production deployment on Alibaba Cloud ECS.

---

## 1. Local Docker Testing

The local stack uses `docker-compose.yml` and includes the app (dev hot reload)
and the build worker. There is no database in the compose file: `DATABASE_URL`
in `.env.local` points to an external PostgreSQL instance (Supabase or
self-hosted).

### Steps

```bash
# 1. Configure environment variables
cp .env.example .env.local
# Edit .env.local: DATABASE_URL, GitHub OAuth, OSS, etc.

# 2. Start the local stack
docker compose up --build

# 3. Create the database schema on first run (in another terminal)
docker compose exec app npx prisma migrate dev --name init
# Or, for development:
docker compose exec app npx prisma db push

# 4. Verify
curl http://localhost:3000          # should return the landing page
```

---

## 2. Alibaba Cloud ECS Production Deployment

The production stack uses `docker-compose.prod.yml` and includes the app
(standalone) + worker + nginx + certbot. **It does not include PostgreSQL** —
it connects to Alibaba Cloud Supabase / RDS.

### 2.1 Prepare the ECS instance

1. **Purchase ECS**: 4 vCPU / 8 GB or more is recommended (the worker builds user projects).
2. **Install Docker**:
   ```bash
   # Alibaba Cloud Linux 3
   dnf install -y docker
   systemctl enable --now docker
   # Docker Compose v2 is bundled with recent Docker versions
   ```
3. **Security group**: open ports 80 (HTTP) and 443 (HTTPS).
4. **DNS**: point an A record at the ECS public IP.

### 2.2 Deploy the code

```bash
# On the ECS instance
git clone <repo> /opt/vibedrop
cd /opt/vibedrop

# Configure production env vars (generate all secrets here, never copy them
# from a development machine)
cp .env.production.example .env.production
openssl rand -hex 16    # → NEXTAUTH_SECRET
openssl rand -hex 32    # → ENCRYPTION_KEY
vi .env.production      # fill in real values + DOMAIN=your.domain
```

### 2.3 Build and start

```bash
# Pass DOMAIN (used by the nginx template)
export DOMAIN=your.domain

docker compose -f docker-compose.prod.yml up -d --build
```

On first start, the app container's entrypoint runs `prisma migrate deploy`
automatically.

### 2.4 Obtain an SSL certificate (Let's Encrypt)

```bash
# Make sure DNS has propagated
DOMAIN=your.domain EMAIL=you@example.com ./nginx/init-letsencrypt.sh
```

HTTPS is available once this completes. The certbot container checks for
renewal every 12 hours.

### 2.5 Update the deployment

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
# The app entrypoint runs migrate deploy automatically
```

---

## 3. Worker Image: Extending Build Capabilities

The worker can build **Node.js / static HTML** projects out of the box
(`npm install` + `npm run build`).
To support **Expo / Flutter / native Android**, install the SDKs in the
`worker-runner` stage of the `Dockerfile`:

```dockerfile
# Flutter (~1.5 GB)
# RUN apk add --no-cache flutter

# JDK (Android Gradle builds)
# RUN apk add --no-cache openjdk17
```

Then rebuild the worker:

```bash
docker compose -f docker-compose.prod.yml build worker
docker compose -f docker-compose.prod.yml up -d worker
```

---

## 4. Backup & Operations

| Task | Command |
|------|---------|
| View logs | `docker compose -f docker-compose.prod.yml logs -f app` |
| View build logs | `docker compose -f docker-compose.prod.yml logs -f worker` |
| Restart services | `docker compose -f docker-compose.prod.yml restart app` |
| Open a shell | `docker compose -f docker-compose.prod.yml exec app sh` |
| Migration status | `docker compose -f docker-compose.prod.yml exec app npx prisma migrate status` |
| Renew certificates manually | `docker compose -f docker-compose.prod.yml run --rm certbot renew` |

**Database backups** are handled automatically by Alibaba Cloud Supabase / RDS;
no local action is required.

---

## 5. Security Checklist (Before Launch)

- [ ] All secrets regenerated (`NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, OSS keys, GitHub OAuth secret, database password)
- [ ] `.env.production` is covered by `.gitignore` and has not been committed
- [ ] `ENCRYPTION_KEY` rotation is coordinated (rotating it invalidates encrypted GitHub tokens)
- [ ] The ECS security group exposes only ports 80 / 443
- [ ] The GitHub OAuth callback URL uses the production domain
- [ ] The Google OAuth callback URL uses the production domain (if Google sign-in is enabled)
- [ ] The Stripe webhook endpoint is configured in the Dashboard as `https://YOUR_DOMAIN/api/webhooks/stripe`
- [ ] `NEXTAUTH_URL` matches the actual domain

---

## 6. Known Limitations

- **Single worker replica**: polling has no atomic lock, so multiple worker replicas would claim the same build. Production currently runs one worker container.
- **PgBouncer**: if the cloud database sits behind PgBouncer, `DATABASE_URL` needs `&connection_limit=1`, and migrations should use a `directUrl`.
- **Cloud emulator (#018)**: `EMULATOR_ENABLED=false` by default. It requires a KVM-capable instance and is deployed separately.
