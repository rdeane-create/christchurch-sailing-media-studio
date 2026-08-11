(function(){
'use strict';
const headerFiles=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
const recoveryFiles=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v=20260811-locked-v6';s.onload=()=>{s.remove();resolve();};s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s);});
const loadHeaderChunk=async src=>{
  const response=await fetch(src+'?v=20260811-locked-v6',{cache:'no-store'});
  if(!response.ok)throw new Error('Could not fetch '+src+' ('+response.status+')');
  const text=await response.text();
  const match=text.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/);
  if(!match)throw new Error('Could not parse approved Hero asset chunk '+src);
  return match[1];
};
function resolveHeroWorkspaceCollision(){
  const heroes=[...document.querySelectorAll('[id="workspace-heroes"]')];
  if(heroes.length<2)return;
  const recovered=heroes.find(el=>el.classList.contains('csmsRecoveredWorkspace'))||heroes[heroes.length-1];
  heroes.forEach((el,index)=>{
    if(el===recovered)return;
    el.id='workspace-heroes-native'+(index?'-'+index:'');
    el.classList.remove('active');
    el.style.display='none';
  });
  recovered.id='workspace-heroes';
}
(async()=>{try{
  let approvedHeader='';
  for(const f of headerFiles)approvedHeader+=await loadHeaderChunk(f);
  if(!approvedHeader)throw new Error('Approved Hero header asset is empty.');
  window.__CSMS_HERO_HEADER_B64=approvedHeader;
  window.__CSMS_RECOVERY_GZ='';
  for(const f of recoveryFiles)await loadScript(f);
  const bin=atob(window.__CSMS_RECOVERY_GZ||'');
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source=await new Response(stream).text();
  (0,eval)(source);
  resolveHeroWorkspaceCollision();
  queueMicrotask(resolveHeroWorkspaceCollision);
  setTimeout(resolveHeroWorkspaceCollision,50);
}catch(err){console.error('[CSMS exact recovery loader]',err);}})();
})();