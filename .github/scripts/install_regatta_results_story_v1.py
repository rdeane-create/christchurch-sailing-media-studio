from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v4-exact-header-photo-controls" in s
assert "REGATTA RESULTS STORY — BUILD v4" in s

s=s.replace("20260815-regatta-results-story-v4-exact-header-photo-controls","20260815-regatta-results-story-v5-approved-overlay-full-diagonal")
s=s.replace("REGATTA RESULTS STORY — BUILD v4","REGATTA RESULTS STORY — BUILD v5")
s=s.replace("Regatta Results Story — BUILD v4","Regatta Results Story — BUILD v5")
s=s.replace("Exact approved header • adjustable cover photo • diagonal results panel","Approved Main header + fade • adjustable cover photo • full-height diagonal results panel")

needle="const headerImg=new Image();headerImg.src='assets/HeroV3/hero-header-master.png';"
replacement=needle+"\nconst approvedMainOverlay=new Image();approvedMainOverlay.onload=()=>draw();approvedMainOverlay.src='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp';"
assert needle in s
s=s.replace(needle,replacement,1)

insert_after="function diagonalBand(ctx,y1,y2){ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(350,y2);ctx.lineTo(W,y1);ctx.lineTo(W,H-210);ctx.lineTo(570,H-210);ctx.closePath();ctx.fill();ctx.fillStyle=ORANGE;ctx.beginPath();ctx.moveTo(332,y2-18);ctx.lineTo(W,y1-18);ctx.lineTo(W,y1+34);ctx.lineTo(366,y2+34);ctx.closePath();ctx.fill();ctx.fillStyle=WHITE;ctx.beginPath();ctx.moveTo(342,y2-7);ctx.lineTo(W,y1-7);ctx.lineTo(W,y1+2);ctx.lineTo(350,y2+2);ctx.closePath();ctx.fill()}"
cover_band="function drawCoverBand(ctx,y1,y2){ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(350,y2);ctx.lineTo(W,y1);ctx.lineTo(W,H);ctx.lineTo(570,H);ctx.closePath();ctx.fill();ctx.fillStyle=ORANGE;ctx.beginPath();ctx.moveTo(332,y2-18);ctx.lineTo(W,y1-18);ctx.lineTo(W,y1+34);ctx.lineTo(366,y2+34);ctx.closePath();ctx.fill();ctx.fillStyle=WHITE;ctx.beginPath();ctx.moveTo(342,y2-7);ctx.lineTo(W,y1-7);ctx.lineTo(W,y1+2);ctx.lineTo(350,y2+2);ctx.closePath();ctx.fill();ctx.strokeStyle=ORANGE;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(350,y2);ctx.lineTo(570,H);ctx.stroke()}\nfunction drawApprovedMainHeaderFade(ctx){if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.drawImage(approvedMainOverlay,0,0,1080,430,0,0,1080,430)}}"
assert insert_after in s
s=s.replace(insert_after,insert_after+'\n'+cover_band,1)

start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){',start)
new_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);const px=0,py=0,pw=1080,ph=1495;ctx.fillStyle='#e8edf2';ctx.fillRect(px,py,pw,ph);if(coverPhoto){drawAdjustableCover(ctx,coverPhoto,px,py,pw,ph)}else{ctx.strokeStyle='#b8c4d0';ctx.lineWidth=3;ctx.setLineDash([18,14]);ctx.strokeRect(34,245,1012,1215);ctx.setLineDash([]);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',W/2,820);ctx.font='400 27px Arial';ctx.fillText('Use Cover photo controls in Studio',W/2,868);ctx.textAlign='left'}drawApprovedMainHeaderFade(ctx);drawCoverBand(ctx,1010,1485);ctx.fillStyle=WHITE;ctx.font='800 25px Arial';ctx.fillText('REGATTA RESULTS',600,1212);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,430,54,30)}px Arial`;ctx.fillText(en,600,1285);ctx.fillStyle='#d7e2ed';ctx.font='500 24px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',600,1330);ctx.fillStyle=ORANGE;ctx.fillRect(600,1360,108,7);ctx.fillStyle='#a9bfd5';ctx.font='800 21px Arial';ctx.fillText('OVERALL FINISH',600,1415);ctx.fillStyle=WHITE;ctx.font='900 82px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,600,1500);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),400,34,24)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),600,1542);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=600+i*135;ctx.fillStyle=NAVY2;rounded(ctx,sx,1580,118,105,13);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 18px Arial';ctx.fillText(v[0],sx+14,1612);ctx.fillStyle=WHITE;ctx.font='900 34px Arial';ctx.fillText(v[1]||'—',sx+14,1660)})}"
s=s[:start]+new_cover+s[end:]

p.write_text(s)
assert "ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp" in s
assert "function drawApprovedMainHeaderFade" in s
assert "function drawCoverBand" in s
assert "ctx.lineTo(W,H);ctx.lineTo(570,H)" in s
assert "REGATTA RESULTS STORY — BUILD v5" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "footer(ctx" not in cover
print('Prepared Regatta Results Story v5')
