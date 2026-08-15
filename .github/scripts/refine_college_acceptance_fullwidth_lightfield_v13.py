from pathlib import Path
import re, sys

p=Path('college-acceptance.js')
text=p.read_text(encoding='utf-8')
old=text
text=text.replace("const VERSION='20260815-college-acceptance-v12-smooth-backlight';","const VERSION='20260815-college-acceptance-v13-fullwidth-lightfield';")

new_draw=r'''function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=50,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2+16,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);
// Full-width backlight field: even brightness behind the complete crest + wordmark, with smooth edge and vertical falloff.
const gw=Math.max(2,Math.ceil(aw+190)),gh=Math.max(2,Math.ceil(ah+180)),glow=document.createElement('canvas');glow.width=gw;glow.height=gh;const gx=glow.getContext('2d'),cx=gw/2,cy=gh/2+14;
// Broad outer field.
const outer=document.createElement('canvas');outer.width=gw;outer.height=gh;const ox=outer.getContext('2d');let vg=ox.createLinearGradient(0,0,0,gh);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(.18,'rgba(255,255,255,.10)');vg.addColorStop(.34,'rgba(255,255,255,.30)');vg.addColorStop(.50,'rgba(255,255,255,.38)');vg.addColorStop(.66,'rgba(255,255,255,.30)');vg.addColorStop(.84,'rgba(255,255,255,.08)');vg.addColorStop(1,'rgba(255,255,255,0)');ox.fillStyle=vg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='destination-in';let hg=ox.createLinearGradient(0,0,gw,0);hg.addColorStop(0,'rgba(0,0,0,0)');hg.addColorStop(.08,'rgba(0,0,0,1)');hg.addColorStop(.92,'rgba(0,0,0,1)');hg.addColorStop(1,'rgba(0,0,0,0)');ox.fillStyle=hg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='source-over';gx.save();gx.filter='blur(18px)';gx.drawImage(outer,0,10);gx.restore();
// Bright inner field kept even across almost the entire logo width.
const innerW=Math.min(gw-24,Math.ceil(aw+70)),innerH=Math.max(56,Math.ceil(ah*.82)),ix=(gw-innerW)/2,iy=cy-innerH/2;gx.save();gx.filter='blur(12px)';const ig=gx.createLinearGradient(0,iy,0,iy+innerH);ig.addColorStop(0,'rgba(255,255,255,0)');ig.addColorStop(.18,'rgba(255,255,255,.38)');ig.addColorStop(.38,'rgba(255,255,255,.78)');ig.addColorStop(.62,'rgba(255,255,255,.78)');ig.addColorStop(.84,'rgba(255,255,255,.34)');ig.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=ig;gx.beginPath();gx.roundRect(ix,iy,innerW,innerH,Math.min(44,innerH/2));gx.fill();gx.restore();
ctx.save();ctx.drawImage(glow,-gw/2,-gh/2+10,gw,gh);ctx.restore();
// Small tight lift directly under the logo, still spanning its complete width.
ctx.save();ctx.globalAlpha=.18;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=16;ctx.fillStyle='rgba(255,255,255,.36)';ctx.beginPath();ctx.roundRect(-aw/2-8,-ah*.34+10,aw+16,ah*.68,Math.min(34,ah*.30));ctx.fill();ctx.restore();
ctx.save();ctx.shadowColor='rgba(0,10,28,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}'''

text,n=re.subn(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw\(progress=S\.progress\)",new_draw+"\nfunction draw(progress=S.progress)",text,flags=re.S)
if n!=1:
    print(f'Expected one drawLogo block, found {n}',file=sys.stderr)
    sys.exit(1)
if text==old:
    print('No changes made',file=sys.stderr)
    sys.exit(1)
p.write_text(text,encoding='utf-8')
print('Updated',p)
