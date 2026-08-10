"""Dual-route verifier for lc Ch5 (derivative + series). Independent recompute (Fraction/limit) vs shipped."""
import json, sys, math
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
sq=lambda x:x*x
avg=lambda f,a,b:(f(b)-f(a))/(b-a)
geo=lambda a,r: FQ(a)/(1-FQ(r))

w=widgets(json.load(open(f"{BASE}/lc-05-01.json")))
chk("0501 i1 4", near(w["i1"]["answer"], avg(sq,1,3)) and avg(sq,1,3)==4)
chk("0501 k1 7", near(w["k1"]["answer"], avg(sq,2,5)) and avg(sq,2,5)==7)
chk("0501 k2 diffq", cl(w["k2"])=="difference quotient")
chk("0501 k3 5", near(w["k3"]["answer"], (sq(3)-sq(2))/1) and (sq(3)-sq(2))==5)
chk("0501 ch1 4.5", near(w["ch1"]["answer"], (sq(2.5)-sq(2))/0.5) and near((sq(2.5)-sq(2))/0.5,4.5))
chk("0501 rem 3", near(w["rem-lc0501-k"]["answer"], avg(sq,1,2)))

w=widgets(json.load(open(f"{BASE}/lc-05-02.json")))
chk("0502 i1 2a+h", cl(w["i1"])=="2a + h")
chk("0502 k1 2a", cl(w["k1"])=="2a")
chk("0502 k2 f'3=6", near(w["k2"]["answer"], 2*3) and 2*3==6)
chk("0502 k3 f'1=2", near(w["k3"]["answer"], 2*1))
chk("0502 ch1 f'5=10", near(w["ch1"]["answer"], 2*5) and 2*5==10)
chk("0502 rem f'4=8", near(w["rem-lc0502-k"]["answer"], 2*4))

w=widgets(json.load(open(f"{BASE}/lc-05-03.json")))
chk("0503 i1 15/16", near(w["i1"]["answer"], float(FQ(15,16))) and near(w["i1"]["answer"],0.9375))
chk("0503 k1 limit1", near(w["k1"]["answer"], 1) and float(geo(FQ(1,2),FQ(1,2)))==1)
chk("0503 k2 half", near(w["k2"]["answer"], float(geo(FQ(1,3),FQ(1,3)))) and geo(FQ(1,3),FQ(1,3))==FQ(1,2))
chk("0503 k3 exactly1", cl(w["k3"]).startswith("exactly 1") and geo(FQ(9,10),FQ(1,10))==1)
chk("0503 ch1 sum1", near(w["ch1"]["answer"], float(geo(FQ(3,4),FQ(1,4)))) and geo(FQ(3,4),FQ(1,4))==1)
chk("0503 rem sum1", near(w["rem-lc0503-k"]["answer"], float(geo(FQ(1,2),FQ(1,2)))))

for lid in ("lc-05-01","lc-05-02","lc-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
