# PMWORK — independent product audit and hardening record

Audit date: 2026-09-05. Baseline commit: `d124fb5`. Target: the complete master prompt supplied with the project.

## Executive verdict

The baseline was a credible technical prototype, not a finished PM operating system. It built cleanly, had a coherent visual language, deterministic calculators, three demos, local storage, RU/EN routes and useful foundational content. The principal problem was not polish. It was a mismatch between claimed breadth and operational depth: several domain entities existed only as unused schemas, several workspace sections were read-only, the timeline was illustrative rather than date-driven, CPM used a fixed example, search only filtered work items, mobile navigation hid later modules, and 130+ glossary entries shared placeholder wording.

Baseline score: **6.2/10**. Confidence: high; based on source inspection, schema-to-UI traceability, automated checks and a requirements comparison.

| Dimension | Baseline | Evidence | Hardening response |
| --- | ---: | --- | --- |
| Product coherence | 6.5 | Strong concept; weak Understand → Decide → Do → Control loop | Added control tower, ranked actions, lifecycle guide and portfolio view |
| Core work management | 7.0 | Create/move work and risk; little editing or lifecycle control | Added filters, ownership editing, blocking, archive, actual dates, WIP settings |
| Planning | 4.5 | Timeline bars were based on list position | Timeline now derives from project and item dates; iterations and dependencies persisted |
| RAID / governance | 5.5 | Risk creation worked; assumptions and change control were display-level or absent | Persisted and exposed assumptions, issues, decisions, changes and quality gates |
| People / resources | 4.0 | Stakeholder demo only; team/vendor schemas unused | Added team, communication and vendor operating views |
| Portfolio use | 2.5 | Project switcher existed; no multi-project control surface | Added portfolio comparison with progress, critical signals, forecast and control completeness |
| Data safety | 6.5 | Validated JSON import/export; schema fixed at v1 | Added v1→v2 migration, versioned export envelope and rotating daily snapshots |
| Decision support | 7.0 | Good standalone calculators; CPM not editable | Added observable control scoring and editable network-model CPM |
| Content quality | 6.0 | Good seeds, but repetitive method/template structures and generic glossary extension | Content claims are now explicitly treated as a remaining editorial quality gate |
| Accessibility | 7.0 | Semantic base, keyboard board moves, visible focus | Mobile nav no longer hides modules; command palette and forms use dialog/labels |
| Test credibility | 6.5 | 13 tests; broad feature matrix overstated coverage | Added migration, control-engine, portfolio, flow and command-palette tests |
| Deployment | 5.0 | Private Site live; GitHub remote still contained only README | GitHub connector access verified; source, CI and Pages publication are required in this run |

## P0 defects found

1. `Workspace` persisted only nine entity collections while the domain file declared many more. The UI therefore suggested functionality that could not survive reload/export.
2. `schemaVersion` had no migration path. A future schema change would either reject or silently strand local user data.
3. The overview listed alerts but did not rank them, explain the required action, or connect them to the responsible workspace view.
4. No multi-project cockpit existed despite the product promise.
5. The planning timeline was visual fiction: position and width came from item index and effort, not dates.
6. The critical-path tool could not accept project data or even editable data.
7. Change control, quality, vendor management, assumptions, iterations and team capacity were not operational records.
8. Mobile CSS hid every navigation item after the fifth, making finance, control, documents and settings unreachable.
9. The command shortcut focused a work-only filter rather than providing cross-product navigation and search.
10. The feature matrix used “implemented” for several read-only or illustrative surfaces. This was a documentation integrity defect.

## Hardening implemented

- Workspace data model v2 with persisted objectives, assumptions, dependencies, iterations, team, allocations, changes, vendors, meetings, status reports, lessons, communications, quality gates, activity trail and project settings.
- Safe migration of v1 browser data and imported backups to v2.
- Versioned export envelope and five rotating local snapshots.
- Portfolio control tower for all projects.
- Deterministic project-control engine that ranks blockers, overdue issues, late decisions, high-exposure risks, at-risk milestones, overdue assumptions and failed quality gates.
- Observable control-completeness score based on 14 explicit checks.
- Guided lifecycle across initiate, plan, deliver, control and close.
- Dense work list with search, status filtering, inline ownership, block/unblock and non-destructive archive.
- Five-column board with per-project WIP limits and keyboard-accessible move buttons.
- Date-derived timeline, iteration register, milestone view and dependency handshake view.
- RAID tabs for risks, issues, assumptions and decisions.
- People workspace covering stakeholders, team, communication plan and vendors.
- Finance forecast separated from actual and committed cost.
- Editable charter and success measures, status report, change register, quality view and closure checklist.
- Cross-workspace command palette (`Ctrl/Cmd+K`).
- Mobile horizontal app dock and mobile project switcher.
- Editable CPM network input with cycle/unknown-dependency validation.

## Remaining limitations — stated without marketing language

- PMWORK remains device-local by design. It has no shared team workspace, authentication or cross-device synchronization. Those require a deliberate product/architecture decision, not a hidden partial backend.
- Some secondary registers support creation and deletion but not a dedicated full-record editor. Core work ownership/status and charter fields are editable.
- Flow history begins when the app records completion timestamps; imported legacy data cannot produce reliable historical cycle-time charts without historical events.
- The glossary extension still requires a line-by-line editorial rewrite before an objective claim of “complete professional glossary” is warranted.
- Automated browser E2E must pass in GitHub Actions before the deployment can be called fully verified. A green local component suite is not a substitute.

## Objective release gate

“10/10” is not a testable label. The release is accepted only if all of the following are true:

1. Every advertised action either changes validated state or is clearly described as explanatory content.
2. Data survives reload, v1 migration, export and import.
3. No module is unreachable at 360 px viewport width.
4. All deterministic recommendations expose their reason and destination action.
5. `npm run verify`, dependency audit, Pages base-path smoke and browser E2E are green.
6. GitHub `main` contains the exact verified source and its Pages workflow reaches success.
7. Public documentation distinguishes implemented, partially implemented and intentionally excluded capabilities.

