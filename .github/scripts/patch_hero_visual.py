from pathlib import Path
import re

PATH = Path('index.html')
text = PATH.read_text()
original = text

FONT = '"Avenir Next Condensed","Helvetica Neue Condensed","Arial Narrow",sans-serif'

# 1) Set the locked master geometry and typography for newly created Hero Cards.
replacements = {
    'First Name': "{id:cId('layer'),type:'text',name:'First Name',textKey:'firstName',text:'WYLDER',x:60,y:992,w:560,h:58,fontSize:50,fontFamily:'%s',fontStyle:'italic',letterSpacing:11,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'headline'}" % FONT,
    'Last Name': "{id:cId('layer'),type:'text',name:'Last Name',textKey:'lastName',text:'SMITH',x:56,y:1050,w:690,h:122,fontSize:116,fontFamily:'%s',fontStyle:'italic',letterSpacing:1,align:'left',color:'#ffffff',weight:'700',visible:true,locked:true,role:'headline'}" % FONT,
    'Graduation Year': "{id:cId('layer'),type:'text',name:'Graduation Year',textKey:'graduationYear',text:'CLASS OF 2027',x:60,y:1198,w:650,h:42,fontSize:38,fontFamily:'%s',fontStyle:'italic',letterSpacing:9,align:'left',color:'#f04b1a',weight:'700',visible:true,locked:true,role:'event details'}" % FONT,
    'Achievement': "{id:cId('layer'),type:'text',name:'Achievement',textKey:'achievement',text:'',x:60,y:1248,w:840,h:34,fontSize:28,fontFamily:'%s',fontStyle:'italic',letterSpacing:4,align:'left',color:'#ffffff',weight:'600',visible:true,locked:true,role:'supporting copy'}" % FONT,
}
for name, replacement in replacements.items():
    pattern = re.compile(r"\{id:cId\('layer'\),type:'text',name:'" + re.escape(name) + r"'[^\n}]*\}")
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'Guard failed: Hero layer {name!r} matches={count}.')

# 2) The current Studio already normalizes saved Hero designs in
# enforceHeroCardFooterTreatment(). Replace that one canonical lock block rather
# than adding another styling system.
old_locked = """    const approvedHeroType='\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif';
    const lockedType={
      firstName:{fontFamily:'Arial',fontStyle:'italic',fontSize:58,letterSpacing:12,weight:'700'},
      lastName:{fontFamily:'Arial Narrow',fontStyle:'italic',fontSize:162,letterSpacing:2,weight:'800'},
      graduationYear:{fontFamily:'Arial',fontStyle:'italic',fontSize:48,letterSpacing:10,weight:'700'},
      achievement:{fontFamily:'Arial',fontStyle:'italic',fontSize:30,letterSpacing:5,weight:'600'}
    };
    design.layers.forEach(layer=>{
      const spec=lockedType[String(layer?.textKey||'')];
      if(spec)Object.assign(layer,spec);
    });"""
new_locked = """    const approvedHeroType='\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif';
    const lockedType={
      firstName:{x:60,y:992,w:560,h:58,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:50,letterSpacing:11,weight:'600',align:'left',color:'#ffffff'},
      lastName:{x:56,y:1050,w:690,h:122,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:116,letterSpacing:1,weight:'700',align:'left',color:'#ffffff'},
      graduationYear:{x:60,y:1198,w:650,h:42,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:38,letterSpacing:9,weight:'700',align:'left',color:'#f04b1a'},
      achievement:{x:60,y:1248,w:840,h:34,fontFamily:approvedHeroType,fontStyle:'italic',fontSize:28,letterSpacing:4,weight:'600',align:'left',color:'#ffffff'}
    };
    design.layers.forEach(layer=>{
      const spec=lockedType[String(layer?.textKey||'')];
      if(spec)Object.assign(layer,spec);
    });"""
if old_locked not in text:
    raise SystemExit('Guard failed: current lockedType Hero block not found.')
text = text.replace(old_locked, new_locked, 1)

# 3) Add the subtle frosted transition beneath only the locked Hero header.
ref_start = text.find('function drawReferenceLayer(')
if ref_start < 0:
    raise SystemExit('Guard failed: drawReferenceLayer not found.')
ref_end = text.find('\n  function ', ref_start + 20)
if ref_end < 0:
    raise SystemExit('Guard failed: end of drawReferenceLayer not found.')
ref_segment = text[ref_start:ref_end]
if 'CSMS_HERO_HEADER_FADE' not in ref_segment:
    draw_call = 'ctx.drawImage(img,srcRect.x,srcRect.y,srcRect.w,srcRect.h,layer.x,layer.y,layer.w,layer.h);'
    if draw_call not in ref_segment:
        raise SystemExit('Guard failed: Hero reference draw call not found.')
    fade = """
    /* CSMS_HERO_HEADER_FADE: locked Hero master transition */
    if(String(layer.role||'').toLowerCase()==='header'){
      const fadeStart=layer.y+Math.max(0,layer.h-18);
      const fadeEnd=Math.min(canvas.height,layer.y+layer.h+116);
      const fade=ctx.createLinearGradient(0,fadeStart,0,fadeEnd);
      fade.addColorStop(0,'rgba(248,249,250,0.96)');
      fade.addColorStop(0.28,'rgba(248,249,250,0.68)');
      fade.addColorStop(0.62,'rgba(248,249,250,0.28)');
      fade.addColorStop(1,'rgba(248,249,250,0)');
      ctx.fillStyle=fade;
      ctx.fillRect(layer.x,fadeStart,layer.w,Math.max(1,fadeEnd-fadeStart));
    }"""
    ref_segment = ref_segment.replace(draw_call, draw_call + fade, 1)
    text = text[:ref_start] + ref_segment + text[ref_end:]

required = [
    "HERO_APPROVED_REFERENCE_PATH='assets/Reference/CHRISTCHURCH_HERO_CARD_MASTER_v1_APPROVED.png'",
    "sourcePath:'assets/Reference/HERO_FOOTER_OVERLAY_v1.png'",
    "lastName:{x:56,y:1050,w:690,h:122",
    "fontSize:116",
    "CSMS_HERO_HEADER_FADE",
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit('Validation failed; missing: ' + ', '.join(missing))
if text == original:
    raise SystemExit('No changes produced.')

PATH.write_text(text)
print('PASS: Hero Builder visual master patched directly in index.html')
