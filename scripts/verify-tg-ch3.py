"""Dual-route verifier for tg Ch3. Reads shipped JSON only."""
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

w=widgets(json.load(open(f"{BASE}/tg-03-01.json")))
chk("31 i1 n=2", near(w["i1"]["answer"],2) and abs(math.cos(math.pi/2))<1e-12 and math.cos(math.pi/4)>0.7)
chk("31 k1 tan π/4=1", near(w["k1"]["answer"],math.tan(math.pi/4),1e-12) and near(math.sin(math.pi/4)/math.cos(math.pi/4),1,1e-12))
chk("31 k2 tan 5π/4=1", near(w["k2"]["answer"],math.tan(5*math.pi/4),1e-9) and near((-math.sqrt(2)/2)/(-math.sqrt(2)/2),1))
chk("31 k3 zeros kπ", cl(w["k3"]).startswith("At the multiples of π") and abs(math.tan(math.pi))<1e-12 and abs(math.tan(2*math.pi))<1e-12)
walls=[math.pi/2+k*math.pi for k in range(0,5) if math.pi/2+k*math.pi<3*math.pi]
chk("31 ch1 3 walls", near(w["ch1"]["answer"],len(walls)) and all(abs(math.cos(wx))<1e-12 for wx in walls))
chk("31 rem zero", cl(w["rem-tg0301-k"])=="zero" and abs(math.tan(math.pi))<1e-12 and abs(math.cos(math.pi)+1)<1e-12)

w=widgets(json.load(open(f"{BASE}/tg-03-02.json")))
chk("32 i1 1.73", near(w["i1"]["answer"],round(math.tan(math.pi/3),2),0.006) and near(math.tan(math.pi/3),math.sqrt(3),1e-12))
chk("32 k1 0.58", near(w["k1"]["answer"],round(math.tan(math.pi/6),2),0.006) and near(math.tan(math.pi/6),1/math.sqrt(3),1e-12))
chk("32 k2 +48", cl(w["k2"]).startswith("+48") and 40<math.tan(1.55)<60 and math.cos(1.55)>0 and math.tan(1.60)<0)
chk("32 k3 −1", cl(w["k3"])=="−1" and near(math.tan(3*math.pi/4),-1,1e-12))
chk("32 ch1 x=1.5", cl(w["ch1"])=="x = 1.5" and math.tan(1.5)>math.tan(1.3)>math.tan(1.0) and math.tan(1.5)>14)
chk("32 rem 1", near(w["rem-tg0302-k"]["answer"],math.tan(5*math.pi/4),1e-9))

w=widgets(json.load(open(f"{BASE}/tg-03-03.json")))
t2=lambda x:math.tan(2*x)
chk("33 i1 n=2", near(w["i1"]["answer"],2) and all(abs(t2(x+math.pi/2)-t2(x))<1e-6 for x in [0.1,0.3,0.6] ))
chk("33 k1 wall π/4", cl(w["k1"])=="x = π/4" and abs(math.cos(2*math.pi/4))<1e-12)
chk("33 k2 steepen", cl(w["k2"]).startswith("Steepens") and near(3*math.tan(math.pi/4),3,1e-12))
chk("33 k3 y=3", near(w["k3"]["answer"],3*math.tan(2*math.pi/8),1e-12))
chk("33 ch1 n=3", near(w["ch1"]["answer"],3) and abs(math.cos(2*math.pi/3-math.pi/6))<1e-12 and abs(math.pi/2+math.pi/6-2*math.pi/3)<1e-15)
chk("33 rem n=3", near(w["rem-tg0303-k"]["answer"],3) and all(abs(math.tan(3*(x+math.pi/3))-math.tan(3*x))<1e-6 for x in [0.05,0.2]))

for lid in ("tg-03-01","tg-03-02","tg-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
