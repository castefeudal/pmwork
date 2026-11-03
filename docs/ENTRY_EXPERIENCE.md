# Entry experience — 2026-11-03

Scope: root language selector only. Original PMWORK mark, theme persistence, local fonts, Next Link routing, onboarding, workspace, and storage are retained.

## Design

An editorial Operational Atlas cover: oversized PMWORK typography, a copper punctuation mark, a teal signal–decision–action route, precision hairlines, and equally weighted language entrances. The SVG is decorative and excluded from the accessibility tree. The creator signature sits alongside a direct Telegram contact link with a visible handle. No new runtime dependencies, remote fonts, image requests, or JavaScript animation logic.

`app/entry-portal.css` owns the new surface. Obsolete entry rules were removed from `excellence-entry.css` and `refinement.css`. A source comparison verified that onboarding/workspace declarations in the former are unchanged, including reduced-motion behavior.

## Verification

- Production export with `PMWORK_BASE_PATH=github`: build and typecheck pass; 499 generated routes, 498 exported HTML documents.
- Lint passes with one pre-existing unused `demoWorkspace` warning in `ux-viewport-matrix.spec.ts`.
- Unit suite: 48 files, 190 tests pass using `npx vitest run --pool=threads --maxWorkers=1`. The initial forks run hit six worker-start timeouts on Windows; its incomplete result is not counted as a pass.
- Content, copy, i18n, links, CSS cascade gate, export validation, and route transfer budgets pass.
- The dedicated entry browser suite checks both themes at 320, 375, 390, 768, 1024, 1440 and 1920 px, plus 1024×600 and 568×320. It asserts no page overflow, no selected text-container overflow, 44px targets, complete desktop footer visibility, keyboard tab order, reduced motion, axe, and actual RU/EN navigation under `/pmwork`.
- Final Chromium verification: 8/8 root-entry tests pass on desktop/mobile without retries; 8/8 existing workspace-entry checks also pass. Firefox and WebKit pass both theme matrices (4/4 final engine checks). The earlier concurrent Chromium run needed two navigation retries; the sequential run is the final evidence.
- Explicit zero tab indices preserve link keyboard access in WebKit when its default Tab-to-links preference is disabled.
- Contact: `https://t.me/markovmade` responds HTTP 200 with title `Telegram: Contact @markovmade`. A controlled browser popup test verifies the direct destination and safe new-tab behavior. It does not send a message or launch an installed Telegram client.
- Desktop and mobile light/dark screenshots are saved under ignored `test-results/entry-atlas-*.png` and visually inspected. The first visual pass identified excessive desktop height; the final layout reduces the hero and keeps the footer within normal desktop viewports.

## Limits

Browser automation uses installed browser engines and mobile emulation, not physical devices. No manual screen-reader session, installed Telegram app handoff, field Core Web Vitals, or full-app exhaustive E2E certification is claimed. The existing transfer-budget script checks internal routes, not root performance; the root adds only inline SVG and scoped CSS. GitHub deployment status is separate from local verification.
