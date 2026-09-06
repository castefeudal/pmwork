# Architecture

PMWORK is a Next.js static export. GitHub Pages serves `/pmwork`; root builds remain supported. There is no backend, authentication or cloud synchronization.

- `src/domain/schemas.ts`: schema v6. `experience` controls guidance, `density` independently controls comfortable/compact rendering. Owner IDs and local project member selection are optional; text owners remain compatible.
- `src/data/storage.ts`: v1–v5 migrations, IndexedDB plus timestamped localStorage mirror, snapshots and validated import/export. The `pmwork:workspace:v3` storage key remains intentionally stable to preserve existing storage discovery; the payload schema is v6.
- `src/components/workspace-app.tsx`: explicit first run, workspace shell, project selection, language and recovery.
- `src/domain/workspace-url.ts` and `src/components/use-url-state.ts`: project/view/layout and tab/tool/query browser state.
- `src/domain/workspace-commands.ts`: validated work updates (including the record editor), stable owner assignment, risk conversion and status document draft commands. Other existing mutations still use their existing validated paths.
- `src/content/glossary-seed.ts`: original bilingual definitions and examples; `glossary.ts`: taxonomy, aliases, relationships and validation.
- `src/components/glossary-browser.tsx`: compact search, categories, levels and term details. `app/[locale]/glossary/[slug]`: statically generated bilingual pages and DefinedTerm metadata.
- Public catalog records are selected server-side. Public search is dynamically imported only when invoked. Methods and templates have independent client hubs; playbooks/knowledge share a narrow progressive catalog. Unused legacy branches were removed.
- Work cards and planning agenda provide narrow-screen alternatives; the table and timeline remain available on desktop.
- The service worker precaches exported routes. A waiting update is activated only after a user action; offline status is visible.

## Contextual workbench

Today is isolated in `today-view.tsx`; project setup in `project-setup.tsx`. `decision-tools.ts` owns validated calculations. Project tools and data selection are dynamically loaded. `tokens.css` is the canonical token source; `fonts.css` references local font packages. The export preparation step sets route-specific document language before cache hashing.
