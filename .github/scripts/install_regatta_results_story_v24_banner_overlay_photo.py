from pathlib import Path

p = Path('regatta-results-story.js')
s = p.read_text()

s = s.replace("const VERSION='20260815-regatta-results-story-v22-final-header-fade';", "const VERSION='20260815-regatta-results-story-v24-banner-over-photo';")
s = s.replace("const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v22';", "const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v24';")

old_stage = "function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350)}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);if(!coverPhoto){ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}ctx.restore()}"
new_stage = "function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto){drawAthleteMainExactPhoto(ctx,coverPhoto)}else{const g=ctx.createLinearGradient(0,270,0,1350);g.addColorStop(0,'#ffffff');g.addColorStop(.32,'#f4f6f8');g.addColorStop(.58,'#cfd6dd');g.addColorStop(.78,'#7f8f9f');g.addColorStop(1,'#163b60');ctx.fillStyle=g;ctx.fillRect(0,270,1080,1080);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Photo fills the full stage behind the banner',540,838);ctx.textAlign='left'}ctx.restore()}"
if old_stage not in s:
    raise SystemExit('Could not find v22 stage function')
s = s.replace(old_stage, new_stage)

old_fade = "function drawFadeBridge(ctx){ctx.save();const g=ctx.createLinearGradient(0,900,0,1390);g.addColorStop(0,'rgba(6,41,90,0)');g.addColorStop(.52,'rgba(6,41,90,.08)');g.addColorStop(.82,'rgba(6,41,90,.42)');g.addColorStop(1,'rgba(6,41,90,.92)');ctx.fillStyle=g;ctx.fillRect(0,900,W,490);ctx.restore()}"
new_fade = "function drawFadeBridge(ctx){ctx.save();const start=coverPhoto?650:760;const g=ctx.createLinearGradient(0,start,0,1390);g.addColorStop(0,'rgba(6,41,90,0)');g.addColorStop(.30,'rgba(6,41,90,.06)');g.addColorStop(.58,'rgba(6,41,90,.22)');g.addColorStop(.80,'rgba(6,41,90,.55)');g.addColorStop(1,'rgba(6,41,90,.96)');ctx.fillStyle=g;ctx.fillRect(0,start,W,1390-start);ctx.restore()}"
if old_fade not in s:
    raise SystemExit('Could not find v22 fade function')
s = s.replace(old_fade, new_fade)

old_cover_start = "function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainExactStage(ctx);drawFinalHeader(ctx);drawFadeBridge(ctx);drawCoverBand(ctx);"
new_cover_start = "function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainExactStage(ctx);drawFadeBridge(ctx);drawCoverBand(ctx);drawFinalHeader(ctx);"
if old_cover_start not in s:
    raise SystemExit('Could not find v22 cover render order')
s = s.replace(old_cover_start, new_cover_start)

p.write_text(s)
print('Installed Regatta Results v24: photo may sit behind banner; banner always drawn last; fade corrected.')
