from pathlib import Path

p=Path('lineup-headshot.js')
s=p.read_text()
repls={
    "q('amhSavedCardsPanel')":"q('lhSavedCardsPanel')",
    "panel.id='amhSavedCardsPanel'":"panel.id='lhSavedCardsPanel'",
    "id=\"amhSavedCardsList\"":"id=\"lhSavedCardsList\"",
    "q('amhSavedCardsList')":"q('lhSavedCardsList')",
}
for a,b in repls.items():
    s=s.replace(a,b)
# Mark the isolation version without altering the Main Athlete Headshot file.
s=s.replace("const VERSION='20260814-lineup-headshot-v2-blue-fade';","const VERSION='20260814-lineup-headshot-v3-isolated';")
p.write_text(s)

# Verify there are no Main Athlete Headshot DOM ids left in the Lineup Headshot runtime.
text=p.read_text()
for forbidden in ["amhSavedCardsPanel","amhSavedCardsList","amhApprovedCard","amhApprovedWorkspace"]:
    if forbidden in text:
        raise SystemExit(f'Lineup Headshot still references Main Athlete Headshot id: {forbidden}')

# Verify the approved Main Athlete Headshot runtime is byte-identical to the pre-lineup approved snapshot.
import subprocess
approved=subprocess.check_output(['git','show','9ed46de0269f988c3295c90697be2d20e9055a9e:athlete-main-headshot-approved-exact.js'])
current=Path('athlete-main-headshot-approved-exact.js').read_bytes()
if current != approved:
    raise SystemExit('Main Athlete Headshot differs from approved pre-lineup snapshot; refusing to continue')
print('Lineup Headshot isolated; Main Athlete Headshot remains byte-identical to approved pre-lineup snapshot.')
