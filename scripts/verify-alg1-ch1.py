#!/usr/bin/env python3
"""Independent re-derivation of solving-equations Chapter 1: parses each 'Solve for x' prompt
into a SYMBOLIC linear equation (handles k(x±a), kx±b, sums of terms, both sides), solves it
exactly with Fractions, and checks the authored answer, trap distinctness, matchPairs
equation→solution links, expansion links, and dragOrder shuffle."""
import json, glob, re, sys
from fractions import Fraction as F
def parse_side(s):
    """Return (coeff, const) for a sum of terms like '2(x - 3) + 4x - 6' or '3x + 8'."""
    s = s.replace('−','-').replace(' ','')
    coeff, const = F(0), F(0)
    # expand k(mx±a) — m optional
    def expand(m):
        k=F(m.group(1)) if m.group(1) not in ('','+','-') else F(m.group(1)+'1')
        mm=F(m.group(2)) if m.group(2) else F(1)
        sign=1 if m.group(3)=='+' else -1
        a=F(m.group(4))
        kx=k*mm; kc=sign*k*a
        return f"+{kx}x{'+' if kc>=0 else ''}{kc}"
    s=re.sub(r'([+-]?\d*)\((\d*)x([+-])(\d+)\)', expand, s)
    for m in re.finditer(r'([+-]?\d*)x|([+-]?\d+)(?!x)', s):
        if m.group(0).endswith('x'):
            c=m.group(1)
            coeff += F(c+'1') if c in ('','+','-') else F(c)
        else:
            const += F(m.group(2))
    return coeff, const
def solve(eq):
    L,R = eq.split('=')
    lc,lk = parse_side(L); rc,rk = parse_side(R)
    a = lc-rc; b = rk-lk
    assert a!=0
    return F(b,a)
fails=0; checked=0
for f in sorted(glob.glob('content/courses/solving-equations/lessons/alg1-01-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            m=re.search(r'[Ss]olve for x:\s*(.+)$', w['prompt'])
            if m:
                x=solve(m.group(1)); checked+=1
                ok = x.denominator==1 and w['answer']==x and w['tolerance']==0 \
                     and all(e['value']!=w['answer'] for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL: solved {x} authored {w['answer']} | {m.group(1)}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}; rlab={i['id']:i['label'] for i in w['right']}
            for a2,b2 in w['pairs'].items():
                ll=llab[a2]; rl=rlab[b2]
                if '=' in ll and 'x =' in rl:
                    x=solve(ll); want=F(re.search(r'x = (-?\d+)', rl).group(1))
                    if x!=want: fails+=1; print(f"  {lid}/{sid} matchPairs solve FAIL {ll} -> {x} vs {want}")
                elif '(' in ll and '=' not in ll:
                    lc,lk=parse_side(ll); rc,rk=parse_side(rl)
                    if (lc,lk)!=(rc,rk): fails+=1; print(f"  {lid}/{sid} expansion FAIL {ll} vs {rl}")
        elif t=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {lid}/{sid} dragOrder pre-sorted")
            if len(set(w['correctOrder']))!=len(w['items']): fails+=1; print(f"  {lid}/{sid} dragOrder ids mismatch")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
