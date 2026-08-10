"""Dual-route verifier for pra Ch2. Reads shipped JSON only."""
import json, sys
BASE="content/courses/polynomial-rational-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
def cl(W): return [o for o in W["options"] if o.get("correct")][0]["label"]
def polymul(a,b):
    out=[0]*(len(a)+len(b)-1)
    for i,x in enumerate(a):
        for j,y in enumerate(b): out[i+j]+=x*y
    return out
def peval(c,x):
    v=0
    for k in c: v=v*x+k
    return v
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)

w=widgets(json.load(open(f"{BASE}/pra-02-01.json")))
chk("21 i1 deg5→5", near(w["i1"]["answer"],5))
m=polymul(polymul([1,-1],[1,-1]),[1,2])
chk("21 k1 3 w/mult", near(w["k1"]["answer"],3) and len(m)-1==3)
chk("21 k2 2 nonreal", near(w["k2"]["answer"],2) and 4-2==2)
q4=[1,0,0,0,-1]
chk("21 k3 x^4-1 zeros", cl(w["k3"])=="1, −1, i, −i" and all(abs(peval(q4,z))<1e-12 for z in (1,-1,1j,-1j)) and polymul([1,0,-1],[1,0,1])==q4)
chk("21 ch1 3 distinct", near(w["ch1"]["answer"],3) and len({5,-1,4})==3 and 3+2+1==6)
chk("21 rem 2 nonreal", near(w["rem-pra0201-k"]["answer"],2))

w=widgets(json.load(open(f"{BASE}/pra-02-02.json")))
chk("22 i1 3−2i", cl(w["i1"])=="3 − 2i" and complex(3,2).conjugate()==complex(3,-2))
chk("22 k1 third real", cl(w["k1"]).startswith("−2i is also a zero"))
pair=polymul([1,complex(0,-2)*-1],[1,complex(0,2)*-1])  # (x-2i)(x+2i)
pair=[c.real if isinstance(c,complex) else c for c in polymul([1,-2j],[1,2j])]
chk("22 k2 c=4", near(w["k2"]["answer"],4) and pair==[1,0,4] and (0-(2j)**2).real==4)
cubic=polymul([1,0,4],[1,-1])
chk("22 k3 cubic", cl(w["k3"])=="x³ − x² + 4x − 4" and cubic==[1,-1,4,-4] and abs(peval(cubic,2j))<1e-12 and peval(cubic,1)==0)
chk("22 ch1 impossible", cl(w["ch1"]).startswith("No — 5 − 4i is unpaired"))
# route B: counterexample cited in feedback is real — x^4+5x^2+4 has 4 nonreal zeros
q=[1,0,5,0,4]
chk("22 ch1 feedback counterexample", all(abs(peval(q,z))<1e-12 for z in (1j,-1j,2j,-2j)))
chk("22 rem −4−7i", cl(w["rem-pra0202-k"])=="−4 − 7i" and complex(-4,7).conjugate()==complex(-4,-7))

w=widgets(json.load(open(f"{BASE}/pra-02-03.json")))
s_=(1+1j)+(1-1j); p_=(1+1j)*(1-1j)
chk("23 i1 S=2", near(w["i1"]["answer"],s_.real) and s_.imag==0)
chk("23 k1 P=2", near(w["k1"]["answer"],p_.real) and p_==1-(1j)**2)
full=polymul([1,-2,2],[1,-3])
chk("23 k2 x^2 coeff −5", near(w["k2"]["answer"],full[1]) and full==[1,-5,8,-6] and abs(peval(full,1+1j))<1e-12)
chk("23 k3 min deg 4", near(w["k3"]["answer"],4) and 2+1+1==4)
c3=polymul([1,-4,5],[1,-1])
chk("23 ch1 const −5", near(w["ch1"]["answer"],c3[-1]) and c3==[1,-5,9,-5] and abs(peval(c3,2+1j))<1e-12 and ((2+1j)*(2-1j)).real==5)
chk("23 rem c=10", near(w["rem-pra0203-k"]["answer"],10) and ((3+1j)*(3-1j)).real==10 and 3*3+1*1==10)

for lid in ("pra-02-01","pra-02-02","pra-02-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
