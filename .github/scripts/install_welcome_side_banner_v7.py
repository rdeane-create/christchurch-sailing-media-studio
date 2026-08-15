from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

s=s.replace("const VERSION='20260815-welcome-athlete-main-drive-v7-editorial-side-banner';", "const VERSION='20260815-welcome-athlete-main-drive-v8-editorial-side-banner';", 1)
s=s.replace("const VERSION='20260815-welcome-athlete-main-drive-v6-elegant-editorial';", "const VERSION='20260815-welcome-athlete-main-drive-v8-editorial-side-banner';", 1)

new_overlay = r'''function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const slide=(1-eased)*470;
  const topX=808+slide,bottomX=625+slide,rightX=1080+slide;

  ctx.save();

  const grad=ctx.createLinearGradient(0,0,0,1350);
  grad.addColorStop(0,'#ff4b12');
  grad.addColorStop(.46,'#f4511e');
  grad.addColorStop(.72,'#b92f1a');
  grad.addColorStop(1,'#071b35');

  ctx.beginPath();
  ctx.moveTo(topX,0);
  ctx.lineTo(rightX,0);
  ctx.lineTo(rightX,1350);
  ctx.lineTo(bottomX,1350);
  ctx.closePath();
  ctx.fillStyle=grad;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topX-10,0);
  ctx.lineTo(topX+16,0);
  ctx.lineTo(bottomX+16,1350);
  ctx.lineTo(bottomX-10,1350);
  ctx.closePath();
  ctx.shadowColor='rgba(2,18,40,.28)';
  ctx.shadowBlur=18;
  ctx.fillStyle='rgba(2,18,40,.16)';
  ctx.fill();
  ctx.restore();

  const rail=(offset,width,alpha)=>{
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX+offset,0);
    ctx.lineTo(bottomX+offset,1350);
    ctx.lineWidth=width;
    ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
    ctx.stroke();
    ctx.restore();
  };
  rail(16,9,.98);
  rail(31,3,.78);

  const midX=((topX+bottomX)/2+1080)/2+22;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='#fff';
  ctx.shadowColor='rgba(2,18,40,.20)';
  ctx.shadowBlur=4;
  ctx.shadowOffsetY=2;
  const family='"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",Impact,sans-serif';

  ctx.font=`700 46px ${family}`;
  ctx.fillText('WELCOME',midX,566);
  ctx.font=`900 92px ${family}`;
  ctx.fillText('ABOARD',midX,665);

  ctx.shadowColor='transparent';
  ctx.fillStyle='rgba(255,255,255,.96)';
  ctx.fillRect(midX-54,752,108,5);

  ctx.save();
  ctx.translate(midX-27,810);
  ctx.strokeStyle='rgba(255,255,255,.96)';
  ctx.fillStyle='rgba(255,255,255,.96)';
  ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(10,64);ctx.stroke();
  ctx.beginPath();ctx.moveTo(10,4);ctx.quadraticCurveTo(34,10,55,1);ctx.lineTo(48,31);ctx.quadraticCurveTo(29,37,10,29);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(2,65);ctx.quadraticCurveTo(30,55,61,65);ctx.stroke();
  ctx.restore();

  ctx.restore();
}'''

start=s.index('function drawWelcomeOverlay(ctx,progress=1){')
end=s.index('\nfunction drawWelcomeCard()', start)
s=s[:start]+new_overlay+s[end:]

if 'const finalX=620,finalY=790' in s:
    raise SystemExit('Old floating badge code is still present')
if 'const topX=808+slide,bottomX=625+slide,rightX=1080+slide' not in s:
    raise SystemExit('New side banner code was not installed')

p.write_text(s)
print('Installed Welcome Aboard editorial side banner v8')
