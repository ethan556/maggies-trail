"""Dual-route verifier for ti Ch2. Reads shipped JSON only."""
import json, sys, math
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
# route B: pick a concrete angle realizing sin=3/5,cos=4/5
th=math.atan2(3,4)
assert near(math.sin(th),0.6) and near(math.cos(th),0.8)

w=widgets(json.load(open(f"{BASE}/ti-02-01.json")))
chk("21 i1 sec 1.25", near(w["i1"]["answer"],1/(4/5),1e-9))
chk("21 k1 csc", cl(w["k1"])=="csc θ" and near(1/math.sin(th),1/0.6,1e-9))
chk("21 k2 cot 1.33", near(w["k2"]["answer"],round((4/5)/(3/5),2),0.006) and near(math.cos(th)/math.sin(th),4/3,1e-9) and near(1/math.tan(th),4/3,1e-9))
chk("21 k3 cot", cl(w["k3"])=="cot θ" and near(math.cos(th)*(1/math.sin(th)),math.cos(th)/math.sin(th),1e-9))
chk("21 ch1 2", near(w["ch1"]["answer"],2) and near(math.tan(th)*(1/math.tan(th)),1,1e-9) and near(1+math.cos(0),2))
chk("21 rem 2", near(w["rem-ti0201-k"]["answer"],1/0.5))

w=widgets(json.load(open(f"{BASE}/ti-02-02.json")))
chk("22 i1 sec² 1.5625", near(w["i1"]["answer"],(3/4)**2+1,1e-9) and near((3/4)**2+1,25/16))
chk("22 k1 sec 1.25", near(w["k1"]["answer"],math.sqrt(25/16),0.006))
chk("22 k2 cot²", cl(w["k2"])=="cot²θ" and all(near((1/math.sin(x))**2-1,(1/math.tan(x))**2,1e-6) for x in (0.5,1.0,2.0)))
chk("22 k3 one", cl(w["k3"])=="1" and all(near(math.sin(x)**2*(1+(1/math.tan(x))**2),1,1e-6) for x in (0.5,1.0,2.0)))
chk("22 ch1 tan² π/4 =1", near(w["ch1"]["answer"],1) and all(near((1-math.cos(x)**2)*(1/math.cos(x))**2,math.tan(x)**2,1e-6) for x in (0.3,1.0)) and near(math.tan(math.pi/4)**2,1,1e-9))
chk("22 rem cos²", cl(w["rem-ti0202-k"])=="cos²θ" and all(near(1-math.sin(x)**2,math.cos(x)**2,1e-9) for x in (0.3,1.0,2.0)))

w=widgets(json.load(open(f"{BASE}/ti-02-03.json")))
chk("23 i1 rewrite tan", cl(w["i1"]).startswith("Rewrite tan θ") and all(near(math.tan(x)*math.cos(x),math.sin(x),1e-9) for x in (0.3,1.0)))
chk("23 k1 sinθ", cl(w["k1"]).startswith("sin θ"))
chk("23 k2 replace", cl(w["k2"]).startswith("Replace sec²θ − 1") and all(near((1/math.cos(x))**2-1,math.tan(x)**2,1e-6) for x in (0.3,1.0)))
chk("23 k3 1.73", near(w["k3"]["answer"],round(math.tan(math.pi/3),2),0.006) and near(((1/math.cos(math.pi/3))**2-1)/math.tan(math.pi/3),math.tan(math.pi/3),1e-9))
chk("23 ch1 0.87", near(w["ch1"]["answer"],round(math.cos(math.pi/6),2),0.006) and all(near((1/math.tan(x))*math.sin(x),math.cos(x),1e-9) for x in (0.3,1.0)))
chk("23 rem 1/cos", cl(w["rem-ti0203-k"]).startswith("1/cos θ") and all(near((1/math.cos(x))*math.cos(x),1,1e-12) for x in (0.3,1.0)))

for lid in ("ti-02-01","ti-02-02","ti-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
