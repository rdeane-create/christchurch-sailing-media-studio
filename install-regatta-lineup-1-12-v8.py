from pathlib import Path
import re

# --- Studio UI: put Location immediately under Event name ---
js_path = Path('regatta-lineup-layout-v2.js')
js = js_path.read_text()

js = js.replace("const VERSION='20260814-regatta-lineup-layout-v7';", "const VERSION='20260814-regatta-lineup-layout-v8';")
js = js.replace("if(q('csmsRegattaLayoutStylesV7'))return;", "if(q('csmsRegattaLayoutStylesV8'))return;")
js = js.replace(
    "['csmsRegattaLayoutStylesV6','csmsRegattaLayoutStylesV5','csmsRegattaLayoutStylesV4','csmsRegattaLayoutStylesV3','csmsRegattaLayoutStyles']",
    "['csmsRegattaLayoutStylesV7','csmsRegattaLayoutStylesV6','csmsRegattaLayoutStylesV5','csmsRegattaLayoutStylesV4','csmsRegattaLayoutStylesV3','csmsRegattaLayoutStyles']"
)
js = js.replace("s.id='csmsRegattaLayoutStylesV7';", "s.id='csmsRegattaLayoutStylesV8';")

old_find = """    if(/^(regatta lineup|regatta|location)(\\b|$)/.test(label)||/^(regatta lineup|regatta|location)(\\b|$)/.test(full))out.push(c);"""
new_find = """    if(/^(regatta lineup|regatta)(\\b|$)/.test(label)||/^(regatta lineup|regatta)(\\b|$)/.test(full))out.push(c);"""
if old_find in js:
    js = js.replace(old_find, new_find, 1)
elif new_find not in js:
    raise SystemExit('Could not remove Location from legacy Regatta Details collector')

location_helper = """
function placeEventLocation(){
  const event=q('eventName'),location=q('location');
  const eventControl=event?.closest('.control')||event?.parentElement;
  const locationControl=location?.closest('.control')||location?.parentElement;
  if(!eventControl||!locationControl||eventControl===locationControl)return;
  if(eventControl.nextElementSibling!==locationControl){
    eventControl.insertAdjacentElement('afterend',locationControl);
  }
}
"""
if 'function placeEventLocation(){' not in js:
    marker='function moveRegattaDetails(){'
    if marker not in js:
        raise SystemExit('Could not locate Regatta Details helper')
    js=js.replace(marker, location_helper+marker, 1)

old_refresh="function refresh(){addStyles();ensureTitle();wireNativeAthleteSelect();moveRegattaDetails();movePreviewActions();}"
new_refresh="function refresh(){addStyles();ensureTitle();wireNativeAthleteSelect();placeEventLocation();moveRegattaDetails();movePreviewActions();}"
if old_refresh in js:
    js=js.replace(old_refresh,new_refresh,1)
elif new_refresh not in js:
    raise SystemExit('Could not wire Event Location placement')

# Enforce the 12-card maximum when adding saved Drive cards.
old_add="""    if(!selectedCardIds.includes(id))selectedCardIds.push(id);
    const dt=new DataTransfer();"""
new_add="""    if(!selectedCardIds.includes(id)){
      if(selectedCardIds.length>=12){
        if(hint)hint.textContent='Maximum 12 athlete cards per lineup.';
        return;
      }
      selectedCardIds.push(id);
    }
    const dt=new DataTransfer();"""
if old_add in js:
    js=js.replace(old_add,new_add,1)
elif "Maximum 12 athlete cards per lineup." not in js:
    raise SystemExit('Could not install 12-card Drive cap')

js_path.write_text(js)

# --- Native video renderer: explicit 1–12 grid ---
p=Path('index.html')
t=p.read_text()

signature='function layout(count){'
start=t.find(signature)
if start < 0:
    raise SystemExit('Could not locate native layout(count) function')

# Find the matching closing brace for this function.
brace=t.find('{',start)
depth=0
end=None
for i in range(brace,len(t)):
    ch=t[i]
    if ch=='{': depth+=1
    elif ch=='}':
        depth-=1
        if depth==0:
            end=i+1
            break
if end is None:
    raise SystemExit('Could not parse native layout(count) function')

block=t[start:end]

# Clamp the renderer itself, so preview and exported video share the same 1–12 rule.
clamp="count=Math.max(1,Math.min(12,Number(count)||1));"
if clamp not in block:
    block=block.replace(signature, signature+'\n    '+clamp,1)

# Replace the native column/row selection while preserving all existing size/spacing calculations.
cols_match=re.search(r'\b(let|const)\s+cols\s*=\s*[^;]+;',block)
rows_match=re.search(r'\b(let|const)\s+rows\s*=\s*[^;]+;',block)
if not cols_match or not rows_match:
    print('--- layout(count) context ---')
    print(block[:5000])
    raise SystemExit('Could not locate native cols/rows assignments')

cols_decl=cols_match.group(1)
rows_decl=rows_match.group(1)
cols_code=f"{cols_decl} cols=count===1?1:count<=6?2:3;"
rows_code=f"{rows_decl} rows=count<=2?1:count<=4?2:count<=6?3:count<=9?3:4;"
block=block[:cols_match.start()]+cols_code+block[cols_match.end():]
# Re-find rows after changing block length.
rows_match=re.search(r'\b(let|const)\s+rows\s*=\s*[^;]+;',block)
block=block[:rows_match.start()]+rows_code+block[rows_match.end():]

# Marker makes future validation simple and documents the intended matrix.
marker_comment="/* CSMS_LINEUP_GRID_1_12: 1=1x1,2=2x1,3-4=2x2,5-6=2x3,7-9=3x3,10-12=3x4 */"
if marker_comment not in block:
    block=block.replace(clamp,clamp+'\n    '+marker_comment,1)

t=t[:start]+block+t[end:]

# Use the updated layout helper asset.
t=re.sub(r'\s*<script src="regatta-lineup-layout-v2\.js\?v=[^"]+"></script>\s*','\n',t)
script='<script src="regatta-lineup-layout-v2.js?v=20260814-regatta-lineup-layout-v8"></script>'
if '</body>' not in t:
    raise SystemExit('Missing </body>')
t=t.replace('</body>',script+'\n</body>',1)

p.write_text(t)
