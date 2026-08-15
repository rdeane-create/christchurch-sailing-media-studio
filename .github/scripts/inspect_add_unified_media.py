from pathlib import Path
s=Path('index.html').read_text()
for term in ['async function addUnifiedMedia','function addUnifiedMedia','async function loadUnifiedFile','function loadUnifiedFile','function saveMediaMeta','async function saveMediaMeta','csmsAuthenticatedBridgeCall(\n          \'saveMedia\'','saveMedia']:
    print('\n===== '+term+' =====')
    i=s.find(term)
    if i<0:
        print('NOT FOUND');continue
    print(s[max(0,i-600):min(len(s),i+5000)])
