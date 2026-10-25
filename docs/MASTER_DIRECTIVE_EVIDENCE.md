# Management OS evidence ledger — 2026-10-25

This ledger tracks the master directive without equating implementation with measured quality. Baseline: `a354e7f` (PR #35). Recovery work continues PR #36; its existing timeline, shell and landing changes are retained.

## Reproducible evaluation

Use the same fictional workspace, task brief, device, language, theme, browser version and assistance rules before and after. Record the tested commit, raw observations, calculation, artifact path, evaluator and limitations for every result. Automated test pass rates are not design or usability scores.

| Category | Weight | Measurement and raw evidence required | Current score |
| --- | ---: | --- | --- |
| Design | 15% | At least 3 independent reviewers; anchored 0–4 ratings for hierarchy, typography, consistency, information density and state clarity; publish each rating and screenshot pair. Score = mean / 4 × 100. | Not measured |
| UX | 15% | Practicing managers execute the identical tasks in USABILITY_PROTOCOL.md; retain unassisted successes, duration, errors and help. Score = unassisted successes / attempts × 100; report timing/error distributions separately. | Not measured |
| Functionality | 20% | Freeze required scenario inventory before testing; each scenario has an executable test or witnessed task, expected outcome and persistence/recovery assertion. Score = passed required scenarios / required scenarios × 100. | Not measured on final commit |
| Responsiveness | 10% | Frozen route/state matrix × 10 directive widths × RU/EN × themes; record overflow, reachable controls and readable dates. Score = passing cells / all cells × 100. | Not measured on final commit |
| Performance | 10% | Retain Lighthouse JSON, browser lab samples, bundle budgets and hardware/throttling configuration. Use median Lighthouse Performance across the frozen sample; any failed bundle/LCP/CLS budget blocks acceptance independently. Field INP remains unknown without field data. | Not measured on final commit |
| Accessibility | 10% | Frozen WCAG 2.2 AA applicable-criterion inventory; automated axe plus keyboard, screen reader, contrast, text scaling and zoom evidence. Score = demonstrated passing applicable criteria / applicable criteria × 100; untested criteria are unproven. | Manual evidence pending |
| Reliability/security | 10% | Frozen backup/migration/recovery/offline/fault scenarios; passing fraction × 100. Audit high/critical findings and data loss block acceptance regardless of score. | Not measured on final commit |
| Uniqueness | 5% | At least 3 independent reviewers, identical competitor briefs; anchored 0–4 ratings for explainable signals, connected contexts, local autonomy and decision-to-action continuity. Score = mean / 4 × 100. | Not measured |
| Engineering | 5% | Frozen required lint/type/content/parity/export/browser/security/CSS/budget checks. Passing fraction × 100; every required check must pass independently. | Not measured on final commit |

Weighted score = Σ(category score × weight) / 100. Do not calculate a total with missing categories, substitute zero for unknown, or redistribute missing weights. Acceptance requires every category ≥90 and the weighted score ≥90, plus every blocking gate. Independent automated agents are not substitutes for practicing-manager sessions or independent human design reviewers.

## Recovery and planning changes

- Security: Next.js 16.4.3, Zod 4.6.7, Vitest 5.0.3, aligned eslint-config-next 16.4.3; lockfile updated. Initial install audit: 0 vulnerabilities. Clean-install/final-commit results must be recorded separately.
- Timeline: bounded calendar tick generation for long plans; Monday-first UTC weeks and leap days; exact dated row labels; milestone baseline/forecast/actual source dates included in the chart range and mobile agenda. Missing actual dates remain unknown.
- Short plans use a fourteen-day minimum horizon and automatically choose a readable axis resolution. No work or milestone dates are changed.
- Chart region supports keyboard focus/scrolling; mobile expansion exposes its state. Milestone symbols have text labels and source edit actions.
- CSS cascade ratchet is required by `verify`; Firefox, WebKit and mobile WebKit smoke now run for both root and GitHub-base exports. Existing security, visual and bundle gates remain enforced.

## Comparison references

Reviewed official documentation on 2026-10-25; these are interaction references, not hands-on comparative usability evidence:

- [Linear timeline](https://linear.app/docs/timeline): scale selection and meaningful milestone/dependency properties.
- [Notion database views](https://www.notion.com/help/views-filters-and-sorts): views reference the same underlying records.
- [Asana timeline](https://help.asana.com/s/article/plan-and-execute-projects-with-timeline): dates and dependencies are planning inputs.
- [Monday baseline](https://support.monday.com/hc/en-us/articles/360020978159-The-Gantt-Baseline): distinguish original schedule from later progression.
- [ClickUp timeline](https://help.clickup.com/hc/en-us/articles/6310399909143-Create-and-share-a-Timeline-view): explicit zoom and navigation controls.
- [Bloomberg Launchpad](https://www.bloomberg.com/professional/insights/technology/bloomberg-terminal-essentials-ib-worksheets-launchpad/): configurable monitoring workspace.
- [Airtable timeline](https://support.airtable.com/articles/1069623552-timeline-view-overview): calendar precision, scale and explicit date-field semantics.

## Outstanding acceptance evidence

Do not call the complete directive finished from this increment. Manager sessions, independent design/uniqueness reviews, manual assistive-technology/physical-device checks, complete before/after matrix and field INP have not been supplied. No 90/100 claim is made. Final CI, visual review, laboratory results and live release identity are recorded after execution, not inferred from this document.

## Visual reference review

Candidate source: [workflow 40135643098](https://github.com/castefeudal/pmwork/actions/runs/40135643098), implementation `5214db8`. All 144 Linux references were generated; 16 fresh-context repeat tests passed with zero failed, skipped or flaky tests. 132 files changed from the previous release, primarily through shared navigation and typography.

Agent visual inspection covered desktop EN/light landing and planning, mobile RU/dark landing and planning, desktop RU/light Today and Settings, mobile EN/dark Today and Operations, desktop EN/dark Work, mobile RU/light Work, desktop EN/light Program and desktop RU/dark Delivery. Checked hierarchy, date labels, theme contrast presentation, navigation visibility and primary actions. This is bounded agent visual inspection, not independent human scoring. Unchanged onboarding/desktop tools references were retained. The complete functional and pixel suite must pass again against accepted references before merge.

## Measured startup work

The gzip baseline exposed a real mobile onboarding bottleneck: loading the complete workspace runtime before presenting the first choice. Work views, Settings, documents and the command palette now load on demand; workspace-only CSS loads on its route. The first change reduced the local initial workspace JavaScript from 319,916 to 265,503 gzip bytes, within all unchanged route budgets.

First entry now uses a lightweight, read-only presence check. Any current/legacy mirror, snapshot, IndexedDB record, denied/blocked storage or unexpected error delegates to the complete validated runtime and recovery flow. An absent IndexedDB creation is aborted, so probing never creates a malformed database. Empty visitors see the existing bilingual onboarding independently of business schemas and editors. A project/demo/import intent is applied only after the full storage reader confirms absence; existing data takes precedence. Authored onboarding and loading copy is shared, not duplicated. Dedicated browser checks cover untouched empty storage, explicit demo persistence/reload and IndexedDB-only records without a local mirror; these run in every browser and both base paths.

The pinned Lighthouse 13.5.0 gate records three cold-site samples for each locale, landing/onboarding surface and mobile/desktop profile using explicit gzip text delivery. Acceptance uses scenario medians: Performance/Accessibility at least 90, LCP at most 2500 ms and CLS at most 0.1. Raw uncompressed and pre-optimization reports remain separate from later measurements. Field INP is still unmeasured. Production evidence preserves both browser and Lighthouse matrices instead of overwriting the GitHub-base results with root results.

The polish cascade is separated into shared tokens, entry, public and workspace files. Workspace styles load with the validated runtime, rather than with an empty visitor's welcome screen. Rules and specificity are retained; the demo-control border/hover corrections move with their component. Decorative loader orbits/glow are removed and text entrances use short transform-only motion. PWA registration waits for page load and idle work; complete offline-cache behavior remains required by the browser gate. The 192px installation image stays in the PWA manifest, while page favicon metadata uses the existing small brand favicon. A font-preload experiment is rejected because the recorded mobile LCP worsened; those diagnostic reports are not acceptance evidence.

## Unified typography review

[Visual candidate workflow 40143052322](https://github.com/castefeudal/pmwork/actions/runs/40143052322) generated 144 Linux reference images for the single Manrope family and confirmed them with 16 repeated fresh-context tests, without failures, skips or flakes. Bounded agent inspection covered EN/light desktop landing and planning, RU/dark mobile landing, RU/light mobile onboarding, RU/light desktop Today and Settings, EN/dark mobile Today and Operations, EN/dark desktop Work, RU/light mobile Work, EN/light desktop Program and RU/dark desktop Delivery. The family retains the display identity while removing the second Latin/Cyrillic font pair. The inspection checked readable labels, wrapping, date precision, semantic state emphasis and reachable actions. This does not provide independent human design scores.

The first screen is real static onboarding HTML with an explicit checking status and disabled actions until absence of saved data is confirmed. Known or unreadable storage opens the validated runtime automatically. Server-render and controlled-readiness tests enforce that no storage is accessed on the server and that creation remains disabled during uncertainty. Connectivity notices now follow locale changes while preserving the existing offline/save semantics.

### Public navigation transfer budget

Cold Lighthouse traces on 2b36c7a showed automatic route prefetch loading the other locale, About, workspace RSC, entry styles and scripts while the landing page was still settling. Public header, footer and landing links now use `prefetch={false}` to reserve initial bandwidth for the requested page. Client navigation remains available on activation. The 2500 ms LCP gate is unchanged.

### Single-family resource discovery

The earlier four-file Inter/Manrope preload experiment was rejected. After consolidating to Manrope, a separate three-sample local diagnostic preloaded only the required two RU subsets: LCP 2747, 2265 and 2264 ms, CLS 0. The exported HTML now hints one EN or two RU font files at the start of the head, with the correct deployment base. This optimization is included before PWA hashing; the strict CI budgets still determine acceptance.

### Operational cascade loading

The single-family font hints alone did not meet the CI landing LCP budget (about 2.5–2.7 s); this is not accepted performance evidence. A source/import and exported-markup inventory identified 444 rules with no consumers in public pages or onboarding. Their 44 KB of CSS now loads with the operational runtime. Existing cascade layers, declarations and relative order are retained; shared/mixed selectors remain global. Public navigation, search, dialogs and onboarding consumers are included in the inventory. The CSS audit includes the deferred file; visual and browser gates must validate the changed loading boundary without replacing reference images.

### Above-fold brand discovery

The post-split raw traces expose a remaining late high-priority request: the shared 44 px brand image was lazily discovered after layout (about 96–113 ms observed), while fonts and CSS began around 16–26 ms. It is visible in the initial header/onboarding. Brand now explicitly uses eager/high-priority loading so the parser can request the existing image with other initial resources. Asset pixels, dimensions, copy and the Lighthouse model/budgets are unchanged.

### Motion bounds

The language chooser now enters within 240 ms without a whole-screen fade or delayed 760 ms entrances. Decorative entry/privacy orbit, floating-device and closing-glow loops are static; meaningful control/panel feedback stays short. The functional indeterminate loading progress remains animated and reduced-motion rules remain active. Pixel references are not changed for this motion-only adjustment.

### Combined RU font subset experiment — rejected

A pinned Manrope 4.504 Latin+Cyrillic subset reduced two requests to one. Although 2,261 outline/advance comparisons and vertical metrics matched, full browser images exposed changed text shaping across subset boundaries. Contour equality does not prove identical shaping. The combined asset and builder were removed; the accepted separate Latin/Cyrillic Manrope faces are retained. HTTP/2 transport measurements do not depend on keeping this experiment.

### Production transport fidelity

On 2026-10-25 an authenticated TLS connection to castefeudal.github.io negotiated ALPN `h2` and returned the public release successfully. The earlier lab server/reports used HTTP/1.1. A same-export HTTP/2 diagnostic negotiated `h2` and exposed the impact of transport scheduling; it is not accepted quality evidence. The Lighthouse fixture now serves the exact export via HTTPS HTTP/2 + gzip, and each raw report must confirm `h2`. An ephemeral OpenSSL localhost certificate lives outside repository/artifacts and is removed; certificate bypass applies only to that generated lab endpoint. Functional browser tests retain their HTTP/1.1 server. Default Lighthouse simulated profiles, three samples, medians and all limits remain unchanged. Historical HTTP/1.1 and later HTTP/2 results must not be presented as an apples-to-apples code-performance comparison. Release acceptance still requires the full final-commit matrix.

### Full-browser regression repairs

The complete matrix exposed a late desktop grid overriding an earlier mixed-selector mobile rule. Shared and operational selector branches are now split with the CSS selector-list parser, preserving each operational rule order instead of keeping mixed responsive rules in the early file. The original pixel references remain unchanged.

Lazy sections and command search now have local Suspense boundaries so opening a deferred view does not replace the entire workspace with first-entry UI or preserve a closing palette search by suspending its parent update. Reopening the palette must show a cleared query and recent navigation.

Loading another UI locale no longer rewrites stored demo record text. Fresh examples are still created in the selected locale; saved project/work arrays retain their original values. A component regression checks both rendered title and persisted data after autosave.

Secondary labels and saved status receive explicit contrast fixes. Two outdated tests now check the localized local-save status and the two local Manrope subsets instead of the removed Inter family; checks are retained rather than skipped. Axe, pixel thresholds and all CI gates are unchanged.

The locale-switch browser scenario now waits for autosave and repeats its data assertion after reload, preventing an early passing check before a delayed rewrite. Component keyboard checks explicitly settle the deferred module before asserting the palette, without changing timeouts or browser performance budgets.

Geometry, accessibility navigation and pixel captures explicitly wait for the selected section loading status to disappear. A visible retained shell alone no longer counts as evidence that deferred section content has rendered. This strengthens the measurement boundary without increasing thresholds or timeouts.
