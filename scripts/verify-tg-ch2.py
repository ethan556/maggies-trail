"""Dual-route verifier for tg Ch2. Reads shipped JSON only."""
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
XS=[i/25-6 for i in range(0,301)]
def same(f,g,eps=1e-10): return all(abs(f(x)-g(x))<eps for x in XS)
def argmin(f,a,b,n=4000):
    xs=[a+(b-a)*i/n for i in range(n+1)]
    return min(xs,key=f)

w=widgets(json.load(open(f"{BASE}/tg-02-01.json")))
g=lambda x:2*math.cos(x)+3
chk("21 i1 y(0)=5", near(w["i1"]["answer"],g(0)) and 2*1+3==5)
chk("21 k1 y(π)=1", near(w["k1"]["answer"],g(math.pi),1e-9) and 2*(-1)+3==1)
chk("21 k2 mid π/2", cl(w["k2"]).startswith("x = π/2") and abs(g(math.pi/2)-3)<1e-12 and g(math.pi/2+0.01)<3)
h=lambda x:3*math.cos(2*x)-1
chk("21 k3 trough −4", near(w["k3"]["answer"],-4) and abs(h(math.pi/2)+4)<1e-12 and abs(argmin(h,0.01,3)-math.pi/2)<0.01)
F=lambda x:4*math.cos(2*x)+7
chk("21 ch1 y(π/2)=3", near(w["ch1"]["answer"],F(math.pi/2),1e-9) and (11+3)/2==7 and (11-3)/2==4 and abs(2*math.pi/2-math.pi)<1e-12)
chk("21 rem 5", near(w["rem-tg0201-k"]["answer"],5*math.cos(0)))

w=widgets(json.load(open(f"{BASE}/tg-02-02.json")))
chk("22 i1 0", near(w["i1"]["answer"],math.sin(math.pi),1e-12) and near(w["i1"]["answer"],math.cos(math.pi/2),1e-12))
chk("22 k1 left", cl(w["k1"])=="shifted left by π/2" and same(math.cos,lambda x:math.sin(x+math.pi/2)))
chk("22 k2 5cos(x−π/3)", cl(w["k2"])=="y = 5 cos(x − π/3)" and abs(5*math.cos(math.pi/3-math.pi/3)-5)<1e-12)
chk("22 k3 π/2", cl(w["k3"])=="π/2" and same(math.sin,lambda x:math.cos(x-math.pi/2)))
chk("22 ch1 both 3", near(w["ch1"]["answer"],3*math.sin(math.pi/2)) and near(w["ch1"]["answer"],3*math.cos(0)))
chk("22 rem 0.87", near(w["rem-tg0202-k"]["answer"],round(math.cos(math.pi/6),2),0.006) and abs(math.cos(math.pi/6)-math.sqrt(3)/2)<1e-15)

w=widgets(json.load(open(f"{BASE}/tg-02-03.json")))
chk("23 i1 −1", near(w["i1"]["answer"],math.sin(3*math.pi/2),1e-12) and near(w["i1"]["answer"],-math.sin(math.pi/2),1e-12))
chk("23 k1 sin(x+π)", cl(w["k1"])=="y = sin(x + π)" and same(lambda x:-math.sin(x),lambda x:math.sin(x+math.pi)))
chk("23 k2 cos(x−π)", cl(w["k2"])=="y = cos(x − π)" and same(lambda x:-math.cos(x),lambda x:math.cos(x-math.pi)))
a=lambda x:2*math.sin(x+math.pi/2); b=lambda x:2*math.cos(x+math.pi)
chk("23 k3 2 vs −2", cl(w["k3"]).startswith("They give 2 and −2") and a(0)==2 and near(b(0),-2,1e-12) and same(a,lambda x:-b(x)))
chk("23 ch1 sin(x−π)", cl(w["ch1"])=="y = sin(x − π)" and same(lambda x:math.sin(x-math.pi),lambda x:-math.sin(x)) and same(math.sin,lambda x:math.cos(x-math.pi/2)) and same(math.sin,lambda x:math.sin(x+2*math.pi)))
chk("23 rem −1", near(w["rem-tg0203-k"]["answer"],math.cos(math.pi),1e-12))

for lid in ("tg-02-01","tg-02-02","tg-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
