#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-100 Chapter 3 (subtract within 100): recomputes
every a-b numeric; verifies flip/forgot-reduce trap VALUES are the true error-path results
where a break occurs; baseTenCompose target==prompt difference + commonBuild honesty;
matchPairs differences AND break classification (break ⟺ minuend ones < subtrahend ones);
backward hops."""
import json, glob, re, sys
fails=0; checked=0
def err_paths(a,b):
    ao,bo,at,bt=a%10,b%10,a//10,b//10
    if ao>=bo: return None
    flip=(at-bt)*10+(bo-ao); forgot=(at-bt)*10+(ao+10-bo)
    return {flip,forgot}
for f in sorted(glob.glob('content/courses/add-subtract-100/lessons/as100-03-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            m=re.search(r'(\d+)\s*[−-]\s*(\d+)\s*=\s*\?', w['prompt'])
            if m:
                a,b=int(m.group(1)),int(m.group(2)); want=a-b; checked+=1
                ok=w['answer']==want and w['tolerance']==0 and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                ep=err_paths(a,b)
                if ep:  # break case: at least one trap must be a true error-path value
                    trap_vals={e['value'] for e in w['commonErrors']}
                    if not (trap_vals & ep): ok=False; print(f"  {lid}/{sid}: no trap matches a real error path {ep}")
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
        elif t=='baseTenCompose':
            checked+=1
            tgt=w['target']; stdT,stdO=tgt//10,tgt%10; ok=1<=tgt<=99 and w.get('requireStandard',True)
            m=re.search(r'(\d+)\s*[−-]\s*(\d+)', w['prompt'])
            if m and int(m.group(1))-int(m.group(2))!=tgt: ok=False; print(f"  {lid}/{sid} target != prompt difference")
            for cb in w.get('commonBuilds',[]):
                if (cb['tens'],cb['ones'])==(stdT,stdO): ok=False; print(f"  {lid}/{sid} commonBuild equals answer")
                built=10*cb['tens']+cb['ones']
                if built!=tgt and str(built) not in cb['feedback']: ok=False; print(f"  {lid}/{sid} commonBuild {built} unnamed")
            if not ok: fails+=1; print(f"  {lid}/{sid} baseTenCompose FAIL")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ln=[int(x) for x in re.findall(r'\d+', llab[a2].replace('−','-'))]; rl=rlab[b2]; rn=[int(x) for x in re.findall(r'\d+', rl)]
                if len(ln)==2:
                    diff=ln[0]-ln[1]; ao,bo=ln[0]%10,ln[1]%10
                    if 'break' in rl or 'safe' in rl:
                        needs='break' in rl
                        if needs!=(ao<bo): fails+=1; print(f"  {lid}/{sid} break-classify FAIL {llab[a2]}")
                        if rn and (rn[0],rn[1])!=(ao,bo) and (rn[0],rn[1])!=(ao,bo): 
                            if rn[:2]!=[ao,bo]: fails+=1; print(f"  {lid}/{sid} break-label ones mismatch {rn[:2]} vs {[ao,bo]}")
                    elif rn and rn[0]!=diff:
                        fails+=1; print(f"  {lid}/{sid} matchPairs FAIL {llab[a2]}={diff} vs {rn[0]}")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
