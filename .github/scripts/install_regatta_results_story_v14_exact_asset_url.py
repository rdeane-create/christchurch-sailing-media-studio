from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v13-native-athlete-main-logo" in s
assert "REGATTA RESULTS STORY — BUILD v13" in s
assert "const leftY=1370,rightY=1185" in s

old="approvedMainOverlay.src='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp';"
new="approvedMainOverlay.src='assets/Reference/ATHLETE_MAIN_HEADSHOT_APPROVED_LOCKED_OVERLAY_v1.webp?v=20260814-drive-saved-cards-20';"
assert old in s
s=s.replace(old,new,1)

s=s.replace("20260815-regatta-results-story-v13-native-athlete-main-logo","20260815-regatta-results-story-v14-exact-athlete-main-asset-url")
s=s.replace("REGATTA RESULTS STORY — BUILD v13","REGATTA RESULTS STORY — BUILD v14")
s=s.replace("Regatta Results Story — BUILD v13","Regatta Results Story — BUILD v14")
s=s.replace("Athlete Main logo rendered once at native proportions • results panel unchanged","Exact Athlete Main asset URL + native single draw • results panel unchanged")

cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawCoverBand(ctx);" in cover
assert "drawAthleteMainBrandHeader(ctx)" not in cover
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
assert "?v=20260814-drive-saved-cards-20" in s
assert "const leftY=1370,rightY=1185" in s

p.write_text(s)
print('Prepared Regatta Results v14 exact Athlete Main asset URL')
# workflow trigger
