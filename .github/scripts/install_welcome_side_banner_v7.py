from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v19-refined-left-edge-fade';",
    "const VERSION='20260815-welcome-athlete-main-drive-v20-clean-edge-blue-fade';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# SCOPED ITERATION: only (1) remove the visible athlete-side orange seam,
# (2) keep strong orange through the full WELCOME / ABOARD type area, and
# (3) transition smoothly to Christchurch navy below the type.
# Do not change top fade, wedge geometry, type, placement, sizing or animation.
old_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.78,'#f4511e');
  grad.addColorStop(.88,'#f04f1f');
  grad.addColorStop(.95,'#ec4d1f');
  grad.addColorStop(1,'#e94b1f');"""
new_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.78,'#f4511e');
  grad.addColorStop(.82,'#f4511e');
  grad.addColorStop(.86,'#ef5020');
  grad.addColorStop(.90,'#dc4b28');
  grad.addColorStop(.94,'#a44338');
  grad.addColorStop(.97,'#593a49');
  grad.addColorStop(1,'#17304d');"""
if old_bottom not in block:
    raise RuntimeError('Could not find current v19 lower orange treatment')
block=block.replace(old_bottom,new_bottom,1)

old_edge = """  // Refined left-edge fade: use a true perpendicular alpha ramp inside the
  // banner instead of stacked blurred strokes. The exact wedge boundary stays
  // fixed; only the first 72px inside the orange are progressively revealed.
  lx.save();
  lx.globalCompositeOperation='destination-out';
  const edgeDx=leftBottom-leftTop;
  const edgeDy=1350-topY;
  const edgeLen=Math.hypot(edgeDx,edgeDy);
  const inwardX=edgeDy/edgeLen;
  const inwardY=-edgeDx/edgeLen;
  const featherW=72;
  const fade=lx.createLinearGradient(
    leftTop,topY,
    leftTop+inwardX*featherW,topY+inwardY*featherW
  );
  fade.addColorStop(0,'rgba(0,0,0,1)');
  fade.addColorStop(.18,'rgba(0,0,0,.82)');
  fade.addColorStop(.38,'rgba(0,0,0,.56)');
  fade.addColorStop(.60,'rgba(0,0,0,.30)');
  fade.addColorStop(.80,'rgba(0,0,0,.11)');
  fade.addColorStop(1,'rgba(0,0,0,0)');
  lx.fillStyle=fade;
  lx.beginPath();
  lx.moveTo(leftTop,topY-28);
  lx.lineTo(leftBottom,1378);
  lx.lineTo(leftBottom+inwardX*featherW,1378+inwardY*featherW);
  lx.lineTo(leftTop+inwardX*featherW,topY-28+inwardY*featherW);
  lx.closePath();
  lx.fill();
  lx.restore();"""

new_edge = """  // Seam-free left-edge fade. Apply one continuous alpha mask whose soft
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

if old_edge not in block:
    raise RuntimeError('Could not find current v19 left-edge fade')
block=block.replace(old_edge,new_edge,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v20-clean-edge-blue-fade" in s
assert "const featherW=82;" in check
assert "const outside=10;" in check
assert "const edgeMask=lx.createLinearGradient(" in check
assert "lx.globalCompositeOperation='destination-in';" in check
assert "grad.addColorStop(.82,'#f4511e')" in check
assert "grad.addColorStop(1,'#17304d')" in check
# Everything not requested remains exactly positioned as v19.
assert "const topY=600;" in check
assert "const leftTop=840+slide;" in check
assert "const leftBottom=735+slide;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "ctx.fillRect(midX-54,1157,108,4)" in check
assert "const rail=" not in check

p.write_text(s)
print('Installed Welcome Aboard clean left edge and orange-to-blue fade v20')
