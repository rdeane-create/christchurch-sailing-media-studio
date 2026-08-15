from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v17-fill-header-no-distortion" in s
assert "REGATTA RESULTS STORY — BUILD v17" in s
assert "const leftY=1370,rightY=1185" in s

# Remove the separate derived Hero header from the cover. The Athlete Main overlay
# already contains the approved crest/wordmark at the correct native proportions.
old_cover="drawAthleteMainExactStage(ctx);drawLockedHeroHeaderContract(ctx);drawCoverBand(ctx);"
new_cover="drawAthleteMainExactStage(ctx);drawCoverBand(ctx);"
assert old_cover in s
s=s.replace(old_cover,new_cover,1)

# Match Athlete Main's white base under the locked overlay in the empty-photo state.
old_empty="else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
new_empty="else{ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350)}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);if(!coverPhoto){ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}ctx.restore()}"
assert old_empty in s
s=s.replace(old_empty,new_empty,1)

s=s.replace("20260815-regatta-results-story-v17-fill-header-no-distortion","20260815-regatta-results-story-v18-exact-athlete-header")
s=s.replace("REGATTA RESULTS STORY — BUILD v17","REGATTA RESULTS STORY — BUILD v18")
s=s.replace("Regatta Results Story — BUILD v17","Regatta Results Story — BUILD v18")
s=s.replace("Uniform 1080-wide header crop • no distortion • results panel unchanged","Exact Athlete Main header pixels • no derived header scaling • results panel unchanged")

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawCoverBand(ctx);" in cover
assert "drawLockedHeroHeaderContract(ctx)" not in cover
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v18 exact Athlete Main header pixels')
