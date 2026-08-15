from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v15-locked-header-contract" in s
assert "REGATTA RESULTS STORY — BUILD v15" in s
assert "const leftY=1370,rightY=1185" in s

# Use the original approved master artwork and crop the locked header source region
# 1023x218. Preserve that source aspect ratio when placing it on the 1080-wide canvas.
old="const headerImg=new Image();headerImg.src='assets/HeroV3/hero-header-master.png?v=f337cee670ec5154835b7a3ff528ccc67afe78ac';"
new="const headerImg=new Image();headerImg.src='assets/Reference/CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png?v=aa4dd843b278228556f56febb4570a01d8d4697e';"
assert old in s
s=s.replace(old,new,1)

old_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,1080,209);ctx.restore()}"
new_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const srcW=1023,srcH=218,dstH=209,dstW=srcW*(dstH/srcH),dstX=(1080-dstW)/2;ctx.drawImage(headerImg,0,0,srcW,srcH,dstX,0,dstW,dstH);ctx.restore()}"
assert old_fn in s
s=s.replace(old_fn,new_fn,1)

s=s.replace("20260815-regatta-results-story-v15-locked-header-contract","20260815-regatta-results-story-v16-preserve-header-aspect")
s=s.replace("REGATTA RESULTS STORY — BUILD v15","REGATTA RESULTS STORY — BUILD v16")
s=s.replace("Regatta Results Story — BUILD v15","Regatta Results Story — BUILD v16")
s=s.replace("Frozen Hero V3 header contract 1080 × 209 • results panel unchanged","Approved master header crop • aspect ratio preserved • results panel unchanged")

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);" in cover
assert "const srcW=1023,srcH=218,dstH=209,dstW=srcW*(dstH/srcH),dstX=(1080-dstW)/2" in s
assert "ctx.drawImage(headerImg,0,0,srcW,srcH,dstX,0,dstW,dstH)" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v16 aspect-preserved approved header crop')
# trigger v16 workflow
