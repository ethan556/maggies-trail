"""Dual-route verifier for pra Ch5. Reads shipped JSON only."""
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
def grid(pred,lo=-12,hi=12,step=FQ(1,4)):
    out=set(); x=FQ(lo)
    while x<=hi:
        if pred(x): out.add(x)
        x+=step
    return out
def solveset(g,rel,ex,lo=-12,hi=12,step=FQ(1,4)):
    out=set(); x=FQ(lo)
    while x<=hi:
        if x not in ex:
            v=g(x)
            ok=(v>0) if rel==">" else (v>=0) if rel==">=" else (v<0) if rel=="<" else (v<=0)
            if ok: out.add(x)
        x+=step
    return out

w=widgets(json.load(open(f"{BASE}/pra-05-01.json")))
f=lambda x:(FQ(x)-3)/(FQ(x)+1)
chk("51 i1 excluded −1", near(w["i1"]["answer"],-1) and (-1)+1==0)
chk("51 k1 chart +−+", cl(w["k1"])=="+, −, +" and f(-2)>0 and f(0)<0 and f(4)>0 and f(-2)==5)
chk("51 k2 >0 outer", cl(w["k2"])=="x < −1 or x > 3" and solveset(f,">",{FQ(-1)})==grid(lambda x:x<-1 or x>3))
g=lambda x:FQ(x)/(FQ(x)-5)
chk("51 k3 missing cut", cl(w["k3"]).startswith("The sign also flips at the excluded value 5") and g(1)<0 and g(6)>0)
h=lambda x:(FQ(x)+4)/(FQ(x)-2)
chk("51 ch1 middle <0", cl(w["ch1"])=="−4 < x < 2" and solveset(h,"<",{FQ(2)})==grid(lambda x:-4<x<2) and h(0)==-2)
chk("51 rem 3 cuts", near(w["rem-pra0501-k"]["answer"],3) and len({7,2,-2})==3 and (2*2-4)==0 and ((-2)**2-4)==0)

w=widgets(json.load(open(f"{BASE}/pra-05-02.json")))
chk("52 i1 ≥ boundary", cl(w["i1"])=="x < −1 or x ≥ 3" and solveset(f,">=",{FQ(-1)})==grid(lambda x:x<-1 or x>=3) and f(3)==0)
hh=lambda x:FQ(x)/(FQ(x)-2)
chk("52 k1 mult trap", cl(w["k1"]).startswith("For x < 2 the factor is negative") and hh(0)==0 and (0<=3) and not (0>=3))
chk("52 k2 [−4,2)", cl(w["k2"])=="−4 ≤ x < 2" and solveset(h,"<=",{FQ(2)})==grid(lambda x:-4<=x<2) and h(-4)==0)
chk("52 k3 hole out", cl(w["k3"]).startswith("No — the original expression is undefined at x = 1"))
t=lambda x:(FQ(x)*(FQ(x)-6))/(FQ(x)-3)
sol=solveset(t,"<=",{FQ(3)})
chk("52 ch1 2 closed", near(w["ch1"]["answer"],2) and sol==grid(lambda x:x<=0 or 3<x<=6) and t(0)==0 and t(6)==0 and FQ(3) not in sol)
chk("52 rem −8 only", cl(w["rem-pra0502-k"])=="x = −8 only" and ((-8)+8)==0)

w=widgets(json.load(open(f"{BASE}/pra-05-03.json")))
chk("53 i1 c=6", near(w["i1"]["answer"],6) and all(x-3*(x-2)==-2*x+6 for x in range(-9,10)))
chk("53 k1 cuts 2,3", cl(w["k1"]).startswith("x = 2 (excluded) and x = 3") and (-2*3+6)==0 and (2-2)==0)
r=lambda x:(-2*FQ(x)+6)/(FQ(x)-2)
chk("53 k2 harvest", cl(w["k2"])=="x < 2 or x ≥ 3" and solveset(r,"<=",{FQ(2)})==grid(lambda x:x<2 or x>=3))
chk("53 k2 equiv original", all((hh(x)<=3)==(r(x)<=0) for x in [FQ(n,4) for n in range(-48,49)] if x!=2))
u=lambda x:(2/(FQ(x)+1))-1; v=lambda x:(1-FQ(x))/(FQ(x)+1)
chk("53 k3 (1−x)/(x+1)", cl(w["k3"])=="(1 − x)/(x + 1) ≥ 0" and all((u(x)>=0)==(v(x)>=0) for x in [FQ(n,4) for n in range(-48,49)] if x!=-1))
brute=[n for n in range(-3,7) if n!=2 and FQ(n)/(n-2)<=3]
chk("53 ch1 9 ints", near(w["ch1"]["answer"],len(brute)) and brute==[-3,-2,-1,0,1,3,4,5,6])
chk("53 rem cuts 0,1/2", cl(w["rem-pra0503-k"]).startswith("x = 0 (excluded) and x = 1/2") and (1-2*FQ(1,2))==0)

for lid in ("pra-05-01","pra-05-02","pra-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
