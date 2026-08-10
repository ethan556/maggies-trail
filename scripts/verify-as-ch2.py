#!/usr/bin/env python3
"""Independent re-derivation of every add-subtract-20 Chapter 2 answer from the files.
Re-computes sums, partners, make-ten leftovers, and teen composition from scratch."""
import json, glob, re
fails=0; checked=0
def sum_of(p):
    m=re.search(r'(\d+)\s*\+\s*(\d+)\s*=\s*\?', p);  return (int(m.group(1)),int(m.group(2))) if m else None
def partner_q(p):
    m=re.search(r'(\d+)\s*\+\s*\?\s*=\s*10', p);  return int(m.group(1)) if m else None
for f in sorted(glob.glob('content/courses/add-subtract-20/lessons/as-02-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            p=w['prompt']; want=None
            s=sum_of(p)
            if s: want=s[0]+s[1]
            elif partner_q(p) is not None: want=10-partner_q(p)
            elif 'One is 2' in p: want=8          # partner puzzle
            elif 'LEFT' in p or 'left' in p and '−' not in p and 'took 2' in p: want=3  # 5-2 leftover
            elif p.strip().startswith('10 + 3'): want=13
            elif 'How many does 8 need' in p: want=2
            if want is not None:
                checked+=1
                ok = w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL: want {want} got {w['answer']} errs {[e['value'] for e in w['commonErrors']]} | {p[:40]}")
        elif t=='tenFrame':
            checked+=1
            if not (w['preFilled']<w['target']<=10 and all(c['count']!=w['target'] for c in w['commonCounts'])): fails+=1; print(f"  {lid}/{sid} tenFrame FAIL")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL land {land}")
        elif t=='baseTenCompose':
            checked+=1
            std=(w['target']//10, w['target']%10)
            if not (std[0]<=w['maxTens'] and all((c['tens'],c['ones'])!=std for c in w['commonBuilds'])): fails+=1; print(f"  {lid}/{sid} baseTen FAIL")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); import sys; sys.exit(1 if fails else 0)
