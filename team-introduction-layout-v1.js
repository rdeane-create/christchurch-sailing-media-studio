(function(){
  'use strict';
  const NAME='Team Introduction';
  const W=1080,H=1350;
  const BRIDGE_URL='https://script.google.com/a/macros/christchurchschool.org/s/AKfycbwVpWix_ivzxwpEQxNTBGvJNpThQYjfRRG8T7CYMNPz3r9lB-JI6CowrskoQUAs67lt/exec?action=bridge';
  const HEADER_OVERLAY_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp?v=20260830-team-intro-header';
  const HEADER_GRAY='#d0d6df';
  const q=id=>document.getElementById(id);
  let images=[],cards=[],headerOverlay=null,headerOverlayReady=false,bridgePort=null,bridgeReady=null,bridgeToken='',pending=new Map();
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
    draw();
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
    draw();
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
    draw();
  }
  function removeOrdered(){
    const select=q('tiOrder');
    if(!select||select.selectedIndex<0)return;
    images.splice(select.selectedIndex,1);
    renderOrder();
    draw();
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
    const text=String(q('tiTitle')?.value||'Introducing your 2026/2027 Seahorses').trim();
    const y=Math.round(H*.852),h=H-y;
    const g=ctx.createLinearGradient(0,y,0,H);
    g.addColorStop(0,'rgba(3,24,52,.97)');
    g.addColorStop(1,'rgba(2,14,35,1)');
    footerPath(ctx,y);
    ctx.fillStyle=g;
    ctx.fill();
    ctx.strokeStyle='#f24a18';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(W*.085,y+2);
    ctx.lineTo(W*.47,y+2);
    ctx.lineTo(W*.50,y-6);
    ctx.lineTo(W*.53,y+2);
    ctx.lineTo(W*.915,y+2);
    ctx.stroke();
    const topY=y+h*.25;
    ctx.strokeStyle='#f24a18';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(W*.16,topY);
    ctx.lineTo(W*.31,topY);
    ctx.moveTo(W*.69,topY);
    ctx.lineTo(W*.84,topY);
    ctx.stroke();
    ctx.fillStyle='#ffffff';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='italic 900 43px Arial Black,Arial,sans-serif';
    ctx.fillText('TEAM INTRODUCTION',W/2,topY);
    const font=size=>`900 ${size}px Arial Black,Arial,sans-serif`;
    const size=fitText(ctx,text,W*.86,58,28,font);
    ctx.font=font(size);
    ctx.fillStyle='#ffffff';
    ctx.fillText(text,W/2,y+h*.62);
  }
  function draw(){
    const canvas=q('tiCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#07152f';
    ctx.fillRect(0,0,W,H);
    drawHeader(ctx);
    const footerH=170,margin=54,gap=8,cols=Number(q('tiColumns')?.value)||7,rows=Math.max(1,Math.ceil(Math.max(1,images.length)/cols));
    const y0=260,areaH=H-footerH-y0-20,tileW=(W-margin*2-gap*(cols-1))/cols,tileH=(areaH-gap*(rows-1))/rows;
    images.forEach((item,i)=>{
      const col=i%cols,row=Math.floor(i/cols),x=margin+col*(tileW+gap),y=y0+row*(tileH+gap);
      ctx.save();ctx.beginPath();ctx.rect(x,y,tileW,tileH);ctx.clip();
      ctx.fillStyle='#dce4ee';ctx.fillRect(x,y,tileW,tileH);
      fitDraw(ctx,item.img||item,x,y,tileW,tileH,q('tiFit')?.value||'cover');
      ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.strokeRect(x,y,tileW,tileH);
    });
    drawFooter(ctx);
    status(`${images.length} headshot${images.length===1?'':'s'} loaded.`);
  }
  function download(){
    if(!images.length){status('Add saved cards or files first.');return;}
    draw();
    const a=document.createElement('a');
    a.href=q('tiCanvas').toDataURL('image/png');
    a.download='christchurch-team-introduction.png';
    a.click();
  }
  function clearAll(){images=[];cards=[];fillCardSelect();renderOrder();draw();status('Cleared.');}
  function openTemplate(){
    let panel=q('teamIntroductionWorkspace');
    if(!panel){
      panel=document.createElement('section');
      panel.id='teamIntroductionWorkspace';
      panel.className='panel';
      panel.style.marginTop='14px';
      panel.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="tiClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(280px,380px) 1fr;gap:18px;align-items:start"><div><div class="control"><label>Main Studio saved Athlete cards</label><select id="tiSavedCards"></select></div><button id="tiLoadCards" class="primary" type="button" style="width:100%;margin-top:8px">Load Athlete Cards</button><button id="tiAddCards" class="secondary" type="button" style="width:100%;margin-top:8px">Add Card To Team</button><div class="control" style="margin-top:14px"><label>Team order</label><select id="tiOrder" size="8" style="min-height:150px"></select></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><button id="tiMoveUp" class="secondary" type="button">Move Up</button><button id="tiMoveDown" class="secondary" type="button">Move Down</button><button id="tiRemove" class="secondary" type="button">Remove</button></div><div class="control" style="margin-top:14px"><label>Add headshots from computer</label><input id="tiFiles" type="file" accept="image/*" multiple></div><button id="tiAddFiles" class="secondary" type="button" style="width:100%;margin-top:8px">Add Chosen Files</button><div class="control"><label>Footer line</label><input id="tiTitle" value="Introducing your 2026/2027 Seahorses"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="control"><label>Columns</label><select id="tiColumns"><option>6</option><option selected>7</option><option>8</option><option>9</option><option>10</option></select></div><div class="control"><label>Fit</label><select id="tiFit"><option value="cover" selected>Fill</option><option value="contain">Fit</option></select></div></div><button id="tiBuild" class="primary" type="button" style="width:100%;margin-top:8px">Build Preview</button><button id="tiDownload" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button><button id="tiClear" class="secondary" type="button" style="width:100%;margin-top:8px">Clear</button><div id="tiStatus" class="hint" style="margin-top:10px">Ready. Load saved cards when needed.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="tiCanvas" width="1080" height="1350" style="width:min(100%,520px);aspect-ratio:4/5;background:#07152f;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)"></canvas></div></div>`;
      (q('templateLibraryList')?.parentElement||document.body).appendChild(panel);
      q('tiClose').onclick=()=>panel.hidden=true;
      q('tiLoadCards').onclick=loadCards;
      q('tiAddCards').onclick=()=>addSelectedCards().catch(err=>status('Could not add cards: '+err.message));
      q('tiMoveUp').onclick=()=>moveOrdered(-1);
      q('tiMoveDown').onclick=()=>moveOrdered(1);
      q('tiRemove').onclick=removeOrdered;
      q('tiAddFiles').onclick=()=>addFiles().catch(err=>status('Could not add files: '+err.message));
      q('tiBuild').onclick=draw;
      q('tiDownload').onclick=download;
      q('tiClear').onclick=clearAll;
      q('tiColumns').onchange=draw;
      q('tiFit').onchange=draw;
      q('tiTitle').oninput=draw;
      fillCardSelect();
      renderOrder();
    }
    panel.hidden=false;
    loadHeaderOverlay();
    draw();
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
    window.CSMSTeamIntroduction={version:'20260830-studio-stable-v1',open:openTemplate,refresh:addTemplateCard};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
