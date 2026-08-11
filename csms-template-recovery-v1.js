(function(){
'use strict';
const HEADER_FILES=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const RECOVERY_FILES=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const VERSION='20260811-approved-unit-v3';

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src+'?v='+VERSION;
    s.async=false;
    s.onload=()=>{s.remove();resolve();};
    s.onerror=()=>{s.remove();reject(new Error('Could not load '+src));};
    document.head.appendChild(s);
  });
}

async function gunzipBase64(b64){
  const bin=atob(b64);
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  if(typeof DecompressionStream!=='function')throw new Error('This browser does not support the recovery decompressor.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

function adaptApprovedSource(source){
  source=source.replaceAll('workspace-heroes','workspace-hero-approved');
  source=source.replaceAll("name === 'heroes'","name === 'hero-approved'");
  source=source.replaceAll("workspace = 'heroes'","workspace = 'hero-approved'");
  source=source.replaceAll("showWorkspace('heroes')","showWorkspace('hero-approved')");

  const headerFn=/async function loadApprovedHeroHeader\(\)\{[\s\S]*?\n  \}\n\n  function loadHeroImage/;
  if(!headerFn.test(source))throw new Error('Approved Hero header function was not found in recovery package.');
  source=source.replace(headerFn,
    "async function loadApprovedHeroHeader(){\n"+
    "    if(heroHeaderOverlay.src)return;\n"+
    "    heroHeaderOverlay.src=window.__CSMS_APPROVED_HERO_HEADER_URI||'';\n"+
    "  }\n\n  function loadHeroImage");
  return source;
}

(async()=>{
  try{
    // Load the original approved header chunks exactly as authored. They
    // concatenate their payload into this variable; no parsing is involved.
    window.__CSMS_HERO_HEADER_B64='';
    for(const f of HEADER_FILES)await loadScript(f);
    const header=window.__CSMS_HERO_HEADER_B64||'';
    if(!header)throw new Error('Approved Hero header did not load.');
    window.__CSMS_APPROVED_HERO_HEADER_URI='data:image/webp;base64,'+header;

    // Load the original approved recovery package chunks exactly as authored.
    window.__CSMS_RECOVERY_GZ='';
    for(const f of RECOVERY_FILES)await loadScript(f);
    const packed=window.__CSMS_RECOVERY_GZ||'';
    if(!packed)throw new Error('Approved recovery package did not load.');

    let source=await gunzipBase64(packed);
    source=adaptApprovedSource(source);
    (0,eval)(source);

    console.info('[CSMS approved template recovery]',{
      ok:true,
      version:VERSION,
      heroWorkspace:'workspace-hero-approved',
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