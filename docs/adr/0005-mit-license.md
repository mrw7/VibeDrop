# ADR-0005: Relicense from SSPL to MIT

## Status
Accepted (2026-11-13)

Supersedes [ADR-0001](./0001-sspl-license.md).

## Context

ADR-0001 chose SSPL to prevent cloud providers from offering VibeDrop as a
service without contributing back. In practice this trade-off has costs:

- SSPL is not OSI-approved, so some companies and package registries treat the
  project as non-open-source and disallow its use.
- VibeDrop is a community and showcase project: broad adoption, forks and
  contributions matter more than protecting against hypothetical SaaS
  strip-mining.
- The project does not currently operate a commercial hosted offering whose
  moat depends on the license.

## Decision

Relicense VibeDrop under the **MIT License**. The full text lives in
[`LICENSE`](../../LICENSE) at the repository root.

## Consequences

- **Positive**: OSI-approved, unambiguous, and compatible with virtually every
  corporate open-source policy.
- **Positive**: Contributors and forks face no license friction; GitHub and
  other tooling recognize the project as open source.
- **Positive**: Removes the SSPL "management stack" disclosure requirement,
  which was hard to interpret for a full-stack web application.
- **Negative**: No protection against a third party offering VibeDrop as a
  hosted service without contributing back.

## Notes

- The copyright holder (mrw7) owns the code and is entitled to relicense it.
- Releases published before this ADR remain available under SSPL; all
  subsequent releases and contributions are under MIT.
- Third-party dependencies keep their own licenses; see `package-lock.json`.
