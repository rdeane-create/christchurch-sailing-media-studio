from pathlib import Path
p=Path('regatta-results-story.js')
s=p.read_text()
s=s.replace("const VERSION='20260815-regatta-results-story-v26-permanent-banner';","const VERSION='20260815-regatta-results-story-v27-gray-to-edges';")
s=s.replace("const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v26';","const TEMPLATE_NAME='REGATTA RESULTS STORY — BUILD v27';")
old="""  // Permanent full-width banner field. Nothing below can alter this layer.\n  ctx.fillStyle=BANNER_BG;\n  ctx.fillRect(0,0,W,SOLID_H);\n  // Approved banner graphic, fixed size and position.\n"""
new="""  // Extend the banner asset's own gray background to both card edges.\n  ctx.imageSmoothingEnabled=true;\n  ctx.imageSmoothingQuality='high';\n  ctx.drawImage(headerImg,SRC_W-12,0,12,SRC_H,0,0,W,SOLID_H);\n  // Approved banner graphic, fixed size and position.\n"""
if old not in s:
    raise SystemExit('Expected v26 banner block not found')
s=s.replace(old,new,1)
s=s.replace('Regatta Results Story — BUILD v20','Regatta Results Story — BUILD v27',1)
p.write_text(s)
