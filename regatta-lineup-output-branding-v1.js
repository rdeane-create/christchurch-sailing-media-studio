(function(){
'use strict';

const VERSION='20260814-regatta-output-branding-v3';
const q=id=>document.getElementById(id);
const nativeRAF=window.requestAnimationFrame.bind(window);
const APPROVED_OVERLAY_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp?v=20260814-regatta-output-branding-v3';
const APPROVED_HEADER_SOURCE_H=154;
let approvedOverlay=null;
let approvedOverlayReady=false;
let installedRAF=false;
let scheduled=false;

function workspace(){return q('workspace-video');}
function canvas(){return workspace()?.querySelector('#canvas')||q('canvas');}
function isActive(){const w=workspace();return !!(w&&w.classList.contains('active'));}
function clean(s){return String(s||'').trim().toUpperCase();}

function loadApprovedOverlay(){
  if(approvedOverlayReady||approvedOverlay)return;
  approvedOverlay=new Image();
  approvedOverlay.onload=()=>{
    approvedOverlayReady=true;
    queueOverlay([0,60,180,500]);
  };
  approvedOverlay.onerror=()=>{
    console.error('Exact approved Athlete Headshot overlay could not be loaded:',APPROVED_OVERLAY_SRC);
    approvedOverlay=null;
  };
  approvedOverlay.src=APPROVED_OVERLAY_SRC;
}

function fitText(ctx,text,maxWidth,startSize,minSize,fontSpec){
  let size=startSize;
  while(size>minSize){
    ctx.font=fontSpec(size);
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}

function drawExactApprovedHeader(ctx,W){
  if(!approvedOverlayReady||!approvedOverlay)return;
  const destH=Math.round(W*(APPROVED_HEADER_SOURCE_H/1080));
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);

  // Pixel-for-pixel source art from Athlete Main Headshot — Approved.
  ctx.drawImage(
    approvedOverlay,
    0,0,1080,APPROVED_HEADER_SOURCE_H,
    0,0,W,destH
  );

  // Blend the gray/white lower edge of the locked title art directly into Christchurch navy.
  // This replaces the previous hard cutoff without altering the approved logo/wordmark pixels above it.
  const fadeStart=Math.max(0,destH-16);
  const fadeEnd=destH+64;
  const fade=ctx.createLinearGradient(0,fadeStart,0,fadeEnd);
  fade.addColorStop(0,'rgba(7,21,47,0)');
  fade.addColorStop(.30,'rgba(7,21,47,.16)');
  fade.addColorStop(.62,'rgba(7,21,47,.58)');
  fade.addColorStop(1,'rgba(7,21,47,1)');
  ctx.fillStyle=fade;
  ctx.fillRect(0,fadeStart,W,fadeEnd-fadeStart);

  ctx.restore();
}

function footerPath(ctx,W,H,y){
  const shoulder=58;
  const rise=54;
  ctx.beginPath();
  ctx.moveTo(shoulder,y);
  ctx.lineTo(W-shoulder,y);
  ctx.quadraticCurveTo(W-20,y,W,y+rise);
  ctx.lineTo(W,H);
  ctx.lineTo(0,H);
  ctx.lineTo(0,y+rise);
  ctx.quadraticCurveTo(20,y,shoulder,y);
  ctx.closePath();
}

function drawFooter(ctx,W,H){
  const eventName=clean(q('eventName')?.value)||'REGATTA';
  const location=clean(q('location')?.value)||'';
  const y=Math.round(H*0.852);
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

  const lineupY=y+h*.23;
  ctx.strokeStyle='#f24a18';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(W*.18,lineupY);
  ctx.lineTo(W*.32,lineupY);
  ctx.moveTo(W*.68,lineupY);
  ctx.lineTo(W*.82,lineupY);
  ctx.stroke();

  ctx.fillStyle='#ffffff';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font=`italic 900 ${Math.round(W*.040)}px Arial Black,Arial,sans-serif`;
  ctx.fillText('REGATTA LINEUP',W/2,lineupY);

  const eventFont=size=>`900 ${size}px Arial Black,Arial,sans-serif`;
  const eventSize=fitText(ctx,eventName,W*.84,Math.round(W*.061),32,eventFont);
  ctx.font=eventFont(eventSize);
  ctx.fillStyle='#ffffff';
  ctx.fillText(eventName,W/2,y+h*.52);

  const locFont=size=>`700 ${size}px Arial,sans-serif`;
  const locSize=fitText(ctx,location,W*.72,Math.round(W*.033),22,locFont);
  ctx.font=locFont(locSize);
  ctx.fillStyle='#f24a18';
  ctx.fillText(location,W/2,y+h*.76);

  ctx.strokeStyle='rgba(255,255,255,.72)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(W*.13,y+h*.76);
  ctx.lineTo(W*.24,y+h*.76);
  ctx.moveTo(W*.76,y+h*.76);
  ctx.lineTo(W*.87,y+h*.76);
  ctx.stroke();

  ctx.restore();
}

function drawOverlay(){
  if(!isActive())return;
  const c=canvas();
  if(!c||c.width!==1080||c.height!==1920)return;
  const ctx=c.getContext('2d');
  if(!ctx)return;

  // Native title is disabled for story/reel by the installer; no legacy masking block is needed.
  drawExactApprovedHeader(ctx,c.width);
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
  loadApprovedOverlay();
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
