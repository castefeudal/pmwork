# PMWORK production hardening audit

Date: 2026-09-17
Original baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`
Completion baseline: `f458a3a71850175be1afd45bbbfe2e24a45946e6`
Current branch: `feat/pmwork-10-10-completion` (PR #8)

This document is an evidence ledger, not a subjective product score. A capability is marked verified only when the relevant automated or manual evidence exists.

## Product contracts retained

The transformation keeps PMWORK local-first and static-exported: no backend, authentication, cloud database, remote sync, analytics, trackers, or AI chat. RU/EN, root hosting, GitHub Pages `/pmwork`, IndexedDB, the local recovery mirror, JSON backup/import, PWA/offline behavior, deterministic calculations, Foundation/Practitioner/Advanced guidance, and Comfortable/Compact density remain product contracts.

## Baseline evidence

The earlier release evidence recorded schema v6 with v1-v5 migration, 79 passing unit/component tests, 198 Chromium tests for root and 198 for `/pmwork`, 498 exported HTML pages, approximately 806–808 precached resources, local unthrottled LCP around 300 ms / CLS 0.0043, route JS baselines around 189–344 kB gzip, and no dependency vulnerabilities at the configured moderate threshold. Human usability was not measured.

Those values belong to the earlier baseline and are not reused as evidence for the completion branch.

## Findings and treatment

| Severity | Finding | Treatment | Acceptance evidence |
| --- | --- | --- | --- |
| P0 | Shape validation alone did not prove cross-record graph integrity. | `validateWorkspaceGraph` / `assertWorkspaceGraph` cover project boundaries, references, cycles, mirrors and date relations; storage paths fail closed without clearing recovery sources. | Dedicated graph/storage tests + exact-head CI. |
| P1 | Empty work collections could pass ownership/acceptance contours via vacuous `every()`. | Coverage requires actual work/committed work. | Empty-project regression. |
| P1 | Flow semantics conflated cumulative completions and created-to-completed duration with throughput/cycle time. | Throughput is trailing 7/14/28-day completion rate; created→completed is lead time. | Fixed-as-of flow tests. |
| P1 | Exact cycle time and WIP age were previously unavailable. | Added optional prospective `startedAt` and `statusHistory`; only observed transitions create evidence. Legacy records remain unknown. Cycle sample size, median, P80/P90 (>=10 reliable samples), and known/unknown aging WIP are exposed. | Command, storage and flow regressions. |
| P1 | Prospective evidence itself could become contradictory if only Zod shape validation applied. | Graph validation now rejects invalid flow timestamps, completion before start, non-chronological transition history, stale last transition, and `done`/status disagreement. | Integrity regression. |
| P1 | Import/snapshot replacement used native browser confirmation and did not expose a first-class current-backup action in the confirmation surface. | Replaced with accessible PMWORK modal showing validated counts/selected snapshot, consequence, safety-snapshot behavior and `Download current backup` when applicable. | Type/build/E2E plus manual focus/readability review. |
| P1 | Browser QA was Chromium-only. | Added bounded Firefox/WebKit/mobile-WebKit smoke without duplicating the full suite. | Root cross-browser CI. |
| P1 | PWA precached hundreds of deep content documents every release. | Detail routes moved to runtime caching; application shell/workspace/catalog indexes/shared assets remain offline-ready. | Build release manifest + offline/browser tests. |
| P1 | Static-JS gate was too permissive globally. | Route-specific budgets now use measured baseline plus explicit headroom. | `performance:check` on root and `/pmwork`. |
| P1 | Runtime route failure lacked PMWORK-specific recovery. | Recovery-first App Router error boundary preserves storage and offers raw local recovery download before retry. | Build/browser verification. |
| P2 | `workspace-app.tsx` owned settings UI in addition to shell/navigation/persistence/recovery. | Extracted `WorkspaceSettingsView`; recovery confirmation is a separate component. This is an incremental domain-boundary split rather than a cosmetic mass refactor. | Type/build/browser verification. |
| P2 | Other large UI modules remain coupled. | No forced full rewrite. Further decomposition remains appropriate only alongside concrete changes and browser/visual evidence. | Open maintainability limitation. |
| P2 | Main branch is currently unprotected. | No admin setting is silently changed by application code. Recommend PR-only production changes, required Quality Gate, and no force pushes. | Owner/admin action. |

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
- project-settings local-member references;
- document/tool-run related records;
- invalid/impossible project/work/iteration date order;
- legacy `estimate/currentEstimate` and milestone `date/forecastDate` mirrors;
- work `done/status` consistency and prospective flow timestamp/history consistency;
- one-per-project settings/preferences/closure records.

Future schema versions continue to fail closed rather than being silently downcast. Unknown backup fields that cannot be preserved are rejected rather than stripped.

## Flow evidence contract

- Lead time: `createdAt → completedAt`.
- Cycle time: `startedAt → completedAt`, only with stored start evidence.
- Throughput: completed items inside explicit trailing 7/14/28-day windows.
- Aging WIP: `startedAt → asOf` for active records with stored start evidence.
- Missing historical start evidence is **unknown**, not zero and not inferred from `createdAt`.
- P80/P90 cycle time is withheld until at least 10 reliable completed samples exist.
- Migration and unrelated edits never fabricate `startedAt` or status history.

## Recovery contract

Before replacement, import performs size/read/parse/migration/backup-fidelity/graph validation. The confirmation surface states what will be replaced, previews available counts, explains the safety snapshot, and allows downloading the healthy current workspace before replacement. A restore failure never automatically clears the original storage source.

## Evidence hierarchy

### Automated — required for exact PR head

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

### Manual / external — still not inferred from automation

- participant usability protocol;
- NVDA/VoiceOver comprehension;
- Windows High Contrast;
- 200% and 400% zoom/reflow inspection;
- physical iOS/Android virtual-keyboard and safe-area review;
- representative human visual regression review;
- field Core Web Vitals/INP if a privacy-compatible measurement mechanism is ever introduced.

Human usability status: **NOT MEASURED**.
Formal WCAG conformance: **NOT CERTIFIED**.
Field CWV/INP: **NOT MEASURED**.

## Definition of done for this completion branch

The branch is technically releasable only when its exact final head passes the root and GitHub-base Quality Gate, including cross-browser smoke, performance gates and all regression tests. Automated success must not be converted into claims of human usability, formal WCAG certification, physical-device behavior or field performance.
