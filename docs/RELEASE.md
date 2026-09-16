# PMWORK production hardening release

Scope: integrity, recovery, flow-metric correctness, PWA/performance budgets, cross-browser smoke and production evidence on top of PMWORK 2.3.

Baseline commit: `51d1f596b67921af7ee985f2a390bd07fc8d3506`.
Implementation branch: `feat/pmwork-10-10-production-pass`.

## Release boundaries

The pass preserves PMWORK's core contracts: local-first static export, no backend/auth/cloud database/remote sync/analytics/trackers/AI chat, RU/EN, root and GitHub Pages `/pmwork` hosting, IndexedDB plus local recovery mirror, JSON backup/import, PWA/offline, deterministic calculations and explainable signals.

No production claim may be based on intent alone. Evidence belongs to the exact commit that produced it.

## What changed

- Workspace graph validation now supplements Zod shape validation.
- Migration/import/restore/save paths enforce graph integrity without deleting original recovery sources.
- Legacy v1-v5 compatibility repair is limited to dangling references that cannot be represented by the migrated graph; v6 corruption still fails closed.
- Future schema versions and unknown incompatible backup fields are rejected instead of silently downcast.
- Empty work collections no longer inflate control coverage.
- Throughput is measured over trailing 7/14/28-day windows; created-to-completed duration is labelled lead time. Historic cycle time remains unknown when start evidence does not exist.
- PWA detail content moved from mandatory precache to runtime caching while the workspace/application shell remains offline-capable.
- Static transfer budgets are route-specific rather than a permissive single global limit.
- Firefox, WebKit and mobile-WebKit smoke coverage was added alongside the full Chromium suite.
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

The GitHub Actions Quality Gate is authoritative for the pushed branch head. Do not copy baseline numbers into this release as if they were remeasured.

## Manual / external evidence

Still required before claiming the corresponding quality dimension:

- participant usability sessions from `USABILITY_PROTOCOL.md` — current status: **NOT MEASURED**;
- NVDA + Chrome/Firefox and VoiceOver + Safari review;
- Windows High Contrast;
- 200% and 400% zoom/reflow;
- physical iOS/Android virtual-keyboard/safe-area review;
- representative visual screenshot review;
- field Core Web Vitals/INP if a privacy-compatible measurement approach is ever introduced.

Automated E2E success is not human-usability evidence and automated accessibility checks are not formal WCAG certification.

## Known limitations

- Existing schema-v6 records do not contain a reliable work-start transition, therefore exact historic cycle time and aging WIP must remain unknown rather than inferred.
- Several large workspace UI modules remain candidates for incremental decomposition. Any split should be validated against the same browser/visual contracts and should not be performed only to improve file-size aesthetics.
- GitHub repository governance settings are owner/admin operations and are not treated as application-code release evidence.

## Release decision

Merge only when the exact reviewed head commit is green in the complete Quality Gate. After merge, confirm GitHub Pages deployment and run the live release-marker/asset smoke. If the exact head is not green, this release is not production-ready regardless of earlier successful commits.
