# UX baseline — measurable transformation

Baseline commit: `25d59e5de5325885a87d23e0d3e1654347328976`.

This baseline records the state before the measurable UX transformation. It is intentionally limited to evidence available from the repository and automated browser QA. Human usability metrics were not measured before this branch.

## Automated baseline

- Unit/component tests recorded by release evidence: 63.
- Browser tests recorded by release evidence: 192.
- Static HTML pages recorded by release evidence: 370.
- Accessibility target: WCAG 2.2 AA; no formal certification claimed.
- Existing critical browser coverage includes desktop/mobile RU/EN journeys, reflow, dialogs, storage fallback and axe checks.

## Initial JavaScript baseline

| Route | Initial JS gzip |
| --- | ---: |
| `/en/` | 188,832 B |
| `/en/glossary` | 307,965 B |
| `/en/methods` | 307,965 B |
| `/en/tools` | 202,087 B |
| `/en/workspace` | 316,122 B |

## Confirmed UX gaps at baseline

1. First run explains configuration choices before clearly stating the value and expected time-to-value.
2. Project setup exposes all ten context dimensions before the first recommendation.
3. Today repeats generic `Open record` actions and does not isolate a single highest-priority action.
4. Project health mixes state with missing-data evidence; no explicit confidence score is shown.
5. Desktop IA exposes Board as a separate top-level destination even though it represents the same work records.
6. Settings contains shortcuts for creating operational records, mixing configuration and action concepts.
7. Template catalog renders the full result set as large cards, creating very long pages, especially on mobile.
8. Experience and density are stored independently, but presentation differences between Foundation / Practitioner / Expert remain incomplete.
9. Method/editorial completeness and several persistent-record gaps remain documented in `TRANSFORMATION_STATUS.md`.

## Human usability baseline

`NOT MEASURED`.

Automated Playwright completion must not be reported as human task success.

## UX benchmark protocol

The release should preserve a repeatable protocol for:

- U1 create first project and first actionable record — Foundation target ≤180 s;
- U2 create work item with owner/status/due date — ≤60 s;
- U3 create high risk and response — ≤90 s;
- U4 identify the highest-priority project signal — ≤30 s;
- U5 find and apply a status template — ≤90 s;
- U6 select an approach for a volatile project — ≤120 s;
- U7 prepare status and identify a critical issue — ≤120 s;
- U8 on mobile find overdue/unassigned work — ≤60 s.

Human results remain `NOT MEASURED` until tested with actual participants.
