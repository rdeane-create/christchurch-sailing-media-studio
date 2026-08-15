from pathlib import Path
import hashlib

college = Path('college-acceptance.js')
main = Path('athlete-main-headshot-approved-exact.js')

before_main = hashlib.sha256(main.read_bytes()).hexdigest()
s = college.read_text()
old = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,padX=14,padY=10;const targetBottom=887,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeGap=8,availableH=Math.max(90,targetBottom-shoulderTop-safeGap),maxPanelW=930,maxArtW=maxPanelW-padX*2,maxArtH=Math.max(60,availableH-padY*2),sc=Math.min(maxArtW/iw,maxArtH/ih),aw=iw*sc,ah=ih*sc,bw=aw+padX*2,bh=ah+padY*2,finalY=targetBottom-bh/2,startY=95,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);ctx.save();ctx.shadowColor='rgba(2,18,40,.28)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;rounded(ctx,-bw/2,-bh/2,bw,bh,4);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
new = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1;const targetBottom=887,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeGap=8,availableH=Math.max(90,targetBottom-shoulderTop-safeGap),maxArtW=930,maxArtH=Math.max(60,availableH),sc=Math.min(maxArtW/iw,maxArtH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=95,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);ctx.save();ctx.globalAlpha=.42;ctx.shadowColor='rgba(255,255,255,.95)';ctx.shadowBlur=52;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.save();ctx.globalAlpha=.72;ctx.shadowColor='rgba(255,255,255,.95)';ctx.shadowBlur=24;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.save();ctx.shadowColor='rgba(2,18,40,.34)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
if old not in s:
    raise SystemExit('Expected current drawLogo function not found; refusing to patch')
s = s.replace("const VERSION='20260815-college-acceptance-v3-dynamic-logo-zone';", "const VERSION='20260815-college-acceptance-v4-floating-halo';")
s = s.replace(old, new)
s = s.replace('Only the college logo is added and animated.</div>', 'Only the original college logo is added and animated. A soft halo and shadow are drawn behind it; the logo artwork itself is not altered.</div>')
college.write_text(s)
after_main = hashlib.sha256(main.read_bytes()).hexdigest()
if before_main != after_main:
    raise SystemExit('LOCK VIOLATION: Athlete Main Headshot changed')
if "v4-floating-halo" not in s or "shadowBlur=52" not in s or "fillStyle='#fff'" in new:
    raise SystemExit('Floating halo validation failed')
print('College Acceptance floating-logo halo applied; locked Main Headshot unchanged')
