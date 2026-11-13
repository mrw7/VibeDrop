# ADR-0001: SSPL License Choice

## Status
Superseded by [ADR-0005](./0005-mit-license.md) (MIT) on 2026-11-13.

## Context
VibeDrop is a platform that hosts and runs user-generated web applications. We needed a license that:
1. Allows the community to freely use, modify, and contribute to the project
2. Protects against cloud providers offering the platform as a service without contributing back
3. Keeps the option open for future commercial licensing

## Decision
Use **SSPL (Server Side Public License)** for the VibeDrop project.

## Rationale

SSPL was chosen over MIT/Apache because:
- VibeDrop is a hosted service, not just a library or tool
- SSPL requires anyone offering VibeDrop as a service to open-source their entire management stack
- This prevents "strip-mining" by large cloud providers while keeping the project open for individual use and self-hosting

SSPL was chosen over BSL because:
- SSPL is already an established open-source license (though controversial)
- BSL requires setting a specific "Change Date" when the license converts to another license
- SSPL provides immediate protection without the complexity of time-based conversion

## Consequences

- **Positive**: Protects against commercial exploitation without contribution
- **Positive**: Community can still freely use, fork, and self-host
- **Negative**: SSPL is not OSI-approved, which may limit adoption in some corporate environments
- **Negative**: Some package registries and platforms may restrict SSPL-licensed projects
