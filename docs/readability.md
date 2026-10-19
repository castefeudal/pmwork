# Readability and evidence contracts

PMWORK uses a 16px body size at the browser's standard setting. Secondary text is 14–15px; meaningful dates, owners, statuses, table values and controls must not use miniature type. Sizes use rem units so browser preferences and the independent text-size setting can reflow the interface. The local preference `pmwork-text-size` supports standard (100%), enlarged (112.5%) and large (125%); it does not change workspace density or stored project data.

The landing preview presents one useful view at a time. Its data comes from the bundled project. Work status groups are interactive and do not require a miniature desktop frame or a horizontally scrolling page.

Program and Operations overview counts describe records, not health scores. Measured benefit counts require an actual value and a measurement date on or before the review date. Operational trends include observations on or before that date and require at least two distinct observation dates. Time coordinates use actual date intervals. Targets are reference lines, not forecasts. Missing observations remain explicitly unknown.

## Verification

- `tests/e2e/readability.spec.ts` checks computed demo fonts, 44px demo controls, text contrast through axe, all ten supported widths, preference persistence, density independence, enlarged workspace text, public controls and mobile navigation with 200% text, and 320 CSS-pixel reflow. A 320 CSS-pixel viewport represents reflow at 400% on a 1280px display; this is browser automation, not a human usability assessment.
- `tests/e2e/layout-regression.spec.ts` also checks control bounds, including controls that could escape a container without increasing document width. Wide tables retain local scrolling.
- Unit tests cover unavailable preference storage, invalid external preferences, future observations and actual-date chart geometry.
- Existing storage, migration, export, PWA, record editing and cross-browser scenarios remain release gates.
- Generate Linux reference candidates with `visual-references.yml`. Compare the candidate screenshots with the previous artifact, inspect both themes and languages on desktop and mobile, then update references. Keep the pixel thresholds unchanged.
- Run `verify`, Chromium E2E, the Firefox/WebKit/mobile-WebKit matrix and transfer-budget checks for the final revision. Publication requires a successful Pages deployment, an exact public `release.json` commit match and `scripts/live-check.mjs` success.

Automated axe checks and viewport emulation do not establish formal WCAG certification, real-device keyboard coverage, field Core Web Vitals or human usability results.
