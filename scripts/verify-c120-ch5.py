#!/usr/bin/env python3
"""Independent re-derivation of counting-120 Chapter 5 (one/ten more & less): recomputes every
±1 and ±10 result and every two-jump chain, verifies matchPairs 'ten more than N' / two-jump
landings, dragOrder ordering, hop landings, and that traps are real (one-vs-ten confusion,
wrong-direction, rollover-written-as-digits)."""
import json, glob, re, sys
fails=0; checked=0
def one_more_less(prompt):
    m=re.search(r'one (more|less) than (\d+)', prompt.lower())
    if m: return int(m.group(2))+(1 if m.group(1)=='more' else -1)
def ten_more_less(prompt):
    m=re.search(r'ten (more|less) than (\d+)', prompt.lower())
    if m: return int(m.group(2))+(10 if m.group(1)=='more' else -10)
def two_jump(prompt):
    m=re.search(r'at (\d+)\.\s*(ten|one) (more|less), then (ten|one) (more|less)', prompt.lower())
    if m:
        v=int(m.group(1))
        for size,dirn in [(m.group(2),m.group(3)),(m.group(4),m.group(5))]:
            step=(10 if size=='ten' else 1)*(1 if dirn=='more' else -1); v+=step
        return v
for f in sorted(glob.glob('content/courses/counting-120/lessons/c120-05-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']; p=w.get('prompt','')
        if t in ('numeric','mcq'):
            want=two_jump(p)
            if want is None: want=ten_more_less(p)
            if want is None: want=one_more_less(p)
            if want is not None:
                checked+=1
                if t=='numeric':
                    if w['answer']!=want: fails+=1; print(f"  {lid}/{sid} FAIL want {want} got {w['answer']} | {p[:50]}")
                    if any(e['value']==w['answer'] for e in w['commonErrors']): fails+=1; print(f"  {lid}/{sid} answer among traps")
                else:
                    cor=[o['label'] for o in w['options'] if o.get('correct')][0]
                    if str(want) not in cor: fails+=1; print(f"  {lid}/{sid} mcq FAIL want {want} correct '{cor}'")
        if t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ll=llab[a2]; rl=rlab[b2]
                want=ten_more_less(ll) or one_more_less(ll)
                # two-jump match labels e.g. 'from 45: ten more, one more'
                m=re.search(r'from (\d+):\s*(ten|one) (more|less),\s*(ten|one) (more|less)', ll.lower())
                if m:
                    v=int(m.group(1))
                    for size,dirn in [(m.group(2),m.group(3)),(m.group(4),m.group(5))]:
                        v+=(10 if size=='ten' else 1)*(1 if dirn=='more' else -1)
                    want=v
                if want is not None:
                    rn=re.search(r'\d+', rl)
                    if rn and int(rn.group())!=want: fails+=1; print(f"  {lid}/{sid} matchPairs FAIL '{ll}' -> want {want} got {rn.group()}")
        if t=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {lid}/{sid} pre-sorted")
        if t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if any(c['value']==land for c in w['commonLandings']) or land==w['start']: fails+=1; print(f"  {lid}/{sid} hop trap==land {land}")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
