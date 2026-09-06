# Product contract

PMWORK connects understand → decide → do → control → learn in one device-local workspace.

## Current behavior

1. First run is value-first: start a real project, explicitly explore the demo, or restore a validated backup. No automatic demo persistence.
2. All levels start at Today. Today isolates the highest-priority current signal and then groups remaining decisions, actions and checks. Foundation keeps expandable purpose/action/output/mistake explanations.
3. Guidance level and interface density are independent. Foundation uses a simpler primary information architecture; advanced users receive less teaching content without being forced into compact density.
4. Desktop navigation follows Act / Manage / Team & knowledge / System. Board is a Work display mode rather than a separate primary concept. Narrow-screen primary navigation is Today, Work, Plan, Control and More.
5. Global Add owns operational record creation. Settings contains project context, local identity, guidance, density, local-data controls, WIP limits and recovery snapshots.
6. URL state preserves project, view, layout and operational tabs; language switching preserves URL and persisted data.
7. Glossary supports 172 bilingual concepts, twelve categories, levels, aliases, fuzzy search and individual term routes.
8. Public search covers methods, templates, playbooks, knowledge, glossary and tools and prioritizes deterministic problem-intent matches for common natural-language PM problems. Method fit is a heuristic compatibility score, not a success probability.
9. Templates use a task-first hub with progressive result disclosure and individual static RU/EN detail routes. Template application uses an explicit destination and supports open/undo. New-project state contains no demo records.
10. Methods use a context-first hub and individual static RU/EN practical routes with fit, limitations, minimum implementation, operating model, tailoring and sources.
11. Mobile Work uses cards; Planning presents dates and milestones with an optional full timeline.
12. Local project identity supports My work. Risk conversion creates a linked issue; a deterministic status draft creates an editable document.
13. Project health separates derived state from data confidence; missing records reduce confidence rather than being treated as positive evidence.

Historical prompts under `archive/` are superseded as descriptions of the current implementation. The user execution specification remains the acceptance target; a feature is only verified when its associated release evidence passes.

## Transformation scope

See `UX_TRANSFORMATION_REPORT.md` for measured changes and `TRANSFORMATION_STATUS.md` for current implementation contracts. New project context is persisted; Today links to records; tools can reuse compatible project data. This remains a personal, device-local PM workbench.


## Schema v6 lifecycle

Milestone `date` is the current forecast. `baselineDate`, `actualDate`, `ownerId`/`ownerLabel`, `confidence` and `varianceReason` are optional. Migration does not invent past commitments. Work stores `originalEstimate` only when known and `estimateHistory` as timestamped original/revised/imported observations. Risk monetary fields are optional; ordinal impact and explicit event probability percentages are separate concepts.

Starter packs create linked records atomically. Guide uses six configured-control counts. Saved tool scenarios are ordinary editable/exportable documents; they do not silently rewrite the plan. Template reuse avoids identical duplicate drafts.
