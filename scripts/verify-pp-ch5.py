"""Dual-route verifier for pp Ch5 (projectile parametrics). Independent physics recomputation vs shipped."""
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
g=10.0
# route B: independent kinematics
def X(vx,t): return vx*t
def Ypos(vy,t): return vy*t-0.5*g*t*t
def tpeak(vy): return vy/g
def hmax(vy): return vy**2/(2*g)
def flight(vy): return 2*vy/g
def rng(vx,vy): return vx*flight(vy)

w=widgets(json.load(open(f"{BASE}/pp-05-01.json")))
chk("0501 i1 x45", near(w["i1"]["answer"],X(15,3)))
chk("0501 k1 gravity", cl(w["k1"]).startswith("Gravity acts only vertically"))
chk("0501 k2 y15", near(w["k2"]["answer"],Ypos(20,1)) and near(Ypos(20,1),15))
chk("0501 k3 zero", cl(w["k3"])=="zero" and near(20-g*tpeak(20),0))
chk("0501 ch1 y20", near(w["ch1"]["answer"],Ypos(20,2)) and near(Ypos(20,2),20))
chk("0501 rem y5", near(w["rem-pp0501-k"]["answer"],Ypos(10,1)))

w=widgets(json.load(open(f"{BASE}/pp-05-02.json")))
chk("0502 i1 t2", near(w["i1"]["answer"],tpeak(20)))
chk("0502 k1 h20", near(w["k1"]["answer"],hmax(20)) and near(hmax(20),Ypos(20,tpeak(20))))
chk("0502 k2 flight4", near(w["k2"]["answer"],flight(20)))
chk("0502 k3 range60", near(w["k3"]["answer"],rng(15,20)))
chk("0502 ch1 range48", near(w["ch1"]["answer"],rng(8,30)) and near(rng(8,30),48))
chk("0502 rem tpeak4", near(w["rem-pp0502-k"]["answer"],tpeak(40)))

w=widgets(json.load(open(f"{BASE}/pp-05-03.json")))
chk("0503 i1 t=x/15", cl(w["i1"])=="t = x/15")
chk("0503 k1 downparab", cl(w["k1"]).startswith("a downward parabola"))
# path y=(4/3)x - x^2/45 ; land root x=60
def path(x): return (4/3)*x-(x*x)/45
chk("0503 k1b land60", near(w["k1b"]["answer"],60,0.5) and abs(path(60))<1e-9 and abs(path(0))<1e-12)
chk("0503 k2 peak30", near(w["k2"]["answer"],30) and near((0+60)/2,30))
chk("0503 ch1 h31.25", near(w["ch1"]["answer"],hmax(25),0.006) and near(hmax(25),31.25))
chk("0503 rem vertex20", near(w["rem-pp0503-k"]["answer"],(0+40)/2))

for lid in ("pp-05-01","pp-05-02","pp-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
