# Automated usability proxy

These are browser-agent scenarios, not a human study. No SUS, SEQ, human completion time or participant success rate is reported. U1–U8 human targets remain in UX_BASELINE.md.

An action is a navigation, activation or field change. Assertions, storage seeding, waiting for readiness and focus preparation are excluded. Counts describe the scripted path, not a user's search time. Desktop/mobile navigation differences are retained.

| Task | Browser evidence | Actions | Observed friction and resolution |
| --- | --- | ---: | --- |
| U1 | `final-production`: clean project creation; `starter-scenario`: linked bundle and undo | 7 | Setup uses three short steps; initial work and risks are created together. |
| U2 | `critical`: work title, owner, due date, then Board movement to Ready | 10 | New work starts in Backlog; status is changed through the same Board record. |
| U3 | `critical`: probability 5, impact 5 and specific response | 7 desktop / 8 mobile | Mobile RAID is in More; response is entered in the creation form. |
| U4 | `transformation`: highest-priority signal opens its exact record | 2 | One named signal with one destination. |
| U5 | `usability-proxy`: status search result, template, destination, editable document | 5 | Destination confirmation precedes Apply; Open is explicit. |
| U6 | `usability-proxy`: maximum volatility with an explained adaptable approach | 2 | Ten context dimensions are available; scores are labelled as a heuristic. |
| U7 | `usability-proxy`: critical issue visible in Control and editable status draft | 2 | Generated draft opens directly; the reporting period still needs editorial selection. |
| U8 | `mobile-work-contract`: Unassigned and Overdue at 360px | 3 | Quick filters operate on the same work data; empty results remain explicit. |

The final CI report supplies pass/fail evidence for these paths in root and GitHub-base exports. This protocol does not establish that a human can complete them within the target time.
