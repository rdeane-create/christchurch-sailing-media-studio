from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v16-preserve-header-aspect" in s
assert "REGATTA RESULTS STORY — BUILD v16" in s
assert "const leftY=1370,rightY=1185" in s

old_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const srcW=1023,srcH=218,dstH=209,dstW=srcW*(dstH/srcH),dstX=(1080-dstW)/2;ctx.drawImage(headerImg,0,0,srcW,srcH,dstX,0,dstW,dstH);ctx.restore()}"
new_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.beginPath();ctx.rect(0,0,1080,209);ctx.clip();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const srcW=1023,srcH=218,dstW=1080,dstH=srcH*(dstW/srcW),dstY=(209-dstH)/2;ctx.drawImage(headerImg,0,0,srcW,srcH,0,dstY,dstW,dstH);ctx.restore()}"
assert old_fn in s
s=s.replace(old_fn,new_fn,1)

s=s.replace("20260815-regatta-results-story-v16-preserve-header-aspect","20260815-regatta-results-story-v17-fill-header-no-distortion")
s=s.replace("REGATTA RESULTS STORY — BUILD v16","REGATTA RESULTS STORY — BUILD v17")
s=s.replace("Regatta Results Story — BUILD v16","Regatta Results Story — BUILD v17")
s=s.replace("Approved master header crop • aspect ratio preserved • results panel unchanged","Approved master header fills width • aspect preserved • results panel unchanged")

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);" in cover
assert "const srcW=1023,srcH=218,dstW=1080,dstH=srcH*(dstW/srcW),dstY=(209-dstH)/2" in s
assert "ctx.drawImage(headerImg,0,0,srcW,srcH,0,dstY,dstW,dstH)" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v17 full-width undistorted header')
