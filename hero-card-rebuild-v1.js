(function(){
'use strict';

const VERSION='20260812-hero-rebuild-v1';
const BRIDGE='https://script.google.com/a/macros/christchurchschool.org/s/AKfycbwVpWix_ivzxwpEQxNTBGvJNpThQYjfRRG8T7CYMNPz3r9lB-JI6CowrskoQUAs67lt/exec';
const DB_NAME='ChristchurchMediaStudio';
const STORE='media';
const W=1080,H=1350;
const MASTER_NAME='CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png';
const FOOTER_NAME='HERO_FOOTER_OVERLAY_v1.png';
const MASTER_DIMS=[1023,1537];
const FOOTER_DIMS=[1080,1350];

let photo=null;
let currentProjectId='';
let lockedMaster=null;
let lockedFooter=null;
let drag=null;
let installed=false;

const $=id=>document.getElementById(id);

function openDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('Could not open Studio database.'));
  });
}

async function dbAll(){
  if(typeof window.mediaGetAll==='function'){
    try{return await window.mediaGetAll();}catch(_){ }
  }
  const db=await openDb();
  if(!db.objectStoreNames.contains(STORE)){db.close();return [];}
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>{const rows=req.result||[];db.close();resolve(rows);};
    req.onerror=()=>{db.close();reject(req.error);};
  });
}

async function dbPut(item){
  if(typeof window.mediaPut==='function'){
    try{await window.mediaPut(item);return;}catch(_){ }
  }
  const db=await openDb();
  if(!db.objectStoreNames.contains(STORE)){db.close();throw new Error('Studio media store is unavailable.');}
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}

async function dbDelete(id){
  const db=await openDb();
  if(!db.objectStoreNames.contains(STORE)){db.close();return;}
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  });
}

function imageFromSrc(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('Image could not be loaded.'));
    img.src=src;
  });
}

async function bridgeJson(params){
  const url=BRIDGE+'?'+new URLSearchParams(params).toString();
  const res=await fetch(url,{cache:'no-store'});
  if(!res.ok)throw new Error('Bridge request failed ('+res.status+').');
  const data=await res.json();
  if(!data||data.ok===false)throw new Error(data?.error||'Bridge request failed.');
  return data;
}

function rankMatch(m){
  const p=String(m?.path||'').toLowerCase();
  let score=0;
  if(p.includes('assets'))score+=20;
  if(p.includes('reference'))score+=20;
  if(p.includes('permanent'))score+=10;
  if(p.includes('studio'))score+=5;
  if(p.includes('backup')||p.includes('recovery'))score+=3;
  return score;
}

async function loadLockedFromBridge(name,dims){
  const found=await bridgeJson({action:'findfilerecursive',name});
  const matches=(found.matches||[]).slice().sort((a,b)=>rankMatch(b)-rankMatch(a));
  for(const match of matches){
    try{
      const payload=await bridgeJson({action:'file',fileId:match.id});
      if(!payload.data)continue;
      const img=await imageFromSrc('data:image/png;base64,'+payload.data);
      if(img.naturalWidth===dims[0]&&img.naturalHeight===dims[1])return img;
    }catch(_){ }
  }
  throw new Error('Exact locked asset not found: '+name);
}

async function loadFallback(path,dims){
  const img=await imageFromSrc(path+'?v='+VERSION);
  if(img.naturalWidth!==dims[0]||img.naturalHeight!==dims[1])throw new Error('Fallback asset failed validation.');
  return img;
}

async function ensureLockedAssets(){
  const status=$('heroRebuildStatus');
  if(lockedMaster&&lockedFooter)return true;
  if(status)status.textContent='Loading locked approved Hero artwork…';
  try{
    lockedMaster=await loadLockedFromBridge(MASTER_NAME,MASTER_DIMS);
    lockedFooter=await loadLockedFromBridge(FOOTER_NAME,FOOTER_DIMS);
  }catch(err){
    try{
      lockedMaster=await loadFallback('assets/Reference/'+MASTER_NAME,MASTER_DIMS);
      lockedFooter=await loadFallback('assets/Reference/'+FOOTER_NAME,FOOTER_DIMS);
    }catch(_){
      if(status)status.textContent='Locked Hero artwork is unavailable. The editor will not approximate it.';
      console.error('[Hero rebuild locked assets]',err);
      return false;
    }
  }
  if(status)status.textContent='Locked approved artwork loaded.';
  render();
  return true;
}

function workspaceHtml(){
  return `
  <div class="grid heroRebuildGrid">
    <section class="panel heroRebuildControls">
      <h2>Christchurch Hero Card — MASTER v1.0 🔒</h2>
      <div class="notice">The approved header, footer, gradients, logo treatment, typography positions, and decorative artwork are locked. Only the athlete photo and content fields below are editable.</div>

      <div class="control"><label for="heroProjectSelect">Saved Hero Cards</label><select id="heroProjectSelect"><option value="">New Hero Card</option></select></div>
      <div class="actions">
        <button id="heroNewProjectBtn" class="secondary" type="button">New Hero Card</button>
        <button id="heroDeleteProjectBtn" class="secondary" type="button">Delete</button>
      </div>

      <div class="control"><label for="heroProjectName">Project name</label><input id="heroProjectName" type="text" placeholder="Wylder Smith 2027"></div>
      <div class="row">
        <div class="control"><label for="heroFirstName">First name</label><input id="heroFirstName" type="text" placeholder="WYLDER"></div>
        <div class="control"><label for="heroLastName">Last name</label><input id="heroLastName" type="text" placeholder="SMITH"></div>
      </div>
      <div class="control"><label for="heroClassYear">Class year</label><input id="heroClassYear" type="text" placeholder="2027"></div>
      <div class="control"><label for="heroAchievement">Achievement / subtitle <span class="hint">optional</span></label><input id="heroAchievement" type="text" placeholder="STATE CHAMPION"></div>
      <div class="control"><label for="heroPhoto">Athlete photo</label><input id="heroPhoto" type="file" accept="image/*"></div>

      <div class="control"><label>Zoom <span class="value" id="heroScaleValue">100%</span></label><input id="heroPhotoScale" type="range" min="1" max="3" value="1" step="0.01"></div>
      <div class="row">
        <div class="control"><label>X position <span class="value" id="heroXValue">0</span></label><input id="heroPhotoX" type="range" min="-1000" max="1000" value="0" step="1"></div>
        <div class="control"><label>Y position <span class="value" id="heroYValue">0</span></label><input id="heroPhotoY" type="range" min="-1200" max="1200" value="0" step="1"></div>
      </div>
      <div class="hint">Drag the photo directly on the card. Use the mouse wheel or trackpad to zoom. Position is constrained only enough to prevent empty gaps.</div>

      <div class="actions">
        <button id="heroCenterPhotoBtn" class="secondary" type="button">Center Photo</button>
        <button id="heroBackTemplatesBtn" class="secondary" type="button">Back to Templates</button>
      </div>
      <div class="actions">
        <button id="heroSaveProjectBtn" class="primary" type="button">Save</button>
        <button id="heroExportBtn" class="primary" type="button">Export PNG</button>
      </div>
      <div id="heroRebuildStatus" class="status">Loading locked approved artwork…</div>
    </section>

    <section class="panel heroRebuildPreviewPanel">
      <h2>Hero Preview</h2>
      <div class="previewWrap"><canvas id="heroCanvas" width="1080" height="1350"></canvas></div>
      <div class="hint">1080 × 1350 • Approved master artwork locked • Preview and export use the same renderer</div>
    </section>
  </div>`;
}

function addStyles(){
  if($('hero-rebuild-style'))return;
  const s=document.createElement('style');
  s.id='hero-rebuild-style';
  s.textContent=`
    #workspace-heroes .heroRebuildGrid{grid-template-columns:minmax(320px,410px) minmax(0,1fr);align-items:start}
    #workspace-heroes .heroRebuildPreviewPanel .previewWrap{background:#e9eef4;padding:12px;border-radius:12px;display:flex;justify-content:center;overflow:auto}
    #workspace-heroes #heroCanvas{width:min(100%,540px);height:auto;background:#fff;box-shadow:0 12px 34px rgba(9,30,66,.18);cursor:grab;touch-action:none}
    #workspace-heroes .heroRebuildControls .actions{display:flex;gap:8px;flex-wrap:wrap}
    #workspace-heroes .heroRebuildControls .actions button{flex:1 1 140px}
    @media(max-width:900px){#workspace-heroes .heroRebuildGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}

function fields(){
  return {
    canvas:$('heroCanvas'),project:$('heroProjectName'),first:$('heroFirstName'),last:$('heroLastName'),year:$('heroClassYear'),achievement:$('heroAchievement'),scale:$('heroPhotoScale'),x:$('heroPhotoX'),y:$('heroPhotoY')
  };
}

function setStatus(text){if($('heroRebuildStatus'))$('heroRebuildStatus').textContent=text;}

function trackedText(ctx,text,x,y,spacing){
  let px=x;
  for(const ch of text){ctx.fillText(ch,px,y);px+=ctx.measureText(ch).width+spacing;}
}

function coverMetrics(){
  if(!photo)return null;
  const img=photo.img;
  const base=Math.max(W/img.naturalWidth,H/img.naturalHeight);
  const scale=base*(+fields().scale.value||1);
  return {img,scale,dw:img.naturalWidth*scale,dh:img.naturalHeight*scale};
}

function clampOffsets(){
  const f=fields(),m=coverMetrics();
  if(!m)return {x:0,y:0};
  const mx=Math.max(0,(m.dw-W)/2),my=Math.max(0,(m.dh-H)/2);
  let x=Math.max(-mx,Math.min(mx,+f.x.value||0));
  let y=Math.max(-my,Math.min(my,+f.y.value||0));
  x=Math.round(x);y=Math.round(y);
  f.x.value=x;f.y.value=y;
  return {x,y};
}

function drawPhoto(ctx){
  const m=coverMetrics();
  if(!m){
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#eef2f5');bg.addColorStop(1,'#83909d');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);return;
  }
  const o=clampOffsets();
  ctx.drawImage(m.img,(W-m.dw)/2+o.x,(H-m.dh)/2+o.y,m.dw,m.dh);
}

function drawLockedArtwork(ctx){
  if(lockedMaster){ctx.drawImage(lockedMaster,0,0,1023,218,0,0,1080,209);}
  if(lockedFooter){ctx.drawImage(lockedFooter,0,0,1080,1350);}
}

function drawEditableText(ctx){
  const f=fields();
  const first=(f.first.value||'FIRST').trim().toUpperCase();
  const last=(f.last.value||'LAST').trim().toUpperCase();
  const year=(f.year.value||'YEAR').trim().toUpperCase();
  const achievement=(f.achievement.value||'').trim().toUpperCase();

  ctx.textBaseline='top';ctx.textAlign='left';
  ctx.fillStyle='#ffffff';ctx.font='italic 700 58px Arial, sans-serif';trackedText(ctx,first,66,992,12);
  ctx.fillStyle='#ffffff';ctx.font='italic 800 162px "Arial Narrow", Arial, sans-serif';trackedText(ctx,last,56,1058,2);
  ctx.fillStyle='#f04b1a';ctx.font='italic 700 48px Arial, sans-serif';trackedText(ctx,'CLASS OF '+year,60,1248,10);
  if(achievement){ctx.fillStyle='#ffffff';ctx.font='italic 600 30px Arial, sans-serif';trackedText(ctx,achievement,60,1300,5);}
}

function updateLabels(){
  if(!$('heroScaleValue'))return;
  $('heroScaleValue').textContent=Math.round((+fields().scale.value||1)*100)+'%';
  $('heroXValue').textContent=fields().x.value;
  $('heroYValue').textContent=fields().y.value;
}

function render(){
  const f=fields();if(!f.canvas)return;
  const ctx=f.canvas.getContext('2d');ctx.clearRect(0,0,W,H);
  drawPhoto(ctx);
  drawLockedArtwork(ctx);
  drawEditableText(ctx);
  updateLabels();
}

async function setPhotoBlob(blob,fileName){
  if(!blob){photo=null;render();return;}
  const url=URL.createObjectURL(blob);
  const img=await imageFromSrc(url);
  photo={img,blob,fileName:fileName||blob.name||'athlete-photo'};
  fields().scale.value='1';fields().x.value='0';fields().y.value='0';
  render();
}

function resetForm(){
  currentProjectId='';photo=null;
  const f=fields();
  f.project.value='';f.first.value='';f.last.value='';f.year.value='';f.achievement.value='';f.scale.value='1';f.x.value='0';f.y.value='0';
  $('heroPhoto').value='';$('heroProjectSelect').value='';
  render();setStatus('New Hero Card ready. Add an athlete photo and content.');
}

async function refreshProjects(selectId){
  const rows=(await dbAll()).filter(x=>x&&(x.type==='heroProject'||x.recordType==='heroProject')).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  const sel=$('heroProjectSelect');
  sel.innerHTML='<option value="">New Hero Card</option>';
  rows.forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.projectName||[r.first,r.last,r.year].filter(Boolean).join(' ')||'Hero Card';sel.appendChild(o);});
  if(selectId)sel.value=selectId;
}

async function loadProject(id){
  if(!id){resetForm();return;}
  const row=(await dbAll()).find(x=>x&&x.id===id);
  if(!row){setStatus('Saved Hero Card could not be found.');return;}
  currentProjectId=row.id;
  const f=fields();
  f.project.value=row.projectName||'';f.first.value=row.first||'';f.last.value=row.last||'';f.year.value=row.year||'';f.achievement.value=row.achievement||'';
  f.scale.value=String(row.photoTransform?.scale??1);f.x.value=String(row.photoTransform?.x??0);f.y.value=String(row.photoTransform?.y??0);
  if(row.photoFile||row.originalFile||row.photoBlob){
    const blob=row.photoFile||row.originalFile||row.photoBlob;
    const url=URL.createObjectURL(blob);photo={img:await imageFromSrc(url),blob,fileName:row.photoName||blob.name||'athlete-photo'};
  }else photo=null;
  render();setStatus('Loaded '+(row.projectName||'Hero Card')+'.');
}

async function saveProject(){
  const f=fields();
  const first=f.first.value.trim(),last=f.last.value.trim(),year=f.year.value.trim();
  if(!first||!last||!year){setStatus('Enter first name, last name, and class year.');return;}
  if(!photo){setStatus('Choose an athlete photo first.');return;}
  if(!await ensureLockedAssets())return;

  const id=currentProjectId||'hero_project_'+Date.now();
  currentProjectId=id;
  const projectName=f.project.value.trim()||`${first} ${last} ${year}`;
  f.project.value=projectName;
  const transform={scale:+f.scale.value,x:+f.x.value,y:+f.y.value};
  const now=new Date().toISOString();
  await dbPut({id,type:'heroProject',recordType:'heroProject',templateId:'christchurch_hero_card_template',templateVersion:'rebuild-v1',projectName,first,last,year,achievement:f.achievement.value.trim(),photoFile:photo.blob,photoName:photo.fileName,photoTransform:transform,updatedAt:now,createdAt:now});

  render();
  const heroBlob=await new Promise(resolve=>f.canvas.toBlob(resolve,'image/png'));
  const all=await dbAll();
  const existing=all.find(x=>x&&(x.type==='athlete'||x.recordType==='athlete')&&String(x.first||'').toLowerCase()===first.toLowerCase()&&String(x.last||'').toLowerCase()===last.toLowerCase()&&String(x.year||'')===String(year));
  await dbPut({...existing,id:existing?.id||'athlete_'+Date.now(),type:'athlete',recordType:'athlete',first,last,year,originalFile:photo.blob,heroBlob,crop:transform,template:'approved',updatedAt:now,created:existing?.created||now});

  await refreshProjects(id);
  if(typeof window.refreshAthleteLibrary==='function'){try{await window.refreshAthleteLibrary();}catch(_){ }}
  setStatus(projectName+' saved. Master artwork remains unchanged.');
}

async function deleteProject(){
  if(!currentProjectId){setStatus('Select a saved Hero Card to delete.');return;}
  const name=fields().project.value||'this Hero Card';
  if(!confirm('Delete '+name+'? This removes only the saved project, not the master template.'))return;
  await dbDelete(currentProjectId);resetForm();await refreshProjects();setStatus('Saved Hero Card deleted.');
}

function exportPng(){
  if(!photo){setStatus('Choose an athlete photo first.');return;}
  if(!lockedMaster||!lockedFooter){setStatus('Locked approved artwork must load before export.');return;}
  render();
  fields().canvas.toBlob(blob=>{
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    const name=(fields().project.value.trim()||`${fields().first.value}_${fields().last.value}`).replace(/[^a-z0-9_-]+/gi,'_');
    a.download=(name||'Christchurch_Hero_Card')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    setStatus('PNG exported from the same locked renderer shown in preview.');
  },'image/png');
}

function goTemplates(){
  const btn=[...document.querySelectorAll('button,[data-workspace]')].find(el=>String(el.dataset?.workspace||'').toLowerCase()==='templates'||el.textContent?.trim()==='Template Library');
  if(btn){btn.click();return;}
  document.querySelectorAll('.workspace').forEach(w=>w.classList.toggle('active',w.id==='workspace-templates'));
}

function bind(){
  $('heroPhoto').addEventListener('change',async e=>{const file=e.target.files?.[0];if(file){await setPhotoBlob(file,file.name);setStatus('Photo loaded. Drag to position or use Zoom / X / Y.');}});
  ['heroFirstName','heroLastName','heroClassYear','heroAchievement','heroProjectName','heroPhotoScale','heroPhotoX','heroPhotoY'].forEach(id=>$(id).addEventListener('input',render));
  $('heroCenterPhotoBtn').addEventListener('click',()=>{fields().scale.value='1';fields().x.value='0';fields().y.value='0';render();});
  $('heroNewProjectBtn').addEventListener('click',resetForm);
  $('heroSaveProjectBtn').addEventListener('click',saveProject);
  $('heroDeleteProjectBtn').addEventListener('click',deleteProject);
  $('heroExportBtn').addEventListener('click',exportPng);
  $('heroBackTemplatesBtn').addEventListener('click',goTemplates);
  $('heroProjectSelect').addEventListener('change',e=>loadProject(e.target.value));

  const canvas=$('heroCanvas');
  canvas.addEventListener('pointerdown',e=>{if(!photo)return;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';drag={cx:e.clientX,cy:e.clientY,x:+fields().x.value,y:+fields().y.value};});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const r=canvas.getBoundingClientRect();fields().x.value=Math.round(drag.x+(e.clientX-drag.cx)*(W/r.width));fields().y.value=Math.round(drag.y+(e.clientY-drag.cy)*(H/r.height));render();});
  const stop=()=>{drag=null;canvas.style.cursor='grab';};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
  canvas.addEventListener('wheel',e=>{if(!photo)return;e.preventDefault();const f=fields();f.scale.value=Math.max(1,Math.min(3,(+f.scale.value)*(e.deltaY<0?1.05:.95))).toFixed(2);render();},{passive:false});
}

async function install(){
  if(installed)return;
  const old=$('workspace-heroes');if(!old)return;
  installed=true;addStyles();
  const wasActive=old.classList.contains('active');
  const replacement=old.cloneNode(false);replacement.id='workspace-heroes';replacement.className=old.className;replacement.innerHTML=workspaceHtml();old.replaceWith(replacement);if(wasActive)replacement.classList.add('active');
  bind();resetForm();await refreshProjects();await ensureLockedAssets();
  window.__CSMS_HERO_REBUILD__={version:VERSION,render,refreshProjects,ensureLockedAssets};
  console.info('[CSMS Hero rebuild]',{ok:true,version:VERSION,canvas:'1080x1350',lockedArtwork:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));
else setTimeout(install,0);
})();
