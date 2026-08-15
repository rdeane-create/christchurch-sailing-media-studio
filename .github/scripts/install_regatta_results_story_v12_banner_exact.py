from pathlib import Path

p=Path('regatta-results-story.js')
s=p.read_text()

assert "20260815-regatta-results-story-v11-top-brand-only" in s
assert "REGATTA RESULTS STORY — BUILD v11" in s

# Version / UI label only.
s=s.replace("20260815-regatta-results-story-v11-top-brand-only","20260815-regatta-results-story-v12-athlete-main-banner-exact")
s=s.replace("REGATTA RESULTS STORY — BUILD v11","REGATTA RESULTS STORY — BUILD v12")
s=s.replace("Regatta Results Story — BUILD v11","Regatta Results Story — BUILD v12")
s=s.replace("Athlete Main exact top brand • v9 results panel restored unchanged","Athlete Main exact banner scale • v9 results panel unchanged")

# Keep the approved v9 lower results geometry absolutely unchanged.
assert "function drawCoverBand(ctx){const leftY=1370,rightY=1185" in s
assert "ctx.bezierCurveTo(300,1360,760,1250,W,rightY)" in s
assert "ctx.bezierCurveTo(300,1346,760,1236,W+8,rightY-14)" in s

# Hard-lock the visible top banner to the same exact 1080x300 crop used by Athlete Main.
old_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainExactStage(ctx);drawCoverBand(ctx);"
new_cover="function drawCover(ctx){ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,H);drawAthleteMainExactStage(ctx);drawAthleteMainBrandHeader(ctx);drawCoverBand(ctx);"
assert old_cover in s
s=s.replace(old_cover,new_cover,1)

# Athlete Main preview is 500px wide. Regatta Results had been 520px, which made the
# same locked artwork appear at a different visual scale in Studio.
old_css=".rrsCanvasWrap canvas{width:min(100%,520px);height:auto;aspect-ratio:9/16;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.16)}"
new_css=".rrsCanvasWrap canvas{width:min(100%,500px);height:auto;aspect-ratio:9/16;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.16)}"
assert old_css in s
s=s.replace(old_css,new_css,1)

p.write_text(s)

assert "20260815-regatta-results-story-v12-athlete-main-banner-exact" in s
assert "REGATTA RESULTS STORY — BUILD v12" in s
assert "drawAthleteMainExactStage(ctx);drawAthleteMainBrandHeader(ctx);drawCoverBand(ctx)" in s
assert ".rrsCanvasWrap canvas{width:min(100%,500px);" in s
# Verify bottom remains exactly at the v9/v11 locked geometry.
assert "function drawCoverBand(ctx){const leftY=1370,rightY=1185" in s
assert "ctx.bezierCurveTo(300,1360,760,1250,W,rightY)" in s
assert "ctx.bezierCurveTo(300,1346,760,1236,W+8,rightY-14)" in s
print('Prepared Regatta Results Story v12: exact Athlete Main banner scale; lower panel unchanged')
