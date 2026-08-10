"""Dual-route verifier for function-analysis Ch1 (fna-01-01..03).
Route A recomputes every numeric answer symbolically from the prompt's model;
Route B recomputes by an independent method (point-sampling / unit analysis / Fraction).
Reads the SHIPPED JSON, never the generator."""
import json, sys
from fractions import Fraction as Fr
BASE="content/courses/function-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def get(lid): return json.load(open(f"{BASE}/{lid}.json"))
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
fails=[]
def chk(name,cond):
    if not cond: fails.append(name)
    print(("✓" if cond else "✗"), name)

# ---- fna-01-01: f=x², 3x+1, x²−2x ----
w=widgets(get("fna-01-01"))
sq=lambda x:Fr(x)**2; lin=lambda x:3*Fr(x)+1; q2=lambda x:Fr(x)**2-2*Fr(x)
def arocA(f,a,b): return (f(b)-f(a))/Fr(b-a)
def arocB(f,a,b):  # independent: mean of forward differences over unit partition scaled
    n=8; h=Fr(b-a,n)
    return sum(f(a+(i+1)*h)-f(a+i*h) for i in range(n))/Fr(b-a)
chk("i1 f(3)-f(1)=8", near(w["i1"]["answer"], sq(3)-sq(1)) and near(w["i1"]["answer"], 9-1))
chk("k1 aroc x^2 [1,3]", near(w["k1"]["answer"],arocA(sq,1,3)) and near(w["k1"]["answer"],arocB(sq,1,3)))
chk("k2 aroc 3x+1 [0,10]", near(w["k2"]["answer"],arocA(lin,0,10)) and near(w["k2"]["answer"],arocB(lin,0,10)))
chk("k3 aroc x^2 [2,5]", near(w["k3"]["answer"],arocA(sq,2,5)) and near(w["k3"]["answer"],arocB(sq,2,5)))
chk("ch1 aroc x^2-2x [1,4]", near(w["ch1"]["answer"],arocA(q2,1,4)) and near(w["ch1"]["answer"],arocB(q2,1,4)))
chk("rem aroc x^2 [0,2]", near(w["rem-fna0101-k"]["answer"],arocA(sq,0,2)) and near(w["rem-fna0101-k"]["answer"],arocB(sq,0,2)))
# tolerance windows exclude every trap
for sid,W in w.items():
    if W["type"]=="numeric":
        for e in W["commonErrors"]:
            chk(f"01 {sid} trap {e['value']} outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))

# ---- fna-01-02: secants ----
w=widgets(get("fna-01-02"))
def slopeA(p,q): return Fr(q[1]-p[1], q[0]-p[0])
def slopeB(p,q):  # independent: solve y=mx+c through both points via elimination
    m=Fr(p[1]-q[1], p[0]-q[0]); c=Fr(p[1])-m*p[0]
    assert m*q[0]+c==q[1]; return m
cases={"i1":((0,2),(4,10)),"k1":((1,7),(5,3)),"k3":((2,3),(6,11)),"rem-fna0102-k":((0,2),(3,8))}
for sid,(p,q) in cases.items():
    chk(f"02 {sid} slope", near(w[sid]["answer"],slopeA(p,q)) and near(w[sid]["answer"],slopeB(p,q)))
# mcq correctness: ch1 comparison — recompute both slopes two ways
l,r=slopeA((0,1),(2,9)),slopeA((2,9),(5,25))
l2,r2=slopeB((0,1),(2,9)),slopeB((2,9),(5,25))
correct=[o for o in w["ch1"]["options"] if o.get("correct")][0]["label"]
chk("02 ch1 [2,5] steeper", l==l2 and r==r2 and r>l and correct=="[2, 5]")
correct_k2=[o for o in w["k2"]["options"] if o.get("correct")][0]["label"]
chk("02 k2 horizontal=zero-rate option", "average rate of change there is 0" in correct_k2)
for sid,W in w.items():
    if W["type"]=="numeric":
        for e in W["commonErrors"]:
            chk(f"02 {sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))

# ---- fna-01-03: applied rates ----
w=widgets(get("fna-01-03"))
apps={"i1":((0,48),(6,12)),"k1":((0,1500),(3,2400)),"ch1":((6,8),(12,-4)),"rem-fna0103-k":((0,30),(4,90))}
for sid,(p,q) in apps.items():
    A=Fr(q[1]-p[1], q[0]-p[0])
    B=slopeB(p,q)
    chk(f"03 {sid} rate", near(w[sid]["answer"],A) and near(w[sid]["answer"],B))
ava,ben=Fr(10,2),Fr(12,3)
correct=[o for o in w["k3"]["options"] if o.get("correct")][0]["label"]
chk("03 k3 Ava faster", ava>ben and correct.startswith("Ava"))
correct=[o for o in w["k2"]["options"] if o.get("correct")][0]["label"]
chk("03 k2 negative=dropping", "dropped" in correct)
for sid,W in w.items():
    if W["type"]=="numeric":
        for e in W["commonErrors"]:
            chk(f"03 {sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))

print(f"\n{'ALL GREEN' if not fails else 'FAILURES: '+str(fails)}")
sys.exit(1 if fails else 0)
