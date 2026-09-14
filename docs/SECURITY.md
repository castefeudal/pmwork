# Security and privacy review

- User content is rendered as React text; the repository contains no `dangerouslySetInnerHTML` path for user input.
- Imports are limited to 10 MB, parsed, migrated, and strictly validated with Zod before preview or persistence. Unknown future schemas fail closed.
- Healthy data receives a forced snapshot before import/restore replacement. Corrupt original bytes are preserved while autosave is paused.
- Project data stays in IndexedDB with a localStorage recovery mirror. There are no credentials, trackers, analytics, remote sync, third-party scripts, or server data endpoints.
- Blob download URLs are revoked and external source links use safe relationship attributes.
- `npm audit --audit-level=moderate` reports zero known dependency vulnerabilities for the v2.3 lockfile. Vitest was upgraded to 5.0.0 to remove the prior dev-only path-traversal advisory.

Browser-origin risk remains fundamental: any JavaScript executing in the PMWORK origin can potentially read IndexedDB. Keep dependencies and deployment actions current, protect the GitHub account and branch, review every third-party dependency, and avoid sharing the origin with unrelated applications.

GitHub Pages cannot attach a repository-controlled response-header CSP. A restrictive meta CSP would conflict with Next's generated inline bootstrap and would offer incomplete protection, so PMWORK does not claim a cosmetic CSP. Static hosts with configurable headers should test a nonce/hash-based policy against the complete export, service worker, fonts, and offline flow before enforcement.
