(function(){
  const TEMPLATE_NAME='Athlete Main Headshot';
  let state={img:null,scale:1,x:0,y:0,dragging:false,startX:0,startY:0,startImgX:0,startImgY:0};

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
    open.addEventListener('click',openTemplate);

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(open);
    list.prepend(card);
  }

  function openTemplate(){
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
        <div style="display:grid;grid-template-columns:minmax(260px,340px) 1fr;gap:18px;align-items:start">
          <div>
            <div class="control">
              <label>Upload image</label>
              <input id="athleteMainHeadshotUpload" type="file" accept="image/*">
            </div>
            <div class="control">
              <label>Size <span id="athleteMainHeadshotScaleValue" class="value">100%</span></label>
              <input id="athleteMainHeadshotScale" type="range" min="25" max="300" value="100" step="1">
            </div>
            <div class="control">
              <label>Left / Right <span id="athleteMainHeadshotXValue" class="value">0</span></label>
              <input id="athleteMainHeadshotX" type="range" min="-500" max="500" value="0" step="1">
            </div>
            <div class="control">
              <label>Up / Down <span id="athleteMainHeadshotYValue" class="value">0</span></label>
              <input id="athleteMainHeadshotY" type="range" min="-500" max="500" value="0" step="1">
            </div>
            <button id="athleteMainHeadshotReset" class="secondary" type="button" style="width:100%">Reset position</button>
            <div class="hint" style="margin-top:10px">You can also grab the image directly on the canvas and drag it into position.</div>
          </div>
          <div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px">
            <canvas id="athleteMainHeadshotCanvas" width="1080" height="1350" style="width:min(100%,500px);aspect-ratio:4/5;background:#ffffff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);cursor:grab;touch-action:none"></canvas>
          </div>
        </div>`;
      const list=document.getElementById('templateLibraryList');
      (list?.parentElement || document.body).appendChild(panel);
      wireControls(panel);
    }
    panel.hidden=false;
    draw();
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function wireControls(panel){
    const upload=panel.querySelector('#athleteMainHeadshotUpload');
    const scale=panel.querySelector('#athleteMainHeadshotScale');
    const x=panel.querySelector('#athleteMainHeadshotX');
    const y=panel.querySelector('#athleteMainHeadshotY');
    const reset=panel.querySelector('#athleteMainHeadshotReset');
    const canvas=panel.querySelector('#athleteMainHeadshotCanvas');

    panel.querySelector('#closeAthleteMainHeadshot')?.addEventListener('click',()=>{panel.hidden=true;});

    upload.addEventListener('change',e=>{
      const file=e.target.files && e.target.files[0];
      if(!file) return;
      const img=new Image();
      img.onload=()=>{
        state.img=img;
        state.scale=1;
        state.x=0;
        state.y=0;
        syncControls();
        draw();
        URL.revokeObjectURL(img.src);
      };
      img.src=URL.createObjectURL(file);
    });

    scale.addEventListener('input',()=>{state.scale=Number(scale.value)/100;syncLabels();draw();});
    x.addEventListener('input',()=>{state.x=Number(x.value);syncLabels();draw();});
    y.addEventListener('input',()=>{state.y=Number(y.value);syncLabels();draw();});

    reset.addEventListener('click',()=>{
      state.scale=1; state.x=0; state.y=0;
      syncControls(); draw();
    });

    const pointerPos=e=>{
      const r=canvas.getBoundingClientRect();
      return {x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};
    };

    canvas.addEventListener('pointerdown',e=>{
      if(!state.img) return;
      canvas.setPointerCapture(e.pointerId);
      const p=pointerPos(e);
      state.dragging=true;
      state.startX=p.x; state.startY=p.y;
      state.startImgX=state.x; state.startImgY=state.y;
      canvas.style.cursor='grabbing';
    });

    canvas.addEventListener('pointermove',e=>{
      if(!state.dragging) return;
      const p=pointerPos(e);
      state.x=Math.max(-500,Math.min(500,state.startImgX+(p.x-state.startX)));
      state.y=Math.max(-500,Math.min(500,state.startImgY+(p.y-state.startY)));
      syncControls();
      draw();
    });

    const endDrag=e=>{
      if(!state.dragging) return;
      state.dragging=false;
      canvas.style.cursor='grab';
      try{canvas.releasePointerCapture(e.pointerId);}catch(_){ }
    };
    canvas.addEventListener('pointerup',endDrag);
    canvas.addEventListener('pointercancel',endDrag);
    canvas.addEventListener('pointerleave',e=>{ if(state.dragging) endDrag(e); });
  }

  function syncLabels(){
    const panel=document.getElementById('athleteMainHeadshotWorkspace');
    if(!panel) return;
    panel.querySelector('#athleteMainHeadshotScaleValue').textContent=Math.round(state.scale*100)+'%';
    panel.querySelector('#athleteMainHeadshotXValue').textContent=Math.round(state.x);
    panel.querySelector('#athleteMainHeadshotYValue').textContent=Math.round(state.y);
  }

  function syncControls(){
    const panel=document.getElementById('athleteMainHeadshotWorkspace');
    if(!panel) return;
    panel.querySelector('#athleteMainHeadshotScale').value=String(Math.round(state.scale*100));
    panel.querySelector('#athleteMainHeadshotX').value=String(Math.round(state.x));
    panel.querySelector('#athleteMainHeadshotY').value=String(Math.round(state.y));
    syncLabels();
  }

  function draw(){
    const canvas=document.getElementById('athleteMainHeadshotCanvas');
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(!state.img) return;

    const cover=Math.max(canvas.width/state.img.width,canvas.height/state.img.height);
    const s=cover*state.scale;
    const w=state.img.width*s;
    const h=state.img.height*s;
    const dx=(canvas.width-w)/2+state.x;
    const dy=(canvas.height-h)/2+state.y;
    ctx.drawImage(state.img,dx,dy,w,h);
  }

  function init(){
    buildCard();
    const mo=new MutationObserver(buildCard);
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
