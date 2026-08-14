# ATHLETE MAIN HEADSHOT — APPROVED — LOCKED BACKUP

**Locked:** 2026-08-14 at approximately 7:00 AM ET

This folder contains the approved Athlete Main Headshot template that was visually accepted after the final typography, white-core kerning, name spacing, and first-name alignment refinements.

## Restore source

- Live renderer file: `athlete-main-headshot-approved-exact.js`
- Backup renderer file: `BACKUPS/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_2026-08-14_0700ET/athlete-main-headshot-approved-exact.LOCKED.js`
- Approved renderer version inside file: `20260814-white-core-balance-16`
- Renderer blob SHA at lock time: `c7ba2537e7b3c77383bd9e2eab56b909a12038bc`
- Main commit observed at lock time: `94bc18bf8b581e5a92612d192695c335a7ddd8a7`

## Required locked assets

These assets are referenced by the renderer and must remain unchanged:

1. `assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp`
   - Size: 90,626 bytes
   - SHA-256: `4507debfa0392b50a31a82c1b71b406f4bb841af5e94ae40e761edf56c94bf14`

2. `assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_GLYPH_ATLAS_v1.webp`
   - Size: 323,050 bytes
   - SHA-256: `ab764e51db0ee2d46fbaa1ca3e43d6dc5c18f5cb0e994229566336864dec9b1f`

## Approved typography settings

- First name: `drawRasterText(ctx,S.first,'small',82,897,58,0,710)`
- Last name: `drawRasterText(ctx,S.last,'large',48,967,205,0,960)`
- White-core contour target: `const target=style==='large'?9:7;`
- Orange rule: `ctx.fillRect(56,1194,575,7)`
- Class line: `drawRasterText(ctx,S.classLine,'orange',58,1216,52,13,760)`

## Restore procedure

If the Athlete Main Headshot template is ever damaged or accidentally changed:

1. Copy the complete contents of `athlete-main-headshot-approved-exact.LOCKED.js` from this backup folder.
2. Replace the complete contents of the root file `athlete-main-headshot-approved-exact.js` with that locked copy.
3. Confirm the two required asset files above still match their listed SHA-256 hashes.
4. Ensure `index.html` loads `athlete-main-headshot-approved-exact.js`.
5. Deploy GitHub Pages and visually verify the template.

## Lock rule

Do not modify this backup folder during normal design work. Future approved versions should get a new dated backup folder rather than overwriting this one.
