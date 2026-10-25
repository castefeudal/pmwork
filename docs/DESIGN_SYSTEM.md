# PMWORK design system

This guide describes the shared visual and interaction foundations for the public site and project workspace. The implementation lives in `app/tokens.css`, `app/fonts.css`, the layered feature stylesheets, and the final responsive/accessibility layer in `app/refinement.css`.

## Typography

- **Manrope Variable** is the shared interface, reading and display face. Use `var(--font-sans)` for body, controls and tables, and `var(--font-display)` for headings; both resolve to the same local family. Hierarchy comes from size, weight, measure and spacing.
- Latin and Cyrillic subsets are self-hosted. A single family avoids loading four font files for a bilingual first view. `font-display: optional` preserves immediate fallback text and avoids late layout shifts. Keep RU/EN glyph coverage.
- Body copy uses a 16px base with a 1.55 line-height. Dense views can reduce spacing, but should not reduce useful workspace labels below 14px. Use tabular figures only where aligned comparison columns need them; ordinary copy uses proportional figures.
- Prefer sentence case, readable line lengths, and balanced headings. Avoid long all-caps labels and tight tracking in Cyrillic.

## Color and surfaces

Use semantic tokens rather than literal colors in feature styles: `--canvas`, `--surface-*`, `--text-*`, `--border-*`, `--accent-*`, and `--semantic-*`. Map meaning consistently: green for positive state, amber for caution, red for risk, and blue for neutral information. Pair every state color with a text label or shape; color alone must not carry meaning.

Light and dark themes share semantic names. Add a token override in `app/tokens.css` when a new semantic color or surface is needed. Keep contrast visible on both themes and retain a distinct `--border-focus` for keyboard focus.

## Layout and density

- Use the shared spacing and radius tokens before adding new values.
- Marketing pages use a wide reading frame with a bounded text measure. Workspace pages prioritize dense comparison tables, short action paths, and stable alignment.
- Compact density changes whitespace only. It does not hide records or reduce text to unreadable sizes.
- Mobile form controls use a 16px text size and unadjusted control metrics to avoid automatic page zoom in iOS browsers.
- Layouts must remain usable from 320px through wide desktop, at browser zoom, and with long Russian labels. Use `minmax(0, 1fr)`, `min-width: 0`, and wrapping for resilient grid content. Put genuinely wide tables inside their labeled horizontal-scroll region.
- Account for safe-area insets on fixed mobile navigation and bottom controls.

## Interaction and accessibility

- Use semantic links for navigation and buttons for actions. Give icon-only controls an accessible name.
- Keep visible keyboard focus, keyboard-operable dialogs and menus, and at least 44px touch targets for primary workspace actions.
- Respect `prefers-reduced-motion` and preserve legible colors and focus indicators in forced-colors mode.
- Associate form labels and errors with their controls. Keep validation, status, and risk meaning in text as well as color.
- Automated axe, responsive, and browser checks are regression evidence. They do not certify WCAG conformance or replace screen-reader, zoom, high-contrast, physical-device, and participant testing.

## Timeline and dense schedules

The planning timeline uses one scale model: `--timeline-label` (default 220px) sets the row-label column, `--timeline-gap` sets the distance to the track, and every tick, grid line and bar is positioned from the same percentage function in `src/components/planning-timeline.tsx`. Do not reintroduce a decorative background grid: grid lines must correspond to labelled ticks, and the today line must be labelled in the axis as well as the legend.

- Tick density follows the selected scale (months for the project view, Monday-first weeks, days for the day view). Labels come from `formatMonth`/`formatDayMonth` in `src/domain/format-date.ts`, which format in UTC so calendar days never shift.
- Row labels retain exact dates including the year; milestone rows distinguish baseline, forecast and actual.
- Bars show a text label only when the label fits (at least 9% of the track). Every bar keeps its exact dates in `title` and `aria-label`, so a hidden label never hides data.
- State is never carried by colour alone: the legend names work, blocked and milestone states, and blocked bars keep their own border.

## Layer order and the hero

`app/tokens.css` declares the cascade order: `reset, tokens, base, components, editorial, marketing, workspace, polish, utilities`. Later layers may only override earlier ones for a documented reason. The landing hero is defined once, in `app/excellence-public.css`; corrective layers must not restate its colours, type scale or background. Run `npm run css:audit` before adding a rule to a later layer: it reports declarations that a later identical selector already shadows, duplicate selector blocks, and raw hex values that should be semantic tokens.



## Change process

Add or revise a semantic token first, then apply it to shared components and route-specific layouts. Validate RU and EN, light and dark themes, 320px and desktop widths, and the static export at both `/` and `/pmwork`. Keep screenshot baselines unchanged unless a reviewer has inspected and accepted the visual difference.

For a design change, capture the surfaces with `npm run shots` (see `SHOTS` env vars in the script) before and after the edit and inspect the pairs in both themes at desktop and mobile width. The harness uses a fixed clock, reduced motion and the bundled demo project, so two runs differ only by what the code changed.
