from pathlib import Path

p = Path('csms-template-recovery-v1.js')
s = p.read_text()

s = s.replace("const VERSION='20260815-welcome-athlete-main-drive-v3-fit-badge';", "const VERSION='20260815-welcome-athlete-main-drive-v4-native-card';", 1)

old = "function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,e.canvas.width,e.canvas.height);if(welcomeHeroImage){const iw=welcomeHeroImage.naturalWidth||welcomeHeroImage.width||1080,ih=welcomeHeroImage.naturalHeight||welcomeHeroImage.height||1350,scale=Math.min(1080/iw,1350/ih),dw=iw*scale,dh=ih*scale;ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.drawImage(welcomeHeroImage,(1080-dw)/2,(1350-dh)/2,dw,dh);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot card',540,675);}}"
new = "function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,1080,1350);if(welcomeHeroImage){const iw=welcomeHeroImage.naturalWidth||welcomeHeroImage.width,ih=welcomeHeroImage.naturalHeight||welcomeHeroImage.height;if(iw!==1080||ih!==1350){ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='rgba(255,255,255,.92)';ctx.textAlign='center';ctx.font='600 28px Arial,sans-serif';ctx.fillText(`Saved Athlete Main card must be 1080 × 1350 (found ${iw} × ${ih})`,540,675);return;}ctx.drawImage(welcomeHeroImage,0,0);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot card',540,675);}}"

if old not in s:
    raise SystemExit('Expected v3 drawWelcomeCard function not found')
s = s.replace(old, new, 1)

p.write_text(s)
