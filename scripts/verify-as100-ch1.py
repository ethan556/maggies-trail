#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-100 Chapter 1 (doubles/near-doubles fluency):
recomputes every a+b numeric, the halving challenge, every matchPairs double/near-double link,
tenFrame, and hop landings — all from the authored files."""
import json, glob, re, sys
fails=0; checked=0
for f in sorted(glob.glob('content/courses/add-subtract-100/lessons/as100-01-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            p=w['prompt']
            m=re.search(r'(\d+)\s*\+\s*(\d+)\s*=\s*\?', p)
            want=None
            if m: want=int(m.group(1))+int(m.group(2))
            else:
                m2=re.search(r'doubles to (\d+)', p)
                if m2:
                    tot=int(m2.group(1)); want=tot//2
                    if tot%2: want=None
            if want is not None:
                checked+=1
                ok=w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {p[:40]}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a,b in w['pairs'].items():
                ln=[int(x) for x in re.findall(r'\d+', llab[a])]
                rn=[int(x) for x in re.findall(r'\d+', rlab[b])]
                if len(ln)==2 and rn:
                    s=ln[0]+ln[1]
                    if rn and rn[-1] not in (s,):    # totals or 'double X plus 1 -> S' end with the sum
                        # strategy-name pairs (no digits on the right) are skipped below
                        fails+=1; print(f"  {lid}/{sid} matchPairs FAIL {llab[a]}={s} vs right '{rlab[b]}'")
                    if len(rn)>=2 and 2*rn[0]+1!=s and rn[0]!=s:
                        fails+=1; print(f"  {lid}/{sid} near-double helper FAIL double {rn[0]}+1 != {s}")
        elif t=='tenFrame':
            checked+=1
            if not (w['preFilled']<w['target']<=10 and all(c['count']!=w['target'] for c in w['commonCounts'])): fails+=1; print(f"  {lid}/{sid} tenFrame FAIL")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
