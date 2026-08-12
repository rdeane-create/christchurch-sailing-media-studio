from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()
original=t

# Restore the Hero visual contract exactly from the frozen RC master.
# Keep the newer photo upload/drag/crop/save/export mechanics untouched.

# 1) Remove the later custom approved-WebP loader that was not in the frozen RC.
loader_pat=r"\n  let __csmsApprovedHeroHeaderPromise=null;[\s\S]*?(?=\n  function drawReferenceLayer\(layer\)\{)"
ms=list(re.finditer(loader_pat,t))
if len(ms)!=1:
    raise SystemExit(f'WebP loader removal: expected 1 match, found {len(ms)}')
t=re.sub(loader_pat,'',t,count=1)

# 2) Remove the later special-case WebP header branch so the renderer again
#    uses the locked PNG crop stored on the header reference layer.
branch_pat=r"(  function drawReferenceLayer\(layer\)\{\n)    if\(isHeroCardDesign\(\)&&String\(layer\?\.role\|\|''\)\.toLowerCase\(\)==='header'\)\{[\s\S]*?\n    \}\n"
ms=list(re.finditer(branch_pat,t))
if len(ms)!=1:
    raise SystemExit(f'Hero header branch removal: expected 1 match, found {len(ms)}')
t=re.sub(branch_pat,r"\1",t,count=1)

# 3) Restore exact frozen RC Hero text layer values.
layer_specs={
 'firstName': "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:66,y:992,w:540,h:64,fontSize:58,fontFamily:'Arial',fontStyle:'italic',letterSpacing:12,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'}",
 'lastName': "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1058,w:650,h:164,fontSize:162,fontFamily:'Arial Narrow',fontStyle:'italic',letterSpacing:2,align:'left',color:'#ffffff',weight:'800',visible:true,locked:true,role:'headline'}",
 'graduationYear': "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1248,w:620,h:48,fontSize:48,fontFamily:'Arial',fontStyle:'italic',letterSpacing:10,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'}",
 'achievement': "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1300,w:840,h:38,fontSize:30,fontFamily:'Arial',fontStyle:'italic',letterSpacing:5,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'}",
}
for key,repl in layer_specs.items():
    pat=r"\{id:cId\('layer'\),type:'text',name:'[^']+',textKey:'"+re.escape(key)+r"'[^\n]*\}(,?)"
    ms=list(re.finditer(pat,t))
    if len(ms)!=1:
        raise SystemExit(f'Hero {key} layer: expected 1 match, found {len(ms)}')
    comma=ms[0].group(1)
    t=t[:ms[0].start()]+repl+comma+t[ms[0].end():]

# 4) Restore the frozen RC normalization for reopened/saved Hero projects.
locked_repl="""const lockedType={
      firstName:{fontFamily:'Arial',fontStyle:'italic',fontSize:58,letterSpacing:12,weight:'700'},
      lastName:{fontFamily:'Arial Narrow',fontStyle:'italic',fontSize:162,letterSpacing:2,weight:'800'},
      graduationYear:{fontFamily:'Arial',fontStyle:'italic',fontSize:48,letterSpacing:10,weight:'700'},
      achievement:{fontFamily:'Arial',fontStyle:'italic',fontSize:30,letterSpacing:5,weight:'600'}
    };"""
ms=list(re.finditer(r"const lockedType=\{[\s\S]*?\n    \};",t))
if len(ms)!=1:
    raise SystemExit(f'lockedType: expected 1 match, found {len(ms)}')
t=re.sub(r"const lockedType=\{[\s\S]*?\n    \};",locked_repl,t,count=1)

# 5) Enforce the exact frozen header reference values in the lock policy.
#    The frozen master is x=0,y=0,w=1080,h=209 using source crop 1023x218.
header_policy_old=r"headerLayer\.x=0;\s*headerLayer\.y=0;\s*headerLayer\.w=1080;\s*headerLayer\.h=209;\s*headerLayer\.sourcePath=HERO_APPROVED_REFERENCE_PATH;\s*headerLayer\.sourceRect=\{x:0,y:0,w:HERO_REFERENCE_SIZE\.w,h:218\};"
if len(list(re.finditer(header_policy_old,t)))!=1:
    raise SystemExit('Frozen header policy anchor not found exactly once.')

if t==original:
    raise SystemExit('No changes made')
p.write_text(t)

checks=[
  "fontSize:58,fontFamily:'Arial'",
  "fontSize:162,fontFamily:'Arial Narrow'",
  "fontSize:48,fontFamily:'Arial'",
  "firstName:{fontFamily:'Arial',fontStyle:'italic',fontSize:58",
  "lastName:{fontFamily:'Arial Narrow',fontStyle:'italic',fontSize:162",
  "sourcePath:HERO_APPROVED_REFERENCE_PATH,",
  "sourceRect:{x:0,y:0,w:HERO_REFERENCE_SIZE.w,h:218}",
  "sourcePath:'assets/Reference/HERO_FOOTER_OVERLAY_v1.png'",
  'state.heroPhotoDrag={layerId:photo.id',
  "commitDesign('Hero photo position updated.');",
  '*1.14*Math.max(1,t.scale)'
]
missing=[x for x in checks if x not in t]
if missing:
    raise SystemExit('Frozen-master validation failed: '+repr(missing))
if 'loadExactApprovedHeroHeader' in t or '__CSMS_APPROVED_HERO_HEADER_IMAGE' in t:
    raise SystemExit('Later WebP header loader still present.')
print('PASS: frozen RC Hero visuals restored exactly; newer interaction plumbing preserved.')
