from pathlib import Path

p = Path('college-acceptance.js')
text = p.read_text(encoding='utf-8')

old_version = "const VERSION='20260815-college-acceptance-v14-centered-lightfield';"
new_version = "const VERSION='20260815-college-acceptance-v15-final-lightfield';"
if old_version not in text:
    raise SystemExit('Expected v14 College Acceptance version not found')
text = text.replace(old_version, new_version, 1)

old_inner = "innerW=Math.min(gw-80,Math.ceil(aw+130))"
new_inner = "innerW=Math.min(gw-80,Math.ceil(aw+180))"
if old_inner not in text:
    raise SystemExit('Expected v14 inner light-field width not found')
text = text.replace(old_inner, new_inner, 1)

old_falloff = "ihg.addColorStop(0,'rgba(0,0,0,0)');ihg.addColorStop(.10,'rgba(0,0,0,.65)');ihg.addColorStop(.18,'rgba(0,0,0,1)');ihg.addColorStop(.82,'rgba(0,0,0,1)');ihg.addColorStop(.90,'rgba(0,0,0,.65)');ihg.addColorStop(1,'rgba(0,0,0,0)');"
new_falloff = "ihg.addColorStop(0,'rgba(0,0,0,0)');ihg.addColorStop(.06,'rgba(0,0,0,.28)');ihg.addColorStop(.14,'rgba(0,0,0,.72)');ihg.addColorStop(.22,'rgba(0,0,0,1)');ihg.addColorStop(.78,'rgba(0,0,0,1)');ihg.addColorStop(.86,'rgba(0,0,0,.72)');ihg.addColorStop(.94,'rgba(0,0,0,.28)');ihg.addColorStop(1,'rgba(0,0,0,0)');"
if old_falloff not in text:
    raise SystemExit('Expected v14 horizontal inner falloff not found')
text = text.replace(old_falloff, new_falloff, 1)

p.write_text(text, encoding='utf-8')
print('College Acceptance v15 final light-field refinement applied')
