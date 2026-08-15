from pathlib import Path
p=Path('regatta-results-story.js')
s=p.read_text()

s=s.replace("const VERSION='20260815-regatta-results-story-v21-vertical-header-stretch';","const VERSION='20260815-regatta-results-story-v23-protected-header-photo';")
s=s.replace("const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v21';","const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v23';")

old="function drawAthleteMainExactPhoto(ctx,img){if(!img)return;const stageW=1080,stageH=1350,base=Math.max(stageW/img.width,stageH/img.height),sc=base*state.coverScale,dw=img.width*sc,dh=img.height*sc;ctx.save();ctx.beginPath();ctx.rect(0,0,stageW,stageH);ctx.clip();ctx.globalAlpha=state.coverOpacity;ctx.drawImage(img,(stageW-dw)/2+state.coverX,(stageH-dh)/2+state.coverY,dw,dh);ctx.restore()}"
new="function drawAthleteMainExactPhoto(ctx,img){if(!img)return;const stageW=1080,stageH=1350,brandH=270,photoH=stageH-brandH,base=Math.max(stageW/img.width,photoH/img.height),sc=base*state.coverScale,dw=img.width*sc,dh=img.height*sc;ctx.save();ctx.beginPath();ctx.rect(0,brandH,stageW,photoH);ctx.clip();ctx.globalAlpha=state.coverOpacity;ctx.drawImage(img,(stageW-dw)/2+state.coverX,brandH+(photoH-dh)/2+state.coverY,dw,dh);ctx.restore()}"
assert old in s
s=s.replace(old,new)

old2="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350)}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);if(!coverPhoto){ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}ctx.restore()}"
new2="function drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,270);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{const g=ctx.createLinearGradient(0,270,0,1350);g.addColorStop(0,'#f5f7f9');g.addColorStop(.36,'#d9dee4');g.addColorStop(.70,'#7f8fa0');g.addColorStop(1,'#15344f');ctx.fillStyle=g;ctx.fillRect(0,270,1080,1080)}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);if(!coverPhoto){ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}ctx.restore()}"
assert old2 in s
s=s.replace(old2,new2)

p.write_text(s)
print('Installed v23 protected header/photo region')
