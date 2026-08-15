from pathlib import Path
p=Path('athlete-main-headshot-approved-exact.js')
s=p.read_text()
needles=['function draw','S.overlay','OVERLAY_SRC','NAME=','createTile','template','Main Athlete Headshot','workspace-athletes','workspace-hero','aCanvas','aCardName','Export','Save']
for needle in needles:
    print('\n===== '+needle+' =====')
    start=0
    found=0
    while True:
        i=s.find(needle,start)
        if i<0: break
        found+=1
        a=max(0,i-700); b=min(len(s),i+1800)
        print(s[a:b])
        print('\n---')
        start=i+len(needle)
        if found>=8: break
