from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()
original=t

# The approved text geometry is already back in place and matches the locked
# Wylder master. Do not alter it here. This patch only reconnects the native
# Hero renderer to the exact approved header WebP assembled from the historical
# chunk files and removes the synthetic header fade.

loader=r'''  let __csmsApprovedHeroHeaderPromise=null;
  function loadExactApprovedHeroHeader(){
    if(window.__CSMS_APPROVED_HERO_HEADER_IMAGE&&window.__CSMS_APPROVED_HERO_HEADER_IMAGE.complete){
      return Promise.resolve(window.__CSMS_APPROVED_HERO_HEADER_IMAGE);
    }
    if(__csmsApprovedHeroHeaderPromise)return __csmsApprovedHeroHeaderPromise;
    __csmsApprovedHeroHeaderPromise=(async()=>{
      window.__CSMS_HERO_HEADER_B64='';
      const files=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];
      for(const file of files){
        await new Promise((resolve,reject)=>{
          const s=document.createElement('script');
          s.src=file+'?v=approved-native-20260812';
          s.async=false;
          s.onload=()=>{s.remove();resolve();};
          s.onerror=()=>{s.remove();reject(new Error('Could not load '+file));};
          document.head.appendChild(s);
        });
      }
      const b64=window.__CSMS_HERO_HEADER_B64||'';
      if(!b64)throw new Error('Approved Hero header payload was empty.');
      const img=new Image();
      await new Promise((resolve,reject)=>{
        img.onload=resolve;
        img.onerror=()=>reject(new Error('Approved Hero header image could not be decoded.'));
        img.src='data:image/webp;base64,'+b64;
      });
      window.__CSMS_APPROVED_HERO_HEADER_IMAGE=img;
      window.__CSMS_APPROVED_HERO_HEADER_URI=img.src;
      return img;
    })().catch(err=>{
      __csmsApprovedHeroHeaderPromise=null;
      console.error('[CSMS exact Hero header]',err);
      throw err;
    });
    return __csmsApprovedHeroHeaderPromise;
  }

'''
anchor='  function drawReferenceLayer(layer){\n'
if t.count(anchor)!=1:
    raise SystemExit(f'drawReferenceLayer anchor: expected 1 match, found {t.count(anchor)}')
if 'function loadExactApprovedHeroHeader()' not in t:
    t=t.replace(anchor,loader+anchor,1)

# Special-case only the locked Hero header reference. Draw the approved WebP at
# its natural aspect ratio, preserving its own transparency/fade exactly.
header_draw=r'''  function drawReferenceLayer(layer){
    if(isHeroCardDesign()&&String(layer?.role||'').toLowerCase()==='header'){
      const exact=window.__CSMS_APPROVED_HERO_HEADER_IMAGE;
      if(exact&&exact.complete&&exact.naturalWidth&&exact.naturalHeight){
        ctx.save();
        ctx.globalAlpha=Number.isFinite(layer.opacity)?layer.opacity:1;
        const drawW=1080;
        const drawH=drawW*(exact.naturalHeight/exact.naturalWidth);
        ctx.drawImage(exact,0,0,drawW,drawH);
        ctx.restore();
        return;
      }
      loadExactApprovedHeroHeader().then(()=>{
        if(typeof renderCreativeStudio==='function')renderCreativeStudio();
      }).catch(()=>{});
    }
'''
pat=r"  function drawReferenceLayer\(layer\)\{\n"
if len(list(re.finditer(pat,t)))!=1:
    raise SystemExit('drawReferenceLayer function: expected exactly 1 match')
t=re.sub(pat,header_draw,t,count=1)

# Remove the hand-built synthetic fade. It is not part of the approved asset.
fade_pat=r"\n    if\(isHeroCardDesign\(\)&&String\(layer\.role\|\|''\)\.toLowerCase\(\)==='header'\)\{[\s\S]*?\n    \}(?=\n    ctx\.restore\(\);)"
ms=list(re.finditer(fade_pat,t))
if len(ms)!=1:
    raise SystemExit(f'synthetic Hero fade: expected 1 match, found {len(ms)}')
t=re.sub(fade_pat,'',t,count=1)

if t==original:
    raise SystemExit('No changes made')
p.write_text(t)

checks=[
  "const files=['hero-approved-header-1.js','hero-approved-header-2.js','hero-approved-header-3.js'];",
  "img.src='data:image/webp;base64,'+b64;",
  "const drawH=drawW*(exact.naturalHeight/exact.naturalWidth);",
  'state.heroPhotoDrag={layerId:photo.id',
  "commitDesign('Hero photo position updated.');",
  '*1.14*Math.max(1,t.scale)',
  "sourcePath:'assets/Reference/HERO_FOOTER_OVERLAY_v1.png'",
  "fontSize:162,fontFamily:'\\\"Avenir Next Condensed\\\",\\\"Helvetica Neue Condensed\\\",\\\"Arial Narrow\\\",sans-serif'"
]
missing=[x for x in checks if x not in t]
if missing:
    raise SystemExit('Exact-header validation failed: '+repr(missing))
if "fade.addColorStop(.28,'rgba(247,248,249,.62)')" in t:
    raise SystemExit('Synthetic Hero header fade still present after patch.')
print('PASS: native Hero now uses exact approved header WebP; text geometry and interaction code preserved.')
