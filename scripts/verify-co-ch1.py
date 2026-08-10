"""Dual-route verifier for co Ch1 (parabolas). Independent focus-directrix recompute vs shipped."""
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
dist=lambda a,b: math.hypot(a[0]-b[0],a[1]-b[1])
# route B: focus-directrix distances, p from x^2=4py
def p_from_4p(fourp): return fourp/4

w=widgets(json.load(open(f"{BASE}/co-01-01.json")))
# slider i1: target p=3, focus reaches (0,3)
chk("0101 i1 slider tgt3", w["i1"]["target"]==3 and w["i1"]["conicKind"]=="parabola")
# k1: point (2,1), focus (0,1), directrix y=-1 -> dist to directrix = 2
chk("0101 k1 ddir2", near(w["k1"]["answer"], 1-(-1)) and near(dist((2,1),(0,1)), 1-(-1)))
chk("0101 k2 p3", near(w["k2"]["answer"], p_from_4p(12)))
chk("0101 k3 focus02", cl(w["k3"])=="(0, 2)" and near(p_from_4p(8),2))
# ch1: (4,4) on x^2=4y, dist to focus (0,1)=5, dist to directrix=5
chk("0101 ch1 dfocus5", near(w["ch1"]["answer"], dist((4,4),(0,1))) and near(dist((4,4),(0,1)),5) and near(4-(-1),5))
chk("0101 rem p2", near(w["rem-co0101-k"]["answer"], p_from_4p(8)))

w=widgets(json.load(open(f"{BASE}/co-01-02.json")))
chk("0102 i1 vertex", cl(w["i1"])=="(2, −1)")
chk("0102 k1 focus21", cl(w["k1"])=="(2, 1)")  # vertex (2,-1)+p2 = (2,1)
chk("0102 k2 left", cl(w["k2"])=="Left")
chk("0102 k3 dir2", near(w["k3"]["answer"], 3-1))  # k-p = 3-1
chk("0102 ch1 focusY5", near(w["ch1"]["answer"], 2+p_from_4p(12)))  # k+p=2+3
chk("0102 rem vertex41", cl(w["rem-co0102-k"])=="(4, 1)")

w=widgets(json.load(open(f"{BASE}/co-01-03.json")))
chk("0103 i1 focus", cl(w["i1"])=="At the focus")
chk("0103 k1 p2", near(w["k1"]["answer"], p_from_4p(8)))
chk("0103 k1b p3", near(w["k1b"]["answer"], p_from_4p(12)))
chk("0103 k2 parallel", cl(w["k2"])=="A parallel beam of light")
chk("0103 ch1 p5", near(w["ch1"]["answer"], p_from_4p(20)))
chk("0103 rem focus", cl(w["rem-co0103-k"])=="Focus")

for lid in ("co-01-01","co-01-02","co-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
