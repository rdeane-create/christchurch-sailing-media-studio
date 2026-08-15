from pathlib import Path
import hashlib

path=Path('lineup-headshot.js')
text=path.read_text()
main_path=Path('athlete-main-headshot-approved-exact.js')
main_hash_before=hashlib.sha256(main_path.read_bytes()).hexdigest()

text=text.replace("const VERSION='20260814-lineup-headshot-v5-background-controls';","const VERSION='20260814-lineup-headshot-v6-athlete-cutout';")

old_state="const S={img:null,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,bg:null,bgScale:1,bgX:0,bgY:0,bgOpacity:1,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null,atlas:null,ready:false};"
new_state="const S={img:null,athleteFile:null,cutoutMask:null,cutoutBusy:false,cutoutEdge:0,cutoutShadow:10,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,bg:null,bgScale:1,bgX:0,bgY:0,bgOpacity:1,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null,atlas:null,ready:false};"
assert old_state in text, 'state marker not found'
text=text.replace(old_state,new_state)

marker="  function suggestedCardName(){"
insert=r'''  let removeBgModulePromise=null;
  function setCutoutStatus(message){const el=q('lhCutoutStatus');if(el)el.textContent=message||'';}
  async function loadBackgroundRemoval(){
    if(!removeBgModulePromise){
      removeBgModulePromise=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm').then(mod=>mod.removeBackground||mod.default||mod);
    }
    return removeBgModulePromise;
  }
  async function maskFromRemovalBlob(blob){
    const url=URL.createObjectURL(blob);
    try{
      const im=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});
      const c=document.createElement('canvas');c.width=S.img.naturalWidth||S.img.width;c.height=S.img.naturalHeight||S.img.height;
      const cx=c.getContext('2d',{willReadFrequently:true});cx.clearRect(0,0,c.width,c.height);cx.drawImage(im,0,0,c.width,c.height);
      const data=cx.getImageData(0,0,c.width,c.height);const p=data.data;
      for(let i=0;i<p.length;i+=4){const a=p[i+3];p[i]=255;p[i+1]=255;p[i+2]=255;p[i+3]=a;}
      cx.putImageData(data,0,0);return c;
    }finally{URL.revokeObjectURL(url)}
  }
  async function removeAthleteBackground(){
    if(!S.img||!S.athleteFile){setCutoutStatus('Upload an athlete image first.');return;}
    if(S.cutoutBusy)return;
    const btn=q('lhRemoveBg');const old=btn?btn.textContent:'Remove Background';
    try{
      S.cutoutBusy=true;if(btn){btn.disabled=true;btn.textContent='Removing background…';}
      setCutoutStatus('Preparing athlete cutout. First use may take a little longer.');
      const removeBackground=await loadBackgroundRemoval();
      const blob=await removeBackground(S.athleteFile,{model:'isnet_quint8',output:{format:'image/png',quality:1},progress:(key,current,total)=>{if(total)setCutoutStatus(`Removing background… ${Math.min(100,Math.round(current/total*100))}%`);}});
      S.cutoutMask=await maskFromRemovalBlob(blob);
      setCutoutStatus('Background removed. Original athlete pixels are preserved; only the mask is applied.');
      draw();
    }catch(err){console.error('Athlete background removal failed',err);setCutoutStatus('Background removal could not complete. The original athlete image is unchanged.');}
    finally{S.cutoutBusy=false;if(btn){btn.disabled=false;btn.textContent=old;}}
  }
  function restoreAthleteBackground(){S.cutoutMask=null;setCutoutStatus('Original athlete background restored.');draw();}
'''
assert marker in text, 'function insertion marker not found'
text=text.replace(marker,insert+marker,1)

old_upload='<div class="control"><label>Upload athlete image</label><input id="lhUpload" type="file" accept="image/*"></div>'
new_upload=old_upload+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px"><button id="lhRemoveBg" class="primary" type="button">Remove Background</button><button id="lhRestoreBg" class="secondary" type="button">Restore Original</button></div><div class="control"><label>Cutout edge softness <span id="lhCutoutEdgeVal" class="value">0px</span></label><input id="lhCutoutEdge" type="range" min="0" max="6" step="0.5" value="0"></div><div class="control"><label>Natural shadow <span id="lhCutoutShadowVal" class="value">10%</span></label><input id="lhCutoutShadow" type="range" min="0" max="35" value="10"></div><div id="lhCutoutStatus" class="hint" style="margin:-2px 0 12px">Uses the original athlete photo; background removal creates a mask only.</div>'
assert old_upload in text, 'upload control marker not found'
text=text.replace(old_upload,new_upload,1)

old_handler="q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};"
new_handler="q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;S.athleteFile=f;S.cutoutMask=null;setCutoutStatus('Athlete loaded. Remove Background is ready.');const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};q('lhRemoveBg').onclick=removeAthleteBackground;q('lhRestoreBg').onclick=restoreAthleteBackground;q('lhCutoutEdge').oninput=e=>{S.cutoutEdge=+e.target.value;q('lhCutoutEdgeVal').textContent=S.cutoutEdge+'px';draw()};q('lhCutoutShadow').oninput=e=>{S.cutoutShadow=+e.target.value;q('lhCutoutShadowVal').textContent=Math.round(S.cutoutShadow)+'%';draw()};"
assert old_handler in text, 'upload handler marker not found'
text=text.replace(old_handler,new_handler,1)

old_draw="  function drawPhoto(ctx){if(!S.img)return;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;ctx.drawImage(S.img,(W-dw)/2+S.x,(H-dh)/2+S.y,dw,dh)}"
new_draw=r'''  function athleteGeometry(){if(!S.img)return null;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;return{x:(W-dw)/2+S.x,y:(H-dh)/2+S.y,w:dw,h:dh}}
  function drawPhoto(ctx){
    if(!S.img)return;const g=athleteGeometry();
    if(!S.cutoutMask){ctx.drawImage(S.img,g.x,g.y,g.w,g.h);return;}
    const layer=document.createElement('canvas');layer.width=W;layer.height=H;const lx=layer.getContext('2d');
    lx.drawImage(S.img,g.x,g.y,g.w,g.h);
    lx.globalCompositeOperation='destination-in';
    if(S.cutoutEdge>0)lx.filter=`blur(${S.cutoutEdge}px)`;
    lx.drawImage(S.cutoutMask,g.x,g.y,g.w,g.h);lx.filter='none';lx.globalCompositeOperation='source-over';
    ctx.save();
    if(S.cutoutShadow>0){ctx.shadowColor=`rgba(0,0,0,${Math.min(.35,S.cutoutShadow/100)})`;ctx.shadowBlur=18;ctx.shadowOffsetY=8;}
    ctx.drawImage(layer,0,0);ctx.restore();
  }'''
assert old_draw in text, 'drawPhoto marker not found'
text=text.replace(old_draw,new_draw,1)

assert 'drawBackground(ctx);\n    drawPhoto(ctx);' in text, 'background/athlete draw order missing'
text=text.replace('Lineup Headshot. Background and athlete photo can be positioned independently; lower fade and typography match Main Athlete Headshot.', 'Lineup Headshot. Background and athlete photo can be positioned independently. Remove Background uses an alpha mask while preserving the original athlete photo pixels; lower fade and typography match Main Athlete Headshot.')

path.write_text(text)
main_hash_after=hashlib.sha256(main_path.read_bytes()).hexdigest()
assert main_hash_before==main_hash_after, 'LOCK VIOLATION: Athlete Main Headshot changed'
assert 'Remove Background' in text and 'cutoutMask' in text and '@imgly/background-removal@1.7.0' in text
print('Installed Lineup Headshot athlete cutout v6. Locked Main Headshot unchanged.')
