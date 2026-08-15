from pathlib import Path

p=Path('index.html')
s=p.read_text()
marker='<script src="regatta-results-story.js?v=20260815-v1"></script>'
if marker not in s:
    if '</body>' not in s:
        raise RuntimeError('index.html has no </body> marker')
    s=s.replace('</body>',f'  {marker}\n</body>',1)
    p.write_text(s)
    print('Injected Regatta Results Story script')
else:
    print('Regatta Results Story script already present')

assert marker in p.read_text()
