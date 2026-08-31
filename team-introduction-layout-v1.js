(function(){
  'use strict';
  const NAME='Team Introduction';
  const W=1080,H=1350;
  const BRIDGE_URL='https://script.google.com/a/macros/christchurchschool.org/s/AKfycbwVpWix_ivzxwpEQxNTBGvJNpThQYjfRRG8T7CYMNPz3r9lB-JI6CowrskoQUAs67lt/exec?action=bridge';
  const HEADER_OVERLAY_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp?v=20260830-team-intro-header';
  const HEADER_GRAY='#d0d6df';
  const q=id=>document.getElementById(id);
  let images=[],cards=[],headerOverlay=null,headerOverlayReady=false,animFrame=0,animStart=0,bridgePort=null,bridgeReady=null,bridgeToken='',pending=new Map();
  function status(text){const el=q('tiStatus');if(el)el.textContent=text;}
  function wait(){return new Promise(r=>setTimeout(r,0));}
  function b64ToBlob(base64,mimeType){const binary=atob(base64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:mimeType||'image/png'});}
  function imageFromBlob(blob){return new Promise(resolve=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);resolve(null)};img.src=url;});}
  function loadHeaderOverlay(){if(headerOverlay||headerOverlayReady)return;headerOverlay=new Image();headerOverlay.onload=()=>{headerOverlayReady=true;draw()};headerOverlay.onerror=()=>{headerOverlay=null};headerOverlay.src=HEADER_OVERLAY_SRC;}
  function randomToken(){try{const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');}catch{return Date.now().toString(36)+Math.random().toString(36).slice(2);}}
  function connectBridge(){
    if(bridgePort)return Promise.resolve(true);
    if(bridgeReady)return bridgeReady;
    bridgeToken=randomToken();
    bridgeReady=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{window.removeEventListener('message',onMessage);bridgeReady=null;reject(new Error('Google Drive connection timed out.'));},30000);
      function onMessage(event){
        const data=event.data||{};
        if(data.source!=='csms-drive-bridge'||data.type!=='channel-ready'||data.bridgeToken!==bridgeToken)return;
        const port=event.ports&&event.ports[0];
        if(!port)return;
        clearTimeout(timeout);
        window.removeEventListener('message',onMessage);
        bridgePort=port;
        port.onmessage=ev=>{
          const msg=ev.data||{},entry=pending.get(msg.requestId);
          if(!entry||msg.source!=='csms-drive-bridge'||msg.type!=='response')return;
          pending.delete(msg.requestId);
          clearTimeout(entry.timeout);
          msg.ok?entry.resolve(msg.result):entry.reject(new Error(msg.error||'Drive request failed'));
        };
        if(port.start)port.start();
        resolve(true);
      }
      window.addEventListener('message',onMessage);
      const popup=window.open(BRIDGE_URL+'&token='+encodeURIComponent(bridgeToken)+'&transport=popup&cb='+Date.now(),'csms-drive-bridge','popup=yes,width=470,height=220,resizable=yes,scrollbars=yes');
      if(!popup){
        clearTimeout(timeout);
        window.removeEventListener('message',onMessage);
        bridgeReady=null;
        reject(new Error('Drive popup was blocked. Allow popups for this site.'));
      }
    });
    return bridgeReady;
  }
  async function bridge(action,payload){
    if(typeof window.csmsAuthenticatedBridgeCall==='function'){
      return await window.csmsAuthenticatedBridgeCall(action,payload||{},{userInitiated:true});
    }
    await connectBridge();
    return await new Promise((resolve,reject)=>{
      const requestId='team_intro_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const timeout=setTimeout(()=>{pending.delete(requestId);reject(new Error('Drive request timed out'));},60000);
      pending.set(requestId,{resolve,reject,timeout});
      bridgePort.postMessage({source:'csms-studio',type:'request',requestId,action,payload:payload||{}});
    });
  }
  function cardLabel(card){
    const athlete=`${card.first||''} ${card.last||''}`.trim();
    return athlete||String(card.name||'Athlete Main Headshot').replace(/\.png$/i,'');
  }
  function fillCardSelect(){
    const select=q('tiSavedCards');
    if(!select)return;
    select.innerHTML='';
    const prompt=document.createElement('option');
    prompt.value='';
    prompt.textContent=cards.length?'Choose an Athlete Main card':'Load saved cards first';
    select.appendChild(prompt);
    cards.forEach((card,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=cardLabel(card);
      select.appendChild(option);
    });
  }
  function renderOrder(){
    const select=q('tiOrder');
    if(!select)return;
    const current=select.selectedIndex;
    select.innerHTML='';
    images.forEach((item,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=`${index+1}. ${item.label||'Headshot'}`;
      select.appendChild(option);
    });
    if(images.length)select.selectedIndex=Math.max(0,Math.min(current,images.length-1));
  }
  async function loadCards(){
    status('Connecting to Main Studio saved cards...');
    try{
      const result=await bridge('listSavedCards',{});
      const all=Array.isArray(result&&result.cards)?result.cards:[];
      cards=all.filter(card=>{
        const type=String(card.cardType||card.type||'').toUpperCase();
        const name=String(card.name||'').toUpperCase();
        return (type.includes('ATHLETE HEADSHOT')&&!type.includes('LINEUP'))||name.includes('ATHLETE HEADSHOT CARD');
      }).map(card=>({...card,fileId:String(card.fileId||card.id||'')})).filter(card=>card.fileId);
      cards.sort((a,b)=>cardLabel(a).localeCompare(cardLabel(b)));
      fillCardSelect();
      status(cards.length?'Choose an Athlete Main card from the dropdown, then add it to the team order.':'No Athlete Main saved cards were found.');
    }catch(err){
      status('Could not load saved cards: '+(err&&err.message?err.message:String(err)));
    }
  }
  async function getCardImage(fileId){
    const result=await bridge('getSavedCard',{fileId});
    if(!result||!result.ok||!result.card||!result.card.data)throw new Error('Saved card unavailable');
    return imageFromBlob(b64ToBlob(result.card.data,result.card.mimeType||'image/png'));
  }
  async function addSelectedCards(){
    const card=cards[Number(q('tiSavedCards')?.value)];
    if(!card){status('Choose an Athlete Main card first.');return;}
    status(`Adding ${cardLabel(card)}...`);
    await wait();
    const img=await getCardImage(card.fileId);
    if(img)images.push({img,label:cardLabel(card)});
    renderOrder();
    playMotion();
  }
  async function addFiles(){
    const input=q('tiFiles');
    const files=[...(input&&input.files?input.files:[])];
    if(!files.length){status('Choose files first.');return;}
    let added=0;
    for(const file of files){
      await wait();
      const img=await imageFromBlob(file);
      if(img){images.push({img,label:file.name.replace(/\.[^.]+$/,'')});added++;}
      status(`Added ${added} file${added===1?'':'s'}...`);
    }
    input.value='';
    renderOrder();
    playMotion();
  }
  function moveOrdered(delta){
    const select=q('tiOrder');
    if(!select||select.selectedIndex<0)return;
    const from=select.selectedIndex,to=from+delta;
    if(to<0||to>=images.length)return;
    const [item]=images.splice(from,1);
    images.splice(to,0,item);
    renderOrder();
    select.selectedIndex=to;
    playMotion();
  }
  function removeOrdered(){
    const select=q('tiOrder');
    if(!select||select.selectedIndex<0)return;
    images.splice(select.selectedIndex,1);
    renderOrder();
    playMotion();
  }
  function fitDraw(ctx,img,x,y,w,h,mode){
    const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,ir=iw/ih,or=w/h;
    let sx=0,sy=0,sw=iw,sh=ih,dx=x,dy=y,dw=w,dh=h;
    if(mode==='cover'){if(ir>or){sw=ih*or;sx=(iw-sw)/2}else{sh=iw/or;sy=(ih-sh)/2}}
    else if(ir>or){dh=w/ir;dy=y+(h-dh)/2}else{dw=h*ir;dx=x+(w-dw)/2}
    ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
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
  function drawHeader(ctx){
    const sourceH=170,destH=Math.round(W*(sourceH/1080)),transitionEnd=Math.round(W*(238/1080));
    ctx.save();
    ctx.fillStyle=HEADER_GRAY;
    ctx.fillRect(0,0,W,destH);
    if(headerOverlayReady&&headerOverlay)ctx.drawImage(headerOverlay,0,0,1080,sourceH,0,0,W,destH);
    else{
      ctx.fillStyle='#07152f';
      ctx.font='italic 900 62px Arial Black,Arial,sans-serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('CHRISTCHURCH',W/2,70);
      ctx.fillStyle='#f24a18';
      ctx.font='700 22px Arial,sans-serif';
      ctx.fillText('S A I L I N G',W/2,112);
    }
    const g=ctx.createLinearGradient(0,destH,0,transitionEnd);
    g.addColorStop(0,'rgba(208,214,223,1)');
    g.addColorStop(.22,'rgba(190,199,211,1)');
    g.addColorStop(.46,'rgba(146,160,178,1)');
    g.addColorStop(.68,'rgba(91,109,135,1)');
    g.addColorStop(.86,'rgba(42,61,89,1)');
    g.addColorStop(1,'rgba(7,21,47,1)');
    ctx.fillStyle=g;
    ctx.fillRect(0,destH,W,Math.max(0,transitionEnd-destH));
    ctx.restore();
  }
  function footerPath(ctx,y){
    const shoulder=58,rise=54;
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
  function drawFooter(ctx){
    const text=String(q('tiTitle')?.value||'Introducing Your 2026/2027 Seahorses').trim();
    const y=Math.round(H*.842),h=H-y;
    const g=ctx.createLinearGradient(0,y,0,H);
    g.addColorStop(0,'rgba(4,30,62,.98)');
    g.addColorStop(.58,'rgba(2,17,42,.995)');
    g.addColorStop(1,'rgba(1,8,22,1)');
    footerPath(ctx,y);
    ctx.fillStyle=g;
    ctx.fill();
    ctx.strokeStyle='#f24a18';
    ctx.lineWidth=8;
    ctx.beginPath();
    ctx.moveTo(W*.085,y+2);
    ctx.lineTo(W*.47,y+2);
    ctx.lineTo(W*.50,y-14);
    ctx.lineTo(W*.53,y+2);
    ctx.lineTo(W*.915,y+2);
    ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.78)';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(W*.13,y+20);
    ctx.bezierCurveTo(W*.35,y+2,W*.65,y+2,W*.87,y+20);
    ctx.stroke();
    const glow=ctx.createRadialGradient(W/2,y+h*.52,W*.05,W/2,y+h*.52,W*.48);
    glow.addColorStop(0,'rgba(255,255,255,.16)');
    glow.addColorStop(.46,'rgba(255,255,255,.055)');
    glow.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,y,W,h);
    const font=size=>`italic 900 ${size}px Arial Black,Impact,Arial,sans-serif`;
    const size=fitText(ctx,text,W*.88,72,34,font);
    ctx.font=font(size);
    ctx.fillStyle='#ffffff';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,.72)';
    ctx.shadowBlur=16;
    ctx.shadowOffsetY=5;
    ctx.lineWidth=Math.max(3,size*.075);
    ctx.strokeStyle='rgba(1,8,22,.70)';
    ctx.strokeText(text,W/2,y+h*.52);
    ctx.fillText(text,W/2,y+h*.52);
    ctx.shadowColor='transparent';
    ctx.strokeStyle='rgba(255,255,255,.74)';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(W*.13,y+h*.78);
    ctx.lineTo(W*.35,y+h*.78);
    ctx.moveTo(W*.65,y+h*.78);
    ctx.lineTo(W*.87,y+h*.78);
    ctx.stroke();
    ctx.fillStyle='#f24a18';
    ctx.beginPath();
    ctx.arc(W/2,y+h*.78,9,0,Math.PI*2);
    ctx.fill();
  }
  function ease(t){return t<=0?0:t>=1?1:t*t*(3-2*t);}
  function rounded(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }
  function baseGridBoxes(count){
    const cols=Number(q('tiColumns')?.value)||7;
    const rows=Math.max(1,Math.ceil(Math.max(1,count)/cols));
    const margin=48,gap=count>42?5:8,headerH=252,footerTop=Math.round(H*.842)-18;
    const available=footerTop-headerH;
    const tileW=(W-margin*2-gap*(cols-1))/cols;
    const fullCardH=tileW*1.25;
    const maxTileH=(available-gap*(rows-1))/rows;
    const tileH=Math.min(fullCardH,maxTileH);
    const gridH=rows*tileH+(rows-1)*gap;
    const startY=headerH+Math.max(0,(available-gridH)/2);
    const boxes=[];
    for(let i=0;i<count;i++){
      const col=i%cols,row=Math.floor(i/cols);
      const gx=margin+col*(tileW+gap),gy=startY+row*(tileH+gap);
      boxes.push({x:gx,y:gy,w:tileW,h:tileH});
    }
    return boxes;
  }
  function sequenceBox(target,index,stepProgress){
    const growEnd=.30,holdEnd=.62,dropEnd=1;
    const heroSafeTop=238,heroSafeBottom=Math.round(H*.842)-36,heroSafeH=heroSafeBottom-heroSafeTop;
    const cardRatio=4/5;
    const featureScale=Number(q('tiFeatureSize')?.value||94)/100;
    let heroW=Math.min(W*.92,heroSafeH*cardRatio*.99)*featureScale;
    let heroH=heroW/cardRatio;
    if(heroH>heroSafeH*.99){heroH=heroSafeH*.99;heroW=heroH*cardRatio;}
    const heroX=W/2-heroW/2,heroY=heroSafeTop+(heroSafeH-heroH)/2-18;
    const startW=target.w*.86,startH=target.h*.86,startX=W/2-startW/2,startY=heroSafeTop+50;
    if(stepProgress<growEnd){
      const p=ease(stepProgress/growEnd);
      return {
        x:startX+(heroX-startX)*p,
        y:startY+(heroY-startY)*p-20*Math.sin(Math.PI*p),
        w:startW+(heroW-startW)*p,
        h:startH+(heroH-startH)*p,
        alpha:p
      };
    }
    if(stepProgress<holdEnd){
      const p=(stepProgress-growEnd)/(holdEnd-growEnd);
      const breathe=1+.012*Math.sin(Math.PI*p);
      return {
        x:heroX-heroW*(breathe-1)/2,
        y:heroY-heroH*(breathe-1)/2,
        w:heroW*breathe,
        h:heroH*breathe,
        alpha:1
      };
    }
    const p=ease((stepProgress-holdEnd)/(dropEnd-holdEnd));
    const arc=Math.sin(Math.PI*p);
    return {
      x:heroX+(target.x-heroX)*p+arc*(index%2===0?34:-34),
      y:heroY+(target.y-heroY)*p-arc*38,
      w:heroW+(target.w-heroW)*p,
      h:heroH+(target.h-heroH)*p,
      alpha:1
    };
  }
  function drawCard(ctx,item,x,y,w,h){
    const img=item.img||item;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.30)';
    ctx.shadowBlur=Math.max(8,w*.11);
    ctx.shadowOffsetY=Math.max(5,w*.04);
    rounded(ctx,x,y,w,h,Math.max(5,w*.04));
    ctx.fillStyle='#dce4ee';
    ctx.fill();
    ctx.shadowColor='transparent';
    rounded(ctx,x,y,w,h,Math.max(5,w*.04));
    ctx.clip();
    fitDraw(ctx,img,x,y,w,h,q('tiFit')?.value||'contain');
    ctx.restore();
    ctx.strokeStyle='rgba(255,255,255,.46)';
    ctx.lineWidth=Math.max(1,w*.012);
    rounded(ctx,x,y,w,h,Math.max(5,w*.04));
    ctx.stroke();
  }
  function draw(progress=1){
    const canvas=q('tiCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#07152f';
    ctx.fillRect(0,0,W,H);
    drawHeader(ctx);
    const targets=baseGridBoxes(images.length);
    const count=images.length;
    let active=-1,activeProgress=1;
    if(progress<1&&count){
      const totalUnits=count;
      const sequence=progress*totalUnits;
      active=Math.min(count-1,Math.floor(sequence));
      activeProgress=sequence-active;
    }
    images.forEach((item,i)=>{
      if(progress<1&&i>=active)return;
      const box=targets[i];
      drawCard(ctx,item,box.x,box.y,box.w,box.h);
    });
    if(progress<1&&active>=0&&images[active]){
      ctx.fillStyle='rgba(1,8,22,.38)';
      ctx.fillRect(0,220,W,Math.round(H*.842)-220);
      const box=sequenceBox(targets[active],active,activeProgress);
      ctx.save();
      ctx.globalAlpha=box.alpha;
      drawCard(ctx,images[active],box.x,box.y,box.w,box.h);
      ctx.restore();
    }
    drawFooter(ctx);
    status(`${images.length} headshot${images.length===1?'':'s'} loaded.`);
  }
  function playMotion(){
    cancelAnimationFrame(animFrame);
    animStart=performance.now();
    status('Playing team intro motion preview...');
    const speed=Number(q('tiSpeed')?.value||2100);
    const holdBoost=Number(q('tiHold')?.value||600);
    const duration=Math.max(2200,Math.min(90000,images.length*(speed+holdBoost)));
    function step(now){
      const p=Math.min(1,(now-animStart)/duration);
      draw(p);
      if(p<1)animFrame=requestAnimationFrame(step);
      else status(`${images.length} headshot${images.length===1?'':'s'} loaded. Motion preview complete.`);
    }
    animFrame=requestAnimationFrame(step);
  }
  function download(){
    if(!images.length){status('Add saved cards or files first.');return;}
    draw(1);
    const a=document.createElement('a');
    a.href=q('tiCanvas').toDataURL('image/png');
    a.download='christchurch-team-introduction.png';
    a.click();
  }
  function clearAll(){images=[];cards=[];fillCardSelect();renderOrder();draw(1);status('Cleared.');}
  function openTemplate(){
    let panel=q('teamIntroductionWorkspace');
    if(!panel){
      panel=document.createElement('section');
      panel.id='teamIntroductionWorkspace';
      panel.className='panel';
      panel.style.marginTop='14px';
      panel.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="tiClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(280px,380px) 1fr;gap:18px;align-items:start"><div><div class="control"><label>Main Studio saved Athlete cards</label><select id="tiSavedCards"></select></div><button id="tiLoadCards" class="primary" type="button" style="width:100%;margin-top:8px">Load Athlete Cards</button><button id="tiAddCards" class="secondary" type="button" style="width:100%;margin-top:8px">Add Card To Team</button><div class="control" style="margin-top:14px"><label>Team order</label><select id="tiOrder" size="8" style="min-height:150px"></select></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><button id="tiMoveUp" class="secondary" type="button">Move Up</button><button id="tiMoveDown" class="secondary" type="button">Move Down</button><button id="tiRemove" class="secondary" type="button">Remove</button></div><div class="control" style="margin-top:14px"><label>Add headshots from computer</label><input id="tiFiles" type="file" accept="image/*" multiple></div><button id="tiAddFiles" class="secondary" type="button" style="width:100%;margin-top:8px">Add Chosen Files</button><div class="control"><label>Footer line</label><input id="tiTitle" value="Introducing Your 2026/2027 Seahorses"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="control"><label>Columns</label><select id="tiColumns"><option>6</option><option selected>7</option><option>8</option><option>9</option><option>10</option></select></div><div class="control"><label>Fit</label><select id="tiFit"><option value="contain" selected>Show Full Card</option><option value="cover">Fill Tile</option></select></div></div><div class="control"><label>Feature size <span id="tiFeatureSizeVal" class="value">108%</span></label><input id="tiFeatureSize" type="range" min="80" max="115" value="108"></div><div class="control"><label>Motion speed <span id="tiSpeedVal" class="value">2.4s/card</span></label><input id="tiSpeed" type="range" min="1200" max="4200" step="100" value="2400"></div><div class="control"><label>Hold time <span id="tiHoldVal" class="value">1.1s</span></label><input id="tiHold" type="range" min="300" max="2200" step="100" value="1100"></div><button id="tiMotion" class="primary" type="button" style="width:100%;margin-top:8px">Play Motion Preview</button><button id="tiBuild" class="secondary" type="button" style="width:100%;margin-top:8px">Build Still Preview</button><button id="tiDownload" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button><button id="tiClear" class="secondary" type="button" style="width:100%;margin-top:8px">Clear</button><div id="tiStatus" class="hint" style="margin-top:10px">Ready. Load saved cards when needed.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="tiCanvas" width="1080" height="1350" style="width:min(100%,520px);aspect-ratio:4/5;background:#07152f;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)"></canvas></div></div>`;
      (q('templateLibraryList')?.parentElement||document.body).appendChild(panel);
      q('tiClose').onclick=()=>panel.hidden=true;
      q('tiLoadCards').onclick=loadCards;
      q('tiAddCards').onclick=()=>addSelectedCards().catch(err=>status('Could not add cards: '+err.message));
      q('tiMoveUp').onclick=()=>moveOrdered(-1);
      q('tiMoveDown').onclick=()=>moveOrdered(1);
      q('tiRemove').onclick=removeOrdered;
      q('tiAddFiles').onclick=()=>addFiles().catch(err=>status('Could not add files: '+err.message));
      q('tiMotion').onclick=playMotion;
      q('tiBuild').onclick=()=>draw(1);
      q('tiDownload').onclick=download;
      q('tiClear').onclick=clearAll;
      q('tiColumns').onchange=()=>draw(1);
      q('tiFit').onchange=()=>draw(1);
      q('tiTitle').oninput=()=>draw(1);
      q('tiFeatureSize').oninput=()=>{q('tiFeatureSizeVal').textContent=q('tiFeatureSize').value+'%';draw(1);};
      q('tiSpeed').oninput=()=>{q('tiSpeedVal').textContent=(Number(q('tiSpeed').value)/1000).toFixed(1)+'s/card';};
      q('tiHold').oninput=()=>{q('tiHoldVal').textContent=(Number(q('tiHold').value)/1000).toFixed(1)+'s';};
      fillCardSelect();
      renderOrder();
    }
    panel.hidden=false;
    loadHeaderOverlay();
    draw(1);
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function addTemplateCard(){
    const list=q('templateLibraryList');
    if(!list||q('teamIntroductionCard'))return;
    const row=document.createElement('div');
    row.id='teamIntroductionCard';
    row.className='athleteItem';
    row.style.gridTemplateColumns='88px 1fr auto';
    row.style.padding='10px';
    row.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#f4f7fb,#dce5ef 38%,#07152f 39%,#07152f 100%);display:grid;place-items:center;color:#ff6f18;font-weight:900">TEAM</div><span style="font-weight:800;font-size:14px">Team Introduction</span><button type="button" class="tiny primary" style="width:auto">Open</button>';
    row.querySelector('button').onclick=openTemplate;
    list.prepend(row);
  }
  function init(){
    addTemplateCard();
    new MutationObserver(addTemplateCard).observe(document.body,{childList:true,subtree:true});
    window.__CSMS_TEAM_INTRODUCTION__=true;
    window.CSMSTeamIntroRefresh=addTemplateCard;
    window.CSMSTeamIntroduction={version:'20260831-speed-controls-v4',open:openTemplate,refresh:addTemplateCard};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
