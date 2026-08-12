from pathlib import Path

p=Path('index.html')
t=p.read_text()
original=t

def one(old,new,label):
    global t
    n=t.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {n}')
    t=t.replace(old,new,1)
    print('patched:',label)

# Remove the navy padded preview frame in Hero Builder mode.
one(
    '.heroBuilderCanvasWrap{min-height:760px}',
    '.heroBuilderCanvasWrap{min-height:760px;background:transparent!important;padding:0!important}\n#workspace-creative.hero-builder-mode #creativeCanvas{border-radius:0!important;cursor:grab}',
    'Hero Builder preview frame'
)

# Approved type in new Hero masters.
one("fontSize:58,fontFamily:'Arial',fontStyle:'italic',letterSpacing:12",
    "fontSize:58,fontFamily:'\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif',fontStyle:'italic',letterSpacing:12",
    'Hero first-name font')
one("fontSize:162,fontFamily:'Arial Narrow',fontStyle:'italic',letterSpacing:2",
    "fontSize:162,fontFamily:'\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif',fontStyle:'italic',letterSpacing:2",
    'Hero last-name font')
one("fontSize:48,fontFamily:'Arial',fontStyle:'italic',letterSpacing:10",
    "fontSize:48,fontFamily:'\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif',fontStyle:'italic',letterSpacing:10",
    'Hero graduation-year font')
one("fontSize:30,fontFamily:'Arial',fontStyle:'italic',letterSpacing:5",
    "fontSize:30,fontFamily:'\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif',fontStyle:'italic',letterSpacing:5",
    'Hero achievement font')

# Apply locked typography to already-saved Hero cards too.
anchor="""    footerLayer.opacity=1;
    footerLayer.sourcePath='assets/Reference/HERO_FOOTER_OVERLAY_v1.png';
    footerLayer.sourceRect=null;
  }
"""
replacement="""    footerLayer.opacity=1;
    footerLayer.sourcePath='assets/Reference/HERO_FOOTER_OVERLAY_v1.png';
    footerLayer.sourceRect=null;

    const approvedHeroType='\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif';
    const lockedType={
      firstName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:58,letterSpacing:12,weight:'700'},
      lastName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:162,letterSpacing:2,weight:'800'},
      graduationYear:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:48,letterSpacing:10,weight:'700'},
      achievement:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:30,letterSpacing:5,weight:'600'}
    };
    design.layers.forEach(layer=>{
      const spec=lockedType[String(layer?.textKey||'')];
      if(spec)Object.assign(layer,spec);
    });
  }
"""
one(anchor,replacement,'existing Hero typography enforcement')

# Use real pixel crop offsets with modest overscan so drag is useful at default scale.
old="""    if(heroCoverMode){
      const coverScale=Math.max(layer.w/sourceW,layer.h/sourceH)*Math.max(1,t.scale);
      const drawW=sourceW*coverScale;
      const drawH=sourceH*coverScale;
      const maxShiftX=Math.max(0,(drawW-layer.w)/2);
      const maxShiftY=Math.max(0,(drawH-layer.h)/2);
      const shiftX=(t.cropX/100)*maxShiftX;
      const shiftY=(t.cropY/100)*maxShiftY;
"""
new="""    if(heroCoverMode){
      const coverScale=Math.max(layer.w/sourceW,layer.h/sourceH)*1.14*Math.max(1,t.scale);
      const drawW=sourceW*coverScale;
      const drawH=sourceH*coverScale;
      const maxShiftX=Math.max(0,(drawW-layer.w)/2);
      const maxShiftY=Math.max(0,(drawH-layer.h)/2);
      const shiftX=Math.max(-maxShiftX,Math.min(maxShiftX,t.cropX));
      const shiftY=Math.max(-maxShiftY,Math.min(maxShiftY,t.cropY));
"""
one(old,new,'Hero pixel crop movement and overscan')

# Blend the locked header into the photograph.
old="""    ctx.save();
    ctx.globalAlpha=Number.isFinite(layer.opacity)?layer.opacity:1;
    ctx.drawImage(img,srcRect.x,srcRect.y,srcRect.w,srcRect.h,layer.x,layer.y,layer.w,layer.h);
    ctx.restore();
  }

  function drawLogoLayer(layer){
"""
new="""    ctx.save();
    ctx.globalAlpha=Number.isFinite(layer.opacity)?layer.opacity:1;
    ctx.drawImage(img,srcRect.x,srcRect.y,srcRect.w,srcRect.h,layer.x,layer.y,layer.w,layer.h);
    if(isHeroCardDesign()&&String(layer.role||'').toLowerCase()==='header'){
      const fadeTop=layer.y+layer.h-18;
      const fade=ctx.createLinearGradient(0,fadeTop,0,fadeTop+132);
      fade.addColorStop(0,'rgba(247,248,249,.96)');
      fade.addColorStop(.28,'rgba(247,248,249,.62)');
      fade.addColorStop(.62,'rgba(247,248,249,.22)');
      fade.addColorStop(1,'rgba(247,248,249,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeTop,layer.w,132);
    }
    ctx.restore();
  }

  function drawLogoLayer(layer){
"""
one(old,new,'Hero header gradient transition')

# Restore direct drag in Hero Builder. Hero mode previously returned without starting a drag.
old="""  canvas.addEventListener('pointerdown',event=>{
    const point=toCanvasPoint(event);
    const layer=selectedLayer();
    const heroMode=isHeroCardDesign();
    const handle=layer&&!layer.locked?handleAtPoint(layer,point.x,point.y):null;
"""
new="""  canvas.addEventListener('pointerdown',event=>{
    const point=toCanvasPoint(event);
    const layer=selectedLayer();
    const heroMode=isHeroCardDesign();
    if(heroMode){
      const photo=heroEditablePhotoLayer();
      if(photo&&point.x>=photo.x&&point.x<=photo.x+photo.w&&point.y>=photo.y&&point.y<=photo.y+photo.h){
        pushUndo();
        const transform=normalizePhotoTransform(photo.transform);
        state.selectedLayerId=photo.id;
        state.heroPhotoDrag={layerId:photo.id,origin:point,startX:transform.cropX,startY:transform.cropY};
        state.heroFaceOverlayActive=true;
        canvas.style.cursor='grabbing';
        canvas.setPointerCapture(event.pointerId);
        renderCreativeStudio();
        return;
      }
    }
    const handle=layer&&!layer.locked?handleAtPoint(layer,point.x,point.y):null;
"""
one(old,new,'Hero direct drag pointerdown')

old="""  canvas.addEventListener('pointermove',event=>{if(state.drag)updateDragMove(toCanvasPoint(event));});
  canvas.addEventListener('pointerup',event=>{
    if(!state.drag)return;
    canvas.releasePointerCapture(event.pointerId);
    state.drag=null;
    commitDesign('Layer updated.');
  });
"""
new="""  canvas.addEventListener('pointermove',event=>{
    if(state.heroPhotoDrag){
      const point=toCanvasPoint(event);
      const design=activeDesign();
      const drag=state.heroPhotoDrag;
      const photo=design?.layers?.find(item=>item.id===drag.layerId);
      if(photo){
        photo.transform=normalizePhotoTransform({...photo.transform,cropX:drag.startX+(point.x-drag.origin.x),cropY:drag.startY+(point.y-drag.origin.y)});
        renderCreativeStudio();
      }
      return;
    }
    if(state.drag)updateDragMove(toCanvasPoint(event));
  });
  canvas.addEventListener('pointerup',event=>{
    if(state.heroPhotoDrag){
      if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
      state.heroPhotoDrag=null;
      state.heroFaceOverlayActive=false;
      canvas.style.cursor='grab';
      commitDesign('Hero photo position updated.');
      return;
    }
    if(!state.drag)return;
    canvas.releasePointerCapture(event.pointerId);
    state.drag=null;
    commitDesign('Layer updated.');
  });
"""
one(old,new,'Hero direct drag pointermove/up')

if t==original:
    raise SystemExit('No changes made')
p.write_text(t)

checks=[
    'heroBuilderCanvasWrap{min-height:760px;background:transparent!important;padding:0!important}',
    "const approvedHeroType='\\\"Avenir Next Condensed\\\"",
    '*1.14*Math.max(1,t.scale)',
    'const shiftX=Math.max(-maxShiftX,Math.min(maxShiftX,t.cropX));',
    "String(layer.role||'').toLowerCase()==='header'",
    'state.heroPhotoDrag={layerId:photo.id',
    "commitDesign('Hero photo position updated.');"
]
missing=[item for item in checks if item not in t]
if missing:
    raise SystemExit('Missing expected patches: '+repr(missing))
print('PASS: actual Hero Builder patched and validated.')
