from pathlib import Path

p = Path('college-acceptance.js')
s = p.read_text()

old_version = "const VERSION='20260815-college-acceptance-v9-jpeg-knockout';"
new_version = "const VERSION='20260815-college-acceptance-v10-stray-mark-cleanup';"
if old_version not in s:
    raise SystemExit('Expected v9 College Acceptance version not found')
s = s.replace(old_version, new_version, 1)

old = "for(const part of parts){const cx=(part.minX+part.maxX)/2,cy=(part.minY+part.maxY)/2;const tiny=part.area<Math.max(18,total*.0007);const peripheral=cx>iw*.92||cy>ih*.88;if(tiny&&peripheral)for(const k of part.pixels)dd[k*4+3]=0;}"
new = "for(const part of parts){const cx=(part.minX+part.maxX)/2,cy=(part.minY+part.maxY)/2,pw=part.maxX-part.minX+1,ph=part.maxY-part.minY+1;const tiny=part.area<Math.max(28,total*.0018);const compact=pw<iw*.10&&ph<ih*.16;const lowerRight=cx>iw*.76&&cy>ih*.64;const extremeEdge=cx>iw*.92||cy>ih*.88;if(tiny&&compact&&(lowerRight||extremeEdge))for(const k of part.pixels)dd[k*4+3]=0;}"
if old not in s:
    raise SystemExit('Expected v9 stray-speck cleanup block not found')
s = s.replace(old, new, 1)

p.write_text(s)
print('Updated college-acceptance.js to v10 stray-mark cleanup')
