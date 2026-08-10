#!/usr/bin/env python3
"""Independent re-derivation of counting-120 Chapter 3 (numerals): recomputes each
tens/ones->numeral and after-N answer from the prompt; verifies every baseTenCompose target
is in [1,99] with commonBuilds that (a) never equal the standard build and (b) actually
build the number their feedback names; checks matchPairs 100+N links; hops; mcq."""
import json, glob, re, sys
fails=0; checked=0
W2N={'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,
 'ten':10,'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,
 'seventeen':17,'eighteen':18,'nineteen':19,'twenty':20,'forty':40}
def expect(p):
    pl=p.lower()
    if '__' in p:
        toks=re.findall(r'\d+|__', p.split(':',1)[-1]); i=toks.index('__')
        if i>0 and toks[i-1]!='__': return int(toks[i-1])+1
    m=re.search(r'(\d+)\s*tens? and (\d+)\s*ones?', pl)
    if m: return 10*int(m.group(1))+int(m.group(2))
    m=re.search(r'right after (\d+)', pl)
    if m: return int(m.group(1))+1
    m=re.search(r"write 'one hundred (\w+)'", pl)
    if m and m.group(1) in W2N: return 100+W2N[m.group(1)]
    m=re.search(r"write '(\w+)' as a numeral", pl)
    if m and m.group(1) in W2N: return W2N[m.group(1)]
    return None
for f in sorted(glob.glob('content/courses/counting-120/lessons/c120-03-*.json')):
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
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {w['prompt'][:44]}")
        elif t=='baseTenCompose':
            checked+=1
            tgt=w['target']; stdT,stdO=tgt//10,tgt%10
            ok = 1<=tgt<=99 and w.get('requireStandard',True)
            m=re.search(r'[bB]uild (\d+)', w['prompt'])
            if m and int(m.group(1))!=tgt: ok=False
            for cb in w.get('commonBuilds',[]):
                if (cb['tens'],cb['ones'])==(stdT,stdO): ok=False; print(f"  {lid}/{sid} commonBuild equals the answer")
                built=10*cb['tens']+cb['ones']
                named=[int(x) for x in re.findall(r'\d+', cb['feedback'])]
                if built!=tgt and built not in named and str(built) not in cb['feedback']:
                    ok=False; print(f"  {lid}/{sid} commonBuild {cb['tens']}t{cb['ones']}o builds {built}, feedback doesn't name it")
            if not ok: fails+=1; print(f"  {lid}/{sid} baseTenCompose FAIL target {tgt}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a,b in w['pairs'].items():
                ln=[int(x) for x in re.findall(r'\d+', llab[a])]; rn=int(re.findall(r'\d+', rlab[b])[0])
                if len(ln)==2 and ln[0]+ln[1]!=rn: fails+=1; print(f"  {lid}/{sid} matchPairs FAIL {llab[a]} != {rn}")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
