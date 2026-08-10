"""Dual-route verifier for function-analysis Ch4. Reads shipped JSON only."""
import json, sys, math
from fractions import Fraction as Fr
BASE="content/courses/function-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)
def correct_label(W): return [o for o in W["options"] if o.get("correct")][0]["label"]

f=lambda x:2*x-1; g=lambda x:x*x
# route B evaluators: substituted composite rules
fog=lambda x:2*x*x-1; gof=lambda x:(2*x-1)**2

w=widgets(json.load(open(f"{BASE}/fna-04-01.json")))
chk("41 i1 f(g(3))", near(w["i1"]["answer"], f(g(3))) and near(w["i1"]["answer"], fog(3)))
chk("41 k1 g(f(3))", near(w["k1"]["answer"], g(f(3))) and near(w["k1"]["answer"], gof(3)))
chk("41 k2 f(g(4))", near(w["k2"]["answer"], f(g(4))) and near(w["k2"]["answer"], fog(4)))
chk("41 k3 rule mcq", correct_label(w["k3"])=="2x² − 1" and fog(10)==2*100-1)
chk("41 ch1 g(f(g(2)))", near(w["ch1"]["answer"], g(f(g(2)))) and near(w["ch1"]["answer"], gof(g(2))))
chk("41 rem f(g(5))", near(w["rem-fna0401-k"]["answer"], f(g(5))) and near(w["rem-fna0401-k"]["answer"], fog(5)))

w=widgets(json.load(open(f"{BASE}/fna-04-02.json")))
chk("42 i1 root floor", near(w["i1"]["answer"],2) and (2-2==0) and not (1.999-2>=0))
chk("42 k1 domain x>2", correct_label(w["k1"])=="x > 2")
# route B: sample the composite 1/sqrt(x-2)
def defined(x):
    try: return 1/math.sqrt(x-2)>-math.inf
    except (ValueError,ZeroDivisionError): return False
chk("42 k1 sample-consistent", not defined(2) and defined(2.01) and not defined(1.9))
chk("42 k2 cap 5", near(w["k2"]["answer"],5) and 5-5==0 and 5-5.01<0)
chk("42 k3 simplify-lie", correct_label(w["k3"]).startswith("x ≥ 0"))
def d2(x):
    try: return 1/(math.sqrt(x-3)-2)
    except (ValueError,ZeroDivisionError): return None
chk("42 ch1 excluded=7", near(w["ch1"]["answer"],7) and d2(7) is None and d2(6.99) is not None and d2(7.01) is not None and math.isclose(math.sqrt(7-3),2))
chk("42 rem excluded=4", near(w["rem-fna0402-k"]["answer"],4) and math.sqrt(4-4)==0)

w=widgets(json.load(open(f"{BASE}/fna-04-03.json")))
chk("43 i1 inner=3x+1", correct_label(w["i1"])=="g(x) = 3x + 1")
chk("43 k1 2401", near(w["k1"]["answer"], (3*2+1)**4) and near(w["k1"]["answer"], 7*7*7*7))
chk("43 k2 36pi", near(w["k2"]["answer"], (2*3)**2) and near(w["k2"]["answer"]*math.pi, math.pi*36))
chk("43 k3 C(g(m))", correct_label(w["k3"])=="C(g(m))")
chk("43 ch1 56", near(w["ch1"]["answer"], 4*(3*4+2)) and near(w["ch1"]["answer"], 12*4+8))
chk("43 rem inner=x+6", correct_label(w["rem-fna0403-k"])=="g(x) = x + 6" and math.isclose(math.sqrt(3+6),3))

for lid in ("fna-04-01","fna-04-02","fna-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap {e['value']} outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))

print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
