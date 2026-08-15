from pathlib import Path
import hashlib

college=Path('college-acceptance.js')
main=Path('athlete-main-headshot-approved-exact.js')
text=college.read_text()
main_before=hashlib.sha256(main.read_bytes()).hexdigest()

old="const VERSION='20260815-college-acceptance-v1';"
new="const VERSION='20260815-college-acceptance-v2-logo-safe-zone';"
assert old in text, 'College Acceptance version marker not found'
text=text.replace(old,new,1)

old_logo="function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const x=540,y=150+(915-150)*e;const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,sc=Math.min(1045/iw,270/ih),aw=iw*sc,ah=ih*sc,padX=14,padY=10,bw=aw+padX*2,bh=ah+padY*2;ctx.save();ctx.translate(x,y);ctx.save();ctx.shadowColor='rgba(2,18,40,.28)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;rounded(ctx,-bw/2,-bh/2,bw,bh,4);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
new_logo="function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const x=540,y=110+(760-110)*e;const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,sc=Math.min(760/iw,180/ih),aw=iw*sc,ah=ih*sc,padX=14,padY=10,bw=aw+padX*2,bh=ah+padY*2;ctx.save();ctx.translate(x,y);ctx.save();ctx.shadowColor='rgba(2,18,40,.28)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;rounded(ctx,-bw/2,-bh/2,bw,bh,4);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
assert old_logo in text, 'Current College Acceptance logo renderer not found'
text=text.replace(old_logo,new_logo,1)

college.write_text(text)
main_after=hashlib.sha256(main.read_bytes()).hexdigest()
assert main_before==main_after, 'LOCK VIOLATION: Athlete Main Headshot changed'
assert "760-110" in text and "Math.min(760/iw,180/ih)" in text
print('College Acceptance logo moved up and shoulder-safe; locked Main Headshot unchanged.')
