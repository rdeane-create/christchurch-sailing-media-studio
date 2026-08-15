from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

for old in [
    "const VERSION='20260815-welcome-athlete-main-drive-v9-faded-side-banner';",
    "const VERSION='20260815-welcome-athlete-main-drive-v8-editorial-side-banner';",
]:
    s=s.replace(old, "const VERSION='20260815-welcome-athlete-main-drive-v10-white-top-orange-bottom';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;
  const topX=808+slide,bottomX=625+slide,rightX=1080+slide;

  // Build the editorial panel on a transparent layer. The upper field fades
  // to white before reaching the athlete's face, while the lower field stays
  // strongly orange with only a restrained navy blend at the very bottom.
  const layer=document.createElement('canvas');
  layer.width=1080;layer.height=1350;
  const lx=layer.getContext('2d');

  const grad=lx.createLinearGradient(0,220,0,1350);
  grad.addColorStop(0,'rgba(255,255,255,.98)');
  grad.addColorStop(.20,'rgba(255,255,255,.96)');
  grad.addColorStop(.34,'rgba(255,247,242,.94)');
  grad.addColorStop(.47,'rgba(255,194,162,.96)');
  grad.addColorStop(.60,'#ff6a2f');
  grad.addColorStop(.73,'#f4511e');
  grad.addColorStop(.89,'#f4511e');
  grad.addColorStop(.96,'#cf401f');
  grad.addColorStop(1,'#17304d');

  lx.beginPath();
  lx.moveTo(topX,0);
  lx.lineTo(rightX,0);
  lx.lineTo(rightX,1350);
  lx.lineTo(bottomX,1350);
  lx.closePath();
  lx.fillStyle=grad;
  lx.fill();

  // Keep the diagonal edge dimensional but quiet so it does not compete
  // with the athlete or the type.
  lx.save();
  lx.beginPath();
  lx.moveTo(topX-8,0);
  lx.lineTo(topX+14,0);
  lx.lineTo(bottomX+14,1350);
  lx.lineTo(bottomX-8,1350);
  lx.closePath();
  lx.shadowColor='rgba(2,18,40,.18)';
  lx.shadowBlur=14;
  lx.fillStyle='rgba(2,18,40,.08)';
  lx.fill();
  lx.restore();

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
  rail(16,8,.96);
  rail(30,3,.72);

  // Soften only the very top edge into the white header/photo area. The panel
  // is already white here, so this creates a natural visual disappearance
  // before the athlete's face rather than a hard orange wall beside it.
  lx.globalCompositeOperation='destination-in';
  const topMask=lx.createLinearGradient(0,180,0,610);
  topMask.addColorStop(0,'rgba(0,0,0,.34)');
  topMask.addColorStop(.30,'rgba(0,0,0,.58)');
  topMask.addColorStop(.66,'rgba(0,0,0,.88)');
  topMask.addColorStop(1,'rgba(0,0,0,1)');
  lx.fillStyle=topMask;
  lx.fillRect(0,0,1080,700);
  lx.globalCompositeOperation='source-over';

  ctx.drawImage(layer,0,0);

  // Keep the announcement aligned with the athlete-name band.
  const leftAtText=topX+(bottomX-topX)*(955/1350);
  const midX=(leftAtText+1080)/2+10;
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

assert "20260815-welcome-athlete-main-drive-v10-white-top-orange-bottom" in s
assert "grad.addColorStop(0,'rgba(255,255,255,.98)')" in s
assert "grad.addColorStop(.89,'#f4511e')" in s
assert "grad.addColorStop(1,'#17304d')" in s
assert "ctx.fillText('WELCOME',midX,908)" in s
assert "ctx.fillText('ABOARD',midX,997)" in s
assert "ctx.translate(midX-27,810)" not in s

p.write_text(s)
print('Installed Welcome Aboard white-top orange-bottom banner v10')
