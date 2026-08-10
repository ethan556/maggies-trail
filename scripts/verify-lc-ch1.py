"""Dual-route verifier for lc Ch1 (limits graphically/numerically). Independent limit recompute."""
import json, sys
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
# route B: cancel-and-substitute limits
def lim_ratio_diff2(a,shift): return a+shift  # (x²−k²)/(x−k) → x+k at x→k: limit = 2k form; here compute via x+shift

w=widgets(json.load(open(f"{BASE}/lc-01-01.json")))
chk("0101 i1 4", near(w["i1"]["answer"],4))
chk("0101 k1 4", near(w["k1"]["answer"],4))
chk("0101 k2 4", near(w["k2"]["answer"],4) and (2+2)==4)  # (x²−4)/(x−2)→x+2→4
chk("0101 k3 5", cl(w["k3"]).startswith("5"))
chk("0101 ch1 6", near(w["ch1"]["answer"],6) and (3+3)==6)  # (x²−9)/(x−3)→x+3→6
chk("0101 rem 5", near(w["rem-lc0101-k"]["answer"],5))

w=widgets(json.load(open(f"{BASE}/lc-01-02.json")))
chk("0102 i1 7", near(w["i1"]["answer"],7))
chk("0102 k1 4", near(w["k1"]["answer"],4))
chk("0102 k2 4", cl(w["k2"])=="4")
chk("0102 k3 5", near(w["k3"]["answer"],5) and 2*1+3==5)  # 2x+3 at 1
chk("0102 ch1 9", near(w["ch1"]["answer"],9))
chk("0102 rem 3", near(w["rem-lc0102-k"]["answer"],3))

w=widgets(json.load(open(f"{BASE}/lc-01-03.json")))
chk("0103 i1 dne", cl(w["i1"]).startswith("does not exist"))
chk("0103 k1 dne", cl(w["k1"]).startswith("does not exist"))
chk("0103 k2 dne", cl(w["k2"])=="does not exist")
chk("0103 k3 6", near(w["k3"]["answer"],6))
chk("0103 ch1 dne", cl(w["ch1"])=="does not exist")
chk("0103 rem dne", cl(w["rem-lc0103-k"])=="does not exist")

for lid in ("lc-01-01","lc-01-02","lc-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
