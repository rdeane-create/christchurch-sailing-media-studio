from pathlib import Path
import re
p=Path('index.html')
t=p.read_text()

def show(label, pattern, before=1200, after=7000):
    m=re.search(pattern,t,re.I|re.S)
    print('\n===== '+label+' =====')
    if not m:
        print('NOT FOUND')
        return
    s=max(0,m.start()-before); e=min(len(t),m.start()+after)
    print(t[s:e])

show('LAYOUT', r'function\s+layout\s*\(count\)')
for label,pat in [
 ('DRAWFRAME',r'function\s+drawFrame\s*\('),
 ('HERO',r'hero'),
 ('MOTION PRESET',r'motion\s*preset|motionPreset'),
 ('LOCKED HERO',r'Locked Hero Motion'),
 ('LERP',r'lerp\s*\('),
 ('ATHLETE CARD DRAW',r'athleteFiles|athletes\['),
]: show(label,pat,1800,11000)
