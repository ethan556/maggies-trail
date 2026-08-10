# Independent re-derivation of every numeric/hop/frame answer in add-subtract-20 ch1,
# read from the authored files. Parses the intended sum out of each prompt and checks it.
import json, glob, re
fails=0; checked=0
def add_of(prompt):
    m=re.search(r'(\d+)\s*\+\s*(\d+)', prompt)
    return (int(m.group(1)), int(m.group(2))) if m else None
for f in sorted(glob.glob('content/courses/add-subtract-20/lessons/as-01-*.json')):
    d=json.load(open(f)); lid=d['id']
    steps=[(s['id'],s.get('widget')) for s in d['steps']]
    steps+=[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in steps:
        if not w: continue
        t=w['type']
        if t=='numeric':
            a=add_of(w['prompt'])
            if a:
                want=a[0]+a[1]; checked+=1
                ok = w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL: {a[0]}+{a[1]}={want} vs {w['answer']} errs={[e['value'] for e in w['commonErrors']]}")
        elif t=='numberLineHop':
            sign=-1 if w['direction']=='back' else 1
            land=w['start']+sign*w['hop']*w['hops']; checked+=1
            ok = w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])
            if not ok: fails+=1; print(f"  {lid}/{sid} hop FAIL: land {land}")
        elif t=='tenFrame':
            checked+=1
            ok = w['preFilled']<w['target']<=10 and all(c['count']!=w['target'] for c in w['commonCounts'])
            if not ok: fails+=1; print(f"  {lid}/{sid} tenFrame FAIL")
        elif t=='subitizeFlash':
            checked+=1
            ok = w['count'] in w['options'] and len(set(w['options']))==len(w['options']) and all(c['value']!=w['count'] for c in w['commonPicks'])
            if not ok: fails+=1; print(f"  {lid}/{sid} subitize FAIL")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"CHECKED {checked} widgets, FAILS: {fails}"); assert fails==0
