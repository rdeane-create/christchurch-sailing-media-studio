from pathlib import Path
import re

p = Path('college-acceptance.js')
s = p.read_text(encoding='utf-8')

s = s.replace("const VERSION='20260815-college-acceptance-v6-max-contour';", "const VERSION='20260815-college-acceptance-v7-contour-fade-gap';")

old_trim = re.search(r"function trimLogo\(img\)\{.*?\nfunction makeWhiteBacking", s, re.S)
if not old_trim:
    raise SystemExit('trimLogo block not found')
new_trim = """function trimLogo(img){const iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;const src=document.createElement('canvas');src.width=iw;src.height=ih;const c=src.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,iw,ih);let id;try{id=c.getImageData(0,0,iw,ih);}catch(_){return src;}const d=id.data,seen=new Uint8Array(iw*ih),q=[],isBg=(x,y)=>{const i=(y*iw+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];return a<18||(r>242&&g>242&&b>242&&Math.max(r,g,b)-Math.min(r,g,b)<12);};const push=(x,y)=>{if(x<0||y<0||x>=iw||y>=ih)return;const k=y*iw+x;if(seen[k]||!isBg(x,y))return;seen[k]=1;q.push(k);};for(let x=0;x<iw;x++){push(x,0);push(x,ih-1);}for(let y=0;y<ih;y++){push(0,y);push(iw-1,y);}for(let qi=0;qi<q.length;qi++){const k=q[qi],x=k%iw,y=(k/iw)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}for(let k=0;k<seen.length;k++)if(seen[k])d[k*4+3]=0;c.putImageData(id,0,0);let l=iw,r=-1,t=ih,b=-1;for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){const a=d[(y*iw+x)*4+3];if(a>12){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}}if(r<l||b<t)return src;const pad=2;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(iw-1,r+pad);b=Math.min(ih-1,b+pad);const w=r-l+1,h=b-t+1,out=document.createElement('canvas');out.width=w;out.height=h;const oc=out.getContext('2d',{willReadFrequently:true});oc.drawImage(src,l,t,w,h,0,0,w,h);try{const oid=oc.getImageData(0,0,w,h),dd=oid.data,visited=new Uint8Array(w*h),parts=[];for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const start=yy*w+xx;if(visited[start]||dd[start*4+3]<=18)continue;const queue=[start],pixels=[];visited[start]=1;while(queue.length){const cur=queue.pop();pixels.push(cur);const cx=cur%w,cy=(cur/w)|0;for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){if(nx<0||ny<0||nx>=w||ny>=h)continue;const nk=ny*w+nx;if(visited[nk]||dd[nk*4+3]<=18)continue;visited[nk]=1;queue.push(nk);}}parts.push({pixels,area:pixels.length});}if(parts.length>1){parts.sort((a,b)=>b.area-a.area);const largest=parts[0].area,keep=new Uint8Array(w*h);parts.forEach((part,i)=>{if(i<4&&part.area>=Math.max(120,largest*.03))part.pixels.forEach(k=>keep[k]=1);});for(let k=0;k<keep.length;k++)if(!keep[k])dd[k*4+3]=0;oc.putImageData(oid,0,0);}}catch(_){;}return out;}
function makeWhiteBacking"""
s = s[:old_trim.start()] + new_trim + s[old_trim.end():]

old_draw = re.search(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw", s, re.S)
if not old_draw:
    raise SystemExit('drawLogo block not found')
new_draw = """function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoTrim||S.logo,back=S.logoBacking,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,nameTop=920,nameGap=52,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+18,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);if(back){const bw=(back.width||1)*sc,bh=(back.height||1)*sc;ctx.save();ctx.globalAlpha=.18;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=68;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.30;ctx.shadowColor='rgba(255,255,255,.98)';ctx.shadowBlur=36;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.62;ctx.filter='blur(2.4px)';ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.shadowColor='rgba(0,10,28,.28)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();}ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}
function draw"""
s = s[:old_draw.start()] + new_draw + s[old_draw.end():]

s = s.replace('A tight white contour backing and soft halo are generated behind the original logo.', 'A fading white contour backing and soft halo are generated behind the original logo.')

p.write_text(s, encoding='utf-8')
