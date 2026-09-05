# Release status

Start: `7cfd004e61748f559fa6b4891b64f70e9929eb5d`
Branch: `astra/pmwork-final-production`

44 unit/component tests passed during implementation. Static export generated 371 pages; export validation reported 370 HTML pages (its route-count convention differs). 80 Playwright scenarios passed on desktop and mobile Chromium, including axe checks, seven reflow sizes, offline navigation, template destination/undo, first run, URL history and RU/EN preferences. Local Chromium was version 149; CI uses the Playwright-pinned browser. No full WCAG conformance or field Core Web Vitals claim is made.

Production release requires a green root/GitHub quality gate, browser verification and Pages deployment. This document will be updated with final evidence before merge.


## Local evidence

- `npm ci`: passed.
- `npm run verify`: passed (lint, typecheck, content, i18n, links, 44 unit/component tests, build, export).
- Final rebuilt export: 80/80 E2E passed, no retries required.
- Compressed initial JS: landing 183,167 B; glossary/methods 289,544 B; tools 192,988 B; workspace 301,857 B.
- Local CLS checks passed on five representative routes. No field LCP/INP claim.
- Actual screenshots captured for workspace sections, public catalogs, term detail, method comparison, first run, mobile More, palette, drawer and dark theme. Desktop and mobile contact sheets were inspected.
- Service-worker install now batches eight resources and precaches 167 shell/shared resources. Individual term pages are cached on visit.

## Scope qualification

This branch delivers the implemented behaviors in PRODUCT_SPEC.md. It does not certify every item of the supplied extensive execution specification as complete. Glossary editorial enrichment still includes category-level guidance; some cross-resource links are empty. Catalog components retain shared rendering infrastructure. Timeline and comparison controls do not implement every requested enhancement, and existing domain mutations have not all moved into the new command module. See CONTENT_MODEL.md. These are implementation gaps, not platform permission limitations.
