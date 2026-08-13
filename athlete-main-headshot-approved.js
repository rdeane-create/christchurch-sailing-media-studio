(function(){
  const NAME='Athlete Main Headshot — Approved';
  const V=window.AMH_APPROVED_VECTORS||{};
  let S={img:null,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027'};

  function buildCard(){
    if(document.getElementById('amhApprovedCard')) return;
    const list=document.getElementById('templateLibraryList');
    if(!list) return;
    const r=document.createElement('div');
    r.id='amhApprovedCard'; r.className='athleteItem';
    r.style.gridTemplateColumns='88px 1fr auto'; r.style.padding='10px';
    r.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#e3e7ec,#fff 43%,#8392a0 70%,#03182a)"></div><span style="font-weight:800;font-size:14px">'+NAME+'</span><button type="button" class="tiny primary" style="width:auto">Open</button>';
    r.querySelector('button').addEventListener('click',openTemplate);
    list.prepend(r);
  }

  function openTemplate(){
    let p=document.getElementById('amhApprovedWorkspace');
    if(!p){
      p=document.createElement('section'); p.id='amhApprovedWorkspace'; p.className='panel'; p.style.marginTop='14px';
      p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="aClose" class="secondary tiny" type="button">Close</button></div>
      <div style="display:grid;grid-template-columns:minmax(270px,350px) 1fr;gap:18px;align-items:start"><div>
      <div class="control"><label>Upload athlete image</label><input id="aUpload" type="file" accept="image/*"></div>
      <div class="control"><label>Size <span id="aScaleVal" class="value">100%</span></label><input id="aScale" type="range" min="25" max="300" value="100"></div>
      <div class="control"><label>Left / Right <span id="aXVal" class="value">0</span></label><input id="aX" type="range" min="-500" max="500" value="0"></div>
      <div class="control"><label>Up / Down <span id="aYVal" class="value">0</span></label><input id="aY" type="range" min="-500" max="500" value="0"></div>
      <div class="control"><label>First name</label><input id="aFirst" value="WYLDER"></div>
      <div class="control"><label>Last name</label><input id="aLast" value="SMITH"></div>
      <div class="control"><label>Class line</label><input id="aClass" value="CLASS OF 2027"></div>
      <button id="aReset" class="secondary" type="button" style="width:100%">Reset image</button>
      <button id="aDownload" class="primary" type="button" style="width:100%;margin-top:8px">Download PNG</button>
      <div class="hint" style="margin-top:10px">Drag the athlete image directly on the card to reposition it.</div></div>
      <div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="aCanvas" width="1080" height="1350" style="width:min(100%,500px);aspect-ratio:4/5;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);cursor:grab;touch-action:none"></canvas></div></div>`;
      (document.getElementById('templateLibraryList')?.parentElement||document.body).appendChild(p); wire(p);
    }
    p.hidden=false; draw(); p.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function wire(p){
    const c=p.querySelector('#aCanvas');
    p.querySelector('#aClose').onclick=()=>p.hidden=true;
    p.querySelector('#aUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f)};
    p.querySelector('#aScale').oninput=e=>{S.scale=+e.target.value/100;labels(p);draw()};
    p.querySelector('#aX').oninput=e=>{S.x=+e.target.value;labels(p);draw()};
    p.querySelector('#aY').oninput=e=>{S.y=+e.target.value;labels(p);draw()};
    p.querySelector('#aFirst').oninput=e=>{S.first=e.target.value.toUpperCase();draw()};
    p.querySelector('#aLast').oninput=e=>{S.last=e.target.value.toUpperCase();draw()};
    p.querySelector('#aClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};
    p.querySelector('#aReset').onclick=()=>{S.scale=1;S.x=S.y=0;sync(p);draw()};
    p.querySelector('#aDownload').onclick=()=>{draw();const a=document.createElement('a');a.download='athlete-main-headshot-approved.png';a.href=c.toDataURL('image/png');a.click()};
    const pt=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
    c.onpointerdown=e=>{if(!S.img)return;c.setPointerCapture(e.pointerId);const q=pt(e);S.drag=true;S.sx=q.x;S.sy=q.y;S.ix=S.x;S.iy=S.y;c.style.cursor='grabbing'};
    c.onpointermove=e=>{if(!S.drag)return;const q=pt(e);S.x=Math.max(-500,Math.min(500,S.ix+q.x-S.sx));S.y=Math.max(-500,Math.min(500,S.iy+q.y-S.sy));sync(p);draw()};
    c.onpointerup=c.onpointercancel=()=>{S.drag=false;c.style.cursor='grab'};
  }
  function labels(p){p.querySelector('#aScaleVal').textContent=Math.round(S.scale*100)+'%';p.querySelector('#aXVal').textContent=Math.round(S.x);p.querySelector('#aYVal').textContent=Math.round(S.y)}
  function sync(p){p.querySelector('#aScale').value=Math.round(S.scale*100);p.querySelector('#aX').value=Math.round(S.x);p.querySelector('#aY').value=Math.round(S.y);labels(p)}

  function glyphPath(g,x,y,h,xs){const p=new Path2D();for(const poly of g.p){poly.forEach((q,i)=>{const px=x+q[0]*h*g.a*xs,py=y+q[1]*h;i?p.lineTo(px,py):p.moveTo(px,py)});p.closePath()}return p}
  function measure(t,h,tr,xs){let w=0;for(const ch of t){if(ch===' '){w+=h*.38+tr;continue}const g=V[ch];if(g)w+=h*g.a*xs+tr}return Math.max(0,w-tr)}
  function drawVector(ctx,t,x,y,h,tr,max,xs,fill){t=(t||'').toUpperCase();const m=measure(t,h,tr,xs);if(max&&m>max){const f=max/m;h*=f;tr*=f}let cx=x;for(const ch of t){if(ch===' '){cx+=h*.38+tr;continue}const g=V[ch];if(!g)continue;const path=glyphPath(g,cx,y,h,xs);ctx.save();ctx.shadowColor='rgba(0,0,0,.58)';ctx.shadowBlur=h*.05;ctx.shadowOffsetX=h*.03;ctx.shadowOffsetY=h*.045;ctx.fillStyle=fill;ctx.fill(path,'evenodd');ctx.restore();ctx.save();ctx.strokeStyle='rgba(255,255,255,.36)';ctx.lineWidth=Math.max(1,h*.01);ctx.stroke(path);ctx.restore();cx+=h*g.a*xs+tr}}

  function draw(){
    const c=document.getElementById('aCanvas'); if(!c)return; const ctx=c.getContext('2d'),W=1080,H=1350;
    ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
    if(S.img){ctx.save();ctx.beginPath();ctx.rect(0,125,W,H-125);ctx.clip();const cover=Math.max(W/S.img.width,H/S.img.height),sc=cover*S.scale,w=S.img.width*sc,h=S.img.height*sc;ctx.drawImage(S.img,(W-w)/2+S.x,(H-h)/2+S.y,w,h);ctx.restore()}
    let veil=ctx.createLinearGradient(0,0,0,600);veil.addColorStop(0,'rgba(255,255,255,1)');veil.addColorStop(.35,'rgba(255,255,255,.98)');veil.addColorStop(.68,'rgba(255,255,255,.72)');veil.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=veil;ctx.fillRect(0,0,W,600);
    let bg=ctx.createLinearGradient(0,575,0,H);bg.addColorStop(0,'rgba(3,24,42,0)');bg.addColorStop(.18,'rgba(3,24,42,.16)');bg.addColorStop(.42,'rgba(3,24,42,.52)');bg.addColorStop(.68,'rgba(3,24,42,.88)');bg.addColorStop(1,'rgba(3,24,42,1)');ctx.fillStyle=bg;ctx.fillRect(0,575,W,H-575);
    let hg=ctx.createLinearGradient(0,0,0,245);hg.addColorStop(0,'rgba(208,214,223,.76)');hg.addColorStop(1,'rgba(208,214,223,0)');ctx.fillStyle=hg;ctx.fillRect(0,0,W,245);
    drawHeader(ctx);
    ctx.save();ctx.fillStyle='#fff';ctx.font='italic 800 58px Arial Narrow,Arial,sans-serif';ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=8;ctx.shadowOffsetX=4;ctx.shadowOffsetY=5;ctx.fillText(S.first,72,898);ctx.restore();
    drawVector(ctx,S.last,52,900,255,-8,920,.88,'#f6f7f8');
    ctx.save();ctx.fillStyle='#f24a18';ctx.shadowColor='rgba(0,0,0,.38)';ctx.shadowBlur=6;ctx.fillRect(58,1183,570,6);ctx.font='italic 900 53px Arial Narrow,Arial,sans-serif';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=7;ctx.shadowOffsetX=4;ctx.shadowOffsetY=5;ctx.fillText(S.classLine,60,1251);ctx.restore();
  }
  function drawHeader(ctx){
    ctx.save();ctx.fillStyle='#06203a';ctx.beginPath();ctx.arc(90,70,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#f24a18';ctx.beginPath();ctx.moveTo(76,55);ctx.lineTo(108,66);ctx.lineTo(76,76);ctx.closePath();ctx.fill();ctx.strokeStyle='#f24a18';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(142,19);ctx.lineTo(142,115);ctx.stroke();ctx.fillStyle='#06203a';ctx.font='italic 900 82px Arial Black,Arial,sans-serif';ctx.fillText('CHRISTCHURCH',168,78);ctx.fillStyle='#f24a18';ctx.font='700 31px Arial,sans-serif';ctx.fillText('S  A  I  L  I  N  G',360,120);ctx.restore();
  }

  function init(){buildCard();new MutationObserver(buildCard).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
