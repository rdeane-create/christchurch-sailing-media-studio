from pathlib import Path

p = Path('index.html')
t = p.read_text()

signature = 'function layout(count){'
start = t.find(signature)
if start < 0:
    raise SystemExit('Could not locate native layout(count) function')

brace = t.find('{', start)
depth = 0
end = None
for i in range(brace, len(t)):
    ch = t[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
if end is None:
    raise SystemExit('Could not parse native layout(count) function')

block = t[start:end]

old_maps = """    const maps={
      4:[[0,1],[2,3]],5:[[0,1,2],[3,4]],6:[[0,1,2],[3,4,5]],
      7:[[0,1,2,3],[4,5,6]],8:[[0,1,2,3],[4,5,6,7]],
      9:[[0,1,2],[3,4,5],[6,7,8]],10:[[0,1,2,3,4],[5,6,7,8,9]]
    };"""
new_maps = """    const maps={
      1:[[0]],
      2:[[0,1]],
      3:[[0,1,2]],
      4:[[0,1],[2,3]],
      5:[[0,1,2],[3,4]],
      6:[[0,1,2],[3,4,5]],
      7:[[0,1,2,3],[4,5,6]],
      8:[[0,1,2,3],[4,5,6,7]],
      9:[[0,1,2],[3,4,5],[6,7,8]],
      10:[[0,1,2,3,4],[5,6,7,8,9]],
      11:[[0,1,2,3],[4,5,6,7],[8,9,10]],
      12:[[0,1,2,3],[4,5,6,7],[8,9,10,11]]
    };"""

if old_maps in block:
    block = block.replace(old_maps, new_maps, 1)
elif '11:[[0,1,2,3],[4,5,6,7],[8,9,10]]' not in block:
    raise SystemExit('Could not extend native row maps to 1-12')

broken_rows = 'let rows=count<=2?1:count<=4?2:count<=6?3:count<=9?3:4;'
fixed_rows = 'let rows=maps[count]||maps[4];'
if broken_rows in block:
    block = block.replace(broken_rows, fixed_rows, 1)
elif fixed_rows not in block:
    raise SystemExit('Could not restore rows array')

broken_cols = 'const cols=count===1?1:count<=6?2:3;'
fixed_cols = 'const cols=row.length;'
if broken_cols in block:
    block = block.replace(broken_cols, fixed_cols, 1)
elif fixed_cols not in block:
    raise SystemExit('Could not restore per-row column count')

if 'rows.forEach((row,ri)=>{' not in block:
    raise SystemExit('Native layout no longer has expected rows.forEach loop')

# Keep the renderer-level 1-12 clamp installed by v8.
if 'Math.min(12,Number(count)||1)' not in block:
    raise SystemExit('12-card renderer clamp is missing')

# Update the marker so the live page can be validated unambiguously.
block = block.replace(
    '/* CSMS_LINEUP_GRID_1_12: 1=1x1,2=2x1,3-4=2x2,5-6=2x3,7-9=3x3,10-12=3x4 */',
    '/* CSMS_LINEUP_GRID_1_12_V9: array-backed native row maps; 1 through 12 cards */'
)

t = t[:start] + block + t[end:]
p.write_text(t)
