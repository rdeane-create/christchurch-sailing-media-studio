(function(){
'use strict';
const VERSION='20260812-studio-bootstrap-v2';
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
    await load('csms-template-recovery-core-v1.js');
    await load('hero-card-rebuild-v1.js');
    await load('hero-card-compat-v1.js');
    console.info('[CSMS bootstrap]',{ok:true,version:VERSION,recoveryCore:true,heroRebuild:true,heroCompatibility:true});
  }catch(err){
    console.error('[CSMS bootstrap]',err);
    const banner=document.createElement('div');
    banner.style.cssText='margin:12px 24px;padding:12px 14px;border-radius:10px;background:#fff1f0;color:#9f1d16;border:1px solid #ffc9c5;font-weight:700';
    banner.textContent='Studio module load error: '+(err&&err.message?err.message:String(err));
    (document.querySelector('main')||document.body).prepend(banner);
  }
})();
})();
