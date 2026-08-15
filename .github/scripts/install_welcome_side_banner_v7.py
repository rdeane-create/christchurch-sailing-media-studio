from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v21-orange-bottom-wide-blue-edge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v22-simple-orange-feather';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# ONE SCOPED CHANGE:
# Keep one solid orange shape to the bottom, widen it enough that the full
# WELCOME / ABOARD lockup is backed by uninterrupted orange, and feather only
# the outside athlete-side edge so the existing blue/photo shows through.
# No internal blue stripe, no bottom blue gradient, no text/top-fade changes.

old_geometry = """  const topY=600;
  // Widen only the athlete-side treatment. The original text anchor is kept
  // separately below so the typography does not move.
  const leftTop=720+slide;
  const leftBottom=610+slide;
  const orangeCoreLeftTop=820+slide;
  const orangeCoreLeftBottom=700+slide;
  const rightX=1080+slide;"""
new_geometry = """  const topY=600;
  // One widened orange panel. The extra width exists only to create a soft
  // outside feather; the entire WELCOME / ABOARD lockup remains on solid orange.
  const leftTop=640+slide;
  const leftBottom=540+slide;
  const rightX=1080+slide;"""
if old_geometry not in block:
    raise RuntimeError('Could not find current v21 widened geometry')
block=block.replace(old_geometry,new_geometry,1)

old_edge = """  // Professional athlete-side transition: the widened panel begins in
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

new_edge = """  // Simple outside feather only. The orange itself stays a single solid shape;
  // this mask merely lets the existing blue/photo underneath show through at
  // the far athlete-side edge, eliminating the dark channel and hard seam.
  lx.save();
  lx.globalCompositeOperation='destination-out';
  const edgeDx=leftBottom-leftTop;
  const edgeDy=1350-topY;
  const edgeLen=Math.hypot(edgeDx,edgeDy);
  const inwardX=edgeDy/edgeLen;
  const inwardY=-edgeDx/edgeLen;
  const featherW=92;
  const edgeFeather=lx.createLinearGradient(
    leftTop-inwardX*8,topY-inwardY*8,
    leftTop+inwardX*featherW,topY+inwardY*featherW
  );
  edgeFeather.addColorStop(0,'rgba(0,0,0,1)');
  edgeFeather.addColorStop(.10,'rgba(0,0,0,.96)');
  edgeFeather.addColorStop(.24,'rgba(0,0,0,.80)');
  edgeFeather.addColorStop(.42,'rgba(0,0,0,.55)');
  edgeFeather.addColorStop(.62,'rgba(0,0,0,.30)');
  edgeFeather.addColorStop(.82,'rgba(0,0,0,.10)');
  edgeFeather.addColorStop(1,'rgba(0,0,0,0)');
  lx.fillStyle=edgeFeather;
  lx.beginPath();
  lx.moveTo(leftTop-inwardX*10,topY-inwardY*10);
  lx.lineTo(leftBottom-inwardX*10,1350-inwardY*10);
  lx.lineTo(leftBottom+inwardX*featherW,1350+inwardY*featherW);
  lx.lineTo(leftTop+inwardX*featherW,topY+inwardY*featherW);
  lx.closePath();
  lx.fill();
  lx.restore();"""

if old_edge not in block:
    raise RuntimeError('Could not find current v21 blue edge treatment')
block=block.replace(old_edge,new_edge,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v22-simple-orange-feather" in s
assert "const leftTop=640+slide;" in check
assert "const leftBottom=540+slide;" in check
assert "grad.addColorStop(1,'#f4511e')" in check
assert "rgba(23,48,77,.98)" not in check
assert "const edgeBlendW=118;" not in check
assert "const featherW=92;" in check
assert "const textLeftTop=840+slide;" in check
assert "const textLeftBottom=735+slide;" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillRect(midX-54,1157,108,4)" in check
assert "const rail=" not in check

p.write_text(s)
print('Installed Welcome Aboard simple orange feather v22')
