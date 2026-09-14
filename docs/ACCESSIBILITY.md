# Accessibility

Target: WCAG 2.2 AA. Automated axe results are regression evidence, not a formal certification.

Implemented controls include semantic landmarks and headings, a skip link, explicit labels and status text, uniquely named create actions, modal semantics, focus trapping/restoration, Escape close, visible focus, table headers, text equivalents for calculated output, and non-color status labels. Kanban supports pointer drag plus explicit previous/next movement buttons. Primary flows target 44×44 CSS pixels; reduced-motion removes non-essential transitions and smooth scrolling.

Responsive browser coverage exercises 320, 360, 390, 768, 1024, 1280, 1440, and 1920 widths. Mobile uses stacked content and bottom navigation; dense tables/boards scroll only inside their own data region. RU and EN, light and dark workspace surfaces, dialogs, tools, catalogs, keyboard search, and representative journeys run through Playwright and axe in desktop/mobile Chromium projects.

Manual release review remains required for screen-reader comprehension, platform high-contrast behavior, 200% zoom, 400%/320 CSS-pixel reflow, focus not obscured by virtual keyboards/safe areas, and a complete keyboard-only journey on production devices. Record results rather than assuming automated parity establishes conformance.
