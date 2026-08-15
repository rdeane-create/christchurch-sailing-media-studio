from pathlib import Path

p = Path('regatta-results-story.js')
s = p.read_text()

old_version = "const VERSION='20260815-regatta-results-story-v21-vertical-header-stretch';\nconst TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v21';"
new_version = "const VERSION='20260815-regatta-results-story-v22-final-header-fade';\nconst TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v22';"
if old_version not in s:
    if new_version in s:
        print('v22 already installed')
        raise SystemExit(0)
    raise SystemExit('Expected v21 version marker not found')
s = s.replace(old_version, new_version, 1)

old_header = "function drawTrueRatioHeader(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;const SRC_W=1023,SRC_H=218,HEADER_W=1080,HEADER_H=270;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,HEADER_W,HEADER_H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,0,0,HEADER_W,HEADER_H);ctx.restore()}"
new_header = "function drawFinalHeader(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;const SRC_W=1023,SRC_H=218,DST_W=1004,DST_H=251,DST_X=(W-DST_W)/2;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,270);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,DST_X,0,DST_W,DST_H);ctx.restore()}\nfunction drawFadeBridge(ctx){ctx.save();const g=ctx.createLinearGradient(0,900,0,1390);g.addColorStop(0,'rgba(6,41,90,0)');g.addColorStop(.52,'rgba(6,41,90,.08)');g.addColorStop(.82,'rgba(6,41,90,.42)');g.addColorStop(1,'rgba(6,41,90,.92)');ctx.fillStyle=g;ctx.fillRect(0,900,W,490);ctx.restore()}"
if old_header not in s:
    raise SystemExit('Expected v21 header function not found')
s = s.replace(old_header, new_header, 1)

old_cover = "drawAthleteMainExactStage(ctx);drawTrueRatioHeader(ctx);drawCoverBand(ctx);"
new_cover = "drawAthleteMainExactStage(ctx);drawFinalHeader(ctx);drawFadeBridge(ctx);drawCoverBand(ctx);"
if old_cover not in s:
    raise SystemExit('Expected v21 cover draw sequence not found')
s = s.replace(old_cover, new_cover, 1)

p.write_text(s)
print('Installed Regatta Results Story v22 final header/fade polish')
