from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v17-orange-bottom-vertical-fade';",
    "const VERSION='20260815-welcome-athlete-main-drive-v19-refined-left-edge-fade';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# ONE-CHANGE ITERATION: replace only the athlete-side edge feather.
# Preserve top fade, orange color, bottom, wedge geometry, type, placement,
# sizing and animation exactly as the approved v17 baseline.
old_feather = """  lx.save();
  lx.globalCompositeOperation='destination-out';
  lx.filter='blur(20px)';
  lx.beginPath();
  lx.moveTo(leftTop-6,topY+40);
  lx.lineTo(leftBottom-6,1350);
  lx.lineWidth=34;
  lx.lineCap='round';
  lx.strokeStyle='rgba(0,0,0,.50)';
  lx.stroke();
  lx.restore();

  // A second soft pass feathers only the athlete-side edge farther into the
  // photo. It does not change the top fade or extend the orange upward.
  lx.save();
  lx.globalCompositeOperation='destination-out';
  lx.filter='blur(34px)';
  lx.beginPath();
  lx.moveTo(leftTop-13,topY+75);
  lx.lineTo(leftBottom-13,1350);
  lx.lineWidth=20;
  lx.lineCap='round';
  lx.strokeStyle='rgba(0,0,0,.20)';
  lx.stroke();
  lx.restore();"""

new_feather = """  // Refined left-edge fade: use a true perpendicular alpha ramp inside the
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

if old_feather not in block:
    raise RuntimeError('Could not find approved v17 left-edge feather')
block=block.replace(old_feather,new_feather,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v19-refined-left-edge-fade" in s
assert "const featherW=72;" in check
assert "const fade=lx.createLinearGradient(" in check
assert "lx.filter='blur(20px)'" not in check
assert "lx.filter='blur(34px)'" not in check
# Everything else remains the v17 baseline.
assert "grad.addColorStop(1,'#e94b1f')" in check
assert "const topY=600;" in check
assert "const leftTop=840+slide;" in check
assert "const leftBottom=735+slide;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const rail=" not in check

p.write_text(s)
print('Installed Welcome Aboard refined left-edge fade v19')
