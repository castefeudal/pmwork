# Current branch QA — 2026-09-05

44 unit/component tests passed. The complete final Playwright run passed 80/80 scenarios on desktop/mobile, without retries. Representative axe checks passed in RU/EN and light/dark; the seven requested viewport sizes passed body-overflow checks. Additional scenarios cover explicit first run, clean project creation, project/view history, locale preservation, glossary alias/detail accessibility, global keyboard search, template destination/open/undo and screenshot evidence.

Static build and export validation passed. Local transfer budgets passed. This is representative testing, not a blanket WCAG conformance certification or field Core Web Vitals assessment.

See RELEASE.md for scope qualifications and pending remote CI/deployment evidence.

---

> Current branch note: refer to PRODUCT_SPEC.md, CONTENT_MODEL.md, QUALITY_GATE.md and RELEASE.md for current behavior and validation. Earlier measurements below are historical and are not evidence for the new branch.

# PMWORK 2.2 release QA

Run date: 2026-09-05. Node 24, Chromium desktop and Pixel 7 emulation.

## Evidence

The pre-existing premium pass at `1340b8b` failed ESLint in both Quality gate and Pages. This release removes the failing navigation effect and keeps the existing architecture and visual system.

The release branch is tested as a two-entry matrix: root and GitHub Pages `/pmwork`. Each entry runs `npm ci`, `npm run verify`, Chromium installation and the browser suite. Deployment repeats the Pages gate before publication and validates the live commit and assets afterwards.

| Check | Release coverage / observed result |
| --- | --- |
| ESLint and strict TypeScript | PASS |
| Unit/component/integration | 33 tests across 7 files PASS |
| Content | 16 methods, 47 templates, 39 playbooks, 172 glossary entries; 26 distinct practical knowledge guides |
| Content integrity | Bilingual values, placeholders, duplicate primary descriptions, method-source relationships |
| i18n and source links | PASS; runtime approach labels normalized for RU |
| Static export | 26 HTML files; local references and required PWA files validated |
| E2E | 56 cases per base-path configuration; desktop + mobile |
| Reflow | 360×800, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080; 11 workspace sections |
| axe | Overview, Work, Board, Planning, RAID in RU/EN × light/dark; public and tool smoke checks |
| Persistence | Saved views after reload, corrupt-byte preservation, IDB fallback, snapshots, backup export/replacement and rejected invalid JSON |
| PWA | Offline workspace and navigation; versioned HTML, Next navigation payloads, JS, CSS and local fonts |
| Typography | Inter and Manrope observed loaded in browser FontFaceSet |

Browser artifacts and traces are retained in GitHub Actions for seven days. See [Quality gate runs](https://github.com/castefeudal/pmwork/actions/workflows/ci.yml) and [Pages runs](https://github.com/castefeudal/pmwork/actions/workflows/pages.yml).

## Corrections driven by browser evidence

- Fixed a duplicate editor heading/input ID that prevented exact label resolution.
- Gave view sorting and grouping explicit accessible names.
- Corrected fixed-width sidebar interference with tablet and mobile layouts.
- Wrapped portfolio footer actions and the constrained workspace header.
- Added visible labels to mobile section navigation and reserved bottom space.
- Applied meaningful semantics to labelled risk-matrix cells.
- Removed repetitive autosave toasts; preservation failures still produce feedback.
- Made snapshot selection resilient to a missing or corrupt index in either storage layer.
- Added static navigation payloads to the PWA cache for cross-page offline navigation.

## Visual inspection

Inspected actual Chromium captures of landing, overview, portfolio, list, board, planning, RAID, people, finance, control, documents, setup, knowledge, catalogs, every calculator, side editor and command palette. Reviewed desktop/mobile and RU/EN theme captures. These captures exposed the generic knowledge cards and untranslated fit results; both were corrected.

The managed development preview could show landing but did not hydrate Workspace reliably. It is not used as evidence that production works. The authoritative browser suite runs against the real static export in GitHub CI, where Chromium installs successfully. The authoring container’s Chromium CDN download was unavailable.

## Scope of claims

Automated axe checks and keyboard journeys are representative WCAG 2.2 AA evidence, not a formal certification. Seven viewport checks are not a real-device usability study. No human time-to-first-action measurement or comparative performance claim is made. Work editing opens in one click, common creation is directly available in the header/palette, and saved views reuse the same source records.

Workload counts assignments and blockers; it does not infer utilization from incomparable points and hours. The product remains device-local without account sync or concurrent shared editing. Forecasts describe simulations under explicit assumptions, not guaranteed outcomes.
