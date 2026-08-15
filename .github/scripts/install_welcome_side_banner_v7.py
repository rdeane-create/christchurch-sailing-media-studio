from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v10-white-top-orange-bottom';",
    "const VERSION='20260815-welcome-athlete-main-drive-v9-faded-side-banner';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v11-lower-right-wedge';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // Lower-right announcement wedge only. It begins at the bottom of the card
  // and stops at the lower edge of the athlete's face, leaving the upper image
  // completely untouched. The left edge stays well right of the name block so
  // longer athlete names have a generous safe area.
  const topY=620;
  const leftTop=900+slide;
  const leftBottom=790+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  // Strong Christchurch orange through the body of the wedge with only a
  // restrained navy blend at the very bottom to marry into the Athlete Main card.
  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'#ff672d');
  grad.addColorStop(.18,'#f85a24');
  grad.addColorStop(.42,'#f4511e');
  grad.addColorStop(.78,'#f4511e');
  grad.addColorStop(.92,'#dc4822');
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
  lx.shadowColor='rgba(2,18,40,.20)';
  lx.shadowBlur=14;
  lx.fillStyle='rgba(2,18,40,.09)';
  lx.fill();
  lx.restore();

  // Double white editorial rails run only along the lower wedge edge.
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

  // Welcome Aboard sits in the same visual band as the athlete name while
  // remaining entirely inside the right-side wedge.
  const textY=955;
  const leftAtText=leftTop+(leftBottom-leftTop)*((textY-topY)/(1350-topY));
  const midX=(leftAtText+1080)/2+8;
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.34)';
  ctx.shadowBlur=7;
  ctx.shadowOffsetY=3;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
  ctx.font=`700 42px ${family}`;
  ctx.fillText('WELCOME',midX,908);
  ctx.font=`900 84px ${family}`;
  ctx.fillText('ABOARD',midX,997);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-50,1060,100,4);
  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

assert "20260815-welcome-athlete-main-drive-v11-lower-right-wedge" in s
assert "const topY=620" in s
assert "const leftTop=900+slide" in s
assert "const leftBottom=790+slide" in s
assert "lx.moveTo(leftTop,topY)" in s
assert "ctx.fillText('WELCOME',midX,908)" in s
assert "ctx.fillText('ABOARD',midX,997)" in s
assert "rgba(255,255,255,.98)" not in s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "ctx.translate(midX-27,810)" not in s

p.write_text(s)
print('Installed Welcome Aboard lower-right wedge v11')
