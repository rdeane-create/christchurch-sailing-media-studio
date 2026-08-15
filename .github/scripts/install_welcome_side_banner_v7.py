from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v14-continuous-photo-fade-wedge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v13-photo-fade-wedge';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v15-rail-free-refined-blend';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // One continuous lower-right announcement wedge. It dissolves into the photo
  // at the top and preserves a generous athlete-name safe zone on the left.
  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  // A long, polished orange-to-navy transition. Orange remains authoritative
  // behind the type, then moves through warm ember tones before settling into
  // Christchurch navy without a hard horizontal band.
  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'#ff672d');
  grad.addColorStop(.18,'#f85a24');
  grad.addColorStop(.36,'#f4511e');
  grad.addColorStop(.66,'#f4511e');
  grad.addColorStop(.73,'#f05220');
  grad.addColorStop(.79,'#e94f22');
  grad.addColorStop(.84,'#df4b26');
  grad.addColorStop(.89,'#cb462d');
  grad.addColorStop(.93,'#aa4036');
  grad.addColorStop(.96,'#813b40');
  grad.addColorStop(.985,'#4a3749');
  grad.addColorStop(1,'#17304d');

  lx.beginPath();
  lx.moveTo(leftTop,topY);
  lx.lineTo(rightX,topY);
  lx.lineTo(rightX,1350);
  lx.lineTo(leftBottom,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  // Very subtle warm atmospheric lift in the lower orange field. This adds
  // dimension without introducing another graphic edge or visible stripe.
  lx.save();
  lx.globalCompositeOperation='source-atop';
  const warmth=lx.createRadialGradient(1015,1085,20,1015,1085,360);
  warmth.addColorStop(0,'rgba(255,176,118,.14)');
  warmth.addColorStop(.42,'rgba(255,126,74,.07)');
  warmth.addColorStop(1,'rgba(255,126,74,0)');
  lx.fillStyle=warmth;
  lx.fillRect(700,760,380,590);
  lx.restore();

  // A restrained depth cue on the athlete-side edge only; no white border rails.
  lx.save();
  lx.beginPath();
  lx.moveTo(leftTop-5,topY);
  lx.lineTo(leftTop+9,topY);
  lx.lineTo(leftBottom+9,1350);
  lx.lineTo(leftBottom-5,1350);
  lx.closePath();
  lx.shadowColor='rgba(2,18,40,.14)';
  lx.shadowBlur=12;
  lx.fillStyle='rgba(2,18,40,.045)';
  lx.fill();
  lx.restore();

  // One full-height alpha mask makes the top dissolve directly into the Athlete
  // Main photo while keeping the entire lower wedge continuous and opaque.
  lx.globalCompositeOperation='destination-in';
  const photoFade=lx.createLinearGradient(0,topY,0,1350);
  photoFade.addColorStop(0,'rgba(0,0,0,0)');
  photoFade.addColorStop(.08,'rgba(0,0,0,.08)');
  photoFade.addColorStop(.16,'rgba(0,0,0,.24)');
  photoFade.addColorStop(.24,'rgba(0,0,0,.52)');
  photoFade.addColorStop(.32,'rgba(0,0,0,.82)');
  photoFade.addColorStop(.38,'rgba(0,0,0,1)');
  photoFade.addColorStop(1,'rgba(0,0,0,1)');
  lx.fillStyle=photoFade;
  lx.fillRect(0,topY,1080,1350-topY);
  lx.globalCompositeOperation='source-over';

  ctx.drawImage(layer,0,0);

  // Keep both words fully inside the strong-orange middle of the wedge.
  const textY=1060;
  const leftAtText=leftTop+(leftBottom-leftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+4;
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.34)';
  ctx.shadowBlur=7;
  ctx.shadowOffsetY=3;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
  ctx.font=`700 40px ${family}`;
  ctx.fillText('WELCOME',midX,1004);
  ctx.font=`900 78px ${family}`;
  ctx.fillText('ABOARD',midX,1094);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-54,1157,108,4);
  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

block=s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "20260815-welcome-athlete-main-drive-v15-rail-free-refined-blend" in s
assert "const rail=" not in block
assert "rail(15" not in block
assert "rail(29" not in block
assert "grad.addColorStop(.985,'#4a3749')" in block
assert "const warmth=lx.createRadialGradient" in block
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in block
assert "ctx.fillText('WELCOME',midX,1004)" in block
assert "ctx.fillText('ABOARD',midX,1094)" in block

p.write_text(s)
print('Installed Welcome Aboard rail-free refined blend v15')
