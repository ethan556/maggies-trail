"""Dual-route verifier for pra Ch4. Reads shipped JSON only."""
import json, sys
from fractions import Fraction as FQ
BASE="content/courses/polynomial-rational-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
def cl(W): return [o for o in W["options"] if o.get("correct")][0]["label"]
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)
def solveset(f,rel,lo=-30,hi=30,step=FQ(1,4)):
    """Route B: brute-force solution set over a fine grid."""
    out=[]; x=FQ(lo)
    while x<=hi:
        v=f(x)
        ok = (v>0) if rel==">" else (v<0) if rel=="<" else (v>=0) if rel==">=" else (v<=0)
        if ok: out.append(x)
        x+=step
    return set(out)
def gridset(pred,lo=-30,hi=30,step=FQ(1,4)):
    out=[]; x=FQ(lo)
    while x<=hi:
        if pred(x): out.append(x)
        x+=step
    return set(out)

w=widgets(json.load(open(f"{BASE}/pra-04-01.json")))
f=lambda x:(x+1)*(x-2)
chk("41 i1 f(0)=−2", near(w["i1"]["answer"],f(0)) and near(w["i1"]["answer"],(1)*(-2)))
chk("41 k1 outer >0", cl(w["k1"])=="x < −1 or x > 2" and solveset(f,">")==gridset(lambda x:x<-1 or x>2))
chk("41 k2 middle ≤0", cl(w["k2"])=="−1 ≤ x ≤ 2" and solveset(f,"<=")==gridset(lambda x:-1<=x<=2))
g=lambda x:x**3-4*x
chk("41 k3 cubic <0", cl(w["k3"])=="x < −2 or 0 < x < 2" and solveset(g,"<")==gridset(lambda x:x<-2 or 0<x<2))
h=lambda x:(x-1)*(x-4)
chk("41 ch1 ≥0 outer", cl(w["ch1"])=="x ≤ 1 or x ≥ 4" and solveset(h,">=")==gridset(lambda x:x<=1 or x>=4))
chk("41 rem f(0)=−3", near(w["rem-pra0401-k"]["answer"],(0+3)*(0-1)))

w=widgets(json.load(open(f"{BASE}/pra-04-02.json")))
g2=lambda x:(x-3)**2*(x+2)
chk("42 i1 far right +", cl(w["i1"]).startswith("Positive") and g2(FQ(10**6))>0)
chk("42 k1 no flip", cl(w["k1"]).startswith("stays positive") and g2(FQ(5,2))>0 and g2(4)>0 and g2(0)==18)
chk("42 k2 chart −++", cl(w["k2"])=="−, +, +" and g2(-3)<0 and g2(0)>0 and g2(4)>0 and g2(-3)==-36)
chk("42 k3 puncture", cl(w["k3"])=="x > −2, except x = 3" and solveset(g2,">")==gridset(lambda x:x>-2 and x!=3))
h2=lambda x:(x+1)**2*(x-5)
chk("42 ch1 ≤0 all x≤5", cl(w["ch1"])=="x ≤ 5" and solveset(h2,"<=")==gridset(lambda x:x<=5) and h2(-2)==-7 and h2(0)==-5)
chk("42 rem even stays", cl(w["rem-pra0402-k"])=="stays the same" and (lambda x:(x-2)**4)(1)>0 and (lambda x:(x-2)**4)(3)>0)

w=widgets(json.load(open(f"{BASE}/pra-04-03.json")))
q=lambda x:x*x-x-6
import math
chk("43 i1 factor", cl(w["i1"])=="(x − 3)(x + 2)" and all(q(x)==(x-3)*(x+2) for x in range(-9,10)))
chk("43 k1 harvest", cl(w["k1"])=="x ≤ −2 or x ≥ 3" and solveset(lambda x:x*x-x-6,">=")==gridset(lambda x:x<=-2 or x>=3))
chk("43 k1 original form", all((x*x-x>=6)==(x<=-2 or x>=3) for x in [FQ(n,2) for n in range(-20,21)]))
c=lambda x:x**3-4*x
chk("43 k2 x³≥4x", cl(w["k2"])=="−2 ≤ x ≤ 0 or x ≥ 2" and solveset(c,">=")==gridset(lambda x:-2<=x<=0 or x>=2))
chk("43 k3 strict", cl(w["k3"]).startswith("Same intervals, but all endpoints excluded") and solveset(c,">")==gridset(lambda x:-2<x<0 or x>2) and 2**3==4*2)
chk("43 ch1 3 ints", near(w["ch1"]["answer"],3) and [n for n in range(-50,51) if n*n+8<=6*n]==[2,3,4])
chk("43 rem x²<9", cl(w["rem-pra0403-k"])=="−3 < x < 3" and solveset(lambda x:x*x-9,"<")==gridset(lambda x:-3<x<3) and (-5)**2>9)

for lid in ("pra-04-01","pra-04-02","pra-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
