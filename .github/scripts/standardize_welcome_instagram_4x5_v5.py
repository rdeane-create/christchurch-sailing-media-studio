from pathlib import Path

p=Path('csms-template-recovery-v1.js')
s=p.read_text()

old="const VERSION='20260815-welcome-athlete-main-drive-v4-native-card';"
new="const VERSION='20260815-welcome-athlete-main-drive-v5-instagram-4x5';\nconst INSTAGRAM_W=1080,INSTAGRAM_H=1350;"
if old not in s:
    raise SystemExit('expected v4 version marker not found')
s=s.replace(old,new,1)

old_css="#workspace-welcome canvas{width:min(100%,540px);height:auto;box-shadow:0 8px 30px rgba(0,0,0,.15);background:#06142c}"
new_css="#workspace-welcome canvas{width:min(100%,540px);height:auto;aspect-ratio:4/5;box-shadow:0 8px 30px rgba(0,0,0,.15);background:#06142c}"
if old_css not in s:
    raise SystemExit('canvas css marker not found')
s=s.replace(old_css,new_css,1)

old_hint="Hero Card master + locked WELCOME ABOARD overlay • 1080 × 1350 • 4:5"
new_hint="Instagram portrait • 1080 × 1350 • 4:5 • Athlete Main composition preserved"
if old_hint not in s:
    raise SystemExit('preview hint marker not found')
s=s.replace(old_hint,new_hint,1)

old_draw="function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,e.canvas.width,e.canvas.height);if(welcomeHeroImage){ctx.drawImage(welcomeHeroImage,0,0);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{ctx.fillStyle='#06142c';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot card',540,675);}}"
new_draw="function drawWelcomeCard(){const e=welcomeEls();if(!e.canvas)return;if(e.canvas.width!==INSTAGRAM_W)e.canvas.width=INSTAGRAM_W;if(e.canvas.height!==INSTAGRAM_H)e.canvas.height=INSTAGRAM_H;const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,INSTAGRAM_W,INSTAGRAM_H);if(welcomeHeroImage){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(welcomeHeroImage,0,0,INSTAGRAM_W,INSTAGRAM_H);drawWelcomeOverlay(ctx,welcomeDropProgress);}else{ctx.fillStyle='#06142c';ctx.fillRect(0,0,INSTAGRAM_W,INSTAGRAM_H);ctx.fillStyle='rgba(255,255,255,.86)';ctx.textAlign='center';ctx.font='600 34px Arial,sans-serif';ctx.fillText('Select an Athlete Main Headshot card',INSTAGRAM_W/2,INSTAGRAM_H/2);}}"
if old_draw not in s:
    raise SystemExit('native drawWelcomeCard marker not found')
s=s.replace(old_draw,new_draw,1)

p.write_text(s)
print('standardized Welcome Aboard to Instagram 1080x1350 4:5 output')
