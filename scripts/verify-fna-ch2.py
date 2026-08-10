"""Dual-route verifier for function-analysis Ch2. Reads shipped JSON.
Route A: symbolic/closed-form; Route B: dense numeric scan (independent)."""
import json,sys
from fractions import Fraction as Fr
BASE="content/courses/function-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def get(l): return json.load(open(f"{BASE}/{l}.json"))
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=(s,s["widget"])
    for r in L.get("remedials",[]): out[r["check"]["id"]]=(r["check"],r["check"]["widget"])
    return out
fails=[]
def chk(n,c):
    print(("✓" if c else "✗"),n)
    if not c: fails.append(n)
def correct_label(w): return [o for o in w["options"] if o.get("correct")][0]["label"]

f=lambda x:x**3-3*x; g=lambda x:-(x-2)**2+9; h=lambda x:abs(x-3)+1
def rising(fn,a,b,n=400):
    hh=(b-a)/n; return all(fn(a+(i+1)*hh)>fn(a+i*hh) for i in range(n))
def falling(fn,a,b,n=400):
    hh=(b-a)/n; return all(fn(a+(i+1)*hh)<fn(a+i*hh) for i in range(n))

# 02-01
w=widgets(get("fna-02-01"))
# route A: derivative roots of x^3-3x are ±1, first turn (max) at -1; route B: scan behavior
chk("0201 i1 first turn x=-1", near(w["i1"][1]["answer"],-1) and rising(f,-2.5,-1.001) and falling(f,-0.999,0.999))
chk("0201 k1 decreasing (−1,1)", correct_label(w["k1"][1])=="(−1, 1)" and falling(f,-0.99,0.99) and rising(f,1.01,3))
chk("0201 k2 g increasing (−∞,2)", correct_label(w["k2"][1])=="(−∞, 2)" and rising(g,-4,1.99) and falling(g,2.01,6))
chk("0201 k3 h decreasing (−∞,3)", correct_label(w["k3"][1])=="(−∞, 3)" and falling(h,-2,2.99) and rising(h,3.01,7))
chk("0201 ch1 f increasing on (1,∞)", correct_label(w["ch1"][1]).startswith("Increasing") and rising(f,1.001,12))
chk("0201 rem x² dec (−∞,0)", correct_label(w["rem-fna0201-k"][1])=="(−∞, 0)" and falling(lambda x:x*x,-5,-0.01))

# 02-02
w=widgets(get("fna-02-02"))
chk("0202 i1 f(-1)=2", near(w["i1"][1]["answer"], f(-1)) and near(w["i1"][1]["answer"], (-1)**3-3*(-1)))
chk("0202 k1 max g = 9", near(w["k1"][1]["answer"], g(2)) and near(w["k1"][1]["answer"], max(g(x/50) for x in range(-300,500))))
chk("0202 k2 later climb beats 2", "climbs above 2" in correct_label(w["k2"][1]) and f(3)>2)
chk("0202 k3 min h = 1", near(w["k3"][1]["answer"], h(3)) and near(w["k3"][1]["answer"], min(h(x/50) for x in range(-200,500))))
chk("0202 ch1 local min (1,−2)", correct_label(w["ch1"][1])=="(1, −2)" and f(1)==-2 and falling(f,0.9,0.999) and rising(f,1.001,1.2))
chk("0202 rem min x² = 0", near(w["rem-fna0202-k"][1]["answer"],0) and min((x/50)**2 for x in range(-200,200))==0)

# 02-03
w=widgets(get("fna-02-03"))
chk("0203 i1 largest range value 9", near(w["i1"][1]["answer"],9) and max(g(x/50) for x in range(-500,700))==9)
chk("0203 k1 range h [1,∞)", correct_label(w["k1"][1])=="[1, ∞)" and min(h(x/50) for x in range(-500,700))==1 and h(1000)>1000-10)
chk("0203 k2 cubic range all reals", correct_label(w["k2"][1])=="All real numbers" and f(-10)<-500 and f(10)>500)
chk("0203 k3 story: peak height", correct_label(w["k3"][1]).startswith("At 2 seconds"))
chk("0203 ch1 g(5)=0", near(w["ch1"][1]["answer"], g(5)) and near(w["ch1"][1]["answer"], -(Fr(5)-2)**2+9))
chk("0203 rem range x² [0,∞)", correct_label(w["rem-fna0203-k"][1])=="[0, ∞)")

# trap-vs-tolerance sweep + mcq per-option feedback presence
for lid in ("fna-02-01","fna-02-02","fna-02-03"):
    for sid,(s,W) in widgets(get(lid)).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
        if W["type"]=="mcq":
            chk(f"{lid}/{sid} every wrong option diagnosed", all(o.get("feedback") for o in W["options"] if not o.get("correct")))
print("\n"+("ALL GREEN" if not fails else f"FAILURES: {fails}"))
sys.exit(1 if fails else 0)
