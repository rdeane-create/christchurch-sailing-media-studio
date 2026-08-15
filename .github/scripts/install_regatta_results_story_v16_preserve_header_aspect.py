from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "const leftY=1370,rightY=1185" in s

v15_version="20260815-regatta-results-story-v15-locked-header-contract"
v16_version="20260815-regatta-results-story-v16-preserve-header-aspect"
v15_name="REGATTA RESULTS STORY — BUILD v15"
v16_name="REGATTA RESULTS STORY — BUILD v16"

old="const headerImg=new Image();headerImg.src='assets/HeroV3/hero-header-master.png?v=f337cee670ec5154835b7a3ff528ccc67afe78ac';"
new="const headerImg=new Image();headerImg.src='assets/Reference/CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png?v=aa4dd843b278228556f56febb4570a01d8d4697e';"

old_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,1080,209);ctx.restore()}"
new_fn="function drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const srcW=1023,srcH=218,dstH=209,dstW=srcW*(dstH/srcH),dstX=(1080-dstW)/2;ctx.drawImage(headerImg,0,0,srcW,srcH,dstX,0,dstW,dstH);ctx.restore()}"

if v15_version in s or v15_name in s:
    assert old in s
    assert old_fn in s
    s=s.replace(old,new,1)
    s=s.replace(old_fn,new_fn,1)
    s=s.replace(v15_version,v16_version)
    s=s.replace(v15_name,v16_name)
    s=s.replace("Regatta Results Story — BUILD v15","Regatta Results Story — BUILD v16")
    s=s.replace("Frozen Hero V3 header contract 1080 × 209 • results panel unchanged","Approved master header crop • aspect ratio preserved • results panel unchanged")
elif v16_version in s and v16_name in s:
    # Already installed. Validate and exit cleanly.
    pass
else:
    raise AssertionError('Unexpected Regatta Results version; refusing to modify file')

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert v16_version in s
assert v16_name in s
assert new in s
assert new_fn in s
assert "drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);" in cover
assert "const srcW=1023,srcH=218,dstH=209,dstW=srcW*(dstH/srcH),dstX=(1080-dstW)/2" in s
assert "ctx.drawImage(headerImg,0,0,srcW,srcH,dstX,0,dstW,dstH)" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Regatta Results v16 aspect-preserved approved header is installed and validated')
