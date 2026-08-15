from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v12-wide-white-fade-wedge';",
    "const VERSION='20260815-welcome-athlete-main-drive-v11-lower-right-wedge';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v13-photo-fade-wedge';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;

  // Wide lower-right announcement wedge. It protects the athlete-name safe
  // zone while giving WELCOME / ABOARD enough room to sit comfortably.
  const topY=600;
  const leftTop=840+slide;
  const leftBottom=735+slide;
  const rightX=1080+slide;

  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  // Strong Christchurch orange through the body of the wedge, transitioning
  // gradually through warm dark orange into navy at the bottom. The extra
  // intermediate stops keep the orange/navy transition smooth and editorial.
  const grad=lx.createLinearGradient(0,topY,0,1350);
  grad.addColorStop(0,'#ff6a2f');
  grad.addColorStop(.18,'#f85a24');
  grad.addColorStop(.36,'#f4511e');
  grad.addColorStop(.70,'#f4511e');
  grad.addColorStop(.80,'#e94d23');
  grad.addColorStop(.88,'#c5412a');
  grad.addColorStop(.94,'#7a3540');
  grad.addColorStop(1,'#17304d');

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

  // Double white editorial rails follow the wedge edge.
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

  // Fade the top of the entire wedge — orange and rails together — directly
  // into the underlying Athlete Main photo. No white panel is introduced.
  lx.globalCompositeOperation='destination-in';
  const photoFade=lx.createLinearGradient(0,topY,0,790);
  photoFade.addColorStop(0,'rgba(0,0,0,0)');
  photoFade.addColorStop(.24,'rgba(0,0,0,.10)');
  photoFade.addColorStop(.48,'rgba(0,0,0,.34)');
  photoFade.addColorStop(.72,'rgba(0,0,0,.72)');
  photoFade.addColorStop(1,'rgba(0,0,0,1)');
  lx.fillStyle=photoFade;
  lx.fillRect(0,topY,1080,220);
  lx.globalCompositeOperation='source-over';

  ctx.drawImage(layer,0,0);

  // Move the announcement lower so both words sit comfortably inside the
  // strongest orange field instead of crowding the top transition.
  const textY=1045;
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
  ctx.fillText('WELCOME',midX,982);
  ctx.font=`900 78px ${family}`;
  ctx.fillText('ABOARD',midX,1072);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-54,1135,108,4);
  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

assert "20260815-welcome-athlete-main-drive-v13-photo-fade-wedge" in s
assert "const photoFade=lx.createLinearGradient(0,topY,0,790)" in s
assert "photoFade.addColorStop(0,'rgba(0,0,0,0)')" in s
assert "grad.addColorStop(.94,'#7a3540')" in s
assert "ctx.fillText('WELCOME',midX,982)" in s
assert "ctx.fillText('ABOARD',midX,1072)" in s
assert "rgba(255,255,255,.98)" not in s[s.index('function drawWelcomeOverlay'):s.index('function drawWelcomeCard')]
assert "ctx.translate(midX-27,810)" not in s

p.write_text(s)
print('Installed Welcome Aboard photo-fade wedge v13')
