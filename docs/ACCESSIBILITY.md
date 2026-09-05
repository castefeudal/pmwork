> Current branch note: refer to PRODUCT_SPEC.md, CONTENT_MODEL.md, QUALITY_GATE.md and RELEASE.md for current behavior and validation. Earlier measurements below are historical and are not evidence for the new branch.

# Accessibility

Target: WCAG 2.2 AA.

- Semantic landmarks, headings, labels, tables, dialogs, status text, and skip link.
- Focus-visible outline is never conveyed by color alone.
- Board supports pointer drag and explicit previous/next-column buttons.
- Controls target at least 44px in primary flows; text remains usable at 200% zoom.
- Light and dark tokens maintain strong foreground/background contrast.
- Reduced-motion preference disables animation and smooth scrolling.
- Mobile views use bottom navigation, stacked dashboards, and snap columns rather than whole-page overflow.
- Charts and matrices have text summaries and numeric table alternatives where relevant.

Automated accessibility dependency and Playwright configuration are included. Manual checks cover tab order, Escape/close behavior, focus visibility, long strings, and 320–430px layouts.
