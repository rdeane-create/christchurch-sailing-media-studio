from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()
original=t

approved_stack='\\"Avenir Next Condensed\\",\\"Helvetica Neue Condensed\\",\\"Arial Narrow\\",sans-serif'

def sub_once(pattern,repl,label,flags=0):
    global t
    matches=list(re.finditer(pattern,t,flags))
    if len(matches)!=1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {len(matches)}')
    t=re.sub(pattern,repl,t,count=1,flags=flags)
    print('patched:',label)

# Patch only the four locked Hero text-layer definitions. Match by textKey so
# prior spacing/property edits do not defeat the guard.
layer_specs={
 'firstName': "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:60,y:992,w:560,h:58,fontSize:50,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:11,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'headline'},",
 'lastName': "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1050,w:690,h:122,fontSize:116,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:1,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'},",
 'graduationYear': "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1198,w:650,h:42,fontSize:38,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:9,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'},",
 'achievement': "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1248,w:840,h:34,fontSize:28,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:4,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'},",
}
for key,repl in layer_specs.items():
    pat=r"\{id:cId\('layer'\),type:'text',name:'[^']+',textKey:'"+re.escape(key)+r"'[^\n]*\},"
    sub_once(pat,repl,f'Hero {key} locked layer')

# Normalize saved Hero cards too. Replace exactly one lockedType object inside
# the Hero lock-policy path, irrespective of the values left by earlier passes.
locked_repl="""const lockedType={
      firstName:{x:60,y:992,w:560,h:58,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:50,letterSpacing:11,weight:'600'},
      lastName:{x:56,y:1050,w:690,h:122,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:116,letterSpacing:1,weight:'700'},
      graduationYear:{x:60,y:1198,w:650,h:42,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:38,letterSpacing:9,weight:'700'},
      achievement:{x:60,y:1248,w:840,h:34,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:28,letterSpacing:4,weight:'600'}
    };"""
sub_once(r"const lockedType=\{[\s\S]*?\n    \};",locked_repl,'Existing Hero locked typography normalization')

# Replace exactly one Hero header gradient block. The role guard keeps this
# scoped to the locked Hero header renderer only.
fade_pattern=r"if\(isHeroCardDesign\(\)&&String\(layer\.role\|\|''\)\.toLowerCase\(\)==='header'\)\{[\s\S]*?ctx\.fillRect\(layer\.x,fadeTop,layer\.w,[^\n;]+\);\n    \}"
fade_repl="""if(isHeroCardDesign()&&String(layer.role||'').toLowerCase()==='header'){
      const fadeTop=layer.y+layer.h-26;
      const fadeHeight=170;
      const fade=ctx.createLinearGradient(0,fadeTop,0,fadeTop+fadeHeight);
      fade.addColorStop(0,'rgba(247,248,249,.98)');
      fade.addColorStop(.22,'rgba(247,248,249,.78)');
      fade.addColorStop(.48,'rgba(247,248,249,.46)');
      fade.addColorStop(.72,'rgba(247,248,249,.18)');
      fade.addColorStop(1,'rgba(247,248,249,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeTop,layer.w,fadeHeight);
    }"""
sub_once(fade_pattern,fade_repl,'Hero header-to-photo frosted fade')

if t==original:
    raise SystemExit('No changes made')
p.write_text(t)

checks=[
    "fontSize:116,fontFamily:'"+approved_stack+"'",
    "graduationYear:{x:60,y:1198,w:650,h:42",
    'const fadeHeight=170;',
    "fade.addColorStop(.72,'rgba(247,248,249,.18)')",
    # Preserve the already-working interaction and crop code.
    'state.heroPhotoDrag={layerId:photo.id',
    "commitDesign('Hero photo position updated.');",
    '*1.14*Math.max(1,t.scale)',
    "sourcePath:'assets/Reference/HERO_FOOTER_OVERLAY_v1.png'"
]
missing=[item for item in checks if item not in t]
if missing:
    raise SystemExit('Missing expected post-patch checks: '+repr(missing))
print('PASS: Hero typography proportions and header fade patched; drag/crop/footer path preserved.')
