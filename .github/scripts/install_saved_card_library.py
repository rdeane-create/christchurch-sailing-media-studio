from pathlib import Path
import re

r = Path('athlete-main-headshot-approved-exact.js')
s = r.read_text()

# Idempotent install: if already present, only ensure cache version below.
if 'function saveFinishedCard()' not in s:
    s = s.replace("classLine:'CLASS OF 2027',overlay:null", "classLine:'CLASS OF 2027',cardNameDirty:false,overlay:null", 1)

    marker = "  function buildCard(){"
    if marker not in s:
        raise SystemExit('buildCard marker not found')

    helpers = r'''  function suggestedCardName(){
    const last=String(S.last||'').trim()||'LAST NAME';
    const first=String(S.first||'').trim()||'FIRST NAME';
    return `${last}, ${first}, ATHLETE HEADSHOT CARD`;
  }
  function syncCardName(force){
    const input=q('aCardName');if(!input)return;
    if(force||!S.cardNameDirty)input.value=suggestedCardName();
  }
  const SAVED_DB='ccs-sailing-media-studio-output-library';
  const SAVED_STORE='cards';
  function openSavedDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(SAVED_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(SAVED_STORE))db.createObjectStore(SAVED_STORE,{keyPath:'id'})};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
  }
  async function putSavedCard(card){
    const db=await openSavedDB();
    return new Promise((resolve,reject)=>{const tx=db.transaction(SAVED_STORE,'readwrite');tx.objectStore(SAVED_STORE).put(card);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}});
  }
  async function getSavedCards(){
    const db=await openSavedDB();
    return new Promise((resolve,reject)=>{const tx=db.transaction(SAVED_STORE,'readonly');const req=tx.objectStore(SAVED_STORE).getAll();req.onsuccess=()=>{db.close();resolve(req.result||[])};req.onerror=()=>{db.close();reject(req.error)}});
  }
  async function deleteSavedCard(id){
    const db=await openSavedDB();
    return new Promise((resolve,reject)=>{const tx=db.transaction(SAVED_STORE,'readwrite');tx.objectStore(SAVED_STORE).delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}});
  }
  function ensureSavedCardsPanel(){
    let panel=q('amhSavedCardsPanel');if(panel)return panel;
    const list=q('templateLibraryList');if(!list)return null;
    panel=document.createElement('section');panel.id='amhSavedCardsPanel';panel.className='panel';panel.style.marginTop='14px';
    panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px"><h2 style="margin:0">Saved Cards</h2><span class="hint">Finished Studio cards</span></div><div id="amhSavedCardsList" style="display:grid;gap:10px"></div>';
    const host=list.parentElement||list;host.insertAdjacentElement('afterend',panel);return panel;
  }
  function escapeSavedName(v){return String(v||'Saved Card').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}
  async function renderSavedCards(){
    const panel=ensureSavedCardsPanel();if(!panel)return;
    const list=q('amhSavedCardsList');if(!list)return;
    let cards=[];try{cards=await getSavedCards()}catch(err){console.error('Saved card library unavailable',err);return}
    cards.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));list.innerHTML='';
    if(!cards.length){list.innerHTML='<div class="hint">No finished cards saved yet.</div>';return}
    for(const card of cards){
      const row=document.createElement('div');row.className='athleteItem';row.style.gridTemplateColumns='72px 1fr auto';row.style.padding='10px';
      const url=URL.createObjectURL(card.blob);
      row.innerHTML=`<img alt="" style="width:58px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #d8e2ed" src="${url}"><div><div style="font-weight:800;font-size:14px">${escapeSavedName(card.name)}</div><div class="hint" style="margin-top:3px">Athlete Headshot Card</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button type="button" class="tiny primary" data-action="download">Download</button><button type="button" class="tiny secondary" data-action="delete">Delete</button></div>`;
      row.querySelector('img').onload=()=>URL.revokeObjectURL(url);
      row.querySelector('[data-action="download"]').onclick=()=>{const u=URL.createObjectURL(card.blob);const a=document.createElement('a');a.href=u;a.download=(card.name||'athlete-headshot-card')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
      row.querySelector('[data-action="delete"]').onclick=async()=>{if(!confirm(`Delete ${card.name}?`))return;await deleteSavedCard(card.id);renderSavedCards()};
      list.appendChild(row);
    }
  }
  function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG save failed')),'image/png'))}
  async function saveFinishedCard(){
    const c=q('aCanvas');if(!c)return;
    draw();
    const name=(q('aCardName')?.value||suggestedCardName()).trim()||suggestedCardName();
    try{
      const blob=await canvasBlob(c);
      const id=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
      await putSavedCard({id,name,type:'ATHLETE HEADSHOT CARD',first:S.first,last:S.last,classLine:S.classLine,createdAt:Date.now(),blob});
      S.cardNameDirty=false;syncCardName(true);await renderSavedCards();
      const btn=q('aSave');if(btn){const old=btn.textContent;btn.textContent='Saved ✓';setTimeout(()=>btn.textContent=old,1400)}
    }catch(err){console.error(err);alert('The finished card could not be saved to the Studio library.')}
  }
'''
    s = s.replace(marker, helpers + marker, 1)

    old = '<div class="control"><label>Class line</label><input id="aClass" value="CLASS OF 2027"></div><button id="aReset" class="secondary" type="button" style="width:100%">Reset image</button><button id="aDownload" class="primary" type="button" style="width:100%;margin-top:8px">Download PNG</button>'
    new = '<div class="control"><label>Class line</label><input id="aClass" value="CLASS OF 2027"></div><div class="control"><label>Card name</label><input id="aCardName" value="SMITH, WYLDER, ATHLETE HEADSHOT CARD"></div><button id="aReset" class="secondary" type="button" style="width:100%">Reset image</button><button id="aSave" class="primary" type="button" style="width:100%;margin-top:8px">Save Card</button><button id="aDownload" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button>'
    if old not in s:
        raise SystemExit('Controls block not found')
    s = s.replace(old, new, 1)

    old = "q('aFirst').oninput=e=>{S.first=e.target.value.toUpperCase();draw()};q('aLast').oninput=e=>{S.last=e.target.value.toUpperCase();draw()};q('aClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('aReset').onclick="
    new = "q('aFirst').oninput=e=>{S.first=e.target.value.toUpperCase();syncCardName(false);draw()};q('aLast').oninput=e=>{S.last=e.target.value.toUpperCase();syncCardName(false);draw()};q('aClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('aCardName').oninput=()=>{S.cardNameDirty=true};q('aSave').onclick=saveFinishedCard;q('aReset').onclick="
    if old not in s:
        raise SystemExit('Wire handlers block not found')
    s = s.replace(old, new, 1)

    old = "appendChild(p);wire(p)}p.hidden=false;ensureAssets().then(draw);"
    new = "appendChild(p);wire(p);syncCardName(true);renderSavedCards()}p.hidden=false;ensureAssets().then(draw);"
    if old not in s:
        raise SystemExit('Workspace initialization block not found')
    s = s.replace(old, new, 1)

    old = "function init(){buildCard();new MutationObserver(buildCard).observe(document.body,{childList:true,subtree:true});ensureAssets()}"
    new = "function init(){buildCard();ensureSavedCardsPanel();renderSavedCards();new MutationObserver(()=>{buildCard();ensureSavedCardsPanel()}).observe(document.body,{childList:true,subtree:true});ensureAssets()}"
    if old not in s:
        raise SystemExit('Init block not found')
    s = s.replace(old, new, 1)

s = re.sub(r"const VERSION='[^']+';", "const VERSION='20260814-saved-card-library-17';", s, count=1)
s = re.sub(r"\?v=20260814-[^'\"]+", "?v=20260814-saved-card-library-17", s)
r.write_text(s)

p = Path('index.html')
t = p.read_text()
t, n = re.subn(r'athlete-main-headshot-approved-exact\.js\?v=[^"\']+', 'athlete-main-headshot-approved-exact.js?v=20260814-saved-card-library-17', t)
if n < 1:
    raise SystemExit('Renderer script tag not found')
p.write_text(t)
