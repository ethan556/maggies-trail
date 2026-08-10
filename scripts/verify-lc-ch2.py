"""Dual-route verifier for lc Ch2 (limit laws + algebraic eval). Independent recompute."""
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
# route B independent evaluators
def poly_sub(coeffs,x): return sum(c*x**i for i,c in enumerate(coeffs))
def factor_lim(root,other): return root+other  # (x-root)(x+? ) canceled → evaluate remaining linear at root; pass remaining value directly
def rationalize(k): return 1/(math.sqrt(k)+math.sqrt(k))  # (√(x+k)-√k)/x → 1/(2√k) at 0

w=widgets(json.load(open(f"{BASE}/lc-02-01.json")))
chk("0201 i1 11", near(w["i1"]["answer"], 4**2-5))
chk("0201 k1 5", near(w["k1"]["answer"], 3+2))
chk("0201 k2 6", near(w["k2"]["answer"], 3*2))
chk("0201 k3 4", near(w["k3"]["answer"], 3**2-2*3+1))
chk("0201 ch1 -5", near(w["ch1"]["answer"], (2**2+1)/(2-3)) and (2**2+1)/(2-3)==-5)
chk("0201 rem 3", near(w["rem-lc0201-k"]["answer"], 4*1-1))

w=widgets(json.load(open(f"{BASE}/lc-02-02.json")))
chk("0202 i1 indet", cl(w["i1"]).startswith("the form is indeterminate"))
chk("0202 k1 -1", near(w["k1"]["answer"], 2-3))     # (x-2)(x-3)/(x-2)→x-3→-1
chk("0202 k2 5", near(w["k2"]["answer"], 2+3))      # (x+3)(x-2)/(x-2)→x+3→5
chk("0202 k3 4", near(w["k3"]["answer"], 2+2))      # (x-2)(x+2)/(x-2)→x+2→4
chk("0202 ch1 -1", near(w["ch1"]["answer"], 3-4))   # (x-3)(x-4)/(x-3)→x-4→-1
chk("0202 rem 2", near(w["rem-lc0202-k"]["answer"], 1+1))

w=widgets(json.load(open(f"{BASE}/lc-02-03.json")))
chk("0203 i1 conj", cl(w["i1"]).startswith("√(x + 4) + 2"))
chk("0203 k1 025", near(w["k1"]["answer"], rationalize(4)) and near(rationalize(4),0.25))
chk("0203 k2 0167", near(w["k2"]["answer"], round(rationalize(9),3),0.0011) and near(rationalize(9),1/6))
chk("0203 k3 conj", cl(w["k3"]).startswith("multiply by the conjugate"))
chk("0203 ch1 05", near(w["ch1"]["answer"], rationalize(1)) and near(rationalize(1),0.5))
chk("0203 rem 025", near(w["rem-lc0203-k"]["answer"], rationalize(4)))

for lid in ("lc-02-01","lc-02-02","lc-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
