# Quality gate

Run `npm ci`, `npm run verify`, `npm run performance:check` and `npm run test:e2e` against the production export. CI runs root and GitHub base paths. Do not remove assertions or suppress accessibility findings to obtain a pass.

Unit/component checks cover migration, corruption recovery, first run, URL parsing, glossary search/validation and linked commands. Browser checks cover desktop/mobile routes, data workflows, history, language, glossary, keyboard search, accessibility and reflow.

`performance:check` records compressed HTML and initial script sizes for landing/glossary/methods/tools/workspace. Browser performance tests attach local LCP and CLS samples and enforce CLS ≤ 0.1. Local unthrottled measurements do not certify field CWV or INP. LCP ≤ 2.5 s remains a reference target, not a verified field claim.

Visual evidence is stored in `test-results` and uploaded by CI. A screenshot file alone does not establish that it was visually reviewed.
