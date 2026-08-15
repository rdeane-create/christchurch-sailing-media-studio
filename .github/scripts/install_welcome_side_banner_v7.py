from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v8-editorial-side-banner';",
    "const VERSION='20260815-welcome-athlete-main-drive-v7-editorial-side-banner';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v9-faded-side-banner';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;
  const topX=808+slide,bottomX=625+slide,rightX=1080+slide;

  // Draw the banner on its own transparent layer so the orange field can
  // dissolve back into the untouched Athlete Main photo below the face.
  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  const grad=lx.createLinearGradient(0,0,0,1120);
  grad.addColorStop(0,'#ff4b12');
  grad.addColorStop(.52,'#f4511e');
  grad.addColorStop(1,'#c63a1b');

  lx.beginPath();
  lx.moveTo(topX,0);
  lx.lineTo(rightX,0);
  lx.lineTo(rightX,1350);
  lx.lineTo(bottomX,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  // Soft dimensional edge on the athlete side.
  lx.save();
  lx.beginPath();
  lx.moveTo(topX-10,0);
  lx.lineTo(topX+16,0);
  lx.lineTo(bottomX+16,1350);
  lx.lineTo(bottomX-10,1350);
  lx.closePath();
  lx.shadowColor='rgba(2,18,40,.24)';
  lx.shadowBlur=16;
  lx.fillStyle='rgba(2,18,40,.12)';
  lx.fill();
  lx.restore();

  // Double white editorial rails.
  const rail=(offset,width,alpha)=>{
    lx.save();
    lx.beginPath();
    lx.moveTo(topX+offset,0);
    lx.lineTo(bottomX+offset,1350);
    lx.lineWidth=width;
    lx.strokeStyle=`rgba(255,255,255,${alpha})`;
    lx.stroke();
    lx.restore();
  };
  rail(16,9,.98);
  rail(31,3,.78);

  // Fade the banner itself away below the athlete's face so the original
  // photograph returns naturally. Full through ~620px, soft fade to clear.
  lx.globalCompositeOperation='destination-in';
  const mask=lx.createLinearGradient(0,560,0,1165);
  mask.addColorStop(0,'rgba(0,0,0,1)');
  mask.addColorStop(.18,'rgba(0,0,0,1)');
  mask.addColorStop(.52,'rgba(0,0,0,.70)');
  mask.addColorStop(.78,'rgba(0,0,0,.28)');
  mask.addColorStop(1,'rgba(0,0,0,0)');
  lx.fillStyle=mask;
  lx.fillRect(0,0,1080,1350);
  lx.globalCompositeOperation='source-over';

  ctx.drawImage(layer,0,0);

  // Move the announcement down into the same visual band as the athlete name.
  // Text remains crisp while the orange field fades behind it.
  const leftAtText=topX+(bottomX-topX)*(955/1350);
  const midX=(leftAtText+1080)/2+10;
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.42)';
  ctx.shadowBlur=8;
  ctx.shadowOffsetY=3;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';
  ctx.font=`700 42px ${family}`;
  ctx.fillText('WELCOME',midX,908);
  ctx.font=`900 88px ${family}`;
  ctx.fillText('ABOARD',midX,997);
  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.fillRect(midX-52,1060,104,4);
  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

if "ctx.translate(midX-27,810)" in s:
    raise SystemExit('Old flag logo code is still present')
if "ctx.fillText('WELCOME',midX,908)" not in s or "ctx.fillText('ABOARD',midX,997)" not in s:
    raise SystemExit('Welcome Aboard type was not moved down')
if "globalCompositeOperation='destination-in'" not in s:
    raise SystemExit('Banner fade mask was not installed')

p.write_text(s)
print('Installed Welcome Aboard faded side banner v9')
