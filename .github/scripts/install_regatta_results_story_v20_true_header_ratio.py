from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

# Accept the currently-live v18 file or a later header experiment, but protect the results panel.
assert "const leftY=1370,rightY=1185" in s

# Version label.
import re
s=re.sub(r"const VERSION='[^']+';", "const VERSION='20260815-regatta-results-story-v20-true-header-ratio';", s, count=1)
s=re.sub(r"const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v\d+';", "const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v20';", s, count=1)
s=s.replace('Regatta Results Story — BUILD v18','Regatta Results Story — BUILD v20')
s=s.replace('Regatta Results Story — BUILD v19','Regatta Results Story — BUILD v20')

# Insert one authoritative header renderer. It uses the original 1023x218 source crop,
# fills the full 1080 story width, and derives height from the original aspect ratio.
header_fn="function drawTrueRatioHeader(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;const SRC_W=1023,SRC_H=218,HEADER_W=1080,HEADER_H=HEADER_W*SRC_H/SRC_W;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,HEADER_W,HEADER_H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,0,0,HEADER_W,HEADER_H);ctx.restore()}"

# Replace any previous special header function if present; otherwise insert before diagonalBand.
if 'function drawTrueRatioHeader(ctx)' not in s:
    anchor='function diagonalBand(ctx,y1,y2)'
    assert anchor in s
    s=s.replace(anchor,header_fn+'\n'+anchor,1)

# Cover must draw Athlete stage, then exactly one true-ratio header, then the untouched results band.
start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){')
cover=s[start:end]
cover=re.sub(r"drawAthleteMainExactStage\(ctx\);(?:drawLockedHeroHeaderContract\(ctx\);)?drawCoverBand\(ctx\);",
             "drawAthleteMainExactStage(ctx);drawTrueRatioHeader(ctx);drawCoverBand(ctx);", cover, count=1)
# If v19 native stage experiment landed, normalize its cover path too.
cover=cover.replace('drawNativeAthleteStage(ctx);drawCoverBand(ctx);','drawAthleteMainExactStage(ctx);drawTrueRatioHeader(ctx);drawCoverBand(ctx);')
s=s[:start]+cover+s[end:]

# Update the visible build note if found.
s=s.replace('Approved Athlete Main header fills width • aspect preserved • results panel unchanged','Original 1023 × 218 header ratio • 1080 × 230.15 • results panel unchanged')
s=s.replace('Native Athlete Main stage pasted 1:1 • results panel unchanged','Original 1023 × 218 header ratio • 1080 × 230.15 • results panel unchanged')

# Validation guards.
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert 'drawAthleteMainExactStage(ctx);drawTrueRatioHeader(ctx);drawCoverBand(ctx);' in cover
assert 'const SRC_W=1023,SRC_H=218,HEADER_W=1080,HEADER_H=HEADER_W*SRC_H/SRC_W' in s
assert 'ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,0,0,HEADER_W,HEADER_H)' in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Installed Regatta Results v20 true 1023x218 header aspect ratio')
