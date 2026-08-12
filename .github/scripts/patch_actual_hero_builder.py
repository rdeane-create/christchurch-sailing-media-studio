from pathlib import Path

p=Path('index.html')
t=p.read_text()
original=t

def one(old,new,label):
    global t
    n=t.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {n}')
    t=t.replace(old,new,1)
    print('patched:',label)

# This patch runs against the already-working Hero Builder. It changes only
# locked typography proportions and the header-to-photo blend. Drag/crop/save/
# export behavior is intentionally untouched.

approved_stack='\\"Avenir Next Condensed\\",\\"Helvetica Neue Condensed\\",\\"Arial Narrow\\",sans-serif'

# New Hero master defaults: keep the approved condensed family, restore the
# proportions visible in the accepted Hero Builder reference, and move the
# class/optional copy out of the bottom collision zone.
one(
    "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:66,y:992,w:540,h:64,fontSize:58,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:12,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'},",
    "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:60,y:992,w:560,h:58,fontSize:50,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:11,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'headline'},",
    'Hero first-name locked proportions')

one(
    "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1058,w:650,h:164,fontSize:162,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:2,align:'left',color:'#ffffff',weight:'800',visible:true,locked:true,role:'headline'},",
    "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1050,w:690,h:122,fontSize:116,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:1,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'},",
    'Hero last-name locked proportions')

one(
    "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1248,w:620,h:48,fontSize:48,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:10,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'},",
    "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1198,w:650,h:42,fontSize:38,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:9,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'},",
    'Hero graduation-year locked proportions')

one(
    "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1300,w:840,h:38,fontSize:30,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:5,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'},",
    "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1248,w:840,h:34,fontSize:28,fontFamily:'"+approved_stack+"',fontStyle:'italic',letterSpacing:4,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'},",
    'Hero achievement locked proportions')

# Existing/saved Hero cards must be normalized to the same locked typography.
one(
"""    const lockedType={
      firstName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:58,letterSpacing:12,weight:'700'},
      lastName:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:162,letterSpacing:2,weight:'800'},
      graduationYear:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:48,letterSpacing:10,weight:'700'},
      achievement:{fontFamily:approvedHeroType,fontStyle:'italic',fontSize:30,letterSpacing:5,weight:'600'}
    };""",
"""    const lockedType={
      firstName:{x:60,y:992,w:560,h:58,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:50,letterSpacing:11,weight:'600'},
      lastName:{x:56,y:1050,w:690,h:122,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:116,letterSpacing:1,weight:'700'},
      graduationYear:{x:60,y:1198,w:650,h:42,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:38,letterSpacing:9,weight:'700'},
      achievement:{x:60,y:1248,w:840,h:34,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:28,letterSpacing:4,weight:'600'}
    };""",
    'Existing Hero locked typography normalization')

# Replace the short translucent patch with a longer frosted fade so the gray
# header dissolves into the portrait instead of ending as a horizontal band.
one(
"""      const fadeTop=layer.y+layer.h-18;
      const fade=ctx.createLinearGradient(0,fadeTop,0,fadeTop+132);
      fade.addColorStop(0,'rgba(247,248,249,.96)');
      fade.addColorStop(.28,'rgba(247,248,249,.62)');
      fade.addColorStop(.62,'rgba(247,248,249,.22)');
      fade.addColorStop(1,'rgba(247,248,249,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeTop,layer.w,132);""",
"""      const fadeTop=layer.y+layer.h-26;
      const fadeHeight=170;
      const fade=ctx.createLinearGradient(0,fadeTop,0,fadeTop+fadeHeight);
      fade.addColorStop(0,'rgba(247,248,249,.98)');
      fade.addColorStop(.22,'rgba(247,248,249,.78)');
      fade.addColorStop(.48,'rgba(247,248,249,.46)');
      fade.addColorStop(.72,'rgba(247,248,249,.18)');
      fade.addColorStop(1,'rgba(247,248,249,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeTop,layer.w,fadeHeight);""",
    'Hero header-to-photo frosted fade')

if t==original:
    raise SystemExit('No changes made')
p.write_text(t)

checks=[
    "fontSize:116,fontFamily:'"+approved_stack+"'",
    "graduationYear:{x:60,y:1198,w:650,h:42",
    'const fadeHeight=170;',
    "fade.addColorStop(.72,'rgba(247,248,249,.18)')",
    # Existing working interactions must remain in place.
    'state.heroPhotoDrag={layerId:photo.id',
    "commitDesign('Hero photo position updated.');",
    '*1.14*Math.max(1,t.scale)'
]
missing=[item for item in checks if item not in t]
if missing:
    raise SystemExit('Missing expected post-patch checks: '+repr(missing))
print('PASS: Hero typography proportions and header fade patched; interaction path preserved.')
