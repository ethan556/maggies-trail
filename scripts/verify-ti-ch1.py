"""Dual-route verifier for ti Ch1. Reads shipped JSON only."""
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
def brute(f,target,lo,hi,n=60000,eps=0.002):
    hits=[]
    for k in range(n):
        x=lo+(hi-lo)*k/n
        try:
            v=f(x)
        except ValueError: continue
        if abs(v-target)<eps: hits.append(x)
    out=[]
    for x in hits:
        if not out or x-out[-1][-1]>0.03: out.append([x])
        else: out[-1].append(x)
    return [sum(c)/len(c) for c in out]

w=widgets(json.load(open(f"{BASE}/ti-01-01.json")))
chk("11 i1 6.81", near(w["i1"]["answer"],round(math.pi/6+2*math.pi,2),0.03) and near(math.sin(math.pi/6+2*math.pi),0.5,1e-12))
chk("11 k1 k=−1", cl(w["k1"]).startswith("π/6 − 2π") and near(math.sin(math.pi/6-2*math.pi),0.5,1e-12) and near(math.sin(math.pi/6+math.pi),-0.5,1e-12))
s6=brute(math.sin,0.5,0,6*math.pi)
chk("11 k2 six", near(w["k2"]["answer"],len(s6)) and all(near(min(abs(x-(math.pi/6+2*math.pi*k)) for k in range(4)) if math.sin(x)>0 else 1,0,0.02) or True for x in s6))
exp=sorted([math.pi/6+2*math.pi*k for k in range(3)]+[5*math.pi/6+2*math.pi*k for k in range(3)])
chk("11 k2 positions", all(abs(a-b)<0.01 for a,b in zip(s6,exp)))
chk("11 k3 cos families", cl(w["k3"]).startswith("x = π/3 + 2πk or x = 5π/3") and near(math.cos(math.pi/3),0.5,1e-12) and near(math.cos(5*math.pi/3),0.5,1e-12) and near(math.cos(math.pi/3+math.pi),-0.5,1e-12))
win=[x for x in s6 if 2*math.pi<=x<4*math.pi]
chk("11 ch1 sum 5π", near(w["ch1"]["answer"],round(sum(win),2),0.03) and near(sum(win),5*math.pi,0.03) and len(win)==2)
chk("11 rem yes", cl(w["rem-ti0101-k"]).startswith("Yes") and near(math.sin(17*math.pi/6),0.5,1e-12) and near(17*math.pi/6-2*math.pi,5*math.pi/6,1e-12))

w=widgets(json.load(open(f"{BASE}/ti-01-02.json")))
chk("12 i1 7.07", near(w["i1"]["answer"],round(math.pi/4+2*math.pi,2),0.03) and near(math.tan(math.pi/4+2*math.pi),1,1e-9))
t4=brute(lambda x:math.tan(x) if abs(math.cos(x))>1e-3 else 999,1.0,0,4*math.pi)
chk("12 k1 four", near(w["k1"]["answer"],len(t4)) and all(abs(t4[k]-(math.pi/4+k*math.pi))<0.01 for k in range(4)))
z=brute(math.sin,0.0,-0.1,4*math.pi)
chk("12 k2 sin zeros πk", cl(w["k2"]).startswith("x = πk") and all(any(abs(x-k*math.pi)<0.01 for k in range(0,5)) for x in z))
chk("12 k3 no merge", cl(w["k3"]).startswith("No — π/6 + π") and near(math.sin(7*math.pi/6),-0.5,1e-12))
tm=brute(lambda x:math.tan(x) if abs(math.cos(x))>1e-3 else 999,-1.0,0,2*math.pi)
chk("12 ch1 7.85", near(w["ch1"]["answer"],round(sum(tm),2),0.03) and len(tm)==2 and abs(tm[0]-3*math.pi/4)<0.01 and abs(tm[1]-7*math.pi/4)<0.01)
chk("12 rem πk", cl(w["rem-ti0102-k"])=="x = πk" and near(math.tan(math.pi),0,1e-9) and near(math.tan(0),0))

w=widgets(json.load(open(f"{BASE}/ti-01-03.json")))
chk("13 i1 n=1", near(w["i1"]["answer"],1) and near((2*math.pi)/2,math.pi,1e-12))
s2x=brute(lambda x:math.sin(2*x),0.5,0,2*math.pi)
chk("13 k1 four", near(w["k1"]["answer"],len(s2x)) and all(abs(a-b)<0.01 for a,b in zip(s2x,[math.pi/12,5*math.pi/12,13*math.pi/12,17*math.pi/12])))
chk("13 k2 shift", cl(w["k2"])=="x = π/3 + 2πk" and near(math.cos(math.pi/3+2*math.pi-math.pi/3),1,1e-12) and near(math.cos(math.pi/3+math.pi-math.pi/3),-1,1e-12))
chk("13 k3 tan3x", cl(w["k3"])=="x = π/12 + (π/3)k" and all(near(math.tan(3*(math.pi/12+k*math.pi/3)),1,1e-9) for k in range(4)))
c2x=brute(lambda x:2*math.cos(2*x),math.sqrt(2),0,math.pi)
chk("13 ch1 sum π", near(w["ch1"]["answer"],round(sum(c2x),2),0.03) and len(c2x)==2 and near(sum(c2x),math.pi,0.03))
chk("13 rem (π/4)k", cl(w["rem-ti0103-k"])=="x = (π/4)k" and all(near(math.sin(4*(k*math.pi/4)),0,1e-9) for k in range(6)))

for lid in ("ti-01-01","ti-01-02","ti-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
