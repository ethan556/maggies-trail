"""Dual-route verifier for polynomial-rational-analysis Ch1. Reads shipped JSON only."""
import json, sys
from fractions import Fraction as Fr
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
def divisors(n):
    n=abs(n); return {d for d in range(1,n+1) if n%d==0}
def candidates(const,lead):
    return {s*Fr(p,q) for p in divisors(const) for q in divisors(lead) for s in (1,-1)}
def polymul(a,b):
    out=[0]*(len(a)+len(b)-1)
    for i,x in enumerate(a):
        for j,y in enumerate(b): out[i+j]+=x*y
    return out
def peval(coeffs,x):
    v=0
    for c in coeffs: v=v*x+c
    return v

f=[1,2,-5,-6]; g=[2,-3,-3,2]; h=[1,-6,11,-6]

w=widgets(json.load(open(f"{BASE}/pra-01-01.json")))
chk("11 i1 const=6", near(w["i1"]["answer"],6) and abs(f[-1])==6)
chk("11 k1 8 cands", near(w["k1"]["answer"],len(candidates(-6,1))) and len({1,2,3,6})*2==8)
chk("11 k2 6 cands", near(w["k2"]["answer"],len(candidates(2,2))))
chk("11 k3 filter-only", cl(w["k3"]).startswith("Every rational zero"))
# route B for x^3-2: all candidates fail
chk("11 k3 counterexample real", all(peval([1,0,0,-2],c)!=0 for c in candidates(-2,1)))
chk("11 ch1 8 cands", near(w["ch1"]["answer"],len(candidates(5,3))))
chk("11 rem 6 cands", near(w["rem-pra0101-k"]["answer"],len(candidates(-4,1))))

w=widgets(json.load(open(f"{BASE}/pra-01-02.json")))
chk("12 i1 f(1)=-8", near(w["i1"]["answer"],peval(f,1)) and near(w["i1"]["answer"],1+2-5-6))
chk("12 k1 f(2)=0", near(w["k1"]["answer"],peval(f,2)) and (Fr(2)**3+2*4-10-6)==0)
chk("12 k2 g(1/2)=0", cl(w["k2"]).startswith("0") and peval(g,Fr(1,2))==0 and Fr(1,4)-Fr(3,4)-Fr(3,2)+2==0)
chk("12 k3 remainder0", cl(w["k3"]).startswith("c is a zero AND"))
chk("12 ch1 x=2", cl(w["ch1"])=="x = 2" and peval(g,2)==0 and peval(g,1)==-2 and peval(g,-2)==-20)
chk("12 rem f(-1)=0", near(w["rem-pra0102-k"]["answer"],peval(f,-1)) and (-1+2+5-6)==0)

w=widgets(json.load(open(f"{BASE}/pra-01-03.json")))
# synthetic quotient of f by 2: [1,4,3]; route B: polymul back
chk("13 i1 b=4", near(w["i1"]["answer"],4) and polymul([1,-2],[1,4,3])==f)
chk("13 k1 zeros 2,-1,-3", cl(w["k1"])=="2, −1, −3" and all(peval(f,z)==0 for z in (2,-1,-3)))
chk("13 k2 x^2 coeff=2", near(w["k2"]["answer"],2) and polymul([1,-2],[1,4,3])[1]==2)
chk("13 k3 (x-2)(x+1)(2x-1)", cl(w["k3"])=="(x − 2)(x + 1)(2x − 1)" and polymul(polymul([1,-2],[1,1]),[2,-1])==g)
chk("13 ch1 largest=3", near(w["ch1"]["answer"],3) and polymul(polymul([1,-1],[1,-2]),[1,-3])==h and peval(h,6)==60)
chk("13 rem largest=3", near(w["rem-pra0103-k"]["answer"],3) and peval([1,-1,-6],3)==0 and peval([1,-1,-6],-2)==0)

for lid in ("pra-01-01","pra-01-02","pra-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
