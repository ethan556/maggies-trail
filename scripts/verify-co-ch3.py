"""Dual-route verifier for co Ch3 (hyperbolas). Independent difference/asymptote recompute vs shipped."""
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
cH=lambda a,b: math.sqrt(a*a+b*b)   # hyperbola c
dist=lambda P,Q: math.hypot(P[0]-Q[0],P[1]-Q[1])

w=widgets(json.load(open(f"{BASE}/co-03-01.json")))
chk("0301 i1 diff6", near(w["i1"]["answer"],6))
chk("0301 k1 diff6", near(w["k1"]["answer"], abs(dist((3,0),(5,0))-dist((3,0),(-5,0)))) and near(abs(2-8),6))
chk("0301 k2 vert3", cl(w["k2"])=="(±3, 0)" and math.sqrt(9)==3)
chk("0301 k3 leftright", cl(w["k3"]).startswith("left and right"))
chk("0301 ch1 2a6", near(w["ch1"]["answer"], 2*math.sqrt(9)))
chk("0301 rem 2a10", near(w["rem-co0301-k"]["answer"], 2*math.sqrt(25)))

w=widgets(json.load(open(f"{BASE}/co-03-02.json")))
chk("0302 i1 slope43", cl(w["i1"])=="y = ±(4/3)x" and near(4/3, 4/3))
chk("0302 k1 b4", near(w["k1"]["answer"], math.sqrt(16)))
chk("0302 k2 c5", near(w["k2"]["answer"], cH(3,4)) and cH(3,4)==5)
chk("0302 k3 addsub", cl(w["k3"]).startswith("Hyperbola ADDS"))
chk("0302 ch1 slope075", near(w["ch1"]["answer"], 3/4) and near(3/4,0.75))
chk("0302 rem c5", near(w["rem-co0302-k"]["answer"], cH(4,3)))

w=widgets(json.load(open(f"{BASE}/co-03-03.json")))
chk("0303 i1 foci5", cl(w["i1"])=="(±5, 0)" and cH(3,4)==5)
chk("0303 i2 vertical", cl(w["i2"]).startswith("up and down"))
chk("0303 k1 vfoci", cl(w["k1"])=="(0, ±5)")
chk("0303 k2 e167", near(w["k2"]["answer"], round(5/3,2),0.011) and 5/3>1)
chk("0303 ch1 e125", near(w["ch1"]["answer"], cH(4,3)/4) and near(cH(4,3)/4,1.25))
chk("0303 rem e125", near(w["rem-co0303-k"]["answer"], 5/4))

for lid in ("co-03-01","co-03-02","co-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
