from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v5-approved-overlay-full-diagonal" in s
assert "REGATTA RESULTS STORY — BUILD v5" in s

s=s.replace("20260815-regatta-results-story-v5-approved-overlay-full-diagonal","20260815-regatta-results-story-v6-native-overlay-broad-diagonal")
s=s.replace("REGATTA RESULTS STORY — BUILD v5","REGATTA RESULTS STORY — BUILD v6")
s=s.replace("Regatta Results Story — BUILD v5","Regatta Results Story — BUILD v6")
s=s.replace("Approved Main header + fade • adjustable cover photo • full-height diagonal results panel","Native approved Main header + fade • adjustable cover photo • broad full-height diagonal results panel")

old="function drawApprovedMainHeaderFade(ctx){if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.drawImage(approvedMainOverlay,0,0,1080,430,0,0,1080,430)}}"
new="function drawApprovedMainHeaderFade(ctx){if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.drawImage(approvedMainOverlay,0,0,1080,1350)}}"
assert old in s
s=s.replace(old,new,1)

start=s.index('function drawCoverBand(ctx,y1,y2){')
end=s.index('\nfunction drawApprovedMainHeaderFade',start)
new_band="function drawCoverBand(ctx){ctx.fillStyle=NAVY;ctx.beginPath();ctx.moveTo(0,1490);ctx.lineTo(W,1010);ctx.lineTo(W,H);ctx.lineTo(430,H);ctx.closePath();ctx.fill();ctx.strokeStyle=ORANGE;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(0,1490);ctx.lineTo(W,1010);ctx.stroke();ctx.strokeStyle=WHITE;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(12,1476);ctx.lineTo(W,998);ctx.stroke();ctx.strokeStyle=ORANGE;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(0,1490);ctx.lineTo(430,H);ctx.stroke()}"
s=s[:start]+new_band+s[end:]

start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){',start)
new_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);const px=0,py=0,pw=1080,ph=1920;ctx.fillStyle='#e8edf2';ctx.fillRect(px,py,pw,ph);if(coverPhoto){drawAdjustableCover(ctx,coverPhoto,px,py,pw,ph)}else{ctx.strokeStyle='#b8c4d0';ctx.lineWidth=3;ctx.setLineDash([18,14]);ctx.strokeRect(34,245,1012,1160);ctx.setLineDash([]);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',W/2,820);ctx.font='400 27px Arial';ctx.fillText('Use Cover photo controls in Studio',W/2,868);ctx.textAlign='left'}drawApprovedMainHeaderFade(ctx);drawCoverBand(ctx);ctx.fillStyle=WHITE;ctx.font='800 25px Arial';ctx.fillText('REGATTA RESULTS',610,1215);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,410,54,30)}px Arial`;ctx.fillText(en,610,1288);ctx.fillStyle='#d7e2ed';ctx.font='500 24px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',610,1332);ctx.fillStyle=ORANGE;ctx.fillRect(610,1362,108,7);ctx.fillStyle='#a9bfd5';ctx.font='800 21px Arial';ctx.fillText('OVERALL FINISH',610,1420);ctx.fillStyle=WHITE;ctx.font='900 82px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,610,1505);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),390,34,24)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),610,1548);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=610+i*132;ctx.fillStyle=NAVY2;rounded(ctx,sx,1588,114,105,13);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 18px Arial';ctx.fillText(v[0],sx+14,1620);ctx.fillStyle=WHITE;ctx.font='900 34px Arial';ctx.fillText(v[1]||'—',sx+14,1668)})}"
s=s[:start]+new_cover+s[end:]

p.write_text(s)
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
assert "ctx.moveTo(0,1490);ctx.lineTo(W,1010)" in s
assert "ctx.lineTo(430,H)" in s
assert "drawCoverBand(ctx)" in s
assert "REGATTA RESULTS STORY — BUILD v6" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "footer(ctx" not in cover
print('Prepared Regatta Results Story v6')
