from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v10-untouched-athlete-main-stage" in s
assert "REGATTA RESULTS STORY — BUILD v10" in s

s=s.replace("20260815-regatta-results-story-v10-untouched-athlete-main-stage","20260815-regatta-results-story-v11-top-brand-only")
s=s.replace("REGATTA RESULTS STORY — BUILD v10","REGATTA RESULTS STORY — BUILD v11")
s=s.replace("Regatta Results Story — BUILD v10","Regatta Results Story — BUILD v11")
s=s.replace("Exact Athlete Main 1080 × 1350 stage • untouched brand/fade • results begin below","Athlete Main exact top brand • v9 results panel restored unchanged")

# Restore the exact v9 empty-photo stage. This undoes the non-header v10 change.
old_stage="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
new_stage="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
assert old_stage in s
s=s.replace(old_stage,new_stage)

# Restore the exact v9 curved results panel geometry. Do not redesign the bottom.
start=s.index('function drawCoverBand(ctx){')
end=s.index('\nfunction drawAthleteMainBrandOverlay',start)
old_band=s[start:end]
assert 'leftY=1392,rightY=1372' in old_band
v9_band="function drawCoverBand(ctx){const leftY=1370,rightY=1185;ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(0,leftY);ctx.bezierCurveTo(300,1360,760,1250,W,rightY);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();ctx.strokeStyle=ORANGE;ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,leftY);ctx.bezierCurveTo(300,1360,760,1250,W+8,rightY);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,leftY-14);ctx.bezierCurveTo(300,1346,760,1236,W+8,rightY-14);ctx.stroke()}"
s=s[:start]+v9_band+s[end:]

p.write_text(s)

assert "20260815-regatta-results-story-v11-top-brand-only" in s
assert "REGATTA RESULTS STORY — BUILD v11" in s
assert "ADD REGATTA PHOTO" in s
assert "const leftY=1370,rightY=1185" in s
assert "ctx.bezierCurveTo(300,1360,760,1250,W,rightY)" in s
assert "ctx.bezierCurveTo(300,1346,760,1236,W+8,rightY-14)" in s
assert "ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp" in s
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
print('Prepared Regatta Results Story v11: v9 panel restored; top brand only')
