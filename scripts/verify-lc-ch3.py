"""Dual-route verifier for lc Ch3 (one-sided + limits at infinity). Independent recompute."""
import json, sys
from fractions import Fraction as FQ
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
lead_ratio=lambda a,b: FQ(a,b)  # equal-degree limit at infinity

w=widgets(json.load(open(f"{BASE}/lc-03-01.json")))
chk("0301 i1 left3", near(w["i1"]["answer"], 2+1))
chk("0301 k1 right4", near(w["k1"]["answer"], 2**2))
chk("0301 k2 dne", cl(w["k2"]).startswith("does not exist") and 3!=4)
chk("0301 k3 six", near(w["k3"]["answer"], 6) and 2*3==6 and 3+3==6)
chk("0301 ch1 dne", cl(w["ch1"]).startswith("does not exist") and 1**2!=3*1)
chk("0301 rem left3", near(w["rem-lc0301-k"]["answer"], 4-1))

w=widgets(json.load(open(f"{BASE}/lc-03-02.json")))
chk("0302 i1 3", near(w["i1"]["answer"], lead_ratio(3,1)) and lead_ratio(3,1)==3)
chk("0302 k1 ha3", near(w["k1"]["answer"], 3))
chk("0302 k2 zero", near(w["k2"]["answer"], 0))   # deg num<den
chk("0302 k3 25", near(w["k3"]["answer"], lead_ratio(5,2)) and float(lead_ratio(5,2))==2.5)
chk("0302 ch1 ha2", near(w["ch1"]["answer"], lead_ratio(4,2)) and lead_ratio(4,2)==2)
chk("0302 rem 2", near(w["rem-lc0302-k"]["answer"], lead_ratio(6,3)))

w=widgets(json.load(open(f"{BASE}/lc-03-03.json")))
chk("0303 i1 posinf", cl(w["i1"]).startswith("grows without bound"))  # deg2>deg1
chk("0303 k1 lead7", cl(w["k1"]).startswith("the leading terms") and FQ(7,1)==7)
chk("0303 k2 neginf", cl(w["k2"]).startswith("→ −∞"))
chk("0303 k3 zero", cl(w["k3"]).startswith("0"))  # deg1<deg2
chk("0303 ch1 posinf", cl(w["ch1"]).startswith("grows without bound"))
chk("0303 rem posinf", cl(w["rem-lc0303-k"]).startswith("grows without bound"))

for lid in ("lc-03-01","lc-03-02","lc-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
