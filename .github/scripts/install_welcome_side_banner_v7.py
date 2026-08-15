from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v18-smooth-directional-edge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v17-orange-bottom-vertical-fade';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

old_feather = """  // Smooth directional feather on ONLY the athlete-side edge. Rather than
  // carving the banner with blurred strokes, extend a controlled orange veil
  // outward from the exact diagonal boundary. This produces an even transition
  // from photo -> orange all the way down the edge with no scalloping or banding.
  lx.save();
  const dx=leftBottom-leftTop;
  const dy=1350-topY;
  const edgeLen=Math.hypot(dx,dy);
  const edgeAngle=Math.atan2(dy,dx)-Math.PI/2;
  lx.translate(leftTop,topY);
  lx.rotate(edgeAngle);
  const featherW=76;
  const edgeFade=lx.createLinearGradient(-featherW,0,4,0);
  edgeFade.addColorStop(0,'rgba(244,81,30,0)');
  edgeFade.addColorStop(.16,'rgba(244,81,30,.035)');
  edgeFade.addColorStop(.34,'rgba(244,81,30,.10)');
  edgeFade.addColorStop(.54,'rgba(244,81,30,.22)');
  edgeFade.addColorStop(.72,'rgba(244,81,30,.42)');
  edgeFade.addColorStop(.87,'rgba(244,81,30,.70)');
  edgeFade.addColorStop(1,'rgba(244,81,30,.96)');
  lx.fillStyle=edgeFade;
  lx.fillRect(-featherW,-8,featherW+5,edgeLen+18);
  lx.restore();"""

baseline_feather = """  lx.save();
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

if old_feather not in block:
    raise RuntimeError('Could not find current v18 directional edge')
block=block.replace(old_feather,baseline_feather,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v17-orange-bottom-vertical-fade" in s
assert "const featherW=76;" not in check
assert "const edgeFade=" not in check
assert "lx.filter='blur(20px)'" in check
assert "lx.filter='blur(34px)'" in check
assert "grad.addColorStop(1,'#e94b1f')" in check
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const rail=" not in check

p.write_text(s)
print('Restored Welcome Aboard v17 baseline')
