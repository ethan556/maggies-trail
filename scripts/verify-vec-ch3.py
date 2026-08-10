"""Dual-route verifier for vec Ch3 (dot product). Independent recompute vs shipped answers."""
import json, sys, math
BASE="content/courses/vectors-matrices/lessons"
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
dot=lambda u,v:u[0]*v[0]+u[1]*v[1]; mg=lambda v:math.hypot(*v)
ang=lambda u,v: math.degrees(math.acos(max(-1,min(1,dot(u,v)/(mg(u)*mg(v))))))

w=widgets(json.load(open(f"{BASE}/vec-03-01.json")))
chk("0301 i1 11", near(w["i1"]["answer"],dot((3,4),(1,2))) and dot((3,4),(1,2))==11)
chk("0301 k1 11", near(w["k1"]["answer"],dot((2,3),(4,1))))
chk("0301 k2 0", near(w["k2"]["answer"],dot((3,4),(4,-3))) and dot((3,4),(4,-3))==0)
chk("0301 k3 obtuse", cl(w["k3"]).startswith("greater than 90") and dot((1,0),(-2,5))<0)
chk("0301 ch1 0", near(w["ch1"]["answer"],dot((2,6),(6,-2))) and dot((2,6),(6,-2))==0)
chk("0301 rem 11", near(w["rem-vec0301-k"]["answer"],dot((1,2),(3,4))))

w=widgets(json.load(open(f"{BASE}/vec-03-02.json")))
chk("0302 i1 90", near(w["i1"]["answer"],ang((1,0),(0,1))) and near(ang((1,0),(0,1)),90))
chk("0302 k1 45", near(w["k1"]["answer"],ang((1,0),(1,1))) and near(ang((1,0),(1,1)),45))
chk("0302 k2 0", near(w["k2"]["answer"],ang((2,2),(3,3))) and near(ang((2,2),(3,3)),0,1e-6))
chk("0302 k3 60", near(w["k3"]["answer"],ang((1,math.sqrt(3)),(1,0))) and near(ang((1,math.sqrt(3)),(1,0)),60))
chk("0302 ch1 5313", near(w["ch1"]["answer"],round(ang((3,4),(5,0)),2),0.06) and near(ang((3,4),(5,0)),53.13010235,1e-4))
chk("0302 rem 90", near(w["rem-vec0302-k"]["answer"],ang((1,0),(0,1))))

w=widgets(json.load(open(f"{BASE}/vec-03-03.json")))
chk("0303 i1 60", near(w["i1"]["answer"],dot((6,8),(10,0))) and dot((6,8),(10,0))==60)
chk("0303 k1 0", near(w["k1"]["answer"],dot((0,5),(4,0))))
chk("0303 k1b 15", near(w["k1b"]["answer"],dot((5,0),(3,0))))
chk("0303 k2 15", near(w["k2"]["answer"],dot((3,4),(5,0))) and dot((3,4),(5,0))==15)
chk("0303 ch1 -24", near(w["ch1"]["answer"],dot((-4,0),(6,0))) and dot((-4,0),(6,0))==-24)
chk("0303 rem 14", near(w["rem-vec0303-k"]["answer"],dot((2,0),(7,0))))

for lid in ("vec-03-01","vec-03-02","vec-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
