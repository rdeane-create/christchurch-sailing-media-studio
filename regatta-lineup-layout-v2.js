(function(){
'use strict';
const VERSION='20260814-regatta-lineup-layout-v6';
const q=id=>document.getElementById(id);
let savedCards=[];
let selectedCardIds=[];
let loadedFiles=new Map();
let refreshTimer=null;
let loadingCards=false;

function workspace(){return q('workspace-video');}
function norm(s){return String(s||'').replace(/\s+/g,' ').trim();}
function bridgeCall(action,payload={}){
  if(typeof window.csmsAuthenticatedBridgeCall!=='function'){
    return Promise.reject(new Error('Google Drive Bridge is unavailable. Refresh Studio and connect Google Drive.'));
  }
  return window.csmsAuthenticatedBridgeCall(action,payload,{userInitiated:true});
}
function b64Blob(base64,mime='image/png'){
  const bin=atob(base64);const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new Blob([bytes],{type:mime});
}
function videoPanel(){
  const w=workspace();if(!w)return null;
  const heading=[...w.querySelectorAll('h1,h2,h3,h4')].find(el=>norm(el.textContent)==='Video Setup');
  if(heading){
    let n=heading.parentElement;
    while(n&&n!==w){
      if(n.querySelector&&n.querySelector('select,input,button'))return n;
      n=n.parentElement;
    }
  }
  return w.querySelector('section.panel')||w.querySelector('.panel')||w;
}
function previewPanel(){
  const w=workspace();if(!w)return null;
  const panels=[...w.querySelectorAll('section.panel,.panel')];
  const left=videoPanel();
  return panels.find(p=>p!==left&&(p.querySelector('canvas,video')||/preview/i.test(norm(p.textContent))))||
    [...w.children].find(el=>el!==left&&(el.querySelector?.('canvas,video')||/preview/i.test(norm(el.textContent))))||null;
}
function addStyles(){
  if(q('csmsRegattaLayoutStylesV6'))return;
  ['csmsRegattaLayoutStylesV5','csmsRegattaLayoutStylesV4','csmsRegattaLayoutStylesV3','csmsRegattaLayoutStyles'].forEach(id=>q(id)?.remove());
  const s=document.createElement('style');s.id='csmsRegattaLayoutStylesV6';s.textContent=`
#workspace-video .csmsRegattaTitle{padding:2px 0 16px;margin:0 0 18px;border-bottom:1px solid #d8e2ed;overflow:hidden}
#workspace-video .csmsRegattaEyebrow{color:#10213c;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;margin:0 0 6px 2px}
#workspace-video .csmsRegattaTitleText{display:inline-block;color:#07152f;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;font-style:italic;letter-spacing:-.06em;line-height:.92;transform:skewX(-9deg);transform-origin:left center;text-transform:uppercase}
#workspace-video .csmsRegattaTitleRule{height:5px;background:#f15a24;width:76%;max-width:360px;margin-top:10px}
#workspace-video .csmsDriveAthleteHint{font-size:12px;line-height:1.35;color:#536174;margin:7px 0 0}
#workspace-video .csmsRegattaMetaBottom{margin-top:26px;padding-top:18px;border-top:2px solid #d8e2ed}
#workspace-video .csmsRegattaMetaBottom h2{margin:0 0 12px;color:#10213c;font-size:20px}
#workspace-video .csmsRegattaMetaBottom .control{margin-bottom:12px}
#workspace-video .csmsPreviewActionBar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:stretch;width:100%;margin:8px 0 12px;padding:10px;background:#f8fafc;border:1px solid #d8e2ed;border-radius:12px;box-sizing:border-box}
#workspace-video .csmsPreviewActionBar button,#workspace-video .csmsPreviewActionBar a{margin:0!important;width:100%!important;min-width:0!important;min-height:44px!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-sizing:border-box!important}
@media(max-width:900px){#workspace-video .csmsPreviewActionBar{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
  document.head.appendChild(s);
}
function ensureTitle(){
  const panel=videoPanel();if(!panel)return;
  let box=q('csmsRegattaPageTitle');
  if(box&&box.parentElement!==panel){box.remove();box=null;}
  if(!box){
    box=document.createElement('div');box.id='csmsRegattaPageTitle';box.className='csmsRegattaTitle';
    box.innerHTML='<div class="csmsRegattaEyebrow">CHRISTCHURCH SAILING</div><div class="csmsRegattaTitleText">REGATTA LINEUP</div><div class="csmsRegattaTitleRule"></div>';
    panel.insertBefore(box,panel.firstChild);
  }
}
function findAthleteHeading(){
  const w=workspace();if(!w)return null;
  return [...w.querySelectorAll('h1,h2,h3,h4,strong')].find(el=>/^athletes$/i.test(norm(el.textContent)))||null;
}
function findNativeAthleteSelect(){
  const w=workspace();if(!w)return null;
  for(const sel of [...w.querySelectorAll('select')]){
    const block=sel.closest('.control')||sel.parentElement;
    if(norm(block?.textContent).toLowerCase().includes('add athletes from'))return sel;
  }
  const heading=findAthleteHeading();
  if(heading){
    let n=heading.nextElementSibling;
    for(let i=0;n&&i<8;i++,n=n.nextElementSibling){
      const sel=n.matches?.('select')?n:n.querySelector?.('select');
      if(sel)return sel;
    }
  }
  return null;
}
async function loadSavedCards(){
  const sel=findNativeAthleteSelect();if(!sel||loadingCards)return;
  loadingCards=true;sel.dataset.csmsDriveAthletes='1';
  sel.innerHTML='<option value="">Loading saved Athlete Cards…</option>';
  try{
    const result=await bridgeCall('listSavedCards',{});
    savedCards=(result&&Array.isArray(result.cards)?result.cards:[]).filter(c=>/athlete/i.test(String(c.cardType||c.name||'')));
    savedCards.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
    sel.innerHTML='<option value="">Choose saved Athlete Card…</option>';
    savedCards.forEach(card=>{const o=document.createElement('option');o.value=card.fileId;o.textContent=String(card.name||'Athlete Card').replace(/\.png$/i,'');sel.appendChild(o);});
    let hint=q('csmsDriveAthleteHint');
    if(!hint){hint=document.createElement('div');hint.id='csmsDriveAthleteHint';hint.className='csmsDriveAthleteHint';sel.insertAdjacentElement('afterend',hint);}
    hint.textContent=savedCards.length?`${savedCards.length} Athlete Card${savedCards.length===1?'':'s'} available from Google Drive.`:'No saved Athlete Cards found in Google Drive yet.';
  }catch(err){
    console.error('Regatta athlete card library load failed',err);
    sel.innerHTML='<option value="">Drive Athlete Library unavailable</option>';
    let hint=q('csmsDriveAthleteHint');
    if(!hint){hint=document.createElement('div');hint.id='csmsDriveAthleteHint';hint.className='csmsDriveAthleteHint';sel.insertAdjacentElement('afterend',hint);}
    hint.textContent=err?.message||'Could not load Athlete Cards from Drive.';
  }finally{loadingCards=false;}
}
async function addCardById(id){
  const input=q('athleteFiles');if(!id||!input)return;
  const meta=savedCards.find(c=>c.fileId===id);if(!meta)return;
  const hint=q('csmsDriveAthleteHint');
  try{
    if(hint)hint.textContent='Loading '+String(meta.name||'Athlete Card').replace(/\.png$/i,'')+'…';
    if(!loadedFiles.has(id)){
      const result=await bridgeCall('getSavedCard',{fileId:id});
      if(!result?.card?.data)throw new Error('Athlete Card image could not be loaded from Drive.');
      const blob=b64Blob(result.card.data,result.card.mimeType||'image/png');
      loadedFiles.set(id,new File([blob],meta.name||'athlete-card.png',{type:result.card.mimeType||'image/png'}));
    }
    if(!selectedCardIds.includes(id))selectedCardIds.push(id);
    const dt=new DataTransfer();selectedCardIds.forEach(cardId=>{const f=loadedFiles.get(cardId);if(f)dt.items.add(f);});
    input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    if(hint)hint.textContent=`Added ${String(meta.name||'Athlete Card').replace(/\.png$/i,'')} • ${selectedCardIds.length} athlete card${selectedCardIds.length===1?'':'s'} in lineup.`;
  }catch(err){console.error('Add Regatta athlete card failed',err);if(hint)hint.textContent=err?.message||'Could not add Athlete Card.';}
}
function wireNativeAthleteSelect(){
  q('csmsRegattaAthleteCards')?.remove();
  const sel=findNativeAthleteSelect();if(!sel)return;
  if(sel.dataset.csmsDriveWired!=='1'){
    sel.dataset.csmsDriveWired='1';
    sel.addEventListener('change',function(){const id=this.value;if(id)addCardById(id);});
  }
  if(sel.dataset.csmsDriveAthletes!=='1')loadSavedCards();
}
function controlText(c){
  const label=norm(c.querySelector?.('label')?.textContent);if(label)return label;
  const clone=c.cloneNode(true);clone.querySelectorAll?.('input,select,textarea,button').forEach(el=>el.remove());return norm(clone.textContent);
}
function findRegattaControls(panel){
  const out=[];const controls=[...panel.querySelectorAll('.control')];
  for(const c of controls){
    if(c.closest('#csmsRegattaMetaBottom'))continue;
    const label=controlText(c).toLowerCase();
    const full=norm(c.textContent).toLowerCase();
    if(/^(regatta lineup|regatta|location)(\b|$)/.test(label)||/^(regatta lineup|regatta|location)(\b|$)/.test(full))out.push(c);
  }
  return [...new Set(out)];
}
function moveRegattaDetails(){
  const panel=videoPanel();if(!panel)return;
  let box=q('csmsRegattaMetaBottom');
  if(!box){box=document.createElement('div');box.id='csmsRegattaMetaBottom';box.className='csmsRegattaMetaBottom';box.innerHTML='<h2>Regatta Details</h2>';}
  findRegattaControls(panel).forEach(c=>box.appendChild(c));
  if(box.childElementCount>1)panel.appendChild(box);
}
function buttonLabel(btn){return norm(btn.textContent||btn.value||btn.getAttribute('aria-label')||btn.title).toLowerCase();}
function actionKind(btn){
  const t=buttonLabel(btn);
  const id=String(btn.id||'').toLowerCase();
  if(!t&& !id)return '';
  if(t.includes('preview selected title'))return '';
  if(id==='renderbtn'||/\brender\b/.test(t))return 'render';
  if(/\bexport\b/.test(t)||/\bdownload\b/.test(t)||id.includes('export')||id.includes('download'))return 'export';
  if(/\bsave\b/.test(t)||id.includes('save'))return 'save';
  if(t==='preview'||t==='preview layout'||t==='preview video'||(/^preview\b/.test(t)&&!t.includes('selected title'))||id.includes('preview'))return 'preview';
  return '';
}
function isPreviewAction(btn){return !!actionKind(btn);}
function movePreviewActions(){
  const w=workspace(),target=previewPanel();if(!w||!target)return;
  let bar=q('csmsPreviewActionBar');
  if(!bar){bar=document.createElement('div');bar.id='csmsPreviewActionBar';bar.className='csmsPreviewActionBar';}
  const buttons=[...w.querySelectorAll('button,a')].filter(b=>b!==bar&&isPreviewAction(b));
  const byKind=new Map();
  for(const b of buttons){const kind=actionKind(b);if(kind&&!byKind.has(kind))byKind.set(kind,b);}
  ['preview','render','save','export'].forEach(kind=>{const b=byKind.get(kind);if(b)bar.appendChild(b);});
  if(bar.childElementCount){
    const heading=[...target.querySelectorAll(':scope > h1,:scope > h2,:scope > h3,:scope > h4')].find(el=>/^preview$/i.test(norm(el.textContent)))||
      [...target.querySelectorAll('h1,h2,h3,h4')].find(el=>/^preview$/i.test(norm(el.textContent)));
    if(heading&&heading.parentElement===target){heading.insertAdjacentElement('afterend',bar);}
    else target.insertBefore(bar,target.firstChild);
  }
}
function refresh(){addStyles();ensureTitle();wireNativeAthleteSelect();moveRegattaDetails();movePreviewActions();}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,80);}
function init(){refresh();new MutationObserver(scheduleRefresh).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.__CSMS_REGATTA_LINEUP_LAYOUT__={version:VERSION,refresh,loadSavedCards};
})();
