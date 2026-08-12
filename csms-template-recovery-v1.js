(function(){
'use strict';
const HEADER_FILES=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const RECOVERY_FILES=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const VERSION='20260812-approved-unit-v6';

async function fetchPayloadChunk(src){
  const r=await fetch(src+'?v='+VERSION,{cache:'no-store'});
  if(!r.ok)throw new Error('Could not fetch '+src+' ('+r.status+')');
  const text=await r.text();
  const marker="+'";
  const start=text.indexOf(marker);
  if(start<0)throw new Error('Payload marker not found in '+src);
  let payload=text.slice(start+marker.length);
  const close=payload.indexOf("';");
  if(close>=0)payload=payload.slice(0,close);
  payload=payload.replace(/[^A-Za-z0-9+/=]/g,'');
  if(!payload)throw new Error('Payload is empty in '+src);
  return payload;
}

async function joinPayload(files){
  let out='';
  for(const f of files)out+=await fetchPayloadChunk(f);
  return out;
}

async function gunzipBase64(b64){
  const bin=atob(b64);
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  if(typeof DecompressionStream!=='function')throw new Error('This browser does not support the recovery decompressor.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

function adaptApprovedSource(source){
  const headerFn=/async function loadApprovedHeroHeader\(\)\{[\s\S]*?\n  \}\n\n  function loadHeroImage/;
  if(!headerFn.test(source))throw new Error('Approved Hero header function was not found in recovery package.');
  source=source.replace(headerFn,
    "async function loadApprovedHeroHeader(){\n"+
    "    if(heroHeaderOverlay.src)return;\n"+
    "    heroHeaderOverlay.src=window.__CSMS_APPROVED_HERO_HEADER_URI||'';\n"+
    "  }\n\n  function loadHeroImage");
  return source;
}

function moveNativeHeroAsideBeforeRecovery(){
  const existing=document.getElementById('workspace-heroes');
  if(!existing)return null;
  existing.id='workspace-heroes-native';
  existing.classList.remove('active');
  existing.style.display='none';
  existing.setAttribute('aria-hidden','true');
  return existing;
}

function ensureApprovedHeroPrimary(){
  const approved=document.getElementById('workspace-heroes');
  const native=document.getElementById('workspace-heroes-native');
  if(native){
    native.classList.remove('active');
    native.style.display='none';
    native.setAttribute('aria-hidden','true');
  }
  if(approved){
    approved.style.removeProperty('display');
    approved.removeAttribute('aria-hidden');
  }
  return !!approved;
}

(async()=>{
  try{
    const header=await joinPayload(HEADER_FILES);
    if(!header.startsWith('UklGR'))throw new Error('Approved Hero header payload is not a WebP image.');
    window.__CSMS_APPROVED_HERO_HEADER_URI='data:image/webp;base64,'+header;

    const packed=await joinPayload(RECOVERY_FILES);
    if(!packed.startsWith('H4sI'))throw new Error('Approved recovery package payload is not gzip data.');

    // Critical ordering: remove the native fallback from the canonical Hero
    // workspace ID BEFORE the approved package initializes. The approved code
    // can then create and own workspace-heroes exactly as originally authored.
    moveNativeHeroAsideBeforeRecovery();

    let source=await gunzipBase64(packed);
    source=adaptApprovedSource(source);
    (0,eval)(source);

    if(!ensureApprovedHeroPrimary())throw new Error('Approved Hero workspace was not created.');
    setTimeout(ensureApprovedHeroPrimary,0);
    setTimeout(ensureApprovedHeroPrimary,100);
    setTimeout(ensureApprovedHeroPrimary,500);
    document.addEventListener('click',()=>setTimeout(ensureApprovedHeroPrimary,0),true);

    console.info('[CSMS approved template recovery]',{
      ok:true,
      version:VERSION,
      heroWorkspace:'workspace-heroes',
      nativeHeroFallback:'workspace-heroes-native',
      heroHeaderBytes:header.length,
      recoveryBytes:source.length,
      regattaRoute:'video'
    });
  }catch(err){
    console.error('[CSMS approved template recovery]',err);
    const banner=document.createElement('div');
    banner.style.cssText='margin:12px 24px;padding:12px 14px;border-radius:10px;background:#fff1f0;color:#9f1d16;border:1px solid #ffc9c5;font-weight:700';
    banner.textContent='Template recovery error: '+(err&&err.message?err.message:String(err));
    (document.querySelector('main')||document.body).prepend(banner);
  }
})();
})();