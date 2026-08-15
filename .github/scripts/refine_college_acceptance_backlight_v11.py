from pathlib import Path
import re

path = Path('college-acceptance.js')
text = path.read_text(encoding='utf-8')

text = text.replace(
    "const VERSION='20260815-college-acceptance-v10-stray-mark-cleanup';",
    "const VERSION='20260815-college-acceptance-v11-backlit-halo';"
)

new_draw = """function drawLogo(ctx,p=1){if(!S.logo||!S.logoDisplay)return;const t=Math.max(0,Math.min(1,p)),e=1-Math.pow(1-t,3),art=S.logoDisplay,back=S.logoBacking,iw=art.width||1,ih=art.height||1,nameTop=920,nameGap=62,targetBottom=nameTop-nameGap,shoulderTop=Math.max(500,Math.min(690,S.shoulderY||560)),safeTop=shoulderTop+24,availableH=Math.max(100,targetBottom-safeTop),maxArtW=990,sc=Math.min(maxArtW/iw,availableH/ih),aw=iw*sc,ah=ih*sc,finalY=targetBottom-ah/2,startY=90,x=540,y=startY+(finalY-startY)*e;ctx.save();ctx.translate(x,y);if(back){const backingScale=sc,bw=(back.width||1)*backingScale,bh=(back.height||1)*backingScale;
  // Broad outer aura: softer and less visible at the edge.
  ctx.save();ctx.globalAlpha=.08;ctx.shadowColor='rgba(255,255,255,.96)';ctx.shadowBlur=96;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();
  // Mid glow bridges the fade into the brighter backlight.
  ctx.save();ctx.globalAlpha=.16;ctx.shadowColor='rgba(255,255,255,.99)';ctx.shadowBlur=54;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();
  // Bright inner halo creates the backlit pop immediately behind the logo.
  ctx.save();ctx.globalAlpha=.44;ctx.shadowColor='rgba(255,255,255,1)';ctx.shadowBlur=22;ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();
  // Tight luminous support keeps the logo crisp and readable without altering it.
  ctx.save();ctx.globalAlpha=.80;ctx.filter='blur(1.5px)';ctx.drawImage(back,-bw/2,-bh/2,bw,bh);ctx.restore();
}ctx.save();ctx.shadowColor='rgba(0,10,28,.22)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();ctx.drawImage(art,-aw/2,-ah/2,aw,ah);ctx.restore();}"""

text, count = re.subn(r"function drawLogo\(ctx,p=1\)\{.*?\}\nfunction draw\(", new_draw + "\nfunction draw(", text, flags=re.S)
if count != 1:
    raise SystemExit(f'Expected to replace exactly one drawLogo function, replaced {count}')

path.write_text(text, encoding='utf-8')
print('Updated', path)
