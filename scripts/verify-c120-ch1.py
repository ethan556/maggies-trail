#!/usr/bin/env python3
"""Independent re-derivation of counting-120 Chapter 1: recomputes each 'after/one-more/fill'
answer from the prompt, checks every dragOrder correctOrder is the true ascending sort of its
labels, and verifies each numberLineHop landing."""
import json, glob, re, sys
fails=0; checked=0
def expect(p):
    if '__' in p:
        seg = p.split(':',1)[-1]
        toks = re.findall(r'\d+|__', seg)
        i = toks.index('__')
        if i>0 and toks[i-1]!='__': return int(toks[i-1])+1
        if i<len(toks)-1 and toks[i+1]!='__': return int(toks[i+1])-1
    m = re.search(r'after (\d+)', p) or re.search(r'more than (\d+)', p)
    if m: return int(m.group(1))+1
    return None
for f in sorted(glob.glob('content/courses/counting-120/lessons/c120-01-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            want=expect(w['prompt'])
            if want is not None:
                checked+=1
                ok = w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {w['prompt'][:44]}")
        elif t=='dragOrder':
            checked+=1
            lab={i['id']:int(i['label']) for i in w['items']}
            ordered=[lab[i] for i in w['correctOrder']]
            if ordered!=sorted(lab.values()) or len(w['items'])<3 or set(w['correctOrder'])!=set(lab):
                fails+=1; print(f"  {lid}/{sid} dragOrder FAIL: {ordered}")
        elif t=='numberLineHop':
            sign=-1 if w['direction']=='back' else 1
            land=w['start']+sign*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])):
                fails+=1; print(f"  {lid}/{sid} hop FAIL land {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
