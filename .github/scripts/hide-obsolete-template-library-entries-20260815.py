from pathlib import Path
import hashlib

p=Path('index.html')
s=p.read_text()
old="""    let items=[...byId.values()];
    const hasCreativeHeroMaster=items.some(item=>item.source==='creative_templates_v1'&&item.id==='christchurch_hero_card_template');
"""
new="""    let items=[...byId.values()];
    // Final library visibility filter: hide obsolete historical templates regardless of storage source.
    items=items.filter(item=>{
      const name=String(item?.name||'').trim().toUpperCase();
      const id=String(item?.id||'').trim().toLowerCase();
      if(name.includes('COLLEGE ANNOUNCEMENT'))return false;
      if(name==='CHRISTCHURCH HERO CARD — MASTER V1.0')return false;
      if(id==='template_hero_v1')return false;
      if(id==='christchurch_hero_card_template')return false;
      return true;
    });
    const hasCreativeHeroMaster=items.some(item=>item.source==='creative_templates_v1'&&item.id==='christchurch_hero_card_template');
"""
if old not in s:
    raise SystemExit('Target merged template library block not found')
s=s.replace(old,new,1)
p.write_text(s)

# Locked files must remain byte-identical.
expected={
 'athlete-main-headshot-approved-exact.js':'96fa2713fec463cf5e66469f651d40161472afd0c0fe912bac8a1ada23582edd',
 'college-acceptance.js':'24f2742233db2f724db8f86702cf73b5a8f6ff29aa572b1548b707bb3a43077b',
}
for f,h in expected.items():
    got=hashlib.sha256(Path(f).read_bytes()).hexdigest()
    if got!=h: raise SystemExit(f'LOCKED FILE CHANGED: {f} {got}')
print('Merged library filter installed; locked files unchanged.')
