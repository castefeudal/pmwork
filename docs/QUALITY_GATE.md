# Quality gate

Required local sequence:

```bash
npm ci
npm run verify
npm run test:e2e
npm run performance:check
npm audit --audit-level=moderate
```

`verify` runs lint, strict typecheck, content validation, copy-quality validation, RU/EN parity and language purity, source-link validation, unit/component tests, production static export, PWA generation, and exported-reference validation.

Playwright runs desktop and Pixel 7 projects. Coverage includes RU/EN CRUD, project switching, URL state, backup validation/replacement, corruption recovery, keyboard palette, intent search, dialogs/focus, Kanban alternatives, starter-linked behavior, MARKOVMADE apply, deterministic tools, offline internal navigation, PWA fonts/assets, root/Pages path behavior, axe, and eight-width reflow. Representative screenshots are emitted to `test-results`; screenshot existence alone is not visual approval.

Performance gates enforce compressed route budgets, local unthrottled LCP ≤2.5 s, and CLS ≤0.05 on landing, glossary, methods, tools, and workspace. These measurements are lab evidence, not field CWV/INP telemetry. Privacy is intentionally preferred over adding analytics for vanity metrics.

GitHub CI repeats the entire gate for `root` and `github` base-path builds. The Pages job repeats the GitHub build, deploys `out`, then checks the published release commit and critical assets. A local green run does not imply CI/deploy green until those workflows execute for the exact commit.
