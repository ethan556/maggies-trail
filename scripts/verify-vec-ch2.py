"""Dual-route verifier for vec Ch2. Independent recompute vs shipped answers."""
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
add=lambda u,v:(u[0]+v[0],u[1]+v[1]); sub=lambda u,v:(u[0]-v[0],u[1]-v[1])
sc=lambda k,v:(k*v[0],k*v[1]); mg=lambda v:math.hypot(*v)

w=widgets(json.load(open(f"{BASE}/vec-02-01.json")))
chk("0201 i1 x4", near(w["i1"]["answer"],add((3,4),(1,2))[0]))
chk("0201 k1 mag5", near(w["k1"]["answer"],mg(add((3,0),(0,4)))) and mg((3,4))==5)
chk("0201 k2 3-2", cl(w["k2"])=="⟨3, 2⟩" and sub((5,3),(2,1))==(3,2))
chk("0201 k3 mag5", near(w["k3"]["answer"],mg(add((1,2),(2,2)))) and add((1,2),(2,2))==(3,4))
chk("0201 ch1 10", near(w["ch1"]["answer"],mg(add((6,0),(0,8)))) and mg((6,8))==10)
chk("0201 rem 5-5", cl(w["rem-vec0201-k"])=="⟨5, 5⟩" and add((2,1),(3,4))==(5,5))

w=widgets(json.load(open(f"{BASE}/vec-02-02.json")))
chk("0202 i1 6-3", cl(w["i1"])=="⟨6, −3⟩" and sc(3,(2,-1))==(6,-3))
chk("0202 k1 671", near(w["k1"]["answer"],round(mg(sc(3,(2,-1))),2),0.011) and near(mg(sc(3,(2,-1))),3*math.sqrt(5)))
chk("0202 k2 -2-6", cl(w["k2"])=="⟨−2, −6⟩" and sc(-2,(1,3))==(-2,-6))
chk("0202 k3 unit1", near(w["k3"]["answer"],mg((0.6,0.8))) and near(mg((3/5,4/5)),1))
chk("0202 ch1 424", near(w["ch1"]["answer"],round(mg(add(sc(2,(1,2)),(1,-1))),2),0.011) and add(sc(2,(1,2)),(1,-1))==(3,3))
chk("0202 rem 6-2", cl(w["rem-vec0202-k"])=="⟨6, −2⟩" and sc(2,(3,-1))==(6,-2))

w=widgets(json.load(open(f"{BASE}/vec-02-03.json")))
chk("0203 i1 x9", near(w["i1"]["answer"],15*0.6) and near(15*0.6,9))
chk("0203 k1 speed5", near(w["k1"]["answer"],mg(add((0,4),(3,0)))) and mg((3,4))==5)
chk("0203 k2 zero", cl(w["k2"]).startswith("⟨0, 0⟩") and add((3,4),(-3,-4))==(0,0))
chk("0203 k3 6-8", cl(w["k3"])=="⟨6, 8⟩" and sc(10,(0.6,0.8))==(6.0,8.0))
res=add((5,2),(-1,3)); bal=sc(-1,res)
chk("0203 ch1 sqrt41", near(w["ch1"]["answer"],round(mg(bal),2),0.011) and res==(4,5) and near(mg(bal),math.sqrt(41)))
chk("0203 rem speed5", near(w["rem-vec0203-k"]["answer"],mg(add((4,0),(0,3)))) and mg((4,3))==5)

for lid in ("vec-02-01","vec-02-02","vec-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
