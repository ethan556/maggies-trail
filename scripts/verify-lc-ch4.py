"""Dual-route verifier for lc Ch4 (continuity & IVT). Independent recompute vs shipped."""
import json, sys, math
BASE="content/courses/limits-continuity/lessons"
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
f=lambda x: x*x+1
poly=lambda x: 2*x*x-x+3
cube=lambda x: x**3-x-1

w=widgets(json.load(open(f"{BASE}/lc-04-01.json")))
chk("0401 i1 f2=5", near(w["i1"]["answer"], f(2)) and f(2)==5)
chk("0401 k1 undefined", cl(w["k1"]).startswith("f(2) is not defined"))
chk("0401 k2 f3=10", near(w["k2"]["answer"], f(3)) and f(3)==10)
chk("0401 k3 allthree", cl(w["k3"]).startswith("f(a) defined, the limit exists"))
chk("0401 ch1 9", near(w["ch1"]["answer"], poly(2)) and poly(2)==9)
chk("0401 rem 5", near(w["rem-lc0401-k"]["answer"], 1+4))

w=widgets(json.load(open(f"{BASE}/lc-04-02.json")))
chk("0402 i1 removable", cl(w["i1"]).startswith("removable"))
chk("0402 k1 hole4", near(w["k1"]["answer"], 2+2) and near(w["k1"]["answer"],4))   # lim of x+2 at 2
chk("0402 k2 jump", cl(w["k2"])=="jump discontinuity")
chk("0402 k3 infinite", cl(w["k3"]).startswith("infinite"))
chk("0402 ch1 1/6", near(w["ch1"]["answer"], round(1/6,4),0.0011) and near(1/(3+3),1/6))
chk("0402 rem infinite", cl(w["rem-lc0402-k"])=="infinite")

w=widgets(json.load(open(f"{BASE}/lc-04-03.json")))
chk("0403 i1 between", cl(w["i1"]).startswith("0 lies between") and (-1<0<2))
chk("0403 k1 root", cl(w["k1"]).startswith("a root") and (1*1-2)<0<(2*2-2))
chk("0403 k2 fm1", near(w["k2"]["answer"], cube(1)) and cube(1)==-1)
chk("0403 k3 skip", cl(w["k3"]).startswith("A discontinuous function could jump"))
chk("0403 ch1 f2=5", near(w["ch1"]["answer"], cube(2)) and cube(2)==5)
chk("0403 rem fm1", near(w["rem-lc0403-k"]["answer"], 2*2-5))

for lid in ("lc-04-01","lc-04-02","lc-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
