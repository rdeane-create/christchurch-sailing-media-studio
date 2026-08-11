(function(){
'use strict';
const headerFiles=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const recoveryFiles=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const HERO_MASTER_PATH='assets/Reference/CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png';
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v=20260811-locked-v5';s.onload=()=>{s.remove();resolve();};s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s);});
const loadHeaderChunk=async src=>{
  const response=await fetch(src+'?v=20260811-locked-v5',{cache:'no-store'});
  if(!response.ok)throw new Error('Could not fetch '+src+' ('+response.status+')');
  const text=await response.text();
  const match=text.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/);
  if(!match)throw new Error('Could not parse approved Hero asset chunk '+src);
  return match[1];
};
function installApprovedHeroImageShim(dataUri){
  const proto=window.HTMLImageElement&&HTMLImageElement.prototype;
  if(!proto||window.__CSMS_HERO_IMAGE_SHIM__)return;
  const descriptor=Object.getOwnPropertyDescriptor(proto,'src');
  if(!descriptor||typeof descriptor.set!=='function'||typeof descriptor.get!=='function')return;
  Object.defineProperty(proto,'src',{
    configurable:true,
    enumerable:descriptor.enumerable,
    get:descriptor.get,
    set(value){
      const requested=String(value||'');
      if(requested===HERO_MASTER_PATH||requested.endsWith('/'+HERO_MASTER_PATH)){
        return descriptor.set.call(this,dataUri);
      }
      return descriptor.set.call(this,value);
    }
  });
  window.__CSMS_HERO_IMAGE_SHIM__=true;
}
(async()=>{try{
  let approvedHeader='';
  for(const f of headerFiles)approvedHeader+=await loadHeaderChunk(f);
  if(!approvedHeader)throw new Error('Approved Hero header asset is empty.');
  const approvedHeaderDataUri='data:image/png;base64,'+approvedHeader;
  window.__CSMS_HERO_HEADER_B64=approvedHeader;
  installApprovedHeroImageShim(approvedHeaderDataUri);
  window.__CSMS_RECOVERY_GZ='';
  for(const f of recoveryFiles)await loadScript(f);
  const bin=atob(window.__CSMS_RECOVERY_GZ||'');
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source=await new Response(stream).text();
  (0,eval)(source);
}catch(err){console.error('[CSMS exact recovery loader]',err);}})();
})();