(function(){
  'use strict';
  const VERSION='20260830-regatta-lineup-video-route-team-intro-stable';

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

  function refreshRegattaLayout(){
    try{
      if(window.__CSMS_REGATTA_LINEUP_LAYOUT__&&typeof window.__CSMS_REGATTA_LINEUP_LAYOUT__.refresh==='function'){
        window.__CSMS_REGATTA_LINEUP_LAYOUT__.refresh();
      }
    }catch(err){console.warn('Regatta Lineup layout refresh failed',err)}
  }

  function openRegattaLineup(){
    const ok=activateNative('video');
    if(!ok){
      console.error('[CSMS Regatta Lineup] Video workspace was not found.');
      alert('Regatta Lineup video builder could not be opened.');
      return;
    }
    refreshRegattaLayout();
    setTimeout(function(){
      refreshRegattaLayout();
      const title=document.getElementById('csmsRegattaPageTitle');
      const video=document.getElementById('workspace-video');
      const target=title||video;
      if(target){
        try{target.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){ }
      }
    },80);
  }

  function templateRows(){
    const list=document.getElementById('templateLibraryList');
    if(!list)return [];
    return [...list.children].filter(row=>/REGATTA LINEUP/i.test(String(row.textContent||'')));
  }

  function pruneDuplicateRegattaTemplates(){
    const rows=templateRows();
    if(rows.length<2)return;
    let keep=rows.find(row=>/CHRISTCHURCH REGATTA LINEUP/i.test(String(row.textContent||'')));
    if(!keep)keep=rows.find(row=>!/REGATTA LINEUP\s*V1/i.test(String(row.textContent||'')))||rows[0];
    rows.forEach(row=>{
      if(row!==keep)row.remove();
    });
    if(keep)keep.dataset.csmsAuthoritativeRegattaLineup='1';
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

  function loadTeamIntroductionHelper(){
    if(window.__CSMS_TEAM_INTRODUCTION__||document.querySelector('script[data-csms-team-introduction]'))return;
    const script=document.createElement('script');
    script.src='team-introduction-layout-v1.js?v=20260830-studio-stable-v1';
    script.async=false;
    script.dataset.csmsTeamIntroduction='1';
    script.onload=function(){
      if(typeof window.CSMSTeamIntroRefresh==='function')window.CSMSTeamIntroRefresh();
    };
    document.head.appendChild(script);
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
    pruneDuplicateRegattaTemplates();
  }

  function init(){
    loadTeamIntroductionHelper();
    wireKnownButtons();
    pruneDuplicateRegattaTemplates();
    const observer=new MutationObserver(function(){
      wireKnownButtons();
      pruneDuplicateRegattaTemplates();
      if(typeof window.CSMSTeamIntroRefresh==='function')window.CSMSTeamIntroRefresh();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.CSMSRegattaLineupVideo={version:VERSION,open:openRegattaLineup,prune:pruneDuplicateRegattaTemplates};
    console.info('[CSMS Regatta Lineup] authoritative native video routing',VERSION);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();