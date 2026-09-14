# Architecture

PMWORK 2.3 is a Next.js static export. GitHub Pages serves it below `/pmwork`; root hosting remains a tested build target. The browser is the complete runtime: there is no backend, authentication, cloud database, telemetry, or remote calculation service.

## System boundaries

- `src/domain/schemas.ts` defines additive workspace schema v6, including milestone lifecycle, estimate history, optional monetary risk fields, and compact persisted `toolRuns`.
- `src/data/storage.ts` owns v1–v5 migration, strict v6 parsing, IndexedDB/localStorage reconciliation, rotating snapshots, backup metadata, and safe import/export.
- `src/domain/workspace-commands.ts` owns linked mutations and preserves immutable estimate/milestone history.
- `src/domain/insights.ts` derives Today signals and observable control-contour coverage. Missing data remains unknown rather than green.
- `src/domain/decision-tools.ts` and `src/domain/markovmade.ts` contain deterministic, validation-first calculations; UI components persist only assumptions, inputs, summaries, confidence, quality, and affected IDs.
- `src/content/` contains bilingual methods, templates, playbooks, starter packs, glossary, and source relationships. Content and i18n gates execute during every build.
- `src/components/workspace-app.tsx` owns first run, project/view URL state, autosave, recovery, backup replacement, command navigation, and responsive workspace composition.

## Persistence contract

IndexedDB is primary and a timestamped localStorage envelope is the recovery mirror. The storage key remains `pmwork:workspace:v3` for discovery compatibility; payload schema is independently versioned at v6. The newest valid copy wins. If stored data is invalid, autosave pauses and the original bytes remain untouched while a safe demo and recovery actions are shown.

Import ordering is deliberately transactional at the UI boundary: read and size-check → JSON parse → migrate → strict v6 validation → preview → user confirmation → safety snapshot → save replacement. Future schema versions fail closed.

## Static export and PWA

`next.config.ts` limits static-generation concurrency to two workers so the 498-HTML-page bilingual export is reliable on constrained CI and Windows. `scripts/prepare-pwa.mjs` normalizes paths across operating systems, fixes static document language before hashing, derives a cache revision from output content, and emits `release.json`. The service worker normalizes canonical directory URLs, serves version-matched assets offline, and exposes an explicit waiting-update action.

## UI architecture

Today, work, planning, RAID, people, finance/control, documents, Guide, public catalogs, and tools share the same tokens and record commands. Narrow screens use mobile cards/bottom navigation; tables and boards retain local overflow only where the data surface itself requires it. Dialogs are viewport-owned, focus-managed, Escape-closeable, and restore focus.

See [DATA_SCHEMA.md](DATA_SCHEMA.md), [QUALITY_GATE.md](QUALITY_GATE.md), [SECURITY.md](SECURITY.md), and [ACCESSIBILITY.md](ACCESSIBILITY.md).
