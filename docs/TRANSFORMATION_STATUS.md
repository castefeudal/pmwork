# PMWORK production hardening status

This is an evidence ledger, not a product score.

Current completion branch: `feat/pmwork-10-10-completion` (PR #8).
Completion baseline: `f458a3a71850175be1afd45bbbfe2e24a45946e6`.
Original production-hardening baseline: `51d1f596b67921af7ee985f2a390bd07fc8d3506`.

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

## Existing product capabilities retained

- Local-first static export with no backend, authentication, cloud database, remote sync, analytics, trackers or AI chat.
- RU/EN, root hosting and GitHub Pages `/pmwork` compatibility.
- IndexedDB primary persistence, local recovery mirror, snapshots and JSON backup/import.
- PWA/offline runtime, deterministic calculations and explainable signals.
- Foundation / Practitioner / Advanced guidance and Comfortable / Compact density.
- Today dominant-priority workflow, Work list/board/saved views, milestones, RAID, people, finance/control, tools, methods/templates/playbooks/knowledge/glossary and starter packs.

## Verification status

The exact PR head must pass the complete Quality Gate before this branch is described as production-verified. Required automated evidence remains:

- lint and TypeScript typecheck;
- content, copy, i18n and link gates;
- unit/component tests;
- static build and export validation;
- complete Chromium E2E for root and `/pmwork`;
- route-specific performance budgets for root and `/pmwork`;
- bounded Firefox/WebKit/mobile-WebKit smoke on root.

Do not attribute prior baseline numbers to the new PR head. `docs/RELEASE.md` records final exact-head evidence after CI completes.

## Deliberately unresolved / manual evidence

- Human usability protocol: **NOT MEASURED**.
- Formal WCAG conformance: **NOT CERTIFIED**. Automated coverage does not replace NVDA/VoiceOver/high-contrast/zoom/device review.
- Field Core Web Vitals / INP: **NOT MEASURED** because PMWORK does not add telemetry for this pass.
- Historic cycle time / aging WIP remain unknown for legacy records that have no reliable start evidence; only prospective transitions can produce those metrics.
- Remaining large UI files should be decomposed only where a concrete change requires it and browser/visual evidence can be preserved. This branch deliberately performs one low-risk extraction rather than a cosmetic file-count rewrite.
- Human visual-regression review on representative physical/browser combinations remains a release responsibility; automated browser checks are not a substitute for that observation.

## Release rule

Merge only an exact reviewed commit with green root and GitHub-base Quality Gate results. Do not convert automated success into claims of human usability, formal WCAG compliance or field performance.

See [AUDIT_10_10.md](AUDIT_10_10.md), [DATA_SCHEMA.md](DATA_SCHEMA.md), [QUALITY_GATE.md](QUALITY_GATE.md), [USABILITY_PROTOCOL.md](USABILITY_PROTOCOL.md), [RELEASE.md](RELEASE.md) and [release-evidence.json](release-evidence.json).
