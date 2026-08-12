(function(){
'use strict';
const HEADER_FILES=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const RECOVERY_FILES=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const VERSION='20260812-approved-unit-v5';

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
  // Keep the approved package's original "heroes" route intact. The native
  // fallback workspace is moved aside after the approved package loads.
  const headerFn=/async function loadApprovedHeroHeader\(\)\{[\s\S]*?\n  \}\n\n  function loadHeroImage/;
  if(!headerFn.test(source))throw new Error('Approved Hero header function was not found in recovery package.');
  source=source.replace(headerFn,
    "async function loadApprovedHeroHeader(){\n"+
    "    if(heroHeaderOverlay.src)return;\n"+
    "    heroHeaderOverlay.src=window.__CSMS_APPROVED_HERO_HEADER_URI||'';\n"+
    "  }\n\n  function loadHeroImage");
  return source;
}

function resolveHeroWorkspaceCollision(){
  const heroes=[...document.querySelectorAll('[id="workspace-heroes"]')];
  if(!heroes.length)return false;
  const recovered=heroes.find(el=>el.classList.contains('csmsRecoveredWorkspace'))||heroes[heroes.length-1];
  heroes.forEach((el,index)=>{
    if(el===recovered)return;
    el.id='workspace-heroes-native'+(index?'-'+index:'');
    el.classList.remove('active');
    el.style.display='none';
    el.setAttribute('aria-hidden','true');
  });
  recovered.id='workspace-heroes';
  recovered.style.removeProperty('display');
  recovered.removeAttribute('aria-hidden');
  return true;
}

function keepApprovedHeroPrimary(){
  resolveHeroWorkspaceCollision();
  setTimeout(resolveHeroWorkspaceCollision,0);
  setTimeout(resolveHeroWorkspaceCollision,50);
  setTimeout(resolveHeroWorkspaceCollision,250);
}

(async()=>{
  try{
    // Recovery chunk files are treated strictly as data, never executed as JS.
    const header=await joinPayload(HEADER_FILES);
    if(!header.startsWith('UklGR'))throw new Error('Approved Hero header payload is not a WebP image.');
    window.__CSMS_APPROVED_HERO_HEADER_URI='data:image/webp;base64,'+header;

    const packed=await joinPayload(RECOVERY_FILES);
    if(!packed.startsWith('H4sI'))throw new Error('Approved recovery package payload is not gzip data.');

    let source=await gunzipBase64(packed);
    source=adaptApprovedSource(source);
    (0,eval)(source);
    keepApprovedHeroPrimary();

    // Protect the approved Hero route if later Studio startup code re-renders
    // workspaces or activates the native fallback after recovery initializes.
    document.addEventListener('click',()=>setTimeout(resolveHeroWorkspaceCollision,0),true);

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