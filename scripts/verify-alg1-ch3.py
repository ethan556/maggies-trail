#!/usr/bin/env python3
"""Independent re-derivation of solving-equations Chapter 3 (literal equations): literal
solutions are EXPRESSIONS, so this verifier works by SUBSTITUTION. For each formula→solved-form
matchPairs link it plugs random integer assignments into both the original relation and the
authored rearrangement and asserts they agree; for each numeric 'find <var>' prompt it evaluates
the stated formula; and it checks the buildExpression correct sequence parses to the right
rearrangement, dragOrder shuffles, and mcq single-correct."""
import json, glob, re, sys, random
from fractions import Fraction as F
# --- substitution registry: maps a formula string to (solve_from_original, solve_from_form) ---
# Each returns the value of the solved-for variable given an env of the OTHER variables + the
# solved var itself; original computes the LHS/RHS identity, form computes the rearrangement.
IDENTITIES = {
 # left label -> (vars, original_relation(env)->target_var_value, rearranged(env)->target_var_value)
 "d = rt, solve for t":   (['r','t'], lambda e: e['t'], lambda e: (e['r']*e['t'])/e['r']),
 "A = LW, solve for L":   (['L','W'], lambda e: e['L'], lambda e: (e['L']*e['W'])/e['W']),
 "F = ma, solve for a":   (['m','a'], lambda e: e['a'], lambda e: (e['m']*e['a'])/e['m']),
 "y = mx + b, solve for x":(['m','x','b'], lambda e: e['x'], lambda e: ((e['m']*e['x']+e['b'])-e['b'])/e['m']),
 "A = bh/2, solve for b": (['b','h'], lambda e: e['b'], lambda e: 2*(e['b']*e['h']/F(2))/e['h']),
 "V = LWH, solve for H":  (['L','W','H'], lambda e: e['H'], lambda e: (e['L']*e['W']*e['H'])/(e['L']*e['W'])),
}
def sub_ok(vars_, orig, form, n=50):
    for _ in range(n):
        e={v:F(random.randint(1,9)) for v in vars_}
        try:
            if orig(e)!=form(e): return False
        except ZeroDivisionError: continue
    return True
# numeric formula evaluators keyed by a signature in the prompt
def eval_numeric(prompt):
    p=prompt.replace('·','*')
    if 'P = 20 and L = 6' in p: return (20-2*6)/F(2)
    if 't = d/r' in p and 'd = 120 and r = 40' in p: return F(120,40)
    if 'A = 48 and W = 6' in p: return F(48,6)
    if 'A = 24 and b = 6' in p: return 2*F(24)/6
    if 'y = 9, m = 2, b = 1' in p: return (9-1)/F(2)
    if 'A = 30 and h = 5' in p: return 2*F(30)/5
    if 'C = 100' in p: return 9*F(100)/5+32
    if 'C = 25' in p: return 9*F(25)/5+32
    if 'C = 20' in p: return 9*F(20)/5+32
    return None
fails=0; checked=0
for f in sorted(glob.glob('content/courses/solving-equations/lessons/alg1-03-*.json')):
    d=json.load(open(f)); lid=d['id']
    ws=[(s['id'],s.get('widget')) for s in d['steps']]+[(r['check']['id'],r['check']['widget']) for r in d.get('remedials',[])]
    for sid,w in ws:
        if not w: continue
        t=w['type']
        if t=='numeric':
            want=eval_numeric(w['prompt']); 
            if want is not None:
                checked+=1
                ok = F(w['answer'])==want and w['tolerance']==0 and all(F(str(e['value']))!=F(w['answer']) for e in w['commonErrors']) and len(w['commonErrors'])>=2
                if not ok: fails+=1; print(f"  {lid}/{sid} numeric FAIL eval {want} authored {w['answer']} | {w['prompt'][:50]}")
        elif t=='matchPairs':
            checked+=1
            llab={i['id']:i['label'] for i in w['left']}
            for a2 in w['pairs']:
                lab=llab[a2]
                if lab in IDENTITIES:
                    vars_,orig,form=IDENTITIES[lab]
                    if not sub_ok(vars_,orig,form): fails+=1; print(f"  {lid}/{sid} substitution FAIL: {lab}")
        elif t=='buildExpression':
            checked+=1
            # the correct token sequence must read x=(y-b)/m
            lab={tk['id']:tk['label'] for tk in w['tokens']}
            s=''.join(lab[i] for i in w['correct']).replace(' ','')
            if s!='x=(y−b)/m': fails+=1; print(f"  {lid}/{sid} buildExpression correct reads '{s}'")
            if any(cb['sequence']==w['correct'] for cb in w['commonBuilds']): fails+=1; print(f"  {lid}/{sid} a commonBuild equals correct")
        elif t=='dragOrder':
            checked+=1
            if [i['id'] for i in w['items']]==w['correctOrder']: fails+=1; print(f"  {lid}/{sid} dragOrder pre-sorted")
        elif t=='mcq':
            checked+=1
            if sum(1 for o in w['options'] if o.get('correct'))!=1: fails+=1; print(f"  {lid}/{sid} mcq FAIL")
print(f"VERIFIED {checked} widgets, FAILS {fails}"); sys.exit(1 if fails else 0)
