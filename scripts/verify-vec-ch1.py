"""Dual-route verifier for vec Ch1. Independent recompute vs shipped answers."""
import json, sys, math
BASE="content/courses/vectors-matrices/lessons"
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
mag=lambda a,b: math.hypot(a,b)
ang=lambda a,b: math.degrees(math.atan2(b,a))%360

w=widgets(json.load(open(f"{BASE}/vec-01-01.json")))
chk("0101 i1 mag5", near(w["i1"]["answer"],mag(3,4)) and mag(3,4)==5)
chk("0101 k1 mag5neg", near(w["k1"]["answer"],mag(-3,4)) and mag(-3,4)==5)
chk("0101 k2 mag10", near(w["k2"]["answer"],mag(6,8)) and mag(6,8)==10)
chk("0101 k3 velocity", cl(w["k3"]).startswith("Velocity"))
chk("0101 ch1 mag13", near(w["ch1"]["answer"],mag(5,12)) and mag(5,12)==13)
chk("0101 rem mag5", near(w["rem-vec0101-k"]["answer"],mag(0,-5)))

w=widgets(json.load(open(f"{BASE}/vec-01-02.json")))
chk("0102 i1 60", near(w["i1"]["answer"],ang(1,math.sqrt(3))) and near(ang(1,math.sqrt(3)),60))
chk("0102 k1 12687", cl(w["k1"]).startswith("126.87") and near(ang(-3,4),126.8698976,1e-5))
chk("0102 k2 y5", near(w["k2"]["answer"],10*math.sin(math.radians(30))) and near(10*math.sin(math.radians(30)),5))
chk("0102 k3 x566", near(w["k3"]["answer"],round(8*math.cos(math.radians(45)),2),0.011) and near(8*math.cos(math.radians(45)),4*math.sqrt(2)))
chk("0102 ch1 225", near(w["ch1"]["answer"],ang(-1,-1)) and near(ang(-1,-1),225))
chk("0102 rem y6", near(w["rem-vec0102-k"]["answer"],6*math.sin(math.radians(90))))

w=widgets(json.load(open(f"{BASE}/vec-01-03.json")))
chk("0103 i1 mag5", near(w["i1"]["answer"],mag(4-1,6-2)) and mag(3,4)==5)
chk("0103 k1 3-4", cl(w["k1"])=="⟨3, −4⟩" and (1-(-2),1-5)==(3,-4))
chk("0103 k2 equal", cl(w["k2"]).startswith("From C(5, 5) to D(7, 8)") and (7-5,8-5)==(2,3))
chk("0103 k3 zero", cl(w["k3"]).startswith("⟨0, 0⟩"))
chk("0103 ch1 mag5", near(w["ch1"]["answer"],mag(0-3,3-(-1))) and mag(-3,4)==5)
chk("0103 rem 3-4", cl(w["rem-vec0103-k"])=="⟨3, 4⟩" and (5-2,5-1)==(3,4))

for lid in ("vec-01-01","vec-01-02","vec-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
