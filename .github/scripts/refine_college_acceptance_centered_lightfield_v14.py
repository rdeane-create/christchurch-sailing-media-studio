from pathlib import Path
import re, sys

p = Path('college-acceptance.js')
text = p.read_text(encoding='utf-8')
old_version = "const VERSION='20260815-college-acceptance-v13-fullwidth-lightfield';"
new_version = "const VERSION='20260815-college-acceptance-v14-centered-lightfield';"
if old_version not in text:
    print('Expected College Acceptance v13 not found', file=sys.stderr)
    sys.exit(1)
text = text.replace(old_version, new_version, 1)

new_draw = r'''function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=50,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2+16,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);
// Centered full-width backlight: bright behind the complete logo, with symmetrical smooth fade and no clipped edge.
const gw=Math.max(2,Math.ceil(aw+320)),gh=Math.max(2,Math.ceil(ah+220)),glow=document.createElement('canvas');glow.width=gw;glow.height=gh;const gx=glow.getContext('2d'),cx=gw/2,cy=gh/2;
// Broad outer field. Extra canvas margin keeps both ends fully feathered before clipping.
const outer=document.createElement('canvas');outer.width=gw;outer.height=gh;const ox=outer.getContext('2d');let vg=ox.createLinearGradient(0,0,0,gh);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(.14,'rgba(255,255,255,.06)');vg.addColorStop(.28,'rgba(255,255,255,.20)');vg.addColorStop(.40,'rgba(255,255,255,.36)');vg.addColorStop(.50,'rgba(255,255,255,.46)');vg.addColorStop(.60,'rgba(255,255,255,.36)');vg.addColorStop(.72,'rgba(255,255,255,.20)');vg.addColorStop(.86,'rgba(255,255,255,.06)');vg.addColorStop(1,'rgba(255,255,255,0)');ox.fillStyle=vg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='destination-in';let hg=ox.createLinearGradient(0,0,gw,0);hg.addColorStop(0,'rgba(0,0,0,0)');hg.addColorStop(.08,'rgba(0,0,0,.28)');hg.addColorStop(.16,'rgba(0,0,0,.70)');hg.addColorStop(.24,'rgba(0,0,0,1)');hg.addColorStop(.76,'rgba(0,0,0,1)');hg.addColorStop(.84,'rgba(0,0,0,.70)');hg.addColorStop(.92,'rgba(0,0,0,.28)');hg.addColorStop(1,'rgba(0,0,0,0)');ox.fillStyle=hg;ox.fillRect(0,0,gw,gh);ox.globalCompositeOperation='source-over';gx.save();gx.filter='blur(24px)';gx.drawImage(outer,0,0);gx.restore();
// Bright inner field. It remains even behind the full crest + wordmark and fades only beyond the logo ends.
const inner=document.createElement('canvas');inner.width=gw;inner.height=gh;const nx=inner.getContext('2d'),innerW=Math.min(gw-80,Math.ceil(aw+130)),innerH=Math.max(64,Math.ceil(ah*.96)),ix=(gw-innerW)/2,iy=cy-innerH/2;let iv=nx.createLinearGradient(0,iy,0,iy+innerH);iv.addColorStop(0,'rgba(255,255,255,0)');iv.addColorStop(.16,'rgba(255,255,255,.34)');iv.addColorStop(.32,'rgba(255,255,255,.72)');iv.addColorStop(.50,'rgba(255,255,255,.90)');iv.addColorStop(.68,'rgba(255,255,255,.72)');iv.addColorStop(.84,'rgba(255,255,255,.34)');iv.addColorStop(1,'rgba(255,255,255,0)');nx.fillStyle=iv;nx.fillRect(ix,iy,innerW,innerH);nx.globalCompositeOperation='destination-in';let ihg=nx.createLinearGradient(ix,0,ix+innerW,0);ihg.addColorStop(0,'rgba(0,0,0,0)');ihg.addColorStop(.10,'rgba(0,0,0,.65)');ihg.addColorStop(.18,'rgba(0,0,0,1)');ihg.addColorStop(.82,'rgba(0,0,0,1)');ihg.addColorStop(.90,'rgba(0,0,0,.65)');ihg.addColorStop(1,'rgba(0,0,0,0)');nx.fillStyle=ihg;nx.fillRect(ix,iy,innerW,innerH);nx.globalCompositeOperation='source-over';gx.save();gx.filter='blur(14px)';gx.drawImage(inner,0,0);gx.restore();
ctx.save();ctx.drawImage(glow,-gw/2,-gh/2,gw,gh);ctx.restore();
// Tight centered lift directly behind the full logo, still with feathered ends.
const lift=document.createElement('canvas');lift.width=gw;lift.height=gh;const lx=lift.getContext('2d'),lw=Math.min(gw-100,Math.ceil(aw+70)),lh=Math.max(52,Math.ceil(ah*.70)),lxp=(gw-lw)/2,lyp=cy-lh/2;let lvg=lx.createLinearGradient(0,lyp,0,lyp+lh);lvg.addColorStop(0,'rgba(255,255,255,0)');lvg.addColorStop(.24,'rgba(255,255,255,.42)');lvg.addColorStop(.50,'rgba(255,255,255,.62)');lvg.addColorStop(.76,'rgba(255,255,255,.42)');lvg.addColorStop(1,'rgba(255,255,255,0)');lx.fillStyle=lvg;lx.fillRect(lxp,lyp,lw,lh);lx.globalCompositeOperation='destination-in';let lhg=lx.createLinearGradient(lxp,0,lxp+lw,0);lhg.addColorStop(0,'rgba(0,0,0,0)');lhg.addColorStop(.08,'rgba(0,0,0,.78)');lhg.addColorStop(.15,'rgba(0,0,0,1)');lhg.addColorStop(.85,'rgba(0,0,0,1)');lhg.addColorStop(.92,'rgba(0,0,0,.78)');lhg.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=lhg;lx.fillRect(lxp,lyp,lw,lh);lx.globalCompositeOperation='source-over';ctx.save();ctx.filter='blur(9px)';ctx.globalAlpha=.80;ctx.drawImage(lift,-gw/2,-gh/2,gw,gh);ctx.restore();
ctx.save();ctx.shadowColor='rgba(0,10,28,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}
function draw(progress=S.progress)'''

text, n = re.subn(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw\(progress=S\.progress\)", new_draw, text, count=1, flags=re.S)
if n != 1:
    print('Could not replace drawLogo block', file=sys.stderr)
    sys.exit(1)

p.write_text(text, encoding='utf-8')
print('Updated', p)
