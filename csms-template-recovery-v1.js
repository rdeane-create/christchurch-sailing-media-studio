(function(){
'use strict';
const VERSION='20260815-welcome-athlete-main-drive-v14-continuous-photo-fade-wedge';
const INSTAGRAM_W=1080,INSTAGRAM_H=1350;
const LEGACY_DB='ChristchurchMediaStudio';
const LEGACY_STORE='media';
const MASTER={id:'christchurch_welcome_aboard_template',name:'WELCOME ABOARD — MASTER v1.0 🔒',category:'hero',version:1};

function safeParse(raw,fallback){try{const v=JSON.parse(raw);return v==null?fallback:v;}catch(_){return fallback;}}
function openLegacyDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(LEGACY_DB);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Could not open legacy Studio database.'));});}
async function legacyGetAll(){
  if(typeof window.mediaGetAll==='function'){try{return await window.mediaGetAll();}catch(_){}}
  try{const db=await openLegacyDb();if(!db.objectStoreNames.contains(LEGACY_STORE)){db.close();return [];}return await new Promise((resolve,reject)=>{const tx=db.transaction(LEGACY_STORE,'readonly');const req=tx.objectStore(LEGACY_STORE).getAll();req.onsuccess=()=>{const rows=req.result||[];db.close();resolve(rows);};req.onerror=()=>{db.close();reject(req.error);};});}catch(_){return [];}
}
async function legacyPut(item){
  if(typeof window.mediaPut==='function'){try{await window.mediaPut(item);return true;}catch(_){}}
  try{const db=await openLegacyDb();if(!db.objectStoreNames.contains(LEGACY_STORE)){db.close();return false;}return await new Promise((resolve,reject)=>{const tx=db.transaction(LEGACY_STORE,'readwrite');tx.objectStore(LEGACY_STORE).put(item);tx.oncomplete=()=>{db.close();resolve(true);};tx.onerror=()=>{db.close();reject(tx.error);};});}catch(_){return false;}
}
async function removeUnusedWelcomeDuplicate(){
  const TEMPLATE_KEY='christchurch_creative_templates_v1';
  const current=safeParse(localStorage.getItem(TEMPLATE_KEY)||'[]',[]);
  if(Array.isArray(current)){
    let kept=false;
    const next=[];
    for(const item of current){
      const isWelcome=item&&/WELCOME ABOARD/i.test(`${String(item.id||'')} ${String(item.name||'')}`);
      if(!isWelcome){next.push(item);continue;}
      if(String(item.id||'')===MASTER.id&&!kept){
        next.push({...item,id:MASTER.id,name:MASTER.name,category:item.category||MASTER.category,version:item.version||MASTER.version,locked:true,approved:true});
        kept=true;
      }
    }
    if(!kept)next.push({...MASTER,builtin:true,locked:true,approved:true,createdAt:new Date().toISOString()});
    localStorage.setItem(TEMPLATE_KEY,JSON.stringify(next));
  }
  try{
    const rows=await legacyGetAll();
    const stale=rows.filter(item=>item&&item.type==='template'&&/WELCOME ABOARD/i.test(`${String(item.id||'')} ${String(item.name||'')}`)&&String(item.id||'')!==MASTER.id);
    for(const item of stale){
      if(typeof window.mediaDelete==='function'){
        try{await window.mediaDelete(item.id);continue;}catch(_){}
      }
      try{
        const db=await openLegacyDb();
        if(db.objectStoreNames.contains(LEGACY_STORE))await new Promise((resolve,reject)=>{const tx=db.transaction(LEGACY_STORE,'readwrite');tx.objectStore(LEGACY_STORE).delete(item.id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
        db.close();
      }catch(_){}
    }
  }catch(_){}
}
function normalizeAthleteRecord(item){if(!item)return null;return {...item,id:item.id||'',first:item.first||item.firstName||'',last:item.last||item.lastName||'',year:item.year||item.classYear||item.graduationYear||'',heroBlob:item.heroBlob||item.heroImage||null};}
function welcomeBase64ToBlob(base64,mimeType){const binary=atob(base64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:mimeType||'image/png'});}
async function welcomeBridgeCall(action,payload={}){if(typeof window.csmsAuthenticatedBridgeCall!=='function'&&typeof csmsAuthenticatedBridgeCall!=='function')throw new Error('Google Drive Bridge is unavailable. Refresh Studio and connect Google Drive.');const call=window.csmsAuthenticatedBridgeCall||csmsAuthenticatedBridgeCall;const ensure=window.csmsEnsureAuthenticatedBridge||((typeof csmsEnsureAuthenticatedBridge==='function')?csmsEnsureAuthenticatedBridge:null);if(ensure)await Promise.race([ensure({userInitiated:true}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Google Drive connection timed out.')),12000))]);return await Promise.race([call(action,payload,{userInitiated:true}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Google Drive did not respond to '+action+' within 20 seconds.')),20000))]);}
async function getAthleteMainSavedCards(){const result=await welcomeBridgeCall('listSavedCards',{});if(!result||!result.ok)throw new Error(result&&result.error?result.error:'Drive Saved Cards library is unavailable');return (Array.isArray(result.cards)?result.cards:[]).filter(card=>{const type=String(card.cardType||card.type||'').toUpperCase();const name=String(card.name||'').toUpperCase();return type==='ATHLETE HEADSHOT CARD'||name.includes('ATHLETE HEADSHOT CARD');}).map(card=>({id:String(card.fileId||card.id||''),fileId:String(card.fileId||card.id||''),first:card.first||'',last:card.last||'',year:String(card.classLine||'').replace(/[^0-9]/g,'')||'',classLine:card.classLine||'',name:card.name||'Athlete Main Headshot',source:'drive-athlete-main'})).filter(card=>card.fileId);}
async function getAthleteMainSavedCardBlob(fileId){const result=await welcomeBridgeCall('getSavedCard',{fileId});if(!result||!result.ok||!result.card||!result.card.data)throw new Error('Athlete Main Headshot card could not be loaded from Drive');return welcomeBase64ToBlob(result.card.data,result.card.mimeType||'image/png');}
async function getUnifiedAthletesCompat(){
  if(typeof window.getUnifiedAthletes==='function'){try{const rows=await window.getUnifiedAthletes();if(Array.isArray(rows))return rows.map(normalizeAthleteRecord).filter(Boolean);}catch(_){}}
  const rows=await legacyGetAll();return rows.filter(item=>item&&(item.type==='athlete'||item.recordType==='athlete'||((item.first||item.last||item.firstName||item.lastName)&&(item.heroBlob||item.heroImage)))).map(normalizeAthleteRecord).filter(Boolean);
}
function injectStyles(){
  if(document.getElementById('csms-welcome-original-style'))return;
  const style=document.createElement('style');style.id='csms-welcome-original-style';style.textContent=`
  #workspace-welcome.csmsRecoveredWorkspace{display:none}#workspace-welcome.csmsRecoveredWorkspace.active{display:block}
  #workspace-welcome .heroMasterShell{display:grid;grid-template-columns:minmax(300px,390px) minmax(0,1fr);gap:16px;align-items:start}
  #workspace-welcome .panel{background:#fff;border:1px solid rgba(15,40,72,.12);border-radius:14px;padding:16px}
  #workspace-welcome .control{margin:10px 0}#workspace-welcome label{display:block;font-weight:700;margin-bottom:5px}
  #workspace-welcome input,#workspace-welcome select{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbd3dd;border-radius:8px;background:#fff}
  #workspace-welcome .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
  #workspace-welcome button{cursor:pointer;border:0;border-radius:8px;padding:9px 12px;font-weight:800}
  #workspace-welcome .primary{background:#f4511e;color:#fff}#workspace-welcome .secondary{background:#e8edf3;color:#102d4c}
  #workspace-welcome .notice,#workspace-welcome .status,#workspace-welcome .hint{margin:8px 0;color:#44566c;font-size:13px;line-height:1.4}
  #workspace-welcome .previewWrap{background:#eef2f6;border-radius:12px;padding:10px;display:flex;justify-content:center;overflow:auto}
  #workspace-welcome canvas{width:min(100%,540px);height:auto;aspect-ratio:4/5;box-shadow:0 8px 30px rgba(0,0,0,.15);background:#06142c}
  @media(max-width:900px){#workspace-welcome .heroMasterShell{grid-template-columns:1fr}}
  `;document.head.appendChild(style);
}
function ensureWorkspace(){
  let ws=document.getElementById('workspace-welcome');if(ws)ws.remove();
  const host=document.querySelector('main')||document.querySelector('.appShell')||document.querySelector('.workspace')?.parentElement||document.body;
  const wrap=document.createElement('div');wrap.innerHTML=`<div id="workspace-welcome" class="workspace csmsRecoveredWorkspace" data-csms-recovered="welcome-original">
  <div class="heroMasterShell"><section class="panel heroBuilderControls"><h2>Welcome Aboard — MASTER v1.0 🔒</h2>
  <div class="notice">Launch this template from the Template Library, choose a saved Athlete Main Headshot card below, then save or export as an image or video. The Athlete Main Headshot card itself is never rebuilt or changed.</div>
  <div class="control"><label for="welcomeHeroSelect">Athlete Main Headshot Cards</label><select id="welcomeHeroSelect"><option value="">Select an Athlete Main Headshot card</option></select></div>
  <div class="control"><label for="welcomeProjectName">Project name</label><input id="welcomeProjectName" type="text" value="Welcome Aboard — Untitled"></div>
  <div class="actions"><button id="welcomeBackBtn" class="secondary" type="button">Back to Templates</button><button id="welcomePlayBtn" class="secondary" type="button">Play Drop</button></div>
  <button id="welcomeSaveBtn" class="secondary" type="button" style="width:100%;margin-top:10px">Save Welcome Aboard</button>
  <button id="welcomeExportBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export PNG</button>
  <button id="welcomeExportVideoBtn" class="primary" type="button" style="width:100%;margin-top:10px">Export Video</button>
  <a id="welcomeDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download PNG</a>
  <a id="welcomeVideoDownloadFallback" class="primary" style="display:none;margin-top:10px;text-align:center;text-decoration:none;padding:9px 12px;border-radius:8px" download>Download Video</a>
  <div id="welcomeStatus" class="status">Choose an Athlete Main Headshot card.</div></section>
  <section class="panel heroBuilderPreview"><h2>Live Preview</h2><div class="previewWrap heroPreviewWrap"><canvas id="welcomeCanvas" width="1080" height="1350"></canvas></div>
  <div class="hint">Instagram portrait • 1080 × 1350 • 4:5 • Athlete Main composition preserved</div></section></div></div>`;
  host.appendChild(wrap.firstElementChild);
}
function showWorkspace(name){
  if(name==='welcome'){
    document.querySelectorAll('.workspace').forEach(w=>w.classList.toggle('active',w.id==='workspace-welcome'));
    document.querySelectorAll('.workspaceTab').forEach(b=>b.classList.toggle('active',b.dataset.workspace==='welcome'));
    refreshWelcomeHeroChoices();drawWelcomeCard();return;
  }
  if(typeof window.activateWorkspace==='function'){try{window.activateWorkspace(name);return;}catch(_){}}
  document.querySelectorAll('.workspace').forEach(w=>w.classList.toggle('active',w.id===`workspace-${name}`));
}
function roundedRectPath(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();}
let welcomeHeroRecords=[],welcomeHeroImage=null,welcomeDropProgress=1,welcomeAnimationFrame=0;
function welcomeEls(){return{select:document.getElementById('welcomeHeroSelect'),project:document.getElementById('welcomeProjectName'),canvas:document.getElementById('welcomeCanvas'),status:document.getElementById('welcomeStatus'),fallback:document.getElementById('welcomeDownloadFallback'),videoFallback:document.getElementById('welcomeVideoDownloadFallback')};}
async function refreshWelcomeHeroChoices(preferredId=''){
  const e=welcomeEls();if(!e.select)return[];const previous=preferredId||e.select.value;e.select.innerHTML='<option value="">Loading Athlete Main Headshot cards…</option>';e.select.disabled=true;try{welcomeHeroRecords=await getAthleteMainSavedCards();welcomeHeroRecords.sort((a,b)=>String(a.last||'').localeCompare(String(b.last||''))||String(a.first||'').localeCompare(String(b.first||'')));e.select.innerHTML='<option value="">Select an Athlete Main Headshot card</option>';welcomeHeroRecords.forEach(item=>{const opt=document.createElement('option');opt.value=item.fileId;const athlete=`${item.first||''} ${item.last||''}`.trim();opt.textContent=athlete||(String(item.name||'Athlete Main Headshot').replace(/\.png$/i,''));e.select.appendChild(opt);});if(previous&&welcomeHeroRecords.some(x=>x.fileId===previous))e.select.value=previous;if(!welcomeHeroRecords.length)e.status.textContent='No Athlete Main Headshot cards found in Google Drive. Save an Athlete Main Headshot card first.';else e.status.textContent='Choose an Athlete Main Headshot card.';return welcomeHeroRecords;}catch(err){welcomeHeroRecords=[];e.select.innerHTML='<option value="">Select an Athlete Main Headshot card</option>';e.status.textContent=`Could not load Athlete Main Headshot cards: ${err.message}`;return[];}finally{e.select.disabled=false;}
}
async function loadWelcomeHero(id){const e=welcomeEls(),record=welcomeHeroRecords.find(item=>item.fileId===id||item.id===id);if(!record){welcomeHeroImage=null;drawWelcomeCard();return;}e.status.textContent='Loading Athlete Main Headshot card…';try{const blob=await getAthleteMainSavedCardBlob(record.fileId||record.id),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{welcomeHeroImage=img;welcomeDropProgress=1;const athlete=`${record.first||''} ${record.last||''}`.trim();e.project.value=athlete?`Welcome Aboard — ${athlete}`:'Welcome Aboard — Untitled';drawWelcomeCard();e.status.textContent=athlete?`Using Athlete Main Headshot: ${athlete}`:'Using Athlete Main Headshot card.';setTimeout(()=>URL.revokeObjectURL(url),60000);};img.onerror=()=>{URL.revokeObjectURL(url);e.status.textContent='Could not open the Athlete Main Headshot card.';};img.src=url;}catch(err){welcomeHeroImage=null;drawWelcomeCard();e.status.textContent=`Could not load Athlete Main Headshot card: ${err.message}`;}}
function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // One continuous lower-right announcement wedge. The top dissolves into the
  // Athlete Main photo, the orange stays behind the type, and the lower field
  // blends smoothly into navy without breaking the wedge apart.
  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'#ff672d');
  grad.addColorStop(.18,'#f85a24');
  grad.addColorStop(.34,'#f4511e');
  grad.addColorStop(.68,'#f4511e');
  grad.addColorStop(.76,'#ed5021');
  grad.addColorStop(.84,'#d44728');
  grad.addColorStop(.90,'#a13e34');
  grad.addColorStop(.95,'#593744');
  grad.addColorStop(1,'#17304d');

  lx.beginPath();
  lx.moveTo(leftTop,topY);
  lx.lineTo(rightX,topY);
  lx.lineTo(rightX,1350);
  lx.lineTo(leftBottom,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  lx.save();
  lx.beginPath();
  lx.moveTo(leftTop-8,topY);
  lx.lineTo(leftTop+14,topY);
  lx.lineTo(leftBottom+14,1350);
  lx.lineTo(leftBottom-8,1350);
  lx.closePath();
  lx.shadowColor='rgba(2,18,40,.18)';
  lx.shadowBlur=14;
  lx.fillStyle='rgba(2,18,40,.08)';
  lx.fill();
  lx.restore();

  const rail=(offset,width,alpha)=>{
    lx.save();
    lx.beginPath();
    lx.moveTo(leftTop+offset,topY);
    lx.lineTo(leftBottom+offset,1350);
    lx.lineWidth=width;
    lx.strokeStyle=`rgba(255,255,255,${alpha})`;
    lx.stroke();
    lx.restore();
  };
  rail(15,8,.96);
  rail(29,3,.72);

  // Apply one full-height alpha mask. This is the key: the mask becomes fully
  // opaque below the top transition and stays opaque, so the wedge remains one
  // continuous shape instead of leaving a detached orange fragment.
  lx.globalCompositeOperation='destination-in';
  const photoFade=lx.createLinearGradient(0,topY,0,1350);
  photoFade.addColorStop(0,'rgba(0,0,0,0)');
  photoFade.addColorStop(.08,'rgba(0,0,0,.08)');
  photoFade.addColorStop(.16,'rgba(0,0,0,.24)');
  photoFade.addColorStop(.24,'rgba(0,0,0,.52)');
  photoFade.addColorStop(.32,'rgba(0,0,0,.82)');
  photoFade.addColorStop(.38,'rgba(0,0,0,1)');
  photoFade.addColorStop(1,'rgba(0,0,0,1)');
  lx.fillStyle=photoFade;
  lx.fillRect(0,topY,1080,1350-topY);
  lx.globalCompositeOperation='source-over';

  ctx.drawImage(layer,0,0);

  // Keep both words fully inside the strong-orange middle of the wedge.
  const textY=1060;
  const leftAtText=leftTop+(leftBottom-leftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+4;
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.34)';
  ctx.shadowBlur=7;
  ctx.shadowOffsetY=3;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
  ctx.font=`700 40px ${family}`;
  ctx.fillText('WELCOME',midX,1004);
  ctx.font=`900 78px ${family}`;
  ctx.fillText('ABOARD',midX,1094);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-54,1157,108,4);
  ctx.restore();
}
function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;if(e.canvas.width!==INSTAGRAM_W)e.canvas.width=INSTAGRAM_W;if(e.canvas.height!==INSTAGRAM_H)e.canvas.height=INSTAGRAM_H;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,INSTAGRAM_W,INSTAGRAM_H);if(welcomeHeroImage){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(welcomeHeroImage,0,0,INSTAGRAM_W,INSTAGRAM_H);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{ctx.fillStyle='#06142c';ctx.fillRect(0,0,INSTAGRAM_W,INSTAGRAM_H);ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot card',INSTAGRAM_W/2,INSTAGRAM_H/2);}}
function playWelcomeDrop(){if(!welcomeHeroImage)return;cancelAnimationFrame(welcomeAnimationFrame);const duration=720,started=performance.now();function frame(now){const t=Math.min(1,(now-started)/duration),settle=t<.84?(t/.84):1+Math.sin((t-.84)/.16*Math.PI)*.018;welcomeDropProgress=Math.min(1.018,settle);drawWelcomeCard();if(t<1)welcomeAnimationFrame=requestAnimationFrame(frame);else{welcomeDropProgress=1;drawWelcomeCard();}}welcomeAnimationFrame=requestAnimationFrame(frame);}
async function saveCanvasToLegacy(collection,name,selected,canvas){const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not render PNG.')),'image/png'));await legacyPut({id:`${collection}_${Date.now()}_${Math.random().toString(36).slice(2)}`,type:'creative',collection,name,first:selected.first||'',last:selected.last||'',year:selected.year||'',heroSourceId:selected.id||'',blob,created:new Date().toISOString()});return blob;}
function triggerBlobDownload(blob,filename,fallback){const url=URL.createObjectURL(blob);fallback.href=url;fallback.download=filename;fallback.textContent=`Download ${filename}`;fallback.style.display='block';const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportCanvasVideo(canvas,drawFrame,filename){if(!canvas.captureStream||typeof MediaRecorder==='undefined')throw new Error('Video export is not supported in this browser.');const stream=canvas.captureStream(30);let mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm;codecs=vp8';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';const chunks=[],recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});recorder.ondataavailable=ev=>{if(ev.data&&ev.data.size)chunks.push(ev.data);};const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=ev=>reject(ev.error||new Error('Video recording failed.'));});recorder.start();const started=performance.now(),duration=2200;function frame(now){const elapsed=now-started;drawFrame(Math.min(1,elapsed/900));if(elapsed<duration)requestAnimationFrame(frame);else{drawFrame(1);setTimeout(()=>recorder.stop(),120);}}requestAnimationFrame(frame);await done;return{blob:new Blob(chunks,{type:mime}),filename:`${filename}.webm`};}
function cleanFilename(value,fallback){return(value||fallback).replace(/[^a-z0-9 _—-]+/gi,'').trim()||fallback;}
async function saveWelcome(){const e=welcomeEls();if(!welcomeHeroImage){e.status.textContent='Choose an Athlete Main Headshot card first.';return;}welcomeDropProgress=1;drawWelcomeCard();try{const selected=welcomeHeroRecords.find(item=>item.id===e.select.value)||{},name=(e.project.value||'Welcome Aboard').trim();await saveCanvasToLegacy('welcome',name,selected,e.canvas);const key='christchurch_welcome_aboard_saves_v1',existing=safeParse(localStorage.getItem(key)||'[]',[]),rows=Array.isArray(existing)?existing:[];rows.unshift({id:`welcome_${Date.now()}_${Math.random().toString(36).slice(2)}`,name,first:selected.first||'',last:selected.last||'',year:selected.year||'',heroSourceId:selected.id||'',created:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows.slice(0,100)));e.status.textContent='Welcome Aboard saved.';}catch(err){e.status.textContent=`Save failed: ${err.message}`;}}
function exportWelcomePng(){const e=welcomeEls();if(!welcomeHeroImage){e.status.textContent='Choose an Athlete Main Headshot card first.';return;}welcomeDropProgress=1;drawWelcomeCard();e.canvas.toBlob(blob=>{if(!blob){e.status.textContent='Could not create PNG.';return;}const project=cleanFilename(e.project.value,'Welcome Aboard');triggerBlobDownload(blob,`${project}.png`,e.fallback);e.status.textContent='Welcome Aboard PNG prepared.';},'image/png');}
async function exportWelcomeVideo(){const e=welcomeEls();if(!welcomeHeroImage){e.status.textContent='Choose an Athlete Main Headshot card first.';return;}const project=cleanFilename(e.project.value,'Welcome Aboard'),result=await exportCanvasVideo(e.canvas,p=>{welcomeDropProgress=p;drawWelcomeCard();},project);triggerBlobDownload(result.blob,result.filename,e.videoFallback);welcomeDropProgress=1;drawWelcomeCard();e.status.textContent='Welcome Aboard video prepared.';}
function bindEvents(){document.getElementById('welcomeHeroSelect')?.addEventListener('change',e=>loadWelcomeHero(e.target.value));document.getElementById('welcomeBackBtn')?.addEventListener('click',()=>showWorkspace('templates'));document.getElementById('welcomePlayBtn')?.addEventListener('click',playWelcomeDrop);document.getElementById('welcomeSaveBtn')?.addEventListener('click',saveWelcome);document.getElementById('welcomeExportBtn')?.addEventListener('click',exportWelcomePng);document.getElementById('welcomeExportVideoBtn')?.addEventListener('click',()=>exportWelcomeVideo().catch(err=>{welcomeEls().status.textContent=`Video export failed: ${err.message}`;}));}
function ensureOriginalRowIfMissing(){const list=document.getElementById('templateLibraryList');if(!list)return false;const rows=[...list.children].filter(row=>/WELCOME ABOARD/i.test(String(row.textContent||'')));if(rows.length){const preferred=rows.find(row=>String(row.dataset?.csmsTemplateId||'')===MASTER.id)||rows.find(row=>![...row.querySelectorAll('button')].some(b=>/delete/i.test(String(b.textContent||''))))||rows[0];rows.forEach(row=>{if(row!==preferred)row.remove();});return true;}const row=document.createElement('div');row.className='csmsRecoveredTemplateRow athleteItem';row.dataset.csmsTemplateId=MASTER.id;const icon=document.createElement('div');icon.textContent='T';icon.style.fontWeight='900';icon.style.fontSize='22px';const label=document.createElement('span');label.textContent=`${MASTER.name} • Hero Cards • v${MASTER.version}`;const actions=document.createElement('div');const open=document.createElement('button');open.className='tiny secondary';open.type='button';open.textContent='Open';open.addEventListener('click',()=>showWorkspace('welcome'));actions.appendChild(open);row.append(icon,label,actions);list.appendChild(row);return true;}
function monitorLibrary(){const install=()=>{const list=document.getElementById('templateLibraryList');if(!list)return false;ensureOriginalRowIfMissing();const observer=new MutationObserver(()=>queueMicrotask(ensureOriginalRowIfMissing));observer.observe(list,{childList:true,subtree:false});return true;};if(install())return;let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer);},250);}
function installRouting(){if(window.__CSMS_WELCOME_ORIGINAL_ROUTING__)return;window.__CSMS_WELCOME_ORIGINAL_ROUTING__=true;document.addEventListener('click',event=>{if(!event.target||!event.target.closest)return;const list=document.getElementById('templateLibraryList');if(!list||!list.contains(event.target))return;const row=event.target.closest('.athleteItem')||event.target.closest('.csmsRecoveredTemplateRow')||event.target.closest('#templateLibraryList > div');if(!row||!/WELCOME ABOARD/i.test(String(row.textContent||'')))return;const button=event.target.closest('button');if(button){const action=String(button.textContent||'').trim().toLowerCase();if(action!=='open'&&action!=='create from template')return;}event.preventDefault();event.stopPropagation();if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();window.__CSMS_LAST_WELCOME_ROW__={text:String(row.textContent||'').trim(),id:String(row.dataset?.csmsTemplateId||''),className:String(row.className||'')};showWorkspace('welcome');},true);}
async function init(){injectStyles();ensureWorkspace();bindEvents();installRouting();await removeUnusedWelcomeDuplicate();try{if(typeof window.refreshTemplateLibrary==='function')await window.refreshTemplateLibrary();}catch(_){}monitorLibrary();drawWelcomeCard();window.CSMSWelcomeOriginal={version:VERSION,open:()=>showWorkspace('welcome'),refresh:refreshWelcomeHeroChoices,lastOpenedRow:()=>window.__CSMS_LAST_WELCOME_ROW__||null};console.info('[CSMS] Original Welcome Aboard restored',VERSION);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();