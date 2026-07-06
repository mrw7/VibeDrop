# ADR-0004: Private Repo Support in MVP

## Status
Accepted

## Context
VibeDrop supports automatic building from GitHub repositories. We needed to decide whether to support private repositories in the MVP or defer to a later phase.

## Decision
Support **private repositories** in the MVP phase, using the user's GitHub OAuth token with `repo` scope.

## Rationale

- Many vibe-coded projects start as private repos before the author is ready to share
- Supporting only public repos would force users to make repos public prematurely
- The same GitHub OAuth token used for authentication (ADR-0003) can be reused with `repo` scope for private repo access
- This is a competitive advantage over platforms that only support public repos

## Implementation Details

- OAuth authorization requests `repo` scope during login
- User's OAuth token is encrypted at rest using AES-256
- Token is passed to the build service via secure internal API (not exposed to client)
- Build service uses the token to clone private repos during the build process

## Security Considerations

- Tokens are never logged or exposed in build output
- Build service runs in isolated Docker containers with no network access to internal services
- Token rotation: if a user revokes GitHub app access, all associated builds are invalidated

## Consequences

- **Positive**: Users can build and preview private projects before making them public
- **Positive**: Competitive advantage over platforms limited to public repos
- **Negative**: Requires careful token security management
- **Negative**: `repo` scope is broad — users may be hesitant to grant it
- **Negative**: If token is compromised, attacker gains access to all user's repos
