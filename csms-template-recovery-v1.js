(function(){
'use strict';
const files=['recovery-exact-1.js','recovery-exact-2.js','recovery-exact-3.js'];
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?v=20260811-locked';s.onload=()=>{s.remove();resolve();};s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s);});
(async()=>{try{window.__CSMS_RECOVERY_GZ='';for(const f of files)await load(f);const bin=atob(window.__CSMS_RECOVERY_GZ||'');const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));const source=await new Response(stream).text();(0,eval)(source);}catch(err){console.error('[CSMS exact recovery loader]',err);}})();
})();