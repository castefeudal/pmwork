# Document and brand repair

## Root cause

The template application dialog was rendered inside its catalog card. Ancestor transforms and backdrop filters created a containing block for its fixed backdrop; card overflow then clipped the overlay. Global page-width assertions did not detect a viewport-sized dialog constrained inside a card.

`WorkspaceMore` now renders through a React portal to `document.body`, outside all cards and their effects. The modal has a sticky heading, an individually named close control, bounded viewport height, internal scrolling and a reachable apply action. Existing focus trapping, Escape, outside click and focus restoration are preserved. The same correction applies to playbook and workspace More dialogs.

## Document experience

Template previews and saved document reading use the same safe React renderer: headings, paragraphs, emphasis, lists and pipe tables. HTML is displayed as text rather than interpreted. The document editor keeps its editable text value when switching reading modes. This is a supported Markdown subset, not a full rich-text editor.

The catalog uses two readable columns at desktop widths and one below 700px. Cards no longer clip expanded content or move on hover. Light and dark surfaces use consistent spacing, borders and heading scale.

## Regression evidence

The document-layout browser test checks RU/EN at 360, 768 and 1440px in both browser projects: overlay parent location, bounds, inner overflow, formatted document heading, renamed demo destination, reachable apply action, axe findings, Escape and focus restoration. Existing tests retain eight-width reflow, catalogs, workspace, dark/light, tools and offline journeys.

Actual screenshots reviewed include the Russian mobile and English desktop template application windows. These directly reproduce the surface reported by the user. Final run numbers belong in RELEASE.md and release-evidence.json, rather than duplicated here.
