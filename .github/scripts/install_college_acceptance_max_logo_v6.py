from pathlib import Path
import hashlib

college = Path('college-acceptance.js')
main = Path('athlete-main-headshot-approved-exact.js')
text = college.read_text()
main_before = hashlib.sha256(main.read_bytes()).hexdigest()

text = text.replace("const VERSION='20260815-college-acceptance-v5-floating-cutout';", "const VERSION='20260815-college-acceptance-v6-max-contour';")
text = text.replace("const S={cards:[],base:null,logo:null,logoTrim:null,progress:1,anim:0,renderUrl:null,shoulderY:560};", "const S={cards:[],base:null,logo:null,logoTrim:null,logoBacking:null,progress:1,anim:0,renderUrl:null,shoulderY:560};")

old_load = "function loadLogo(file){if(!file){S.logo=S.logoTrim=null;draw();return;}const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{S.logo=im;S.logoTrim=trimLogo(im);S.progress=1;draw();q('caStatus').textContent='College logo loaded. Play the drop animation.';setTimeout(()=>URL.revokeObjectURL(u),60000);};im.onerror=()=>{URL.revokeObjectURL(u);q('caStatus').textContent='Could not load that logo file.';};im.src=u;}"
new_load = "function makeWhiteBacking(art,pad=18,spread=12){const iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,c=document.createElement('canvas');c.width=iw+pad*2;c.height=ih+pad*2;const x=c.getContext('2d');const steps=32;for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,dx=Math.cos(a)*spread,dy=Math.sin(a)*spread;x.drawImage(art,pad+dx,pad+dy);}x.drawImage(art,pad,pad);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='source-over';return c;}\nfunction loadLogo(file){if(!file){S.logo=S.logoTrim=S.logoBacking=null;draw();return;}const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{S.logo=im;S.logoTrim=trimLogo(im);S.logoBacking=makeWhiteBacking(S.logoTrim||S.logo);S.progress=1;draw();q('caStatus').textContent='College logo loaded. Studio is maximizing it inside this athlete’s shoulder-safe zone.';setTimeout(()=>URL.revokeObjectURL(u),60000);};im.onerror=()=>{URL.revokeObjectURL(u);q('caStatus').textContent='Could not load that logo file.';};im.src=u;}"
if old_load not in text:
    raise SystemExit('loadLogo pattern not found')
text = text.replace(old_load, new_load)

old_draw = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1;const targetBottom=887,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeGap=8,availableH=Math.max(90,targetBottom-shoulderTop-safeGap),maxArtW=930,maxArtH=Math.max(60,availableH),sc=Math.min(maxArtW/iw,maxArtH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=95,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);ctx.save();ctx.globalAlpha=.62;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=70;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.save();ctx.globalAlpha=.92;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=32;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.save();ctx.shadowColor='rgba(0,10,28,.50)';ctx.shadowBlur=18;ctx.shadowOffsetY=8;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
new_draw = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoTrim||S.logo,back=S.logoBacking,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,targetBottom=890,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+16,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);if(back){const bw=(back.width||1)*sc,bh=(back.height||1)*sc;ctx.save();ctx.globalAlpha=.72;ctx.shadowColor='rgba(255,255,255,.98)';ctx.shadowBlur=42;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.shadowColor='rgba(0,10,28,.42)';ctx.shadowBlur=16;ctx.shadowOffsetY=7;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.drawImage(back,-bw/2,-bh/2,bw,bh);}ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
if old_draw not in text:
    raise SystemExit('drawLogo pattern not found')
text = text.replace(old_draw, new_draw)

text = text.replace("A soft halo and shadow are drawn behind it; the logo artwork itself is not altered.", "A tight white contour backing and soft halo are generated behind the original logo. The logo artwork itself is not altered, and Studio makes it as large as possible while staying below the athlete’s shoulders and above the name.")

college.write_text(text)
main_after = hashlib.sha256(main.read_bytes()).hexdigest()
if main_before != main_after:
    raise SystemExit('LOCK VIOLATION: Athlete Main Headshot changed')
print('College Acceptance v6 installed; locked Main Headshot unchanged:', main_after)
