from pathlib import Path
p=Path('regatta-results-story.js')
s=p.read_text()
s=s.replace("20260815-regatta-results-story-v24-banner-over-photo","20260815-regatta-results-story-v25-fixed-banner-overlay")
s=s.replace("REGATTA RESULTS STORY — BUILD v24","REGATTA RESULTS STORY — BUILD v25")
s=s.replace("ctx.fillStyle=WHITE;ctx.fillRect(0,0,W,270);ctx.imageSmoothingEnabled=true", "ctx.fillStyle='#eef1f4';ctx.fillRect(0,0,W,270);const bf=ctx.createLinearGradient(0,270,0,352);bf.addColorStop(0,'rgba(238,241,244,1)');bf.addColorStop(.3,'rgba(238,241,244,.94)');bf.addColorStop(.65,'rgba(238,241,244,.55)');bf.addColorStop(1,'rgba(238,241,244,0)');ctx.fillStyle=bf;ctx.fillRect(0,270,W,82);ctx.imageSmoothingEnabled=true")
s=s.replace("const start=coverPhoto?650:760", "const start=coverPhoto?690:760")
p.write_text(s)
