# PMWORK identity

The bilingual landing page visibly credits Pavel Markov and locale metadata declares him as creator. Keep this attribution clear and restrained across future public-surface redesigns.

The owner supplied a metallic blue/teal/copper PM symbol with two upward arrows. The supplied JPGs are raster reference boards, not SVG source assets; their checkerboard is baked into the image.

The integrated mark is an image-assisted adaptation of that supplied symbol, with the wordmark and checkerboard removed and a dark navy tile background. It is deliberately a raster asset, not a claimed vector reconstruction. Use `public/brand/logo-mark.webp` in navigation, with the accessible PMWORK text alongside it. Keep the mark's aspect ratio and fixed dimensions to prevent layout shifts. Do not add glow or animation to the logo.

PWA and Apple icons derive from the same mark. The maskable icon includes extra safe padding.

`public/icon.svg` is a separate small-size icon, not a vector version of the mark: the
metallic PM symbol turns to mud below about 32 px, and that file is what
SVG-capable browsers put in the tab. It carries the same idea in flat form — two
upward arrows, teal behind copper, on the navy tile — and is legible at 16 px.
Do not treat it as a reconstruction of the supplied symbol, and do not substitute
it for `public/brand/logo-mark.webp` wherever there is room for the real mark.

The social preview was rebuilt in October 2026. The previous `public/og-image.png`
was a fictional dashboard: invented figures (68 %, $184k, "3 priority actions") and
a "P" tile that is not the PMWORK mark. It is replaced by one drawn plate per
locale, `public/visuals/social/og-image-ru.png` and `og-image-en.png`, carrying the
real mark, the Signal → Decision → Action → Control loop and one factual line about
local storage. `npm run social:build` regenerates both from
`scripts/build-social-preview.mjs`; edit that script rather than hand-editing a PNG.

The interface uses Inter for utility, Manrope for headings, navy surfaces in dark mode, teal for primary actions and copper/amber for contextual signals. Semantic risk/status colors keep their meaning. Dense content uses restrained borders, readable paragraphs and two-column catalog cards collapsing to one column on mobile.

The demonstration title is MARKOVMADE. Its existing `atlas` identifier stays unchanged to preserve record relationships and saved navigation. Only an exact original title on a project explicitly marked as demo is renamed on load. Other names and all underlying records remain intact.
