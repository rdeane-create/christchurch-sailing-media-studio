from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v15-rail-free-refined-blend';",
    "const VERSION='20260815-welcome-athlete-main-drive-v16-soft-feathered-edge';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# Remove the narrow dark edge treatment; it reads as a hard divider once the
# white rails are gone.
depth = '''  // A restrained depth cue on the athlete-side edge only; no white border rails.\n  lx.save();\n  lx.beginPath();\n  lx.moveTo(leftTop-5,topY);\n  lx.lineTo(leftTop+9,topY);\n  lx.lineTo(leftBottom+9,1350);\n  lx.lineTo(leftBottom-5,1350);\n  lx.closePath();\n  lx.shadowColor='rgba(2,18,40,.14)';\n  lx.shadowBlur=12;\n  lx.fillStyle='rgba(2,18,40,.045)';\n  lx.fill();\n  lx.restore();\n\n'''
block=block.replace(depth,'',1)

# Feather only the athlete-side diagonal edge. The blurred destination-out
# stroke gently gives the photo back 30-40px across the boundary while the
# banner remains solid behind the type and along the right edge.
needle="  lx.globalCompositeOperation='source-over';\n\n  ctx.drawImage(layer,0,0);"
replacement="""  lx.globalCompositeOperation='source-over';

  // Soft feather on the athlete-side edge so the orange merges into the photo
  // instead of reading as a cut-out panel. Keep the feather narrow enough to
  // preserve the banner width and the WELCOME / ABOARD safe area.
  lx.save();
  lx.globalCompositeOperation='destination-out';
  lx.filter='blur(16px)';
  lx.beginPath();
  lx.moveTo(leftTop-5,topY+40);
  lx.lineTo(leftBottom-5,1350);
  lx.lineWidth=30;
  lx.lineCap='round';
  lx.strokeStyle='rgba(0,0,0,.54)';
  lx.stroke();
  lx.restore();

  // A second, softer pass broadens the blend without creating a visible halo.
  lx.save();
  lx.globalCompositeOperation='destination-out';
  lx.filter='blur(28px)';
  lx.beginPath();
  lx.moveTo(leftTop-11,topY+75);
  lx.lineTo(leftBottom-11,1350);
  lx.lineWidth=18;
  lx.lineCap='round';
  lx.strokeStyle='rgba(0,0,0,.22)';
  lx.stroke();
  lx.restore();

  ctx.drawImage(layer,0,0);"""
if needle not in block:
    raise RuntimeError('Could not find Welcome Aboard edge insertion point')
block=block.replace(needle,replacement,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v16-soft-feathered-edge" in s
assert "lx.filter='blur(16px)'" in check
assert "lx.filter='blur(28px)'" in check
assert "lx.lineWidth=30" in check
assert "A restrained depth cue" not in check
assert "const rail=" not in check
assert "const warmth=lx.createRadialGradient" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check

p.write_text(s)
print('Installed Welcome Aboard soft feathered athlete-side edge v16')
