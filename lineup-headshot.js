(function(){
  'use strict';
  const NAME='Lineup Headshot';
  const VERSION='20260814-lineup-headshot-v6-athlete-cutout';
  const W=1080,H=1350;
  const OVERLAY_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp';
  const ATLAS_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_GLYPH_ATLAS_v1.webp';
  const GLYPHS={"large:A":{"x":8,"y":8,"w":65,"h":121},"large:B":{"x":112,"y":8,"w":70,"h":120},"large:C":{"x":216,"y":8,"w":67,"h":121},"large:D":{"x":320,"y":8,"w":70,"h":120},"large:E":{"x":424,"y":8,"w":64,"h":119},"large:F":{"x":528,"y":8,"w":63,"h":120},"large:G":{"x":632,"y":8,"w":64,"h":123},"large:H":{"x":736,"y":8,"w":72,"h":121},"large:I":{"x":840,"y":8,"w":45,"h":120},"large:J":{"x":944,"y":8,"w":56,"h":120},"large:K":{"x":1048,"y":8,"w":71,"h":121},"large:L":{"x":1152,"y":8,"w":46,"h":121},"large:M":{"x":8,"y":149,"w":88,"h":121},"large:N":{"x":112,"y":149,"w":71,"h":119},"large:O":{"x":216,"y":149,"w":66,"h":120},"large:P":{"x":320,"y":149,"w":67,"h":119},"large:Q":{"x":424,"y":149,"w":66,"h":125},"large:R":{"x":528,"y":149,"w":67,"h":119},"large:S":{"x":632,"y":149,"w":62,"h":120},"large:T":{"x":736,"y":149,"w":56,"h":119},"large:U":{"x":840,"y":149,"w":67,"h":119},"large:V":{"x":944,"y":149,"w":59,"h":119},"large:W":{"x":1048,"y":149,"w":83,"h":119},"large:X":{"x":1152,"y":149,"w":71,"h":119},"large:Y":{"x":8,"y":290,"w":57,"h":119},"large:Z":{"x":112,"y":290,"w":62,"h":119},"large:0":{"x":216,"y":290,"w":57,"h":76},"large:1":{"x":320,"y":290,"w":36,"h":76},"large:2":{"x":424,"y":290,"w":55,"h":85},"large:3":{"x":528,"y":290,"w":54,"h":76},"large:4":{"x":632,"y":290,"w":56,"h":76},"large:5":{"x":736,"y":290,"w":55,"h":76},"large:6":{"x":840,"y":290,"w":54,"h":76},"large:7":{"x":944,"y":290,"w":47,"h":76},"large:8":{"x":1048,"y":290,"w":54,"h":76},"large:9":{"x":1152,"y":290,"w":53,"h":76},"small:A":{"x":8,"y":431,"w":38,"h":46},"small:B":{"x":112,"y":431,"w":41,"h":47},"small:C":{"x":216,"y":431,"w":39,"h":49},"small:D":{"x":320,"y":431,"w":42,"h":46},"small:E":{"x":424,"y":431,"w":38,"h":46},"small:F":{"x":528,"y":431,"w":39,"h":48},"small:G":{"x":632,"y":431,"w":38,"h":50},"small:H":{"x":736,"y":431,"w":44,"h":47},"small:I":{"x":840,"y":431,"w":25,"h":47},"small:J":{"x":944,"y":431,"w":32,"h":46},"small:K":{"x":1048,"y":431,"w":43,"h":47},"small:L":{"x":1152,"y":431,"w":30,"h":47},"small:M":{"x":8,"y":572,"w":52,"h":48},"small:N":{"x":112,"y":572,"w":44,"h":48},"small:O":{"x":216,"y":572,"w":39,"h":49},"small:P":{"x":320,"y":572,"w":40,"h":47},"small:Q":{"x":424,"y":572,"w":40,"h":54},"small:R":{"x":528,"y":572,"w":41,"h":47},"small:S":{"x":632,"y":572,"w":38,"h":49},"small:T":{"x":736,"y":572,"w":34,"h":48},"small:U":{"x":840,"y":572,"w":40,"h":47},"small:V":{"x":944,"y":572,"w":37,"h":67},"small:W":{"x":1048,"y":572,"w":50,"h":67},"small:X":{"x":1152,"y":572,"w":45,"h":47},"small:Y":{"x":8,"y":713,"w":36,"h":47},"small:Z":{"x":112,"y":713,"w":40,"h":47},"small:0":{"x":216,"y":713,"w":34,"h":60},"small:1":{"x":320,"y":713,"w":23,"h":40},"small:2":{"x":424,"y":713,"w":34,"h":40},"small:3":{"x":528,"y":713,"w":31,"h":40},"small:4":{"x":632,"y":713,"w":31,"h":40},"small:5":{"x":736,"y":713,"w":31,"h":40},"small:6":{"x":840,"y":713,"w":30,"h":40},"small:7":{"x":944,"y":713,"w":29,"h":40},"small:8":{"x":1048,"y":713,"w":30,"h":40},"small:9":{"x":1152,"y":713,"w":32,"h":40},"orange:A":{"x":8,"y":854,"w":34,"h":41},"orange:B":{"x":112,"y":854,"w":37,"h":41},"orange:C":{"x":216,"y":854,"w":35,"h":42},"orange:D":{"x":320,"y":854,"w":36,"h":40},"orange:E":{"x":424,"y":854,"w":34,"h":41},"orange:F":{"x":528,"y":854,"w":35,"h":41},"orange:G":{"x":632,"y":854,"w":34,"h":42},"orange:H":{"x":736,"y":854,"w":38,"h":42},"orange:I":{"x":840,"y":854,"w":22,"h":42},"orange:J":{"x":944,"y":854,"w":29,"h":42},"orange:K":{"x":1048,"y":854,"w":39,"h":42},"orange:L":{"x":1152,"y":854,"w":26,"h":41},"orange:M":{"x":8,"y":995,"w":46,"h":42},"orange:N":{"x":112,"y":995,"w":39,"h":41},"orange:O":{"x":216,"y":995,"w":36,"h":42},"orange:P":{"x":320,"y":995,"w":36,"h":41},"orange:Q":{"x":424,"y":995,"w":36,"h":47},"orange:R":{"x":528,"y":995,"w":36,"h":42},"orange:S":{"x":632,"y":995,"w":33,"h":42},"orange:T":{"x":736,"y":995,"w":30,"h":41},"orange:U":{"x":840,"y":995,"w":35,"h":41},"orange:V":{"x":944,"y":995,"w":31,"h":41},"orange:W":{"x":1048,"y":995,"w":45,"h":41},"orange:X":{"x":1152,"y":995,"w":39,"h":41},"orange:Y":{"x":8,"y":1136,"w":31,"h":41},"orange:Z":{"x":112,"y":1136,"w":36,"h":41},"orange:0":{"x":216,"y":1136,"w":31,"h":40},"orange:1":{"x":320,"y":1136,"w":21,"h":39},"orange:2":{"x":424,"y":1136,"w":32,"h":39},"orange:3":{"x":528,"y":1136,"w":30,"h":39},"orange:4":{"x":632,"y":1136,"w":30,"h":39},"orange:5":{"x":736,"y":1136,"w":31,"h":39},"orange:6":{"x":840,"y":1136,"w":30,"h":39},"orange:7":{"x":944,"y":1136,"w":29,"h":39},"orange:8":{"x":1048,"y":1136,"w":30,"h":40},"orange:9":{"x":1152,"y":1136,"w":30,"h":39}};
  const S={img:null,athleteFile:null,cutoutMask:null,cutoutBusy:false,cutoutEdge:0,cutoutShadow:10,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,bg:null,bgScale:1,bgX:0,bgY:0,bgOpacity:1,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null,atlas:null,ready:false};
  const q=id=>document.getElementById(id);
  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Exact approved local asset unavailable: '+src));i.src=src+'?v=20260814-drive-saved-cards-20';});}
  let removeBgModulePromise=null;
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
  function suggestedCardName(){
    const last=String(S.last||'').trim()||'LAST NAME';
    const first=String(S.first||'').trim()||'FIRST NAME';
    return `${last}, ${first}, LINEUP HEADSHOT CARD`;
  }
  function syncCardName(force){
    const input=q('lhCardName');if(!input)return;
    if(force||!S.cardNameDirty)input.value=suggestedCardName();
  }
  // ===== CSMS DRIVE-BACKED SAVED CARDS V1 =====
  function savedCardBlobToBase64(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{const text=String(reader.result||'');const comma=text.indexOf(',');resolve(comma>=0?text.slice(comma+1):text)};
      reader.onerror=()=>reject(reader.error||new Error('Could not read saved card PNG'));
      reader.readAsDataURL(blob);
    });
  }
  function savedCardBase64ToBlob(base64,mimeType){
    const binary=atob(base64);const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return new Blob([bytes],{type:mimeType||'image/png'});
  }
  async function savedCardBridgeCall(action,payload={}){
    if(typeof csmsAuthenticatedBridgeCall!=='function'){
      throw new Error('Google Drive Bridge is unavailable. Refresh Studio and connect Google Drive.');
    }
    if(typeof csmsEnsureAuthenticatedBridge==='function'){
      await Promise.race([
        csmsEnsureAuthenticatedBridge({userInitiated:true}),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('Google Drive connection timed out. Refresh Studio and try again.')),12000))
      ]);
    }
    return await Promise.race([
      csmsAuthenticatedBridgeCall(action,payload,{userInitiated:true}),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Google Drive did not respond to '+action+' within 20 seconds.')),20000))
    ]);
  }
  async function putSavedCard(card){
    const data=await savedCardBlobToBase64(card.blob);
    const result=await savedCardBridgeCall('saveCard',{
      name:card.name,
      cardType:card.type||'ATHLETE LINEUP HEADSHOT CARD',
      first:card.first||'',
      last:card.last||'',
      classLine:card.classLine||'',
      data
    });
    if(!result||!result.ok)throw new Error(result&&result.error?result.error:'Drive did not save the card');
    return result.card;
  }
  async function getSavedCards(){
    const result=await savedCardBridgeCall('listSavedCards',{});
    if(!result||!result.ok)throw new Error(result&&result.error?result.error:'Drive Saved Cards library is unavailable');
    return Array.isArray(result.cards)?result.cards:[];
  }
  async function getSavedCardBlob(fileId){
    const result=await savedCardBridgeCall('getSavedCard',{fileId});
    if(!result||!result.ok||!result.card||!result.card.data)throw new Error('Saved card PNG could not be loaded from Drive');
    return savedCardBase64ToBlob(result.card.data,result.card.mimeType||'image/png');
  }
  async function deleteSavedCard(fileId){
    const result=await savedCardBridgeCall('deleteSavedCard',{fileId});
    if(!result||!result.ok)throw new Error(result&&result.error?result.error:'Drive could not delete the saved card');
    return result;
  }
  function ensureSavedCardsPanel(){
    let panel=q('lhSavedCardsPanel');
    const workspace=q('workspace-media');
    if(!workspace)return panel||null;
    if(!panel){
      panel=document.createElement('section');
      panel.id='lhSavedCardsPanel';
      panel.className='panel';
      panel.style.marginTop='14px';
      panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px"><h2 style="margin:0">Saved Cards</h2><span class="hint">Finished Studio cards • Google Drive</span></div><div id="lhSavedCardsList" style="display:grid;gap:10px"></div>';
    }
    if(panel.parentElement!==workspace)workspace.appendChild(panel);
    return panel;
  }
  function escapeSavedName(v){return String(v||'Saved Card').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}
  async function renderSavedCards(){
    const panel=ensureSavedCardsPanel();if(!panel)return;
    const list=q('lhSavedCardsList');if(!list)return;
    list.innerHTML='<div class="hint">Loading saved cards from Google Drive…</div>';
    let cards=[];
    try{cards=await getSavedCards()}catch(err){console.error('Drive Saved Cards library unavailable',err);list.innerHTML='<div class="hint">Connect Google Drive to load Saved Cards.</div>';return}
    cards.sort((a,b)=>new Date(b.created||0)-new Date(a.created||0));list.innerHTML='';
    if(!cards.length){list.innerHTML='<div class="hint">No finished cards saved in Drive yet.</div>';return}
    for(const card of cards){
      const row=document.createElement('div');row.className='athleteItem';row.style.gridTemplateColumns='72px 1fr auto';row.style.padding='10px';
      row.innerHTML=`<img alt="" style="width:58px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #d8e2ed;background:#eef2f7"><div><div style="font-weight:800;font-size:14px">${escapeSavedName(String(card.name||'Saved Card').replace(/\.png$/i,''))}</div><div class="hint" style="margin-top:3px">Athlete Headshot Card • Google Drive</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button type="button" class="tiny primary" data-action="download">Download</button><button type="button" class="tiny secondary" data-action="delete">Delete</button></div>`;
      const img=row.querySelector('img');
      getSavedCardBlob(card.fileId).then(blob=>{const url=URL.createObjectURL(blob);img.src=url;img.onload=()=>URL.revokeObjectURL(url)}).catch(err=>console.warn('Saved card thumbnail unavailable',err));
      row.querySelector('[data-action="download"]').onclick=async()=>{try{const blob=await getSavedCardBlob(card.fileId);const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=card.name||'athlete-headshot-card.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}catch(err){console.error(err);alert('The saved card could not be downloaded from Google Drive.')}};
      row.querySelector('[data-action="delete"]').onclick=async()=>{if(!confirm(`Delete ${String(card.name||'this saved card').replace(/\.png$/i,'')} from Google Drive?`))return;try{await deleteSavedCard(card.fileId);await renderSavedCards()}catch(err){console.error(err);alert('The saved card could not be deleted from Google Drive.')}};
      list.appendChild(row);
    }
  }
  function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG save failed')),'image/png'))}
  async function saveFinishedCard(){
    const c=q('lhCanvas');if(!c)return;
    const btn=q('lhSave');
    const oldText=btn?btn.textContent:'Save Card';
    if(btn){btn.disabled=true;btn.textContent='Saving to Drive…';}
    draw();
    const name=(q('lhCardName')?.value||suggestedCardName()).trim()||suggestedCardName();
    try{
      const blob=await canvasBlob(c);
      const id=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
      await putSavedCard({id,name,type:'ATHLETE LINEUP HEADSHOT CARD',first:S.first,last:S.last,classLine:S.classLine,createdAt:Date.now(),blob});
      S.cardNameDirty=false;syncCardName(true);
      if(btn)btn.textContent='Saved to Drive ✓';
      await renderSavedCards();
      setTimeout(()=>{if(btn){btn.disabled=false;btn.textContent=oldText;}},1600);
    }catch(err){
      console.error('Save Card to Drive failed',err);
      if(btn){btn.disabled=false;btn.textContent='Save Failed — Try Again';}
      const message=err&&err.message?err.message:String(err||'Unknown Drive error');
      alert('Save Card failed: '+message);
    }
  }
  function buildCard(){if(q('lineupHeadshotCard'))return;const list=q('templateLibraryList');if(!list)return;const r=document.createElement('div');r.id='lineupHeadshotCard';r.className='athleteItem';r.style.gridTemplateColumns='88px 1fr auto';r.style.padding='10px';r.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#7f8e9b,#dfe4ea 48%,#7f8e9b 72%,#03182a)"></div><span style="font-weight:800;font-size:14px">'+NAME+'</span><button type="button" class="tiny primary" style="width:auto">Open</button>';r.querySelector('button').onclick=openTemplate;list.prepend(r)}
  function openTemplate(){let p=q('lineupHeadshotWorkspace');if(!p){p=document.createElement('section');p.id='lineupHeadshotWorkspace';p.className='panel';p.style.marginTop='14px';p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="lhClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(270px,350px) 1fr;gap:18px;align-items:start"><div><div style="font-weight:800;margin:2px 0 8px">Athlete Photo</div><div class="control"><label>Upload athlete image</label><input id="lhUpload" type="file" accept="image/*"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px"><button id="lhRemoveBg" class="primary" type="button">Remove Background</button><button id="lhRestoreBg" class="secondary" type="button">Restore Original</button></div><div class="control"><label>Cutout edge softness <span id="lhCutoutEdgeVal" class="value">0px</span></label><input id="lhCutoutEdge" type="range" min="0" max="6" step="0.5" value="0"></div><div class="control"><label>Natural shadow <span id="lhCutoutShadowVal" class="value">10%</span></label><input id="lhCutoutShadow" type="range" min="0" max="35" value="10"></div><div id="lhCutoutStatus" class="hint" style="margin:-2px 0 12px">Uses the original athlete photo; background removal creates a mask only.</div><div class="control"><label>Size <span id="lhScaleVal" class="value">100%</span></label><input id="lhScale" type="range" min="25" max="300" value="100"></div><div class="control"><label>Left / Right <span id="lhXVal" class="value">0</span></label><input id="lhX" type="range" min="-500" max="500" value="0"></div><div class="control"><label>Up / Down <span id="lhYVal" class="value">0</span></label><input id="lhY" type="range" min="-500" max="500" value="0"></div><button id="lhReset" class="secondary" type="button" style="width:100%;margin-bottom:14px">Reset athlete image</button><div style="font-weight:800;margin:2px 0 8px">Background Photo</div><div class="control"><label>Upload background image</label><input id="lhBgUpload" type="file" accept="image/*"></div><div class="control"><label>Background size <span id="lhBgScaleVal" class="value">100%</span></label><input id="lhBgScale" type="range" min="25" max="300" value="100"></div><div class="control"><label>Background left / right <span id="lhBgXVal" class="value">0</span></label><input id="lhBgX" type="range" min="-700" max="700" value="0"></div><div class="control"><label>Background up / down <span id="lhBgYVal" class="value">0</span></label><input id="lhBgY" type="range" min="-700" max="700" value="0"></div><div class="control"><label>Background opacity <span id="lhBgOpacityVal" class="value">100%</span></label><input id="lhBgOpacity" type="range" min="0" max="100" value="100"></div><button id="lhBgReset" class="secondary" type="button" style="width:100%;margin-bottom:14px">Reset background</button><div class="control"><label>First name</label><input id="lhFirst" value="WYLDER"></div><div class="control"><label>Last name</label><input id="lhLast" value="SMITH"></div><div class="control"><label>Class line</label><input id="lhClass" value="CLASS OF 2027"></div><div class="control"><label>Card name</label><input id="lhCardName" value="SMITH, WYLDER, ATHLETE LINEUP HEADSHOT CARD"></div><button id="lhSave" class="primary" type="button" style="width:100%;margin-top:8px">Save Card</button><button id="lhDownload" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button><div class="hint" style="margin-top:10px">Lineup Headshot. Athlete photo and lower name/class treatment match Main Athlete Headshot; the top title/graphic has been removed.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="lhCanvas" width="1080" height="1350" style="width:min(100%,500px);aspect-ratio:4/5;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);cursor:grab;touch-action:none"></canvas></div></div>`;(q('templateLibraryList')?.parentElement||document.body).appendChild(p);wire(p);syncCardName(true);renderSavedCards()}p.hidden=false;ensureAssets().then(draw);p.scrollIntoView({behavior:'smooth',block:'start'})}
  async function ensureAssets(){if(S.ready)return;try{[S.overlay,S.atlas]=await Promise.all([loadImage(OVERLAY_SRC),loadImage(ATLAS_SRC)]);S.ready=true;draw()}catch(err){console.error('Approved template assets failed to load',err)}}
  function wire(p){const c=q('lhCanvas');q('lhClose').onclick=()=>p.hidden=true;q('lhUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;S.athleteFile=f;S.cutoutMask=null;setCutoutStatus('Athlete loaded. Remove Background is ready.');const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};q('lhRemoveBg').onclick=removeAthleteBackground;q('lhRestoreBg').onclick=restoreAthleteBackground;q('lhCutoutEdge').oninput=e=>{S.cutoutEdge=+e.target.value;q('lhCutoutEdgeVal').textContent=S.cutoutEdge+'px';draw()};q('lhCutoutShadow').oninput=e=>{S.cutoutShadow=+e.target.value;q('lhCutoutShadowVal').textContent=Math.round(S.cutoutShadow)+'%';draw()};q('lhBgUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.bg=im;S.bgScale=1;S.bgX=S.bgY=0;S.bgOpacity=1;syncBg();draw();URL.revokeObjectURL(url)};im.src=url};q('lhScale').oninput=e=>{S.scale=+e.target.value/100;labels(p);draw()};q('lhX').oninput=e=>{S.x=+e.target.value;labels(p);draw()};q('lhY').oninput=e=>{S.y=+e.target.value;labels(p);draw()};q('lhBgScale').oninput=e=>{S.bgScale=+e.target.value/100;bgLabels();draw()};q('lhBgX').oninput=e=>{S.bgX=+e.target.value;bgLabels();draw()};q('lhBgY').oninput=e=>{S.bgY=+e.target.value;bgLabels();draw()};q('lhBgOpacity').oninput=e=>{S.bgOpacity=+e.target.value/100;bgLabels();draw()};q('lhFirst').oninput=e=>{S.first=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhLast').oninput=e=>{S.last=e.target.value.toUpperCase();syncCardName(false);draw()};q('lhClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('lhCardName').oninput=()=>{S.cardNameDirty=true};q('lhSave').onclick=saveFinishedCard;q('lhReset').onclick=()=>{S.scale=1;S.x=S.y=0;sync(p);draw()};q('lhBgReset').onclick=()=>{S.bgScale=1;S.bgX=S.bgY=0;S.bgOpacity=1;syncBg();draw()};q('lhDownload').onclick=()=>{draw();const a=document.createElement('a');a.download='lineup-headshot.png';a.href=c.toDataURL('image/png');a.click()};const pt=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};c.onpointerdown=e=>{if(!S.img)return;c.setPointerCapture(e.pointerId);const z=pt(e);S.drag=true;S.sx=z.x;S.sy=z.y;S.ix=S.x;S.iy=S.y;c.style.cursor='grabbing'};c.onpointermove=e=>{if(!S.drag)return;const z=pt(e);S.x=Math.max(-500,Math.min(500,S.ix+z.x-S.sx));S.y=Math.max(-500,Math.min(500,S.iy+z.y-S.sy));sync(p);draw()};c.onpointerup=c.onpointercancel=()=>{S.drag=false;c.style.cursor='grab'}}
  function labels(p){q('lhScaleVal').textContent=Math.round(S.scale*100)+'%';q('lhXVal').textContent=Math.round(S.x);q('lhYVal').textContent=Math.round(S.y)}
  function bgLabels(){q('lhBgScaleVal').textContent=Math.round(S.bgScale*100)+'%';q('lhBgXVal').textContent=Math.round(S.bgX);q('lhBgYVal').textContent=Math.round(S.bgY);q('lhBgOpacityVal').textContent=Math.round(S.bgOpacity*100)+'%'}
  function syncBg(){q('lhBgScale').value=Math.round(S.bgScale*100);q('lhBgX').value=Math.round(S.bgX);q('lhBgY').value=Math.round(S.bgY);q('lhBgOpacity').value=Math.round(S.bgOpacity*100);bgLabels()}
  function sync(p){q('lhScale').value=Math.round(S.scale*100);q('lhX').value=Math.round(S.x);q('lhY').value=Math.round(S.y);labels(p)}
const GLYPH_METRICS={};
function glyphMetrics(style,ch){
  const key=style+':'+ch;
  if(GLYPH_METRICS[key])return GLYPH_METRICS[key];
  const g=GLYPHS[key];
  if(!g||!S.atlas)return g;
  const c=document.createElement('canvas');
  c.width=g.w;c.height=g.h;
  const gx=c.getContext('2d',{willReadFrequently:true});
  gx.clearRect(0,0,g.w,g.h);
  gx.drawImage(S.atlas,g.x,g.y,g.w,g.h,0,0,g.w,g.h);
  const px=gx.getImageData(0,0,g.w,g.h).data;
  let minX=g.w,minY=g.h,maxX=-1,maxY=-1;
  const rows=[];
  for(let yy=0;yy<g.h;yy++){
    let left=g.w,right=-1;
    for(let xx=0;xx<g.w;xx++){
      const i=(yy*g.w+xx)*4;
      const r=px[i],gg=px[i+1],b=px[i+2],a=px[i+3];
      const whiteCore=a>170 && Math.min(r,gg,b)>178;
      if(whiteCore){
        if(xx<left)left=xx;if(xx>right)right=xx;
        if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;
        if(yy<minY)minY=yy;if(yy>maxY)maxY=yy;
      }
    }
    rows[yy]=right>=left?[left,right]:null;
  }
  if(maxX<minX){GLYPH_METRICS[key]=g;return g;}
  const h=maxY-minY+1,w=maxX-minX+1,left=[],right=[];
  for(let yy=minY;yy<=maxY;yy++){
    const row=rows[yy];
    left.push(row?row[0]-minX:null);
    right.push(row?row[1]-minX:null);
  }
  const m={x:g.x+minX,y:g.y+minY,w,h,left,right};
  GLYPH_METRICS[key]=m;
  return m;
}
function glyphWidth(style,ch,height){
  const g=glyphMetrics(style,ch);if(!g)return 0;
  return g.w*(height/g.h);
}
function contourDelta(style,a,b,height,tracking){
  if(!a||!b)return 0;
  if(style==='orange')return tracking;
  const A=glyphMetrics(style,a),B=glyphMetrics(style,b);
  if(!A||!B||!A.left||!B.left)return tracking;
  const sa=height/A.h,sb=height/B.h,aw=A.w*sa;
  const target=style==='large'?9:7;
  const needs=[];
  const samples=Math.max(28,Math.round(height));
  for(let n=0;n<samples;n++){
    const t=samples===1?0:n/(samples-1);
    if(t<.06||t>.94)continue;
    const ya=Math.min(A.h-1,Math.round(t*(A.h-1)));
    const yb=Math.min(B.h-1,Math.round(t*(B.h-1)));
    const ar=A.right[ya],bl=B.left[yb];
    if(ar==null||bl==null)continue;
    needs.push(target-aw-bl*sb+ar*sa);
  }
  if(!needs.length)return tracking;
  const required=Math.max(...needs);
  const min=-height*.42,max=style==='large'?height*.08:height*.16;
  return Math.max(min,Math.min(max,required));
}
function measure(text,style,height,tracking){
  const chars=String(text||'').toUpperCase();
  let w=0,prev='';
  for(const ch of chars){
    if(ch===' '){w+=height*.34;prev='';continue;}
    const g=glyphMetrics(style,ch);if(!g)continue;
    if(prev)w+=contourDelta(style,prev,ch,height,tracking);
    w+=glyphWidth(style,ch,height);prev=ch;
  }
  return w;
}
function drawRasterText(ctx,text,style,x,y,height,tracking,maxWidth){
  text=String(text||'').toUpperCase();
  let h=height;
  const mw=measure(text,style,h,tracking);
  if(maxWidth&&mw>maxWidth)h*=maxWidth/mw;
  let cx=x,prev='';
  for(const ch of text){
    if(ch===' '){cx+=h*.34;prev='';continue;}
    const g=glyphMetrics(style,ch);if(!g)continue;
    if(prev)cx+=contourDelta(style,prev,ch,h,tracking);
    const sc=h/g.h,dw=g.w*sc,dh=h;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.62)';ctx.shadowBlur=Math.max(4,h*.055);
    ctx.shadowOffsetX=Math.max(3,h*.035);ctx.shadowOffsetY=Math.max(4,h*.045);
    ctx.drawImage(S.atlas,g.x,g.y,g.w,g.h,cx,y,dw,dh);
    ctx.restore();
    cx+=dw;prev=ch;
  }
}
  function drawBackground(ctx){if(!S.bg)return;const base=Math.max(W/S.bg.width,H/S.bg.height),sc=base*S.bgScale,dw=S.bg.width*sc,dh=S.bg.height*sc;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,S.bgOpacity));ctx.drawImage(S.bg,(W-dw)/2+S.bgX,(H-dh)/2+S.bgY,dw,dh);ctx.restore()}
  function athleteGeometry(){if(!S.img)return null;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;return{x:(W-dw)/2+S.x,y:(H-dh)/2+S.y,w:dw,h:dh}}
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
  }
  function draw(){
    const c=q('lhCanvas');if(!c)return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    // CSMS_LINEUP_HEADSHOT_BACKGROUND_LAYER_V5
    drawBackground(ctx);
    drawPhoto(ctx);

    // CSMS_LINEUP_HEADSHOT_EXACT_MAIN_FADE_V4
    // Use the exact approved Main Athlete Headshot overlay pixels for the lower fade.
    // Clip away the upper header/title region so Lineup Headshot remains header-free.
    if(S.overlay){
      const overlayClipTop=320;
      ctx.drawImage(S.overlay,0,overlayClipTop,W,H-overlayClipTop,0,overlayClipTop,W,H-overlayClipTop);
    }

    if(!S.atlas)return;
    drawRasterText(ctx,S.first,'small',82,897,58,0,710);
    drawRasterText(ctx,S.last,'large',48,967,205,0,960);
    ctx.save();ctx.fillStyle='#f24a18';ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=5;ctx.fillRect(56,1194,575,7);ctx.restore();
    drawRasterText(ctx,S.classLine,'orange',58,1216,52,13,760);
  }
  function init(){
    buildCard();ensureSavedCardsPanel();renderSavedCards();
    document.addEventListener('click',e=>{
      const b=e.target&&e.target.closest?e.target.closest('[data-workspace="media"],button'):null;
      if(!b)return;
      const text=String(b.textContent||'').trim().toLowerCase();
      if((b.dataset&&b.dataset.workspace==='media')||text==='library')setTimeout(()=>{ensureSavedCardsPanel();renderSavedCards()},80);
    },true);
    new MutationObserver(()=>{buildCard();ensureSavedCardsPanel()}).observe(document.body,{childList:true,subtree:true});ensureAssets()
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
