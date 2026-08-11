(function(){
'use strict';
const HEADER_FILES=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const RECOVERY_FILES=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const VERSION='20260811-approved-unit-v1';

async function fetchChunk(src){
  const r=await fetch(src+'?v='+VERSION,{cache:'no-store'});
  if(!r.ok)throw new Error('Could not fetch '+src+' ('+r.status+')');
  const text=await r.text();
  const m=text.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/);
  if(!m)throw new Error('Could not parse '+src);
  return m[1];
}

async function gunzipBase64(b64){
  const bin=atob(b64);
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  if(typeof DecompressionStream!=='function')throw new Error('This browser does not support the recovery decompressor.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

function adaptApprovedSource(source){
  // The permanent-install recovery package used workspace-heroes, which now
  // collides with the newer native Hero editor. Give the APPROVED workspace
  // its own name while leaving the native workspace untouched.
  source=source.replaceAll('workspace-heroes','workspace-hero-approved');
  source=source.replaceAll("name === 'heroes'","name === 'hero-approved'");
  source=source.replaceAll("workspace = 'heroes'","workspace = 'hero-approved'");
  source=source.replaceAll("showWorkspace('heroes')","showWorkspace('hero-approved')");

  // The approved header is already assembled by this loader. Prevent the
  // recovered Hero renderer from trying to load three external scripts again.
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
    let header='';
    for(const f of HEADER_FILES)header+=await fetchChunk(f);
    if(!header)throw new Error('Approved Hero header is empty.');
    window.__CSMS_APPROVED_HERO_HEADER_URI='data:image/webp;base64,'+header;

    let packed='';
    for(const f of RECOVERY_FILES)packed+=await fetchChunk(f);
    if(!packed)throw new Error('Approved recovery package is empty.');

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
