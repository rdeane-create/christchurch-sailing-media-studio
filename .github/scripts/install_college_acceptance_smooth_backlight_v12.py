from pathlib import Path
import re, sys

p=Path('college-acceptance.js')
text=p.read_text(encoding='utf-8')
old=text
text=text.replace("const VERSION='20260815-college-acceptance-v11-backlit-halo';","const VERSION='20260815-college-acceptance-v12-smooth-backlight';")

pattern=r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw\(progress=S\.progress\)"
replacement=r'''function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=50,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2+10,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);
// Smooth backlight: bright directly behind the logo, fading evenly outward with no contour bumps.
const glow=document.createElement('canvas'),gw=Math.max(2,Math.ceil(aw+220)),gh=Math.max(2,Math.ceil(ah+170));glow.width=gw;glow.height=gh;const gx=glow.getContext('2d'),gcx=gw/2,gcy=gh/2+8,rx=Math.max(1,gw*.48),ry=Math.max(1,gh*.46);gx.save();gx.translate(gcx,gcy);gx.scale(1,ry/rx);const grad=gx.createRadialGradient(0,0,Math.max(1,rx*.10),0,0,rx);grad.addColorStop(0,'rgba(255,255,255,.98)');grad.addColorStop(.20,'rgba(255,255,255,.94)');grad.addColorStop(.42,'rgba(255,255,255,.70)');grad.addColorStop(.66,'rgba(255,255,255,.34)');grad.addColorStop(.84,'rgba(255,255,255,.12)');grad.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=grad;gx.beginPath();gx.arc(0,0,rx,0,Math.PI*2);gx.fill();gx.restore();
ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(glow,-gw/2,-gh/2+12,gw,gh);ctx.restore();
// Tight white lift immediately behind the actual logo for a backlit pop.
ctx.save();ctx.globalAlpha=.24;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=24;ctx.drawImage(art,-aw/2,-ah/2+4,aw,ah);ctx.restore();
ctx.save();ctx.shadowColor='rgba(0,10,28,.20)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}
function draw(progress=S.progress)'''
text,n=re.subn(pattern,replacement,text,flags=re.S)
if n!=1:
    print(f'drawLogo replacement count={n}',file=sys.stderr)
    sys.exit(1)
if text==old:
    print('No changes made',file=sys.stderr)
    sys.exit(1)
p.write_text(text,encoding='utf-8')
print('Updated',p)
