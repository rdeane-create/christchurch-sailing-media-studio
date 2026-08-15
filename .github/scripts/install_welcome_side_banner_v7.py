from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v22-simple-orange-feather';",
    "const VERSION='20260815-welcome-athlete-main-drive-v23-fade-after-aboard-a';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# ONE-CHANGE ITERATION ONLY:
# Move the orange/blue feather boundary rightward so the fade begins just past
# the first A in ABOARD and no longer washes over the athlete name/class text.
# Preserve orange-to-bottom, feather style/width, top fade, typography,
# animation and every other approved property exactly as v22.
old_geometry = """  const topY=600;
  // One widened orange panel. The extra width exists only to create a soft
  // outside feather; the entire WELCOME / ABOARD lockup remains on solid orange.
  const leftTop=640+slide;
  const leftBottom=540+slide;
  const rightX=1080+slide;"""
new_geometry = """  const topY=600;
  // Return the orange edge to the approved narrow-side geometry. With the
  // existing 92px feather, full orange begins just past the first A in ABOARD,
  // keeping the athlete name and class line clean.
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;"""
if old_geometry not in block:
    raise RuntimeError('Could not find current v22 widened orange geometry')
block=block.replace(old_geometry,new_geometry,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v23-fade-after-aboard-a" in s
assert "const leftTop=840+slide;" in check
assert "const leftBottom=735+slide;" in check
assert "const featherW=92;" in check
assert "grad.addColorStop(1,'#f4511e')" in check
assert "const textLeftTop=840+slide;" in check
assert "const textLeftBottom=735+slide;" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillRect(midX-54,1157,108,4)" in check
assert "const rail=" not in check

p.write_text(s)
print('Moved Welcome Aboard feather to begin just past A in ABOARD')
