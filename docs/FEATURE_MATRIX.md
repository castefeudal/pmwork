# Feature matrix

Current implementation status. [TRANSFORMATION_STATUS.md](TRANSFORMATION_STATUS.md) lists the remaining acceptance gaps; [RELEASE.md](RELEASE.md) identifies validation evidence.

Status meanings: **implemented** = changes validated persisted state or provides a complete deterministic tool; **partial** = useful but lacks a full record lifecycle; **excluded** = deliberate v2 boundary.

| Capability | Status | Automated evidence | RU/EN | Notes |
| --- | --- | --- | :---: | --- |
| Landing / public navigation | Implemented | build + E2E spec | ✓ | Static routes and SEO metadata |
| Project setup with context fit | Implemented | method-fit unit tests | ✓ | Three-step dialog; ten anchored questions; context persists in schema v6; explicit recommendations |
| Multi-project portfolio | Implemented | portfolio unit test | ✓ | Progress, critical signals, forecast, completeness |
| What should I do now? | Implemented | insights unit tests | ✓ | Deterministic ranked signals with reasons and destinations |
| Guided lifecycle | Implemented | component/build | ✓ | Initiate → Plan → Deliver → Control → Close |
| Work list / filters | Implemented | component + E2E spec | ✓ | Create, owner, status, block, archive |
| Kanban / WIP | Implemented | component + E2E spec | ✓ | Drag/drop plus keyboard buttons; editable per-project limits |
| Timeline | Implemented | build | ✓ | Calculated from actual start/due dates |
| Milestones / iterations | Implemented | component + schema + build | ✓ | Complete create/edit/status/progress/capacity lifecycle |
| Dependencies | Implemented | component + CPM unit tests | ✓ | Create/edit/delete, known-item/self/cycle validation and handshake view |
| RAID | Implemented | schema + component + E2E spec | ✓ | Complete reusable editors for risks, assumptions, issues and decisions |
| Stakeholders | Implemented | schema + build | ✓ | Register and influence-interest matrix |
| Team / communications / vendors | Implemented | schema + component + build | ✓ | Persistent create/edit/delete lifecycle and localized statuses |
| Finance / forecast | Implemented | portfolio unit test | ✓ | Baseline, actual, committed, explicit forecast and variance |
| Charter | Implemented | schema + build | ✓ | Editable scope, outcome, owners, constraints, DoD and measures |
| Change / quality / closure | Implemented | schema + component + build | ✓ | Operational editors and persisted closure/benefits record |
| Documents / Markdown export | Implemented | component + build | ✓ | Create, open, edit, archive/delete and Markdown export |
| JSON backup / import | Implemented | migration + round-trip tests | ✓ | v1–v4 migration to v5; preserves discovery key, locale, owner IDs and saved views |
| Automatic snapshots | Implemented | storage logic | ✓ | One per day, latest five; dated destructive restore confirmation |
| Global command palette | Implemented | component test | ✓ | Ctrl/Cmd+K, views plus core records |
| Methods | 16 entries | content gate | ✓ | Structured, sourced; per-method prose depth varies |
| Templates | 47 entries | content + build | ✓ | Destination, depth, preview, apply, open and guarded undo; 17 completed examples |
| Playbooks | 39 entries | content gate | ✓ | Structured diagnosis/action system |
| Knowledge / glossary | 26 / 172 | content gate | ✓ | Glossary extension has an acknowledged editorial-quality gap |
| CPM / PERT / EVM | Implemented | unit tests | ✓ | Manual modes plus compatible project inputs; CPM requires dated FS/zero-lag dependencies |
| Monte Carlo / RICE / WSJF / Little's Law | Implemented | unit tests | ✓ | Monte Carlo uses runtime random sampling |
| Deadline / EMV / capacity / matrix / ownership / change / calibration | Implemented with limits | domain + browser tests | ✓ | Seven local tools; history thresholds and assumptions explicit; see acceptance ledger |
| PWA / offline shell | Implemented | unit + build | ✓ | Locale-aware manifests, start routes, offline fallback and production icons |
| Theme | Implemented | component/build | n/a | Light/dark with safe system initial value |
| Team collaboration / auth / sync | Excluded | n/a | n/a | Deliberate local-first v2 boundary |
| AI / workflow automation | Excluded | n/a | n/a | Explicit product constraint |
