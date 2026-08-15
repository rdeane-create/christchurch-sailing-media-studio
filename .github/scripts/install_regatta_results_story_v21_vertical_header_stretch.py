from pathlib import Path

p = Path('regatta-results-story.js')
s = p.read_text()

s = s.replace("const VERSION='20260815-regatta-results-story-v20-true-header-ratio';", "const VERSION='20260815-regatta-results-story-v21-vertical-header-stretch';")
s = s.replace("const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v20';", "const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v21';")

old = "function drawTrueRatioHeader(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;const SRC_W=1023,SRC_H=218,HEADER_W=1080,HEADER_H=HEADER_W*SRC_H/SRC_W;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,HEADER_W,HEADER_H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,0,0,HEADER_W,HEADER_H);ctx.restore()}"
new = "function drawTrueRatioHeader(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;const SRC_W=1023,SRC_H=218,HEADER_W=1080,HEADER_H=270;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,HEADER_W,HEADER_H);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,0,0,HEADER_W,HEADER_H);ctx.restore()}"

if old not in s:
    if "HEADER_H=270" in s and "BUILD v21" in s:
        print('v21 already installed')
        raise SystemExit(0)
    raise SystemExit('Expected v20 header function not found')

s = s.replace(old, new)
p.write_text(s)
print('Installed Regatta Results v21: header stretched vertically to 1080x270 only')
