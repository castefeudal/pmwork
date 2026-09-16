# PMWORK production hardening status

This is an evidence ledger, not a product score.

Branch: `feat/pmwork-10-10-production-pass`
Baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`

## Implemented on the hardening branch

- Added workspace graph integrity validation across project ownership, work relations, dependencies, RAID links, documents, vendors, settings, dates and compatibility mirror fields.
- Current-schema corruption fails closed. Legacy v1-v5 payloads are migrated first and only legacy-only dangling compatibility references are removed before graph validation; source recovery data is not overwritten.
- Added explicit future-schema rejection and unknown-field compatibility checks so a newer backup is not silently downcast.
- Fixed empty-project control coverage: an empty work collection no longer passes ownership or acceptance-criteria contours through vacuous `every()` truth.
- Corrected flow semantics: created-to-completed duration is lead time, and throughput is trailing completed work over 7/14/28-day windows. True cycle time remains unknown until PMWORK stores a reliable work-start transition prospectively.
- Reduced PWA precache pressure by moving method/template/glossary detail pages out of mandatory release precache while retaining runtime caching and the offline application shell.
- Replaced the previous single 700 kB static JavaScript ceiling with route-specific transfer budgets derived from measured production baselines with explicit headroom.
- Added bounded Firefox, WebKit and mobile-WebKit smoke coverage without duplicating the full Chromium suite.
- Added a recovery-first App Router error boundary that never clears local storage and provides a raw local recovery download before retry.
- Added `docs/AUDIT_10_10.md` and expanded data-schema / quality-gate documentation around the new integrity contract.

## Existing product capabilities retained

- Local-first static export with no backend, authentication, cloud database, remote sync, analytics, trackers or AI chat.
- RU/EN, root hosting and GitHub Pages `/pmwork` compatibility.
- IndexedDB primary persistence, local recovery mirror, snapshots and JSON backup/import.
- PWA/offline runtime, deterministic calculations and explainable signals.
- Foundation / Practitioner / Advanced guidance and Comfortable / Compact density.
- Today dominant-priority workflow, Work list/board/saved views, milestones, RAID, people, finance/control, tools, methods/templates/playbooks/knowledge/glossary and starter packs.

## Verification status for this branch

The branch must not be described as production-verified until the exact head commit passes the complete Quality Gate for both base paths.

Required automated evidence:

- lint;
- TypeScript typecheck;
- content, copy, i18n and link gates;
- unit/component tests;
- static build and export validation;
- complete Chromium E2E for root and `/pmwork`;
- route-specific performance budgets for root and `/pmwork`;
- bounded Firefox/WebKit/mobile-WebKit smoke on root.

The prior production baseline remains separately documented in `release-evidence.json`; its results are not automatically attributed to this branch.

## Deliberately unresolved / manual evidence

- Human usability protocol: **NOT MEASURED**.
- Formal WCAG conformance: **NOT CERTIFIED**. Automated accessibility coverage does not replace NVDA/VoiceOver/high-contrast/zoom/device review.
- Field Core Web Vitals / INP: **NOT MEASURED** because PMWORK does not add telemetry to satisfy this pass.
- Exact historic cycle time / aging WIP for existing records cannot be reconstructed from schema v6 without inventing a start transition. PMWORK must keep this unknown until prospective status history exists.
- Large UI modules still warrant a low-risk decomposition pass, but decomposition must not be performed merely to satisfy a file-size target without visual/browser evidence across affected surfaces.

## Release rule

Merge only an exact reviewed commit with green root and GitHub-base Quality Gate results. Do not convert automated success into claims of human usability, formal WCAG compliance or field performance.

See [AUDIT_10_10.md](AUDIT_10_10.md), [QUALITY_GATE.md](QUALITY_GATE.md), [USABILITY_PROTOCOL.md](USABILITY_PROTOCOL.md), [RELEASE.md](RELEASE.md) and [release-evidence.json](release-evidence.json).
