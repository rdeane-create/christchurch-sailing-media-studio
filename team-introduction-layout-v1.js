(function(){
  'use strict';
  const NAME='Team Introduction';
  const W=1080,H=1350;
  const BRIDGE_URL='https://script.google.com/a/macros/christchurchschool.org/s/AKfycbwVpWix_ivzxwpEQxNTBGvJNpThQYjfRRG8T7CYMNPz3r9lB-JI6CowrskoQUAs67lt/exec?action=bridge';
  const q=id=>document.getElementById(id);
  let images=[],cards=[],bridgePort=null,bridgeReady=null,bridgeToken='',pending=new Map();
  function status(text){const el=q('tiStatus');if(el)el.textContent=text;}
  function wait(){return new Promise(r=>setTimeout(r,0));}
  function b64ToBlob(base64,mimeType){const binary=atob(base64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:mimeType||'image/png'});}
  function imageFromBlob(blob){return new Promise(resolve=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);resolve(null)};img.src=url;});}
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
    cards.forEach((card,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=cardLabel(card);
      select.appendChild(option);
    });
    if(!cards.length){
      const option=document.createElement('option');
      option.disabled=true;
      option.textContent='No Athlete Main cards found';
      select.appendChild(option);
    }
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
      status(cards.length?'Select the saved Athlete Main cards to include.':'No Athlete Main saved cards were found.');
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
    const chosen=[...q('tiSavedCards').selectedOptions].map(option=>cards[Number(option.value)]).filter(Boolean);
    if(!chosen.length){status('Select one or more saved cards first.');return;}
    let added=0;
    for(const card of chosen){
      await wait();
      const img=await getCardImage(card.fileId);
      if(img){images.push(img);added++;}
      status(`Added ${added} saved card${added===1?'':'s'}...`);
    }
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
      if(img){images.push(img);added++;}
      status(`Added ${added} file${added===1?'':'s'}...`);
    }
    input.value='';
    draw();
  }
  function fitDraw(ctx,img,x,y,w,h,mode){
    const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,ir=iw/ih,or=w/h;
    let sx=0,sy=0,sw=iw,sh=ih,dx=x,dy=y,dw=w,dh=h;
    if(mode==='cover'){if(ir>or){sw=ih*or;sx=(iw-sw)/2}else{sh=iw/or;sy=(ih-sh)/2}}
    else if(ir>or){dh=w/ir;dy=y+(h-dh)/2}else{dw=h*ir;dx=x+(w-dw)/2}
    ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  }
  function draw(){
    const canvas=q('tiCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#07152f';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.96)';
    ctx.font='900 54px Arial,sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('CHRISTCHURCH SAILING',W/2,72);
    ctx.fillStyle='#ff6f18';
    ctx.fillRect(210,104,660,8);
    const footerH=170,margin=54,gap=8,cols=Number(q('tiColumns')?.value)||7,rows=Math.max(1,Math.ceil(Math.max(1,images.length)/cols));
    const y0=136,areaH=H-footerH-y0-36,tileW=(W-margin*2-gap*(cols-1))/cols,tileH=(areaH-gap*(rows-1))/rows;
    images.forEach((img,i)=>{
      const col=i%cols,row=Math.floor(i/cols),x=margin+col*(tileW+gap),y=y0+row*(tileH+gap);
      ctx.save();ctx.beginPath();ctx.rect(x,y,tileW,tileH);ctx.clip();
      ctx.fillStyle='#dce4ee';ctx.fillRect(x,y,tileW,tileH);
      fitDraw(ctx,img,x,y,tileW,tileH,q('tiFit')?.value||'cover');
      ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.strokeRect(x,y,tileW,tileH);
    });
    const fade=ctx.createLinearGradient(0,H-footerH-70,0,H);
    fade.addColorStop(0,'rgba(7,21,47,0)');
    fade.addColorStop(.35,'rgba(7,21,47,.92)');
    fade.addColorStop(1,'rgba(7,21,47,1)');
    ctx.fillStyle=fade;ctx.fillRect(0,H-footerH-70,W,footerH+70);
    ctx.fillStyle='#ff6f18';ctx.fillRect(90,H-116,900,7);
    ctx.fillStyle='#fff';ctx.font='800 46px Arial,sans-serif';
    ctx.fillText(q('tiTitle')?.value||'Introducing your 2026/2027 Seahorses',W/2,H-54);
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
  function clearAll(){images=[];cards=[];fillCardSelect();draw();status('Cleared.');}
  function openTemplate(){
    let panel=q('teamIntroductionWorkspace');
    if(!panel){
      panel=document.createElement('section');
      panel.id='teamIntroductionWorkspace';
      panel.className='panel';
      panel.style.marginTop='14px';
      panel.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="tiClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(280px,360px) 1fr;gap:18px;align-items:start"><div><div class="control"><label>Main Studio saved Athlete cards</label><select id="tiSavedCards" multiple style="min-height:170px"></select></div><button id="tiLoadCards" class="primary" type="button" style="width:100%;margin-top:8px">Load Main Studio Saved Cards</button><button id="tiAddCards" class="secondary" type="button" style="width:100%;margin-top:8px">Add Selected Saved Cards</button><div class="control" style="margin-top:14px"><label>Add headshots from computer</label><input id="tiFiles" type="file" accept="image/*" multiple></div><button id="tiAddFiles" class="secondary" type="button" style="width:100%;margin-top:8px">Add Chosen Files</button><div class="control"><label>Bottom line</label><input id="tiTitle" value="Introducing your 2026/2027 Seahorses"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="control"><label>Columns</label><select id="tiColumns"><option>6</option><option selected>7</option><option>8</option><option>9</option><option>10</option></select></div><div class="control"><label>Fit</label><select id="tiFit"><option value="cover" selected>Fill</option><option value="contain">Fit</option></select></div></div><button id="tiBuild" class="primary" type="button" style="width:100%;margin-top:8px">Build Preview</button><button id="tiDownload" class="secondary" type="button" style="width:100%;margin-top:8px">Download PNG</button><button id="tiClear" class="secondary" type="button" style="width:100%;margin-top:8px">Clear</button><div id="tiStatus" class="hint" style="margin-top:10px">Ready. Load saved cards when needed.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="tiCanvas" width="1080" height="1350" style="width:min(100%,520px);aspect-ratio:4/5;background:#07152f;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)"></canvas></div></div>`;
      (q('templateLibraryList')?.parentElement||document.body).appendChild(panel);
      q('tiClose').onclick=()=>panel.hidden=true;
      q('tiLoadCards').onclick=loadCards;
      q('tiAddCards').onclick=()=>addSelectedCards().catch(err=>status('Could not add cards: '+err.message));
      q('tiAddFiles').onclick=()=>addFiles().catch(err=>status('Could not add files: '+err.message));
      q('tiBuild').onclick=draw;
      q('tiDownload').onclick=download;
      q('tiClear').onclick=clearAll;
      q('tiColumns').onchange=draw;
      q('tiFit').onchange=draw;
      q('tiTitle').oninput=draw;
      fillCardSelect();
    }
    panel.hidden=false;
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
