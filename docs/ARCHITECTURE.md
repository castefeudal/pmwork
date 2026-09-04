# Architecture

PMWORK is a static-exportable Next.js 16 application. Public knowledge routes are generated as static pages; the workspace is a client-side application whose data is validated with Zod and persisted in IndexedDB. No account, backend, tracker, or network sync is required.

## Boundaries

- `app/`: routes, metadata, sitemap, robots.
- `src/content/`: bilingual structured content and source registry.
- `src/domain/`: strict schemas, method-fit heuristic, pure calculations.
- `src/data/`: normalized demo workspace and IndexedDB import/export.
- `src/components/`: public shell, working surfaces, calculators.
- `scripts/`: content, localization, and link quality gates.

Entity relationships use stable IDs rather than duplicated nested objects. Schema version `2` persists the operating model: objectives, work, milestones, iterations, RAID, stakeholders, team/capacity, budget, change control, suppliers, meetings, reports, lessons, communications, quality gates and activity. Versioned import accepts both a raw workspace and an export envelope; a deterministic v1-to-v2 migration preserves existing data. Daily rotating recovery snapshots retain the latest five valid states.

The client is split into a small state/persistence orchestrator, typed creation dialog, workspace views and pure domain insight functions. Portfolio summaries, action ranking, flow metrics and completeness scores remain deterministic and testable without browser state.

## Rendering and deployment

`output: export` produces `out/`. In GitHub Actions a `/pmwork` base path and asset prefix are applied. Routes use trailing slashes so GitHub Pages can serve generated directory indexes. Pull requests run the full quality pipeline; pushes to `main` publish the verified static export through GitHub Pages. The same static output can also be hosted by Vercel, Netlify, Cloudflare Pages or ChatGPT Sites.
