"""Dual-route verifier for pp Ch1. Reads shipped JSON only."""
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
# route B: independent polar<->rect
def toRect(r,th): return (r*math.cos(th), r*math.sin(th))
def toPolar(x,y):
    r=math.hypot(x,y); th=math.atan2(y,x)
    return r,th

w=widgets(json.load(open(f"{BASE}/pp-01-01.json")))
chk("11 i1 up", cl(w["i1"]).startswith("3 units up") and near(toRect(3,math.pi/2)[1],3,1e-12) and near(toRect(3,math.pi/2)[0],0,1e-12))
chk("11 k1 (−2,0)", cl(w["k1"])=="(−2, 0)" and near(toRect(2,math.pi)[0],-2,1e-12) and near(toRect(2,math.pi)[1],0,1e-12))
chk("11 k2 (2,π)", cl(w["k2"])=="(2, π)" and near(toRect(-2,0)[0],toRect(2,math.pi)[0],1e-12) and near(toRect(-2,0)[1],toRect(2,math.pi)[1],1e-12))
# (4,7π/6) is the NOT-same one
same=lambda a,b: near(toRect(*a)[0],toRect(*b)[0],1e-9) and near(toRect(*a)[1],toRect(*b)[1],1e-9)
chk("11 k3 not-same 7π/6", cl(w["k3"])=="(4, 7π/6)" and not same((4,math.pi/6),(4,7*math.pi/6)) and same((4,math.pi/6),(4,13*math.pi/6)) and same((4,math.pi/6),(-4,7*math.pi/6)))
chk("11 ch1 (−3,−π/4)", cl(w["ch1"])=="(−3, −π/4)" and same((3,3*math.pi/4),(-3,-math.pi/4)))
chk("11 rem (0,1)", cl(w["rem-pp0101-k"])=="(0, 1)" and near(toRect(1,math.pi/2)[1],1,1e-12))

w=widgets(json.load(open(f"{BASE}/pp-01-02.json")))
chk("12 i1 x=2", near(w["i1"]["answer"],toRect(4,math.pi/3)[0],0.006) and near(toRect(4,math.pi/3)[0],2,1e-12))
chk("12 k1 y=2√3", near(w["k1"]["answer"],round(toRect(4,math.pi/3)[1],4),0.0006) and near(toRect(4,math.pi/3)[1],2*math.sqrt(3),1e-12))
chk("12 k2 x=−√2", near(w["k2"]["answer"],round(toRect(2,3*math.pi/4)[0],4),0.0006) and near(toRect(2,3*math.pi/4)[0],-math.sqrt(2),1e-12))
chk("12 k3 y=−1.5", near(w["k3"]["answer"],toRect(-3,math.pi/6)[1],0.006) and near(toRect(-3,math.pi/6)[1],-1.5,1e-12))
xx,yy=toRect(6,2*math.pi/3)
chk("12 ch1 x+y", near(w["ch1"]["answer"],round(xx+yy,4),0.0011) and near(xx,-3,1e-12) and near(yy,3*math.sqrt(3),1e-12))
chk("12 rem x=5", near(w["rem-pp0102-k"]["answer"],toRect(5,0)[0],1e-9))

w=widgets(json.load(open(f"{BASE}/pp-01-03.json")))
chk("13 i1 r=2", near(w["i1"]["answer"],toPolar(1,math.sqrt(3))[0],0.006) and near(toPolar(1,math.sqrt(3))[0],2,1e-12))
chk("13 k1 π/3", cl(w["k1"])=="π/3" and near(toPolar(1,math.sqrt(3))[1],math.pi/3,1e-12))
# Q2 point: atan2 gives 2π/3 directly; content teaches arctan+π=2π/3
chk("13 k2 2π/3", cl(w["k2"])=="2π/3" and near(toPolar(-1,math.sqrt(3))[1],2*math.pi/3,1e-12) and near(math.atan(math.sqrt(3)/-1)+math.pi,2*math.pi/3,1e-12))
chk("13 k3 5π/4", cl(w["k3"])=="5π/4" and near(toPolar(-1,-1)[1]%(2*math.pi),5*math.pi/4,1e-9) and near(math.atan(1)+math.pi,5*math.pi/4,1e-12))
r_,th_=toPolar(-2*math.sqrt(3),2)
chk("13 ch1 r+θ", near(w["ch1"]["answer"],round(r_+th_,4),0.0011) and near(r_,4,1e-12) and near(th_,5*math.pi/6,1e-12))
chk("13 rem r=5", near(w["rem-pp0103-k"]["answer"],toPolar(3,4)[0],1e-9) and near(toPolar(3,4)[0],5,1e-12))

for lid in ("pp-01-01","pp-01-02","pp-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
