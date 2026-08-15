from pathlib import Path
import hashlib

p=Path('index.html')
s=p.read_text(encoding='utf-8')

old="""  async function ensureDefaultTemplates(){
    const all=await mediaGetAll();
    if(!all.some(x=>x.type==='template')){
      await mediaPut({id:'template_hero_v1',type:'template',collection:'hero',name:'CHRISTCHURCH HERO CARD — MASTER v1.0',version:1,base:null,created:new Date().toISOString()});
      await mediaPut({id:'template_lineup_v1',type:'template',collection:'lineup',name:'Regatta Lineup v1',version:1,base:null,created:new Date().toISOString()});
    }
  }
"""
new="""  async function ensureDefaultTemplates(){
    const obsoleteTemplateNames=new Set(['COLLEGE ANNOUNCEMENT — MASTER v1.0','CHRISTCHURCH HERO CARD — MASTER v1.0']);
    const all=await mediaGetAll();
    for(const item of all){
      if(item&&item.type==='template'&&obsoleteTemplateNames.has(String(item.name||''))){
        await mediaDelete(item.id);
      }
    }
    const remaining=(await mediaGetAll()).filter(x=>x.type==='template');
    if(!remaining.length){
      await mediaPut({id:'template_lineup_v1',type:'template',collection:'lineup',name:'Regatta Lineup v1',version:1,base:null,created:new Date().toISOString()});
    }
  }
"""
if old not in s:
    raise SystemExit('ensureDefaultTemplates block not found exactly; refusing unsafe patch')
s=s.replace(old,new,1)

old2="const dbTemplates=(await mediaGetAll()).filter(x=>x.type==='template').map(item=>({"
new2="const dbTemplates=(await mediaGetAll()).filter(x=>x.type==='template'&&!['COLLEGE ANNOUNCEMENT — MASTER v1.0','CHRISTCHURCH HERO CARD — MASTER v1.0'].includes(String(x.name||''))).map(item=>({"
if old2 not in s:
    raise SystemExit('dbTemplates filter not found exactly; refusing unsafe patch')
s=s.replace(old2,new2,1)

p.write_text(s,encoding='utf-8')
print('Patched index.html safely')
