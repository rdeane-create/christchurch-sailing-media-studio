from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v6-native-overlay-broad-diagonal" in s
assert "REGATTA RESULTS STORY — BUILD v6" in s

s=s.replace("20260815-regatta-results-story-v6-native-overlay-broad-diagonal","20260815-regatta-results-story-v7-native-header-full-photo-curved-panel")
s=s.replace("REGATTA RESULTS STORY — BUILD v6","REGATTA RESULTS STORY — BUILD v7")
s=s.replace("Regatta Results Story — BUILD v6","Regatta Results Story — BUILD v7")
s=s.replace("Native approved Main header + fade • adjustable cover photo • broad full-height diagonal results panel","Approved Main header • full middle photo • clean curved full-width results panel")

start=s.index('function drawCoverBand(ctx){')
end=s.index('\nfunction drawApprovedMainHeaderFade',start)
new_band="function drawCoverBand(ctx){const leftY=1370,rightY=1185;ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(0,leftY);ctx.bezierCurveTo(300,1360,760,1250,W,rightY);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();ctx.strokeStyle=ORANGE;ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,leftY);ctx.bezierCurveTo(300,1360,760,1250,W+8,rightY);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,leftY-14);ctx.bezierCurveTo(300,1346,760,1236,W+8,rightY-14);ctx.stroke()}"
s=s[:start]+new_band+s[end:]

start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){',start)
new_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);if(coverPhoto){drawAdjustableCover(ctx,coverPhoto,0,0,W,H)}else{ctx.fillStyle='#e8edf2';ctx.fillRect(0,0,W,1370);ctx.strokeStyle='#b8c4d0';ctx.lineWidth=3;ctx.setLineDash([18,14]);ctx.strokeRect(0,209,W,1161);ctx.setLineDash([]);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',W/2,790);ctx.font='400 27px Arial';ctx.fillText('Photo fills the full middle area',W/2,838);ctx.textAlign='left'}drawApprovedMainHeaderFade(ctx);drawCoverBand(ctx);ctx.fillStyle=WHITE;ctx.font='800 26px Arial';ctx.fillText('REGATTA RESULTS',82,1452);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,760,62,32)}px Arial`;ctx.fillText(en,82,1528);ctx.fillStyle='#d7e2ed';ctx.font='500 27px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',82,1574);ctx.fillStyle=ORANGE;ctx.fillRect(82,1608,122,8);ctx.fillStyle='#a9bfd5';ctx.font='800 22px Arial';ctx.fillText('OVERALL FINISH',82,1660);ctx.fillStyle=WHITE;ctx.font='900 96px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,82,1750);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),500,40,26)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),82,1794);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=600+i*138;ctx.fillStyle=NAVY2;rounded(ctx,sx,1642,122,120,14);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 18px Arial';ctx.fillText(v[0],sx+15,1678);ctx.fillStyle=WHITE;ctx.font='900 37px Arial';ctx.fillText(v[1]||'—',sx+15,1732)})}"
s=s[:start]+new_cover+s[end:]

p.write_text(s)
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
assert "ctx.bezierCurveTo(300,1360,760,1250,W,rightY)" in s
assert "ctx.lineTo(W,H);ctx.lineTo(0,H)" in s
assert "drawAdjustableCover(ctx,coverPhoto,0,0,W,H)" in s
assert "REGATTA RESULTS STORY — BUILD v7" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "footer(ctx" not in cover
assert "ctx.lineTo(430,H)" not in cover
print('Prepared Regatta Results Story v7')
