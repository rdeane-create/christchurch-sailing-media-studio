from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v20-clean-edge-blue-fade';",
    "const VERSION='20260815-welcome-athlete-main-drive-v21-orange-bottom-wide-blue-edge';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# SCOPED ITERATION ONLY:
# 1) orange remains orange all the way to the bottom,
# 2) extend the panel farther left so the full WELCOME / ABOARD lockup sits on
#    solid orange, and
# 3) blend the widened athlete-side edge smoothly from Christchurch navy into
#    orange with no vertical orange seam.
# Preserve top fade, type, type position, sizing and animation.

old_geometry = """  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;"""
new_geometry = """  const topY=600;
  // Widen only the athlete-side treatment. The original text anchor is kept
  // separately below so the typography does not move.
  const leftTop=720+slide;
  const leftBottom=610+slide;
  const orangeCoreLeftTop=820+slide;
  const orangeCoreLeftBottom=700+slide;
  const rightX=1080+slide;"""
if old_geometry not in block:
    raise RuntimeError('Could not find current v20 wedge geometry')
block=block.replace(old_geometry,new_geometry,1)

old_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.78,'#f4511e');
  grad.addColorStop(.82,'#f4511e');
  grad.addColorStop(.86,'#ef5020');
  grad.addColorStop(.90,'#dc4b28');
  grad.addColorStop(.94,'#a44338');
  grad.addColorStop(.97,'#593a49');
  grad.addColorStop(1,'#17304d');"""
new_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.82,'#f4511e');
  grad.addColorStop(.92,'#f4511e');
  grad.addColorStop(1,'#f4511e');"""
if old_bottom not in block:
    raise RuntimeError('Could not find current v20 orange-to-navy bottom gradient')
block=block.replace(old_bottom,new_bottom,1)

old_edge = """  // Seam-free left-edge fade. Apply one continuous alpha mask whose soft
  // ramp begins slightly OUTSIDE the wedge boundary. Because the geometric edge
  // sits inside the gradient rather than on the mask boundary, there is no
  // one-pixel orange seam; the photo blends smoothly into full orange.
  lx.save();
  lx.globalCompositeOperation='destination-in';
  const edgeDx=leftBottom-leftTop;
  const edgeDy=1350-topY;
  const edgeLen=Math.hypot(edgeDx,edgeDy);
  const inwardX=edgeDy/edgeLen;
  const inwardY=-edgeDx/edgeLen;
  const featherW=82;
  const outside=10;
  const edgeMask=lx.createLinearGradient(
    leftTop-inwardX*outside,topY-inwardY*outside,
    leftTop+inwardX*featherW,topY+inwardY*featherW
  );
  edgeMask.addColorStop(0,'rgba(0,0,0,0)');
  edgeMask.addColorStop(.10,'rgba(0,0,0,0)');
  edgeMask.addColorStop(.24,'rgba(0,0,0,.08)');
  edgeMask.addColorStop(.42,'rgba(0,0,0,.25)');
  edgeMask.addColorStop(.60,'rgba(0,0,0,.50)');
  edgeMask.addColorStop(.76,'rgba(0,0,0,.75)');
  edgeMask.addColorStop(.90,'rgba(0,0,0,.94)');
  edgeMask.addColorStop(1,'rgba(0,0,0,1)');
  lx.fillStyle=edgeMask;
  lx.beginPath();
  lx.moveTo(leftTop-inwardX*14,topY-inwardY*14);
  lx.lineTo(rightX,topY);
  lx.lineTo(rightX,1350);
  lx.lineTo(leftBottom-inwardX*14,1350-inwardY*14);
  lx.closePath();
  lx.fill();
  lx.restore();"""

new_edge = """  // Professional athlete-side transition: the widened panel begins in
  // Christchurch navy and eases into the solid orange core. This color blend
  // occupies only the added left-side width; the full type lockup remains on
  // uninterrupted orange. A short alpha feather on the outside removes any
  // visible vertical seam against the underlying Athlete Main card.
  lx.save();
  lx.globalCompositeOperation='source-atop';
  const edgeDx=leftBottom-leftTop;
  const edgeDy=1350-topY;
  const edgeLen=Math.hypot(edgeDx,edgeDy);
  const inwardX=edgeDy/edgeLen;
  const inwardY=-edgeDx/edgeLen;
  const edgeBlendW=118;
  const edgeBlue=lx.createLinearGradient(
    leftTop,topY,
    leftTop+inwardX*edgeBlendW,topY+inwardY*edgeBlendW
  );
  edgeBlue.addColorStop(0,'rgba(23,48,77,.98)');
  edgeBlue.addColorStop(.14,'rgba(23,48,77,.94)');
  edgeBlue.addColorStop(.34,'rgba(45,52,73,.76)');
  edgeBlue.addColorStop(.54,'rgba(103,60,58,.48)');
  edgeBlue.addColorStop(.72,'rgba(184,70,40,.22)');
  edgeBlue.addColorStop(.88,'rgba(244,81,30,.06)');
  edgeBlue.addColorStop(1,'rgba(244,81,30,0)');
  lx.fillStyle=edgeBlue;
  lx.beginPath();
  lx.moveTo(leftTop,topY-28);
  lx.lineTo(leftBottom,1378);
  lx.lineTo(leftBottom+inwardX*edgeBlendW,1378+inwardY*edgeBlendW);
  lx.lineTo(leftTop+inwardX*edgeBlendW,topY-28+inwardY*edgeBlendW);
  lx.closePath();
  lx.fill();
  lx.restore();

  lx.save();
  lx.globalCompositeOperation='destination-out';
  const edgeFeatherW=30;
  const edgeFeather=lx.createLinearGradient(
    leftTop-inwardX*4,topY-inwardY*4,
    leftTop+inwardX*edgeFeatherW,topY+inwardY*edgeFeatherW
  );
  edgeFeather.addColorStop(0,'rgba(0,0,0,.82)');
  edgeFeather.addColorStop(.18,'rgba(0,0,0,.62)');
  edgeFeather.addColorStop(.42,'rgba(0,0,0,.34)');
  edgeFeather.addColorStop(.70,'rgba(0,0,0,.12)');
  edgeFeather.addColorStop(1,'rgba(0,0,0,0)');
  lx.fillStyle=edgeFeather;
  lx.beginPath();
  lx.moveTo(leftTop-inwardX*6,topY-inwardY*6);
  lx.lineTo(leftBottom-inwardX*6,1350-inwardY*6);
  lx.lineTo(leftBottom+inwardX*edgeFeatherW,1350+inwardY*edgeFeatherW);
  lx.lineTo(leftTop+inwardX*edgeFeatherW,topY+inwardY*edgeFeatherW);
  lx.closePath();
  lx.fill();
  lx.restore();"""

if old_edge not in block:
    raise RuntimeError('Could not find current v20 edge mask')
block=block.replace(old_edge,new_edge,1)

old_text_anchor = """  const textY=1060;
  const leftAtText=leftTop+(leftBottom-leftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+4;"""
new_text_anchor = """  const textY=1060;
  // Preserve the approved v20 typography position exactly while the orange
  // background is extended farther left behind it.
  const textLeftTop=840+slide;
  const textLeftBottom=735+slide;
  const leftAtText=textLeftTop+(textLeftBottom-textLeftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+4;"""
if old_text_anchor not in block:
    raise RuntimeError('Could not find current v20 text anchor')
block=block.replace(old_text_anchor,new_text_anchor,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v21-orange-bottom-wide-blue-edge" in s
# Requested changes.
assert "const leftTop=720+slide;" in check
assert "const leftBottom=610+slide;" in check
assert "const orangeCoreLeftTop=820+slide;" in check
assert "grad.addColorStop(1,'#f4511e')" in check
assert "grad.addColorStop(1,'#17304d')" not in check
assert "const edgeBlendW=118;" in check
assert "rgba(23,48,77,.98)" in check
assert "const edgeFeatherW=30;" in check
# Typography remains exactly where it was in v20.
assert "const textLeftTop=840+slide;" in check
assert "const textLeftBottom=735+slide;" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
# Untouched approved elements.
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillRect(midX-54,1157,108,4)" in check
assert "const rail=" not in check

p.write_text(s)
print('Installed Welcome Aboard orange-bottom wide blue-edge v21')
