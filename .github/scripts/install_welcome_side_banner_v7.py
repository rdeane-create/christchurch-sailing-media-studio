from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v13-photo-fade-wedge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v12-wide-white-fade-wedge';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v14-continuous-photo-fade-wedge';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // One continuous lower-right announcement wedge. The top dissolves into the
  // Athlete Main photo, the orange stays behind the type, and the lower field
  // blends smoothly into navy without breaking the wedge apart.
  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'#ff672d');
  grad.addColorStop(.18,'#f85a24');
  grad.addColorStop(.34,'#f4511e');
  grad.addColorStop(.68,'#f4511e');
  grad.addColorStop(.76,'#ed5021');
  grad.addColorStop(.84,'#d44728');
  grad.addColorStop(.90,'#a13e34');
  grad.addColorStop(.95,'#593744');
  grad.addColorStop(1,'#17304d');

  lx.beginPath();
  lx.moveTo(leftTop,topY);
  lx.lineTo(rightX,topY);
  lx.lineTo(rightX,1350);
  lx.lineTo(leftBottom,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  lx.save();
  lx.beginPath();
  lx.moveTo(leftTop-8,topY);
  lx.lineTo(leftTop+14,topY);
  lx.lineTo(leftBottom+14,1350);
  lx.lineTo(leftBottom-8,1350);
  lx.closePath();
  lx.shadowColor='rgba(2,18,40,.18)';
  lx.shadowBlur=14;
  lx.fillStyle='rgba(2,18,40,.08)';
  lx.fill();
  lx.restore();

  const rail=(offset,width,alpha)=>{
    lx.save();
    lx.beginPath();
    lx.moveTo(leftTop+offset,topY);
    lx.lineTo(leftBottom+offset,1350);
    lx.lineWidth=width;
    lx.strokeStyle=`rgba(255,255,255,${alpha})`;
    lx.stroke();
    lx.restore();
  };
  rail(15,8,.96);
  rail(29,3,.72);

  // Apply one full-height alpha mask. This is the key: the mask becomes fully
  // opaque below the top transition and stays opaque, so the wedge remains one
  // continuous shape instead of leaving a detached orange fragment.
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

assert "20260815-welcome-athlete-main-drive-v14-continuous-photo-fade-wedge" in s
assert "photoFade.addColorStop(.38,'rgba(0,0,0,1)')" in s
assert "photoFade.addColorStop(1,'rgba(0,0,0,1)')" in s
assert "lx.fillRect(0,topY,1080,1350-topY)" in s
assert "ctx.fillText('WELCOME',midX,1004)" in s
assert "ctx.fillText('ABOARD',midX,1094)" in s
assert "rgba(255,255,255,.98)" not in s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "ctx.translate(midX-27,810)" not in s

p.write_text(s)
print('Installed continuous Welcome Aboard photo-fade wedge v14')
