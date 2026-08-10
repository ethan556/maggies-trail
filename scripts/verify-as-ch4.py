#!/usr/bin/env python3
"""Independent re-derivation of every add-subtract-20 Chapter 4 answer from the files:
fact-family numerics, equal-sign balance unknowns, missing-addend unknowns, and every
matchPairs link (left expression must equal right value)."""
import json, glob, re, sys
fails=0; checked=0
def ev(expr):
    expr=expr.replace('−','-').strip()
    m=re.fullmatch(r'(\d+)\s*([+-])\s*(\d+)', expr)
    if not m: return None
    a,op,b=int(m.group(1)),m.group(2),int(m.group(3))
    return a+b if op=='+' else a-b
def solve(prompt):
    p=prompt.replace('−','-')
    # a + b = c + ?   (balance)
    m=re.search(r'(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)\s*\+\s*\?', p)
    if m: return (int(m.group(1))+int(m.group(2)))-int(m.group(3))
    # ? - a = c
    m=re.search(r'\?\s*-\s*(\d+)\s*=\s*(\d+)', p)
    if m: return int(m.group(1))+int(m.group(2))
    # a - ? = c
    m=re.search(r'(\d+)\s*-\s*\?\s*=\s*(\d+)', p)
    if m: return int(m.group(1))-int(m.group(2))
    # a + ? = c  /  ? + a = c
    m=re.search(r'(\d+)\s*\+\s*\?\s*=\s*(\d+)', p) or re.search(r'\?\s*\+\s*(\d+)\s*=\s*(\d+)', p)
    if m: return int(m.group(2))-int(m.group(1))
    # a op b = ?
    m=re.search(r'(\d+\s*[+-]\s*\d+)\s*=\s*\?', p)
    if m: return ev(m.group(1))
    return None
for f in sorted(glob.glob('content/courses/add-subtract-20/lessons/as-04-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            want=solve(w['prompt'])
            if want is not None:
                checked+=1
                ok = w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {w['prompt'][:40]}")
        elif t=='matchPairs':
            checked+=1
            rlab={r['id']:r['label'] for r in w['right']}
            llab={l['id']:l['label'] for l in w['left']}
            for lid2,rid in w['pairs'].items():
                lv=ev(llab[lid2]); rv=int(rlab[rid])
                if lv!=rv: fails+=1; print(f"  {lid}/{sid} matchPairs FAIL: {llab[lid2]}={lv} != {rv}")
            # every left paired
            if set(w['pairs'])!=set(llab): fails+=1; print(f"  {lid}/{sid} matchPairs unpaired left")
        elif t=='tenFrame':
            checked+=1
            if not (w['preFilled']<w['target']<=10 and all(c['count']!=w['target'] for c in w['commonCounts'])): fails+=1; print(f"  {lid}/{sid} tenFrame FAIL")
        elif t=='numberLineHop':
            sign=-1 if w['direction']=='back' else 1
            land=w['start']+sign*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL land {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
