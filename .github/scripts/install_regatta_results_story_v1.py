from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v9-exact-athlete-main-renderer-copy" in s
assert "REGATTA RESULTS STORY — BUILD v9" in s

s=s.replace("20260815-regatta-results-story-v9-exact-athlete-main-renderer-copy","20260815-regatta-results-story-v10-untouched-athlete-main-stage")
s=s.replace("REGATTA RESULTS STORY — BUILD v9","REGATTA RESULTS STORY — BUILD v10")
s=s.replace("Regatta Results Story — BUILD v9","Regatta Results Story — BUILD v10")
s=s.replace("Exact Athlete Main renderer copy • identical 1080 × 1350 brand stage • results below","Exact Athlete Main 1080 × 1350 stage • untouched brand/fade • results begin below")

old_stage="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
new_stage="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
assert old_stage in s
s=s.replace(old_stage,new_stage)

start=s.index('function drawCoverBand(ctx){')
end=s.index('\nfunction drawAthleteMainBrandOverlay',start)
new_band="function drawCoverBand(ctx){const leftY=1392,rightY=1372;ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(0,leftY);ctx.bezierCurveTo(320,1392,760,1376,W,rightY);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();ctx.strokeStyle=ORANGE;ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,leftY);ctx.bezierCurveTo(320,1392,760,1376,W+8,rightY);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.96)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,leftY-14);ctx.bezierCurveTo(320,1378,760,1362,W+8,rightY-14);ctx.stroke()}"
s=s[:start]+new_band+s[end:]

p.write_text(s)

assert "20260815-regatta-results-story-v10-untouched-athlete-main-stage" in s
assert "REGATTA RESULTS STORY — BUILD v10" in s
assert "function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}" in s
assert "ADD REGATTA PHOTO" not in s
assert "const leftY=1392,rightY=1372" in s
assert "rightY-14" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawCoverBand(ctx)" in cover
print('Prepared Regatta Results Story v10 untouched Athlete Main stage')
