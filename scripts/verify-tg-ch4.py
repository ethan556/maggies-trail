"""Dual-route verifier for tg Ch4. Reads shipped JSON only."""
import json, sys, math
BASE="content/courses/trig-graphs-inverses/lessons"
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
IN=lambda v,a,b: a-1e-12<=v<=b+1e-12

w=widgets(json.load(open(f"{BASE}/tg-04-01.json")))
chk("41 i1 n=6", near(w["i1"]["answer"],6) and near(math.asin(0.5),math.pi/6,1e-12) and near(math.sin(math.pi/6),0.5,1e-12))
chk("41 k1 outside branch", cl(w["k1"]).startswith("5π/6 is outside") and near(math.sin(5*math.pi/6),0.5,1e-12) and not IN(5*math.pi/6,-math.pi/2,math.pi/2))
chk("41 k2 −π/6", cl(w["k2"])=="−π/6" and near(math.asin(-0.5),-math.pi/6,1e-12) and IN(-math.pi/6,-math.pi/2,math.pi/2))
def asin_ok(v):
    try: math.asin(v); return True
    except ValueError: return False
chk("41 k3 undef", cl(w["k3"]).startswith("Undefined") and not asin_ok(2) and max(math.sin(i/100) for i in range(0,700))<=1)
chk("41 ch1 n=2", near(w["ch1"]["answer"],2) and near(math.asin(1),math.pi/2,1e-12))
chk("41 rem 0", near(w["rem-tg0401-k"]["answer"],math.asin(0),0.006))

w=widgets(json.load(open(f"{BASE}/tg-04-02.json")))
chk("42 i1 π/3", cl(w["i1"])=="π/3" and near(math.acos(0.5),math.pi/3,1e-12))
chk("42 k1 straddle", cl(w["k1"]).startswith("Cosine peaks at 0") and near(math.cos(-math.pi/3),math.cos(math.pi/3),1e-12))
chk("42 k2 2π/3", cl(w["k2"])=="2π/3" and near(math.acos(-0.5),2*math.pi/3,1e-12) and IN(2*math.pi/3,0,math.pi))
chk("42 k3 n=4", near(w["k3"]["answer"],4) and near(math.atan(1),math.pi/4,1e-12))
chk("42 ch1 HA", cl(w["ch1"]).startswith("It approaches π/2") and math.atan(1000)<math.pi/2 and math.pi/2-math.atan(1000)<0.002)
chk("42 rem 3.14", near(w["rem-tg0402-k"]["answer"],round(math.acos(-1),2),0.006))

w=widgets(json.load(open(f"{BASE}/tg-04-03.json")))
chk("43 i1 swap", cl(w["i1"])=="(1/2, π/6)" and near(math.asin(0.5),math.pi/6,1e-12))
chk("43 k1 arccos(1)=0", near(w["k1"]["answer"],math.acos(1),0.006))
vals=[math.acos(i/10-1) for i in range(0,21)]
chk("43 k2 descends", cl(w["k2"]).startswith("decreases from π to 0") and all(vals[i]>vals[i+1] for i in range(20)) and near(vals[0],math.pi,1e-12) and near(vals[-1],0,1e-12))
chk("43 k3 1.5 ok", cl(w["k3"]).startswith("1.5") and 1.5<math.pi/2<2 and near(math.atan(math.tan(1.5)),1.5,1e-9))
chk("43 ch1 arccos", cl(w["ch1"])=="arccos" and near(math.acos(0),math.pi/2,1e-12) and math.asin(0)==0 and math.atan(0)==0)
chk("43 rem (1,π/4)", cl(w["rem-tg0403-k"])=="(1, π/4)" and near(math.atan(1),math.pi/4,1e-12) and near(math.atan(-1),-math.pi/4,1e-12))

for lid in ("tg-04-01","tg-04-02","tg-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
