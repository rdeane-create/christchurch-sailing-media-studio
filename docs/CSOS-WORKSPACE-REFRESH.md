# CSOS-style Studio workspace — October 18, 2026

This release changes Studio's application chrome, not its approved output designs.

- Same GitHub Pages origin and existing storage keys; no asset migration, cache clearing, card regeneration, or Drive permission change.
- CSOS navy sidebar, paper background, serif headings, compact cards, direct lineup/results/athlete-card/brand navigation, responsive phone menu, Open CSOS link, and pressed-button feedback.
- Existing canvas composition/render functions and the locked results, lineup branding, routing and library adapters remain unchanged. Brand source added for navigation is the already approved CSOS header.
- Real photos: original source bytes remain immutable. New AI and manual operations are restricted to proportional sizing and crop/position; background-removal inference, mask cleanup, photo rotation and opacity edits are disabled. Existing saved card PNGs and template treatments are not rewritten. Historical integrity metadata remains readable.
- Removed the legacy startup deletion of obsolete template entries; the visual refresh does not delete saved templates.

## Verification

40 source-preservation and mutation-guard checks passed. Desktop and 390px phone navigation/template/results layouts were inspected. Local lineup export completed as MP4 using a synthetic text/shape card with no student photograph. Local results reel completed with no photos. The local test fixture is not part of this release.

Live Google Apps Script deployment was inspected through Manage deployments: version 17, description “Fix nested-frame Studio connection and popup transport,” execute as school account, access Only myself. Existing bridge tab showed Connected. No deployment or access settings changed.

This does not add background rendering, a CSOS/Studio data integration, durable large-video uploads, or athlete-media relations. Those remain the integration work described in the audit. Browser-only saved recipes remain browser-only; the existing Drive direct-upload path retains its 15 MiB limit. No unattended/cloud-rendering claim is made by the browser export check.

Source baseline: 777b5956655a314a70c143e346cc3a4fc872ad8a. That commit preserves the complete pre-refresh source and tracked assets in Git history. All existing tracked asset files remain unchanged in this release.
