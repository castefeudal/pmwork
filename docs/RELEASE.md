# Contextual workbench — validation status

Base main: `dd6aa85b5c46310d62738a7fc494b59fbbdba931`.
Branch: `feat/pmwork-contextual-workbench`.

This is an implementation branch, not a completed production transformation. Production remains on the existing main release. The explicit open acceptance items in [TRANSFORMATION_STATUS.md](TRANSFORMATION_STATUS.md) prevent presenting or deploying this branch as the requested final release.

## Authoritative evidence

The final local run is recorded in [release-evidence.json](release-evidence.json). That generated file is the authority for test/export counts and compressed transfer sizes; historical counts in `docs/archive/` describe earlier releases only. GitHub PR checks separately validate the committed code on root and `/pmwork` base paths.

Baseline at the commit above: `npm ci` passed; lint, types, content, i18n, links and 47 unit/component tests passed. The build failed downloading Google fonts in this environment. Baseline performance and browser checks consequently had no valid export to test. No baseline browser count or measured bundle comparison is claimed. Fonts are now bundled locally, using the existing Inter/Manrope families.

Final commands: `npm ci`, `npm run verify`, `PMWORK_CHROMIUM=/tmp/pmwork-chromium npm run test:e2e`, then `npm run performance:check`. Browser tests run with two workers to bound concurrent full-page capture load. No test or accessibility assertion is disabled. Local Chromium is 149.0.7827.0; hosted CI installs Playwright's pinned Chromium.

Copy checking rejects high-confidence placeholders and formulaic rhetoric. It also reports exact shared secondary prose; passing this checker does not certify complete editorial distinctiveness. npm emits an environment-level `http-proxy` configuration warning.

## Accessibility and visual scope

Automated browser checks cover representative RU/EN public and workspace routes, new decision tools, labels, keyboard flows, dialogs, initial document language, reduced motion, offline navigation and reflow. The suite captures widths 320, 360, 390, 768, 1024, 1280, 1440 and 1920. Actual manual visual review includes mobile Today, a desktop contact sheet spanning work/board/planning/RAID/people/control/documents/setup/portfolio/finance, English landing and the decision matrix. Duplicate Today headings and oversized tool headings were corrected after inspection. Capturing all screenshots is not a claim that every image was manually inspected.

A real scrollable calculator-result accessibility finding was fixed by exposing a named, keyboard-focusable result region. No formal WCAG certification, comprehensive screen-reader audit or product-wide accessibility conformance is claimed.

## Performance and release boundary

Bundle budgets are enforced for five representative routes. Browser checks enforce local CLS ≤ 0.1; these are laboratory observations, not field Core Web Vitals. PWA resources are built from the actual export and English/Russian HTML language is corrected before cache hashing.

No merge, Pages deployment or live verification of this branch is claimed. The existing public production URL returned HTTP 200 during the work; that response validates availability of the previous release only. The implementation must remain a draft while the product acceptance gaps remain.
