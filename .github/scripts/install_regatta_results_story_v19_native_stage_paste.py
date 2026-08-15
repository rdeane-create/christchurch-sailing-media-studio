from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "REGATTA RESULTS STORY — BUILD v18" in s
assert "20260815-regatta-results-story-v18-exact-athlete-header" in s
assert "const leftY=1370,rightY=1185" in s

old_fn="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
new_fn="function buildAthleteMainNativeStage(){const stage=document.createElement('canvas');stage.width=1080;stage.height=1350;const sctx=stage.getContext('2d');sctx.fillStyle=WHITE;sctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(sctx,coverPhoto);else{ sctx.fillStyle='#e8edf2';sctx.fillRect(0,0,1080,1350);sctx.fillStyle='#718396';sctx.textAlign='center';sctx.font='800 36px Arial';sctx.fillText('ADD REGATTA PHOTO',540,790);sctx.font='400 27px Arial';sctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);sctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)sctx.drawImage(approvedMainOverlay,0,0);return stage}\nfunction drawAthleteMainExactStage(ctx){const athleteStage=buildAthleteMainNativeStage();ctx.drawImage(athleteStage,0,0)}"
assert old_fn in s
s=s.replace(old_fn,new_fn,1)

s=s.replace("20260815-regatta-results-story-v18-exact-athlete-header","20260815-regatta-results-story-v19-native-stage-paste")
s=s.replace("REGATTA RESULTS STORY — BUILD v18","REGATTA RESULTS STORY — BUILD v19")
s=s.replace("Regatta Results Story — BUILD v18","Regatta Results Story — BUILD v19")
s=s.replace("Approved master header fills width • aspect preserved • results panel unchanged","Athlete Main stage pasted 1:1 native pixels • no destination sizing • results panel unchanged")
s=s.replace("Exact Athlete Main header pixels • results panel unchanged","Athlete Main stage pasted 1:1 native pixels • no destination sizing • results panel unchanged")

assert "stage.width=1080;stage.height=1350" in s
assert "sctx.drawImage(approvedMainOverlay,0,0)" in s
assert "ctx.drawImage(athleteStage,0,0)" in s
assert "ctx.drawImage(athleteStage,0,0," not in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v19 native 1:1 Athlete stage paste')
