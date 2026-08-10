#!/usr/bin/env python3
"""Independent re-derivation of add-subtract-20 Chapter 5 (word problems). Extracts the two
story numbers from each numeric prompt, recomputes sum and difference from scratch, and checks
the file's answer is the correct operation for that story type (join->add, take/part/compare->sub)."""
import json, glob, re, sys
fails=0; checked=0
# story type by keyword in the QUESTION sentence only (last sentence)
def optype(prompt):
    q = prompt.lower().rsplit('.', 1)[-1]   # the question sentence
    if any(k in q for k in ["in all", "altogether", "in total", " now"]):
        return "add"     # total/result unknown
    return "sub"         # take-from, part-unknown, and compare all subtract
for f in sorted(glob.glob('content/courses/add-subtract-20/lessons/as-05-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            nums=[int(x) for x in re.findall(r'\d+', w['prompt'])]
            if len(nums)>=2:
                a,b=nums[0],nums[1]; checked+=1
                add,sub=a+b, abs(a-b)
                got=w['answer']
                ok = got in (add,sub) and w['tolerance']==0 and all(e['value']!=got for e in w['commonErrors']) and len(w['commonErrors'])>=2
                # the answer must be the SMALLER (difference) for sub-stories, the sum for join-stories
                exp = add if optype(w['prompt'])=="add" else sub
                if got!=exp: ok=False
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL: nums {a},{b} exp {exp} got {got} | {w['prompt'][:46]}")
        elif t=='numberLineHop':
            sign=-1 if w['direction']=='back' else 1
            land=w['start']+sign*w['hop']*w['hops']; checked+=1
            if not (w['min']<=land<=w['max'] and land!=w['start'] and all(c['value']!=land for c in w['commonLandings'])): fails+=1; print(f"  {lid}/{sid} hop FAIL land {land}")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
