"""Dual-route verifier for tg Ch5. Reads shipped JSON only."""
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
def brutesolve(f,target,lo=0.0,hi=2*math.pi,n=40000,eps=0.002):
    """Route B: cluster grid hits of f(x)=target."""
    hits=[]
    for k in range(n):
        x=lo+(hi-lo)*k/n
        try:
            if abs(f(x)-target)<eps: hits.append(x)
        except ValueError: pass
    out=[]
    for x in hits:
        if not out or x-out[-1][-1]>0.05: out.append([x])
        else: out[-1].append(x)
    return [sum(c)/len(c) for c in out]

w=widgets(json.load(open(f"{BASE}/tg-05-01.json")))
chk("51 i1 0.3", near(w["i1"]["answer"],math.sin(math.asin(0.3)),1e-9))
chk("51 k1 π/6", cl(w["k1"])=="π/6" and near(math.asin(math.sin(5*math.pi/6)),math.pi/6,1e-12))
chk("51 k2 0.4", near(w["k2"]["answer"],math.asin(math.sin(0.4)),1e-9))
chk("51 k3 π/4", cl(w["k3"])=="π/4" and near(math.asin(math.sin(3*math.pi/4)),math.pi/4,1e-12) and near(math.pi-3*math.pi/4,math.pi/4,1e-15))
chk("51 ch1 −π/6", cl(w["ch1"])=="−π/6" and near(math.asin(math.sin(7*math.pi/6)),-math.pi/6,1e-12) and near(math.sin(7*math.pi/6),-0.5,1e-12))
chk("51 rem 0", near(w["rem-tg0501-k"]["answer"],math.asin(math.sin(math.pi)),0.006))

w=widgets(json.load(open(f"{BASE}/tg-05-02.json")))
chk("52 i1 adj 4", near(w["i1"]["answer"],4) and 3*3+4*4==5*5 and near(math.sqrt(25-9),4))
chk("52 k1 0.8", near(w["k1"]["answer"],math.cos(math.asin(0.6)),0.006) and near(math.sqrt(1-0.36),0.8,1e-12))
chk("52 k2 +4/5", cl(w["k2"]).startswith("+4/5") and near(math.cos(math.asin(-0.6)),0.8,1e-12))
chk("52 k3 2.4", near(w["k3"]["answer"],math.tan(math.acos(5/13)),0.006) and 5*5+12*12==13*13 and near(12/5,2.4))
chk("52 ch1 0.6", near(w["ch1"]["answer"],math.sin(math.atan(0.75)),0.006) and near((3/4)/math.sqrt(1+(3/4)**2),0.6,1e-12))
chk("52 rem 0.8", near(w["rem-tg0502-k"]["answer"],math.sin(math.acos(0.6)),0.006))

w=widgets(json.load(open(f"{BASE}/tg-05-03.json")))
s1=brutesolve(math.sin,0.5)
chk("53 i1 5π/6", cl(w["i1"]).startswith("5π/6") and len(s1)==2 and near(s1[0],math.pi/6,0.01) and near(s1[1],5*math.pi/6,0.01))
s2=brutesolve(math.cos,-0.5)
chk("53 k1 2π/3,4π/3", cl(w["k1"])=="2π/3 and 4π/3" and len(s2)==2 and near(s2[0],2*math.pi/3,0.01) and near(s2[1],4*math.pi/3,0.01))
s3=brutesolve(lambda x:math.tan(x) if abs(math.cos(x))>1e-3 else 999, 1.0)
chk("53 k2 two", near(w["k2"]["answer"],len(s3)) and near(s3[0],math.pi/4,0.01) and near(s3[1],5*math.pi/4,0.01))
s4=brutesolve(math.sin,-0.5)
chk("53 k3 7π/6,11π/6", cl(w["k3"])=="7π/6 and 11π/6" and len(s4)==2 and near(s4[0],7*math.pi/6,0.01) and near(s4[1],11*math.pi/6,0.01))
s5=brutesolve(lambda x:2*math.sin(x)-1,0.0)
chk("53 ch1 sum π", near(w["ch1"]["answer"],round(sum(s5),2),0.02) and near(sum(s5),math.pi,0.02))
chk("53 rem 5π/3", cl(w["rem-tg0503-k"])=="5π/3" and near(math.cos(5*math.pi/3),0.5,1e-12))

for lid in ("tg-05-01","tg-05-02","tg-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
