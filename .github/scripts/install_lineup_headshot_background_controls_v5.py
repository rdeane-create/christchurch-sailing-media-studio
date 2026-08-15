from pathlib import Path

p=Path('lineup-headshot.js')
s=p.read_text()

old="const VERSION='20260814-lineup-headshot-v4-exact-main-fade';"
new="const VERSION='20260814-lineup-headshot-v5-background-controls';"
assert old in s
s=s.replace(old,new,1)

old="const S={img:null,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null,atlas:null,ready:false};"
new="const S={img:null,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,bg:null,bgScale:1,bgX:0,bgY:0,bgOpacity:1,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null,atlas:null,ready:false};"
assert old in s
s=s.replace(old,new,1)

old='<div class="control"><label>Upload athlete image</label><input id="lhUpload" type="file" accept="image/*"></div><div class="control"><label>Size <span id="lhScaleVal" class="value">100%</span></label>'
new='<div style="font-weight:800;margin:2px 0 8px">Athlete Photo</div><div class="control"><label>Upload athlete image</label><input id="lhUpload" type="file" accept="image/*"></div><div class="control"><label>Size <span id="lhScaleVal" class="value">100%</span></label>'
assert old in s
s=s.replace(old,new,1)

old='<div class="control"><label>Up / Down <span id="lhYVal" class="value">0</span></label><input id="lhY" type="range" min="-500" max="500" value="0"></div><div class="control"><label>First name</label>'
new='<div class="control"><label>Up / Down <span id="lhYVal" class="value">0</span></label><input id="lhY" type="range" min="-500" max="500" value="0"></div><button id="lhReset" class="secondary" type="button" style="width:100%;margin-bottom:14px">Reset athlete image</button><div style="font-weight:800;margin:2px 0 8px">Background Photo</div><div class="control"><label>Upload background image</label><input id="lhBgUpload" type="file" accept="image/*"></div><div class="control"><label>Background size <span id="lhBgScaleVal" class="value">100%</span></label><input id="lhBgScale" type="range" min="25" max="300" value="100"></div><div class="control"><label>Background left / right <span id="lhBgXVal" class="value">0</span></label><input id="lhBgX" type="range" min="-700" max="700" value="0"></div><div class="control"><label>Background up / down <span id="lhBgYVal" class="value">0</span></label><input id="lhBgY" type="range" min="-700" max="700" value="0"></div><div class="control"><label>Background opacity <span id="lhBgOpacityVal" class="value">100%</span></label><input id="lhBgOpacity" type="range" min="0" max="100" value="100"></div><button id="lhBgReset" class="secondary" type="button" style="width:100%;margin-bottom:14px">Reset background</button><div class="control"><label>First name</label>'
assert old in s
s=s.replace(old,new,1)

old='<button id="lhReset" class="secondary" type="button" style="width:100%">Reset image</button><button id="lhSave" class="primary" type="button" style="width:100%;margin-top:8px">Save Card</button>'
new='<button id="lhSave" class="primary" type="button" style="width:100%;margin-top:8px">Save Card</button>'
assert old in s
s=s.replace(old,new,1)

old="function wire(p){const c=q('lhCanvas');q('lhClose').onclick=()=>p.hidden=true;q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};q('lhScale').oninput=e=>{S.scale=+e.target.value/100;labels(p);draw()};q('lhX').oninput=e=>{S.x=+e.target.value;labels(p);draw()};q('lhY').oninput=e=>{S.y=+e.target.value;labels(p);draw()};q('lhFirst').oninput=e=>{S.first=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhLast').oninput=e=>{S.last=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('lhCardName').oninput=()=>{S.cardNameDirty=true};q('lhSave').onclick=saveFinishedCard;q('lhReset').onclick=()=>{S.scale=1;S.x=S.y=0;sync(p);draw()};q('lhDownload').onclick=()=>{draw();const a=document.createElement('a');a.download='lineup-headshot.png';a.href=c.toDataURL('image/png');a.click()};"
new="function wire(p){const c=q('lhCanvas');q('lhClose').onclick=()=>p.hidden=true;q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};q('lhBgUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.bg=im;S.bgScale=1;S.bgX=S.bgY=0;S.bgOpacity=1;syncBg();draw();URL.revokeObjectURL(url)};im.src=url};q('lhScale').oninput=e=>{S.scale=+e.target.value/100;labels(p);draw()};q('lhX').oninput=e=>{S.x=+e.target.value;labels(p);draw()};q('lhY').oninput=e=>{S.y=+e.target.value;labels(p);draw()};q('lhBgScale').oninput=e=>{S.bgScale=+e.target.value/100;bgLabels();draw()};q('lhBgX').oninput=e=>{S.bgX=+e.target.value;bgLabels();draw()};q('lhBgY').oninput=e=>{S.bgY=+e.target.value;bgLabels();draw()};q('lhBgOpacity').oninput=e=>{S.bgOpacity=+e.target.value/100;bgLabels();draw()};q('lhFirst').oninput=e=>{S.first=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhLast').oninput=e=>{S.last=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('lhCardName').oninput=()=>{S.cardNameDirty=true};q('lhSave').onclick=saveFinishedCard;q('lhReset').onclick=()=>{S.scale=1;S.x=S.y=0;sync(p);draw()};q('lhBgReset').onclick=()=>{S.bgScale=1;S.bgX=S.bgY=0;S.bgOpacity=1;syncBg();draw()};q('lhDownload').onclick=()=>{draw();const a=document.createElement('a');a.download='lineup-headshot.png';a.href=c.toDataURL('image/png');a.click()};"
assert old in s
s=s.replace(old,new,1)

old="function labels(p){q('lhScaleVal').textContent=Math.round(S.scale*100)+'%';q('lhXVal').textContent=Math.round(S.x);q('lhYVal').textContent=Math.round(S.y)}\n  function sync(p){q('lhScale').value=Math.round(S.scale*100);q('lhX').value=Math.round(S.x);q('lhY').value=Math.round(S.y);labels(p)}"
new="function labels(p){q('lhScaleVal').textContent=Math.round(S.scale*100)+'%';q('lhXVal').textContent=Math.round(S.x);q('lhYVal').textContent=Math.round(S.y)}\n  function bgLabels(){q('lhBgScaleVal').textContent=Math.round(S.bgScale*100)+'%';q('lhBgXVal').textContent=Math.round(S.bgX);q('lhBgYVal').textContent=Math.round(S.bgY);q('lhBgOpacityVal').textContent=Math.round(S.bgOpacity*100)+'%'}\n  function syncBg(){q('lhBgScale').value=Math.round(S.bgScale*100);q('lhBgX').value=Math.round(S.bgX);q('lhBgY').value=Math.round(S.bgY);q('lhBgOpacity').value=Math.round(S.bgOpacity*100);bgLabels()}\n  function sync(p){q('lhScale').value=Math.round(S.scale*100);q('lhX').value=Math.round(S.x);q('lhY').value=Math.round(S.y);labels(p)}"
assert old in s
s=s.replace(old,new,1)

old="function drawPhoto(ctx){if(!S.img)return;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;ctx.drawImage(S.img,(W-dw)/2+S.x,(H-dh)/2+S.y,dw,dh)}"
new="function drawBackground(ctx){if(!S.bg)return;const base=Math.max(W/S.bg.width,H/S.bg.height),sc=base*S.bgScale,dw=S.bg.width*sc,dh=S.bg.height*sc;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,S.bgOpacity));ctx.drawImage(S.bg,(W-dw)/2+S.bgX,(H-dh)/2+S.bgY,dw,dh);ctx.restore()}\n  function drawPhoto(ctx){if(!S.img)return;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;ctx.drawImage(S.img,(W-dw)/2+S.x,(H-dh)/2+S.y,dw,dh)}"
assert old in s
s=s.replace(old,new,1)

old="ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);\n    drawPhoto(ctx);"
new="ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);\n    // CSMS_LINEUP_HEADSHOT_BACKGROUND_LAYER_V5\n    drawBackground(ctx);\n    drawPhoto(ctx);"
assert old in s
s=s.replace(old,new,1)

p.write_text(s)
print('Installed Lineup Headshot background photo controls v5.')
