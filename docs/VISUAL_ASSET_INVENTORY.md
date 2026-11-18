# Visual asset inventory

Artwork used by the Operational Atlas visual system.

## Raster plates — `public/visuals/`

The atlas artwork is generated for PMWORK, then cropped and encoded to WebP. Narrative
text lives in the UI so both languages use the same source art. The gateway and home hero
each load a single high-priority source. Portrait crops are selected below 768 px. Feature
and role illustrations load lazily. All WebP plates are included in the offline export.

| File | px | KiB | Surface |
| --- | --- | --- | --- |
| `atlas/entry.webp` | 1440×810 | 43.4 | Language cover |
| `atlas/entry-mobile.webp` | 560×740 | 18.2 | Language cover, portrait crop |
| `atlas/hero.webp` | 1440×810 | 86.7 | Localized home hero |
| `atlas/hero-mobile.webp` | 560×740 | 50.6 | Localized home hero, portrait crop |
| `hero/atlas-band-dark.webp` | 1400×933 | 93.0 | Management loop |
| `roles/project.webp` | 475×263 | 39.4 | Project milestones |
| `roles/program.webp` | 475×263 | 33.2 | Program dependencies |
| `roles/delivery.webp` | 475×263 | 39.1 | Delivery flow |
| `roles/operations.webp` | 475×263 | 34.2 | Operations monitoring |
| `sections/control.webp` | 475×263 | 44.3 | Overview and control |
| `sections/planning.webp` | 475×263 | 31.4 | Work planning |
| `sections/risk.webp` | 475×263 | 51.3 | Risk and decisions |
| `sections/analytics.webp` | 475×263 | 35.0 | Calculation tools |
| `sections/dependencies.webp` | 475×263 | 39.0 | Method comparison |
| `sections/knowledge.webp` | 475×263 | 39.3 | Library feature and knowledge catalog |
| `onboarding/arrival.webp` | 475×263 | 44.2 | Workspace first run |
| `empty/work.webp` | 200×112 | 2.3 | Empty work list |
| `sections/convergence.webp` | 1280×620 | 16.0 | Closing section and social artwork |

## Vector graphics — `src/components/atlas-*.tsx`

Drawn as live SVG so they follow `tokens.css` through theme, high contrast and
text zoom, add no HTTP request, and stay selectable. Colour comes from the
`--atlas-*` tokens in `app/visuals.css`, never from hard-coded fills.

The drawings are split across four modules on purpose, because a `"use client"`
island ships everything it imports inside its own route bundle:

| Module | Contents | Imported by |
| --- | --- | --- |
| `atlas-marks.tsx` | The shared vocabulary — `Rail`, `Node`, `ControlPoint`, `Arrow`, `Defs`, `PlateMarks`, `atlasAsset`, the `--atlas-*` token aliases | Any surface, including client islands |
| `atlas-empty.tsx` | `EmptyStateGraphic` (three SVGs and the Work plate) | Interactive workspace surfaces |
| `atlas-graphics.tsx` | `MethodDiagram`, `methodDiagramCaption`, `RiskMatrix` | Method articles, tools lab, capability board |
| `atlas-editorial.tsx` | `LibraryMotif` and the landing-only plates | Server-rendered landing page |

| Export | Drawings | Where used |
| --- | --- | --- |
| `MethodDiagram({kind})` | `scrum` cycle, `kanban` flow, `cpm` network with critical path and float, `pert` distribution, `evm` curves, `risk` matrix, `priority` logic. Each sheet is centred in its plate and carries a visible `figcaption` from `methodDiagramCaption`, so the drawing states what it depicts instead of relying on colour alone | Method articles (`app/[locale]/methods/[slug]/page.tsx:27`) and tools `cpm`, `pert`, `evm`, `emv`, `priority`, `flow` (`src/components/tools-lab.tsx:108`) |
| `EmptyStateGraphic({kind})` | `no-work`, `no-risks`, `no-filter`, `no-records` | Work list (`src/components/work-surface.tsx:123`), planning timeline (`src/components/planning-timeline.tsx:70`), attention signals and generic register (`src/components/workspace-views.tsx:361`, `:1743`) |
| `LibraryMotif({kind})` | `method`, `template`, `scenario`, `term` — four different sigils | Landing library cards, `app/[locale]/page.tsx:250` |
| `PlateMarks()` | Copper corner registration marks, `aria-hidden` | Hero showcase (`app/[locale]/page.tsx:210`), role plate (`src/components/role-showcase.tsx:49`), onboarding plate (`src/components/workspace-welcome.tsx:35`) |
| `atlasAsset(path)` | Resolves `/visuals/…` under the active base path | All raster consumers above |


A method or tool only gets a sheet when the drawing is *correct* for it —
`critical-chain`, `lean`, `stage-gate` and the rest keep prose rather than a
near-miss diagram.

## Brand and icon surfaces

Unchanged and still authoritative: `public/brand/logo-mark.webp` (256×256, the
image-assisted adaptation of the owner's two-arrow symbol — deliberately raster,
not a claimed vector reconstruction), `public/brand/favicon.png`,
`public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`,
`public/apple-touch-icon.png`. The mark keeps no glow and no animation.

`public/icon.svg` was **redrawn**. It listed first among the `<link rel="icon">`
entries, so SVG-capable browsers put it in the tab — and it was an unrelated
four-tile grid that appears on no other surface. It is now a flat small-size
icon in the same language as the mark (two upward arrows, teal behind copper, on
the navy tile) and stays legible at 16 px. It is an icon for tiny sizes, not a
vector version of the supplied symbol; see [BRAND.md](BRAND.md).

`public/og-image.png` and `public/og-image.svg` were **removed**: they rendered a
fictional dashboard with invented figures (68 %, $184k, "3 priority actions") and
a "P" tile that is not the PMWORK mark. `public/visuals/social/` replaces them.

## Regenerating the social previews

```
npm run social:build
```

`scripts/build-social-preview.mjs` serves the composition over a loopback port,
renders it in Chromium with the self-hosted Manrope variable font and the shipped
512 px brand tile, and writes both PNGs. It is a build-time tool: no runtime
dependency, no network call, nothing added to the exported site.

The previews are localized 1200 × 630 PNGs for Open Graph and Twitter. The
service worker excludes them from precache because link unfurlers request them
separately from the app.
