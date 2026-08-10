"""Dual-route verifier for ti Ch3. Reads shipped JSON only."""
import json, sys, math
from fractions import Fraction as FQ
BASE="content/courses/trig-identities-equations/lessons"
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
def R(d): return math.radians(d)
# route B expansions independent of math.sin(sum)
def sinsum(A,B): return math.sin(R(A))*math.cos(R(B))+math.cos(R(A))*math.sin(R(B))
def cossum(A,B): return math.cos(R(A))*math.cos(R(B))-math.sin(R(A))*math.sin(R(B))
def sindiff(A,B): return math.sin(R(A))*math.cos(R(B))-math.cos(R(A))*math.sin(R(B))
def cosdiff(A,B): return math.cos(R(A))*math.cos(R(B))+math.sin(R(A))*math.sin(R(B))

w=widgets(json.load(open(f"{BASE}/ti-03-01.json")))
chk("31 i1 setup", cl(w["i1"]).startswith("sin45°cos30° + cos45°sin30°"))
chk("31 k1 sin75", near(w["k1"]["answer"],round(sinsum(45,30),4),0.0006) and near(sinsum(45,30),math.sin(R(75)),1e-12) and near(sinsum(45,30),(math.sqrt(6)+math.sqrt(2))/4,1e-12))
chk("31 k1b cos75", near(w["k1b"]["answer"],round(cossum(45,30),4),0.0006) and near(cossum(45,30),(math.sqrt(6)-math.sqrt(2))/4,1e-12))
chk("31 k2 cos15", near(w["k2"]["answer"],round(cosdiff(45,30),4),0.0006) and near(cosdiff(45,30),math.cos(R(15)),1e-12))
val=(FQ(3,5)*FQ(5,13)+FQ(4,5)*FQ(12,13))
chk("31 ch1 63/65", near(w["ch1"]["answer"],round(float(val),4),0.0006) and val==FQ(63,65))
chk("31 rem setup", cl(w["rem-ti0301-k"]).startswith("sin60°cos45° − cos60°sin45°"))

w=widgets(json.load(open(f"{BASE}/ti-03-02.json")))
chk("32 i1 denom", cl(w["i1"]).startswith("1 − tan A tan B"))
chk("32 k1 tan75", near(w["k1"]["answer"],round(math.tan(R(75)),3),0.0015) and near(math.tan(R(75)),2+math.sqrt(3),1e-9))
chk("32 k2 cofunc 56", cl(w["k2"])=="56°" and near(math.cos(R(34)),math.sin(R(56)),1e-12))
chk("32 k3 cosθ", cl(w["k3"]).startswith("cos θ") and near(math.sin(R(90))*1,1) and near(math.cos(R(90)),0,1e-12))
chk("32 ch1 tan15", near(w["ch1"]["answer"],round(math.tan(R(15)),3),0.0015) and near(math.tan(R(15)),2-math.sqrt(3),1e-9))
chk("32 rem 70", cl(w["rem-ti0302-k"])=="70°" and near(math.sin(R(20)),math.cos(R(70)),1e-12))

w=widgets(json.load(open(f"{BASE}/ti-03-03.json")))
chk("33 i1 sin50", cl(w["i1"])=="sin 50°" and near(sinsum(40,10),math.sin(R(50)),1e-12))
chk("33 k1 half", near(w["k1"]["answer"],cosdiff(80,20),0.006) and near(cosdiff(80,20),math.cos(R(60)),1e-12) and near(math.cos(R(60)),0.5))
chk("33 k2 −cosx", cl(w["k2"])=="−cos x" and all(near(math.cos(x+math.pi),-math.cos(x),1e-12) for x in (0.3,1.0,2.2)))
chk("33 k3 sin2x", cl(w["k3"])=="sin 2x" and all(near(math.sin(3*x)*math.cos(x)-math.cos(3*x)*math.sin(x),math.sin(2*x),1e-12) for x in (0.3,1.0)))
chk("33 ch1 sin45", near(w["ch1"]["answer"],round(sindiff(70,25),4),0.0006) and near(sindiff(70,25),math.sin(R(45)),1e-12))
chk("33 rem sin90", near(w["rem-ti0303-k"]["answer"],sinsum(50,40),0.006) and near(sinsum(50,40),1,1e-12))

for lid in ("ti-03-01","ti-03-02","ti-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
