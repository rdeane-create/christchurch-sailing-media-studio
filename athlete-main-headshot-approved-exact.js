(function(){
  'use strict';
  const NAME='Athlete Main Headshot — Approved';
  const VERSION='20260814-white-core-balance-16';
  const W=1080,H=1350;
  const OVERLAY_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp';
  const ATLAS_SRC='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_GLYPH_ATLAS_v1.webp';
  const GLYPHS={"large:A":{"x":8,"y":8,"w":65,"h":121},"large:B":{"x":112,"y":8,"w":70,"h":120},"large:C":{"x":216,"y":8,"w":67,"h":121},"large:D":{"x":320,"y":8,"w":70,"h":120},"large:E":{"x":424,"y":8,"w":64,"h":119},"large:F":{"x":528,"y":8,"w":63,"h":120},"large:G":{"x":632,"y":8,"w":64,"h":123},"large:H":{"x":736,"y":8,"w":72,"h":121},"large:I":{"x":840,"y":8,"w":45,"h":120},"large:J":{"x":944,"y":8,"w":56,"h":120},"large:K":{"x":1048,"y":8,"w":71,"h":121},"large:L":{"x":1152,"y":8,"w":46,"h":121},"large:M":{"x":8,"y":149,"w":88,"h":121},"large:N":{"x":112,"y":149,"w":71,"h":119},"large:O":{"x":216,"y":149,"w":66,"h":120},"large:P":{"x":320,"y":149,"w":67,"h":119},"large:Q":{"x":424,"y":149,"w":66,"h":125},"large:R":{"x":528,"y":149,"w":67,"h":119},"large:S":{"x":632,"y":149,"w":62,"h":120},"large:T":{"x":736,"y":149,"w":56,"h":119},"large:U":{"x":840,"y":149,"w":67,"h":119},"large:V":{"x":944,"y":149,"w":59,"h":119},"large:W":{"x":1048,"y":149,"w":83,"h":119},"large:X":{"x":1152,"y":149,"w":71,"h":119},"large:Y":{"x":8,"y":290,"w":57,"h":119},"large:Z":{"x":112,"y":290,"w":62,"h":119},"large:0":{"x":216,"y":290,"w":57,"h":76},"large:1":{"x":320,"y":290,"w":36,"h":76},"large:2":{"x":424,"y":290,"w":55,"h":85},"large:3":{"x":528,"y":290,"w":54,"h":76},"large:4":{"x":632,"y":290,"w":56,"h":76},"large:5":{"x":736,"y":290,"w":55,"h":76},"large:6":{"x":840,"y":290,"w":54,"h":76},"large:7":{"x":944,"y":290,"w":47,"h":76},"large:8":{"x":1048,"y":290,"w":54,"h":76},"large:9":{"x":1152,"y":290,"w":53,"h":76},"small:A":{"x":8,"y":431,"w":38,"h":46},"small:B":{"x":112,"y":431,"w":41,"h":47},"small:C":{"x":216,"y":431,"w":39,"h":49},"small:D":{"x":320,"y":431,"w":42,"h":46},"small:E":{"x":424,"y":431,"w":38,"h":46},"small:F":{"x":528,"y":431,"w":39,"h":48},"small:G":{"x":632,"y":431,"w":38,"h":50},"small:H":{"x":736,"y":431,"w":44,"h":47},"small:I":{"x":840,"y":431,"w":25,"h":47},"small:J":{"x":944,"y":431,"w":32,"h":46},"small:K":{"x":1048,"y":431,"w":43,"h":47},"small:L":{"x":1152,"y":431,"w":30,"h":47},"small:M":{"x":8,"y":572,"w":52,"h":48},"small:N":{"x":112,"y":572,"w":44,"h":48},"small:O":{"x":216,"y":572,"w":39,"h":49},"small:P":{"x":320,"y":572,"w":40,"h":47},"small:Q":{"x":424,"y":572,"w":40,"h":54},"small:R":{"x":528,"y":572,"w":41,"h":47},"small:S":{"x":632,"y":572,"w":38,"h":49},"small:T":{"x":736,"y":572,"w":34,"h":48},"small:U":{"x":840,"y":572,"w":40,"h":47},"small:V":{"x":944,"y":572,"w":37,"h":67},"small:W":{"x":1048,"y":572,"w":50,"h":67},"small:X":{"x":1152,"y":572,"w":45,"h":47},"small:Y":{"x":8,"y":713,"w":36,"h":47},"small:Z":{"x":112,"y":713,"w":40,"h":47},"small:0":{"x":216,"y":713,"w":34,"h":60},"small:1":{"x":320,"y":713,"w":23,"h":40},"small:2":{"x":424,"y":713,"w":34,"h":40},"small:3":{"x":528,"y":713,"w":31,"h":40},"small:4":{"x":632,"y":713,"w":31,"h":40},"small:5":{"x":736,"y":713,"w":31,"h":40},"small:6":{"x":840,"y":713,"w":30,"h":40},"small:7":{"x":944,"y":713,"w":29,"h":40},"small:8":{"x":1048,"y":713,"w":30,"h":40},"small:9":{"x":1152,"y":713,"w":32,"h":40},"orange:A":{"x":8,"y":854,"w":34,"h":41},"orange:B":{"x":112,"y":854,"w":37,"h":41},"orange:C":{"x":216,"y":854,"w":35,"h":42},"orange:D":{"x":320,"y":854,"w":36,"h":40},"orange:E":{"x":424,"y":854,"w":34,"h":41},"orange:F":{"x":528,"y":854,"w":35,"h":41},"orange:G":{"x":632,"y":854,"w":34,"h":42},"orange:H":{"x":736,"y":854,"w":38,"h":42},"orange:I":{"x":840,"y":854,"w":22,"h":42},"orange:J":{"x":944,"y":854,"w":29,"h":42},"orange:K":{"x":1048,"y":854,"w":39,"h":42},"orange:L":{"x":1152,"y":854,"w":26,"h":41},"orange:M":{"x":8,"y":995,"w":46,"h":42},"orange:N":{"x":112,"y":995,"w":39,"h":41},"orange:O":{"x":216,"y":995,"w":36,"h":42},"orange:P":{"x":320,"y":995,"w":36,"h":41},"orange:Q":{"x":424,"y":995,"w":36,"h":47},"orange:R":{"x":528,"y":995,"w":36,"h":42},"orange:S":{"x":632,"y":995,"w":33,"h":42},"orange:T":{"x":736,"y":995,"w":30,"h":41},"orange:U":{"x":840,"y":995,"w":35,"h":41},"orange:V":{"x":944,"y":995,"w":31,"h":41},"orange:W":{"x":1048,"y":995,"w":45,"h":41},"orange:X":{"x":1152,"y":995,"w":39,"h":41},"orange:Y":{"x":8,"y":1136,"w":31,"h":41},"orange:Z":{"x":112,"y":1136,"w":36,"h":41},"orange:0":{"x":216,"y":1136,"w":31,"h":40},"orange:1":{"x":320,"y":1136,"w":21,"h":39},"orange:2":{"x":424,"y":1136,"w":32,"h":39},"orange:3":{"x":528,"y":1136,"w":30,"h":39},"orange:4":{"x":632,"y":1136,"w":30,"h":39},"orange:5":{"x":736,"y":1136,"w":31,"h":39},"orange:6":{"x":840,"y":1136,"w":30,"h":39},"orange:7":{"x":944,"y":1136,"w":29,"h":39},"orange:8":{"x":1048,"y":1136,"w":30,"h":40},"orange:9":{"x":1152,"y":1136,"w":30,"h":39}};
  const S={img:null,scale:1,x:0,y:0,drag:false,sx:0,sy:0,ix:0,iy:0,first:'WYLDER',last:'SMITH',classLine:'CLASS OF 2027',overlay:null,atlas:null,ready:false};
  const q=id=>document.getElementById(id);
  function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Exact approved local asset unavailable: '+src));i.src=src+'?v=20260814-white-core-balance-16';});}
  function buildCard(){if(q('amhApprovedCard'))return;const list=q('templateLibraryList');if(!list)return;const r=document.createElement('div');r.id='amhApprovedCard';r.className='athleteItem';r.style.gridTemplateColumns='88px 1fr auto';r.style.padding='10px';r.innerHTML='<div style="width:72px;height:90px;border:1px solid #d8e2ed;border-radius:8px;background:linear-gradient(#dfe4ea,#fff 45%,#7f8e9b 72%,#03182a)"></div><span style="font-weight:800;font-size:14px">'+NAME+'</span><button type="button" class="tiny primary" style="width:auto">Open</button>';r.querySelector('button').onclick=openTemplate;list.prepend(r)}
  function openTemplate(){let p=q('amhApprovedWorkspace');if(!p){p=document.createElement('section');p.id='amhApprovedWorkspace';p.className='panel';p.style.marginTop='14px';p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><h2 style="margin:0">${NAME}</h2><button id="aClose" class="secondary tiny" type="button">Close</button></div><div style="display:grid;grid-template-columns:minmax(270px,350px) 1fr;gap:18px;align-items:start"><div><div class="control"><label>Upload athlete image</label><input id="aUpload" type="file" accept="image/*"></div><div class="control"><label>Size <span id="aScaleVal" class="value">100%</span></label><input id="aScale" type="range" min="25" max="300" value="100"></div><div class="control"><label>Left / Right <span id="aXVal" class="value">0</span></label><input id="aX" type="range" min="-500" max="500" value="0"></div><div class="control"><label>Up / Down <span id="aYVal" class="value">0</span></label><input id="aY" type="range" min="-500" max="500" value="0"></div><div class="control"><label>First name</label><input id="aFirst" value="WYLDER"></div><div class="control"><label>Last name</label><input id="aLast" value="SMITH"></div><div class="control"><label>Class line</label><input id="aClass" value="CLASS OF 2027"></div><button id="aReset" class="secondary" type="button" style="width:100%">Reset image</button><button id="aDownload" class="primary" type="button" style="width:100%;margin-top:8px">Download PNG</button><div class="hint" style="margin-top:10px">Locked approved artwork. Only the athlete photo and text content are editable.</div></div><div style="background:#08152e;border-radius:18px;padding:18px;display:flex;justify-content:center;align-items:center;min-height:720px"><canvas id="aCanvas" width="1080" height="1350" style="width:min(100%,500px);aspect-ratio:4/5;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);cursor:grab;touch-action:none"></canvas></div></div>`;(q('templateLibraryList')?.parentElement||document.body).appendChild(p);wire(p)}p.hidden=false;ensureAssets().then(draw);p.scrollIntoView({behavior:'smooth',block:'start'})}
  async function ensureAssets(){if(S.ready)return;try{[S.overlay,S.atlas]=await Promise.all([loadImage(OVERLAY_SRC),loadImage(ATLAS_SRC)]);S.ready=true;draw()}catch(err){console.error('Approved template assets failed to load',err)}}
  function wire(p){const c=q('aCanvas');q('aClose').onclick=()=>p.hidden=true;q('aUpload').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();const url=URL.createObjectURL(f);im.onload=()=>{S.img=im;S.scale=1;S.x=S.y=0;sync(p);draw();URL.revokeObjectURL(url)};im.src=url};q('aScale').oninput=e=>{S.scale=+e.target.value/100;labels(p);draw()};q('aX').oninput=e=>{S.x=+e.target.value;labels(p);draw()};q('aY').oninput=e=>{S.y=+e.target.value;labels(p);draw()};q('aFirst').oninput=e=>{S.first=e.target.value.toUpperCase();draw()};q('aLast').oninput=e=>{S.last=e.target.value.toUpperCase();draw()};q('aClass').oninput=e=>{S.classLine=e.target.value.toUpperCase();draw()};q('aReset').onclick=()=>{S.scale=1;S.x=S.y=0;sync(p);draw()};q('aDownload').onclick=()=>{draw();const a=document.createElement('a');a.download='athlete-main-headshot-approved.png';a.href=c.toDataURL('image/png');a.click()};const pt=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};c.onpointerdown=e=>{if(!S.img)return;c.setPointerCapture(e.pointerId);const z=pt(e);S.drag=true;S.sx=z.x;S.sy=z.y;S.ix=S.x;S.iy=S.y;c.style.cursor='grabbing'};c.onpointermove=e=>{if(!S.drag)return;const z=pt(e);S.x=Math.max(-500,Math.min(500,S.ix+z.x-S.sx));S.y=Math.max(-500,Math.min(500,S.iy+z.y-S.sy));sync(p);draw()};c.onpointerup=c.onpointercancel=()=>{S.drag=false;c.style.cursor='grab'}}
  function labels(p){q('aScaleVal').textContent=Math.round(S.scale*100)+'%';q('aXVal').textContent=Math.round(S.x);q('aYVal').textContent=Math.round(S.y)}
  function sync(p){q('aScale').value=Math.round(S.scale*100);q('aX').value=Math.round(S.x);q('aY').value=Math.round(S.y);labels(p)}
const GLYPH_METRICS={};
function glyphMetrics(style,ch){
  const key=style+':'+ch;
  if(GLYPH_METRICS[key])return GLYPH_METRICS[key];
  const g=GLYPHS[key];
  if(!g||!S.atlas)return g;
  const c=document.createElement('canvas');
  c.width=g.w;c.height=g.h;
  const gx=c.getContext('2d',{willReadFrequently:true});
  gx.clearRect(0,0,g.w,g.h);
  gx.drawImage(S.atlas,g.x,g.y,g.w,g.h,0,0,g.w,g.h);
  const px=gx.getImageData(0,0,g.w,g.h).data;
  let minX=g.w,minY=g.h,maxX=-1,maxY=-1;
  const rows=[];
  for(let yy=0;yy<g.h;yy++){
    let left=g.w,right=-1;
    for(let xx=0;xx<g.w;xx++){
      const i=(yy*g.w+xx)*4;
      const r=px[i],gg=px[i+1],b=px[i+2],a=px[i+3];
      const whiteCore=a>170 && Math.min(r,gg,b)>178;
      if(whiteCore){
        if(xx<left)left=xx;if(xx>right)right=xx;
        if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;
        if(yy<minY)minY=yy;if(yy>maxY)maxY=yy;
      }
    }
    rows[yy]=right>=left?[left,right]:null;
  }
  if(maxX<minX){GLYPH_METRICS[key]=g;return g;}
  const h=maxY-minY+1,w=maxX-minX+1,left=[],right=[];
  for(let yy=minY;yy<=maxY;yy++){
    const row=rows[yy];
    left.push(row?row[0]-minX:null);
    right.push(row?row[1]-minX:null);
  }
  const m={x:g.x+minX,y:g.y+minY,w,h,left,right};
  GLYPH_METRICS[key]=m;
  return m;
}
function glyphWidth(style,ch,height){
  const g=glyphMetrics(style,ch);if(!g)return 0;
  return g.w*(height/g.h);
}
function contourDelta(style,a,b,height,tracking){
  if(!a||!b)return 0;
  if(style==='orange')return tracking;
  const A=glyphMetrics(style,a),B=glyphMetrics(style,b);
  if(!A||!B||!A.left||!B.left)return tracking;
  const sa=height/A.h,sb=height/B.h,aw=A.w*sa;
  const target=style==='large'?9:7;
  const needs=[];
  const samples=Math.max(28,Math.round(height));
  for(let n=0;n<samples;n++){
    const t=samples===1?0:n/(samples-1);
    if(t<.06||t>.94)continue;
    const ya=Math.min(A.h-1,Math.round(t*(A.h-1)));
    const yb=Math.min(B.h-1,Math.round(t*(B.h-1)));
    const ar=A.right[ya],bl=B.left[yb];
    if(ar==null||bl==null)continue;
    needs.push(target-aw-bl*sb+ar*sa);
  }
  if(!needs.length)return tracking;
  const required=Math.max(...needs);
  const min=-height*.42,max=style==='large'?height*.08:height*.16;
  return Math.max(min,Math.min(max,required));
}
function measure(text,style,height,tracking){
  const chars=String(text||'').toUpperCase();
  let w=0,prev='';
  for(const ch of chars){
    if(ch===' '){w+=height*.34;prev='';continue;}
    const g=glyphMetrics(style,ch);if(!g)continue;
    if(prev)w+=contourDelta(style,prev,ch,height,tracking);
    w+=glyphWidth(style,ch,height);prev=ch;
  }
  return w;
}
function drawRasterText(ctx,text,style,x,y,height,tracking,maxWidth){
  text=String(text||'').toUpperCase();
  let h=height;
  const mw=measure(text,style,h,tracking);
  if(maxWidth&&mw>maxWidth)h*=maxWidth/mw;
  let cx=x,prev='';
  for(const ch of text){
    if(ch===' '){cx+=h*.34;prev='';continue;}
    const g=glyphMetrics(style,ch);if(!g)continue;
    if(prev)cx+=contourDelta(style,prev,ch,h,tracking);
    const sc=h/g.h,dw=g.w*sc,dh=h;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.62)';ctx.shadowBlur=Math.max(4,h*.055);
    ctx.shadowOffsetX=Math.max(3,h*.035);ctx.shadowOffsetY=Math.max(4,h*.045);
    ctx.drawImage(S.atlas,g.x,g.y,g.w,g.h,cx,y,dw,dh);
    ctx.restore();
    cx+=dw;prev=ch;
  }
}
  function drawPhoto(ctx){if(!S.img)return;const base=Math.max(W/S.img.width,H/S.img.height),sc=base*S.scale,dw=S.img.width*sc,dh=S.img.height*sc;ctx.drawImage(S.img,(W-dw)/2+S.x,(H-dh)/2+S.y,dw,dh)}
  function draw(){const c=q('aCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);drawPhoto(ctx);if(S.overlay)ctx.drawImage(S.overlay,0,0,W,H);if(!S.atlas)return;drawRasterText(ctx,S.first,'small',82,897,58,0,710);drawRasterText(ctx,S.last,'large',48,967,205,0,960);ctx.save();ctx.fillStyle='#f24a18';ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=5;ctx.fillRect(56,1194,575,7);ctx.restore();drawRasterText(ctx,S.classLine,'orange',58,1216,52,13,760)}
  function init(){buildCard();new MutationObserver(buildCard).observe(document.body,{childList:true,subtree:true});ensureAssets()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
