(()=>{
'use strict';
const VERSION='2.0.0';
const W=1080,H=1350;
const DB_NAME='ChristchurchMediaStudio',STORE='media';
const HEADER_SRC='assets/Reference/CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png';
const FOOTER_SRC='assets/Reference/HERO_FOOTER_OVERLAY_v1.png';
const FONT_FAMILY='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",sans-serif';

const state={
  projectName:'Hero Card — Untitled',
  firstName:'WYLDER',lastName:'SMITH',year:'CLASS OF 2027',optional:'',
  scale:1,offsetX:0,offsetY:0,
  photoFile:null,photoImg:null,
  headerImg:null,footerImg:null,
  canvas:null,ctx:null,active:false,installed:false
};

const q=id=>document.getElementById(id);
const els=()=>({
  builder:q('heroCardBuilder'),wrap:q('heroBuilderCanvasWrap'),status:q('heroBuilderStatus'),project:q('heroBuilderProjectName'),
  upload:q('heroBuilderUploadPhotoBtn'),saved:q('heroBuilderSavedHeroes'),save:q('heroBuilderSaveBtn'),saveBottom:q('heroBuilderSaveBottomBtn'),
  exportBottom:q('heroBuilderExportBottomBtn'),next:q('heroBuilderCreateNextBtn'),nextBottom:q('heroBuilderCreateNextBottomBtn'),back:q('heroBuilderBackTemplatesBtn'),
  first:q('heroBuilderFirstNameInput'),last:q('heroBuilderLastNameInput'),year:q('heroBuilderGraduationYearInput'),optional:q('heroBuilderOptionalTextInput'),
  scale:q('heroBuilderScale'),x:q('heroBuilderOffsetX'),y:q('heroBuilderOffsetY'),reset:q('heroBuilderResetCropBtn')
});

function setStatus(msg){const e=els().status;if(e)e.textContent=msg;}
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src+(src.includes('?')?'&':'?')+'v='+encodeURIComponent(VERSION);});}
function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function getAll(){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
async function put(item){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(item);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}

function ensureCanvas(){
  const e=els(); if(!e.wrap)return;
  if(!state.canvas){
    const c=document.createElement('canvas');c.id='heroMasterCanvasV2';c.width=W;c.height=H;c.style.width='min(100%,540px)';c.style.height='auto';c.style.aspectRatio='4/5';c.style.background='#fff';c.style.boxShadow='0 18px 50px rgba(7,21,47,.22)';c.style.border='0';c.style.borderRadius='0';
    state.canvas=c;state.ctx=c.getContext('2d');
  }
  const old=q('creativeCanvas'); if(old){old.style.display='none';}
  if(state.canvas.parentElement!==e.wrap){e.wrap.innerHTML='';e.wrap.appendChild(state.canvas);}
}

function drawTracked(text,x,y,font,spacing,color){
  const ctx=state.ctx;ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textBaseline='alphabetic';let px=x;
  for(const ch of String(text||'')){ctx.fillText(ch,px,y);px+=ctx.measureText(ch).width+spacing;}
  ctx.restore();
}

function drawPhoto(){
  const ctx=state.ctx,img=state.photoImg;if(!img)return;
  const base=Math.max(W/img.naturalWidth,H/img.naturalHeight);const s=base*Math.max(1,state.scale);const dw=img.naturalWidth*s,dh=img.naturalHeight*s;
  const dx=(W-dw)/2+state.offsetX,dy=(H-dh)/2+state.offsetY;ctx.drawImage(img,dx,dy,dw,dh);
}

function render(){
  if(!state.ctx)return;const ctx=state.ctx;ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  drawPhoto();
  if(state.headerImg){ctx.drawImage(state.headerImg,0,0,1023,218,0,0,W,230);const g=ctx.createLinearGradient(0,205,0,305);g.addColorStop(0,'rgba(248,249,250,.98)');g.addColorStop(.32,'rgba(248,249,250,.72)');g.addColorStop(.7,'rgba(248,249,250,.26)');g.addColorStop(1,'rgba(248,249,250,0)');ctx.fillStyle=g;ctx.fillRect(0,205,W,100);}
  if(state.footerImg)ctx.drawImage(state.footerImg,0,0,W,H);
  const first=String(state.firstName||'').trim().toUpperCase();const last=String(state.lastName||'').trim().toUpperCase();const year=String(state.year||'').trim().toUpperCase();const optional=String(state.optional||'').trim().toUpperCase();
  drawTracked(first,60,1041,`italic 600 50px ${FONT_FAMILY}`,11,'#fff');
  drawTracked(last,56,1158,`italic 700 116px ${FONT_FAMILY}`,1,'#fff');
  drawTracked(year,60,1238,`italic 700 38px ${FONT_FAMILY}`,9,'#f04b1a');
  if(optional)drawTracked(optional,60,1288,`italic 600 28px ${FONT_FAMILY}`,4,'#fff');
}

function syncFields(){const e=els();if(e.project)e.project.value=state.projectName;if(e.first)e.first.value=state.firstName;if(e.last)e.last.value=state.lastName;if(e.year)e.year.value=state.year;if(e.optional)e.optional.value=state.optional;if(e.scale)e.scale.value=String(state.scale);if(e.x)e.x.value=String(state.offsetX);if(e.y)e.y.value=String(state.offsetY);}
function resetState(){state.projectName='Hero Card — Untitled';state.firstName='WYLDER';state.lastName='SMITH';state.year='CLASS OF 2027';state.optional='';state.scale=1;state.offsetX=0;state.offsetY=0;state.photoFile=null;state.photoImg=null;syncFields();render();setStatus('Hero Card ready. Upload a photo and enter athlete details.');}

async function choosePhoto(){const inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/webp';inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;state.photoFile=f;const url=URL.createObjectURL(f);const img=new Image();img.onload=()=>{state.photoImg=img;state.scale=1;state.offsetX=0;state.offsetY=0;syncFields();render();setStatus('Photo loaded. Adjust scale and position as needed.');URL.revokeObjectURL(url);};img.src=url;};inp.click();}

function blobFromCanvas(){return new Promise(res=>state.canvas.toBlob(res,'image/png'));}
async function saveHero(){
  const heroBlob=await blobFromCanvas();const all=await getAll();const f=state.firstName.trim(),l=state.lastName.trim();const existing=all.find(x=>(x.type==='athlete'||x.recordType==='athlete')&&String(x.first||x.firstName||'').toLowerCase()===f.toLowerCase()&&String(x.last||x.lastName||'').toLowerCase()===l.toLowerCase());
  const now=new Date().toISOString();const rec={...(existing||{}),id:existing?.id||`athlete_${Date.now()}`,type:'athlete',recordType:'athlete',first:f,last:l,year:state.year.trim(),firstName:f,lastName:l,graduationYear:state.year.trim(),originalFile:state.photoFile||existing?.originalFile||null,heroBlob,crop:{scale:state.scale,x:state.offsetX,y:state.offsetY},heroMasterVersion:VERSION,projectName:state.projectName,created:existing?.created||now,updated:now};
  await put(rec);setStatus(`${f||'Hero'} ${l||''} saved to the Athlete Library.`.trim());await refreshSaved();
}
function exportHero(){state.canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);const n=[state.firstName,state.lastName,'Hero'].filter(Boolean).join('_').replace(/\s+/g,'_');a.download=n+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);setStatus('PNG exported.');},'image/png');}

async function refreshSaved(){const e=els();if(!e.saved)return;const all=(await getAll()).filter(x=>x.type==='athlete'||x.recordType==='athlete');e.saved.innerHTML='<option value="">Saved Hero Cards</option>';for(const r of all){const o=document.createElement('option');o.value=r.id;o.textContent=`${r.first||''} ${r.last||''}`.trim()+((r.year||r.graduationYear)?` — ${r.year||r.graduationYear}`:'');e.saved.appendChild(o);}}
async function loadSaved(id){if(!id)return;const all=await getAll();const r=all.find(x=>x.id===id);if(!r)return;state.projectName=r.projectName||`${r.first||''} ${r.last||''} Hero`.trim();state.firstName=r.first||r.firstName||'';state.lastName=r.last||r.lastName||'';state.year=r.year||r.graduationYear||'';state.optional=r.optional||'';state.scale=Number(r.crop?.scale||1);state.offsetX=Number(r.crop?.x||0);state.offsetY=Number(r.crop?.y||0);const f=r.originalFile||null;state.photoFile=f;if(f instanceof Blob){const url=URL.createObjectURL(f);const img=new Image();img.onload=()=>{state.photoImg=img;URL.revokeObjectURL(url);syncFields();render();};img.src=url;}else{state.photoImg=null;syncFields();render();}}

function capture(el,type,fn){if(!el||el.dataset.heroV2Bound===type)return;el.addEventListener(type,ev=>{ev.stopImmediatePropagation();fn(ev);},true);el.dataset.heroV2Bound=type;}
function bind(){const e=els();
  capture(e.upload,'click',ev=>{ev.preventDefault();choosePhoto();});
  capture(e.project,'input',()=>{state.projectName=e.project.value;});
  capture(e.first,'input',()=>{state.firstName=e.first.value;render();});capture(e.last,'input',()=>{state.lastName=e.last.value;render();});capture(e.year,'input',()=>{state.year=e.year.value;render();});capture(e.optional,'input',()=>{state.optional=e.optional.value;render();});
  capture(e.scale,'input',()=>{state.scale=Math.max(1,Number(e.scale.value)||1);render();});capture(e.x,'input',()=>{state.offsetX=Number(e.x.value)||0;render();});capture(e.y,'input',()=>{state.offsetY=Number(e.y.value)||0;render();});
  capture(e.reset,'click',ev=>{ev.preventDefault();state.scale=1;state.offsetX=0;state.offsetY=0;syncFields();render();});
  [e.save,e.saveBottom].forEach(b=>capture(b,'click',ev=>{ev.preventDefault();saveHero().catch(err=>{console.error(err);setStatus('Save failed: '+err.message);});}));
  capture(e.exportBottom,'click',ev=>{ev.preventDefault();exportHero();});
  [e.next,e.nextBottom].forEach(b=>capture(b,'click',ev=>{ev.preventDefault();resetState();}));
  capture(e.saved,'change',()=>loadSaved(e.saved.value).catch(console.error));
  capture(e.back,'click',ev=>{ev.preventDefault();state.active=false;const w=q('workspace-creative');if(w)w.classList.remove('hero-builder-mode');const old=q('creativeCanvas');if(old)old.style.display='';if(typeof window.activateWorkspace==='function')window.activateWorkspace('templates');else{const btn=[...document.querySelectorAll('button')].find(b=>/templates/i.test(b.textContent||''));if(btn)btn.click();}});
}

async function activate(){if(state.active)return;state.active=true;ensureCanvas();bind();syncFields();if(!state.headerImg||!state.footerImg){setStatus('Loading locked Hero master assets…');try{[state.headerImg,state.footerImg]=await Promise.all([loadImage(HEADER_SRC),loadImage(FOOTER_SRC)]);}catch(err){console.error(err);setStatus('Locked Hero assets failed to load.');return;}}
  try{await document.fonts.load(`700 116px ${FONT_FAMILY}`);}catch(_){}
  render();refreshSaved().catch(()=>{});setStatus('Hero Card master v2 ready. Only photo and athlete text are editable.');
}
function watch(){const tick=()=>{const e=els();const w=q('workspace-creative');const active=!!(e.builder&&!e.builder.hidden&&w&&w.classList.contains('hero-builder-mode'));if(active)activate();else if(state.active){state.active=false;const old=q('creativeCanvas');if(old)old.style.display='';}};new MutationObserver(tick).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden']});setInterval(tick,1000);tick();}

function init(){if(state.installed)return;state.installed=true;const style=document.createElement('style');style.textContent='#workspace-creative.hero-builder-mode #creativeCanvas{display:none!important}#heroMasterCanvasV2{display:block;margin:0 auto;background:#fff!important;border:0!important;border-radius:0!important}';document.head.appendChild(style);watch();console.info('CSMS Hero Card Master v2 installed',VERSION);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
