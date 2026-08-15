from pathlib import Path

p = Path('csms-template-recovery-v1.js')
s = p.read_text()

s = s.replace("const VERSION='20260815-welcome-athlete-main-drive-v2';", "const VERSION='20260815-welcome-athlete-main-drive-v3-fit-badge';", 1)

old_overlay = "function drawWelcomeOverlay(ctx,progress=1){const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3),finalX=585,finalY=1062,startX=1180,startY=1420,x=startX+(finalX-startX)*eased,y=startY+(finalY-startY)*eased,angle=(-11*Math.PI/180)+((1-p)*5*Math.PI/180);"
new_overlay = "function drawWelcomeOverlay(ctx,progress=1){const p=Math.max(0,Math.min(1,progress)),eased=1-Math.pow(1-p,3),finalX=585,finalY=850,startX=1180,startY=1420,x=startX+(finalX-startX)*eased,y=startY+(finalY-startY)*eased,angle=(-11*Math.PI/180)+((1-p)*5*Math.PI/180);"
if old_overlay not in s:
    raise SystemExit('Expected Welcome overlay position not found')
s = s.replace(old_overlay, new_overlay, 1)

old_draw = "function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,e.canvas.width,e.canvas.height);if(welcomeHeroImage){const iw=welcomeHeroImage.naturalWidth||welcomeHeroImage.width||1080,ih=welcomeHeroImage.naturalHeight||welcomeHeroImage.height||1350,scale=Math.max(1080/iw,1350/ih),dw=iw*scale,dh=ih*scale;ctx.drawImage(welcomeHeroImage,(1080-dw)/2,(1350-dh)/2,dw,dh);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{"
new_draw = "function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,e.canvas.width,e.canvas.height);if(welcomeHeroImage){const iw=welcomeHeroImage.naturalWidth||welcomeHeroImage.width||1080,ih=welcomeHeroImage.naturalHeight||welcomeHeroImage.height||1350,scale=Math.min(1080/iw,1350/ih),dw=iw*scale,dh=ih*scale;ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.drawImage(welcomeHeroImage,(1080-dw)/2,(1350-dh)/2,dw,dh);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{"
if old_draw not in s:
    raise SystemExit('Expected Welcome card draw function not found')
s = s.replace(old_draw, new_draw, 1)

p.write_text(s)
