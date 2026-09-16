# Changelog

## Unreleased — production hardening

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