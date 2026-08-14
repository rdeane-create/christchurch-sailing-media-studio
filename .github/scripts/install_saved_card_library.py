from pathlib import Path
import re

renderer = Path('athlete-main-headshot-approved-exact.js')
s = renderer.read_text()

start = "  const SAVED_DB='ccs-sailing-media-studio-output-library';"
end = "  function ensureSavedCardsPanel(){"

if start in s and end in s:
    a = s.index(start)
    b = s.index(end, a)
    helpers = r'''  // ===== CSMS DRIVE-BACKED SAVED CARDS V1 =====
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
    if(typeof csmsAuthenticatedBridgeCall!=='function')throw new Error('Google Drive Bridge is unavailable. Refresh Studio and connect Google Drive.');
    return await csmsAuthenticatedBridgeCall(action,payload,{userInitiated:true});
  }
  async function putSavedCard(card){
    const data=await savedCardBlobToBase64(card.blob);
    const result=await savedCardBridgeCall('saveCard',{
      name:card.name,
      cardType:card.type||'ATHLETE HEADSHOT CARD',
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
'''
    s = s[:a] + helpers + s[b:]
elif 'CSMS DRIVE-BACKED SAVED CARDS V1' not in s:
    raise SystemExit('Saved Cards browser-storage block not found')

render_start = "  async function renderSavedCards(){"
canvas_marker = "  function canvasBlob(canvas){"
if render_start not in s or canvas_marker not in s:
    raise SystemExit('Saved Cards renderer markers not found')

a = s.index(render_start)
b = s.index(canvas_marker, a)
renderer_block = r'''  async function renderSavedCards(){
    const panel=ensureSavedCardsPanel();if(!panel)return;
    const list=q('amhSavedCardsList');if(!list)return;
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
'''
s = s[:a] + renderer_block + s[b:]

s = re.sub(r"const VERSION='[^']+';", "const VERSION='20260814-drive-saved-cards-18';", s, count=1)
s = re.sub(r"\?v=20260814-[^'\"]+", "?v=20260814-drive-saved-cards-18", s)
renderer.write_text(s)

index = Path('index.html')
t = index.read_text()
t, n = re.subn(
    r'athlete-main-headshot-approved-exact\.js\?v=[^"\']+',
    'athlete-main-headshot-approved-exact.js?v=20260814-drive-saved-cards-18',
    t
)
if n < 1:
    raise SystemExit('Renderer script tag not found')
index.write_text(t)

print('Drive-backed Saved Cards installer applied.')
