from pathlib import Path
import re

src=Path('athlete-main-headshot-approved-exact.js')
out=Path('lineup-headshot.js')
if not src.exists():
    raise SystemExit('Main Athlete Headshot source not found')
s=src.read_text()

# Identity/version: this is a separate template, cloned from the approved Main Athlete Headshot.
s=re.sub(r"const NAME='[^']+';", "const NAME='Lineup Headshot';", s, count=1)
s=re.sub(r"const VERSION='[^']+';", "const VERSION='20260814-lineup-headshot-v1';", s, count=1)

# Give the duplicate its own DOM surface so it cannot interfere with Main Athlete Headshot.
replacements={
    'amhApprovedCard':'lineupHeadshotCard',
    'amhApprovedWorkspace':'lineupHeadshotWorkspace',
    "q('aCanvas')":"q('lhCanvas')",
    'id="aCanvas"':'id="lhCanvas"',
    "q('aClose')":"q('lhClose')",
    'id="aClose"':'id="lhClose"',
    "q('aUpload')":"q('lhUpload')",
    'id="aUpload"':'id="lhUpload"',
    "q('aScaleVal')":"q('lhScaleVal')",
    'id="aScaleVal"':'id="lhScaleVal"',
    "q('aScale')":"q('lhScale')",
    'id="aScale"':'id="lhScale"',
    "q('aXVal')":"q('lhXVal')",
    'id="aXVal"':'id="lhXVal"',
    "q('aX')":"q('lhX')",
    'id="aX"':'id="lhX"',
    "q('aYVal')":"q('lhYVal')",
    'id="aYVal"':'id="lhYVal"',
    "q('aY')":"q('lhY')",
    'id="aY"':'id="lhY"',
    "q('aFirst')":"q('lhFirst')",
    'id="aFirst"':'id="lhFirst"',
    "q('aLast')":"q('lhLast')",
    'id="aLast"':'id="lhLast"',
    "q('aClass')":"q('lhClass')",
    'id="aClass"':'id="lhClass"',
    "q('aCardName')":"q('lhCardName')",
    'id="aCardName"':'id="lhCardName"',
    "q('aReset')":"q('lhReset')",
    'id="aReset"':'id="lhReset"',
    "q('aSave')":"q('lhSave')",
    'id="aSave"':'id="lhSave"',
    "q('aDownload')":"q('lhDownload')",
    'id="aDownload"':'id="lhDownload"',
}
for old,new in replacements.items():
    s=s.replace(old,new)

# Card naming/type for the new lineup card while keeping it discoverable as an athlete card.
s=s.replace('ATHLETE HEADSHOT CARD','ATHLETE LINEUP HEADSHOT CARD')
s=s.replace('`${last}, ${first}, ATHLETE LINEUP HEADSHOT CARD`','`${last}, ${first}, LINEUP HEADSHOT CARD`')
s=s.replace("a.download='athlete-main-headshot-approved.png'", "a.download='lineup-headshot.png'")

# Remove ONLY the locked graphic overlay. Photo and approved bottom typography remain unchanged.
s=s.replace("if(S.overlay)ctx.drawImage(S.overlay,0,0,W,H);", "")
s=s.replace("[S.overlay,S.atlas]=await Promise.all([loadImage(OVERLAY_SRC),loadImage(ATLAS_SRC)]);S.ready=true;draw()", "S.atlas=await loadImage(ATLAS_SRC);S.overlay=null;S.ready=true;draw()")
s=s.replace('Locked approved artwork. Only the athlete photo and text content are editable.','Lineup Headshot. Athlete photo and lower name/class treatment match Main Athlete Headshot; the top title/graphic has been removed.')

# Make the template tile thumbnail visually communicate the open top/photo treatment.
s=s.replace('background:linear-gradient(#dfe4ea,#fff 45%,#7f8e9b 72%,#03182a)', 'background:linear-gradient(#7f8e9b,#dfe4ea 48%,#7f8e9b 72%,#03182a)')

required=[
    "const NAME='Lineup Headshot';",
    "const VERSION='20260814-lineup-headshot-v1';",
    "id=\"lineupHeadshotCard\"" if False else "lineupHeadshotCard",
    "id=\"lhCanvas\"",
    "LINEUP HEADSHOT CARD",
    "ATHLETE LINEUP HEADSHOT CARD",
    "a.download='lineup-headshot.png'",
    "S.overlay=null;S.ready=true;draw()",
]
for marker in required:
    if marker not in s:
        raise SystemExit('Lineup Headshot validation marker missing: '+marker)
if "if(S.overlay)ctx.drawImage(S.overlay,0,0,W,H);" in s:
    raise SystemExit('Top overlay draw is still present')
out.write_text(s)

# Install as a separate Studio template without touching the approved Main Athlete Headshot script.
index=Path('index.html')
t=index.read_text()
t=re.sub(r'\s*<script src="lineup-headshot\.js\?v=[^"]+"></script>\s*','\n',t)
marker='<script src="lineup-headshot.js?v=20260814-lineup-headshot-v1"></script>'
anchor=re.search(r'<script src="athlete-main-headshot-approved-exact\.js\?v=[^"]+"></script>',t)
if anchor:
    pos=anchor.end()
    t=t[:pos]+'\n'+marker+t[pos:]
elif '</body>' in t:
    t=t.replace('</body>',marker+'\n</body>',1)
else:
    raise SystemExit('Could not install Lineup Headshot script tag')
index.write_text(t)
print('Lineup Headshot v1 installed.')
