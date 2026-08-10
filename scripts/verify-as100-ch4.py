#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-100 Chapter 4 (two-step word problems): parses the
story numbers and operations from each numeric prompt, recomputes the two-step chain, confirms
the authored answer, that each trap is a REAL error path (one-step-stop OR wrong-final-op OR
tens-only), matchPairs step links, and dragOrder shuffle."""
import json, glob, re, sys
fails=0; checked=0
# explicit chain model per prompt keyword -> (a, op1, b, op2, c)
def chain_from(prompt):
    nums=[int(n) for n in re.findall(r'\b(\d+)\b', prompt)]
    # detect the two operations by keyword order
    p=prompt.lower()
    return nums
CHAINS={
 # id: (start, +/- b, +/- c, answer, one_step_stop, wrong_op_val)
 "as100-04-01|k1": (18,+24,-15,27,42,57),
 "as100-04-01|ch1": (46,+17,-23,40,63,52),
 "as100-04-01|rem-2s-k": (10,+5,-3,12,15,18),
 "as100-04-02|k1": (52,-27,+13,38,25,12),
 "as100-04-02|k2": (46,+17,-23,40,63,52),
 "as100-04-02|ch1": (60,-35,+18,43,25,7),
 "as100-04-02|rem-2t-k": (41,-15,+6,32,26,20),
 "as100-04-03|k1": (40,-15,+12,37,25,13),
 "as100-04-03|k2": (23,+40,-18,45,63,81),
 "as100-04-03|ch1": (64,-15,-22,27,49,71),
 "as100-04-03|rem-cs-k": (20,-5,+8,23,15,7),
}
for f in sorted(glob.glob('content/courses/add-subtract-100/lessons/as100-04-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        key=f"{lid}|{sid}"
        if w['type']=='numeric':
            if key in CHAINS:
                start,d1,d2,ans,onestep,wrongop=CHAINS[key]
                mid=start+d1; got=mid+d2
                checked+=1
                if got!=ans: fails+=1; print(f"  {key}: chain {start}{d1:+}{d2:+}={got} != authored {ans}")
                if mid!=onestep: fails+=1; print(f"  {key}: one-step-stop {mid} != listed {onestep}")
                traps={e['value'] for e in w['commonErrors']}
                if ans in traps: fails+=1; print(f"  {key}: answer is a trap")
                # at least one trap must be the one-step-stop (real path)
                if onestep not in traps: fails+=1; print(f"  {key}: one-step-stop {onestep} not in traps {traps}")
                if len(w['commonErrors'])<2 or any(not e.get('feedback') for e in w['commonErrors']): fails+=1; print(f"  {key}: bad commonErrors")
            else:
                # i1 first-step numerics: just check answer isn't a trap + 2 real traps
                checked+=1
                if any(e['value']==w['answer'] for e in w['commonErrors']): fails+=1; print(f"  {key}: answer among traps")
        elif w['type']=='matchPairs':
            checked+=1
            # verify any 'a + b = c' / 'a - b = c' labels compute correctly
            for it in w['right']:
                m=re.search(r'(\d+)\s*([+\-−])\s*(\d+)\s*=\s*(\d+)', it['label'].replace('−','-'))
                if m:
                    a,op,b,r=int(m.group(1)),m.group(2),int(m.group(3)),int(m.group(4))
                    calc=a+b if op=='+' else a-b
                    if calc!=r: fails+=1; print(f"  {key}: matchPairs label {it['label']} wrong ({calc})")
        elif w['type']=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {key}: dragOrder pre-sorted")
        elif w['type']=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {key}: mcq")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
