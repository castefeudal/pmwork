# Release status

Start: `7cfd004e61748f559fa6b4891b64f70e9929eb5d`
Branch: `astra/pmwork-final-production`

44 unit/component tests passed during implementation. Static export generated 371 pages; export validation reported 370 HTML pages (its route-count convention differs). 132 Playwright tests passed on desktop and mobile Chromium, including axe checks, seven reflow sizes, offline navigation, template destination/undo, first run, URL history and RU/EN preferences. Local Chromium was version 149; CI uses the Playwright-pinned browser. No full WCAG conformance or field Core Web Vitals claim is made.

Production release requires a green root/GitHub quality gate, browser verification and Pages deployment. Hosted evidence is linked from PR #3 and the deployment workflow; merge requires their successful checks.

Release tracking: [PR #3](https://github.com/castefeudal/pmwork/pull/3). The first hosted CI run passed 79/80 browser scenarios on both base paths and caught an inaccessible mobile home link. The repair exposes a home link in the mobile workspace header; the regression now checks visibility and the actual return navigation, preserving the original prefix and font assertions. Final checks are available in the PR's Checks tab. Transfer-size evidence is generated after Playwright so its output-directory cleanup cannot delete the performance report.


## Local evidence

- `npm ci`: passed.
- `npm run verify`: passed (lint, typecheck, content, i18n, links, 44 unit/component tests, build, export).
- Final rebuilt export: 132/132 E2E passed, no retries required (3.3 minutes). Screenshot batches were separated into individual surface tests to avoid combining several long captures under one test deadline.
- Compressed initial JS: landing 183,167 B; glossary/methods 289,544 B; tools 192,988 B; workspace 301,969 B.
- Local CLS checks passed on five representative routes. No field LCP/INP claim.
- Actual screenshots captured for workspace sections, public catalogs, term detail, method comparison, first run, mobile More, palette, drawer and dark theme. Desktop and mobile contact sheets were inspected.
- Service-worker install batches eight shell/shared resources at a time. Individual term pages are cached on visit.

## Scope qualification

This branch delivers the implemented behaviors in PRODUCT_SPEC.md. It does not certify every item of the supplied extensive execution specification as complete. Glossary editorial enrichment still includes category-level guidance; some cross-resource links are empty. Catalog components retain shared rendering infrastructure. Timeline and comparison controls do not implement every requested enhancement, and existing domain mutations have not all moved into the new command module. See CONTENT_MODEL.md. These are implementation gaps, not platform permission limitations.
