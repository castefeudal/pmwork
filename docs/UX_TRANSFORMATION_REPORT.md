# Measurable UX transformation report

Branch: `feat/measurable-ux-transformation`
Baseline: `25d59e5de5325885a87d23e0d3e1654347328976`

## Baseline

The baseline is recorded in `UX_BASELINE.md`. Existing automated evidence reported 63 unit/component tests, 192 browser tests and 370 exported HTML pages. Human usability was not measured.

## Implemented changes

### First run and setup

- First run now leads with the value of starting a real project and gives explicit time guidance for the real-project and demo paths.
- Project setup keeps the deterministic fit model but initially asks four high-information context questions; six additional dimensions are progressive disclosure.
- The recommendation step labels the score as context compatibility, explains why, gives planning/control rules and exactly three initial actions.
- Experience/guidance and interface density remain independent settings.

### Today and health

- Today isolates one highest-priority signal above the remaining decision/action/check groups.
- Generic repeated `Open record` buttons were replaced with action-oriented labels where the signal type is known.
- Project health now separates derived project state from data confidence and marks unknown dimensions rather than treating missing data as healthy evidence.

### Workspace information architecture

- Board remains the same work dataset but is presented as a Work mode instead of a separate primary navigation concept.
- Primary navigation is grouped around Act / Manage / Team & knowledge / System and changes with guidance level.
- Mobile primary navigation is Today / Work / Plan / Control / More.
- Operational record creation moved from Settings into a structured global Add dialog.
- Settings now focuses on project context, local identity, guidance, density, local data, WIP and recovery snapshots.

### Catalogs and discovery

- Templates now use a task-first hub, category counts, search, common starting points and an initial maximum of 12 cards before explicit expansion.
- Every existing template receives a statically generated RU/EN detail route with output, use case, time guide, inputs, guidance, mistake, example and apply-to-project action.
- Methods now use a context-first hub and statically generated RU/EN detail routes with fit, limitations, minimum implementation, operating model, mistakes, tailoring, combinations and sources.
- Public search links directly to method/template detail pages and expands deterministic problem-intent aliases for deadline, scope change, overload, ownership, cost, vendor risk, executive status, blockers and stalled decisions.
- Sitemap includes method and template detail routes.

### Visual/mobile layer

- Added a small additive CSS layer for first-run hierarchy, global Add, top priority, data confidence, detail-page layout and mobile safe-area behavior.
- Existing PMWORK visual identity and previous modal/document repairs are retained.

## Before → after

| Area | Baseline | Transformation |
| --- | --- | --- |
| First run | configuration choice first | value and expected time first |
| Project context | all ten dimensions visible | four core + six optional |
| Today | repeated generic record actions | one top priority + typed actions |
| Health | state and missing data mixed | state + explicit data confidence |
| Board | separate primary destination | Work display mode |
| Settings | settings + record creation | settings only; creation in global Add |
| Mobile primary IA | Overview / Work / Planning / Guide / More | Today / Work / Plan / Control / More |
| Templates | full large-card result wall | task categories + ≤12 initial cards + detail routes |
| Methods | expandable catalog cards | context-first hub + practical detail routes |
| Search | entity-oriented | deterministic problem-intent ranking + direct detail links |

## Automated metrics

Final counts and performance numbers must be taken from the successful CI run for the PR head. Do not copy historical counts forward as if they validated this branch.

The new regression contract explicitly covers value-first first run, global Add, Board as a Work mode, action-oriented mobile IA, Settings cleanup, progressive setup and typed Today actions.

## Performance

Baseline initial JavaScript gzip:

- landing: 188,832 B
- glossary: 307,965 B
- methods: 307,965 B
- tools: 202,087 B
- workspace: 316,122 B

Final values must be recorded from `performance:check` after the PR head passes CI. The requested ≥10% reductions are targets, not claims. This branch prioritizes cognitive/DOM reduction in Templates; it does not claim a bundle reduction until measured.

## Accessibility

WCAG 2.2 AA remains the target, not a certification. Existing focus, keyboard, reflow and axe assertions are retained and new UI uses semantic buttons/dialogs and text labels in addition to state color. Final accessibility status depends on the successful browser QA run.

## Content completeness

Improved:

- all template records now have dedicated pages using their existing individually stored purpose/when/guidance/anti-pattern fields;
- all methods now have dedicated practical pages using existing method-specific content;
- problem-intent aliases cover more natural user phrasing.

Not fully complete:

- not every method has a newly authored unique narrative example beyond existing structured content;
- generic editorial blocks in some playbooks and glossary entries remain;
- glossary-wide individual tool/template/source relationships remain incomplete.

## Screens reviewed

Final screenshot review must use the artifacts generated by the successful PR CI head. Historical screenshots are baseline evidence only.

## Remaining limitations / acceptance gaps

The following requested items are intentionally not claimed as complete in this release:

1. Guide still displays the legacy percentage-based management-completeness indicator. Its copy distinguishes completeness from success probability, but the requested `N of N contours configured` presentation remains open.
2. Milestone owner/confidence/actual-date lifecycle requires a storage-schema migration and is not introduced in this P0 UX release.
3. Persistent monetary-risk fields and residual monetary exposure remain a schema gap.
4. Original-estimate history vs latest estimate vs actual remains a schema gap.
5. Starter packs still do not create a complete coherent record bundle.
6. Tool scenario persistence is not completed for every decision tool.
7. Full individually authored editorial completion for all methods, templates, playbooks and glossary records remains a separate content pass.
8. Human usability targets have not been measured with actual participants.

These gaps should remain visible until their implementation and evidence exist; they must not be represented as platform limitations or completed features.

## Human usability results

`NOT MEASURED`.

Automated browser completion is not human task success. The repeatable U1–U8 protocol is defined in `UX_BASELINE.md` for future participant testing.
