# Visual direction — Operational Atlas

Decisions taken during the 2026-10 visual transformation. This records *why* the
surface looks the way it does, so later work changes a decision rather than
discovering it again. Related: [BRAND.md](BRAND.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md),
[VISUAL_ASSET_INVENTORY.md](VISUAL_ASSET_INVENTORY.md).

## The problem the audit found

Screenshots of the real build, not JSX, showed four defects:

1. **No authored imagery anywhere.** The landing page was text, six identical
   icon-topped cards, and one live product panel. Below the fold the page had
   large undifferentiated whitespace.
2. **The four management roles were one card with four labels.** Switching tabs
   changed text only; nothing at a glance said "this is a different kind of work".
3. **The library explained mechanics in prose only.** Scrum, Kanban, CPM, PERT
   and earned value were described but never drawn, so the reader had to
   reconstruct the mechanism.
4. **The social preview was a fake.** `public/og-image.png` depicted a dashboard
   with invented numbers (68%, $184k, "3 priority actions") and a "P" tile that
   is not the PMWORK mark. It was also the only brand image a stranger would see.

The brand mark itself was already good and stayed untouched.

## Three directions considered

### A — Operational Atlas (chosen)

PMWORK is a working chart of a project: where the record is, which route the
work takes, which point needs a decision. The graphic language is survey
drafting — measurement rails with ticks, directed bearing routes with
arrowheads, triangulation nodes, copper crosshair control points, engraved
contour lines, corner registration marks. Deep navy and graphite for depth,
teal for the action line, copper for control points, neutral light surfaces for
the workspace itself.

It is recognisable without the logo because the *language* is the identity:
a copper crosshair on a navy plate with a hairline rail reads as PMWORK.

### B — Signal Room (rejected)

A dark instrument console: status LEDs, dense telemetry, glow on alert.
Rejected because it turns a project-management tool into a monitoring wall,
pushes the whole product dark (the workspace is used for reading and writing
text for hours), and depends on exactly the ambient glow the brief bans.

### C — Editorial Ledger (rejected)

Paper surfaces, rules and typography only, no imagery. Rejected because it
cannot carry "recognisable without the logo" — with the wordmark removed it is
any documentation site — and it leaves the mechanism of a method undescribed.

## Rules that follow from the choice

**Meaning is drawn, atmosphere is generated.** Charts, diagrams and method
mechanics are live SVG in `src/components/atlas-marks.tsx`, `atlas-empty.tsx`,
`atlas-graphics.tsx` and `atlas-editorial.tsx`: they recolour with the theme,
scale without blur, cost no extra request, and stay correct in both locales.
Only atmosphere — hero band, role plates, onboarding plate — is a raster file,
because that is the part a vector cannot fake.

**An interactive surface imports only the drawings it renders.** The four modules
above exist because Next ships everything a `"use client"` component imports
inside that route's JavaScript. The workspace islands therefore pull just
`atlas-marks` (primitives) and `atlas-empty` (the four empty states); the tools
island adds `atlas-graphics`, whose sheets it actually draws; the landing plates
in `atlas-editorial` stay behind a server component, and the role showcase
switches sheets with a tab island of a few lines. That boundary is what kept the
transfer gate green: the first integrated build measured **+7.38 %** over the
recorded `/en/` baseline and failed the check, the module split brought it to
201,023 bytes, and moving the four role sheets out of JavaScript into the
prerendered HTML brought it to 198,453 bytes (**+3.85 %**, inside the 5 % gate).
No budget, threshold or recorded baseline was edited.



**No lettering inside raster art.** Every generated plate is textless. A
bilingual product cannot bake Cyrillic or Latin into a bitmap; the words come
from the DOM, so one asset serves both locales.

**One plate per subject, dark field.** Role and onboarding plates are
self-contained deep-navy sheets rather than theme-matched pairs. A plate is an
object placed *on* the page, not a tint of the page: it stays identical in
light and dark, halves the byte budget, and matches the existing dark
privacy/closing panels. Theme response comes from the SVG layer instead.

**Density beats decoration inside the workspace.** No generated imagery on
working surfaces. There the atlas language appears only as hairline structure,
an empty-state figure beside the copy (never above it), and the framed plate on
the first-run gate.

**The live demo stays the hero.** `ProductShowcase` is real, interactive and
remains the primary hero object; the new treatment frames it (copper underleaf,
registration corners) rather than replacing it with a picture of a product.

**Motion is restrained.** Only the existing 180–240 ms arrivals; every new rule
is guarded by `prefers-reduced-motion`. No logo glow or animation.

## Social preview

Rebuilt as a drawn composition, one per locale
(`public/visuals/social/og-image-{ru,en}.png`, generated by
`npm run social:build`). It carries the real mark, the four-step loop that the
landing band states, and one factual line about local storage — no metrics, no
mock UI. `docs/BRAND.md` previously recorded that the old preview was preserved
because nobody had asked for a new one; the fake numbers made it a liability, so
it was replaced and the note updated. They are also the only shipped raster left
out of the service-worker precache: a link unfurler requests them, the product
never does, so 515 kB of crawler artwork has no place in the offline shell.

## Verification discipline

A plate is only finished when it has been looked at. Eight defects in this pass
were invisible in source and obvious in a screenshot, and each was fixed at its
cause rather than papered over with a later rule:

- `figure { margin: 1em 40px }` from the UA sheet was eating 80 px from every
  atlas plate → `margin: 0` on `.atlas-plate`.
- `grid-template-columns: minmax(0, 440px)` sizes to content, not to its maximum,
  so the role plate collapsed → `clamp(268px, 31vw, 440px)`.
- `.coverage-strip` declared five item columns and the demo fills two → the item
  tracks are now `repeat(auto-fit, …)`, so the count drives the layout.
- `width: 100%` on `.atlas-graphic` set the *automatic minimum size* of the
  empty-state flex item, so a 148 px figure rendered 1108 px wide → the item
  restates `width` and `min-width: 0`.
- The role row read as a plate with a hole under the copy: at 1440 px the plate
  column was 373 px tall and the explanation 190 px, top-aligned, leaving 213 px
  of dead surface. The row now balances around the plate (`align-items: center`
  in the two-column case, `start` once it stacks), which measures 121 px of
  even air above and below.
- A mobile defect that only WebKit showed: `.workspace-content` reserved 56 px
  under the fixed destination bar, which is 66 px tall, so the last control on
  the planning panel sat *under* the bar and an actionability hit-test found the
  nav button instead of the toggle. The clearance is now one token
  (`--mobile-work-nav-clearance`, derived from `--mobile-work-nav-height`) that
  the bar and the content share, and the `utilities` rule that flattened it to
  56 px at every width carries the mobile branch it used to erase.
- A diagram plate that was 801 px wide around a 460 px sheet is not a framed
  drawing, it is an empty box with a drawing in it. The method and tool plates now
  cap at 720 px and 620 px and let the sheet grow to 620 px and 520 px, so the
  frame reads as made for the artwork.
- The first-run plate disappeared in dark mode, because the plate navy and
  `--canvas` are the same `#0b1117`. The plate keeps its artwork but gains an edge
  and a hairline ring there; on the landing surfaces the panel already provides a
  lighter ground, so no change was needed.

The rule for future work: capture the state, not the component. Empty states need
a project with nothing in it; filtered-empty needs a search that matches nothing;
both are reachable but neither is what the demo shows. And measure before
concluding — the 56 px vs 66 px numbers came from a probe that printed the two
rectangles, not from reading the stylesheet, where four different layers each
claimed a different clearance.

