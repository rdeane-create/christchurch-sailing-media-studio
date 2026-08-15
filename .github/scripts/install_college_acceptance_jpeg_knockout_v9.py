from pathlib import Path
import re, sys

p=Path('college-acceptance.js')
text=p.read_text(encoding='utf-8')

text=text.replace("const VERSION='20260815-college-acceptance-v8-original-logo-protected';","const VERSION='20260815-college-acceptance-v9-jpeg-knockout';")
text=text.replace("const S={cards:[],base:null,logo:null,logoTrim:null,logoBacking:null,progress:1,anim:0,renderUrl:null,shoulderY:560};","const S={cards:[],base:null,logo:null,logoDisplay:null,logoBacking:null,progress:1,anim:0,renderUrl:null,shoulderY:560};")

new_block=r'''function prepareLogoDisplay(img){
  const iw=img.naturalWidth||img.width||1,ih=img.naturalHeight||img.height||1;
  const src=document.createElement('canvas');src.width=iw;src.height=ih;
  const c=src.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,iw,ih);
  let id;try{id=c.getImageData(0,0,iw,ih);}catch(_){return src;}
  const d=id.data,seen=new Uint8Array(iw*ih),queue=[];
  const isOutsideWhite=(x,y)=>{const i=(y*iw+x)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3],hi=Math.max(r,g,b),lo=Math.min(r,g,b);return a<16||(r>236&&g>236&&b>236&&(hi-lo)<24);};
  const push=(x,y)=>{if(x<0||y<0||x>=iw||y>=ih)return;const k=y*iw+x;if(seen[k]||!isOutsideWhite(x,y))return;seen[k]=1;queue.push(k);};
  for(let x=0;x<iw;x++){push(x,0);push(x,ih-1);}for(let y=0;y<ih;y++){push(0,y);push(iw-1,y);}
  for(let qi=0;qi<queue.length;qi++){const k=queue[qi],x=k%iw,y=(k/iw)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
  for(let k=0;k<seen.length;k++)if(seen[k])d[k*4+3]=0;
  c.putImageData(id,0,0);

  // Remove only tiny detached edge specks; never filter the body of the logo.
  try{
    const dd=id.data,visited=new Uint8Array(iw*ih),parts=[],opaque=k=>dd[k*4+3]>24;
    for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){
      const start=y*iw+x;if(visited[start]||!opaque(start))continue;
      const stack=[start],pixels=[];visited[start]=1;let minX=x,maxX=x,minY=y,maxY=y;
      while(stack.length){const cur=stack.pop(),cx=cur%iw,cy=(cur/iw)|0;pixels.push(cur);if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
        for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]){if(nx<0||ny<0||nx>=iw||ny>=ih)continue;const nk=ny*iw+nx;if(visited[nk]||!opaque(nk))continue;visited[nk]=1;stack.push(nk);}}
      parts.push({pixels,area:pixels.length,minX,maxX,minY,maxY});
    }
    const total=parts.reduce((s,p)=>s+p.area,0);
    for(const part of parts){const cx=(part.minX+part.maxX)/2,cy=(part.minY+part.maxY)/2;const tiny=part.area<Math.max(18,total*.0007);const peripheral=cx>iw*.92||cy>ih*.88;if(tiny&&peripheral)for(const k of part.pixels)dd[k*4+3]=0;}
    c.putImageData(id,0,0);
  }catch(_){;}

  let l=iw,r=-1,t=ih,b=-1;
  for(let y=0;y<ih;y++)for(let x=0;x<iw;x++)if(d[(y*iw+x)*4+3]>18){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
  if(r<l||b<t)return src;
  const pad=4;l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(iw-1,r+pad);b=Math.min(ih-1,b+pad);
  const w=r-l+1,h=b-t+1,out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').drawImage(src,l,t,w,h,0,0,w,h);return out;
}
function makeWhiteBacking(display,pad=22,spread=14){const iw=display.width||1,ih=display.height||1,c=document.createElement('canvas');c.width=iw+pad*2;c.height=ih+pad*2;const x=c.getContext('2d');const steps=44;for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,dx=Math.cos(a)*spread,dy=Math.sin(a)*spread;x.drawImage(display,pad+dx,pad+dy);}x.drawImage(display,pad,pad);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='source-over';return c;}
function loadLogo(file){if(!file){S.logo=S.logoDisplay=S.logoBacking=null;draw();return;}const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{S.logo=im;S.logoDisplay=prepareLogoDisplay(im);S.logoBacking=makeWhiteBacking(S.logoDisplay);S.progress=1;draw();q('caStatus').textContent='College logo loaded. White file background removed for display; the source logo remains untouched.';setTimeout(()=>URL.revokeObjectURL(u),60000);};im.onerror=()=>{URL.revokeObjectURL(u);q('caStatus').textContent='Could not load that logo file.';};im.src=u;}'''

text,n=re.subn(r"function makeLogoMatte\(img\)\{.*?\nfunction loadLogo\(file\)\{.*?\}\nfunction rounded",new_block+"\nfunction rounded",text,flags=re.S)
if n!=1:
    print('Could not replace v8 logo-prep block',file=sys.stderr);sys.exit(1)

new_draw=r'''function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,back=S.logoBacking,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=62,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);if(back){const backingScale=sc,bw=(back.width||1)*backingScale,bh=(back.height||1)*backingScale;ctx.save();ctx.globalAlpha=.14;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=76;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.26;ctx.shadowColor='rgba(255,255,255,.98)';ctx.shadowBlur=42;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();ctx.save();ctx.globalAlpha=.52;ctx.filter='blur(3.2px)';ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();}ctx.save();ctx.shadowColor='rgba(0,10,28,.30)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}
function draw'''
text,n=re.subn(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw",new_draw,text,flags=re.S)
if n!=1:
    print('Could not replace v8 drawLogo',file=sys.stderr);sys.exit(1)

text=text.replace("The original college logo is drawn exactly as uploaded. Studio builds a separate fading white contour and halo behind it, keeps it clear of the athlete’s face and name, and makes it as large as the safe area allows.","The uploaded college logo remains the untouched source. Studio removes only the outside white file background for display, then builds a separate fading contour and halo behind that display copy. It stays clear of the athlete’s face and name and is made as large as the safe area allows.")
p.write_text(text,encoding='utf-8')
print('updated',p)
