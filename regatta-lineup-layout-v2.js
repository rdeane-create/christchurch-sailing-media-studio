(function(){
'use strict';
const VERSION='20260814-regatta-lineup-layout-v3';
const q=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let savedCards=[];
let selectedCardIds=[];
let loadedFiles=new Map();
let refreshTimer=null;

function workspace(){return q('workspace-video');}
function leftPanel(){
  const w=workspace();
  if(!w)return null;
  return w.querySelector(':scope > .grid > section.panel:first-child') ||
    w.querySelector('.grid > section.panel:first-child') ||
    w.querySelector('section.panel') || w;
}
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
  if(q('csmsRegattaLayoutStylesV3'))return;
  q('csmsRegattaLayoutStyles')?.remove();
  const s=document.createElement('style');s.id='csmsRegattaLayoutStylesV3';s.textContent=`
#workspace-video .csmsRegattaTitle{background:#07152f;border-radius:16px;padding:18px 20px 16px;margin:0 0 20px;overflow:hidden}
#workspace-video .csmsRegattaEyebrow{color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;margin-bottom:7px}
#workspace-video .csmsRegattaTitleText{display:inline-block;color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:44px;font-weight:900;font-style:italic;letter-spacing:-.055em;line-height:.9;transform:skewX(-9deg);transform-origin:left center;text-transform:uppercase}
#workspace-video .csmsRegattaTitleRule{height:5px;background:#f15a24;width:82%;max-width:390px;margin-top:12px}
#workspace-video .csmsAthleteCardLibrary{border:1px solid #d8e2ed;border-radius:14px;background:#f8fafc;padding:14px;margin:8px 0 14px}
#workspace-video .csmsAthleteCardLibrary label{font-weight:800;display:block;margin-bottom:6px}
#workspace-video .csmsAthleteCardLibrary select{width:100%;padding:11px 12px;border:1px solid #cbd6e4;border-radius:11px;background:#fff}
#workspace-video .csmsAthleteCardActions{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}
#workspace-video .csmsAthleteCardStatus{font-size:12px;color:#536174;margin-top:8px;line-height:1.35}
#workspace-video .csmsRegattaMetaBottom{margin-top:22px;padding-top:18px;border-top:2px solid #d8e2ed}
#workspace-video .csmsRegattaMetaBottom h2{margin:0 0 12px;color:#10213c;font-size:20px}
#workspace-video .csmsRegattaMetaBottom .control{margin-bottom:12px}
`;
  document.head.appendChild(s);
}
function ensureTitle(){
  const panel=leftPanel();if(!panel)return;
  const old=q('csmsRegattaPageTitle');
  if(old&&old.parentElement!==panel)old.remove();
  if(q('csmsRegattaPageTitle'))return;
  const box=document.createElement('div');box.id='csmsRegattaPageTitle';box.className='csmsRegattaTitle';
  box.innerHTML='<div class="csmsRegattaEyebrow">CHRISTCHURCH SAILING</div><div class="csmsRegattaTitleText">REGATTA LINEUP</div><div class="csmsRegattaTitleRule"></div>';
  panel.insertBefore(box,panel.firstChild);
}
function findAthletesHeading(){
  const panel=leftPanel();if(!panel)return null;
  return [...panel.querySelectorAll('h1,h2,h3,h4,strong')].find(el=>/^athletes$/i.test(String(el.textContent||'').trim()))||null;
}
function ensureAthleteLibrary(){
  const panel=leftPanel();if(!panel)return;
  const athleteFiles=q('athleteFiles');
  const heading=findAthletesHeading();
  const existing=q('csmsRegattaAthleteCards');
  if(existing){
    if(heading&&existing.previousElementSibling!==heading)heading.insertAdjacentElement('afterend',existing);
    return;
  }
  if(!athleteFiles&&!heading)return;
  const box=document.createElement('div');box.id='csmsRegattaAthleteCards';box.className='csmsAthleteCardLibrary';
  box.innerHTML=`<label for="csmsRegattaAthleteCardSelect">Athlete Library</label>
    <select id="csmsRegattaAthleteCardSelect"><option value="">Loading Athlete Cards from Drive…</option></select>
    <div class="csmsAthleteCardActions"><button type="button" class="primary tiny" id="csmsAddAthleteCard">Add Athlete Card</button><button type="button" class="secondary tiny" id="csmsReloadAthleteCards">Refresh Library</button></div>
    <div id="csmsRegattaAthleteCardStatus" class="csmsAthleteCardStatus">Saved Athlete Cards from the Studio Drive library appear here.</div>`;
  if(heading)heading.insertAdjacentElement('afterend',box);
  else {
    const anchor=controlFor(athleteFiles)||q('athleteList');
    if(anchor?.parentElement)anchor.parentElement.insertBefore(box,anchor);
    else panel.appendChild(box);
  }
  q('csmsAddAthleteCard').onclick=addSelectedCard;
  q('csmsReloadAthleteCards').onclick=loadSavedCards;
  loadSavedCards();
}
async function loadSavedCards(){
  const sel=q('csmsRegattaAthleteCardSelect'),status=q('csmsRegattaAthleteCardStatus');if(!sel)return;
  sel.innerHTML='<option value="">Loading Athlete Cards from Drive…</option>';
  try{
    const result=await bridgeCall('listSavedCards',{});
    savedCards=(result&&Array.isArray(result.cards)?result.cards:[]).filter(c=>/athlete/i.test(String(c.cardType||c.name||'')));
    savedCards.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
    sel.innerHTML='<option value="">Choose an Athlete Card…</option>'+savedCards.map(c=>`<option value="${esc(c.fileId)}">${esc(String(c.name||'Athlete Card').replace(/\.png$/i,''))}</option>`).join('');
    if(status)status.textContent=savedCards.length?`${savedCards.length} saved Athlete Card${savedCards.length===1?'':'s'} available from Google Drive.`:'No saved Athlete Cards found in Google Drive yet.';
  }catch(err){
    console.error('Regatta Athlete Library load failed',err);
    sel.innerHTML='<option value="">Athlete Library unavailable</option>';
    if(status)status.textContent=err?.message||'Could not load Athlete Cards from Drive.';
  }
}
async function addSelectedCard(){
  const sel=q('csmsRegattaAthleteCardSelect'),status=q('csmsRegattaAthleteCardStatus'),input=q('athleteFiles');
  if(!sel?.value){if(status)status.textContent='Choose an Athlete Card first.';return;}
  if(!input){if(status)status.textContent='The lineup athlete input is unavailable.';return;}
  const id=sel.value;const meta=savedCards.find(c=>c.fileId===id);if(!meta)return;
  try{
    if(status)status.textContent='Loading '+String(meta.name||'Athlete Card').replace(/\.png$/i,'')+' from Drive…';
    if(!loadedFiles.has(id)){
      const result=await bridgeCall('getSavedCard',{fileId:id});
      if(!result?.card?.data)throw new Error('Athlete Card image could not be loaded from Drive.');
      const blob=b64Blob(result.card.data,result.card.mimeType||'image/png');
      loadedFiles.set(id,new File([blob],meta.name||'athlete-card.png',{type:result.card.mimeType||'image/png'}));
    }
    if(!selectedCardIds.includes(id))selectedCardIds.push(id);
    const dt=new DataTransfer();
    selectedCardIds.forEach(cardId=>{const file=loadedFiles.get(cardId);if(file)dt.items.add(file)});
    input.files=dt.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    if(status)status.textContent=`Added ${String(meta.name||'Athlete Card').replace(/\.png$/i,'')} • ${selectedCardIds.length} card${selectedCardIds.length===1?'':'s'} in lineup.`;
  }catch(err){
    console.error('Add Athlete Card failed',err);
    if(status)status.textContent=err?.message||'Could not add Athlete Card.';
  }
}
function regattaControlCandidates(panel){
  const candidates=[];
  function add(c){if(c&&c.classList?.contains('control')&&!candidates.includes(c))candidates.push(c);}
  [q('eventName'),q('location')].forEach(el=>add(controlFor(el)));
  [...panel.querySelectorAll('.control')].forEach(c=>{
    const label=String(c.querySelector('label')?.textContent||'').trim().toLowerCase();
    const input=c.querySelector('input,select,textarea');
    const value=String(input?.value||'').trim().toLowerCase();
    if(label==='regatta lineup'||label==='regatta'||label==='location')add(c);
    if((label==='title'||label==='video title'||label==='lineup title')&&value==='regatta lineup')add(c);
  });
  return candidates;
}
function moveMetaToBottom(){
  const panel=leftPanel();if(!panel)return;
  let box=q('csmsRegattaMetaBottom');
  if(!box){
    box=document.createElement('div');box.id='csmsRegattaMetaBottom';box.className='csmsRegattaMetaBottom';box.innerHTML='<h2>Regatta Details</h2>';
    panel.appendChild(box);
  }
  regattaControlCandidates(panel).forEach(c=>{if(c.parentElement!==box)box.appendChild(c);});
  if(box.parentElement===panel&&box!==panel.lastElementChild)panel.appendChild(box);
}
function removeOldWorkspaceTitle(){
  const w=workspace(),panel=leftPanel(),title=q('csmsRegattaPageTitle');
  if(w&&panel&&title&&title.parentElement===w){title.remove();ensureTitle();}
}
function refresh(){
  addStyles();
  ensureTitle();
  removeOldWorkspaceTitle();
  ensureAthleteLibrary();
  moveMetaToBottom();
}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,30);}
function init(){
  refresh();
  new MutationObserver(scheduleRefresh).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.__CSMS_REGATTA_LINEUP_LAYOUT__={version:VERSION,refresh,loadSavedCards};
})();
