# Data schema and migrations

Current payload schema: **v6**. The browser discovery key remains `pmwork:workspace:v3`; changing that key would orphan existing local data.

## Additive v6 records

- Work estimates retain `originalEstimate`, mutable `currentEstimate`, append-only `estimateHistory { value, timestamp, reason? }`, and `actualEffort`. Deprecated `estimate` remains a compatibility mirror of current estimate.
- Milestones retain `baselineDate`, `forecastDate`, optional `actualDate`, owner, confidence 0–100, status, progress, forecast reason, timestamps, and append-only field history. Deprecated `date` mirrors forecast date.
- Risks keep qualitative probability/impact 1–5. Optional monetary fields use independent units: probability percentages, gross/residual impact amounts, response cost, and ISO-like three-letter currency. Missing monetary input means unknown, never zero.
- `toolRuns` store a compact deterministic run: tool, project, timestamp, source, assumptions, input values, output summary, confidence, data-quality statement, and affected record IDs. They never copy the full workspace.

## Migration behavior

`migrateWorkspace` accepts v1–v5 and produces a strictly parsed v6 payload. Legacy estimates become original/current baselines with a migration history entry. Legacy milestone `date` becomes both baseline and forecast. Existing IDs, projects, links, records, owner text/IDs, saved views, preferences, and locale are preserved. Missing collections receive safe defaults. Future versions and malformed required fields are rejected.

The migration pipeline is intentionally fail-closed in two additional ways:

1. **Backup fidelity check.** Zod object parsing can remove unknown keys. PMWORK therefore compares the original payload with the parsed/migrated payload. If an input field would disappear because the current version does not understand it, migration stops instead of silently dropping user data. This applies to nested records as well as the workspace root.
2. **Graph integrity check.** Shape-valid data is not enough. PMWORK validates project boundaries and links after migration before the workspace can be loaded, saved, exported or restored.

Automated tests cover every supported source version, round-trip parsing, legacy milestone/estimate conversion, invalid storage recovery, snapshot restoration, future-schema rejection, unknown-field protection, and graph-corrupt backups.

## Graph integrity

`validateWorkspaceGraph` checks observable referential integrity, including:

- duplicate entity IDs within collections;
- existence of every referenced project;
- work parent/milestone/iteration/dependency/risk/objective/owner links;
- cross-project references;
- explicit dependency links, self-dependencies and dependency cycles;
- issue → risk/work links;
- objective deliverables and iteration work membership;
- capacity allocations and local-member references;
- vendor milestone/risk/dependency links;
- document and tool-run related record IDs;
- project/work/iteration date validity and impossible start/end order;
- compatibility mirrors (`estimate` = `currentEstimate`, milestone `date` = `forecastDate`);
- duplicate one-per-project settings, work-view preferences and closure records.

A graph-integrity failure is treated as recoverable invalid data: autosave must not overwrite the original source.

## Flow metric evidence

Schema v6 stores `createdAt` and optional `completedAt`, but does not store a reliable first-start timestamp or full status-transition history. Therefore:

- `createdAt → completedAt` is called **lead time**;
- throughput is calculated from completed records inside explicit 7/14/28-day windows;
- **cycle time remains unknown** instead of being fabricated from creation time;
- a future additive schema may introduce prospective `startedAt` / status history, but old backups must not receive invented historical start dates.

## Backup envelope

Exports contain `product`, `schemaVersion`, `appVersion`, `exportedAt`, project/work/risk counts, and `workspace`. Import is limited to 10 MB and completes parsing, migration, backup-fidelity validation and graph validation before replacement is offered. The UI previews schema and counts, asks for confirmation, and creates a forced local safety snapshot before replacing healthy current data.

Important: snapshots and IndexedDB are device-local, not cloud backup. Users should download JSON before clearing browser storage or changing origins.
