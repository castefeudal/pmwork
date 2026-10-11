# PMWORK design system

This guide describes the shared visual and interaction foundations for the public site and project workspace. The implementation lives in `app/tokens.css`, `app/fonts.css`, the layered feature stylesheets, and the final responsive/accessibility layer in `app/refinement.css`.

## Typography

- **Inter Variable** is the interface and reading face. Use `var(--font-sans)` for body copy, controls, tables, and long-form content.
- **Manrope Variable** is the display face. Use `var(--font-display)` for headings and short numeric callouts; keep body paragraphs in Inter.
- Both variable font families are self-hosted with Latin and Cyrillic subsets. Keep RU/EN glyph coverage when changing subsets. `font-display: optional` avoids late font swaps that shift content while keeping system-font text available immediately.
- Body copy uses a 16px base with a 1.55 line-height. Dense views can reduce spacing, but should not reduce useful workspace labels below 12px. Use tabular figures only where aligned comparison columns need them; ordinary copy uses proportional figures.
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

## Change process

Add or revise a semantic token first, then apply it to shared components and route-specific layouts. Validate RU and EN, light and dark themes, 320px and desktop widths, and the static export at both `/` and `/pmwork`. Keep screenshot baselines unchanged unless a reviewer has inspected and accepted the visual difference.
