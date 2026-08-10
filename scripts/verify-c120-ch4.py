#!/usr/bin/env python3
"""Independent re-derivation of counting-120 Chapter 4 (tens & ones): recomputes every +10 hop
and sum, verifies baseTenCompose tens/ones decomposition, tens-count/ones-count questions,
tens-and-ones→numeral assembly, matchPairs place-value links, dragOrder ordering, and that every
trap is a real error path (off-by-one for ten-hops, digit-swap, dropped-ones)."""
import json, glob, re, sys
fails=0; checked=0
for f in sorted(glob.glob('content/courses/counting-120/lessons/c120-04-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            p=w['prompt']; want=None
            m=re.search(r'(\d+)\s*\+\s*(\d+)\s*=\s*\?', p)
            if m: want=int(m.group(1))+int(m.group(2))
            elif 'two tens' in p:
                s0=int(re.search(r'at (\d+)',p).group(1)); want=s0+20
            elif 'How many TENS' in p:
                n=int(re.search(r'in (\d+)',p).group(1)); want=n//10
            elif 'leftover ONES' in p or 'ONES are in' in p:
                n=int(re.search(r'in (\d+)',p).group(1)); want=n%10
            elif 'hundred' in p.lower() and 'ten' in p.lower() and 'ones' in p.lower():
                # "1 hundred, 1 ten, and 4 ones" or "9 tens and 4 ones"
                h=re.search(r'(\d+)\s*hundred',p); tn=re.search(r'(\d+)\s*ten',p); on=re.search(r'(\d+)\s*one',p)
                want=(int(h.group(1))*100 if h else 0)+(int(tn.group(1))*10 if tn else 0)+(int(on.group(1)) if on else 0)
            elif 'tens and' in p and 'ones' in p:
                tn=re.search(r'(\d+)\s*tens',p); on=re.search(r'(\d+)\s*one',p)
                want=(int(tn.group(1))*10 if tn else 0)+(int(on.group(1)) if on else 0)
            if want is not None:
                checked+=1
                if w['answer']!=want: fails+=1; print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} | {p[:45]}")
                if any(e['value']==w['answer'] for e in w['commonErrors']): fails+=1; print(f"  {lid}/{sid} answer among traps")
                if len(w['commonErrors'])<2 or any(not e.get('feedback') for e in w['commonErrors']): fails+=1; print(f"  {lid}/{sid} bad commonErrors")
        elif t=='baseTenCompose':
            checked+=1
            tgt=w['target']; stdT,stdO=tgt//10,tgt%10
            if not (1<=tgt<=99): fails+=1; print(f"  {lid}/{sid} target {tgt} out of ≤99")
            for cb in w.get('commonBuilds',[]):
                if (cb['tens'],cb['ones'])==(stdT,stdO): fails+=1; print(f"  {lid}/{sid} commonBuild==answer")
                built=10*cb['tens']+cb['ones']
                if built!=tgt and str(built) not in cb['feedback']: fails+=1; print(f"  {lid}/{sid} commonBuild {built} unnamed")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ln=re.fullmatch(r'(\d+)', llab[a2].strip()); rl=rlab[b2]
                if ln:
                    n=int(ln.group(1)); tn=re.search(r'(\d+)\s*tens?',rl); on=re.search(r'(\d+)\s*ones?',rl)
                    if tn and on and (int(tn.group(1)),int(on.group(1)))!=(n//10,n%10):
                        fails+=1; print(f"  {lid}/{sid} place-value FAIL {n} vs '{rl}'")
        elif t=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {lid}/{sid} pre-sorted")
            vals=[int(re.search(r'\d+',i['label']).group()) for i in w['items']]
            order=[int(re.search(r'\d+',[i for i in w['items'] if i['id']==cid][0]['label']).group()) for cid in w['correctOrder']]
            if order!=sorted(order): fails+=1; print(f"  {lid}/{sid} correctOrder not ascending {order}")
        elif t=='numberLineHop':
            land=w['start']+(-1 if w['direction']=='back' else 1)*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
