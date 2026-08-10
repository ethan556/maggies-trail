"""Dual-route verifier for ti Ch4. Reads shipped JSON only."""
import json, sys, math
from fractions import Fraction as FQ
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
    # half-open [lo, hi): a cluster centered within 0.03 of hi is the wrapped copy of lo — drop it
    hits=[]
    for k in range(n):
        x=lo+(hi-lo)*k/n
        try: v=f(x)
        except (ValueError,ZeroDivisionError): continue
        if abs(v-target)<eps: hits.append(x)
    out=[]
    for x in hits:
        if not out or x-out[-1][-1]>0.03: out.append([x])
        else: out[-1].append(x)
    cs=[sum(c)/len(c) for c in out]
    return [c for c in cs if abs(c-hi)>0.03]

# route B: concrete acute θ with sinθ=3/5
th=math.asin(0.6)
w=widgets(json.load(open(f"{BASE}/ti-04-01.json")))
chk("41 i1 sin2θ .96", near(w["i1"]["answer"],round(2*math.sin(th)*math.cos(th),2),0.006) and 2*FQ(3,5)*FQ(4,5)==FQ(24,25))
chk("41 k1 cos2θ .28", near(w["k1"]["answer"],round(math.cos(2*th),2),0.006) and 1-2*FQ(9,25)==FQ(7,25))
th2=math.pi-math.asin(0.6)  # Q2
chk("41 k2 −.96", near(w["k2"]["answer"],round(2*math.sin(th2)*math.cos(th2),2),0.006) and 2*FQ(3,5)*FQ(-4,5)==FQ(-24,25))
chk("41 k3 sin40", cl(w["k3"])=="sin 40°" and near(2*math.sin(math.radians(20))*math.cos(math.radians(20)),math.sin(math.radians(40)),1e-12))
chk("41 ch1 tan2θ", near(w["ch1"]["answer"],round(math.tan(2*th),4),0.0006) and FQ(24,25)/FQ(7,25)==FQ(24,7))
chk("41 rem 1", near(w["rem-ti0401-k"]["answer"],2*math.sin(math.pi/4)*math.cos(math.pi/4),1e-9))

w=widgets(json.load(open(f"{BASE}/ti-04-02.json")))
chk("42 i1 sine-only", cl(w["i1"]).startswith("1 − 2sin²θ"))
chk("42 k1 .28", near(w["k1"]["answer"],1-2*0.6**2,0.006) and near(1-2*0.36,math.cos(2*math.asin(0.6)),1e-9))
chk("42 k1b .25", near(w["k1b"]["answer"],(1-math.cos(math.pi/3))/2,0.006) and near(math.sin(math.pi/6)**2,0.25,1e-12))
chk("42 k2 2cos²", cl(w["k2"]).startswith("2cos²θ − 1"))
cth=1/3
chk("42 ch1 −7/9", near(w["ch1"]["answer"],round(2*cth**2-1,4),0.0006) and 2*FQ(1,9)-1==FQ(-7,9))
chk("42 rem −.5", near(w["rem-ti0402-k"]["answer"],2*0.5**2-1,0.006))

w=widgets(json.load(open(f"{BASE}/ti-04-03.json")))
chk("43 i1 expand", cl(w["i1"]).startswith("Replace sin 2θ"))
chk("43 k1 2sinθ", cl(w["k1"])=="2 sin θ" and all(near(math.sin(2*x)/math.cos(x),2*math.sin(x),1e-9) for x in (0.3,1.0)))
chk("43 k1c factor", cl(w["k1c"]).startswith("Subtract and factor"))
s4=brute(lambda x:math.sin(2*x)-math.sin(x),0.0,0,2*math.pi)
def setmatch(got,exp,eps=0.02):
    if len(got)!=len(exp): return False
    g=sorted(got); e=sorted(exp)
    return all(abs(a-b)<eps for a,b in zip(g,e))
chk("43 k2 four", near(w["k2"]["answer"],len(s4)) and setmatch(s4,[0,math.pi/3,math.pi,5*math.pi/3]))
s5=brute(lambda x:math.cos(2*x)-math.cos(x),0.0,0,2*math.pi)
chk("43 ch1 sum 2π", near(w["ch1"]["answer"],2*math.pi,0.02) and setmatch(s5,[0,2*math.pi/3,4*math.pi/3]) and near(sum([0,2*math.pi/3,4*math.pi/3]),2*math.pi,1e-9))
chk("43 rem cos+sin", cl(w["rem-ti0403-k"])=="cos θ + sin θ" and all(near(math.cos(2*x)/(math.cos(x)-math.sin(x)),math.cos(x)+math.sin(x),1e-9) for x in (0.3,1.0) if abs(math.cos(x)-math.sin(x))>1e-3))

for lid in ("ti-04-01","ti-04-02","ti-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
