# Document layout and PMWORK identity release

## Production completion attempt — 2026-09-06

Branch: `final/pmwork-production-completion`, based on `039c69badc72bb57f1617b871c3446202b5f6a30`.
This is an incomplete P0 repair, not a final production release.

- Confirmed main failures: Quality Gate run `34002294373` and Pages run `34002294412`. Browser logs report workspace CLS `0.1239574712117513` and duplicate exact `Add` names.
- Live `release.json` still reports commit `25d59e5de5325885a87d23e0d3e1654347328976`, matching successful Pages run `33999250427`.
- Local Work creation now has the distinct bilingual name `Add work item` / `Добавить работу` and secondary styling. Global Add retains its primary hierarchy. Component regression tests cover both locales and the local action destination.
- Loading and first-run screens no longer reuse the centered brand subtree. This is a candidate CLS correction; no passing browser measurement is claimed.
- Chromium 151 was installed, but the execution environment rejects its socket creation (`Operation not permitted`). The request for an escalated browser launch was automatically rejected by environment approval policy. Browser tests cannot reach the application in this environment.
- No PR, merge, new deployment, visual acceptance, editorial completion or complete transformation acceptance is claimed. The existing broader product gaps remain open. Existing release evidence below describes the earlier document/brand release.

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
