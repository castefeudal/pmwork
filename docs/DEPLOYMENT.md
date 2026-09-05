# Deployment

## GitHub Pages

Push to `main`. `.github/workflows/pages.yml` installs the locked dependencies, runs the full quality gate with `PMWORK_BASE_PATH=github`, builds the `/pmwork` static export, runs Chromium E2E, uploads `out/`, and deploys with the official Pages action. Repository Pages must be configured to use GitHub Actions.

Expected URL: `https://castefeudal.github.io/pmwork/`.

## Other static hosts

Run `npm ci && npm run build` and publish `out/`. Outside GitHub Actions no repository base path is added. The app has no backend environment variables.

## Smoke test

Verify root, RU/EN landing pages, workspace reload, board change, backup round-trip, nested-route refresh, manifest/icon, and asset responses without 404s.

The deploy then reads live `release.json` and requires its commit to equal the workflow SHA. It checks HTTP responses for exported routes, scripts, styles, fonts and PWA assets. Publication is not considered successful merely because upload succeeded.

Offline installation precaches generated HTML, Next static navigation payloads, scripts, styles and fonts. A changed export creates a new cache revision. Updated workers activate after older controlled tabs close, avoiding mixed release assets.
