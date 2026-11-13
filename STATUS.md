# VibeDrop Project Status

**English** | [简体中文](STATUS.zh-CN.md)

> Last updated: 2026-07-02
> Coverage: 43 specs | 120+ files | 8 MVP sprints + 5 Phase 2 + 5 Phase 3 | Phase 3 complete

---

## 1. Overview

**VibeDrop** — an app sharing and play-testing platform for the Vibe Coding community.

- **Stack**: Next.js 15 + React 19 + TypeScript + TailwindCSS v4 + shadcn/ui + Prisma + PostgreSQL
- **Auth**: NextAuth.js v5 + GitHub / Google OAuth + email/password
- **Database**: Alibaba Cloud Supabase (PostgreSQL)
- **File storage**: Alibaba Cloud OSS
- **Builds**: Dockerized worker (`scripts/build-worker.ts`)
- **Testing**: Vitest + Playwright + GitHub Actions CI
- **License**: MIT (see `LICENSE` / ADR-0005)

---

## 2. Completed Sprints

### Sprint 1: Foundation (Issues #2-#4)

| Feature | Status | Key files |
|---------|--------|-----------|
| GitHub OAuth sign-in | ✅ | `src/lib/auth.ts`, `src/app/auth/signin/page.tsx` |
| ZIP upload and publish | ✅ | `src/app/publish/page.tsx`, `src/app/publish/actions.ts` |
| GitHub auto-build | ✅ | `src/app/apps/[id]/build/`, `scripts/build-worker.ts` |
| Dockerized build worker | ✅ | `scripts/build-worker.ts`, `src/lib/build-executor.ts` |
| ZIP static hosting (fflate) | ✅ | `src/app/api/apps/[id]/deploy/route.ts` |

### Sprint 2: Community (Issues #5-#7)

| Feature | Status | Key files |
|---------|--------|-----------|
| Community hall + search + filters | ✅ | `src/app/apps/page.tsx` |
| Mixed ranking (DB-level) | ✅ | PostgreSQL `EXTRACT(EPOCH...)` expression |
| Phone shell player | ✅ | `src/app/apps/[id]/PhoneShell.tsx` (iPhone / Android / fullscreen) |
| Like / unlike (`$transaction`) | ✅ | `src/app/apps/[id]/LikeButton.tsx` |
| Comments | ✅ | `src/app/apps/[id]/CommentForm.tsx` |
| Reports | ✅ | `src/app/apps/[id]/ReportButton.tsx` |

### Sprint 3: UI Design System (Spec #004)

| Feature | Status | Key files |
|---------|--------|-----------|
| CSS variable design tokens (oklch) | ✅ | `src/app/globals.css` — 20+ tokens + dark mode |
| Semantic colors (success/warning/info) | ✅ | `globals.css` `@theme` block |
| PhoneShell component | ✅ | `src/app/apps/[id]/PhoneShell.tsx` |
| Footer component | ✅ | `src/components/Footer.tsx` |
| MobileMenu hamburger menu | ✅ | `src/components/MobileMenu.tsx` |
| ThemeToggle dark mode switch | ✅ | `src/components/ThemeToggle.tsx` (localStorage + matchMedia) |
| UserMenu dropdown | ✅ | `src/components/UserMenu.tsx` |
| Skeleton screens (loading.tsx ×2) | ✅ | `src/app/apps/loading.tsx`, `src/app/apps/[id]/loading.tsx` |
| 404 pages ×3 | ✅ | `not-found.tsx` (global + app + user) |
| Global error boundary | ✅ | `src/app/error.tsx` |
| Accessibility | ✅ | skip-to-content, aria, prefers-reduced-motion |

### Sprint 4: shadcn/ui Migration

| Component | Status | Key files |
|-----------|--------|-----------|
| Button (7 variants, 4 sizes) | ✅ | `src/components/ui/button.tsx` |
| Card family | ✅ | `src/components/ui/card.tsx` |
| Dialog (Radix, focus trap) | ✅ | `src/components/ui/dialog.tsx` |
| Input / Textarea | ✅ | `src/components/ui/input.tsx`, `textarea.tsx` |
| Badge (6 variants) | ✅ | `src/components/ui/badge.tsx` |
| Label (Radix) | ✅ | `src/components/ui/label.tsx` |
| cn() utility | ✅ | `src/lib/utils.ts` (clsx + tailwind-merge) |
| Full lucide-react migration | ✅ | Replaced hand-written SVGs project-wide |

### Sprint 5: Additional Features (Specs #002-#003, #005-#007)

| Feature | Status | Key files |
|---------|--------|-----------|
| User profiles | ✅ | `src/app/users/[id]/page.tsx` |
| App edit / delete | ✅ | `EditAppButton.tsx`, `DeleteAppButton.tsx` |
| Comment deletion (commenter + app author) | ✅ | `CommentDeleteButton.tsx`, `deleteComment` action |
| Masonry layout (CSS columns) | ✅ | `columns-1 sm:columns-2 lg:columns-3` |
| Build log panel | ✅ | `BuildLogPanel.tsx` |
| Shared AppCard component | ✅ | `src/components/AppCard.tsx` |
| Report moderation dashboard | ✅ | `src/app/admin/reports/page.tsx` |

### Sprint 6: Security Hardening

| Measure | Status | Key files |
|---------|--------|-----------|
| XSS protection (sanitize-html) | ✅ | `src/lib/sanitize.ts` — Zod transform layer |
| CSRF protection (Origin/Referer) | ✅ | `src/lib/csrf.ts` |
| CSP headers (per-page) | ✅ | `next.config.ts` |
| HSTS + 6 security headers | ✅ | `next.config.ts` |
| Rate limiting (20 req/min) | ✅ | `src/middleware.ts` |
| Startup environment validation | ✅ | `src/lib/env.ts` |
| AES-256-GCM encryption (node:crypto) | ✅ | `src/lib/encryption.ts` (replaces crypto-js) |
| Secure auth cookies | ✅ | `src/lib/auth.ts` (secure, httpOnly, sameSite) |

### Sprint 7: Testing + Performance + CI

| Measure | Status | Key files |
|---------|--------|-----------|
| Vitest integration tests (4 suites) | ✅ | `tests/integration/` |
| Playwright E2E (10 tests) | ✅ | `tests/e2e/` |
| GitHub Actions CI (3 jobs) | ✅ | `.github/workflows/ci.yml` |
| Self-hosted fonts via next/font/google | ✅ | `src/app/layout.tsx` (Inter + JetBrains Mono) |
| Lazy-loaded PhoneShell | ✅ | `next/dynamic` |
| useAction hook + Sonner toasts | ✅ | `src/lib/use-action.ts` |
| End-to-end Zod validation | ✅ | `src/lib/validations.ts` — 10 schemas |
| Unified AppError handling | ✅ | `AppError` class (401/403/404/409/400) |
| DB-level hot ranking | ✅ | PostgreSQL `EXTRACT(EPOCH...)` |
| Prisma `$transaction` race fixes | ✅ | Like / unlike / delete are atomic |
| Explicit DB indexes (9) | ✅ | `prisma/schema.prisma` |

### Sprint 8: SEO + Polish

| Measure | Status | Key files |
|---------|--------|-----------|
| Dynamic sitemap | ✅ | `src/app/sitemap.ts` |
| robots.txt | ✅ | `src/app/robots.ts` |
| Per-app OG metadata | ✅ | `generateMetadata()` in `apps/[id]/page.tsx` |
| OG image (Edge Runtime) | ✅ | `src/app/api/og/route.tsx` |
| Global 404 + user 404 | ✅ | `not-found.tsx` ×2 |
| Mobile responsive polish | ✅ | Column / gap / padding breakpoint tuning |

### Sprint 9: Phase 2 Features (#009-#013)

| Feature | Status | Key files |
|---------|--------|-----------|
| Landscape / rotation support | ✅ | `PhoneShell.tsx` — orientation state + rotate button + `screen.orientation` API |
| App versioning / rollback | ✅ | `BuildHistory.tsx`, `rollbackApp` action |
| Custom share cards (3 templates) | ✅ | `api/og/route.tsx` — gradient / dark / minimal |
| Fork mechanism | ✅ | `ForkButton.tsx`, `forkApp` action, `forkedFrom` in schema |
| Automatic Expo / Flutter builds | ✅ | `build-executor.ts` — extended `detectBuildCommand` |

### Sprint 10: Code Audit + Fixes

| Category | Issues | Status |
|----------|-------:|--------|
| Critical (P0) | 4 | ✅ All fixed |
| High (P1) | 6 | ✅ All fixed |
| Medium (P2) | 5 | ✅ All fixed |
| Low (P3) | 4 | ✅ 3/4 fixed |

---

## 3. Database Schema

| Model | Key fields | Indexes |
|-------|------------|---------|
| User | githubId (unique), githubLogin, githubAccessToken (AES-encrypted), passwordHash | email |
| Account / Session / VerificationToken | NextAuth.js adapter models | provider+providerAccountId, sessionToken, identifier+token |
| App | authorId, sourceType, buildStatus, tags, counters, forkedFromId | authorId, buildStatus, aiToolTag, techStackTag, createdAt, forkedFromId |
| Build | appId, status, buildLog, artifactUrl | appId, startedAt |
| Like | userId+appId (unique) | appId |
| Comment | userId, appId, content | appId, userId |
| Report | appId, reporterId, reason, resolved | appId, resolved |
| Collaborator | appId+userId (unique), role | appId, userId |
| Tip | appId, tipperId, recipientId, amount, currency, stripeSessionId (unique) | appId, recipientId, tipperId |
| EmulatorSession | appId, userId, containerId, status, streamUrl | appId, status |

---

## 4. Remaining Work (Phase 2+)

### Phase 2 Features (all complete)

| Task | Status |
|------|--------|
| Landscape / rotation support | ✅ #009 |
| App versioning / rollback | ✅ #010 |
| Custom share cards (OG image) | ✅ #011 |
| Fork mechanism | ✅ #012 |
| Expo / Flutter automatic web builds | ✅ #013 |
| CDN configuration | ⏸ Alibaba Cloud console (not code) |

### Phase 3 (all complete)

| Task | Status |
|------|--------|
| In-browser code editor | ✅ #014 |
| Email / password authentication | ✅ #015 |
| Multi-user collaboration | ✅ #016 |
| Payments / tipping | ✅ #017 |
| Native cloud emulator | ✅ #018 |

---

## 5. Environment Variables

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."          # >= 16 characters
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
OSS_REGION="oss-us-west-1"
OSS_BUCKET="vibedrop"
OSS_ACCESS_KEY_ID="..."
OSS_ACCESS_KEY_SECRET="..."
ENCRYPTION_KEY="..."           # >= 32 characters
ADMIN_GITHUB_IDS="..."         # optional, comma-separated GitHub user IDs
```

---

## 6. Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev                    # development server
npm run build-worker           # build worker
npm test                       # Vitest integration tests
npm run test:e2e               # Playwright E2E
npm run typecheck              # TypeScript check
```

---

## 7. Documentation Index

| Document | Path |
|----------|------|
| Workflow guide | `.claude/AGENTS.md` |
| Spec index | `.claude/specs/_completed.md` |
| Domain model | `CONTEXT.md` |
| Product requirements | `docs/prd-mvp.md` (27 user stories) |
| Architecture decisions | `docs/adr/0001-0005` |
| Code audit | `.claude/optimization/audit-2026-07-02.md` |
| Issue tracker | `.scratch/` |

Chinese versions: [`README.zh-CN.md`](README.zh-CN.md), [`STATUS.zh-CN.md`](STATUS.zh-CN.md), [`docs/deployment.zh-CN.md`](docs/deployment.zh-CN.md).
