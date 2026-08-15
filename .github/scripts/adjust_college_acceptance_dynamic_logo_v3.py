from pathlib import Path

p = Path('college-acceptance.js')
s = p.read_text()

s = s.replace("const VERSION='20260815-college-acceptance-v2-logo-safe-zone';", "const VERSION='20260815-college-acceptance-v3-dynamic-logo-zone';")
s = s.replace("const S={cards:[],base:null,logo:null,logoTrim:null,progress:1,anim:0,renderUrl:null};", "const S={cards:[],base:null,logo:null,logoTrim:null,progress:1,anim:0,renderUrl:null,shoulderY:560};")

old_load = "im.onload=()=>{S.base=im;S.progress=1;draw();setTimeout(()=>URL.revokeObjectURL(url),60000);q('caStatus').textContent='Using the saved Athlete Main Headshot unchanged.';}"
new_load = "im.onload=()=>{S.base=im;S.shoulderY=estimateShoulderY(im);S.progress=1;draw();setTimeout(()=>URL.revokeObjectURL(url),60000);q('caStatus').textContent='Using the saved Athlete Main Headshot unchanged. Logo safe zone adjusted to this athlete.';}"
if old_load not in s:
    raise SystemExit('loadBase target not found')
s = s.replace(old_load, new_load)

marker = "function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}\n"
if marker not in s:
    raise SystemExit('rounded marker not found')

analysis_fn = r'''function estimateShoulderY(img){
  try{
    const sw=270,sh=Math.round(sw*H/W),cv=document.createElement('canvas');cv.width=sw;cv.height=sh;
    const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,sw,sh);
    const data=cx.getImageData(0,0,sw,sh).data;
    const px=(x,y)=>{const i=(y*sw+x)*4;return[data[i],data[i+1],data[i+2]];};
    const dist=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
    const y0=Math.round(400*sh/H),y1=Math.round(760*sh/H);
    let bestY=Math.round(560*sh/H),bestScore=-1;
    for(let y=y0;y<=y1;y++){
      let bg=[0,0,0],n=0;
      for(let x=0;x<Math.round(sw*.16);x++){const c=px(x,y);bg[0]+=c[0];bg[1]+=c[1];bg[2]+=c[2];n++;}
      for(let x=Math.round(sw*.84);x<sw;x++){const c=px(x,y);bg[0]+=c[0];bg[1]+=c[1];bg[2]+=c[2];n++;}
      bg=bg.map(v=>v/Math.max(1,n));
      let run=0,maxRun=0,edges=0,prev=null;
      for(let x=Math.round(sw*.12);x<Math.round(sw*.88);x++){
        const c=px(x,y),fg=dist(c,bg)>75;
        if(fg){run++;if(run>maxRun)maxRun=run;}else run=0;
        if(prev&&dist(c,prev)>80)edges++;
        prev=c;
      }
      const widthScore=maxRun/(sw*.76);
      const edgeScore=Math.min(1,edges/28);
      const center=px(Math.round(sw/2),y);
      const centerScore=Math.min(1,dist(center,bg)/260);
      const score=widthScore*.62+centerScore*.28+edgeScore*.10;
      if(widthScore>.38&&score>bestScore){bestScore=score;bestY=y;}
    }
    const raw=bestY*H/sh;
    return Math.max(500,Math.min(690,Math.round(raw+18)));
  }catch(err){console.warn('College Acceptance shoulder estimate fallback',err);return 560;}
}
'''
s = s.replace(marker, marker + analysis_fn)

old_logo = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const x=540,y=110+(760-110)*e;const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,sc=Math.min(760/iw,180/ih),aw=iw*sc,ah=ih*sc,padX=14,padY=10,bw=aw+padX*2,bh=ah+padY*2;ctx.save();ctx.translate(x,y);ctx.save();ctx.shadowColor='rgba(2,18,40,.28)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;rounded(ctx,-bw/2,-bh/2,bw,bh,4);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
new_logo = "function drawLogo(ctx,p=1){if(!S.logo)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3);const art=S.logoTrim||S.logo,iw=art.width||art.naturalWidth||1,ih=art.height||art.naturalHeight||1,padX=14,padY=10;const targetBottom=887,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeGap=8,availableH=Math.max(90,targetBottom-shoulderTop-safeGap),maxPanelW=930,maxArtW=maxPanelW-padX*2,maxArtH=Math.max(60,availableH-padY*2),sc=Math.min(maxArtW/iw,maxArtH/ih),aw=iw*sc,ah=ih*sc,bw=aw+padX*2,bh=ah+padY*2,finalY=targetBottom-bh/2,startY=95,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);ctx.save();ctx.shadowColor='rgba(2,18,40,.28)';ctx.shadowBlur=9;ctx.shadowOffsetY=4;rounded(ctx,-bw/2,-bh/2,bw,bh,4);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"
if old_logo not in s:
    raise SystemExit('drawLogo target not found')
s = s.replace(old_logo, new_logo)

p.write_text(s)
print('patched College Acceptance dynamic logo zone')
