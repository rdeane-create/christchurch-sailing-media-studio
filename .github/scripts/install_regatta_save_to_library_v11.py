from pathlib import Path
import re

p=Path('regatta-lineup-layout-v2.js')
s=p.read_text()

# Version/style bump.
s=re.sub(r"const VERSION='[^']+';","const VERSION='20260814-regatta-lineup-layout-v11';",s,count=1)
s=s.replace("csmsRegattaLayoutStylesV8","csmsRegattaLayoutStylesV11")
s=s.replace("['csmsRegattaLayoutStylesV7','csmsRegattaLayoutStylesV6','csmsRegattaLayoutStylesV5','csmsRegattaLayoutStylesV4','csmsRegattaLayoutStylesV3','csmsRegattaLayoutStyles']",
            "['csmsRegattaLayoutStylesV8','csmsRegattaLayoutStylesV7','csmsRegattaLayoutStylesV6','csmsRegattaLayoutStylesV5','csmsRegattaLayoutStylesV4','csmsRegattaLayoutStylesV3','csmsRegattaLayoutStyles']")
s=s.replace("grid-template-columns:repeat(4,minmax(0,1fr))","grid-template-columns:repeat(5,minmax(0,1fr))",1)

marker="function buttonLabel(btn){return norm(btn.textContent||btn.value||btn.getAttribute('aria-label')||btn.title).toLowerCase();}\n"
if 'CSMS_SAVE_RENDERED_LINEUP_TO_LIBRARY_V11' not in s:
    if marker not in s:
        raise SystemExit('buttonLabel marker not found')
    helper=r'''// CSMS_SAVE_RENDERED_LINEUP_TO_LIBRARY_V11
async function saveRenderedLineupToLibrary(){
  const btn=q('csmsSaveToLibraryBtn');
  const status=q('status');
  const link=q('downloadLink');
  if(!link||!link.href||link.style.display==='none'){
    if(status)status.textContent='Render Video first, then Save to Library.';
    return;
  }
  const original=btn?.textContent||'Save to Library';
  try{
    if(btn){btn.disabled=true;btn.textContent='Saving…';}
    const response=await fetch(link.href);
    if(!response.ok)throw new Error('Rendered video could not be read.');
    const blob=await response.blob();
    const fallback=`Christchurch_Regatta_Lineup_${new Date().toISOString().slice(0,10)}.webm`;
    const filename=link.download||fallback;
    const file=new File([blob],filename,{type:blob.type||'video/webm',lastModified:Date.now()});
    if(typeof addUnifiedMedia!=='function')throw new Error('Studio Media Library is unavailable.');
    await addUnifiedMedia([file]);
    const id=`media_${file.name}_${file.size}_${file.lastModified}`;
    if(typeof persistentMediaPut==='function'){
      await persistentMediaPut({id,file});
    }
    if(typeof loadMediaMeta==='function'&&typeof saveMediaMeta==='function'){
      const meta=loadMediaMeta();
      const current=meta[id]||{};
      const collections=Array.isArray(current.collections)?current.collections.slice():[];
      if(!collections.includes('Regatta Lineup'))collections.push('Regatta Lineup');
      meta[id]={...current,collections,addedAt:current.addedAt||new Date().toISOString()};
      saveMediaMeta(meta);
    }
    if(typeof renderUnifiedMedia==='function')renderUnifiedMedia();
    if(status)status.textContent=`Saved ${filename} to Library → Videos.`;
    if(btn){btn.textContent='Saved to Library ✓';setTimeout(()=>{btn.textContent=original;btn.disabled=false;},1600);}
  }catch(err){
    console.error('Save Regatta lineup to Library failed',err);
    if(status)status.textContent=err?.message||'Could not save the rendered video to Library.';
    if(btn){btn.textContent=original;btn.disabled=false;}
  }
}
function ensureSaveToLibraryButton(){
  let btn=q('csmsSaveToLibraryBtn');
  if(btn)return btn;
  btn=document.createElement('button');
  btn.id='csmsSaveToLibraryBtn';
  btn.type='button';
  btn.className='secondary';
  btn.textContent='Save to Library';
  btn.addEventListener('click',saveRenderedLineupToLibrary);
  return btn;
}
'''
    s=s.replace(marker,helper+marker,1)

old="  const desired=['preview','render','save','export'].map(kind=>byKind.get(kind)).filter(Boolean);"
new="  const desired=[byKind.get('preview'),byKind.get('render'),ensureSaveToLibraryButton(),byKind.get('save'),byKind.get('export')].filter(Boolean);"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('preview action desired-list marker not found')

p.write_text(s)

# Cache-bust the helper in index.html so GitHub Pages browsers receive this version.
i=Path('index.html')
t=i.read_text()
pattern=r"regatta-lineup-layout-v2\.js(?:\?v=[^\"']*)?"
t,n=re.subn(pattern,"regatta-lineup-layout-v2.js?v=20260814-save-library-v11",t)
if n<1:
    raise SystemExit('Regatta layout helper script tag not found in index.html')
i.write_text(t)
