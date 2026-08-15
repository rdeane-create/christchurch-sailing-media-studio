from pathlib import Path
import re

p = Path('regatta-results-story.js')
s = p.read_text()

s = re.sub(r"const VERSION='[^']+';", "const VERSION='20260815-regatta-results-story-v26-permanent-banner';", s, count=1)
s = re.sub(r"const TEMPLATE_NAME='[^']+';", "const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v26';", s, count=1)

old_pattern = r"function drawFinalHeader\(ctx\)\{.*?\}\nfunction drawFadeBridge"
new_block = """function drawFinalHeader(ctx){
  if(!(headerImg.complete&&headerImg.naturalWidth))return;
  const SRC_W=1023,SRC_H=218;
  const DST_W=1004,DST_H=251,DST_X=(W-DST_W)/2,DST_Y=0;
  const SOLID_H=251,FADE_H=110;
  const BANNER_BG='#eef1f4';
  ctx.save();
  // Permanent full-width banner field. Nothing below can alter this layer.
  ctx.fillStyle=BANNER_BG;
  ctx.fillRect(0,0,W,SOLID_H);
  // Approved banner graphic, fixed size and position.
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(headerImg,0,0,SRC_W,SRC_H,DST_X,DST_Y,DST_W,DST_H);
  // Permanent bottom fade from banner into content beneath it.
  const fade=ctx.createLinearGradient(0,SOLID_H,0,SOLID_H+FADE_H);
  fade.addColorStop(0,'rgba(238,241,244,1)');
  fade.addColorStop(.35,'rgba(238,241,244,.92)');
  fade.addColorStop(.7,'rgba(238,241,244,.45)');
  fade.addColorStop(1,'rgba(238,241,244,0)');
  ctx.fillStyle=fade;
  ctx.fillRect(0,SOLID_H,W,FADE_H);
  ctx.restore();
}
function drawFadeBridge"""

s, n = re.subn(old_pattern, new_block, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace drawFinalHeader')

# Make the visible control-panel build label match the actual loaded build.
s = s.replace('Regatta Results Story — BUILD v20', 'Regatta Results Story — BUILD v26')
s = s.replace('Approved master header fills width • aspect preserved • results panel unchanged', 'Permanent fixed banner • photo moves behind it • results panel unchanged')

# The permanent contract requires the banner to be drawn after photo, shading, and lower panel.
required_order = 'drawAthleteMainExactStage(ctx);drawFadeBridge(ctx);drawCoverBand(ctx);drawFinalHeader(ctx);'
if required_order not in s:
    raise SystemExit('Banner is not last in cover render order')

p.write_text(s)
print('Installed Regatta Results v26 permanent banner contract')
