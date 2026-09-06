# Production completion status

Current implementation uses schema v6. The superseded v5 acceptance ledger is preserved under `archive/pre-schema-v6/`; it is not the current product contract.

## Product and data

- Milestones retain `date` as current forecast, with optional baseline, actual completion, owner reference/label, confidence and variance explanation. Old dates do not become invented baselines.
- Work retains current estimate and actual effort, with immutable original estimate when observed at creation and appended revision history. Migrated saved estimates are marked imported; calibration excludes records without an original estimate.
- Monetary risk is optional and separate from ordinal probability × impact. Explicit percentage × monetary impact produces expected exposure; residual exposure requires its own inputs.
- Five bilingual starter scenarios create linked objectives, work, milestone, risks and review cadence in one workspace update. Undo restores the complete preceding workspace and stops if subsequent changes would be lost.
- Guide reports configured outcome/work/schedule/risk/people/control contours and directs missing controls to their form or charter. Expert guidance remains compact; density is independent.
- Tool scenarios are portable project documents containing inputs, assumptions and results. Decision and change tools retain typed operational records.

## Experience and visual system

- One primary global Add; distinct secondary Add work item on desktop. Mobile uses the global action.
- Mobile header: home, project, search, options, Add. Language/theme remain in options; bottom navigation has five destinations and safe-area spacing.
- Work shows search, quick views and records. Status, owner, sort, grouping, columns and saved views share one disclosure.
- Fonts and tokens precede one consolidated component stylesheet. Obsolete cockpit styles and duplicate declarations were removed. No new final override stylesheet was added.
- Landing demonstrates actual demo records. Operational headings, primary buttons, Guide geometry and section spacing were refined separately from feature work.

## Editorial and discovery

All 47 templates have specific bilingual guidance, usage boundaries and worked examples. All 39 playbooks have distinct next-cycle, stabilization and prevention actions. Long secondary duplicate prose is a hard RU/EN gate. Catalogs disclose results progressively while search covers the full collection.

Method and template detail metadata, public canonicals/alternates, glossary structured data, workspace noindex, sitemap exclusion and base-aware robots paths are covered by export checks.

## Verification authority

`release-evidence.json` records measured source commits and workflow results. A candidate is not deployed merely because local verification passes. Merge requires green root/GitHub Chromium jobs; Pages and live SHA verification follow merge.

Human SUS/SEQ, participant completion times and field Core Web Vitals remain unmeasured. No formal accessibility certification is claimed. The U1–U8 participant protocol remains in UX_BASELINE.md.
