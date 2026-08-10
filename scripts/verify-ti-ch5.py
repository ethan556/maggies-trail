"""Dual-route verifier for ti Ch5 (course capstone). Reads shipped JSON only."""
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
def brute(f,lo,hi,n=80000,eps=0.0015):
    """Route B: half-open [lo, hi) roots of f(x)=0, endpoint-dup dropped."""
    hits=[]
    for k in range(n):
        x=lo+(hi-lo)*k/n
        try: v=f(x)
        except (ValueError,ZeroDivisionError): continue
        if abs(v)<eps: hits.append(x)
    out=[]
    for x in hits:
        if not out or x-out[-1][-1]>0.03: out.append([x])
        else: out[-1].append(x)
    cs=[sum(c)/len(c) for c in out]
    return [c for c in cs if abs(c-hi)>0.12]  # drop 2π-endpoint dup incl. tangency-widened clusters (min real gap ≈ π/6 ≫ 0.12)
def setmatch(got,exp,eps=0.08):  # tolerant of tangency-root centroid drift; still ≪ π/6 min spacing
    return len(got)==len(exp) and all(abs(a-b)<eps for a,b in zip(sorted(got),sorted(exp)))

TWO=2*math.pi
w=widgets(json.load(open(f"{BASE}/ti-05-01.json")))
chk("51 i1 factor", cl(w["i1"]).startswith("(2sin x + 1)(sin x − 1)") and 2*FQ(-1,2)**2-FQ(-1,2)-1==0 and 2*1-1-1==0)
s=brute(lambda x:2*math.sin(x)**2-math.sin(x)-1,0,TWO)
chk("51 k1 three", near(w["k1"]["answer"],len(s)) and setmatch(s,[math.pi/2,7*math.pi/6,11*math.pi/6]))
s_prune=brute(lambda x:(math.sin(x)-2)*(2*math.sin(x)-1),0,TWO)
chk("51 k2 two (prune)", near(w["k2"]["answer"],len(s_prune)) and setmatch(s_prune,[math.pi/6,5*math.pi/6]))
sc=brute(lambda x:2*math.cos(x)**2-math.cos(x)-1,0,TWO)
chk("51 k3 three", near(w["k3"]["answer"],len(sc)) and setmatch(sc,[0,2*math.pi/3,4*math.pi/3]))
chk("51 ch1 sum 7π/2", near(w["ch1"]["answer"],round(math.pi/2+7*math.pi/6+11*math.pi/6,4),0.0006) and near(math.pi/2+7*math.pi/6+11*math.pi/6,7*math.pi/2,1e-9))
sr=brute(lambda x:math.cos(x)**2-math.cos(x),0,TWO)
chk("51 rem three", near(w["rem-ti0501-k"]["answer"],len(sr)) and setmatch(sr,[0,math.pi/2,3*math.pi/2]))

w=widgets(json.load(open(f"{BASE}/ti-05-02.json")))
chk("52 i1 sub", cl(w["i1"]).startswith("−2sin²x + 3sin x − 1"))
s2=brute(lambda x:2*math.cos(x)**2+3*math.sin(x)-3,0,TWO)
chk("52 k1 three", near(w["k1"]["answer"],len(s2)) and setmatch(s2,[math.pi/6,5*math.pi/6,math.pi/2]))
chk("52 k2 direction", cl(w["k2"]).startswith("sin²x = 1 − cos²x"))
s3=brute(lambda x:math.sin(2*x)-math.cos(x),0,TWO)
chk("52 k3 four", near(w["k3"]["answer"],len(s3)) and setmatch(s3,[math.pi/6,5*math.pi/6,math.pi/2,3*math.pi/2]))
chk("52 ch1 sum 3π", near(w["ch1"]["answer"],round(math.pi/6+math.pi/2+5*math.pi/6+3*math.pi/2,4),0.0006) and near(math.pi/6+math.pi/2+5*math.pi/6+3*math.pi/2,3*math.pi,1e-9))
chk("52 rem 1−sin²", cl(w["rem-ti0502-k"])=="1 − sin²x")

w=widgets(json.load(open(f"{BASE}/ti-05-03.json")))
# extraneous: candidates 0,π/2,π ; π fails
chk("53 i1 extraneous", cl(w["i1"]).startswith("extraneous") and not near(math.cos(math.pi),1-math.sin(math.pi)) and near(math.cos(0),1-math.sin(0)) and near(math.cos(math.pi/2),1-math.sin(math.pi/2),1e-12))
sv=brute(lambda x:math.cos(x)-(1-math.sin(x)),0,TWO)
chk("53 k1 two valid", near(w["k1"]["answer"],len(sv)) and setmatch(sv,[0,math.pi/2]))
# sin x cos x = sin x : sinx(cosx−1)=0 -> x=0,π (cosx=1 gives 0 which coincides). distinct {0,π}
sd=brute(lambda x:math.sin(x)*math.cos(x)-math.sin(x),0,TWO)
chk("53 k2 two distinct", near(w["k2"]["answer"],len(sd)) and setmatch(sd,[0,math.pi]))
chk("53 k3 match", cl(w["k3"]).startswith("Squaring adds extraneous"))
sf=brute(lambda x:2*math.sin(x)*math.cos(x)-math.cos(x),0,TWO)
chk("53 ch1 sum 3π", near(w["ch1"]["answer"],round(math.pi/6+math.pi/2+5*math.pi/6+3*math.pi/2,4),0.0006) and setmatch(sf,[math.pi/6,math.pi/2,5*math.pi/6,3*math.pi/2]) and near(sum([math.pi/6,math.pi/2,5*math.pi/6,3*math.pi/2]),3*math.pi,1e-9))
chk("53 rem factor", cl(w["rem-ti0503-k"]).startswith("Rewrite tan x"))

for lid in ("ti-05-01","ti-05-02","ti-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
