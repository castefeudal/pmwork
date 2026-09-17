# PMWORK production hardening status

This is an evidence ledger, not a product score.

Current completion branch: `feat/pmwork-10-10-completion` (PR #8).
Completion baseline: `f458a3a71850175be1afd45bbbfe2e24a45946e6`.
Original production-hardening baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`.
Verified implementation head: `1ce3b6f942782730fbd9736e26911cfbc2131bf9`.

## Implemented before this completion branch

- Workspace graph integrity validation across project ownership, work relations, dependencies, RAID links, documents, vendors, settings, dates and compatibility mirror fields.
- Current-schema corruption fails closed. Legacy v1-v5 payloads are migrated first; source recovery data is not overwritten.
- Future-schema rejection and unknown-field compatibility checks prevent silent downcasts/data loss.
- Empty-project control coverage no longer passes ownership or acceptance-criteria contours through vacuous `every()` truth.
- Throughput uses trailing 7/14/28-day completion windows and created-to-completed duration is labelled lead time.
- PWA deep content moved out of mandatory precache while the offline application shell remains intact.
- Route-specific transfer budgets replaced the old permissive global JavaScript ceiling.
- Firefox, WebKit and mobile-WebKit smoke coverage supplements the full Chromium suite.
- A recovery-first App Router error boundary never clears local storage and offers raw local recovery download.

## Implemented on `feat/pmwork-10-10-completion`

- Added optional prospective `startedAt` and `statusHistory { at, from, to }` evidence to work records without increasing schema version or invalidating v1-v6 backups.
- Work status commands append transition evidence only when PMWORK observes an actual status change. Legacy active work is not backfilled during unrelated edits.
- Flow metrics now expose evidence-based cycle time, cycle sample size, median cycle time, P80/P90 only at sample size >= 10, and known/unknown aging-WIP counts. Missing start evidence remains unknown.
- Graph integrity now rejects contradictory flow evidence: invalid timestamps, impossible start/completion order, non-chronological history, stale last transition, and `done`/status disagreement.
- Backup/migration regressions verify that prospective flow evidence survives round trips while legacy work receives no invented history.
- Replaced native confirmation in import and snapshot replacement with an accessible PMWORK dialog showing validated schema/project/work/risk counts, replacement consequences, safety-snapshot semantics, and an explicit `Download current backup` action when applicable.
- Extracted the Settings/data-recovery surface from `workspace-app.tsx` into `workspace-settings-view.tsx`, reducing coupling without a broad UI rewrite.
- Updated `DATA_SCHEMA.md` to document the prospective-evidence and recovery contracts.
- Updated the recovery E2E contract to exercise the accessible PMWORK restore dialog instead of waiting for a removed native browser confirm.
- Moved Chromium browser-evidence upload directly after the full E2E suite so later Playwright runs cannot clear the screenshots before artifact retention.

## Existing product capabilities retained

- Local-first static export with no backend, authentication, cloud database, remote sync, analytics, trackers or AI chat.
- RU/EN, root hosting and GitHub Pages `/pmwork` compatibility.
- IndexedDB primary persistence, local recovery mirror, snapshots and JSON backup/import.
- PWA/offline runtime, deterministic calculations and explainable signals.
- Foundation / Practitioner / Advanced guidance and Comfortable / Compact density.
- Today dominant-priority workflow, Work list/board/saved views, milestones, RAID, people, finance/control, tools, methods/templates/playbooks/knowledge/glossary and starter packs.

## Verification status

Quality Gate run #117 (`35272644246`) passed on verified implementation head `1ce3b6f942782730fbd9736e26911cfbc2131bf9`:

- root and GitHub-base lint/typecheck/content/copy/i18n/links/build/export gates: PASS;
- Vitest: 18 files / 97 tests PASS;
- export: 498 HTML pages PASS;
- full Chromium E2E: 204 root + 204 GitHub-base PASS;
- route-specific performance budgets: root + GitHub-base PASS;
- Firefox/WebKit/mobile-WebKit smoke: 9/9 PASS;
- PWA mandatory precache: 169 resources, with deep content moved to runtime cache;
- Chromium visual-evidence artifacts retained successfully for both base paths; root artifact contains 197 PNG files.

`docs/RELEASE.md` contains the exact route transfer/lab measurements and the evidence boundaries. Any documentation-only commit after the verified implementation head must pass the complete gate again before merge.

## Deliberately unresolved / manual evidence

- Human usability protocol: **NOT MEASURED**.
- Formal WCAG conformance: **NOT CERTIFIED**. Automated coverage does not replace NVDA/VoiceOver/high-contrast/zoom/device review.
- Field Core Web Vitals / INP: **NOT MEASURED** because PMWORK does not add telemetry for this pass.
- Historic cycle time / aging WIP remain unknown for legacy records that have no reliable start evidence; only prospective transitions can produce those metrics.
- Remaining large UI files should be decomposed only where a concrete change requires it and browser/visual evidence can be preserved. This branch deliberately performs one low-risk extraction rather than a cosmetic file-count rewrite.
- Human visual-regression review on representative physical/browser combinations remains a release responsibility. CI retains deterministic screenshot evidence but does not claim a pixel-baseline or human-review pass.

## Release rule

Merge only an exact reviewed commit with green root and GitHub-base Quality Gate results. Do not convert automated success into claims of human usability, formal WCAG compliance or field performance.

See [AUDIT_10_10.md](AUDIT_10_10.md), [DATA_SCHEMA.md](DATA_SCHEMA.md), [QUALITY_GATE.md](QUALITY_GATE.md), [USABILITY_PROTOCOL.md](USABILITY_PROTOCOL.md), [RELEASE.md](RELEASE.md) and [release-evidence.json](release-evidence.json).
