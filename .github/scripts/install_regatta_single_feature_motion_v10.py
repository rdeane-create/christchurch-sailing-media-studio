from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()

# 1) Use the real athlete count everywhere in preview/motion (1-12), not a forced minimum of four.
t=t.replace("const count=Math.max(4,athletes.length||4), cfg=motionConfig(), dur=durationFor(count);",
            "const count=Math.max(1,Math.min(12,athletes.length||1)), cfg=motionConfig(), dur=durationFor(count);")
t=t.replace("const count=Math.max(4,athletes.length||4),dur=durationFor(count),start=performance.now();",
            "const count=Math.max(1,Math.min(12,athletes.length||1)),dur=durationFor(count),start=performance.now();")

# 2) Allow render/export for the intended 1-12 card range.
t=t.replace("if(!background||!logo||athletes.length<4||athletes.length>10){\n      status.textContent='Please upload a background, official logo, and 4–10 athlete images.';",
            "if(!background||!logo||athletes.length<1||athletes.length>12){\n      status.textContent='Please upload a background, official logo, and 1–12 athlete images.';")
t=t.replace("Upload a background, logo, and 4–10 athlete images.","Upload a background, logo, and 1–12 athlete images.")

# 3) For a one-card Story/Reel, let the card occupy the full card zone that the 2x2 grid normally owns.
layout_sig='function layout(count){'
ls=t.find(layout_sig)
if ls<0: raise SystemExit('layout(count) not found')
brace=t.find('{',ls); depth=0; le=None
for i in range(brace,len(t)):
    if t[i]=='{': depth+=1
    elif t[i]=='}':
        depth-=1
        if depth==0:
            le=i+1; break
if le is None: raise SystemExit('layout(count) parse failed')
block=t[ls:le]
marker='/* CSMS_SINGLE_CARD_FULL_ZONE_V10 */'
if marker not in block:
    anchor='    return out;'
    if anchor not in block: raise SystemExit('layout return anchor not found')
    insert="""    /* CSMS_SINGLE_CARD_FULL_ZONE_V10 */
    if(count===1 && (activeProfile==='story'||activeProfile==='reel')){
      const zoneTop=Math.max(top,238);
      const zoneBottom=H-bottom;
      const zoneW=W-side*2;
      const zoneH=Math.max(1,zoneBottom-zoneTop);
      const ratio=4/5;
      let cardW=Math.min(zoneW,zoneH*ratio);
      let cardH=cardW/ratio;
      if(cardH>zoneH){cardH=zoneH;cardW=cardH*ratio;}
      out[0]={x:(W-cardW)/2,y:zoneTop,w:cardW,h:cardH};
    }

"""
    block=block.replace(anchor,insert+anchor,1)
    t=t[:ls]+block+t[le:]

# 4) Center every featured moving card inside the actual safe card zone for Story/Reel.
old="""      const portrait=H>W;
      const cardRatio=4/5;
      const titleReserve=(activeProfile==='story'||activeProfile==='reel')?360:
                         activeProfile==='post'?250:
                         activeProfile==='square'?210:110;
      const maxHeroW=(activeProfile==='landscape'?W*.59:W*.94)*(+els.heroScale.value);
      const maxHeroH=(H-titleReserve-40)*(+els.heroScale.value);

      let heroW=Math.min(maxHeroW,maxHeroH*cardRatio);
      let heroH=heroW/cardRatio;
      if(heroH>maxHeroH){
        heroH=maxHeroH;
        heroW=heroH*cardRatio;
      }

      const cx=activeProfile==='landscape'?W*.68:W/2;
      const cy=titleReserve+(H-titleReserve)/2;"""
new="""      const portrait=H>W;
      const cardRatio=4/5;
      const isStoryLike=activeProfile==='story'||activeProfile==='reel';
      const titleReserve=isStoryLike?238:
                         activeProfile==='post'?250:
                         activeProfile==='square'?210:110;
      const heroSafeTop=isStoryLike?238:titleReserve;
      const heroSafeBottom=isStoryLike?(H-Math.max(284,safeZones().bottom*.45)):(H-40);
      const heroSafeH=Math.max(1,heroSafeBottom-heroSafeTop);
      const requestedHeroScale=+els.heroScale.value||1;
      const safeHeroScale=isStoryLike?Math.min(1,requestedHeroScale):requestedHeroScale;
      const maxHeroW=(activeProfile==='landscape'?W*.59:W*.94)*safeHeroScale;
      const maxHeroH=heroSafeH*safeHeroScale;

      let heroW=Math.min(maxHeroW,maxHeroH*cardRatio);
      let heroH=heroW/cardRatio;
      if(heroH>maxHeroH){
        heroH=maxHeroH;
        heroW=heroH*cardRatio;
      }

      const cx=activeProfile==='landscape'?W*.68:W/2;
      const cy=isStoryLike?(heroSafeTop+heroSafeBottom)/2:titleReserve+(H-titleReserve)/2;"""
if old in t:
    t=t.replace(old,new,1)
elif 'const heroSafeTop=isStoryLike?238:titleReserve;' not in t:
    raise SystemExit('featured motion geometry block not found')

# 5) Add marker for validation.
if 'CSMS_FEATURE_MOTION_SAFE_ZONE_V10' not in t:
    t=t.replace("const isStoryLike=activeProfile==='story'||activeProfile==='reel';",
                "const isStoryLike=activeProfile==='story'||activeProfile==='reel';\n      /* CSMS_FEATURE_MOTION_SAFE_ZONE_V10 */",1)

p.write_text(t)
