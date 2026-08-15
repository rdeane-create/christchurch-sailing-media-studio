from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v16-soft-feathered-edge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v17-orange-bottom-vertical-fade';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# SCOPE CONTROL: preserve the current top fade, wedge geometry, type, sizing,
# and animation exactly. Only change the LOWER COLOR treatment and the existing
# ATHLETE-SIDE feather.

old_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.73,'#f05220');
  grad.addColorStop(.79,'#e94f22');
  grad.addColorStop(.84,'#df4b26');
  grad.addColorStop(.89,'#cb462d');
  grad.addColorStop(.93,'#aa4036');
  grad.addColorStop(.96,'#813b40');
  grad.addColorStop(.985,'#4a3749');
  grad.addColorStop(1,'#17304d');"""
new_bottom = """  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.78,'#f4511e');
  grad.addColorStop(.88,'#f04f1f');
  grad.addColorStop(.95,'#ec4d1f');
  grad.addColorStop(1,'#e94b1f');"""
if old_bottom not in block:
    raise RuntimeError('Could not find current lower color transition')
block=block.replace(old_bottom,new_bottom,1)

# Keep the vertical feather only on the athlete-side boundary. Make it a little
# smoother and broader, but do not alter the top alpha fade or banner height.
old_feather = """  lx.save();
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
  lx.restore();"""
new_feather = """  lx.save();
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
    raise RuntimeError('Could not find current vertical feather')
block=block.replace(old_feather,new_feather,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v17-orange-bottom-vertical-fade" in s
# Bottom stays orange; old navy blend is gone.
assert "grad.addColorStop(1,'#e94b1f')" in check
assert "#17304d" not in check
assert "#4a3749" not in check
# Vertical edge feather remains, slightly softer.
assert "lx.filter='blur(20px)'" in check
assert "lx.filter='blur(34px)'" in check
# Preserve all requested untouched elements.
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const rail=" not in check

p.write_text(s)
print('Installed Welcome Aboard orange-bottom vertical-fade v17')
