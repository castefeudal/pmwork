# Security and privacy review

- User input is rendered as React text; no `dangerouslySetInnerHTML` is used.
- Imports have a 10 MB limit and are parsed through strict Zod schemas before persistence.
- Unknown schema versions fail validation rather than silently corrupting state.
- Project data remains in IndexedDB; there are no credentials, trackers, analytics, or remote sync.
- Export uses a local Blob URL that is revoked immediately.
- External source links use `rel="noreferrer"`.
- Destructive workspace reset is not exposed without a confirmation flow.

Remaining browser-level risk: any script executing in the origin can access IndexedDB. Deployment should keep dependencies current and use a restrictive platform CSP where headers are supported.
