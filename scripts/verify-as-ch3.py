#!/usr/bin/env python3
"""Independent re-derivation of every add-subtract-20 Chapter 3 answer from the files.
Subtraction: parses 'a - b = ?' prompts and back-hop landings, checks against fresh math
and (for sub-facts) the addition inverse."""
import json, glob, re, sys
fails=0; checked=0
def sub_of(p):
    m=re.search(r'(\d+)\s*[-−]\s*(\d+)\s*=\s*\?', p); return (int(m.group(1)),int(m.group(2))) if m else None
for f in sorted(glob.glob('content/courses/add-subtract-20/lessons/as-03-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            s=sub_of(w['prompt'])
            if s:
                want=s[0]-s[1]; checked+=1
                ok = w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                # sub-facts inverse: answer + b == a
                if want>=0: ok = ok and (w['answer']+s[1]==s[0])
                if not ok: fails+=1; print(f"  {lid}/{sid} FAIL: {s[0]}-{s[1]} want {want} got {w['answer']} errs {[e['value'] for e in w['commonErrors']]}")
        elif t=='numberLineHop':
            sign=-1 if w['direction']=='back' else 1
            land=w['start']+sign*w['hop']*w['hops']; checked+=1
            ok = w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])
            if not ok: fails+=1; print(f"  {lid}/{sid} hop FAIL: land {land} dir {w['direction']}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
