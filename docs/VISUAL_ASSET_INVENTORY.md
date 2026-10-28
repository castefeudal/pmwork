# Visual asset inventory

Every visual material shipped by the 2026-10 transformation, with the component
that renders it. Nothing in this table is optional: an asset with no consumer is
deleted, not kept. Direction rationale: [VISUAL_DIRECTION.md](VISUAL_DIRECTION.md).

## Raster plates — `public/visuals/`

Generated as original artwork with the image-generation tool, then resized and
encoded to WebP locally. No stock photography, no renamed SVG, no CSS gradient
posing as an image. None of them contains lettering, so one file serves RU and
EN; the words come from the DOM.

| File | px | kB | Rendered by | Surface |
| --- | --- | --- | --- | --- |
| `hero/atlas-band-dark.webp` | 1400×933 | 93.0 | `src/components/atlas-band.tsx:41` | Landing — Signal → Decision → Action → Control band |
| `roles/project-dark.webp` | 960×720 | 25.6 | `src/components/role-showcase.tsx:50` | Landing — project role plate |
| `roles/program-dark.webp` | 960×720 | 39.9 | `src/components/role-showcase.tsx:50` | Landing — programme role plate |
| `roles/delivery-dark.webp` | 960×720 | 29.6 | `src/components/role-showcase.tsx:50` | Landing — delivery role plate |
| `roles/operations-dark.webp` | 960×720 | 38.9 | `src/components/role-showcase.tsx:50` | Landing — operations role plate |
| `onboarding/atlas-plates-dark.webp` | 1100×880 | 51.7 | `src/components/workspace-welcome.tsx:36` | First-run gate plate |
| `social/og-image-ru.png` | 1200×630 | 251.5 | `app/[locale]/page.tsx:54` (Open Graph / Twitter, RU) | Crawler surface only, never loaded by the page |
| `social/og-image-en.png` | 1200×630 | 251.5 | `app/[locale]/page.tsx:54` (Open Graph / Twitter, EN) | Crawler surface only, never loaded by the page |

Landing raster on the critical path: 227 kB for all five plates, each requested
only when its section is reached (`loading="lazy"`, explicit `sizes`). The
onboarding plate is on the workspace route. The social previews are fetched by
link unfurlers, not by a visitor to the site, so they cost the product nothing.

The four role plates are deliberately different compositions rather than one
template recoloured: a schedule lattice, a programme roll-up, a delivery pipeline,
an operations rhythm strip. Each carries its own `alt` and `figcaption`.

## Vector graphics — `src/components/atlas-*.tsx`

Drawn as live SVG so they follow `tokens.css` through theme, high contrast and
text zoom, add no HTTP request, and stay selectable. Colour comes from the
`--atlas-*` tokens in `app/visuals.css`, never from hard-coded fills.

The drawings are split across four modules on purpose, because a `"use client"`
island ships everything it imports inside its own route bundle:

| Module | Contents | Imported by |
| --- | --- | --- |
| `atlas-marks.tsx` | The shared vocabulary — `Rail`, `Node`, `ControlPoint`, `Arrow`, `Defs`, `PlateMarks`, `atlasAsset`, the `--atlas-*` token aliases | Any surface, including client islands |
| `atlas-empty.tsx` | `EmptyStateGraphic` (four kinds) | Interactive workspace surfaces |
| `atlas-graphics.tsx` | `MethodDiagram`, `methodDiagramCaption`, `RiskMatrix` | Method articles, tools lab, capability board |
| `atlas-editorial.tsx` | `FeatureGraphic`, `LibraryMotif`, and the landing-only plates | Server-rendered landing page |

| Export | Drawings | Where used |
| --- | --- | --- |
| `FeatureGraphic({kind})` | `attention`, `board`, `risk`, `model`, `method`, `library` — six *different* diagram types (signal map, kanban flow with WIP pips, scored risk matrix, plan-vs-actual variance, two-axis method field, template sheets) | Landing capability grid, `app/[locale]/page.tsx:226` |
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

The previews are the only shipped raster that `scripts/prepare-pwa.mjs` leaves out
of the service-worker precache list. A link unfurler requests them; the product
never does, so 515 kB of crawler artwork has no place in the offline shell. Every
other file above is in the export and was fetched from it.

## Verification

Each asset was checked in the exported build (`out/visuals/…`), not just in
source: HTTP 200 for every file, correct intrinsic size, no layout shift from the
reserved `width`/`height`.

Screenshots, not JSX, decided the composition. `npm run shots` with
`SIZES=1440x900,390x844 THEMES=light,dark LOCALES=ru,en` writes 104 views into
`visual-review/after/` against `visual-review/before/`. The empty states need a
project with nothing in it, which the bundled demo never is, so they are captured
by driving the create-project wizard and the work search to a zero-result filter.
Seven defects were only visible this way (each is recorded with its cause in
[VISUAL_DIRECTION.md](VISUAL_DIRECTION.md)): the plate figure margin that shrank
every atlas plate, the role grid track that collapsed its plate, the coverage
strip that declared more columns than it had data, and `width:100%` on
`.atlas-graphic` that let each empty-state drawing set its own flex minimum, the
role row that left a hole under the copy, diagram plates far wider than the
sheets they framed, and a first-run plate that matched the dark canvas exactly.

The role showcase is checked structurally as well as by eye: all four sheets are
prerendered and the tab island reveals one pair at a time, so a probe walks
2 locales × 2 themes × 2 widths × 4 roles and asserts exactly one visible figure
and body, a decoded plate, a non-empty caption, no horizontal overflow, a single
`aria-pressed` tab and no layout shift across the switch.

