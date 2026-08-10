#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-100 Chapter 5 (odd & even): recomputes each sum,
verifies parity claims (even iff n%2==0), that odd+odd=even / even+even=even / odd+even=odd,
that doubles are even, matchPairs parity links, and mcq single-correct."""
import json, glob, re, sys
fails=0; checked=0
for f in sorted(glob.glob('content/courses/add-subtract-100/lessons/as100-05-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            m=re.search(r'(\d+)\s*\+\s*(\d+)', w['prompt'])
            if m:
                a,b=int(m.group(1)),int(m.group(2)); want=a+b; checked+=1
                if w['answer']!=want: fails+=1; print(f"  {lid}/{sid} sum {a}+{b}={want} != {w['answer']}")
                if any(e['value']==w['answer'] for e in w['commonErrors']): fails+=1; print(f"  {lid}/{sid} answer among traps")
                if len(w['commonErrors'])<2: fails+=1; print(f"  {lid}/{sid} <2 traps")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq")
            # parity questions: 'Is N odd or even?'
            m=re.search(r'Is (\d+) odd or even', w['prompt'])
            if m:
                n=int(m.group(1)); truth='even' if n%2==0 else 'odd'
                cor=[o['label'] for o in w['options'] if o.get('correct')][0]
                if cor!=truth: fails+=1; print(f"  {lid}/{sid} parity FAIL {n} is {truth} not {cor}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ll=llab[a2]; rl=rlab[b2]
                # single number -> parity
                m=re.fullmatch(r'(\d+)', ll.strip())
                if m:
                    n=int(m.group(1)); truth='even' if n%2==0 else 'odd'
                    if truth not in rl: fails+=1; print(f"  {lid}/{sid} matchPairs parity {n} vs '{rl}'")
                # 'a + b' expressions -> parity label + computed value
                m2=re.search(r'(\d+)\s*\+\s*(\d+)', ll)
                if m2:
                    a,b=int(m2.group(1)),int(m2.group(2)); s=a+b; truth='even' if s%2==0 else 'odd'
                    if truth not in rl: fails+=1; print(f"  {lid}/{sid} sum-parity {a}+{b}={s} vs '{rl}'")
                    rn=re.search(r'\((\d+)\)', rl)
                    if rn and int(rn.group(1))!=s: fails+=1; print(f"  {lid}/{sid} sum label {s}!={rn.group(1)}")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
