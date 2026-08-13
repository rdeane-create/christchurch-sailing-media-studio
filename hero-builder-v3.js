(()=>{
'use strict';
/*
  Christchurch Hero — Original Master reset
  This intentionally contains NO Hero rendering code.
  The approved master file is displayed directly and unchanged.
*/
const VERSION='4.0.0-original-master';
const ORIGINAL_MASTER_ID='1lqiQnm2XyEZFR4bhA6WyUYGaQ96HWRVO';
const ORIGINAL_MASTER_URL=`https://lh3.googleusercontent.com/d/${ORIGINAL_MASTER_ID}`;
const ORIGINAL_W=1023;
const ORIGINAL_H=1537;

const q=id=>document.getElementById(id);
let installed=false;
let active=false;
let masterImg=null;

function status(message){
  const el=q('heroBuilderStatus');
  if(el)el.textContent=message;
}

function buildMasterImage(){
  if(masterImg)return masterImg;
  const img=document.createElement('img');
  img.id='heroOriginalMasterImage';
  img.alt='CHRISTCHURCH HERO CARD — ORIGINAL APPROVED MASTER';
  img.src=ORIGINAL_MASTER_URL;
  img.decoding='async';
  img.draggable=false;
  img.style.display='block';
  img.style.width='min(100%, 540px)';
  img.style.height='auto';
  img.style.margin='0 auto';
  img.style.border='0';
  img.style.borderRadius='0';
  img.style.boxShadow='0 18px 50px rgba(7,21,47,.22)';
  img.style.background='transparent';
  img.style.objectFit='contain';

  img.addEventListener('load',()=>{
    const w=img.naturalWidth;
    const h=img.naturalHeight;
    if(w===ORIGINAL_W&&h===ORIGINAL_H){
      status(`Original approved master loaded unchanged — ${w}×${h}. No rendering or reconstruction is active.`);
    }else{
      status(`Original master source loaded at ${w}×${h}; expected ${ORIGINAL_W}×${ORIGINAL_H}. No substitute will be used.`);
    }
  });

  img.addEventListener('error',()=>{
    status('The original approved Drive master could not be displayed. No fallback or imitation has been substituted.');
  });

  masterImg=img;
  return img;
}

function disableEditing(){
  [
    'heroBuilderUploadPhotoBtn',
    'heroBuilderFirstNameInput',
    'heroBuilderLastNameInput',
    'heroBuilderGraduationYearInput',
    'heroBuilderOptionalTextInput',
    'heroBuilderScale',
    'heroBuilderOffsetX',
    'heroBuilderOffsetY',
    'heroBuilderResetCropBtn',
    'heroBuilderSaveBtn',
    'heroBuilderSaveBottomBtn',
    'heroBuilderExportBottomBtn',
    'heroBuilderCreateNextBtn',
    'heroBuilderCreateNextBottomBtn'
  ].forEach(id=>{
    const el=q(id);
    if(!el)return;
    el.disabled=true;
    el.setAttribute('aria-disabled','true');
  });
}

function activate(){
  const builder=q('heroCardBuilder');
  const wrap=q('heroBuilderCanvasWrap');
  if(!builder||!wrap)return;

  active=true;
  ['creativeCanvas','heroMasterCanvasV2','heroBuilderV3Canvas'].forEach(id=>{
    const el=q(id);
    if(el)el.style.display='none';
  });

  const img=buildMasterImage();
  if(img.parentElement!==wrap)wrap.replaceChildren(img);
  disableEditing();
  status('Loading the untouched original approved Hero master directly from its original Drive file…');
}

function deactivate(){
  active=false;
}

function watch(){
  const tick=()=>{
    const builder=q('heroCardBuilder');
    const workspace=q('workspace-creative');
    const on=!!(builder&&!builder.hidden&&workspace&&workspace.classList.contains('hero-builder-mode'));
    if(on&&!active)activate();
    else if(!on&&active)deactivate();
  };
  new MutationObserver(tick).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','class']});
  setInterval(tick,700);
  tick();
}

function init(){
  if(installed)return;
  installed=true;
  const style=document.createElement('style');
  style.textContent=`
    #workspace-creative.hero-builder-mode #creativeCanvas,
    #workspace-creative.hero-builder-mode #heroMasterCanvasV2,
    #workspace-creative.hero-builder-mode #heroBuilderV3Canvas{display:none!important}
    #workspace-creative.hero-builder-mode #heroOriginalMasterImage{display:block!important}
  `;
  document.head.appendChild(style);
  watch();
  console.info('Christchurch Hero Original Master viewer installed',VERSION);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
