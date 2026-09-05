# Architecture

PMWORK is a Next.js static export. GitHub Pages serves `/pmwork`; root builds remain supported. There is no backend, authentication or cloud synchronization.

- `src/domain/schemas.ts`: schema v4. `experience` controls guidance, `density` independently controls comfortable/compact rendering. Owner IDs and local project member selection are optional; text owners remain compatible.
- `src/data/storage.ts`: v1/v2/v3 migrations, IndexedDB plus timestamped localStorage mirror, snapshots and validated import/export. The `pmwork:workspace:v3` storage key remains intentionally stable to preserve existing storage discovery; the payload schema is v4.
- `src/components/workspace-app.tsx`: explicit first run, workspace shell, project selection, language and recovery.
- `src/domain/workspace-url.ts` and `src/components/use-url-state.ts`: project/view/layout and tab/tool/query browser state.
- `src/domain/workspace-commands.ts`: validated work updates, owner assignment, risk conversion and status document draft commands. Other existing mutations still use their existing validated paths.
- `src/content/glossary-seed.ts`: original bilingual definitions and examples; `glossary.ts`: taxonomy, aliases, relationships and validation.
- `src/components/glossary-browser.tsx`: compact search, categories, levels and term details. `app/[locale]/glossary/[slug]`: statically generated bilingual pages and DefinedTerm metadata.
- Public catalog records are selected server-side. Public search is dynamically imported only when invoked. Existing catalog rendering is shared for methods/templates/playbooks/knowledge, with task-specific comparison, collections and learning-path controls.
- Work cards and planning agenda provide narrow-screen alternatives; the table and timeline remain available on desktop.
- The service worker precaches exported routes. A waiting update is activated only after a user action; offline status is visible.
