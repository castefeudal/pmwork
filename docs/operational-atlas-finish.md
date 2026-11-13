# Operational Atlas — visual finish

This iteration continues the existing PMWORK artwork rather than replacing the
product's identity or data model. The entry sheet, public catalogues and working
surfaces share semantic inks, registration marks, measured rules and a restrained
copper accent.

## Implemented

- Entry: a framed route drawing with authored contour paths, a paper grid,
  stronger typography and separate RU/EN destination plates. One-shot route
  tracing and registration motion respect reduced-motion preferences.
- Workspace: theme-aware navigation, a clearer heading hierarchy and three
  families of section diagrams (network, schedule, register). Decorative section
  marks are omitted on narrow phones to keep the working area compact.
- Today: a live project index links to Work, RAID and Plan. Counts include only
  the current project; archived work is excluded, completed work appears in the
  denominator, closed risks and finished/cancelled milestones are excluded.
  These are record counts, not a claim about project health or success.
- Working surfaces: deliberate priority treatment, consistent data surfaces,
  tabular figures, table hover states, Work controls and framed empty states.
- Public catalogues: shared heading treatment and responsive card feedback.

All artwork is inline SVG/CSS. No remote image, font, animation library or new
runtime dependency is required. Existing records, navigation, backup workflows,
RU/EN, local storage and service-worker behavior remain in their owning modules.

## Checks

`tests/e2e/atlas-finish.spec.ts` covers both locales and both themes on desktop
and mobile: project-map destinations, working sections, public routes,
horizontal overflow, screenshots and axe checks on Today. Existing entry tests
cover narrow and landscape viewports, keyboard order and language links.

The CSS audit now includes the four previously unlisted/new graphic stylesheets.
Its recursive parser preserves nested media contexts; previously a mobile
declaration could incorrectly count as shadowing a desktop declaration.
The existing shadowing budget has not been raised.

Screenshots and machine-readable reports are generated under ignored
`test-results/` and `quality-evidence/`, respectively. Automated accessibility
checks do not replace a manual screen-reader or physical-device review.

## Validation on 14 November 2026

- 192 unit tests passed across 48 files; the 15 workspace interaction tests also
  passed again after the final project-index markup change.
- 56 desktop/mobile Chromium checks passed, including RU/EN, both themes,
  keyboard entry routes, axe across representative working surfaces, the
  320px editor, viewport reflow, document workflows, planning/RAID,
  independent text/density settings and offline scripts/fonts/navigation.
- After the final mobile composition change, 14 affected desktop/mobile checks
  passed again: all atlas surfaces in both languages/themes, the complete
  workspace viewport matrix and enlarged-text persistence/reflow. The mobile
  atlas test also asserts that the decorative mark is hidden and metric values
  share the same vertical position.
- Production build, static export, content, copy, translation parity, local
  links, CSS audit and JavaScript transfer budgets passed. Targeted lint passed;
  the initial full lint reported only the existing unused-import warning in
  `ux-viewport-matrix.spec.ts`.
- The two risk interaction tests now wait up to five seconds for the dynamically
  imported register, matching asynchronous section loading on a busy host.
  Their behavioral assertions have not been removed or weakened.
