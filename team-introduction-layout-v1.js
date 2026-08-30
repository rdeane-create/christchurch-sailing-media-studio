(function(){
  'use strict';
  const MODE_KEY='csms_video_template_mode';
  const MODE='team_intro';
  const VERSION='20260830-team-introduction-v1';
  const q=id=>document.getElementById(id);
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();

  function setMode(mode){
    localStorage.setItem(MODE_KEY,mode);
  }

  function isTeamMode(){
    return localStorage.getItem(MODE_KEY)===MODE;
  }

  function bridgeCall(action,payload={}){
    if(typeof window.csmsAuthenticatedBridgeCall!=='function'){
      return Promise.reject(new Error('Google Drive is not connected in Studio.'));
    }
    return window.csmsAuthenticatedBridgeCall(action,payload,{userInitiated:true});
  }

  function b64Blob(base64,mime='image/png'){
    const bin=atob(base64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return new Blob([bytes],{type:mime});
  }

  function savedHeadshotCards(cards){
    return (Array.isArray(cards)?cards:[]).filter(card=>{
      const text=`${card.name||''} ${card.cardType||''}`.toLowerCase();
      return /athlete/.test(text)&&/headshot|lineup/.test(text);
    }).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  }

  async function loadAllSavedHeadshots(){
    const status=q('teamIntroStatus')||q('status');
    const button=q('teamIntroLoadSaved');
    const input=q('athleteFiles');
    if(!input)return;
    const original=button?.textContent||'Load Saved Headshots';
    try{
      if(button){button.disabled=true;button.textContent='Loading...';}
      if(status)status.textContent='Finding saved headshot cards in Google Drive...';
      const result=await bridgeCall('listSavedCards',{});
      const cards=savedHeadshotCards(result?.cards);
      if(!cards.length){
        if(status)status.textContent='No saved headshot cards were found in Google Drive.';
        return;
      }
      const dt=new DataTransfer();
      for(let i=0;i<cards.length;i++){
        const card=cards[i];
        if(status)status.textContent=`Loading ${i+1} of ${cards.length}: ${String(card.name||'headshot').replace(/\.png$/i,'')}`;
        const loaded=await bridgeCall('getSavedCard',{fileId:card.fileId});
        if(!loaded?.card?.data)continue;
        const blob=b64Blob(loaded.card.data,loaded.card.mimeType||'image/png');
        dt.items.add(new File([blob],card.name||`team-headshot-${i+1}.png`,{type:loaded.card.mimeType||'image/png'}));
      }
      input.files=dt.files;
      input.dispatchEvent(new Event('change',{bubbles:true}));
      if(status)status.textContent=`Loaded ${dt.files.length} saved headshot cards for the Team Introduction.`;
    }catch(err){
      console.error('Team Introduction saved headshot load failed',err);
      if(status)status.textContent=err?.message||'Could not load saved headshots.';
    }finally{
      if(button){button.disabled=false;button.textContent=original;}
    }
  }

  function ensureTeamTools(){
    const host=q('videoLibraryPanel')||q('videoFinderPanel');
    if(!host)return;
    const existing=q('teamIntroTools');
    if(existing){
      existing.hidden=!isTeamMode();
      return;
    }
    const box=document.createElement('div');
    box.id='teamIntroTools';
    box.className='control';
    box.style.marginTop='12px';
    box.hidden=!isTeamMode();
    box.innerHTML='<button id="teamIntroLoadSaved" class="primary" type="button">Load Saved Headshots</button><div id="teamIntroStatus" class="hint" style="margin-top:8px">Loads the full saved headshot folder for the team intro roster.</div>';
    host.insertAdjacentElement('afterend',box);
    q('teamIntroLoadSaved').addEventListener('click',loadAllSavedHeadshots);
  }

  function applyTeamDefaults(force=false){
    if(!isTeamMode()){
      const tools=q('teamIntroTools');
      if(tools)tools.hidden=true;
      const title=q('csmsRegattaPageTitle');
      if(title){
        title.querySelector('.csmsRegattaTitleText')&&(title.querySelector('.csmsRegattaTitleText').textContent='REGATTA LINEUP');
      }
      const metaTitle=q('csmsRegattaMetaBottom')?.querySelector('h2');
      if(metaTitle)metaTitle.textContent='Regatta Details';
      return;
    }
    const videoType=q('videoType');
    if(videoType){
      videoType.querySelector('[value="team_intro"]')?.remove();
      const option=document.createElement('option');
      option.value='team_intro';
      option.textContent='Team Introduction';
      videoType.prepend(option);
      videoType.value='team_intro';
    }
    const event=q('eventName');
    const location=q('location');
    if(event&&(force||/annapolis|regatta|event name/i.test(event.value)))event.value='Introducing your 2026/2027 Seahorses';
    if(location&&(force||/annapolis|maryland|location/i.test(location.value)))location.value='Christchurch Sailing';
    const status=q('status');
    if(status)status.textContent='Team Introduction ready. Add your background, logo, and the full roster of athlete cards.';
    ensureTeamTools();
    const title=q('csmsRegattaPageTitle');
    if(title){
      title.querySelector('.csmsRegattaEyebrow')&&(title.querySelector('.csmsRegattaEyebrow').textContent='CHRISTCHURCH SAILING');
      title.querySelector('.csmsRegattaTitleText')&&(title.querySelector('.csmsRegattaTitleText').textContent='TEAM INTRODUCTION');
    }
    const metaTitle=q('csmsRegattaMetaBottom')?.querySelector('h2');
    if(metaTitle)metaTitle.textContent='Team Introduction Details';
    const athleteHint=q('csmsDriveAthleteHint');
    if(athleteHint&&!/full roster/i.test(athleteHint.textContent))athleteHint.textContent+=' Full-roster team intro mode is active.';
    if(typeof window.runVideoStudioSelfTest==='function'){
      try{window.runVideoStudioSelfTest();}catch{}
    }
  }

  function buildLibraryCard(){
    const list=q('templateLibraryList');
    if(!list||q('teamIntroductionCard'))return;
    if(norm(list.textContent).toLowerCase().includes('christchurch team introduction'))return;
    const row=document.createElement('div');
    row.id='teamIntroductionCard';
    row.className='athleteItem';
    row.style.gridTemplateColumns='88px 1fr auto';
    row.style.padding='10px';
    row.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#07152f 0 56%,#ff6f18 56% 61%,#f8fafc 61% 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px">60+</div><span style="font-weight:800;font-size:14px">Christchurch Team Introduction</span><button type="button" class="tiny primary" style="width:auto">Open</button>';
    row.querySelector('button').onclick=()=>{
      setMode(MODE);
      if(typeof window.activateWorkspace==='function')window.activateWorkspace('video');
      else document.querySelector('[data-workspace="video"]')?.click();
      setTimeout(()=>applyTeamDefaults(true),120);
    };
    list.prepend(row);
  }

  function wireVideoType(){
    const videoType=q('videoType');
    if(!videoType||videoType.dataset.csmsTeamIntroWired==='1')return;
    videoType.dataset.csmsTeamIntroWired='1';
    videoType.addEventListener('change',()=>{
      if(videoType.value==='team_intro')setMode(MODE);
      else setMode('regatta_lineup');
      refresh();
    });
  }

  function refresh(){
    buildLibraryCard();
    wireVideoType();
    ensureTeamTools();
    applyTeamDefaults(false);
  }

  function init(){
    refresh();
    new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});
  }

  window.CSMSTeamIntroRefresh=refresh;
  window.__CSMS_TEAM_INTRODUCTION__={version:VERSION,refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
