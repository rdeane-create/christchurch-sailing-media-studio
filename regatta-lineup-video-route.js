(function(){
  'use strict';
  const VERSION='20260814-regatta-lineup-video-route-v1';

  function activateNative(name){
    if(typeof window.activateWorkspace==='function'){
      try{window.activateWorkspace(name);return true}catch(err){console.warn('Regatta Lineup activateWorkspace failed',err)}
    }
    const btn=document.querySelector('.workspaceTab[data-workspace="'+name+'"]');
    if(btn){btn.click();return true}
    const target=document.getElementById('workspace-'+name);
    if(target){
      document.querySelectorAll('.workspace').forEach(x=>x.classList.toggle('active',x===target));
      return true;
    }
    return false;
  }

  function openRegattaLineup(){
    const ok=activateNative('video');
    if(!ok){
      console.error('[CSMS Regatta Lineup] Video workspace was not found.');
      alert('Regatta Lineup video builder could not be opened.');
      return;
    }
    const video=document.getElementById('workspace-video');
    if(video){
      try{video.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){ }
    }
  }

  function isLineupLaunch(target){
    if(!target||!target.closest)return false;
    const button=target.closest('button,a');
    const row=target.closest('.athleteItem,.csmsRecoveredRow,.v2Card,.createTile,#templateLibraryList > div') || button?.parentElement;
    const text=String((row&&row.textContent)||button?.textContent||'').toUpperCase();
    if(!text.includes('REGATTA LINEUP'))return false;
    if(!button)return true;
    const action=String(button.textContent||'').trim().toUpperCase();
    return !action || action.includes('OPEN') || action.includes('CREATE') || action.includes('REGATTA LINEUP');
  }

  document.addEventListener('click',function(event){
    if(!isLineupLaunch(event.target))return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    openRegattaLineup();
  },true);

  function wireKnownButtons(){
    ['commandCreateLineup','v2HomeCreateLineup','projectOpenLineup'].forEach(id=>{
      const button=document.getElementById(id);
      if(!button||button.dataset.csmsRegattaVideoRoute==='1')return;
      button.dataset.csmsRegattaVideoRoute='1';
      button.addEventListener('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        openRegattaLineup();
      },true);
    });
  }

  function init(){
    wireKnownButtons();
    const observer=new MutationObserver(wireKnownButtons);
    observer.observe(document.body,{childList:true,subtree:true});
    window.CSMSRegattaLineupVideo={version:VERSION,open:openRegattaLineup};
    console.info('[CSMS Regatta Lineup] restored native video routing',VERSION);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
