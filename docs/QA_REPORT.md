# QA report

Run date: 2026-09-05. Runtime: Node 24.19.0.

## Automated results

| Check | Result |
| --- | --- |
| ESLint | PASS — 0 errors, 0 warnings |
| TypeScript strict | PASS |
| Content validation | PASS — 16 methods, 47 templates, 39 playbooks, 172 glossary entries |
| RU/EN parity | PASS |
| Internal dead-link patterns | PASS — 42 source files checked |
| Unit + integration + component tests | PASS — 19/19 across 4 files |
| GitHub Chromium E2E + axe | PASS — 14/14 desktop/mobile RU/EN checks |
| Production static build | PASS — 27 generated pages |
| Export integrity | PASS — 26 HTML files, required PWA assets and local references verified |
| GitHub Pages base-path smoke | PASS — nested RU/EN routes and `/pmwork` assets verified |
| Dependency audit | PASS — 0 known vulnerabilities |
| Diff whitespace check | PASS |

Covered calculations: CPM, cycle detection, PERT and invalid ordering, EVM zero divisions, RICE, WSJF, Little's Law, Monte Carlo percentiles, method fit, and governance selection. Data tests validate both localized demo workspaces, the schema-v1-to-v2 migration, and JSON relationship round-trip. Insight tests validate prioritised management actions, completeness and portfolio roll-ups. Component tests validate view switching, work-item creation, accessible board status movement, and the Ctrl/Cmd+K command palette.

## Browser and visual review

The managed Chrome preview loaded the RU landing at desktop width. Visual inspection confirmed readable typography, a stable hero/control-tower composition, coherent hierarchy, useful rather than decorative product visualization, and semantic landmarks/headings. The final public navigation now switches to a complete keyboard-operable drawer before desktop links become cramped.

Standalone Playwright could not launch in the authoring environment because its Chromium download timed out. The managed preview rendered public pages but did not execute the local-storage workspace reliably, so neither limitation is used as release evidence. GitHub CI installs Chromium and executes the authoritative 14-test matrix covering desktop/mobile RU/EN critical journeys, responsive navigation, page overflow, IndexedDB fallback, and axe scans.

## Adversarial audit corrections

- Replaced vulnerable dependency versions after audit found high/critical advisories; re-audit is zero.
- Fixed non-associated dialog labels found by component tests.
- Replaced collision-prone random work-item IDs with UUID-based stable IDs.
- Added a preview-compatible Next development wrapper.
- Corrected GitHub Pages base-path handling, manifest path, favicon path, canonical, and hreflang.
- Added button alternatives to board dragging and textual alternatives to matrices/timeline.
- Added a versioned data migration, rotating recovery snapshots, a portfolio control tower, deterministic action prioritisation and completeness scoring.
- Replaced the fixed CPM demonstration with an editable dependency network and explicit cycle/unknown-predecessor errors.
- Removed the mobile rule that hid workspace modules and supplied a horizontally scrollable project dock.
- Replaced the inert public mobile-menu icon with a complete focusable navigation drawer and Escape/backdrop dismissal.
- Rewrote every previously generic glossary extension entry with a term-specific RU/EN definition and practical example.
- Added a timeout-safe localStorage persistence fallback when IndexedDB is blocked or unavailable.
- Added export-artifact validation for HTML routes, PWA files, and every local `src`/`href` emitted by the build.
- Added localized live-document language updates and localized default metadata.
- Added explicit success/failure feedback for template copying.

## Deployment result

GitHub Pages is configured to publish every verified `main` revision through GitHub Actions. The application is also published through its owner-private production Site; both targets are generated from the same release source.
