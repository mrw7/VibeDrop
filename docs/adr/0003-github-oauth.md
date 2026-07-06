# ADR-0003: GitHub OAuth as Sole Authentication

## Status
Accepted

## Context
VibeDrop needs user authentication for app publishing, liking, and commenting. We evaluated multiple authentication options for the MVP.

## Decision
Use **GitHub OAuth** as the sole authentication method for the MVP phase.

## Rationale

- VibeDrop's target users (vibe coders) almost universally have GitHub accounts
- GitHub OAuth provides verified identity, avatar, and public profile information
- Eliminates the need for email verification, password management, and account recovery
- Simplifies the "publish from GitHub" feature — the same OAuth token can be reused for repo access

## Alternatives Considered

- **Email/Password**: Rejected — adds friction for users who already have GitHub, requires email verification infrastructure
- **Multiple OAuth providers (Google, Twitter, etc.)**: Rejected — adds complexity without significant benefit for this audience
- **Supabase Auth**: Rejected as primary auth — we use Supabase for database, but GitHub OAuth is handled via NextAuth.js for better integration with Next.js App Router

## Consequences

- **Positive**: Minimal registration friction for target users
- **Positive**: No password security concerns
- **Positive**: GitHub token reuse for private repo access (ADR-0004)
- **Negative**: Users without GitHub accounts cannot use the platform
- **Negative**: Platform is dependent on GitHub's availability and API policies
