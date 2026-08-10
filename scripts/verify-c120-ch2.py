#!/usr/bin/env python3
"""Independent re-derivation of counting-120 Chapter 2 (the 120 chart): recomputes each numeric
from its prompt (row-end = start+9, next-row = end+1, ten-more = +10, two-rows = +20, fills,
after), checks every matchPairs link's arithmetic/range, dragOrder sorts, and hops."""
import json, glob, re, sys
fails=0; checked=0
def expect(p):
    if '__' in p:
        seg=p.split(':',1)[-1]; toks=re.findall(r'\d+|__', seg); i=toks.index('__')
        if i>0 and toks[i-1]!='__': return int(toks[i-1])+1
        if i<len(toks)-1 and toks[i+1]!='__': return int(toks[i+1])-1
    if 'how many numbers are in each row' in p.lower(): return 10
    m=re.search(r'row after (\d+)[–-](\d+) starts', p)
    if m: return int(m.group(2))+1
    m=re.search(r'row starts at (\d+)\. what number ends', p.lower())
    if m: return int(m.group(1))+9
    m=re.search(r'down two rows from (\d+)', p.lower())
    if m: return int(m.group(1))+20
    m=re.search(r'ten more than (\d+)', p.lower())
    if m: return int(m.group(1))+10
    m=re.search(r'right after (\d+)', p.lower())
    if m: return int(m.group(1))+1
    return None
for f in sorted(glob.glob('content/courses/counting-120/lessons/c120-02-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            want=expect(w['prompt'])
            if want is not None:
                checked+=1
                ok=w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {w['prompt'][:46]}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            deltas=[]
            for a,b in w['pairs'].items():
                la=int(re.findall(r'\d+', llab[a])[0]); rn=re.findall(r'\d+', rlab[b])
                if len(rn)>=2:
                    s,e=int(rn[0]),int(rn[1])
                    if not (s<=la<=e): fails+=1; print(f"  {lid}/{sid} matchPairs range FAIL {la} not in {s}-{e}")
                else:
                    deltas.append(int(rn[0])-la)
            if deltas and (len(set(deltas))!=1 or deltas[0] not in (9,10)):
                fails+=1; print(f"  {lid}/{sid} matchPairs delta FAIL {deltas}")
        elif t=='dragOrder':
            checked+=1
            lab={i['id']:int(i['label']) for i in w['items']}
            if [lab[i] for i in w['correctOrder']]!=sorted(lab.values()): fails+=1; print(f"  {lid}/{sid} dragOrder FAIL")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL land {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
