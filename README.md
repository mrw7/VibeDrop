# VibeDrop

> An app sharing and play-testing platform for the Vibe Coding community.

**English** | [简体中文](README.zh-CN.md)

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

VibeDrop gives web apps built with Cursor, v0, Bolt, Lovable and other AI tools a place to be played:
authors upload a ZIP or connect a GitHub repository, and the platform builds and hosts it.
Visitors can play the app inside a phone shell, like, comment, fork and tip — without leaving the site.

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Publishing & Builds

| Capability | Description |
|------------|-------------|
| ZIP upload | Upload prebuilt static assets; they are extracted and hosted automatically |
| GitHub auto-build | Link a public repository; the worker clones, installs dependencies and builds it |
| Multi-framework | Detects and builds React / Vue / Vite / Expo / Flutter Web projects |
| Build history & rollback | Keeps every build record, log and artifact; roll back to a previous version in one click |
| In-browser editor | Monaco-based editor for changing code and redeploying without leaving the browser |
| Collaboration | App authors can invite collaborators to maintain an app together |

### Community & Play

| Capability | Description |
|------------|-------------|
| Community hall | Search, tag filters and a mixed ranking (recency + popularity) |
| Phone shell player | iPhone / Android shells, orientation switch and fullscreen mode |
| Native cloud emulator | redroid-based Android emulator (optional, requires KVM) |
| Interactions | Likes, comments, reports, forks and tips (Stripe) |
| User profiles | Author details and every app they have published |
| Share cards | Dynamic OG images in three templates for social sharing |

### Authentication & Security

| Capability | Description |
|------------|-------------|
| Sign-in | GitHub / Google OAuth; NextAuth Credentials (email / password) |
| Accounts | Sign-up, email verification and password reset (Server Actions); author / collaborator / admin roles |
| XSS protection | `sanitize-html` applied in the Zod validation layer |
| CSRF protection | Origin / Referer validation |
| Rate limiting | 20 req/min globally; 5 req/min on auth endpoints |
| Encryption | GitHub tokens encrypted with AES-256-GCM |
| Security headers | CSP, HSTS and four more security headers |

## Screenshots

> Captured from a local development instance. Dark is the default theme.

| Home (desktop) | Sign-in | Home (mobile) |
|----------------|---------|---------------|
| ![Home](docs/images/home.png) | ![Sign in](docs/images/signin.png) | ![Home mobile](docs/images/home-mobile.png) |

## Architecture

```mermaid
flowchart LR
    U[Browser] --> N[Next.js 15 App Router]
    N -->|Server Actions / API Routes| P[Prisma ORM]
    P --> DB[(PostgreSQL / Supabase)]
    N -->|assets and cover images| OSS[(Alibaba Cloud OSS)]
    N -->|GitHub OAuth| GH[GitHub]
    N -->|Stripe webhook| ST[Stripe]
    W["Build Worker (Docker container)"] -->|polls pending builds| DB
    W -->|git clone and npm build| T[Build toolchain]
    T -->|build artifacts| OSS
    W -->|writes build logs| DB
    N -->|iframe playback| OSS
```

- **Web layer**: Next.js 15 App Router with React Server Components; page data is read on the server.
- **Data layer**: Prisma + PostgreSQL. Counters such as likes and comments are updated atomically in transactions.
- **Build layer**: a standalone worker process (running in a Docker container) polls the database, runs `git clone` and the project build inside the container, and uploads artifacts to OSS.
- **Storage layer**: OSS stores ZIPs, build artifacts and cover images; the database keeps metadata and URLs only.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router / RSC), React 19, TypeScript 5.7 |
| Styling & UI | Tailwind CSS v4, shadcn/ui, lucide-react |
| Data | PostgreSQL, Prisma 6 |
| Auth | NextAuth.js v5 (GitHub / Google OAuth + Credentials) |
| Storage | Alibaba Cloud OSS |
| Build | Node.js build worker, Docker, git / npm toolchain |
| In-browser editing | Monaco Editor |
| Payments | Stripe |
| Testing | Vitest (integration), Playwright (E2E) |
| CI / Deployment | GitHub Actions, Docker Compose, nginx, Let's Encrypt |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Supabase)
- Optional: Docker (for the local stack and build worker)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local and fill in at least DATABASE_URL, NEXTAUTH_SECRET,
# GitHub OAuth and OSS settings.
```

See [Environment Variables](#environment-variables) for every variable.

### 3. Initialize the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start the development server

```bash
npm run dev
# http://localhost:3000
```

### Run the full local stack with Docker

```bash
cp .env.example .env.local   # fill in the external database and OSS settings
docker compose up --build    # app (3000) + build worker
```

> The local compose file does not include PostgreSQL. `DATABASE_URL` points to an
> external database (Supabase or a self-hosted instance).

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Site URL, e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session signing secret (`openssl rand -hex 16`) |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App Client Secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth (required to enable Google sign-in) |
| `OSS_REGION` | ✅ | Alibaba Cloud OSS region |
| `OSS_BUCKET` | ✅ | OSS bucket name |
| `OSS_ACCESS_KEY_ID` | ✅ | OSS AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | ✅ | OSS AccessKey Secret |
| `ENCRYPTION_KEY` | ✅ | GitHub token encryption key, ≥ 32 characters (`openssl rand -hex 32`) |
| `ADMIN_GITHUB_IDS` | — | Comma-separated GitHub user IDs with admin access |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | — | Mail service; required for email auth in production |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | — | Required for tips |
| `EMULATOR_ENABLED` / `EMULATOR_DOCKER_HOST` / `EMULATOR_MAX_SESSIONS` / `EMULATOR_SESSION_TIMEOUT` | — | Native cloud emulator settings |

Full templates: [`.env.example`](./.env.example) and [`.env.production.example`](./.env.production.example).

> ⚠️ Never commit real `.env*` files. Generate `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`
> and other secrets with `openssl rand` in the target environment.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript type checker |
| `npm run db:generate` | `prisma migrate dev` — create and apply a migration |
| `npm run db:migrate` | `prisma migrate deploy` — apply existing migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build-worker` | Start the build worker |
| `npm test` | Run Vitest integration tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```text
VibeDrop/
├── src/
│   ├── app/                     # Next.js App Router: pages + API routes
│   │   ├── page.tsx             # Landing page
│   │   ├── apps/                # Community hall, app detail, phone shell, editor, builds
│   │   ├── publish/             # Publish flow (ZIP upload / GitHub repository)
│   │   ├── auth/                # Sign-in, sign-up, email verification, password reset
│   │   ├── users/               # User profiles
│   │   ├── admin/reports/       # Report moderation dashboard
│   │   └── api/                 # Auth, apps, builds, emulator, OG image, webhooks
│   ├── components/              # Shared components (Header, Footer, AppCard, UI primitives)
│   ├── lib/                     # Business logic and infrastructure wrappers
│   └── middleware.ts            # Global and auth-endpoint rate limiting, route protection
├── prisma/
│   └── schema.prisma            # Data models (User/App/Build/Like/Comment/Report/...)
├── scripts/
│   └── build-worker.ts          # Build worker entry: poll jobs, run builds, upload artifacts
├── tests/
│   ├── integration/             # Vitest integration tests
│   ├── e2e/                     # Playwright E2E tests
│   └── helpers/                 # Test helpers
├── cli/                         # SkillHub CLI / agent plugin (tooling, not runtime)
├── nginx/                       # Production reverse proxy and certificate bootstrap
├── docs/                        # PRD, ADRs, deployment guide, agent docs, screenshots
├── .claude/                     # Spec / Plan / Exec workflow records
├── .scratch/                    # Local issue tracker
├── docker-compose.yml           # Local development: app + worker
├── docker-compose.prod.yml      # Production: app + worker + nginx + certbot
├── docker-compose.emulator.yml  # Optional: redroid cloud emulator
├── Dockerfile                   # Multi-stage app-runner / worker-runner build
└── .env.example                 # Environment variable template (no real secrets)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config, OAuth / credentials sign-in, session and cookie security |
| `src/lib/build-executor.ts` | Build executor: framework detection, build commands, artifact collection |
| `src/lib/encryption.ts` | AES-256-GCM encryption/decryption for GitHub tokens |
| `src/lib/env.ts` | Environment variable validation at startup |
| `src/lib/permissions.ts` | Author / collaborator / admin permission checks |
| `src/lib/sanitize.ts` | Rich-text XSS sanitization (Zod transform layer) |
| `src/lib/csrf.ts` | Origin / Referer validation |
| `src/lib/validations.ts` | End-to-end Zod schemas |
| `src/lib/oss.ts` | Alibaba Cloud OSS upload and signing |
| `src/lib/emulator/` | redroid container lifecycle and session pool |
| `src/lib/stripe.ts` | Stripe client and tipping logic |
| `src/middleware.ts` | Rate limiting (global + auth endpoints) |
| `prisma/schema.prisma` | All data models, enums and indexes |
| `scripts/build-worker.ts` | Standalone build worker process |
| `next.config.ts` | Security headers including CSP / HSTS |
| `.github/workflows/ci.yml` | CI: lint / type check, Vitest, production build |

## Testing

```bash
npm test          # Vitest: Prisma, Server Actions, like races, XSS sanitization
npm run test:e2e  # Playwright: navigation and core-flow smoke tests
npm run typecheck
```

> Note: `vitest` and `@playwright/test` are not yet declared in `devDependencies`.
> Install them before the first run:
> `npm i -D vitest @playwright/test && npx playwright install`

CI runs lint / type checks, Vitest integration tests (with a PostgreSQL service)
and a production build in GitHub Actions (see `.github/workflows/ci.yml`).
Playwright E2E tests run locally or in a dedicated environment.

## Deployment

Production deployment (Alibaba Cloud ECS + Docker Compose + nginx + Let's Encrypt)
is documented in [`docs/deployment.md`](./docs/deployment.md), including:

- Secret generation and a pre-launch security checklist
- `docker compose -f docker-compose.prod.yml up -d --build`
- SSL certificate issuance and renewal
- Backup, operations and known limitations

## Documentation

All documentation is English by default. Chinese versions are available for the
README, project status and deployment guide.

| Document | Description |
|----------|-------------|
| [`STATUS.md`](./STATUS.md) | Project status: completed features and roadmap |
| [`CONTEXT.md`](./CONTEXT.md) | Domain model and glossary |
| [`docs/prd-mvp.md`](./docs/prd-mvp.md) | Product requirements (27 user stories) |
| [`docs/deployment.md`](./docs/deployment.md) | Deployment and operations guide |
| [`docs/adr/`](./docs/adr/) | Architecture decision records |
| [`.claude/AGENTS.md`](./.claude/AGENTS.md) | Spec → Plan → Exec development workflow |
| [`.scratch/`](./.scratch/) | Local issue tracker |

Chinese versions: [`README.zh-CN.md`](./README.zh-CN.md),
[`STATUS.zh-CN.md`](./STATUS.zh-CN.md),
[`docs/deployment.zh-CN.md`](./docs/deployment.zh-CN.md).

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Follow the Spec → Plan → Exec workflow (see `.claude/AGENTS.md`)
3. Before submitting, run `npm run lint`, `npm run typecheck` and `npm test`
4. Write commit messages in English and follow Conventional Commits
   (`feat:` / `fix:` / `docs:` …)
5. Open a pull request describing the motivation and how you verified the change

## License

Released under the [MIT License](./LICENSE).

Copyright (c) 2026 mrw7
