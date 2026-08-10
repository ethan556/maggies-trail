"""Dual-route verifier for pp Ch4 (parametric equations). Independent recomputation vs shipped answers."""
import json, sys, math
BASE="content/courses/polar-parametric/lessons"
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

w=widgets(json.load(open(f"{BASE}/pp-04-01.json")))
chk("0401 i1 y4", near(w["i1"]["answer"],2*2))  # y=2t at t=2
chk("0401 k1 up-right", cl(w["k1"]).startswith("up and to the right"))
chk("0401 k2 ccw", cl(w["k2"])=="counterclockwise" and near(math.cos(0),1) and near(math.sin(math.pi/2),1))
chk("0401 k3 samex", cl(w["k3"]).startswith("Different t values") and (1)**2==(-1)**2)
chk("0401 ch1 x−2", near(w["ch1"]["answer"],2*math.cos(math.pi)) and near(2*math.cos(math.pi),-2))
chk("0401 rem x6", near(w["rem-pp0401-k"]["answer"],3*2))

w=widgets(json.load(open(f"{BASE}/pp-04-02.json")))
chk("0402 i1 2x−2", cl(w["i1"])=="y = 2x − 2" and all(near(2*t,2*(t+1)-2) for t in (-1,0,1,3)))
chk("0402 k1 yx2", cl(w["k1"])=="y = x²" and all(near(t*t,(t)**2) for t in (-2,1,2)))
chk("0402 k2 circle4", cl(w["k2"])=="x² + y² = 4" and all(near((2*math.cos(t))**2+(2*math.sin(t))**2,4) for t in (0.3,1.1,2.5)))
chk("0402 k3 ellipse", cl(w["k3"]).startswith("(x/3)² + (y/2)²") and all(near((3*math.cos(t)/3)**2+(2*math.sin(t)/2)**2,1) for t in (0.3,1.1,2.5)))
chk("0402 ch1 x9", near(w["ch1"]["answer"],3**2))
chk("0402 rem 3x", cl(w["rem-pp0402-k"])=="y = 3x")

w=widgets(json.load(open(f"{BASE}/pp-04-03.json")))
chk("0403 i1 line", cl(w["i1"]).startswith("x = t, y = 3t + 1"))
chk("0403 k1 r5", cl(w["k1"]).startswith("x = 5cos t, y = 5sin t") and all(near((5*math.cos(t))**2+(5*math.sin(t))**2,25) for t in (0.3,1.1)))
chk("0403 k2 cw", cl(w["k2"]).startswith("x = cos t, y = −sin t") and near(-math.sin(0.1),-(math.sin(0.1))))
chk("0403 k3 (0,−1)", cl(w["k3"])=="(0, −1)" and near(math.cos(math.pi/2),0) and near(-math.sin(math.pi/2),-1))
chk("0403 ch1 y3", near(w["ch1"]["answer"],3*math.sin(math.pi/2)) and near(3*math.sin(math.pi/2),3))
chk("0403 rem param", cl(w["rem-pp0403-k"]).startswith("x = t, y = t²"))

for lid in ("pp-04-01","pp-04-02","pp-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
