from pathlib import Path
import re, sys

path = Path('college-acceptance.js')
text = path.read_text(encoding='utf-8')

text = text.replace("const VERSION='20260815-college-acceptance-v7-contour-fade-gap';","const VERSION='20260815-college-acceptance-v8-original-logo-protected';")

# Preserve the visible logo exactly as uploaded. Build a separate matte only for the backing effect.
new_trim = r'''function makeLogoMatte(img){const iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1,src=document.createElement('canvas');src.width=iw;src.height=ih;const c=src.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,iw,ih);let id;try{id=c.getImageData(0,0,iw,ih);}catch(_){return src;}const d=id.data,seen=new Uint8Array(iw*ih),queue=[],isEdgeBg=(x,y)=>{const i=(y*iw+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];return a<20||(r>246&&g>246&&b>246&&Math.max(r,g,b)-Math.min(r,g,b)<8);},push=(x,y)=>{if(x<0||y<0||x>=iw||y>=ih)return;const k=y*iw+x;if(seen[k]||!isEdgeBg(x,y))return;seen[k]=1;queue.push(k);};for(let x=0;x<iw;x++){push(x,0);push(x,ih-1);}for(let y=0;y<ih;y++){push(0,y);push(iw-1,y);}for(let qi=0;qi<queue.length;qi++){const k=queue[qi],x=k%iw,y=(k/iw)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}for(let k=0;k<seen.length;k++){const i=k*4;if(seen[k])d[i+3]=0;else if(d[i+3]>18)d[i+3]=255;}c.putImageData(id,0,0);let l=iw,r=-1,t=ih,b=-1;for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){if(d[(y*iw+x)*4+3]>18){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}}if(r<l||b<t)return src;const pad=3;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(iw-1,r+pad);b=Math.min(ih-1,b+pad);const w=r-l+1,h=b-t+1,out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').drawImage(src,l,t,w,h,0,0,w,h);return out;}
function makeWhiteBacking(matte,pad=18,spread=10){const iw=matte.width||1,ih=matte.height||1,c=document.createElement('canvas');c.width=iw+pad*2;c.height=ih+pad*2;const x=c.getContext('2d');const steps=36;for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,dx=Math.cos(a)*spread,dy=Math.sin(a)*spread;x.drawImage(matte,pad+dx,pad+dy);}x.drawImage(matte,pad,pad);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='source-over';return c;}
function loadLogo(file){if(!file){S.logo=S.logoTrim=S.logoBacking=null;draw();return;}const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{S.logo=im;const matte=makeLogoMatte(im);S.logoTrim=matte;S.logoBacking=makeWhiteBacking(matte);S.progress=1;draw();q('caStatus').textContent='College logo loaded. The original logo stays untouched while Studio builds the backing effect separately.';setTimeout(()=>URL.revokeObjectURL(u),60000);};im.onerror=()=>{URL.revokeObjectURL(u);q('caStatus').textContent='Could not load that logo file.';};im.src=u;}'''
text, n = re.subn(r"function trimLogo\(img\)\{.*?\nfunction loadLogo\(file\)\{.*?\}\nfunction rounded", new_trim + "\nfunction rounded", text, flags=re.S)
if n != 1:
    print('Could not replace logo preparation block', file=sys.stderr)
    sys.exit(1)

new_draw = r'''function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),matte=S.logoTrim,back=S.logoBacking,iw=S.logo.naturalWidth||S.logo.width||1,ih=S.logo.naturalHeight||S.logo.height||1,nameTop=920,nameGap=58,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+22,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);if(back&&matte){const matteW=matte.width||1,matteH=matte.height||1,fit=Math.min(aw/matteW,ah/matteH),bw=(back.width||1)*fit,bh=(back.height||1)*fit;ctx.save();ctx.globalAlpha=.16;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=72;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.28;ctx.shadowColor='rgba(255,255,255,.98)';ctx.shadowBlur=38;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.58;ctx.filter='blur(2.8px)';ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.shadowColor='rgba(0,10,28,.28)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();}ctx.drawImage(S.logo,-aw/2,-ah/2,aw,ah);ctx.restore();}'''
text, n = re.subn(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw", new_draw + "\nfunction draw", text, flags=re.S)
if n != 1:
    print('Could not replace drawLogo', file=sys.stderr)
    sys.exit(1)

text = text.replace('A fading white contour backing and soft halo are generated behind the original logo. The logo artwork itself is not altered, and Studio makes it as large as possible while staying below the athlete’s shoulders and above the name.','The original college logo is drawn exactly as uploaded. Studio builds a separate fading white contour and halo behind it, keeps it clear of the athlete’s face and name, and makes it as large as the safe area allows.')

path.write_text(text, encoding='utf-8')
print('patched', path)
