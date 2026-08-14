from pathlib import Path
import re

renderer = Path('athlete-main-headshot-approved-exact.js')
s = renderer.read_text()

# Replace the bridge helper whether this is the first Drive install or a repair pass.
old_bridge = re.compile(
    r"  async function savedCardBridgeCall\(action,payload=\{\}\)\{[\s\S]*?\n  \}\n  async function putSavedCard",
    re.M,
)
new_bridge = r'''  async function savedCardBridgeCall(action,payload={}){
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
  async function putSavedCard'''
s, n = old_bridge.subn(new_bridge, s, count=1)
if n != 1:
    raise SystemExit('Drive bridge helper was not found for repair')

# Replace Save Card with immediate visible status and a specific failure message.
save_pattern = re.compile(
    r"  async function saveFinishedCard\(\)\{[\s\S]*?\n  \}\n  function buildCard",
    re.M,
)
save_block = r'''  async function saveFinishedCard(){
    const c=q('aCanvas');if(!c)return;
    const btn=q('aSave');
    const oldText=btn?btn.textContent:'Save Card';
    if(btn){btn.disabled=true;btn.textContent='Saving to Drive…';}
    draw();
    const name=(q('aCardName')?.value||suggestedCardName()).trim()||suggestedCardName();
    try{
      const blob=await canvasBlob(c);
      const id=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
      await putSavedCard({id,name,type:'ATHLETE HEADSHOT CARD',first:S.first,last:S.last,classLine:S.classLine,createdAt:Date.now(),blob});
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
  function buildCard'''
s, n = save_pattern.subn(save_block, s, count=1)
if n != 1:
    raise SystemExit('Save Card function was not found for repair')

# Keep the existing Drive-backed renderer/list functions intact, only refresh cache version.
s = re.sub(r"const VERSION='[^']+';", "const VERSION='20260814-drive-saved-cards-19';", s, count=1)
s = re.sub(r"\?v=20260814-[^'\"]+", "?v=20260814-drive-saved-cards-19", s)
renderer.write_text(s)

index = Path('index.html')
t = index.read_text()
t, n = re.subn(
    r'athlete-main-headshot-approved-exact\.js\?v=[^"\']+',
    'athlete-main-headshot-approved-exact.js?v=20260814-drive-saved-cards-19',
    t
)
if n < 1:
    raise SystemExit('Renderer script tag not found')
index.write_text(t)

print('Drive Saved Cards responsive save repair applied.')
