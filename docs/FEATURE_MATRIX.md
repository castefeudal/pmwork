# Feature matrix

Status meanings: **implemented** = changes validated persisted state or provides a complete deterministic tool; **partial** = useful but lacks a full record lifecycle; **excluded** = deliberate v2 boundary.

| Capability | Status | Automated evidence | RU/EN | Notes |
| --- | --- | --- | :---: | --- |
| Landing / public navigation | Implemented | build + E2E spec | ✓ | Static routes and SEO metadata |
| Project setup with context fit | Implemented | method-fit unit tests | ✓ | Creates approach, governance and settings; wizard remains single-dialog |
| Multi-project portfolio | Implemented | portfolio unit test | ✓ | Progress, critical signals, forecast, completeness |
| What should I do now? | Implemented | insights unit tests | ✓ | Deterministic ranked signals with reasons and destinations |
| Guided lifecycle | Implemented | component/build | ✓ | Initiate → Plan → Deliver → Control → Close |
| Work list / filters | Implemented | component + E2E spec | ✓ | Create, owner, status, block, archive |
| Kanban / WIP | Implemented | component + E2E spec | ✓ | Drag/drop plus keyboard buttons; editable per-project limits |
| Timeline | Implemented | build | ✓ | Calculated from actual start/due dates |
| Milestones / iterations | Implemented | schema + build | ✓ | Create and list; dedicated full editor is partial |
| Dependencies | Partial | CPM unit tests | ✓ | Persisted list and handshake view; UI creation/editor pending |
| RAID | Implemented | schema + E2E spec | ✓ | Risks, assumptions, issues, decisions; secondary record editing partial |
| Stakeholders | Implemented | schema + build | ✓ | Register and influence-interest matrix |
| Team / communications / vendors | Partial | schema + build | ✓ | Persistent creation/listing; secondary full editors pending |
| Finance / forecast | Implemented | portfolio unit test | ✓ | Baseline, actual, committed, explicit forecast and variance |
| Charter | Implemented | schema + build | ✓ | Editable scope, outcome, owners, constraints, DoD and measures |
| Change / quality / closure | Partial | schema + build | ✓ | Registers and control view; closure checklist is not yet persisted |
| Documents / Markdown export | Implemented | build | ✓ | Persistent create and individual Markdown export |
| JSON backup / import | Implemented | migration + round-trip tests | ✓ | v1 migration, v2 envelope and validation |
| Automatic snapshots | Implemented | storage logic | ✓ | One per day, latest five; restore confirmation remains pending |
| Global command palette | Implemented | component test | ✓ | Ctrl/Cmd+K, views plus core records |
| Methods | 16 entries | content gate | ✓ | Structured, sourced; per-method prose depth varies |
| Templates | 47 entries | content gate | ✓ | Downloadable; direct instantiation into workspace pending |
| Playbooks | 39 entries | content gate | ✓ | Structured diagnosis/action system |
| Knowledge / glossary | 26 / 172 | content gate | ✓ | Glossary extension has an acknowledged editorial-quality gap |
| CPM / PERT / EVM | Implemented | unit tests | ✓ | CPM accepts editable networks |
| Monte Carlo / RICE / WSJF / Little's Law | Implemented | unit tests | ✓ | Monte Carlo uses runtime random sampling |
| PWA / offline shell | Implemented | build | ✓ | Static service worker and install manifest |
| Theme | Implemented | component/build | n/a | Light/dark with safe system initial value |
| Team collaboration / auth / sync | Excluded | n/a | n/a | Deliberate local-first v2 boundary |
| AI / workflow automation | Excluded | n/a | n/a | Explicit product constraint |
