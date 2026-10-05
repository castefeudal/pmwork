# Changelog

## 2.9.0 — Management role foundation

- Shared context registers for Programs and Operations, Decision Center with evidence/history/revisit, recurring control evidence, and context-aware deterministic scenario tools.
- Progressive disclosure in record editors and bilingual positioning/author text for four management roles.

- Separate primary management role and additional lenses from guidance and interface density.
- Add versioned v7 migration for roles, programs and ongoing operations, preserving older backups and recovery behavior.
- Add Program, Delivery and Operations centers, plus Today across all work.
- Add program benefit evidence, cross-project handoffs, roadmap, resource conflicts and financial roll-up without merging currencies.
- Add dated operating metrics, required controls, incidents and daily/weekly/monthly reviews without requiring a project or end date.
- Load editors and role centers on demand to retain route transfer budgets.
- Add bilingual role workflows, domain integrity coverage and four-role human usability protocol.

This is the first role-focused increment. See `docs/MANAGEMENT_OS_STATUS.md` for the remaining transformation scope and validation limits.

## 2.8.0 — decision-led product experience (2026-10-04)

- Sharpened the landing promise around moving from project noise to a clear next decision, and made the five-step Signal → Decision → Action → Control → Result cycle explicit.
- Rebuilt the interactive product preview from the bundled demo workspace records. Counts, work items, blocker, decision, risk, owners, and milestone now come from the same source data and are labeled as demo content.
- Updated Next.js to 16.3.8, the current patch release, without changing the local-first architecture or workspace schema.
- Patched the unmaintained `braces` lint-toolchain dependency with a nesting-depth guard; dependency audit now passes without changing the quality gate.

## 2.7.0 — 2026-09-29

- Reorganized the global visual system into named CSS cascade layers with a shared semantic foundation for surfaces, type, accents, motion, layout and overlays.
- Improved small-screen legibility across first run and the interactive product preview; the preview now uses a focused, scrollable mobile composition.
- Expanded the command palette with locally stored recent destinations, grouped matches and inline query highlighting.
- Increased readability in Today coverage, Portfolio evidence, calendar metadata and mobile workspace navigation.
- Added browser layout coverage for RU/EN workspace surfaces across the requested phone, tablet, laptop and desktop widths, including first-run and editor reachability.
- Extended accessibility smoke checks across RU/EN and light/dark workspace themes.

## 2.6.1 — 2026-09-28

- Rebuilt the root language-entry page as a polished PMWORK introduction with direct, prominent Russian and English routes, local-first trust cues and responsive motion.
- Replaced the workspace’s blank loading pause with an honest, accessible local-data preparation screen and a calm indeterminate progress animation.
- Kept the loading/onboarding shell dimensions stable to protect cumulative layout shift, and refreshed the reviewed Linux onboarding references for desktop and mobile.
- Refined the first-run path with clearer project/example/backup choices, setup expectations, privacy reassurance, responsive layouts and reduced-motion behavior.
- Kept first-run actions, backup restore and the existing project creation flow connected to their original functions; no workspace data schema changed.
- Updated browser journey expectations for the redesigned first-run experience.

## 2.6.0 — 2026-09-28

- Rebuilt the bilingual landing page as a premium product story, with an interactive workspace preview, clear product capabilities, an operational loop, local-first trust details, linked knowledge metrics, method guidance and focused entry points.
- Added a cohesive visual system for marketing, catalog and workspace surfaces, with refined type scale, spacing, layered surfaces, restrained teal and copper accents, responsive layouts and subtle entrance, hover and progress animations.
- Added reduced-motion support and localized preview content, including the sample date and weekday labels.
- Reused the existing demo project and content counts; no workspace schema or project records changed.

## 2.5.0 — 2026-09-28

- Added a project calendar that reads only recorded work dates, milestone forecasts and risk review dates, and opens the source record.
- Added local CSV exports for work, risks, issues, decisions, milestones and budget with formula-injection protection, plus all-day iCalendar export.
- Replaced the basic document list with searchable, filterable, pinnable project documents, linked-record navigation and Markdown download.
- Expanded status drafts with an executive summary, schedule variance, risk exposure, budget totals, pending controls, data snapshot date and source links; drafts open for editing before sharing.
- Made stakeholder matrix points keyboard-operable and directly editable.
- Added unit and browser regressions for these workflows.

## 2.4.0 — 2026-09-27

- Rebuilt the workspace foundation around semantic light/dark surface, text, border, status, spacing, radius and elevation tokens while preserving existing feature styling contracts.
- Refined the desktop shell into a quieter control surface with clearer navigation grouping, denser project identity and restrained selected states.
- Reworked Today around one evidence-backed priority and a data-coverage strip that links owner gaps, unreviewed risks, undated decisions and forecast gaps to their source modules.
- Rebuilt Portfolio as a scannable executive list with operational filters for attention, critical signals, upcoming milestones, overdue records, stale activity, missing owners and missing forecasts.
- Replaced the mobile workspace navigation with a five-destination, safe-area-aware bottom bar and consistent More drawer access.
- Added browser coverage for Today data coverage and Portfolio evidence filters; no workspace schema changes or synthetic history were introduced.

## Unreleased — production hardening

- Reworked the public landing narrative around the daily signal → decision → action → control loop, with direct workspace entry, explicit offline/local-first trust points, and visible Pavel Markov authorship.
- Added Pavel Markov as the creator in locale landing metadata and clarified local data storage in the English hero copy.
- Added the responsive landing-to-workspace operating-loop section and ensured the author link remains visually distinguishable for accessibility.
- Added workspace graph integrity validation for cross-project references, dependencies, documents, vendors, settings, date relations and compatibility mirror fields.
- Hardened migration/import/restore/save so current-schema corruption fails closed while legacy v1-v5 compatibility repair removes only dangling references that cannot survive migration.
- Added future-schema and unknown-field backup rejection to prevent silent downcasts or silent data loss.
- Fixed empty-work vacuous truth in control coverage.
- Corrected flow semantics: trailing 7/14/28-day throughput and lead time now use stored evidence.
- Added prospective work-start/status evidence without invalidating legacy backups; new transitions now support real cycle-time and aging-WIP metrics while old records stay unknown rather than inferred.
- Added cycle sample size, median cycle time, P80/P90 only with sufficient evidence, and known/unknown WIP-aging counts.
- Extended graph integrity to reject contradictory prospective flow timestamps/history and status/done mismatches.
- Replaced native import/snapshot confirmation with an accessible PMWORK recovery dialog including validated backup counts, safety-snapshot semantics and an explicit current-backup download action.
- Extracted the workspace Settings/data-recovery surface from the application shell as a low-risk architecture decomposition.
- Reduced mandatory PWA precache for deep knowledge/detail pages while preserving runtime caching and offline workspace/application shell behavior.
- Replaced a permissive global static-JS ceiling with route-specific performance budgets.
- Added Firefox, WebKit and mobile-WebKit smoke coverage alongside the complete Chromium browser suite.
- Added a recovery-first App Router error boundary with raw local recovery download and no automatic storage clearing.
- Updated recovery E2E to exercise the accessible replacement modal and its current-backup action.
- Preserved full Chromium visual evidence before cross-browser smoke so CI retains representative screenshots for manual review; verified artifacts contain 197 PNG files on root.
- Verified the implementation head with 97 unit/component tests, 204 Chromium E2E on root, 204 Chromium E2E on `/pmwork`, 9 Firefox/WebKit/mobile-WebKit smoke tests, both route-specific performance gates and 498-page static exports.
- Added `docs/AUDIT_10_10.md` and reconciled data-schema, quality-gate, transformation-status and release documentation with the current hardening branch.

## 2.2.0 — 2026-09-05

- Replaced 26 generic knowledge cards with distinct bilingual operational guides and direct workspace actions.
- Added project-scoped working presets and saved list/board views over existing records.
- Added side editing with focus restoration and keyboard record/action search.
- Replaced static health indicators with seven explained operational checks; surfaced dated dependency conflicts in attention and planning.
- Added timeline scales, milestone markers, a dependency RAID tab and honest ownership workload counts.
- Hardened local mirroring, corrupt-data recovery, snapshot selection and replacement checkpoints.
- Validated calculator boundaries and added explicit Monte Carlo probability interpretations.
- Repaired mobile/tablet sizing, navigation labels, Cyrillic wrapping and editor label associations.
- Versioned PWA caches by exported content and precached route scripts, styles and local fonts.
- Added root/Pages browser gates, seven viewport checks, RU/EN theme accessibility and offline regression coverage.

## 2.1.0 — 2026-09-05

- Completed RU/EN workspace localization with centralized enum labels and a practical language-purity gate.
- Added full edit/delete lifecycles for dependencies, milestones, iterations, RAID, people, finance, change, quality and documents.
- Added dependency cycle validation, persisted project closure and safe workspace schema v3 migrations.
- Made bundled demo content and template application locale-aware without translating or replacing user-authored data.
- Added template-to-project document application, broader command search and destructive restore confirmations.
- Refined landing/workspace hierarchy, forms, tables, mobile dialogs, themes and premium control-room styling.
- Added locale-aware PWA manifests/offline routing, production icons, Apple touch icon and social preview.
- Expanded regression coverage for localization, migrations, dependency editing, closure persistence and PWA packaging.

## 2.0.0 — 2026-09-05

- Upgraded workspace persistence to schema v2 with migration, snapshots and versioned backups.
- Added portfolio control tower, deterministic action ranking, control completeness and guided lifecycle.
- Added operational records for outcomes, assumptions, dependencies, iterations, team, changes, vendors, meetings, communications and quality gates.
- Replaced illustrative planning bars with a date-derived timeline and made CPM input editable.
- Added editable charter, forecast finance, global command palette and complete mobile module navigation.
- Expanded unit/component coverage for migrations, control rules, portfolio metrics and keyboard search.

## 1.0.0 — 2026-09-04

- Created the bilingual PMWORK local-first project operating system.
- Added project cockpit, backlog, accessible Kanban, RAID, stakeholders, finance, documents, backup and restore.
- Added deterministic method-fit, method composer, CPM, PERT, EVM, Monte Carlo, RICE, WSJF, and Little's Law tools.
- Added 16 methods, 47 templates, 38 problem playbooks, 26 knowledge domains, and 150+ glossary records.
- Added PWA shell, responsive themes, content checks, tests, CI, and GitHub Pages deployment.
