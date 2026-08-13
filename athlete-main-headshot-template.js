(function(){
  const TEMPLATE_NAME='Athlete Main Headshot';

  function buildCard(){
    if(document.getElementById('athleteMainHeadshotTemplateCard')) return;
    const list=document.getElementById('templateLibraryList');
    if(!list) return;

    const card=document.createElement('div');
    card.id='athleteMainHeadshotTemplateCard';
    card.className='athleteItem';
    card.style.gridTemplateColumns='88px 1fr auto';
    card.style.padding='10px';

    const thumb=document.createElement('div');
    thumb.style.width='72px';
    thumb.style.height='90px';
    thumb.style.background='#ffffff';
    thumb.style.border='1px solid #d8e2ed';
    thumb.style.borderRadius='8px';

    const title=document.createElement('span');
    title.textContent=TEMPLATE_NAME;
    title.style.fontWeight='800';
    title.style.fontSize='14px';

    const open=document.createElement('button');
    open.type='button';
    open.className='tiny primary';
    open.textContent='Open';
    open.style.width='auto';
    open.addEventListener('click',openBlankTemplate);

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(open);
    list.prepend(card);
  }

  function openBlankTemplate(){
    let panel=document.getElementById('athleteMainHeadshotWorkspace');
    if(!panel){
      panel=document.createElement('section');
      panel.id='athleteMainHeadshotWorkspace';
      panel.className='panel';
      panel.style.marginTop='14px';
      panel.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
          <h2 style="margin:0">${TEMPLATE_NAME}</h2>
          <button id="closeAthleteMainHeadshot" class="secondary tiny" type="button">Close</button>
        </div>
        <div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px">
          <div id="athleteMainHeadshotCanvas" style="width:min(100%,500px);aspect-ratio:4/5;background:#ffffff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)"></div>
        </div>`;
      const list=document.getElementById('templateLibraryList');
      (list?.parentElement || document.body).appendChild(panel);
      panel.querySelector('#closeAthleteMainHeadshot')?.addEventListener('click',()=>{panel.hidden=true;});
    }
    panel.hidden=false;
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function init(){
    buildCard();
    const mo=new MutationObserver(buildCard);
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
