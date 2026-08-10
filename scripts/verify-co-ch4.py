"""Dual-route verifier for co Ch4 (general→standard form). Independent classify/complete-square recompute."""
import json, sys, math
BASE="content/courses/conic-sections/lessons"
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
def ctype(A,C):
    if A==0 or C==0: return "parabola"
    if A==C: return "circle"
    if (A>0)==(C>0): return "ellipse"
    return "hyperbola"
def complete(coef): return (coef/2)**2   # constant to add for x²+coef·x

w=widgets(json.load(open(f"{BASE}/co-04-01.json")))
chk("0401 i1 circle", cl(w["i1"])=="circle" and ctype(1,1)=="circle")
chk("0401 k1 ellipse", cl(w["k1"])=="ellipse" and ctype(1,4)=="ellipse")
chk("0401 k2 hyper", cl(w["k2"])=="hyperbola" and ctype(9,-4)=="hyperbola")
chk("0401 k3 parab", cl(w["k3"])=="parabola" and ctype(0,1)=="parabola")
chk("0401 ch1 circle", cl(w["ch1"])=="circle" and ctype(3,3)=="circle")
chk("0401 rem hyper", cl(w["rem-co0401-k"])=="hyperbola" and ctype(1,-1)=="hyperbola")

w=widgets(json.load(open(f"{BASE}/co-04-02.json")))
chk("0402 i1 add9", near(w["i1"]["answer"], complete(-6)) and complete(-6)==9)
chk("0402 k1 center", cl(w["k1"])=="(3, −2)")
chk("0402 k2 r2", near(w["k2"]["answer"], math.sqrt(4)))
chk("0402 k3 a4", near(w["k3"]["answer"], math.sqrt(16)))
chk("0402 ch1 add16", near(w["ch1"]["answer"], complete(8)) and complete(8)==16)
chk("0402 rem add25", near(w["rem-co0402-k"]["answer"], complete(10)))

w=widgets(json.load(open(f"{BASE}/co-04-03.json")))
chk("0403 i1 a2", near(w["i1"]["answer"], math.sqrt(36/9)) and math.sqrt(4)==2)
chk("0403 k1 b3", near(w["k1"]["answer"], math.sqrt(9)))
chk("0403 k1b p2", near(w["k1b"]["answer"], 8/4))
chk("0403 k2 parab", cl(w["k2"]).startswith("the parabola"))
chk("0403 ch1 a3", near(w["ch1"]["answer"], math.sqrt(144/16)) and math.sqrt(9)==3)
chk("0403 rem a5", near(w["rem-co0403-k"]["answer"], math.sqrt(25)))

for lid in ("co-04-01","co-04-02","co-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
