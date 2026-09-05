# Document layout and PMWORK identity release

Scope: repair clipped template dialogs, improve document reading and catalog layout, integrate the owner-supplied PM identity, and rename the bundled Atlas demonstration to MARKOVMADE. This release builds on main after PR #4; it does not claim completion of every item in the earlier broad transformation specification.

## Evidence

[release-evidence.json](release-evidence.json) is the authority for final local test/export counts and compressed transfer sizes. The required run is `npm ci`, `npm run verify`, `npm run test:e2e`, then `npm run performance:check`. Local Chromium 149 is used; GitHub CI validates root and `/pmwork` with its pinned browser. Hosted results belong to the PR Checks and Pages workflow for this commit.

[LAYOUT_QA.md](LAYOUT_QA.md) explains the reported defect, repair and regression coverage. Actual visual review includes mobile Russian and desktop English template dialogs, the Russian template catalog and the English dark board. Existing broader screenshots and automated reflow/axe checks are retained. No formal WCAG certification, field Core Web Vitals or unsupported 10/10 product score is asserted.

## User-visible changes

- Viewport-owned modal windows with full document content, scrolling, a sticky title/close control and an accessible apply action.
- Shared document reading layout with headings, paragraphs, lists, emphasis and tables; editable source remains available without losing changes.
- Two-column desktop catalogs, single-column mobile catalogs, wrapping content and localized template categories.
- PM symbol in navigation and install icons; refined navy dark surfaces and restrained teal accents. The mark uses a navy background, not claimed transparency. See [BRAND.md](BRAND.md).
- MARKOVMADE demonstration title; only exact original names on explicitly marked demo records migrate. Stable IDs and user-created names are preserved.

## Limits

Document reading supports a deliberate Markdown subset, not a complete rich-text editor. Very wide work boards and tables retain local scrolling. The original references were raster JPGs; no genuine SVG source was supplied or invented. Earlier product/editorial gaps remain described in the historical transformation ledger and are not presented as solved by this visual repair.
