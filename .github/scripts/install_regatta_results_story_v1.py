from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v8-athlete-main-brand-lock" in s
assert "REGATTA RESULTS STORY — BUILD v8" in s

s=s.replace("20260815-regatta-results-story-v8-athlete-main-brand-lock","20260815-regatta-results-story-v9-exact-athlete-main-renderer-copy")
s=s.replace("REGATTA RESULTS STORY — BUILD v8","REGATTA RESULTS STORY — BUILD v9")
s=s.replace("Regatta Results Story — BUILD v8","Regatta Results Story — BUILD v9")
s=s.replace("Athlete Main Headshot brand lock • exact logo/banner/fade • full middle photo","Exact Athlete Main renderer copy • identical 1080 × 1350 brand stage • results below")

# Copy the approved Athlete Main photo-stage geometry exactly: 1080 x 1350,
# cover-fit photo, then the locked overlay at 0,0,1080,1350.
insert_after="function drawAdjustableCover(ctx,img,x,y,w,h){if(!img)return;const base=Math.max(w/img.width,h/img.height),scale=base*state.coverScale,dw=img.width*scale,dh=img.height*scale,dx=x+(w-dw)/2+state.coverX,dy=y+(h-dh)/2+state.coverY;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=state.coverOpacity;ctx.drawImage(img,dx,dy,dw,dh);ctx.restore()}"
assert insert_after in s
exact_copy="\nfunction drawAthleteMainExactPhoto(ctx,img){if(!img)return;const stageW=1080,stageH=1350,base=Math.max(stageW/img.width,stageH/img.height),sc=base*state.coverScale,dw=img.width*sc,dh=img.height*sc;ctx.save();ctx.beginPath();ctx.rect(0,0,stageW,stageH);ctx.clip();ctx.globalAlpha=state.coverOpacity;ctx.drawImage(img,(stageW-dw)/2+state.coverX,(stageH-dh)/2+state.coverY,dw,dh);ctx.restore()}\nfunction drawAthleteMainExactStage(ctx){ctx.save();ctx.fillStyle=WHITE;ctx.fillRect(0,0,1080,1350);if(coverPhoto)drawAthleteMainExactPhoto(ctx,coverPhoto);else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',540,790);ctx.font='400 27px Arial';ctx.fillText('Athlete Main exact 1080 × 1350 photo stage',540,838);ctx.textAlign='left'}if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth)ctx.drawImage(approvedMainOverlay,0,0,1080,1350);ctx.restore()}"
s=s.replace(insert_after,insert_after+exact_copy)

start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){',start)
old_cover=s[start:end]
assert 'drawAthleteMainBrandOverlay(ctx)' in old_cover
new_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainExactStage(ctx);drawCoverBand(ctx);ctx.fillStyle=WHITE;ctx.font='800 26px Arial';ctx.fillText('REGATTA RESULTS',82,1452);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,760,62,32)}px Arial`;ctx.fillText(en,82,1528);ctx.fillStyle='#d7e2ed';ctx.font='500 27px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',82,1574);ctx.fillStyle=ORANGE;ctx.fillRect(82,1608,122,8);ctx.fillStyle='#a9bfd5';ctx.font='800 22px Arial';ctx.fillText('OVERALL FINISH',82,1660);ctx.fillStyle=WHITE;ctx.font='900 96px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,82,1750);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),500,40,26)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),82,1794);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=600+i*138;ctx.fillStyle=NAVY2;rounded(ctx,sx,1642,122,120,14);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 18px Arial';ctx.fillText(v[0],sx+15,1678);ctx.fillStyle=WHITE;ctx.font='900 37px Arial';ctx.fillText(v[1]||'—',sx+15,1732)})}"
s=s[:start]+new_cover+s[end:]

p.write_text(s)
assert "20260815-regatta-results-story-v9-exact-athlete-main-renderer-copy" in s
assert "REGATTA RESULTS STORY — BUILD v9" in s
assert "function drawAthleteMainExactPhoto(ctx,img)" in s
assert "const stageW=1080,stageH=1350,base=Math.max(stageW/img.width,stageH/img.height)" in s
assert "ctx.drawImage(img,(stageW-dw)/2+state.coverX,(stageH-dh)/2+state.coverY,dw,dh)" in s
assert "function drawAthleteMainExactStage(ctx)" in s
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawCoverBand(ctx)" in cover
assert "drawAdjustableCover(ctx,coverPhoto,0,0,W,H)" not in cover
print('Prepared Regatta Results Story v9 exact Athlete Main renderer copy')
