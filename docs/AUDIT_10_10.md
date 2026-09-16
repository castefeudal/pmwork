# PMWORK production hardening audit

Date: 2026-09-16
Baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`
Branch: `feat/pmwork-10-10-production-pass`

This document is an evidence ledger, not a subjective product score. A capability is marked verified only when the relevant automated or manual evidence exists.

## Product contracts retained

The transformation keeps PMWORK local-first and static-exported: no backend, authentication, cloud database, remote sync, analytics, trackers, or AI chat. RU/EN, root hosting, GitHub Pages `/pmwork`, IndexedDB, the local recovery mirror, JSON backup/import, PWA/offline behavior, deterministic calculations, Foundation/Practitioner/Advanced guidance, and Comfortable/Compact density remain product contracts.

## Baseline evidence

The last production evidence before this branch recorded:

- schema v6 with v1-v5 migration;
- 79 passing unit/component tests;
- 198 passing Chromium browser tests for root and 198 for `/pmwork`;
- 498 exported HTML pages;
- approximately 806-808 precached resources;
- worst local unthrottled LCP about 300 ms and CLS 0.0043;
- initial JavaScript gzip around 189 kB landing, 344 kB glossary/methods, 202 kB tools and 323 kB workspace;
- zero dependency vulnerabilities at the configured moderate threshold;
- human usability not measured.

Those numbers belong to the baseline release and are not carried forward as evidence for this branch.

## Findings and treatment

| Severity | Finding | Treatment | Acceptance evidence |
| --- | --- | --- | --- |
| P0 | Schema validation checked object shape but did not prove cross-record graph integrity. A structurally valid import could contain missing or cross-project references. | Added `validateWorkspaceGraph` / `assertWorkspaceGraph`; storage migration, save, import and restore now reject graph-corrupt data without mutating the original recovery source. | Dedicated graph tests + storage migration regression + CI. |
| P1 | Empty work collections received positive ownership/acceptance checks because `[].every(...)` is true. | Coverage now requires actual work/committed work before those contours can pass. | Regression test on an empty project work set. |
| P1 | `flowMetrics` labelled all historically completed work as throughput and labelled `createdAt → completedAt` as cycle time. | Throughput is now calculated over trailing 7/14/28-day windows; stored created-to-completed duration is explicitly lead time. True cycle time remains unknown until a reliable startedAt/status-history model exists. | Unit tests with fixed as-of timestamp. |
| P1 | Browser QA covered Chromium only, leaving Safari/WebKit and Firefox local-storage/IndexedDB/navigation behavior untested. | Added a bounded Firefox/WebKit/mobile-WebKit smoke matrix instead of duplicating the complete Chromium suite. | Cross-browser smoke CI on root export. |
| P1 | PWA precached hundreds of method/template/glossary detail documents on every release. | Detail documents now use runtime caching after successful visits; application shell, workspace, catalog indexes and shared assets remain precached. | Build output `release.json` asset count and existing offline tests/browser flows. |
| P1 | Static JS gate allowed 700 kB gzip on every route, far above the measured baseline. | Replaced the global ceiling with route-specific budgets derived from the previous release baseline with headroom for legitimate changes. | `performance:check` in root and `/pmwork` CI. |
| P1 | Runtime route failure had no product-specific recovery surface. | Added a recovery-first App Router error boundary. It does not clear storage and can download the raw local recovery envelope before retrying. | Type/build/browser verification; manual destructive-error check still recommended. |
| P2 | Main branch is currently unprotected. | No repository administration setting was changed by this branch. Recommended governance remains PR-only production changes, required Quality Gate, and no force pushes. | Repository setting/manual owner action. |
| P2 | Several large UI components remain highly coupled. | This branch extracts the new integrity domain from UI and avoids expanding the monoliths further, but a full low-risk split of `workspace-views`, `workspace-dialog`, `workspace-app`, `record-editor`, `tools-lab`, and `project-tools` remains a separate refactor because it needs visual regression evidence across many surfaces. | Open limitation; do not call complete. |
| P2 | Exact cycle time and aging WIP cannot be reconstructed from schema v6 without inventing historical start transitions. | Do not fabricate startedAt during migration. Current UI/domain reports cycle time as unknown. A future additive schema may record status history prospectively. | Explicit domain behavior and tests. |

## Data integrity contract

Graph validation checks:

- duplicate IDs within entity collections;
- existence of every `projectId`;
- work parent, milestone, iteration, dependency, risk, objective and owner references;
- project-boundary consistency for references;
- explicit dependency records and cycle detection;
- issue/risk/work links;
- objective deliverables and iteration membership;
- capacity owner references;
- vendor milestone/risk/dependency references;
- project settings local member references;
- document/tool-run related records;
- invalid and impossible project/work/iteration date order;
- legacy `estimate/currentEstimate` and milestone `date/forecastDate` mirrors;
- one-per-project settings/preferences/closure records.

Future schema versions continue to fail closed rather than being silently downcast.

## Evidence hierarchy

### Automated

Required before merge:

- lint;
- TypeScript typecheck;
- content validation;
- copy quality;
- i18n parity;
- link validation;
- unit/component tests;
- static build/export validation;
- complete Chromium E2E on root and `/pmwork`;
- route-specific performance budgets on both bases;
- bounded Firefox/WebKit/mobile-WebKit smoke on root.

### Manual / external

Still required and **not inferred from automation**:

- participant usability protocol;
- NVDA/VoiceOver comprehension;
- Windows High Contrast;
- 200% and 400% zoom/reflow manual inspection;
- physical iOS/Android virtual-keyboard and safe-area review;
- field Core Web Vitals/INP if measurement is ever introduced without violating the privacy contract.

Human usability status: **NOT MEASURED**.

## Definition of done for this branch

The branch can be considered technically releasable when its exact head commit passes the root and GitHub-base Quality Gate, including the new cross-browser smoke, and its final evidence is recorded in `TRANSFORMATION_STATUS.md` / `RELEASE.md`. Human usability and formal WCAG remain external/manual evidence and must not be described as passed.
