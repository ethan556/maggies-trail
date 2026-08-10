"""Dual-route verifier for pp Ch2. Reads shipped JSON only."""
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
# route B utilities
def petals(n):
    dirs=set()
    for k in range(2*n):
        th=k*math.pi/n; r=math.cos(n*th)
        d=th if r>0 else th+math.pi
        dirs.add(round(d%(2*math.pi),6))
    return len(dirs)
def maxr(a,b): return a+abs(b)
def shape(a,b):
    ra=a/abs(b)
    return "loop" if ra<1 else "cardioid" if abs(ra-1)<1e-12 else "dimpled" if ra<2 else "convex"

w=widgets(json.load(open(f"{BASE}/pp-02-01.json")))
chk("21 i1 circle r3", cl(w["i1"]).startswith("A circle of radius 3"))
# r=2cosθ → center (1,0) r=1 (independent geometric check)
def on_circle(a,b,cx,cy,rad):
    for i in range(360):
        th=math.radians(i); r=a*math.cos(th)+b*math.sin(th); x,y=r*math.cos(th),r*math.sin(th)
        if abs((x-cx)**2+(y-cy)**2-rad**2)>1e-9: return False
    return True
chk("21 k1 (1,0) r1", cl(w["k1"]).startswith("A circle of radius 1 centered at (1, 0)") and on_circle(2,0,1,0,1))
chk("21 k2 center (0,2)", cl(w["k2"])=="(0, 2)" and on_circle(0,4,0,2,2))
chk("21 k3 pole π/2", cl(w["k3"])=="θ = π/2" and near(2*math.cos(math.pi/2),0,1e-12))
chk("21 ch1 radius 3", near(w["ch1"]["answer"],3) and on_circle(0,6,0,3,3))
chk("21 rem origin5", cl(w["rem-pp0201-k"]).startswith("A circle of radius 5"))

w=widgets(json.load(open(f"{BASE}/pp-02-02.json")))
chk("22 i1 3 petals", near(w["i1"]["answer"],petals(3)) and petals(3)==3)
chk("22 k1 8 petals", near(w["k1"]["answer"],petals(4)) and petals(4)==8)
chk("22 k2 len5", near(w["k2"]["answer"],5) and abs(5*math.cos(0))==5)
chk("22 k3 5petals len3", cl(w["k3"]).startswith("5 petals, each 3") and petals(5)==5)
chk("22 ch1 42", near(w["ch1"]["answer"],petals(7)*6) and petals(7)==7)
chk("22 rem 4", near(w["rem-pp0202-k"]["answer"],petals(2)) and petals(2)==4)

w=widgets(json.load(open(f"{BASE}/pp-02-03.json")))
chk("23 i1 loop", cl(w["i1"]).startswith("Inner loop") and shape(1,2)=="loop")
chk("23 k1 cardioid", cl(w["k1"])=="r = 3 + 3 cos θ" and shape(3,3)=="cardioid")
chk("23 k2 max5", near(w["k2"]["answer"],maxr(2,3)) and maxr(2,3)==5)
chk("23 k3 convex", cl(w["k3"]).startswith("Convex") and shape(5,2)=="convex")
chk("23 ch1 max8", near(w["ch1"]["answer"],maxr(4,4)) and shape(4,4)=="cardioid")
chk("23 rem cardioid", cl(w["rem-pp0203-k"])=="Cardioid" and shape(2,2)=="cardioid")

for lid in ("pp-02-01","pp-02-02","pp-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
