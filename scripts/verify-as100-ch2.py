#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-100 Chapter 2 (add within 100): recomputes every
a+b numeric (incl. regroup answers), verifies every baseTenCompose (target from prompt sum,
commonBuilds never the standard pair + feedback names the built total), every matchPairs link
(sum totals AND ones-digit trade classification), and hops."""
import json, glob, re, sys
fails=0; checked=0
for f in sorted(glob.glob('content/courses/add-subtract-100/lessons/as100-02-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            m=re.search(r'(\d+)\s*\+\s*(\d+)\s*=\s*\?', w['prompt'])
            if m:
                want=int(m.group(1))+int(m.group(2)); checked+=1
                ok=w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
        elif t=='baseTenCompose':
            checked+=1
            tgt=w['target']; stdT,stdO=tgt//10,tgt%10; ok=1<=tgt<=99 and w.get('requireStandard',True)
            m=re.search(r'(\d+)\s*\+\s*(\d+)', w['prompt'])
            if m and int(m.group(1))+int(m.group(2))!=tgt: ok=False; print(f"  {lid}/{sid} target != prompt sum")
            for cb in w.get('commonBuilds',[]):
                if (cb['tens'],cb['ones'])==(stdT,stdO): ok=False; print(f"  {lid}/{sid} commonBuild equals answer")
                built=10*cb['tens']+cb['ones']
                # unbundled-correct builds (total==tgt, non-standard) are legitimate; others must name their total
                if built!=tgt and str(built) not in cb['feedback']:
                    ok=False; print(f"  {lid}/{sid} commonBuild {cb['tens']}t{cb['ones']}o={built} unnamed in feedback")
            if not ok: fails+=1; print(f"  {lid}/{sid} baseTenCompose FAIL")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a,b in w['pairs'].items():
                ln=[int(x) for x in re.findall(r'\d+', llab[a])]; rl=rlab[b]; rn=[int(x) for x in re.findall(r'\d+', rl)]
                if len(ln)==2:
                    s=ln[0]+ln[1]; ones=(ln[0]%10)+(ln[1]%10)
                    if 'trade' in rl or 'safe' in rl:
                        needs='trade' in rl
                        if needs!=(ones>=10) or (rn and rn[0]!=ones): fails+=1; print(f"  {lid}/{sid} trade-classify FAIL {llab[a]}: ones={ones} vs '{rl}'")
                    elif rn and rn[0]!=s:
                        fails+=1; print(f"  {lid}/{sid} matchPairs FAIL {llab[a]}={s} vs {rn[0]}")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
