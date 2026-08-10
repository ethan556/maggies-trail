"""Dual-route verifier for function-analysis Ch3. Reads shipped JSON."""
import json,sys
BASE="content/courses/function-analysis/lessons"
def get(l): return json.load(open(f"{BASE}/{l}.json"))
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
fails=[]
def chk(n,c):
    print(("✓" if c else "✗"),n)
    if not c: fails.append(n)
def cl(w): return [o for o in w["options"] if o.get("correct")][0]["label"]

# 03-01 even/odd — route A: identity over dense grid; route B: exponent-parity rule
grid=[i/7 for i in range(-25,26) if i]
def classify_scan(fn):
    ev=all(abs(fn(-x)-fn(x))<1e-9 for x in grid)
    od=all(abs(fn(-x)+fn(x))<1e-9 for x in grid)
    return "Even" if ev else "Odd" if od else "Neither"
def classify_parity(terms):  # [(coef,exp)]
    exps=[e for c,e in terms if c!=0]
    if all(e%2==0 for e in exps): return "Even"
    if all(e%2==1 for e in exps): return "Odd"
    return "Neither"
w=widgets(get("fna-03-01"))
fe=lambda x:x**4-3*x**2
chk("0301 i1 f(−2)=4", w["i1"]["answer"]==fe(-2)==(-2)**4-3*(-2)**2==4)
chk("0301 k1 g odd", cl(w["k1"])=="Odd" and classify_scan(lambda x:x**3-3*x)=="Odd" and classify_parity([(1,3),(-3,1)])=="Odd")
chk("0301 k2 h neither", cl(w["k2"]).startswith("Neither") and classify_scan(lambda x:x*x+x)=="Neither" and classify_parity([(1,2),(1,1)])=="Neither")
chk("0301 k3 y-axis ↔ even", cl(w["k3"]).endswith("even"))
chk("0301 ch1 k even", cl(w["ch1"])=="Even" and classify_scan(lambda x:5*x**6-2*x**4+7)=="Even" and classify_parity([(5,6),(-2,4),(7,0)])=="Even")
chk("0301 rem m odd", cl(w["rem-fna0301-k"])=="Odd" and classify_scan(lambda x:x**5+4*x)=="Odd" and classify_parity([(1,5),(4,1)])=="Odd")

# 03-02 piecewise — route A: direct def; route B: branch-by-inequality reimplementation
def pA(x): return x+5 if x<2 else x*x
def pB(x):
    owners=[(x<2, x+5),(x>=2, x*x)]
    hits=[v for c,v in owners if c]
    assert len(hits)==1  # exactly-one-owner property
    return hits[0]
w=widgets(get("fna-03-02"))
for sid,xin in (("i1",-3),("k1",2),("k2",3),("rem-fna0302-k",0)):
    chk(f"0302 {sid} p({xin})", w[sid]["answer"]==pA(xin)==pB(xin))
chk("0302 k3 exactly-one-owner", cl(w["k3"]).startswith("So every input has exactly one"))
# ch1: solve p(x)=9 both routes
solsA=[x for x in [i/10 for i in range(-100,101)] if abs(pA(x)-9)<1e-9]
solsB=[]
if (9-5)<2: solsB.append(4)         # branch1 candidate check (4 fails)
for cand in (3,-3):
    if cand>=2: solsB.append(cand)
chk("0302 ch1 unique sol 3", solsA==[3.0] and solsB==[3] and w["ch1"]["answer"]==3)

# 03-03 abs/step
w=widgets(get("fna-03-03"))
chk("0303 i1 −(−7)=7", w["i1"]["answer"]==-(-7)==abs(-7)==7)
def costA(wt): return 4 if wt<=1 else 7 if wt<=2 else 10
def costB(wt):
    brackets=[(0,1,4),(1,2,7),(2,3,10)]
    hit=[c for lo,hi,c in brackets if lo<wt<=hi]
    assert len(hit)==1; return hit[0]
for sid,wt in (("k1",1.4),("k2",1),("rem-fna0303-k",2.5)):
    chk(f"0303 {sid} cost({wt})", w[sid]["answer"]==costA(wt)==costB(wt))
chk("0303 k3 jump 7→10", cl(w["k3"]).startswith("The cost jumps from $7 to $10") and costA(2)==7 and costA(2.01)==10)
lbl=cl(w["ch1"])
def rebuilt(x): return (3-x) if x<3 else (x-3)
chk("0303 ch1 |x−3| pieces", lbl.startswith("3 − x if x < 3") and all(abs(rebuilt(x)-abs(x-3))<1e-12 for x in [i/9 for i in range(-40,60)]))
for lid in ("fna-03-01","fna-03-02","fna-03-03"):
    for sid,W in widgets(get(lid)).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
        if W["type"]=="mcq":
            chk(f"{lid}/{sid} wrong options diagnosed", all(o.get("feedback") for o in W["options"] if not o.get("correct")))
print("\n"+("ALL GREEN" if not fails else f"FAILURES: {fails}"))
sys.exit(1 if fails else 0)
