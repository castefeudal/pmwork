# Initial repository audit

Checked: 2026-09-04. Default branch: `main`. Start commit: `43206f6`.

The repository contained one file: a one-line `README.md`. There was no application stack, UI, content, domain model, localization, storage, security policy, accessibility work, tests, CI, or deployment configuration. No local branches or workflow files existed. GitHub CLI was unavailable in the execution environment, so remote PR/issue/workflow inventory could not be queried through `gh`; the Git remote and default branch were verified directly.

Decision: treat the repository as greenfield, preserve its history, build a static-exportable Next.js local-first application, and isolate the implementation in `build/pmwork-production` before verified integration to `main`.
