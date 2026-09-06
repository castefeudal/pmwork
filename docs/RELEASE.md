# Production release procedure

Work is isolated on `build/pmwork-production-completion`; main is never edited directly. Changes are published as ordinary commits without force pushes.

## Verification

Run `npm ci`, `npm run verify`, `npm run test:e2e` and `npm run performance:check` for root and `PMWORK_BASE_PATH=github`. This Work container cannot create Chromium sockets. GitHub Actions provides the authorized Ubuntu Chromium execution environment for both complete browser suites; an authenticated cloud browser provides live production interaction. This is not a browser-test exemption.

Required evidence: exact source commit, unit/browser counts, exported page/content counts, route transfers, lab CLS/LCP, accessibility/reflow results and storage/PWA regression. `release-evidence.json` is the measured ledger, and CI artifacts retain screenshots and the JSON browser report.

## Merge and deployment

Create the PR after candidate checks pass. Merge only when every required check is green, following repository policy. Main Quality gate and Deploy GitHub Pages must pass. The Pages workflow checks the deployed `release.json` commit against `GITHUB_SHA` and requests all exported routes/assets. Browser verification checks fresh production and update behavior separately.

## Storage release

Schema v6 accepts older supported backups without dropping records. Exported `release.json` includes build timestamp and schema version. The service worker keeps cached documents with their release assets until a waiting worker activates; update remains explicit and preserves local workspace data.

## Evidence boundaries

No field Core Web Vitals, formal WCAG certification or human usability results are claimed. Markdown document rendering is a deliberate safe subset. Boards and timelines retain local scrolling for wide data; mobile has record/agenda views.
