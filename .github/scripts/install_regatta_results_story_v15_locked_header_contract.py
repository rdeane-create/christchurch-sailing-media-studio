from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v14-exact-athlete-main-asset-url" in s
assert "REGATTA RESULTS STORY — BUILD v14" in s
assert "const leftY=1370,rightY=1185" in s
assert "approvedMainOverlay.src='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp?v=20260814-drive-saved-cards-20';" in s

# Use the frozen Hero V3 header master exactly per MASTER_CONTRACT:
# source asset = approved 1023x218 crop; destination = x0,y0,w1080,h209.
s=s.replace("headerImg.src='assets/HeroV3/hero-header-master.png';","headerImg.src='assets/HeroV3/hero-header-master.png?v=f337cee670ec5154835b7a3ff528ccc67afe78ac';",1)

insert_after="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
assert insert_after in s
new_fn="\nfunction drawLockedHeroHeaderContract(ctx){if(!(headerImg.complete&&headerImg.naturalWidth))return;ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,209);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(headerImg,0,0,1080,209);ctx.restore()}"
s=s.replace(insert_after,insert_after+new_fn,1)

old="drawAthleteMainExactStage(ctx);drawCoverBand(ctx);"
new="drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);"
assert old in s
s=s.replace(old,new,1)

s=s.replace("20260815-regatta-results-story-v14-exact-athlete-main-asset-url","20260815-regatta-results-story-v15-locked-header-contract")
s=s.replace("REGATTA RESULTS STORY — BUILD v14","REGATTA RESULTS STORY — BUILD v15")
s=s.replace("Regatta Results Story — BUILD v14","Regatta Results Story — BUILD v15")
s=s.replace("Exact Athlete Main asset URL + native single draw • results panel unchanged","Frozen Hero V3 header contract 1080 × 209 • results panel unchanged")

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);" in cover
assert "ctx.drawImage(headerImg,0,0,1080,209)" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v15 frozen header contract')
# workflow trigger
