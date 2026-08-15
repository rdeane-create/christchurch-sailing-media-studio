from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

s=s.replace("20260815-regatta-results-story-v3-photo-blue-panel","20260815-regatta-results-story-v4-exact-header-photo-controls")
s=s.replace("REGATTA RESULTS STORY — BUILD v3","REGATTA RESULTS STORY — BUILD v4")
s=s.replace("Regatta Results Story — BUILD v2","Regatta Results Story — BUILD v4")
s=s.replace("Original graphic concept • 9:16 Story progression","Exact approved header • adjustable cover photo • diagonal results panel")
s=s.replace("let scoreImage=null,mediaItems=[];","let scoreImage=null,coverPhoto=null,mediaItems=[];")
s=s.replace("let state={scene:'cover',eventName:'Regatta Results',date:'',location:'',place:'8',team:'Seahorses One',a:'143',b:'170',total:'313',events:[{name:'Next Event',date:'',location:''}]};","let state={scene:'cover',eventName:'Regatta Results',date:'',location:'',place:'8',team:'Seahorses One',a:'143',b:'170',total:'313',coverScale:1,coverX:0,coverY:0,coverOpacity:1,events:[{name:'Next Event',date:'',location:''}]};")

old_brand="function brand(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);ctx.strokeStyle='#e4e9ee';ctx.lineWidth=2;for(let x=-160;x<480;x+=120){ctx.beginPath();ctx.moveTo(x,190);ctx.lineTo(x+560,1190);ctx.stroke()}ctx.globalAlpha=.05;ctx.fillStyle=NAVY;ctx.font='900 230px Arial';ctx.save();ctx.translate(1020,1200);ctx.rotate(-Math.PI/2);ctx.fillText('SAILING',0,0);ctx.restore();ctx.globalAlpha=1;if(headerImg.complete&&headerImg.naturalWidth){ctx.drawImage(headerImg,70,52,940,205)}else{ctx.fillStyle=NAVY;ctx.font='900 58px Arial';ctx.fillText('CHRISTCHURCH',238,108);ctx.fillStyle=ORANGE;ctx.font='800 34px Arial';ctx.fillText('SAILING',430,155)} }"
new_brand="function brand(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);if(headerImg.complete&&headerImg.naturalWidth){ctx.drawImage(headerImg,0,0,1080,209)}else{ctx.fillStyle=NAVY;ctx.font='900 58px Arial';ctx.fillText('CHRISTCHURCH',210,95);ctx.fillStyle=ORANGE;ctx.font='800 34px Arial';ctx.fillText('SAILING',430,145)}}"
assert old_brand in s
s=s.replace(old_brand,new_brand)

needle="function coverImage(ctx,img,x,y,w,h){if(!img)return;const ir=img.width/img.height,br=w/h;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>br){sw=img.height*br;sx=(img.width-sw)/2}else{sh=img.width/br;sy=(img.height-sh)/2}ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}"
photo_fn="function drawAdjustableCover(ctx,img,x,y,w,h){if(!img)return;const base=Math.max(w/img.width,h/img.height),scale=base*state.coverScale,dw=img.width*scale,dh=img.height*scale,dx=x+(w-dw)/2+state.coverX,dy=y+(h-dh)/2+state.coverY;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=state.coverOpacity;ctx.drawImage(img,dx,dy,dw,dh);ctx.restore()}"
assert needle in s
s=s.replace(needle,needle+'\n'+photo_fn)

start=s.index('function drawCover(ctx){')
end=s.index('\nfunction drawScore(ctx){',start)
new_cover="function drawCover(ctx){brand(ctx);const px=0,py=209,pw=1080,ph=1290;ctx.fillStyle='#e8edf2';ctx.fillRect(px,py,pw,ph);if(coverPhoto){drawAdjustableCover(ctx,coverPhoto,px,py,pw,ph)}else{ctx.strokeStyle='#b8c4d0';ctx.lineWidth=3;ctx.setLineDash([18,14]);ctx.strokeRect(34,245,1012,1215);ctx.setLineDash([]);ctx.fillStyle='#718396';ctx.textAlign='center';ctx.font='800 36px Arial';ctx.fillText('ADD REGATTA PHOTO',W/2,820);ctx.font='400 27px Arial';ctx.fillText('Use Cover photo controls in Studio',W/2,868);ctx.textAlign='left'}diagonalBand(ctx,1010,1485);ctx.fillStyle=WHITE;ctx.font='800 25px Arial';ctx.fillText('REGATTA RESULTS',600,1212);const en=(state.eventName||'Regatta Results').toUpperCase();ctx.font=`900 ${fit(ctx,en,430,54,30)}px Arial`;ctx.fillText(en,600,1285);ctx.fillStyle='#d7e2ed';ctx.font='500 24px Arial';ctx.fillText([state.location,state.date].filter(Boolean).join(' • ')||'Event details',600,1330);ctx.fillStyle=ORANGE;ctx.fillRect(600,1360,108,7);ctx.fillStyle='#a9bfd5';ctx.font='800 21px Arial';ctx.fillText('OVERALL FINISH',600,1415);ctx.fillStyle=WHITE;ctx.font='900 82px Arial';ctx.fillText(`${state.place}${ordinal(state.place)}`,600,1500);ctx.fillStyle=ORANGE;ctx.font=`900 ${fit(ctx,(state.team||'Seahorses One').toUpperCase(),400,34,24)}px Arial`;ctx.fillText((state.team||'Seahorses One').toUpperCase(),600,1542);[['A',state.a],['B',state.b],['TOTAL',state.total]].forEach((v,i)=>{const sx=600+i*135;ctx.fillStyle=NAVY2;rounded(ctx,sx,1580,118,105,13);ctx.fill();ctx.fillStyle='#a9bdd3';ctx.font='800 18px Arial';ctx.fillText(v[0],sx+14,1612);ctx.fillStyle=WHITE;ctx.font='900 34px Arial';ctx.fillText(v[1]||'—',sx+14,1660)});footer(ctx,'EVENT RECAP • COVER')}"
s=s[:start]+new_cover+s[end:]

old_sync="function sync(){state.eventName=q('rrsEvent')?.value||'Regatta Results';state.date=q('rrsDate')?.value||'';state.location=q('rrsLocation')?.value||'';state.place=q('rrsPlace')?.value||'';state.team=q('rrsTeam')?.value||'';state.a=q('rrsA')?.value||'';state.b=q('rrsB')?.value||'';state.total=q('rrsTotal')?.value||'';state.events=[0,1,2,3].map(i=>({name:q('rrsNextName'+i)?.value||'',date:q('rrsNextDate'+i)?.value||'',location:q('rrsNextLocation'+i)?.value||''}));draw()}"
new_sync="function sync(){state.eventName=q('rrsEvent')?.value||'Regatta Results';state.date=q('rrsDate')?.value||'';state.location=q('rrsLocation')?.value||'';state.place=q('rrsPlace')?.value||'';state.team=q('rrsTeam')?.value||'';state.a=q('rrsA')?.value||'';state.b=q('rrsB')?.value||'';state.total=q('rrsTotal')?.value||'';state.coverScale=(parseFloat(q('rrsCoverScale')?.value)||100)/100;state.coverX=parseFloat(q('rrsCoverX')?.value)||0;state.coverY=parseFloat(q('rrsCoverY')?.value)||0;state.coverOpacity=(parseFloat(q('rrsCoverOpacity')?.value)||100)/100;state.events=[0,1,2,3].map(i=>({name:q('rrsNextName'+i)?.value||'',date:q('rrsNextDate'+i)?.value||'',location:q('rrsNextLocation'+i)?.value||''}));draw()}"
assert old_sync in s
s=s.replace(old_sync,new_sync)
s=s.replace("function onScore(e){loadImageFile(e.target.files?.[0],img=>scoreImage=img)}","function onScore(e){loadImageFile(e.target.files?.[0],img=>scoreImage=img)}\nfunction onCover(e){loadImageFile(e.target.files?.[0],img=>coverPhoto=img)}")

old_inputs="<label>Official score sheet<input id=\"rrsScore\" type=\"file\" accept=\"image/*,.pdf\"></label><label>Place<input id=\"rrsPlace\" value=\"8\"></label>"
new_inputs="<label>Official score sheet<input id=\"rrsScore\" type=\"file\" accept=\"image/*,.pdf\"></label><label class=\"rrsWide\">Cover photo<input id=\"rrsCover\" type=\"file\" accept=\"image/*\"></label><label>Photo size<input id=\"rrsCoverScale\" type=\"range\" min=\"80\" max=\"180\" value=\"100\"></label><label>Photo opacity<input id=\"rrsCoverOpacity\" type=\"range\" min=\"0\" max=\"100\" value=\"100\"></label><label>Photo left / right<input id=\"rrsCoverX\" type=\"range\" min=\"-360\" max=\"360\" value=\"0\"></label><label>Photo up / down<input id=\"rrsCoverY\" type=\"range\" min=\"-420\" max=\"420\" value=\"0\"></label><label>Place<input id=\"rrsPlace\" value=\"8\"></label>"
assert old_inputs in s
s=s.replace(old_inputs,new_inputs)
s=s.replace("q('rrsScore').addEventListener('change',onScore);q('rrsMedia').addEventListener('change',onMedia);","q('rrsScore').addEventListener('change',onScore);q('rrsCover').addEventListener('change',onCover);q('rrsMedia').addEventListener('change',onMedia);")

p.write_text(s)
assert "ctx.drawImage(headerImg,0,0,1080,209)" in s
assert "id=\"rrsCoverScale\"" in s
assert "id=\"rrsCoverOpacity\"" in s
assert "function drawAdjustableCover" in s
assert "diagonalBand(ctx,1010,1485)" in s
assert "REGATTA RESULTS STORY — BUILD v4" in s
print('Prepared Regatta Results Story v4')
