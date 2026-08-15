from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace(
    "const VERSION='20260815-welcome-athlete-main-drive-v23-fade-after-aboard-a';",
    "const VERSION='20260815-welcome-athlete-main-drive-v24-fade-left-of-aboard-a';",
    1,
)

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
block=s[start:end]

# ONE-CHANGE ITERATION ONLY:
# The fade must FINISH at the left edge of the first A in ABOARD so the A and
# all following letters sit on fully solid orange. Keep the approved 92px
# feather, orange-to-bottom, top fade, typography, animation and all other
# properties unchanged.
old_geometry = """  const topY=600;
  // Return the orange edge to the approved narrow-side geometry. With the
  // existing 92px feather, full orange begins just past the first A in ABOARD,
  // keeping the athlete name and class line clean.
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;"""
new_geometry = """  const topY=600;
  // Position the 92px feather so it ENDS at the left edge of the first A in
  // ABOARD. The A and the rest of the word therefore sit on fully solid orange,
  // while the transition remains entirely to their left.
  const leftTop=760+slide;
  const leftBottom=655+slide;
  const rightX=1080+slide;"""
if old_geometry not in block:
    raise RuntimeError('Could not find current v23 fade geometry')
block=block.replace(old_geometry,new_geometry,1)

s=s[:start]+block+s[end:]

check=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v24-fade-left-of-aboard-a" in s
assert "const leftTop=760+slide;" in check
assert "const leftBottom=655+slide;" in check
assert "const featherW=92;" in check
assert "grad.addColorStop(1,'#f4511e')" in check
# Text anchors and every other approved element remain unchanged.
assert "const textLeftTop=840+slide;" in check
assert "const textLeftBottom=735+slide;" in check
assert "ctx.fillText('WELCOME',midX,1004)" in check
assert "ctx.fillText('ABOARD',midX,1094)" in check
assert "const topY=600;" in check
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in check
assert "ctx.fillRect(midX-54,1157,108,4)" in check
assert "const rail=" not in check

p.write_text(s)
print('Moved Welcome Aboard feather left so full orange begins at A in ABOARD')
