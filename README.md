# PMWORK 2.3

PMWORK is a bilingual, local-first Project Management Operating System: project data becomes an explained signal, a decision or action, a persisted change, and a new feedback signal. The application is a Next.js static export with no account, backend, cloud sync, AI chat, analytics, or trackers.

## Product surfaces

- Today command center: one dominant priority, decision/action/check groups, evidence-aware Stable signals, and separate project state/data confidence.
- Work: dense list, accessible Kanban, saved views, estimates preserved as Original → Current → Actual, WIP, owners, dependencies, and milestones.
- Plan and control: milestone baseline/forecast/actual lifecycle, human-readable variance, dependency validation, budget, quality, changes, closure, and status drafts.
- RAID and people: qualitative risks plus optional monetary EMV, assumptions, issues, decisions, stakeholders, team, communications, and vendors.
- Deterministic tools: CPM, PERT, EVM, forecast, priority, flow, Deadline Confidence, Risk EMV, Capacity & WIP, Decision Matrix, Ownership Coverage, Change Impact, Estimate Calibration, and MARKOVMADE Priority.
- Professional library: 17 methods, 47 templates, 39 playbooks, 26 knowledge domains, and 172 glossary records in RU/EN.
- Five starter packs create selectable, coherent project bundles without invented people.

## Data, privacy, and offline

Schema v6 is stored in IndexedDB with a timestamped localStorage mirror. Migrations accept v1–v5 workspaces without resetting records. JSON backup includes schema/app version, export time, and record counts; import performs size check, parse, migration, strict validation, preview, confirmation, a safety snapshot, then persistence. Unknown future schemas are rejected.

The production service worker precaches the application shell, routes, scripts, styles, fonts, and PWA assets with a content-derived cache version. Updates require a user action. Project data stays in the current browser origin; clearing browser storage removes it unless the user exported a backup.

## Stack and local development

Next.js 16, React 19, strict TypeScript, Zod, IndexedDB, Vitest 5, Playwright, and axe.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/`.

## Release quality gate

```bash
npm run verify
npm run test:e2e
npm run performance:check
```

CI executes the same production-export gate for both root hosting and the GitHub Pages `/pmwork` prefix. See [Quality gate](docs/QUALITY_GATE.md), [Release](docs/RELEASE.md), [Schema and migrations](docs/DATA_SCHEMA.md), and [Transformation status](docs/TRANSFORMATION_STATUS.md).

## Deployment

Pushes to `main` run Quality Gate and the official GitHub Pages workflow. The deploy job verifies the published `release.json`, routes, scripts, styles, fonts, and PWA assets against the workflow commit. See [Deployment](docs/DEPLOYMENT.md).

## Repository map

```text
app/              static routes and metadata
src/components/   public and workspace UI
src/content/      bilingual catalogs and starter packs
src/domain/       schemas, calculations, signals, commands
src/data/         IndexedDB, migrations, backups, demo workspace
scripts/          content, export, PWA, link, and performance gates
tests/e2e/        desktop/mobile workflows, axe, reflow, offline, performance
docs/             product, engineering, release, and manual protocols
```

Contributions must preserve the local-first/static-export contract, RU/EN parity, migration compatibility, accessible alternatives, and deterministic explanations. Do not weaken gates or present heuristics as objective forecasts.
