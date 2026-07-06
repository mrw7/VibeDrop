# ADR-0002: Web-First Play Strategy

## Status
Accepted

## Context
VibeDrop's core value proposition is allowing users to share and play vibe-coded apps across iOS, Android, and HarmonyOS. However, building native cloud emulators for all three platforms is extremely costly and complex.

## Decision
Adopt a **"Web-First"** strategy for the MVP:
1. Primary play mechanism: iframe sandbox running web assets (HTML/JS/CSS)
2. Encourage users to compile cross-platform apps (React Native/Expo, Flutter) to web targets
3. Defer native cloud emulators (Android redroid, iOS simulator) to Phase 3

## Rationale

- 95% of vibe-coded apps are already web-based or can be compiled to web
- Web sandbox provides immediate, low-latency play experience
- Avoids the infrastructure cost of GPU-enabled cloud instances for native emulation
- Aligns with how vibe coding tools (v0, Bolt, Lovable) primarily output web apps

## Consequences

- **Positive**: MVP can launch in 1-2 months instead of 6+ months
- **Positive**: Play experience is instant, no waiting for emulator boot
- **Positive**: Lower infrastructure cost (static file hosting vs GPU instances)
- **Negative**: Pure native apps (Swift, Kotlin, ArkTS) cannot be played in MVP
- **Negative**: Some platform-specific features may not work in web compilation
