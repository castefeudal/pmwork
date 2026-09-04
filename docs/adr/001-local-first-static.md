# ADR 001 — Local-first static architecture

Status: accepted, 2026-09-04.

PMWORK v1 uses a static public layer and IndexedDB workspace. This removes account and backend friction, keeps project data on-device, enables GitHub Pages, and matches the explicit v1 boundary. Zod schemas and versioned backups create a controlled future path to sync without shipping fake collaboration today.
