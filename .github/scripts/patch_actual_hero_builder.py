from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()
original=t
approved_stack='\\"Avenir Next Condensed\\",\\"Helvetica Neue Condensed\\",\\"Arial Narrow\\",sans-serif'

def sub_once(pattern,repl,label,flags=0):
    global t
    ms=list(re.finditer(pattern,t,flags))
    if len(ms)!=1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {len(ms)}')
    t=re.sub(pattern,repl,t,count=1,flags=flags)
    print('patched:',label)

# Roll back ONLY the incorrect visual-fidelity commit. Preserve the font stack
# and all working Hero interaction code from the prior known-good state.
layer_specs={
 'firstName': "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:66,y:992,w:540,h:64,fontSize:58,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:12,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'}",
 'lastName': "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1058,w:650,h:164,fontSize:162,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:2,align:'left',color:'#ffffff',weight:'800',visible:true,locked:true,role:'headline'}",
 'graduationYear': "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1248,w:620,h:48,fontSize:48,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:10,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'}",
 'achievement': "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1300,w:840,h:38,fontSize:30,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:5,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'}",
}
for key,base in layer_specs.items():
    pat=r"\{id:cId\('layer'\),type:'text',name:'[^']+',textKey:'"+re.escape(key)+r"'[^\n]*\}(,?)"
    ms=list(re.finditer(pat,t))
    if len(ms)!=1: raise SystemExit(f'Hero {key}: expected 1 match, found {len(ms)}')
    comma=ms[0].group(1)
    t=t[:ms[0].start()]+base+comma+t[ms[0].end():]

locked="""const lockedType={
      firstName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:58,letterSpacing:12,weight:'700'},
      lastName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:162,letterSpacing:2,weight:'800'},
      graduationYear:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:48,letterSpacing:10,weight:'700'},
      achievement:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:30,letterSpacing:5,weight:'600'}
    };"""
sub_once(r"const lockedType=\{[\s\S]*?\n    \};",locked,'restore prior Hero locked typography')

fade_pattern=r"if\(isHeroCardDesign\(\)&&String\(layer\.role\|\|''\)\.toLowerCase\(\)==='header'\)\{[\s\S]*?ctx\.fillRect\(layer\.x,fadeTop,layer\.w,[^\n;]+\);\n    \}"
fade="""if(isHeroCardDesign()&&String(layer.role||'').toLowerCase()==='header'){
      const fadeTop=layer.y+layer.h-18;
      const fade=ctx.createLinearGradient(0,fadeTop,0,fadeTop+132);
      fade.addColorStop(0,'rgba(247,248,249,.96)');
      fade.addColorStop(.28,'rgba(247,248,249,.62)');
      fade.addColorStop(.62,'rgba(247,248,249,.22)');
      fade.addColorStop(1,'rgba(247,248,249,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeTop,layer.w,132);
    }"""
sub_once(fade_pattern,fade,'restore prior Hero header transition')

if t==original: raise SystemExit('No changes made')
p.write_text(t)

checks=[
  "fontSize:162,fontFamily:'"+approved_stack+"'",
  "firstName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:58",
  "ctx.fillRect(layer.x,fadeTop,layer.w,132);",
  'state.heroPhotoDrag={layerId:photo.id',
  "commitDesign('Hero photo position updated.');",
  '*1.14*Math.max(1,t.scale)',
  "sourcePath:'assets/Reference/HERO_FOOTER_OVERLAY_v1.png'"
]
missing=[x for x in checks if x not in t]
if missing: raise SystemExit('Rollback validation failed: '+repr(missing))
print('PASS: incorrect visual-fidelity commit rolled back; working Hero interaction preserved.')
