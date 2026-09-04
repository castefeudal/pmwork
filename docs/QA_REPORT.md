# QA report

Run date: 2026-09-05. Runtime: Node 24.19.0.

## Automated results

| Check | Result |
| --- | --- |
| ESLint | PASS — 0 errors, 0 warnings |
| TypeScript strict | PASS |
| Content validation | PASS — 16 methods, 47 templates, 39 playbooks, 172 glossary entries |
| RU/EN parity | PASS |
| Internal dead-link patterns | PASS — 41 source files checked |
| Unit + integration + component tests | PASS — 19/19 across 4 files |
| Production static build | PASS — 27 generated pages |
| GitHub Pages base-path smoke | PASS — nested RU/EN route files and `/pmwork` assets verified |
| Dependency audit | PASS — 0 known vulnerabilities |
| Diff whitespace check | PASS |

Covered calculations: CPM, cycle detection, PERT and invalid ordering, EVM zero divisions, RICE, WSJF, Little's Law, Monte Carlo percentiles, method fit, and governance selection. Data tests validate both localized demo workspaces, the schema-v1-to-v2 migration, and JSON relationship round-trip. Insight tests validate prioritised management actions, completeness and portfolio roll-ups. Component tests validate view switching, work-item creation, accessible board status movement, and the Ctrl/Cmd+K command palette.

## Browser and visual review

The managed Chrome preview loaded the RU landing and workspace at desktop width. Visual inspection confirmed readable typography, stable hero/control-tower layout, visible focus-oriented controls, no overlap or horizontal page overflow, coherent portfolio density, and semantic DOM landmarks/headings. The workspace preview also exposed the new project switcher, ranked action queue, portfolio signals and primary creation flows.

Standalone Playwright could not launch because this execution environment does not contain the required Chromium binary. The six desktop/mobile RU/EN journey and axe jobs therefore have no local PASS. The suite remains committed and GitHub CI installs Chromium before executing it. The managed preview rendered pages but did not execute local-app click handlers reliably, so it was not used to claim an E2E pass. This is recorded as an external test-runtime limitation, not a product PASS.

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

## Deployment smoke required after push

CI and Pages status, live asset responses, and live client interaction must be verified after GitHub accepts the push. A remote failure is not treated as a local PASS.
