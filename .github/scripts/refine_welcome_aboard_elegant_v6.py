from pathlib import Path
import re

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

old="const VERSION='20260815-welcome-athlete-main-drive-v5-instagram-4x5';"
new="const VERSION='20260815-welcome-athlete-main-drive-v6-elegant-editorial';"
if old not in s:
    raise SystemExit('expected v5 version marker not found')
s=s.replace(old,new,1)

pattern=r"function drawWelcomeOverlay\(ctx,progress=1\)\{.*?\}\nfunction drawWelcomeCard\(\)"
replacement="""function drawWelcomeOverlay(ctx,progress=1){
  const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3);
  const finalX=620,finalY=790,startX=1160,startY=1280;
  const x=startX+(finalX-startX)*eased,y=startY+(finalY-startY)*eased;
  const angle=(-5*Math.PI/180)+((1-p)*3*Math.PI/180);
  const w=430,h=156;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);

  // restrained floating shadow
  ctx.save();ctx.shadowColor='rgba(2,18,40,.34)';ctx.shadowBlur=22;ctx.shadowOffsetY=12;
  roundedRectPath(ctx,0,0,w,h,10);ctx.fillStyle='rgba(2,18,40,.24)';ctx.fill();ctx.restore();

  // primary orange announcement plate
  roundedRectPath(ctx,0,0,w,h,10);ctx.fillStyle='#f4511e';ctx.fill();
  ctx.lineWidth=2;ctx.strokeStyle='rgba(255,249,240,.92)';ctx.stroke();

  // fine inset keyline
  ctx.save();ctx.translate(9,9);roundedRectPath(ctx,0,0,w-18,h-18,7);
  ctx.lineWidth=1;ctx.strokeStyle='rgba(255,249,240,.42)';ctx.stroke();ctx.restore();

  // subtle editorial rule
  ctx.fillStyle='rgba(255,249,240,.72)';ctx.fillRect(52,44,w-104,1.5);

  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff9f0';
  const family='\"Avenir Next Condensed\",\"Helvetica Neue Condensed\",\"Arial Narrow\",Impact,sans-serif';
  ctx.shadowColor='rgba(2,18,40,.16)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;
  ctx.font=`700 34px ${family}`;ctx.fillText('WELCOME',w/2,29);
  ctx.font=`900 62px ${family}`;ctx.fillText('ABOARD',w/2,99);
  ctx.restore();
}
function drawWelcomeCard()"""

ns,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
if n!=1:
    raise SystemExit(f'expected one Welcome overlay function, found {n}')
s=ns
p.write_text(s)
print('refined Welcome Aboard overlay to elegant editorial v6')
