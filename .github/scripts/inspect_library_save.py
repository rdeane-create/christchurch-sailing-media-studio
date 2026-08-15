from pathlib import Path
s=Path('index.html').read_text()
terms=['library','Library','saveCard','savedCards','IndexedDB','indexedDB','downloadLink','renderVideo','completeActiveProductionWork']
for term in terms:
    print('\n===== '+term+' =====')
    start=0;hits=0
    while True:
        i=s.find(term,start)
        if i<0 or hits>=12: break
        print(s[max(0,i-350):min(len(s),i+900)].replace('\r',''))
        print('\n---')
        start=i+len(term);hits+=1
