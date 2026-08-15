from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v11-lower-right-wedge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v10-white-top-orange-bottom';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v12-wide-white-fade-wedge';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // Wider lower-right announcement wedge. It still protects the athlete-name
  // safe zone, but gives WELCOME / ABOARD enough room to breathe.
  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  // The wedge appears softly at the lower edge of the face: white at the very
  // top, then a short warm fade into strong Christchurch orange. Orange stays
  // dominant through the body with only a restrained navy blend at the bottom.
  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'rgba(255,255,255,.98)');
  grad.addColorStop(.10,'rgba(255,248,244,.98)');
  grad.addColorStop(.20,'#ffb18e');
  grad.addColorStop(.31,'#ff672d');
  grad.addColorStop(.43,'#f4511e');
  grad.addColorStop(.80,'#f4511e');
  grad.addColorStop(.93,'#df4822');
  grad.addColorStop(1,'#563343');

  lx.beginPath();
  lx.moveTo(leftTop,topY);
  lx.lineTo(rightX,topY);
  lx.lineTo(rightX,1350);
  lx.lineTo(leftBottom,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  // Quiet depth along the diagonal athlete-side edge.
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

  // Double white editorial rails follow only the wedge edge.
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

  ctx.drawImage(layer,0,0);

  // Keep the announcement in the athlete-name band, now with adequate width.
  const textY=955;
  const leftAtText=leftTop+(leftBottom-leftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+6;
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.34)';
  ctx.shadowBlur=7;
  ctx.shadowOffsetY=3;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
  ctx.font=`700 40px ${family}`;
  ctx.fillText('WELCOME',midX,908);
  ctx.font=`900 78px ${family}`;
  ctx.fillText('ABOARD',midX,997);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-54,1060,108,4);
  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

assert "20260815-welcome-athlete-main-drive-v12-wide-white-fade-wedge" in s
assert "const topY=600" in s
assert "const leftTop=840+slide" in s
assert "const leftBottom=735+slide" in s
assert "grad.addColorStop(0,'rgba(255,255,255,.98)')" in s
assert "grad.addColorStop(.43,'#f4511e')" in s
assert "ctx.fillText('WELCOME',midX,908)" in s
assert "ctx.fillText('ABOARD',midX,997)" in s
assert "ctx.translate(midX-27,810)" not in s

p.write_text(s)
print('Installed Welcome Aboard wide white-fade wedge v12')
