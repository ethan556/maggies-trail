"""Dual-route verifier for co Ch5 (eccentricity + orbits). Independent recompute vs shipped."""
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
def etype(e):
    if e==0: return "circle"
    if e<1: return "ellipse"
    if e==1: return "parabola"
    return "hyperbola"

w=widgets(json.load(open(f"{BASE}/co-05-01.json")))
chk("0501 i1 ellipse", cl(w["i1"])=="ellipse" and etype(0.5)=="ellipse")
chk("0501 k1 parab1", cl(w["k1"]).startswith("exactly e = 1") and etype(1)=="parabola")
chk("0501 k2 hyper", cl(w["k2"])=="hyperbola" and etype(1.5)=="hyperbola")
chk("0501 k3 e08", near(w["k3"]["answer"], 4/5) and 0<4/5<1)
chk("0501 ch1 order", cl(w["ch1"]).startswith("circle, ellipse, parabola, hyperbola"))
chk("0501 rem ellipse", cl(w["rem-co0501-k"])=="ellipse" and etype(0.3)=="ellipse")

w=widgets(json.load(open(f"{BASE}/co-05-02.json")))
chk("0502 i1 parab", cl(w["i1"])=="the parabola")
chk("0502 k1 smaller", cl(w["k1"]).startswith("smaller"))
chk("0502 k2 dir625", near(w["k2"]["answer"], 5/0.8) and near(5/0.8,6.25))
chk("0502 k3 ratio08", near(w["k3"]["answer"], 1/1.25) and near(1/1.25,0.8))
chk("0502 ch1 e167", near(w["ch1"]["answer"], round(5/3,2),0.011) and 5/3>1)
chk("0502 rem dir8", near(w["rem-co0502-k"]["answer"], 4/0.5))

w=widgets(json.load(open(f"{BASE}/co-05-03.json")))
chk("0503 i1 focus", cl(w["i1"])=="one focus")
chk("0503 k1 circle", cl(w["k1"]).startswith("nearly a perfect circle") and 0<0.017<1)
chk("0503 k1b unbound", cl(w["k1b"]).startswith("pass once") and 1.2>1)
chk("0503 k2 parab", cl(w["k2"])=="parabola")
chk("0503 ch1 ellipse", cl(w["ch1"]).startswith("a very elongated ellipse") and 0.97<1)
chk("0503 rem bound", cl(w["rem-co0503-k"]).startswith("a bound ellipse") and 0.5<1)

for lid in ("co-05-01","co-05-02","co-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
