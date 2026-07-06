# VibeDrop MVP PRD

## Problem Statement

Vibe Coding（使用 AI 工具如 Cursor、v0、Bolt、Lovable 等生成应用）正在爆发，但缺乏一个专门展示和试玩这些 AI 生成 App 的垂直社区。现有平台（GitHub、CodePen）要么不适合展示移动端应用，要么不支持直接试玩。用户需要一个能分享、发现、即时试玩 Vibe Coding 应用的平台。

## Solution

VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台。用户可以通过 GitHub OAuth 登录，上传 ZIP 构建产物或连接 GitHub 仓库自动构建，发布自己的 Vibe App。其他用户可以在社区大厅浏览、搜索、点赞、评论，并在网页上直接试玩（通过 iframe 沙盒 + 手机外壳 UI）。

## User Stories

### 认证与账户
1. As a vibe coder, I want to log in with my GitHub account, so that I don't need to create a new password
2. As a user, I want my GitHub profile (avatar, username) to be displayed on the platform, so that I have a consistent identity
3. As a user, I want to log out securely, so that I can protect my account on shared devices

### 发布作品
4. As a vibe coder, I want to upload a ZIP file containing my built web app, so that I can share it immediately without setting up CI/CD
5. As a vibe coder, I want to paste my GitHub repo URL and have the platform automatically build it, so that I don't need to manually build and upload
6. As a vibe coder with private repos, I want the platform to build my private GitHub repositories, so that I can preview before making them public
7. As an app publisher, I want to add a title, description, and cover image to my app, so that it looks appealing in the community
8. As an app publisher, I want to tag the AI tool I used (Cursor, v0, Bolt, Lovable), so that others know how it was made
9. As an app publisher, I want to tag the tech stack (React, Vue, Flutter), so that others know what technology it uses
10. As an app publisher, I want to mark the target device type (iOS, Android, Harmony, Web), so that viewers know which platform it's for
11. As an app publisher, I want to see the build status and logs, so that I can debug if the build fails

### 社区发现
12. As a visitor, I want to browse apps in a waterfall/masonry layout, so that I can visually scan many apps at once
13. As a visitor, I want to filter apps by AI tool tag, so that I can find apps made with my favorite tool
14. As a visitor, I want to filter apps by tech stack, so that I can find examples in technologies I know
15. As a visitor, I want to search apps by title and description, so that I can find specific apps
16. As a visitor, I want apps sorted by a hybrid algorithm (likes + comments + time decay), so that I see both new and popular apps
17. As a visitor, I want to see an app's author profile, so that I can follow their work

### 试玩体验
18. As a visitor, I want to play an app inside a phone shell UI, so that I get the "mobile app" feeling
19. As a visitor, I want to switch between iPhone and Android device shells, so that I can see how it looks on different devices
20. As a visitor, I want a fullscreen mode to play the app without the phone shell, so that I have more screen space
21. As a visitor, I want the play experience to be instant (no waiting for emulator boot), so that I can quickly try many apps

### 互动
22. As a logged-in user, I want to like an app, so that I can show appreciation to the creator
23. As a logged-in user, I want to comment on an app, so that I can give feedback or ask questions
24. As a logged-in user, I want to report an app, so that I can flag malicious or inappropriate content
25. As an app publisher, I want to see how many likes and comments my app has received, so that I understand its popularity

### 安全与审核
26. As a visitor, I want to know that played apps are sandboxed, so that I feel safe trying unknown apps
27. As a platform operator, I want user-uploaded apps to run in a restricted iframe sandbox, so that they cannot attack other users
28. As a platform operator, I want a report button on each app, so that the community can help identify malicious content

## Implementation Decisions

### Architecture
- **Frontend**: Next.js 15 with App Router, React Server Components for SEO and initial data fetching
- **Styling**: TailwindCSS with shadcn/ui component library
- **Database**: PostgreSQL via Alibaba Cloud Supabase (pgm-rj927449s0p5632g)
- **ORM**: Prisma with connection pooling via Supabase
- **File Storage**: Alibaba Cloud OSS for ZIP uploads, built artifacts, and cover images
- **Authentication**: NextAuth.js with GitHub OAuth provider, requesting `repo` scope for private repo access
- **Build Service**: Docker-based build workers running on Alibaba Cloud ECS, triggered via internal API
- **Deployment**: Local Docker for development, Alibaba Cloud for production

### Database Schema
- **User**: id, githubId, githubLogin, avatarUrl, email, githubAccessToken (encrypted), createdAt
- **App**: id, title, description, coverImage, authorId, sourceType, sourceUrl, buildStatus, buildId, playUrl, aiToolTag, techStackTag, deviceType, likesCount, commentsCount, createdAt, updatedAt
- **Build**: id, appId, status, sourceType, sourceUrl, buildLog, artifactUrl, startedAt, completedAt
- **Like**: id, userId, appId, createdAt (unique constraint on userId + appId)
- **Comment**: id, userId, appId, content, createdAt

### API Design
- RESTful API routes under `/api/*`
- Authentication via NextAuth.js session cookies
- File uploads via presigned OSS URLs (direct browser-to-OSS upload)
- Build trigger via authenticated POST to `/api/apps/[id]/build`
- Build status polling via GET `/api/apps/[id]/build-status`

### Security
- iframe sandbox: `sandbox="allow-scripts allow-same-origin"` with restrictive CSP
- OSS files served with `Content-Disposition: inline` and appropriate CORS headers
- GitHub access tokens encrypted at rest using AES-256-GCM
- Build workers run in isolated Docker containers with no access to internal services
- ZIP file size limit: 100MB
- Cover image size limit: 5MB, formats: jpg, png, webp

### Phone Shell UI
- Two device shells: iPhone 15 (with dynamic island) and generic Android
- Device switching without iframe reload (CSS-only transform)
- Fullscreen mode toggles shell visibility
- Portrait orientation only for MVP

### Sorting Algorithm
- Base score = likesCount × 1 + commentsCount × 2
- Time-decayed score = baseScore / (hoursSinceCreated + 2)^1.5
- Sort by time-decayed score descending

### Out of Scope
- Native cloud emulators (Android redroid, iOS simulator) — Phase 3
- In-browser code editor / Fork mechanism — Phase 2
- Expo / Flutter automatic web build — Phase 2
- CDN acceleration for static assets — Phase 2
- Email/password authentication or other OAuth providers — Phase 2
- App versioning / rollback — Phase 2
- Multi-user collaboration on apps — Phase 2
- Payment / tipping system — Phase 2
- Share card generation — Phase 2
- Horizontal orientation / rotation support — Phase 2
- Real-time collaboration or multiplayer features — Phase 2

## Testing Decisions

### What Makes a Good Test
- Test external behavior and user-visible outcomes, not implementation details
- Prefer integration tests over unit tests for API routes
- Use real database transactions (rolled back after each test) rather than mocks

### Test Modules
- **Authentication flow**: OAuth callback, session creation, protected route access
- **App CRUD**: Create app with ZIP upload, create app with GitHub URL, update metadata, delete app
- **Build process**: Trigger build, poll status, handle success/failure states
- **Community features**: Like/unlike, comment CRUD, filtering, search, sorting
- **Security**: iframe sandbox restrictions, file upload validation, unauthorized access attempts

### Testing Stack
- Vitest for unit/integration tests
- Playwright for E2E tests (critical user journeys: login → publish → play → like)
- Test database: separate Supabase project or local PostgreSQL via Docker

## Further Notes

- License: SSPL (Server Side Public License) — see ADR-0001
- All vibe-coded apps are expected to be web-based or web-compilable for MVP
- The platform itself should be a showcase of good vibe coding practices
- Community culture is important — consider "Vibe Hackathon" events for launch
- Monitor OSS bandwidth costs carefully — large ZIP files can be expensive
- GitHub OAuth token security is critical — any breach would expose users' private repositories
