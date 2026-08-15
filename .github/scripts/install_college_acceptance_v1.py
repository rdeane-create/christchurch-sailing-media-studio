from pathlib import Path
import hashlib

index=Path('index.html')
main=Path('athlete-main-headshot-approved-exact.js')
main_before=hashlib.sha256(main.read_bytes()).hexdigest()
text=index.read_text()
tag='<script src="college-acceptance.js?v=20260815-college-acceptance-v1"></script>'
if tag not in text:
    assert '</body>' in text, 'index.html body close not found'
    text=text.replace('</body>',tag+'\n</body>',1)
    index.write_text(text)
main_after=hashlib.sha256(main.read_bytes()).hexdigest()
assert main_before==main_after, 'LOCK VIOLATION: Athlete Main Headshot changed'
assert Path('college-acceptance.js').exists(), 'college-acceptance.js missing'
assert 'College Acceptance' in Path('college-acceptance.js').read_text()
assert 'Play Drop' in Path('college-acceptance.js').read_text()
assert 'listSavedCards' in Path('college-acceptance.js').read_text()
print('College Acceptance installed. Locked Athlete Main Headshot unchanged.')
