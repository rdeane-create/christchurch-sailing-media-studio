from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v12-athlete-main-banner-exact" in s
assert "REGATTA RESULTS STORY — BUILD v12" in s

# Preserve exact approved lower panel geometry from v11/v12.
assert "const leftY=1370,rightY=1185" in s
assert "ctx.bezierCurveTo(300,1360,760,1250,W,rightY)" in s

# The cover currently draws the approved overlay once in the full Athlete Main stage,
# then incorrectly redraws the top 300px as a separate cropped banner. Remove only
# that second pass so the logo/crest are rendered exactly once at native proportions.
old = "drawAthleteMainExactStage(ctx);drawAthleteMainBrandHeader(ctx);drawCoverBand(ctx);"
new = "drawAthleteMainExactStage(ctx);drawCoverBand(ctx);"
assert old in s
s=s.replace(old,new,1)

s=s.replace("20260815-regatta-results-story-v12-athlete-main-banner-exact","20260815-regatta-results-story-v13-native-athlete-main-logo")
s=s.replace("REGATTA RESULTS STORY — BUILD v12","REGATTA RESULTS STORY — BUILD v13")
s=s.replace("Regatta Results Story — BUILD v12","Regatta Results Story — BUILD v13")
s=s.replace("Athlete Main exact banner scale • v9 results panel unchanged","Athlete Main logo rendered once at native proportions • results panel unchanged")

p.write_text(s)

assert "20260815-regatta-results-story-v13-native-athlete-main-logo" in s
assert "REGATTA RESULTS STORY — BUILD v13" in s
cover=s[s.index('function drawCover(ctx){'):s.index('\nfunction drawScore(ctx){')]
assert "drawAthleteMainExactStage(ctx);drawCoverBand(ctx);" in cover
assert "drawAthleteMainBrandHeader(ctx)" not in cover
assert "ctx.drawImage(approvedMainOverlay,0,0,1080,1350)" in s
assert "const leftY=1370,rightY=1185" in s
print('Prepared Regatta Results v13 native Athlete Main logo rendering')
# Trigger v13 workflow now that the workflow file exists on main.
