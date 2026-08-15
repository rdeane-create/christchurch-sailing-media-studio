from pathlib import Path

p = Path('lineup-headshot.js')
s = p.read_text()

old_version = "const VERSION='20260814-lineup-headshot-v3-isolated';"
new_version = "const VERSION='20260814-lineup-headshot-v4-exact-main-fade';"
if old_version not in s:
    raise SystemExit('Expected Lineup Headshot v3 version not found')
s = s.replace(old_version, new_version, 1)

old_assets = "async function ensureAssets(){if(S.ready)return;try{S.atlas=await loadImage(ATLAS_SRC);S.overlay=null;S.ready=true;draw()}catch(err){console.error('Approved template assets failed to load',err)}}"
new_assets = "async function ensureAssets(){if(S.ready)return;try{[S.overlay,S.atlas]=await Promise.all([loadImage(OVERLAY_SRC),loadImage(ATLAS_SRC)]);S.ready=true;draw()}catch(err){console.error('Approved template assets failed to load',err)}}"
if old_assets not in s:
    raise SystemExit('Expected Lineup Headshot ensureAssets block not found')
s = s.replace(old_assets, new_assets, 1)

old_fade = """    // CSMS_LINEUP_HEADSHOT_BLUE_FADE_V2
    // Christchurch navy is solid at the bottom and fades completely by the top of the first name.
    const fadeTop=885;
    const grad=ctx.createLinearGradient(0,H,0,fadeTop);
    grad.addColorStop(0.00,'rgba(3,24,42,0.99)');
    grad.addColorStop(0.18,'rgba(4,29,52,0.97)');
    grad.addColorStop(0.44,'rgba(6,39,72,0.82)');
    grad.addColorStop(0.70,'rgba(8,48,88,0.46)');
    grad.addColorStop(0.88,'rgba(10,55,98,0.16)');
    grad.addColorStop(1.00,'rgba(10,55,98,0.00)');
    ctx.save();ctx.fillStyle=grad;ctx.fillRect(0,fadeTop,W,H-fadeTop);ctx.restore();
"""
new_fade = """    // CSMS_LINEUP_HEADSHOT_EXACT_MAIN_FADE_V4
    // Use the exact approved Main Athlete Headshot overlay pixels for the lower fade.
    // Clip away the upper header/title region so Lineup Headshot remains header-free.
    if(S.overlay){
      const overlayClipTop=320;
      ctx.drawImage(S.overlay,0,overlayClipTop,W,H-overlayClipTop,0,overlayClipTop,W,H-overlayClipTop);
    }
"""
if old_fade not in s:
    raise SystemExit('Expected Lineup Headshot custom fade block not found')
s = s.replace(old_fade, new_fade, 1)

p.write_text(s)
print('Installed exact Main Athlete Headshot lower fade into Lineup Headshot only.')
