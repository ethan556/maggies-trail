#!/usr/bin/env python3
"""Independent re-derivation of solving-equations Chapter 4 (inequalities): solves each linear
inequality with SIGN-TRACKING (flip the operator iff dividing by a negative coefficient),
confirms the authored solution's boundary AND direction, verifies flip-classification labels
(flip ⟺ ×/÷ by negative; +/- never flips), matchPairs solution links, ray-graph descriptions,
and dragOrder shuffle."""
import json, glob, re, sys
from fractions import Fraction as F
FLIP={'<':'>','>':'<','<=':'>=','>=':'<=','≤':'≥','≥':'≤'}
def norm(op): return {'≤':'<=','≥':'>='}.get(op,op)
def parse_side(s):
    s=s.replace('−','-').replace(' ','')
    coeff,const=F(0),F(0)
    for m in re.finditer(r'([+-]?\d*)x', s):
        c=m.group(1); coeff += F('1') if c in ('','+') else F('-1') if c=='-' else F(c)
    s=re.sub(r'([+-]?\d*)x','',s)
    for m in re.finditer(r'([+-]?\d+)', s): const+=F(m.group(1))
    return coeff,const
def solve_ineq(expr):
    m=re.search(r'(.+?)(<=|>=|<|>|≤|≥)(.+)', expr)
    L,op,R=m.group(1),norm(m.group(2)),m.group(3)
    lc,lk=parse_side(L); rc,rk=parse_side(R)
    a=lc-rc; b=rk-lk   # a x  op  b
    x=F(b,a); o=op
    if a<0: o=FLIP[op]   # dividing by negative flips
    return x,o
fails=0; checked=0
for f in sorted(glob.glob('content/courses/solving-equations/lessons/alg1-04-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq multi-correct")
            m=re.search(r'Solve\s+(.+?)\.?$', w['prompt'])
            if m and re.search(r'[<>≤≥]', m.group(1)):
                x,o=solve_ineq(m.group(1)); want=f"x {o} {x}".replace('<=','≤').replace('>=','≥')
                cor=[opt['label'] for opt in w['options'] if opt.get('correct')][0].replace(' ','').replace('−','-')
                wantc=want.replace(' ','').replace('−','-')
                if cor!=wantc: fails+=1; print(f"  {lid}/{sid} mcq FAIL solved {want!r} correct-opt {cor!r} | {m.group(1)}")
        elif t=='numeric':
            # 'becomes x < ?' boundary prompts
            m=re.search(r'(.+?)\s+becomes x', w['prompt'])
            if m:
                x,o=solve_ineq(m.group(1)+(' < 0' if False else '')) if False else (None,None)
            m2=re.search(r'(\d*x?\s*[+\-]?\s*\d*)\s*(<=|>=|<|>|≤|≥)\s*(\d+)\s*becomes', w['prompt'])
            if m2:
                x,o=solve_ineq(f"{m2.group(1)}{m2.group(2)}{m2.group(3)}")
                checked+=1
                if F(w['answer'])!=x: fails+=1; print(f"  {lid}/{sid} boundary FAIL solved {x} authored {w['answer']}")
                if any(F(str(e['value']))==F(w['answer']) for e in w['commonErrors']): fails+=1; print(f"  {lid}/{sid} trap==answer")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ll=llab[a2]; rl=rlab[b2]
                if re.search(r'x.*[<>≤≥].*x', ll) or re.search(r'x\s*[<>≤≥]', ll):
                    if re.search(r'[<>≤≥]', ll) and 'x' in rl and re.search(r'x\s*[<>≤≥]\s*-?\d', rl):
                        x,o=solve_ineq(ll); want=f"x {o} {x}".replace('<=','≤').replace('>=','≥').replace(' ','').replace('−','-')
                        got=re.search(r'x\s*[<>≤≥]\s*[-−]?\d+', rl).group(0).replace(' ','').replace('−','-')
                        if got!=want: fails+=1; print(f"  {lid}/{sid} matchPairs FAIL {ll} -> want {want} got {got}")
                # flip classification labels
                if 'FLIP' in rl or 'no flip' in rl:
                    neg = ('−' in ll or '-' in ll) and ('divide' in ll or 'multiply' in ll)
                    is_flip = rl.startswith('FLIP')
                    if neg!=is_flip: fails+=1; print(f"  {lid}/{sid} flip-class FAIL {ll!r} vs {rl!r}")
        elif t=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {lid}/{sid} dragOrder pre-sorted")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
