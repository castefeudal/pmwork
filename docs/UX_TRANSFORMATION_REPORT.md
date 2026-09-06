# Production completion evidence

The implementation preserves local-first storage, RU/EN, static export, root and GitHub base paths, offline operation, local fonts, import/export and recovery. No account, backend, analytics or AI service was added.

## Measured improvements

P0 baseline main `039c69badc72bb57f1617b871c3446202b5f6a30` failed browser CI with workspace CLS 0.123957 and ambiguous Add names. Separating loading/first-run trees and giving Work its own action name restored both CI configurations in run 34059840776 (192 tests per configuration).

The schema-v6 stage passed both configurations in run 34060731337. Subsequent mobile/visual/content candidates add broader regression tests; the final exact run and counts are recorded in release-evidence.json.

Initial JavaScript on the previous stable root export was 188832 / 307965 / 307965 / 202087 / 316122 gzip bytes for landing/glossary/methods/tools/workspace. Route isolation removes unrelated catalog clients. The final measurement and narrow route ceilings are in release-evidence.json and performance-budgets.json. Small tools/workspace growth pays for accessible result comparisons and durable record lifecycle; it is explicitly bounded.

Mobile Work previously placed the first record near 670px in the 390px screenshot. The revised header and filter disclosure place it near 450px. A regression requires the first mobile record above 600px at 360×800, with filter access, five touch-sized navigation destinations and focus restoration retained.

## Data semantics

Schema v1–v5 imports migrate to v6. Missing history remains unknown. The existing v3 storage discovery key is intentionally retained. Revision history, monetary inputs and milestone lifecycle survive schema validation and backup serialization. Starter undo preserves subsequent user edits by refusing stale restoration.

## Editorial review

Forty-seven template guidance paragraphs and use boundaries were authored for their specific artifact, alongside complete bilingual fictional examples. Thirty-nine playbook stabilization/prevention pairs describe their own failure mode. Exact long secondary duplicates fail the checker in both languages. The static content validator also checks primary descriptions, placeholders, source relations and language parity.

## Visual and accessibility review

CI captures representative public and application surfaces across desktop/mobile, RU/EN and light/dark. Reflow tests cover 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920px. Actual image-review selections and findings are recorded in LAYOUT_QA.md. Automated axe coverage and keyboard flow checks are engineering evidence, not certification.

## Automated usability proxy

Browser scenarios exercise project setup, work/risk creation, priority selection, template application, method-fit inputs, status preparation and mobile work filters. They are an automated usability proxy. The U1–U8 human thresholds remain targets; no SUS, SEQ, human success rate or human completion time has been invented.
