from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v7-native-header-full-photo-curved-panel" in s
assert "REGATTA RESULTS STORY — BUILD v7" in s

s=s.replace("20260815-regatta-results-story-v7-native-header-full-photo-curved-panel","20260815-regatta-results-story-v8-athlete-main-brand-lock")
s=s.replace("REGATTA RESULTS STORY — BUILD v7","REGATTA RESULTS STORY — BUILD v8")
s=s.replace("Regatta Results Story — BUILD v7","Regatta Results Story — BUILD v8")
s=s.replace("Approved Main header • full middle photo • clean curved full-width results panel","Athlete Main Headshot brand lock • exact logo/banner/fade • full middle photo")

old="function drawApprovedMainHeaderFade(ctx){if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.drawImage(approvedMainOverlay,0,0,1080,1350)}}"
new="function drawAthleteMainBrandOverlay(ctx){if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(approvedMainOverlay,0,0,1080,1350,0,0,1080,1350);ctx.restore()}}\nfunction drawAthleteMainBrandHeader(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,300);if(approvedMainOverlay.complete&&approvedMainOverlay.naturalWidth){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(approvedMainOverlay,0,0,1080,300,0,0,1080,300);ctx.restore()}else if(headerImg.complete&&headerImg.naturalWidth){ctx.drawImage(headerImg,0,0,1080,209)}}"
assert old in s
s=s.replace(old,new)
s=s.replace("drawApprovedMainHeaderFade(ctx)","drawAthleteMainBrandOverlay(ctx)")

start=s.index('function brand(ctx){')
end=s.index('\nfunction footer(ctx,label){',start)
new_brand="function brand(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainBrandHeader(ctx)}"
s=s[:start]+new_brand+s[end:]

p.write_text(s)
assert "20260815-regatta-results-story-v8-athlete-main-brand-lock" in s
assert "REGATTA RESULTS STORY — BUILD v8" in s
assert "function drawAthleteMainBrandOverlay(ctx)" in s
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350,0,0,1080,1350)" in s
assert "function drawAthleteMainBrandHeader(ctx)" in s
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,300,0,0,1080,300)" in s
assert "function brand(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainBrandHeader(ctx)}" in s
assert "drawAthleteMainBrandOverlay(ctx);drawCoverBand(ctx)" in s
print('Prepared Regatta Results Story v8 athlete-main brand lock')
