"""Dual-route verifier for co Ch2 (ellipses). Independent locus/abc recompute vs shipped."""
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
cE=lambda a,b: math.sqrt(a*a-b*b)   # ellipse c
dist=lambda P,Q: math.hypot(P[0]-Q[0],P[1]-Q[1])

w=widgets(json.load(open(f"{BASE}/co-02-01.json")))
chk("0201 i1 sum10", near(w["i1"]["answer"],10))
chk("0201 k1 sum10", near(w["k1"]["answer"], dist((5,0),(4,0))+dist((5,0),(-4,0))) and near(dist((5,0),(4,0))+dist((5,0),(-4,0)),10))
chk("0201 k2 a5", near(w["k2"]["answer"], math.sqrt(25)))
chk("0201 k3 horiz", cl(w["k3"]).startswith("horizontal") and 25>9)
chk("0201 ch1 2a10", near(w["ch1"]["answer"], 2*math.sqrt(25)))
chk("0201 rem a4", near(w["rem-co0201-k"]["answer"], math.sqrt(16)))

w=widgets(json.load(open(f"{BASE}/co-02-02.json")))
chk("0202 i1 c4", near(w["i1"]["answer"], cE(5,3)) and cE(5,3)==4)
chk("0202 k1 foci4", cl(w["k1"])=="(±4, 0)" and cE(5,3)==4)
chk("0202 k2 c5", near(w["k2"]["answer"], cE(13,12)) and cE(13,12)==5)
chk("0202 k3 b4", near(w["k3"]["answer"], math.sqrt(25-9)) and math.sqrt(25-9)==4)
chk("0202 ch1 c4", near(w["ch1"]["answer"], cE(5,3)))
chk("0202 rem c8", near(w["rem-co0202-k"]["answer"], cE(10,6)) and cE(10,6)==8)

w=widgets(json.load(open(f"{BASE}/co-02-03.json")))
chk("0203 i1 center", cl(w["i1"])=="(2, −1)")
chk("0203 k1 focus6", cl(w["k1"])=="(6, −1)" and (2+cE(5,3))==6)
chk("0203 k2 e08", near(w["k2"]["answer"], 4/5) and near(4/5,0.8))
chk("0203 k3 circle", cl(w["k3"]).startswith("almost a perfect circle"))
chk("0203 ch1 e038", near(w["ch1"]["answer"], round(cE(13,12)/13,2),0.011) and near(cE(13,12)/13,5/13))
chk("0203 rem e06", near(w["rem-co0203-k"]["answer"], 6/10))

for lid in ("co-02-01","co-02-02","co-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
