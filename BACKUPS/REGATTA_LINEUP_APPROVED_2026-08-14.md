# Approved Regatta Lineup Backup

Approved baseline for the Christchurch Regatta Lineup template.

- Approved commit: `3182f290e345944ba2a759d9be2e2d8ec345b54d`
- Backup branch: `backup/regatta-lineup-approved-2026-08-14`
- Approved date: 2026-08-14
- Status: LOCKED / APPROVED

This restore point includes the approved Regatta Lineup branding, header/footer treatment, 1–12 card support, single-card feature motion, preview/render/export action bar, Event Location placement, Drive-backed athlete-card selection, and Save to Library behavior.

## Restore options

### Safest full restore
Reset or recreate a working branch from:

`backup/regatta-lineup-approved-2026-08-14`

or directly from immutable commit:

`3182f290e345944ba2a759d9be2e2d8ec345b54d`

### Regatta-only recovery
If later Studio development has changed unrelated modules, do not blindly reset all of `main`. Recover the Regatta Lineup from the backup branch/commit and selectively restore the Regatta-related changes.

Primary Regatta files at this restore point include:

- `regatta-lineup-layout-v2.js`
- `regatta-lineup-output-branding-v1.js`
- `regatta-lineup-video-route.js`
- Regatta renderer/layout code embedded in `index.html`

Because some approved renderer logic is embedded in `index.html`, use the backup commit as the source of truth when restoring.

## Lock policy

Treat this version as the approved visual and motion baseline. Future changes should be limited to explicit requested revisions or bug fixes. Before substantial new Regatta Lineup work, preserve a new restore point rather than overwriting this one.
