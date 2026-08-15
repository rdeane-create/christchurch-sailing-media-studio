(function(){
'use strict';
const NAME='College Acceptance';
const VERSION='20260815-college-acceptance-v13-fullwidth-lightfield';
const W=1080,H=1350;
const S={cards:[],base:null,logo:null,logoDisplay:null,logoBacking:null,progress:1,anim:0,renderUrl:null,shoulderY:560};
const q=id=>document.getElementById(id);
function bridge(action,payload={}){if(typeof csmsAuthenticatedBridgeCall!=='function')return Promise.reject(new Error('Google Drive Bridge unavailable'));return (async()=>{if(typeof csmsEnsureAuthenticatedBridge==='function')await csmsEnsureAuthenticatedBridge({userInitiated:true});return csmsAuthenticatedBridgeCall(action,payload,{userInitiated:true});})();}
function b64Blob(base64,mime){const bin=atob(base64),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime||'image/png'});}
async function loadCards(){const sel=q('caCardSelect');if(!sel)return;sel.innerHTML='<option value="">Loading Athlete Main Headshots…</option>';try{const r=await bridge('listSavedCards',{});const all=Array.isArray(r&&r.cards)?r.cards:[];S.cards=all.filter(c=>{const t=String(c.cardType||c.type||'').toUpperCase();const n=String(c.name||'').toUpperCase();return (t.includes('ATHLETE HEADSHOT')&&!t.includes('LINEUP'))||n.includes('ATHLETE HEADSHOT CARD');});sel.innerHTML='<option value="">Select Athlete Main Headshot</option>';S.cards.forEach(c=>{const o=document.createElement('option');o.value=c.fileId;o.textContent=String(c.name||'Athlete Main Headshot').replace(/\.png$/i,'');sel.appendChild(o);});q('caStatus').textContent=S.cards.length?'Choose an Athlete Main Headshot and add a college logo.':'No saved Athlete Main Headshot cards found.';}catch(err){console.error(err);sel.innerHTML='<option value="">Could not load cards</option>';q('caStatus').textContent='Could not load saved Athlete Main Headshots.';}}
async function loadBase(fileId){if(!fileId){S.base=null;draw();return;}try{const r=await bridge('getSavedCard',{fileId});if(!r||!r.ok||!r.card||!r.card.data)throw new Error('Saved card unavailable');const blob=b64Blob(r.card.data,r.card.mimeType);const url=URL.createObjectURL(blob);const im=new Image();im.onload=()=>{S.base=im;S.shoulderY=estimateShoulderY(im);S.progress=1;draw();setTimeout(()=>URL.revokeObjectURL(url),60000);q('caStatus').textContent='Using the saved Athlete Main Headshot unchanged. Logo safe zone adjusted to this athlete.';};im.onerror=()=>{URL.revokeObjectURL(url);q('caStatus').textContent='Could not open that saved card.';};im.src=url;}catch(err){console.error(err);q('caStatus').textContent='Could not load the saved Athlete Main Headshot.';}}
function prepareLogoDisplay(img){
  const iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;
  const src=document.createElement('canvas');src.width=iw;src.height=ih;
  const c=src.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,iw,ih);
  let id;try{id=c.getImageData(0,0,iw,ih);}catch(_){return src;}
  const d=id.data,seen=new Uint8Array(iw*ih),queue=[];
  const isOutsideWhite=(x,y)=>{const i=(y*iw+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3],hi=Math.max(r,g,b),lo=Math.min(r,g,b);return a<16||(r>236&&g>236&&b>236&&(hi-lo)<24);};
  const push=(x,y)=>{if(x<0||y<0||x>=iw||y>=ih)return;const k=y*iw+x;if(seen[k]||!isOutsideWhite(x,y))return;seen[k]=1;queue.push(k);};
  for(let x=0;x<iw;x++){push(x,0);push(x,ih-1);}for(let y=0;y<ih;y++){push(0,y);push(iw-1,y);}
  for(let qi=0;qi<queue.length;qi++){const k=queue[qi],x=k%iw,y=(k/iw)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
  for(let k=0;k<seen.length;k++)if(seen[k])d[k*4+3]=0;
  c.putImageData(id,0,0);

  // Remove only tiny detached edge specks; never filter the body of the logo.
  try{
    const dd=id.data,visited=new Uint8Array(iw*ih),parts=[],opaque=k=>dd[k*4+3]>24;
    for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){
      const start=y*iw+x;if(visited[start]||!opaque(start))continue;
      const stack=[start],pixels=[];visited[start]=1;let minX=x,maxX=x,minY=y,maxY=y;
      while(stack.length){const cur=stack.pop(),cx=cur%iw,cy=(cur/iw)|0;pixels.push(cur);if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
        for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){if(nx<0||ny<0||nx>=iw||ny>=ih)continue;const nk=ny*iw+nx;if(visited[nk]||!opaque(nk))continue;visited[nk]=1;stack.push(nk);}}
      parts.push({pixels,area:pixels.length,minX,maxX,minY,maxY});
    }
    const total=parts.reduce((s,p)=>s+p.area,0);
    for(const part of parts){const cx=(part.minX+part.maxX)/2,cy=(part.minY+part.maxY)/2,pw=part.maxX-part.minX+1,ph=part.maxY-part.minY+1;const tiny=part.area<Math.max(28,total*.0018);const compact=pw<iw*.10&&ph<ih*.16;const lowerRight=cx>iw*.76&&cy>ih*.64;const extremeEdge=cx>iw*.92||cy>ih*.88;if(tiny&&compact&&(lowerRight||extremeEdge))for(const k of part.pixels)dd[k*4+3]=0;}
    c.putImageData(id,0,0);
  }catch(_){;}

  let l=iw,r=-1,t=ih,b=-1;
  for(let y=0;y<ih;y++)for(let x=0;x<iw;x++)if(d[(y*iw+x)*4+3]>18){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
  if(r<l||b<t)return src;
  const pad=4;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(iw-1,r+pad);b=Math.min(ih-1,b+pad);
  const w=r-l+1,h=b-t+1,out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').drawImage(src,l,t,w,h,0,0,w,h);return out;
}
function makeWhiteBacking(display,pad=22,spread=14){const iw=display.width||1,ih=display.height||1,c=document.createElement('canvas');c.width=iw+pad*2;c.height=ih+pad*2;const x=c.getContext('2d');const steps=44;for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,dx=Math.cos(a)*spread,dy=Math.sin(a)*spread;x.drawImage(display,pad+dx,pad+dy);}x.drawImage(display,pad,pad);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='source-over';return c;}
function loadLogo(file){if(!file){S.logo=S.logoDisplay=S.logoBacking=null;draw();return;}const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{S.logo=im;S.logoDisplay=prepareLogoDisplay(im);S.logoBacking=makeWhiteBacking(S.logoDisplay);S.progress=1;draw();q('caStatus').textContent='College logo loaded. White file background removed for display; the source logo remains untouched.';setTimeout(()=>URL.revokeObjectURL(u),60000);};im.onerror=()=>{URL.revokeObjectURL(u);q('caStatus').textContent='Could not load that logo file.';};im.src=u;}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function estimateShoulderY(img){
  try{
    const sw=270,sh=Math.round(sw*H/W),cv=document.createElement('canvas');cv.width=sw;cv.height=sh;
    const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,sw,sh);
    const data=cx.getImageData(0,0,sw,sh).data;
    const px=(x,y)=>{const i=(y*sw+x)*4;return[data[i],data[i+1],data[i+2]];};
    const dist=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
    const y0=Math.round(400*sh/H),y1=Math.round(760*sh/H);
    let bestY=Math.round(560*sh/H),bestScore=-1;
    for(let y=y0;y<=y1;y++){
      let bg=[0,0,0],n=0;
      for(let x=0;x<Math.round(sw*.16);x++){const c=px(x,y);bg[0]+=c[0];bg[1]+=c[1];bg[2]+=c[2];n++;}
      for(let x=Math.round(sw*.84);x<sw;x++){const c=px(x,y);bg[0]+=c[0];bg[1]+=c[1];bg[2]+=c[2];n++;}
      bg=bg.map(v=>v/Math.max(1,n));
      let run=0,maxRun=0,edges=0,prev=null;
      for(let x=Math.round(sw*.12);x<Math.round(sw*.88);x++){
        const c=px(x,y),fg=dist(c,bg)>75;
        if(fg){run++;if(run>maxRun)maxRun=run;}else run=0;
        if(prev&&dist(c,prev)>80)edges++;
        prev=c;
      }
      const widthScore=maxRun/(sw*.76);
      const edgeScore=Math.min(1,edges/28);
      const center=px(Math.round(sw/2),y);
      const centerScore=Math.min(1,dist(center,bg)/260);
      const score=widthScore*.62+centerScore*.28+edgeScore*.10;
      if(widthScore>.38&&score>bestScore){bestScore=score;bestY=y;}
    }
    const raw=bestY*H/sh;
    return Math.max(500,Math.min(690,Math.round(raw+18)));
  }catch(err){console.warn('College Acceptance shoulder estimate fallback',err);return 560;}
}
function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=50,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2+16,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);
// Full-width backlight field: even brightness behind the complete crest + wordmark, with smooth edge and vertical falloff.
const gw=Math.max(2,Math.ceil(aw+190)),gh=Math.max(2,Math.ceil(ah+180)),glow=document.createElement('canvas');glow.width=gw;glow.height=gh;const gx=glow.getContext('2d'),cx=gw/2,cy=gh/2+14;
// Broad outer field.
const outer=document.createElement('canvas');outer.width=gw;outer.height=gh;const ox=outer.getContext('2d');let vg=ox.createLinearGradient(0,0,0,gh);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(.18,'rgba(255,255,255,.10)');vg.addColorStop(.34,'rgba(255,255,255,.30)');vg.addColorStop(.50,'rgba(255,255,255,.38)');vg.addColorStop(.66,'rgba(255,255,255,.30)');vg.addColorStop(.84,'rgba(255,255,255,.08)');vg.addColorStop(1,'rgba(255,255,255,0)');ox.fillStyle=vg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='destination-in';let hg=ox.createLinearGradient(0,0,gw,0);hg.addColorStop(0,'rgba(0,0,0,0)');hg.addColorStop(.08,'rgba(0,0,0,1)');hg.addColorStop(.92,'rgba(0,0,0,1)');hg.addColorStop(1,'rgba(0,0,0,0)');ox.fillStyle=hg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='source-over';gx.save();gx.filter='blur(18px)';gx.drawImage(outer,0,10);gx.restore();
// Bright inner field kept even across almost the entire logo width.
const innerW=Math.min(gw-24,Math.ceil(aw+70)),innerH=Math.max(56,Math.ceil(ah*.82)),ix=(gw-innerW)/2,iy=cy-innerH/2;gx.save();gx.filter='blur(12px)';const ig=gx.createLinearGradient(0,iy,0,iy+innerH);ig.addColorStop(0,'rgba(255,255,255,0)');ig.addColorStop(.18,'rgba(255,255,255,.38)');ig.addColorStop(.38,'rgba(255,255,255,.78)');ig.addColorStop(.62,'rgba(255,255,255,.78)');ig.addColorStop(.84,'rgba(255,255,255,.34)');ig.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=ig;gx.beginPath();gx.roundRect(ix,iy,innerW,innerH,Math.min(44,innerH/2));gx.fill();gx.restore();
ctx.save();ctx.drawImage(glow,-gw/2,-gh/2+10,gw,gh);ctx.restore();
// Small tight lift directly under the logo, still spanning its complete width.
ctx.save();ctx.globalAlpha=.18;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=16;ctx.fillStyle='rgba(255,255,255,.36)';ctx.beginPath();ctx.roundRect(-aw/2-8,-ah*.34+10,aw+16,ah*.68,Math.min(34,ah*.30));ctx.fill();ctx.restore();
ctx.save();ctx.shadowColor='rgba(0,10,28,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}
function draw(progress=S.progress){const c=q('caCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,W,H);ctx.fillStyle='#06142c';ctx.fillRect(0,0,W,H);if(S.base){const iw=S.base.naturalWidth||S.base.width,ih=S.base.naturalHeight||S.base.height,sc=Math.max(W/iw,H/ih),dw=iw*sc,dh=ih*sc;ctx.drawImage(S.base,(W-dw)/2,(H-dh)/2,dw,dh);drawLogo(ctx,progress);}else{ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot',W/2,H/2);}}
function play(){if(!S.base||!S.logo){q('caStatus').textContent='Choose a Main Headshot and college logo first.';return;}cancelAnimationFrame(S.anim);const start=performance.now(),dur=720;function f(now){const t=Math.min(1,(now-start)/dur);S.progress=t<.84?t/.84:1+Math.sin((t-.84)/.16*Math.PI)*.018;draw();if(t<1)S.anim=requestAnimationFrame(f);else{S.progress=1;draw();}}S.anim=requestAnimationFrame(f);}
function downloadPng(){if(!S.base)return;S.progress=1;draw();const a=document.createElement('a');a.download='college-acceptance.png';a.href=q('caCanvas').toDataURL('image/png');a.click();}
async function renderVideo(){if(!S.base||!S.logo){q('caStatus').textContent='Choose a Main Headshot and college logo first.';return;}const c=q('caCanvas');if(!c.captureStream||typeof MediaRecorder==='undefined'){q('caStatus').textContent='Video export is not supported in this browser.';return;}const btn=q('caRender');btn.disabled=true;btn.textContent='Rendering…';const stream=c.captureStream(30);let mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm;codecs=vp8';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';const chunks=[],rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};const done=new Promise((res,rej)=>{rec.onstop=res;rec.onerror=e=>rej(e.error||new Error('Video failed'));});rec.start();const start=performance.now(),duration=2200;function frame(now){const elapsed=now-start,t=Math.min(1,elapsed/900);draw(t);if(elapsed<duration)requestAnimationFrame(frame);else{draw(1);setTimeout(()=>rec.stop(),120);}}requestAnimationFrame(frame);try{await done;const blob=new Blob(chunks,{type:mime});if(S.renderUrl)URL.revokeObjectURL(S.renderUrl);S.renderUrl=URL.createObjectURL(blob);const a=q('caVideoDownload');a.href=S.renderUrl;a.download='college-acceptance.webm';a.style.display='block';a.textContent='Download Video';q('caStatus').textContent='College Acceptance video is ready.';}catch(err){console.error(err);q('caStatus').textContent='Video render failed.';}finally{btn.disabled=false;btn.textContent='Render Video';S.progress=1;draw();}}
function buildCard(){if(q('collegeAcceptanceCard'))return;const list=q('templateLibraryList');if(!list)return;const r=document.createElement('div');r.id='collegeAcceptanceCard';r.className='athleteItem';r.style.gridTemplateColumns='88px 1fr auto';r.style.padding='10px';r.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#f5f7fa,#fff 55%,#071b35)"></div><span style="font-weight:800;font-size:14px">'+NAME+'</span><button type="button" class="tiny primary" style="width:auto">Open</button>';r.querySelector('button').onclick=open;list.prepend(r);}
function open(){let p=q('collegeAcceptanceWorkspace');if(!p){p=document.createElement('section');p.id='collegeAcceptanceWorkspace';p.className='panel';p.style.marginTop='14px';p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="caClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(270px,350px) 1fr;gap:18px;align-items:start"><div><div class="control"><label>Athlete Main Headshot</label><select id="caCardSelect"><option value="">Select Athlete Main Headshot</option></select></div><div class="control"><label>College logo</label><input id="caLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></div><button id="caPlay" class="secondary" type="button" style="width:100%;margin-top:8px">Play Drop</button><button id="caPng" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button><button id="caRender" class="primary" type="button" style="width:100%;margin-top:8px">Render Video</button><a id="caVideoDownload" class="primary" style="display:none;margin-top:8px;text-align:center;text-decoration:none;padding:10px 12px;border-radius:8px">Download Video</a><div id="caStatus" class="hint" style="margin-top:10px">Choose a saved Athlete Main Headshot.</div><div class="hint" style="margin-top:8px">The saved Main Headshot is used unchanged. Only the original college logo is added and animated. The uploaded college logo remains the untouched source. Studio removes only the outside white file background for display, then builds a separate fading contour and halo behind that display copy. It stays clear of the athlete’s face and name and is made as large as the safe area allows.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="caCanvas" width="1080" height="1350" style="width:min(100%,500px);aspect-ratio:4/5;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)"></canvas></div></div>`;(q('templateLibraryList')?.parentElement||document.body).appendChild(p);q('caClose').onclick=()=>p.hidden=true;q('caCardSelect').onchange=e=>loadBase(e.target.value);q('caLogo').onchange=e=>loadLogo(e.target.files&&e.target.files[0]);q('caPlay').onclick=play;q('caPng').onclick=downloadPng;q('caRender').onclick=renderVideo;loadCards();}p.hidden=false;draw();p.scrollIntoView({behavior:'smooth',block:'start'});}
function init(){buildCard();new MutationObserver(buildCard).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
