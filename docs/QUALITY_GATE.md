# Quality gate

Required local sequence:

```bash
npm ci
npm run verify
npm run test:e2e
npm run test:cross-browser
npm run performance:check
npm audit --audit-level=moderate
```

`verify` runs lint, strict typecheck, content validation, copy-quality validation, RU/EN parity and language purity, source-link validation, unit/component tests, production static export, PWA generation, and exported-reference validation.

The complete Playwright regression suite remains Chromium-based on desktop and Pixel 7 so the main gate stays bounded. Coverage includes RU/EN CRUD, project switching, URL state, backup validation/replacement, corruption recovery, keyboard palette, intent search, dialogs/focus, Kanban alternatives, starter-linked behavior, MARKOVMADE apply, deterministic tools, offline internal navigation, PWA fonts/assets, root/Pages path behavior, axe, and eight-width reflow. Representative screenshots are emitted to `test-results`; screenshot existence alone is not visual approval.

A separate bounded smoke suite runs Firefox, desktop WebKit, and mobile WebKit. It covers public/workspace hydration, local-first demo persistence across reload, and locale switching. This is cross-browser regression evidence, not a substitute for physical-device Safari/Firefox review.

Performance gates enforce route-specific compressed transfer budgets derived from the previous production baseline with headroom for intentional change:

- landing JS ≤ 240 kB gzip;
- glossary/methods JS ≤ 430 kB gzip;
- tools JS ≤ 300 kB gzip;
- workspace JS ≤ 400 kB gzip;
- route HTML budgets remain bounded separately.

Browser performance tests continue to enforce local unthrottled LCP ≤2.5 s and CLS ≤0.05 on representative routes. These measurements are lab evidence, not field CWV/INP telemetry. Privacy is intentionally preferred over adding analytics for vanity metrics.

GitHub CI repeats `verify`, the complete Chromium suite, and performance checks for `root` and `github` base-path builds. Firefox/WebKit smoke runs once on the root build to avoid duplicating browser installation and runtime across both path variants. The Pages job repeats the GitHub build, deploys `out`, then checks the published release commit and critical assets. A local green run does not imply CI/deploy green until those workflows execute for the exact commit.
