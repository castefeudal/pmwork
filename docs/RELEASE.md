# PMWORK production hardening release

Scope: integrity, recovery, flow-metric correctness, PWA/performance budgets, cross-browser smoke and production evidence on top of PMWORK 2.3.

Original hardening baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`.
Completion baseline: `f458a3a71850175be1afd45bbbfe2e24a45946e6`.
Completion branch: `feat/pmwork-10-10-completion` (PR #8).

## Release boundaries

The pass preserves PMWORK's core contracts: local-first static export, no backend/auth/cloud database/remote sync/analytics/trackers/AI chat, RU/EN, root and GitHub Pages `/pmwork` hosting, IndexedDB plus local recovery mirror, JSON backup/import, PWA/offline, deterministic calculations and explainable signals.

No production claim may be based on intent alone. Evidence belongs to the exact commit that produced it.

## What changed

- Workspace graph validation supplements Zod shape validation and current-schema corruption fails closed.
- Future schema versions and unknown incompatible backup fields are rejected instead of silently downcast.
- Empty work collections no longer inflate control coverage.
- Throughput is measured over trailing 7/14/28-day windows; created-to-completed duration is labelled lead time.
- Work records can now retain optional prospective `startedAt` and status transitions. PMWORK records these only when it observes a status change; legacy history is not invented.
- Stored start evidence enables actual cycle-time and aging-WIP metrics. Median is exposed with valid evidence; P80/P90 require at least 10 reliable completed samples; known and unknown WIP-aging counts remain explicit.
- Graph integrity rejects impossible flow timestamps, non-chronological transition history, stale last-transition state and `done`/status disagreement.
- Import and snapshot replacement use an accessible PMWORK confirmation dialog with backup summary, replacement consequence, safety-snapshot explanation and an explicit current-backup download action when healthy current data exists.
- Workspace Settings/data recovery was extracted from the application shell as an incremental domain-oriented decomposition.
- PWA detail content moved from mandatory precache to runtime caching while the workspace/application shell remains offline-capable.
- Static transfer budgets are route-specific rather than a permissive single global limit.
- Firefox, WebKit and mobile-WebKit smoke coverage runs alongside the full Chromium suite.
- A recovery-first route error boundary provides retry/reload and raw local recovery download without clearing storage.

## Required automated evidence before merge

For both `PMWORK_BASE_PATH=root` and `PMWORK_BASE_PATH=github` where applicable:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run content:validate`
5. `npm run copy:check`
6. `npm run i18n:check`
7. `npm run links:check`
8. `npm run test`
9. `npm run build`
10. `npm run export:validate`
11. `npm run test:e2e`
12. `npm run performance:check`
13. bounded Firefox/WebKit/mobile-WebKit smoke on root

The GitHub Actions Quality Gate is authoritative for the final PR head. The release is **verification pending** until that exact head is green. Earlier baseline success is not copied forward as if remeasured.

## Manual / external evidence

Still required before claiming the corresponding quality dimension:

- participant usability sessions from `USABILITY_PROTOCOL.md` — current status: **NOT MEASURED**;
- NVDA + Chrome/Firefox and VoiceOver + Safari review;
- Windows High Contrast;
- 200% and 400% zoom/reflow;
- physical iOS/Android virtual-keyboard/safe-area review;
- representative human visual screenshot review;
- field Core Web Vitals/INP if a privacy-compatible measurement approach is ever introduced.

Automated E2E success is not human-usability evidence and automated accessibility checks are not formal WCAG certification.

## Known limitations

- Historic records without reliable `startedAt` remain unknown for cycle time and WIP age. Prospective tracking improves evidence from this release forward without rewriting history.
- Some large workspace modules remain candidates for incremental decomposition. This completion branch extracts Settings/recovery but does not split components merely to satisfy a file-size target.
- Field performance is not observable without telemetry; PMWORK intentionally does not add remote telemetry for this release.
- GitHub repository governance settings are owner/admin operations and are not treated as application-code release evidence.

## Release decision

Merge only when the exact reviewed head commit is green in the complete Quality Gate. After merge, confirm GitHub Pages deployment and run the live release-marker/asset smoke. If the exact head is not green, this release is not production-ready regardless of earlier successful commits.
