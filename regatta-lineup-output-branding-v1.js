(function(){
'use strict';

const VERSION='20260814-regatta-output-branding-v1';
const q=id=>document.getElementById(id);
const nativeRAF=window.requestAnimationFrame.bind(window);
let installedRAF=false;
let scheduled=false;

function workspace(){return q('workspace-video');}
function canvas(){return workspace()?.querySelector('#canvas')||q('canvas');}
function isActive(){const w=workspace();return !!(w&&w.classList.contains('active'));}
function clean(s){return String(s||'').trim().toUpperCase();}

function fitText(ctx,text,maxWidth,startSize,minSize,fontSpec){
  let size=startSize;
  while(size>minSize){
    ctx.font=fontSpec(size);
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}

function drawApprovedHeader(ctx,W){
  const scale=W/1080;
  ctx.save();
  ctx.setTransform(scale,0,0,scale,0,0);

  // Exact Athlete Main Headshot header field: clean white, no navy surround.
  ctx.fillStyle='#f8f9fb';
  ctx.fillRect(0,0,1080,154);

  // Badge from Athlete Main Headshot — Approved.
  ctx.fillStyle='#06203a';
  ctx.beginPath();
  ctx.arc(90,70,48,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle='#ffffff';
  ctx.lineWidth=3;
  ctx.stroke();

  ctx.fillStyle='#f24a18';
  ctx.beginPath();
  ctx.moveTo(76,55);
  ctx.lineTo(108,66);
  ctx.lineTo(76,76);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle='#f24a18';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(142,19);
  ctx.lineTo(142,115);
  ctx.stroke();

  ctx.fillStyle='#06203a';
  ctx.font='italic 900 82px Arial Black,Arial,sans-serif';
  ctx.textAlign='left';
  ctx.textBaseline='alphabetic';
  ctx.fillText('CHRISTCHURCH',168,78);

  ctx.fillStyle='#f24a18';
  ctx.font='700 31px Arial,sans-serif';
  ctx.fillText('S  A  I  L  I  N  G',360,120);

  ctx.restore();
}

function footerPath(ctx,W,H,y){
  const shoulder=72;
  const rise=76;
  ctx.beginPath();
  ctx.moveTo(shoulder,y);
  ctx.lineTo(W-shoulder,y);
  ctx.quadraticCurveTo(W-26,y,W,y+rise);
  ctx.lineTo(W,H);
  ctx.lineTo(0,H);
  ctx.lineTo(0,y+rise);
  ctx.quadraticCurveTo(26,y,shoulder,y);
  ctx.closePath();
}

function drawFooter(ctx,W,H){
  const eventName=clean(q('eventName')?.value)||'REGATTA';
  const location=clean(q('location')?.value)||'';
  const y=Math.round(H*0.805);
  const h=H-y;

  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);

  const g=ctx.createLinearGradient(0,y,0,H);
  g.addColorStop(0,'rgba(3,24,52,.97)');
  g.addColorStop(1,'rgba(2,14,35,1)');
  footerPath(ctx,W,H,y);
  ctx.fillStyle=g;
  ctx.fill();

  ctx.strokeStyle='#f24a18';
  ctx.lineWidth=Math.max(3,W*.004);
  ctx.beginPath();
  ctx.moveTo(W*.085,y+2);
  ctx.lineTo(W*.47,y+2);
  ctx.lineTo(W*.50,y-6);
  ctx.lineTo(W*.53,y+2);
  ctx.lineTo(W*.915,y+2);
  ctx.stroke();

  // Small orange badge with five stars.
  const pillW=W*.19, pillH=34, pillX=(W-pillW)/2, pillY=y+h*.13;
  ctx.fillStyle='#f24a18';
  ctx.beginPath();
  ctx.moveTo(pillX+12,pillY);
  ctx.lineTo(pillX+pillW-12,pillY);
  ctx.lineTo(pillX+pillW,pillY+pillH/2);
  ctx.lineTo(pillX+pillW-12,pillY+pillH);
  ctx.lineTo(pillX+12,pillY+pillH);
  ctx.lineTo(pillX,pillY+pillH/2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle='#07152f';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font=`900 ${Math.round(W*.018)}px Arial,sans-serif`;
  ctx.fillText('★ ★ ★ ★ ★',W/2,pillY+pillH/2+1);

  // REGATTA LINEUP label.
  const lineupY=y+h*.36;
  ctx.strokeStyle='#f24a18';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(W*.22,lineupY);
  ctx.lineTo(W*.34,lineupY);
  ctx.moveTo(W*.66,lineupY);
  ctx.lineTo(W*.78,lineupY);
  ctx.stroke();

  ctx.fillStyle='#ffffff';
  ctx.font=`italic 900 ${Math.round(W*.042)}px Arial Black,Arial,sans-serif`;
  ctx.fillText('REGATTA LINEUP',W/2,lineupY);

  // Event title.
  const eventFont=size=>`900 ${size}px Arial Black,Arial,sans-serif`;
  const eventSize=fitText(ctx,eventName,W*.82,Math.round(W*.065),34,eventFont);
  ctx.font=eventFont(eventSize);
  ctx.fillStyle='#ffffff';
  ctx.fillText(eventName,W/2,y+h*.60);

  // Location.
  const locFont=size=>`700 ${size}px Arial,sans-serif`;
  const locSize=fitText(ctx,location,W*.70,Math.round(W*.036),24,locFont);
  ctx.font=locFont(locSize);
  ctx.fillStyle='#f24a18';
  ctx.letterSpacing='2px';
  ctx.fillText(location,W/2,y+h*.80);

  ctx.strokeStyle='rgba(255,255,255,.75)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(W*.15,y+h*.80);
  ctx.lineTo(W*.25,y+h*.80);
  ctx.moveTo(W*.75,y+h*.80);
  ctx.lineTo(W*.85,y+h*.80);
  ctx.stroke();

  ctx.restore();
}

function coverOldTopTitle(ctx,W,H){
  // Remove the native Regatta title package from the rendered output while preserving the body below.
  const y0=Math.round(H*0.078);
  const y1=Math.round(H*0.185);
  const g=ctx.createLinearGradient(0,y0,0,y1);
  g.addColorStop(0,'rgba(7,21,47,1)');
  g.addColorStop(1,'rgba(7,21,47,.86)');
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle=g;
  ctx.fillRect(0,y0,W,y1-y0);
  ctx.restore();
}

function drawOverlay(){
  if(!isActive())return;
  const c=canvas();
  if(!c||c.width!==1080||c.height!==1920)return;
  const ctx=c.getContext('2d');
  if(!ctx)return;
  coverOldTopTitle(ctx,c.width,c.height);
  drawApprovedHeader(ctx,c.width);
  drawFooter(ctx,c.width,c.height);
}

function queueOverlay(delays=[0,80,250]){
  if(!isActive())return;
  delays.forEach(ms=>setTimeout(()=>nativeRAF(drawOverlay),ms));
}

function installRAFWrapper(){
  if(installedRAF)return;
  installedRAF=true;
  window.requestAnimationFrame=function(callback){
    return nativeRAF(function(ts){
      callback(ts);
      if(isActive())drawOverlay();
    });
  };
}

function addStyles(){
  if(q('csmsRegattaOutputBrandingStyles'))return;
  const s=document.createElement('style');
  s.id='csmsRegattaOutputBrandingStyles';
  s.textContent='#workspace-video #csmsRegattaPageTitle{display:none!important}';
  document.head.appendChild(s);
}

function init(){
  addStyles();
  installRAFWrapper();
  queueOverlay([0,150,500,1000]);

  document.addEventListener('input',e=>{
    if(workspace()?.contains(e.target))queueOverlay();
  },true);
  document.addEventListener('change',e=>{
    if(workspace()?.contains(e.target))queueOverlay([0,120,400,900]);
  },true);
  document.addEventListener('click',e=>{
    if(workspace()?.contains(e.target))queueOverlay([0,80,220,600]);
  },true);

  new MutationObserver(()=>{
    addStyles();
    if(isActive()&&!scheduled){
      scheduled=true;
      setTimeout(()=>{scheduled=false;queueOverlay([0,120]);},60);
    }
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.__CSMS_REGATTA_OUTPUT_BRANDING__={version:VERSION,drawOverlay};
})();
