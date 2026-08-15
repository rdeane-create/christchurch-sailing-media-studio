from pathlib import Path
import re

p=Path('index.html')
t=p.read_text()

t=re.sub(r'\s*<script src="regatta-lineup-output-branding-v1\.js\?v=[^"]+"></script>\s*','\n',t)
marker='<script src="regatta-lineup-output-branding-v1.js?v=20260814-regatta-output-branding-v7"></script>'
if '</body>' not in t:
    raise SystemExit('Missing </body>')
t=t.replace('</body>',marker+'\n</body>',1)

old_draw_title="""  function drawTitle(t=0,staticOnly=false){
    const event=(els.eventName.value||'EVENT NAME').toUpperCase();
    const loc=(els.location.value||'LOCATION').toUpperCase();
    drawTitlePackage(els.titleStyle.value,event,loc,t,staticOnly);
  }"""
new_draw_title="""  function drawTitle(t=0,staticOnly=false){
    if(activeProfile==='story'||activeProfile==='reel')return;
    const event=(els.eventName.value||'EVENT NAME').toUpperCase();
    const loc=(els.location.value||'LOCATION').toUpperCase();
    drawTitlePackage(els.titleStyle.value,event,loc,t,staticOnly);
  }"""
if old_draw_title in t:
    t=t.replace(old_draw_title,new_draw_title,1)
elif new_draw_title not in t:
    raise SystemExit('Could not patch legacy title renderer')

old_story="""    if(activeProfile==='story'||activeProfile==='reel'){
      // More vertical room for the finished 2:3 hero cards.
      top=Math.max(440,zones.top+300);
      bottom=Math.max(34,zones.bottom*.45);
      rowGap=20;
      side=24;
      colGap=18;
"""
new_story="""    if(activeProfile==='story'||activeProfile==='reel'){
      // Exact Athlete Headshot header ends near 170px; begin cards immediately after its navy fade.
      // Reserve the compact footer at the bottom and use the full remaining story frame.
      top=Math.max(205,zones.top+40);
      bottom=Math.max(284,zones.bottom*.45);
      rowGap=8;
      side=18;
      colGap=8;
"""
if old_story in t:
    t=t.replace(old_story,new_story,1)
elif new_story not in t and 'top=Math.max(205,zones.top+40);' not in t:
    raise SystemExit('Could not patch story grid reserve')

if '        const ratio=2/3;' in t:
    t=t.replace('        const ratio=2/3;','        const ratio=4/5;',1)
elif '        const ratio=4/5;' not in t:
    raise SystemExit('Could not patch grid ratio')

if '      const cardRatio=2/3;' in t:
    t=t.replace('      const cardRatio=2/3;','      const cardRatio=4/5;',1)
elif '      const cardRatio=4/5;' not in t:
    raise SystemExit('Could not patch hero ratio')

old_padding="const padding=display==='edgeFit'?2:8;"
new_padding="const padding=display==='edgeFit'?0:2;"
if old_padding in t:
    t=t.replace(old_padding,new_padding,1)
elif new_padding not in t:
    raise SystemExit('Could not patch athlete-card padding')

old_placeholder="""      ctx.strokeStyle='rgba(255,255,255,.35)';
      ctx.lineWidth=2;
      roundRect(x,y,w,h,22);"""
new_placeholder="""      ctx.strokeStyle='rgba(255,255,255,.24)';
      ctx.lineWidth=1;
      roundRect(x,y,w,h,12);"""
if old_placeholder in t:
    t=t.replace(old_placeholder,new_placeholder,1)
elif new_placeholder not in t:
    raise SystemExit('Could not patch card placeholder border')

p.write_text(t)
