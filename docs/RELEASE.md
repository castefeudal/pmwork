# PMWORK 2.3 release

Scope: production hardening of the local-first decision cockpit, additive data lifecycle v6, real starter bundles, deterministic scenario persistence/apply flows, MARKOVMADE method/tool, accessibility/performance/PWA repairs, and updated release evidence.

## Required evidence

The authoritative machine-readable snapshot is [release-evidence.json](release-evidence.json). The release sequence is documented in [QUALITY_GATE.md](QUALITY_GATE.md). Root and `/pmwork` outputs must independently pass verify, browser, and performance gates.

## Release boundaries

No backend, authentication, cloud sync, AI chat, analytics, or trackers were added. Deterministic forecasts and scores expose assumptions and confidence; they are not promises or objective probabilities. Human usability results, formal WCAG certification, field Core Web Vitals/INP, CI for an unpushed working tree, and live deployment for an undeployed commit must never be inferred from local tests.

## Manual release evidence

Before announcing production release, complete [USABILITY_PROTOCOL.md](USABILITY_PROTOCOL.md), manual assistive-technology/device checks from [ACCESSIBILITY.md](ACCESSIBILITY.md), visually review the representative screenshot matrix, merge the exact reviewed commit, confirm both Quality Gate matrix jobs and Pages Deploy are green, then run the live smoke check against the emitted `release.json`.
