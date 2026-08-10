"""Dual-route verifier for pp Ch3 (complex polar / De Moivre / roots). cmath route B vs shipped answers."""
import json, sys, math, cmath
BASE="content/courses/polar-parametric/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def cnear(a,b,eps=1e-9): return abs(complex(a)-complex(b))<=eps
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

w=widgets(json.load(open(f"{BASE}/pp-03-01.json")))
chk("0301 i1 mod5", near(w["i1"]["answer"],abs(3+4j)) and abs(3+4j)==5)
chk("0301 k1 rcos", cl(w["k1"])=="r cos θ")
chk("0301 k2 3pi/4", cl(w["k2"])=="3π/4" and near(cmath.phase(-1+1j),3*math.pi/4))
chk("0301 k3 polar", cl(w["k3"]).startswith("2(cos π/3") and near(abs(1+1j*math.sqrt(3)),2) and near(cmath.phase(1+1j*math.sqrt(3)),math.pi/3))
argQ3=cmath.phase(-1-1j*math.sqrt(3)) % (2*math.pi)
chk("0301 ch1 4pi/3", near(w["ch1"]["answer"],round(4*math.pi/3,2),0.02) and near(argQ3,4*math.pi/3,1e-9))
chk("0301 rem mod1", near(w["rem-pp0301-k"]["answer"],abs(1j)))

w=widgets(json.load(open(f"{BASE}/pp-03-02.json")))
chk("0302 i1 mod6", near(w["i1"]["answer"],2*3))
chk("0302 k1 arg60", near(w["k1"]["answer"],20+40))
chk("0302 k2 −4", near(w["k2"]["answer"],((1+1j)**4).real,1e-9) and near(((1+1j)**4).imag,0,1e-9))
chk("0302 k3 −8", near(w["k3"]["answer"],((1+1j*math.sqrt(3))**3).real,1e-9) and near(((1+1j*math.sqrt(3))**3).imag,0,1e-9))
chk("0302 ch1 16", near(w["ch1"]["answer"],((1+1j)**8).real,1e-9) and near(((1+1j)**8).imag,0,1e-9))
chk("0302 rem mod8", near(w["rem-pp0302-k"]["answer"],2**3))

w=widgets(json.load(open(f"{BASE}/pp-03-03.json")))
chk("0303 i1 mod2", near(w["i1"]["answer"],8**(1/3),1e-9))
chk("0303 k1 120", cl(w["k1"]).startswith("120°"))
r8=[2*cmath.exp(1j*2*math.pi*k/3) for k in range(3)]
chk("0303 k2 root2", cl(w["k2"]).startswith("2") and near(2**3,8) and all(near(abs(w_**3-8),0,1e-9) for w_ in r8))
chk("0303 k3 i", cl(w["k3"])=="i" and near(abs(1j**4-1),0,1e-9))
sqi=cmath.exp(1j*(math.pi/2)/2)  # principal sqrt of i
chk("0303 ch1 real .7071", near(w["ch1"]["answer"],round(sqi.real,4),0.0006) and cnear(sqi**2,1j) and near(sqi.real,math.sqrt(2)/2))
chk("0303 rem five", near(w["rem-pp0303-k"]["answer"],5))

for lid in ("pp-03-01","pp-03-02","pp-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
