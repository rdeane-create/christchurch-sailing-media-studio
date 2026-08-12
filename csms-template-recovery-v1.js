(function(){
'use strict';
// Keep the legacy recovery bundle disabled. RC5 uses the native Studio plus
// the flexible Hero composer below.
const VERSION='20260812-hero-loader-v2';
function load(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src+'?v='+VERSION;
    s.async=false;
    s.onload=()=>{s.remove();resolve();};
    s.onerror=()=>{s.remove();reject(new Error('Could not load '+src));};
    document.head.appendChild(s);
  });
}
(async()=>{
  try{
    await load('hero-card-flex-v2.js');
    await load('hero-card-compat-v1.js');
    console.info('[CSMS] Native RC5 active with flexible Hero composer v2; legacy recovery remains disabled.');
  }catch(err){
    console.error('[CSMS Hero loader]',err);
    const banner=document.createElement('div');
    banner.style.cssText='margin:12px 24px;padding:12px 14px;border-radius:10px;background:#fff1f0;color:#9f1d16;border:1px solid #ffc9c5;font-weight:700';
    banner.textContent='Hero module load error: '+(err&&err.message?err.message:String(err));
    (document.querySelector('main')||document.body).prepend(banner);
  }
})();
})();
