# Data schema and migrations

Current payload schema: **v6**. The browser discovery key remains `pmwork:workspace:v3`; changing that key would orphan existing local data.

## Additive v6 records

- Work estimates retain `originalEstimate`, mutable `currentEstimate`, append-only `estimateHistory { value, timestamp, reason? }`, and `actualEffort`. Deprecated `estimate` remains a compatibility mirror of current estimate.
- Milestones retain `baselineDate`, `forecastDate`, optional `actualDate`, owner, confidence 0–100, status, progress, forecast reason, timestamps, and append-only field history. Deprecated `date` mirrors forecast date.
- Risks keep qualitative probability/impact 1–5. Optional monetary fields use independent units: probability percentages, gross/residual impact amounts, response cost, and ISO-like three-letter currency. Missing monetary input means unknown, never zero.
- `toolRuns` store a compact deterministic run: tool, project, timestamp, source, assumptions, input values, output summary, confidence, data-quality statement, and affected record IDs. They never copy the full workspace.

## Migration behavior

`migrateWorkspace` accepts v1–v5 and produces a strictly parsed v6 payload. Legacy estimates become original/current baselines with a migration history entry. Legacy milestone `date` becomes both baseline and forecast. Existing IDs, projects, links, records, owner text/IDs, saved views, preferences, and locale are preserved. Missing collections receive safe defaults. Future versions and malformed required fields are rejected.

Automated tests cover every supported source version, round-trip parsing, legacy milestone/estimate conversion, invalid storage recovery, snapshot restoration, and future-schema rejection.

## Backup envelope

Exports contain `product`, `schemaVersion`, `appVersion`, `exportedAt`, project/work/risk counts, and `workspace`. Import is limited to 10 MB and completes validation and migration before replacement is offered. The UI previews schema and counts, asks for confirmation, and creates a forced local safety snapshot before replacing healthy current data.

Important: snapshots and IndexedDB are device-local, not cloud backup. Users should download JSON before clearing browser storage or changing origins.
