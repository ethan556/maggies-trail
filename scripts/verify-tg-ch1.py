"""Dual-route verifier for tg Ch1. Reads shipped JSON only."""
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
def argmax(f,a,b,n=4000):
    xs=[a+(b-a)*i/n for i in range(n+1)]
    return max(xs,key=f)

w=widgets(json.load(open(f"{BASE}/tg-01-01.json")))
f=lambda x:math.sin(x-math.pi/2)
chk("11 i1 peak nπ n=1", near(w["i1"]["answer"],1) and abs(argmax(f,0,2*math.pi)-math.pi)<0.01 and abs(f(math.pi)-1)<1e-12)
g=lambda x:math.sin(x+math.pi/3)
chk("11 k1 left π/3", cl(w["k1"])=="left by π/3" and abs(g(-math.pi/3))<1e-12 and abs(argmax(g,-2,2)-(math.pi/2-math.pi/3))<0.01)
h=lambda x:math.sin(4*x-math.pi)
chk("11 k2 π/4 right", cl(w["k2"])=="π/4 right" and abs(h(math.pi/4))<1e-12 and h(math.pi/4+0.01)>0)
p=lambda x:2*math.sin(2*x-math.pi/3)
chk("11 k3 y=2", near(w["k3"]["answer"],p(5*math.pi/12)) and abs(2*(5*math.pi/12)-math.pi/3-math.pi/2)<1e-12)
q=lambda x:math.sin(3*x+math.pi/2)
base=lambda x:math.sin(3*x)
# route A: algebra — sin(3x+π/2)=sin(3(x+π/6)); route B: q's peak sits exactly π/6 LEFT of sin(3x)'s peak
chk("11 ch1 n=6", near(w["ch1"]["answer"],6) and all(abs(q(x)-math.sin(3*(x+math.pi/6)))<1e-12 for x in [i/10 for i in range(-20,21)]))
chk("11 ch1 route B shift", abs((argmax(base,-1,1)-argmax(q,-1,1))-math.pi/6)<0.01 and abs(q(0)-1)<1e-12)
chk("11 rem π/2 right", cl(w["rem-tg0101-k"])=="π/2 right" and abs(math.sin(2*(math.pi/2)-math.pi))<1e-12)

w=widgets(json.load(open(f"{BASE}/tg-01-02.json")))
F=lambda x:3*math.sin(2*(x-math.pi/4))+1
vals=[F(i/500) for i in range(0,3200)]
chk("12 i1 max 4", near(w["i1"]["answer"],4) and abs(max(vals)-4)<1e-6)
chk("12 k1 min −2", near(w["k1"]["answer"],-2) and abs(min(vals)+2)<1e-6)
chk("12 k2 peak π/2", cl(w["k2"])=="x = π/2" and abs(F(math.pi/2)-4)<1e-12 and abs(argmax(F,0,math.pi)-math.pi/2)<0.01)
chk("12 k3 D=4", near(w["k3"]["answer"],(7+1)/2) and (7-1)/2==3)
chk("12 ch1 B=1/3", near(w["ch1"]["answer"],0.33,0.006) and near(2*math.pi/(6*math.pi),1/3))
G=lambda x:4*math.sin((1/3)*(x-math.pi))+5
chk("12 ch1 route B period", abs(G(math.pi)-G(math.pi+6*math.pi))<1e-9 and abs(G(math.pi)-5)<1e-9)
chk("12 rem A=4", near(w["rem-tg0102-k"]["answer"],(10-2)/2))

w=widgets(json.load(open(f"{BASE}/tg-01-03.json")))
Q=lambda x:2*math.sin(2*(x-math.pi/6))-1
chk("13 i1 n=4", near(w["i1"]["answer"],4) and abs((2*math.pi/2)/4-math.pi/4)<1e-12)
chk("13 k1 trough 11π/12", cl(w["k1"])=="x = 11π/12" and abs(Q(11*math.pi/12)+3)<1e-12 and abs(min(Q(i/500) for i in range(0,3000))+3)<1e-5)
chk("13 k2 y=−3", near(w["k2"]["answer"],-3) and -1-2==-3)
R=lambda x:-3*math.sin(x)+5
chk("13 k3 y=2", near(w["k3"]["answer"],R(math.pi/2)) and 5-3==2)
P=lambda x:4*math.sin(3*(x-math.pi/3))+2
chk("13 ch1 peak y=6", near(w["ch1"]["answer"],P(math.pi/2)) and 2+4==6 and abs(argmax(P,math.pi/3,math.pi)-math.pi/2)<0.01)
chk("13 rem peak 1", near(w["rem-tg0103-k"]["answer"],1) and abs(math.sin(math.pi/2)-1)<1e-15)

for lid in ("tg-01-01","tg-01-02","tg-01-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
