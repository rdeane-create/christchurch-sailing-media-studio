from pathlib import Path
import re

js = Path('lineup-headshot.js')
text = js.read_text()
old = "  function draw(){const c=q('lhCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);drawPhoto(ctx);if(!S.atlas)return;drawRasterText(ctx,S.first,'small',82,897,58,0,710);drawRasterText(ctx,S.last,'large',48,967,205,0,960);ctx.save();ctx.fillStyle='#f24a18';ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=5;ctx.fillRect(56,1194,575,7);ctx.restore();drawRasterText(ctx,S.classLine,'orange',58,1216,52,13,760)}"
new = """  function draw(){
    const c=q('lhCanvas');if(!c)return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    drawPhoto(ctx);

    // CSMS_LINEUP_HEADSHOT_BLUE_FADE_V2
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

    if(!S.atlas)return;
    drawRasterText(ctx,S.first,'small',82,897,58,0,710);
    drawRasterText(ctx,S.last,'large',48,967,205,0,960);
    ctx.save();ctx.fillStyle='#f24a18';ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=5;ctx.fillRect(56,1194,575,7);ctx.restore();
    drawRasterText(ctx,S.classLine,'orange',58,1216,52,13,760);
  }"""
if old not in text:
    raise SystemExit('Current Lineup Headshot draw function not found')
text = text.replace(old, new, 1)
text = text.replace("const VERSION='20260814-lineup-headshot-v1';", "const VERSION='20260814-lineup-headshot-v2-blue-fade';", 1)
js.write_text(text)

index = Path('index.html')
it = index.read_text()
pat = r'<script src="lineup-headshot\.js\?v=[^"]+"></script>'
replacement = '<script src="lineup-headshot.js?v=20260814-lineup-headshot-v2-blue-fade"></script>'
if re.search(pat, it):
    it = re.sub(pat, replacement, it, count=1)
else:
    if '</body>' not in it:
        raise SystemExit('Missing </body> in index.html')
    it = it.replace('</body>', replacement+'\n</body>', 1)
index.write_text(it)
