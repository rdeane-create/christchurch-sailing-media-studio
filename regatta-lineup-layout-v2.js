(function(){
'use strict';
const VERSION='20260814-regatta-lineup-layout-v2';
const q=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let savedCards=[];
let selectedCardIds=[];
let loadedFiles=new Map();

function workspace(){return q('workspace-video');}
function controlFor(el){return el?.closest?.('.control')||el?.parentElement||null;}
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
function addStyles(){
  if(q('csmsRegattaLayoutStyles'))return;
  const s=document.createElement('style');s.id='csmsRegattaLayoutStyles';s.textContent=`
#workspace-video .csmsRegattaTitle{background:#07152f;border-radius:18px;padding:22px 26px 18px;margin-bottom:18px;overflow:hidden}
#workspace-video .csmsRegattaTitleText{display:inline-block;color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:clamp(34px,5vw,68px);font-weight:900;font-style:italic;letter-spacing:-.055em;line-height:.92;transform:skewX(-9deg);transform-origin:left center;text-transform:uppercase}
#workspace-video .csmsRegattaTitleRule{height:6px;background:#f15a24;width:min(580px,72%);margin-top:13px}
#workspace-video .csmsAthleteCardLibrary{border:1px solid #d8e2ed;border-radius:14px;background:#f8fafc;padding:14px;margin:12px 0}
#workspace-video .csmsAthleteCardLibrary label{font-weight:800;display:block;margin-bottom:6px}
#workspace-video .csmsAthleteCardLibrary select{width:100%;padding:11px 12px;border:1px solid #cbd6e4;border-radius:11px;background:#fff}
#workspace-video .csmsAthleteCardActions{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}
#workspace-video .csmsAthleteCardStatus{font-size:12px;color:#536174;margin-top:8px}
#workspace-video .csmsRegattaMetaBottom{margin-top:18px;padding-top:16px;border-top:1px solid #d8e2ed}
#workspace-video .csmsRegattaMetaBottom h3{margin:0 0 10px;color:#10213c}
`;
  document.head.appendChild(s);
}
function ensureTitle(){
  const w=workspace();if(!w||q('csmsRegattaPageTitle'))return;
  const box=document.createElement('div');box.id='csmsRegattaPageTitle';box.className='csmsRegattaTitle';
  box.innerHTML='<div class="csmsRegattaTitleText">REGATTA LINEUP</div><div class="csmsRegattaTitleRule"></div>';
  w.insertBefore(box,w.firstChild);
}
function findSourceSelect(){
  const w=workspace();if(!w)return null;
  const selects=[...w.querySelectorAll('select')];
  return selects.find(sel=>[...sel.options].some(o=>/athlete library/i.test(o.textContent||'')))||
    selects.find(sel=>/athlete|source/i.test((sel.previousElementSibling?.textContent||'')+' '+(sel.closest('.control')?.textContent||'')));
}
function ensureAthleteLibrary(){
  const w=workspace();if(!w||q('csmsRegattaAthleteCards'))return;
  const athleteFiles=q('athleteFiles');const athleteList=q('athleteList');
  if(!athleteFiles&&!athleteList)return;
  const box=document.createElement('div');box.id='csmsRegattaAthleteCards';box.className='csmsAthleteCardLibrary';
  box.innerHTML=`<label for="csmsRegattaAthleteCardSelect">Athlete Library — Saved Athlete Cards</label>
    <select id="csmsRegattaAthleteCardSelect"><option value="">Loading Athlete Cards from Drive…</option></select>
    <div class="csmsAthleteCardActions"><button type="button" class="primary tiny" id="csmsAddAthleteCard">Add Athlete Card</button><button type="button" class="secondary tiny" id="csmsReloadAthleteCards">Refresh Athlete Library</button></div>
    <div id="csmsRegattaAthleteCardStatus" class="csmsAthleteCardStatus">Choose an Athlete Card to add it to the moving-card lineup.</div>`;
  const anchor=controlFor(athleteFiles)||athleteList;
  anchor.parentElement.insertBefore(box,anchor);
  q('csmsAddAthleteCard').onclick=addSelectedCard;
  q('csmsReloadAthleteCards').onclick=loadSavedCards;
  const src=findSourceSelect();
  if(src){
    let opt=[...src.options].find(o=>/athlete library/i.test(o.textContent||''));
    if(!opt){opt=document.createElement('option');opt.value='csms_saved_athlete_cards';opt.textContent='Athlete Library — Saved Cards';src.appendChild(opt)}
    src.addEventListener('change',()=>{if(src.value===opt.value||/athlete library/i.test(src.options[src.selectedIndex]?.textContent||''))box.scrollIntoView({behavior:'smooth',block:'nearest'})});
  }
  loadSavedCards();
}
async function loadSavedCards(){
  const sel=q('csmsRegattaAthleteCardSelect'),status=q('csmsRegattaAthleteCardStatus');if(!sel)return;
  sel.innerHTML='<option value="">Loading Athlete Cards from Drive…</option>';
  try{
    const result=await bridgeCall('listSavedCards',{});
    savedCards=(result&&Array.isArray(result.cards)?result.cards:[]).filter(c=>/athlete/i.test(String(c.cardType||c.name||'')));
    sel.innerHTML='<option value="">Choose an Athlete Card…</option>'+savedCards.map(c=>`<option value="${esc(c.fileId)}">${esc(String(c.name||'Athlete Card').replace(/\.png$/i,''))}</option>`).join('');
    if(status)status.textContent=savedCards.length?`${savedCards.length} Athlete Card${savedCards.length===1?'':'s'} available from Google Drive.`:'No saved Athlete Cards found in Google Drive yet.';
  }catch(err){
    console.error('Regatta Athlete Library load failed',err);sel.innerHTML='<option value="">Athlete Library unavailable</option>';if(status)status.textContent=err?.message||'Could not load Athlete Cards from Drive.';
  }
}
async function addSelectedCard(){
  const sel=q('csmsRegattaAthleteCardSelect'),status=q('csmsRegattaAthleteCardStatus'),input=q('athleteFiles');
  if(!sel?.value||!input)return;
  const id=sel.value;const meta=savedCards.find(c=>c.fileId===id);if(!meta)return;
  try{
    if(status)status.textContent='Loading '+String(meta.name||'Athlete Card').replace(/\.png$/i,'')+'…';
    if(!loadedFiles.has(id)){
      const result=await bridgeCall('getSavedCard',{fileId:id});
      if(!result?.card?.data)throw new Error('Athlete Card image could not be loaded from Drive.');
      const blob=b64Blob(result.card.data,result.card.mimeType||'image/png');
      loadedFiles.set(id,new File([blob],meta.name||'athlete-card.png',{type:result.card.mimeType||'image/png'}));
    }
    if(!selectedCardIds.includes(id))selectedCardIds.push(id);
    const dt=new DataTransfer();selectedCardIds.forEach(cardId=>{const file=loadedFiles.get(cardId);if(file)dt.items.add(file)});
    input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    if(status)status.textContent=`Added ${String(meta.name||'Athlete Card').replace(/\.png$/i,'')} • ${selectedCardIds.length} card${selectedCardIds.length===1?'':'s'} in lineup.`;
  }catch(err){console.error('Add Athlete Card failed',err);if(status)status.textContent=err?.message||'Could not add Athlete Card.';}
}
function moveMetaToBottom(){
  const w=workspace();if(!w||q('csmsRegattaMetaBottom'))return;
  const event=q('eventName'),location=q('location');
  if(!event&&!location)return;
  const host=(event?.closest('section')||location?.closest('section')||w);
  const box=document.createElement('div');box.id='csmsRegattaMetaBottom';box.className='csmsRegattaMetaBottom';box.innerHTML='<h3>Regatta Details</h3>';
  const candidates=[];
  [event,location].forEach(el=>{const c=controlFor(el);if(c&&!candidates.includes(c))candidates.push(c)});
  [...host.querySelectorAll('.control')].forEach(c=>{
    const label=(c.querySelector('label')?.textContent||'').trim();
    if(/^(regatta lineup|regatta)$/i.test(label)&&!candidates.includes(c))candidates.push(c);
  });
  candidates.forEach(c=>box.appendChild(c));
  host.appendChild(box);
}
function refresh(){addStyles();ensureTitle();ensureAthleteLibrary();moveMetaToBottom();}
function init(){refresh();new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.__CSMS_REGATTA_LINEUP_LAYOUT__={version:VERSION,refresh,loadSavedCards};
})();