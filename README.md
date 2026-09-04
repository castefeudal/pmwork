# PMWORK 2.0

The practical operating system for project managers. PMWORK connects professional guidance to actual project work: understand context, choose an approach, organize delivery, control uncertainty, and learn from the result. Version 2 adds a portfolio control tower, deterministic next-action guidance, schema migrations and operational governance records while preserving an AI-free, device-local architecture.

## What is included

- Local-first multi-project workspace with three coherent demo projects.
- Backlog, dense list, accessible Kanban, date-derived timeline, milestones, iterations and dependency register.
- Risks, issues, assumptions, decisions, stakeholder matrix, team, vendors, project health, budget forecast, editable charter and change/quality controls.
- Portfolio cockpit, deterministic priority actions, guided lifecycle and global command palette.
- Deterministic setup and method-fit engine with explainable scoring.
- CPM, PERT, EVM, Monte Carlo, RICE, WSJF, and Little's Law calculations.
- Bilingual catalogs: 16 methods, 47 templates, 39 problem playbooks, 26 knowledge domains, 172 glossary records.
- IndexedDB persistence with v1→v2 migration, rotating snapshots, validated JSON backup/restore, Markdown export and print/PDF views.
- RU/EN routes, light/dark/system behavior, responsive layout, PWA shell, SEO and WCAG 2.2 AA target.

## Architecture and stack

Next.js 16.3.4, React 19, strict TypeScript, Zod, IndexedDB, Lucide, Vitest, Playwright, axe. Public pages are statically generated; the workspace runs entirely on the device. No authentication, backend, analytics, AI, or workflow automation is included in v2.

See [Architecture](docs/ARCHITECTURE.md), [Feature matrix](docs/FEATURE_MATRIX.md), [Content sources](docs/CONTENT_SOURCES.md), and [QA report](docs/QA_REPORT.md).

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/`.

## Quality gate

```bash
npm run verify
npm run test:e2e
```

The main gate runs lint, strict typecheck, content count/placeholder validation, RU/EN parity, link checks, unit/integration tests, and the production static build.

## Data and privacy

Workspace data is stored in browser IndexedDB. A complete JSON backup can be downloaded and restored; v1 backups migrate to v2 and up to five daily local snapshots are retained. Clearing browser storage deletes the local workspace and its snapshots, so important projects should still be exported. No data is sent to a PMWORK server.

## Deployment

Push `main` to run the official GitHub Pages workflow. It validates the project, creates a `/pmwork` static export, and deploys `out/`. The same output works on other static hosts without a repository base path. See [Deployment](docs/DEPLOYMENT.md).

## Project structure

```text
app/              static routes and metadata
src/components/   public and workspace UI
src/content/      bilingual catalogs and source registry
src/domain/       schemas, calculations, fit rules
src/data/         IndexedDB and demo workspace
scripts/          content, i18n, and link gates
tests/e2e/        critical journeys and axe checks
docs/             product, engineering, and governance docs
```

## Contribution basics

Keep TypeScript strict, preserve RU/EN parity, add official sources for normative claims, label heuristics, avoid framework dogma, and run `npm run verify`. Do not add a license or imply affiliation with framework owners without repository-owner approval.
