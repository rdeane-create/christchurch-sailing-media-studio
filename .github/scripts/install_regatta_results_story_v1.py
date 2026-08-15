from pathlib import Path

idx=Path('index.html')
s=idx.read_text()
marker='<script src="regatta-results-story.js?v=20260815-v1"></script>'
if marker not in s:
    s=s.replace('</body>',f'  {marker}\n</body>',1)
    idx.write_text(s)

p=Path('regatta-results-story.js')
s=p.read_text()
s=s.replace("20260815-regatta-results-story-v2-original-concept","20260815-regatta-results-story-v3-photo-blue-panel")
s=s.replace("REGATTA RESULTS STORY — BUILD v2","REGATTA RESULTS STORY — BUILD v3")
a=s.index('function drawCover(ctx){')
b=s.index('\nfunction drawScore(ctx){',a)
fn="function drawCover(ctx){brand(ctx);const x=70,y=292,w=940,h=790;ctx.fillStyle='#e9eef3';rounded(ctx,x,y,w,h,22);ctx.fill();const hero=mediaItems[0]&&mediaItems[0].img;if(hero){ctx.save();rounded(ctx,x,y,w,h,22);ctx.clip();coverImage(ctx,hero,x,y,w,h);ctx.restore()}else{ctx.strokeStyle='#b7c3cf';ctx.lineWidth=3;ctx.setLineDash([16,12]);rounded(ctx,x+24,y+24,w-48,h-48,18);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 34px Arial';ctx.fillText('ADD REGATTA PHOTO',W/2,675);ctx.font='400 26px Arial';ctx.fillText('Use Optional photos/video below',W/2,720);ctx.textAlign='left'}const by=1110;ctx.fillStyle=NAVY;ctx.fillRect(0,by,W,625);ctx.fillStyle=ORANGE;ctx.fillRect(0,by,12,625);ctx.fillStyle=WHITE;ctx.font='800 28px Arial';ctx.fillText('REGATTA RESULTS',70,1185);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,760,72,40)}px Arial`;ctx.fillText(en,70,1275);ctx.fillStyle='#d6e1ed';ctx.font='500 29px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',70,1328);ctx.fillStyle=ORANGE;ctx.fillRect(70,1362,120,7);ctx.fillStyle='#adc0d5';ctx.font='800 24px Arial';ctx.fillText('OVERALL FINISH',70,1435);ctx.fillStyle=WHITE;ctx.font='900 108px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,70,1542);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),470,44,28)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),70,1602);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=620+i*138;ctx.fillStyle=NAVY2;rounded(ctx,sx,1410,118,180,16);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 21px Arial';ctx.fillText(v[0],sx+18,1454);ctx.fillStyle=WHITE;ctx.font='900 42px Arial';ctx.fillText(v[1]||'—',sx+18,1530)});footer(ctx,'EVENT RECAP • COVER')}"
s=s[:a]+fn+s[b:]
p.write_text(s)
assert 'ADD REGATTA PHOTO' in s
