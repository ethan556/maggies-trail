"""Dual-route verifier for vec Ch4 (2×2 matrices). Independent Fraction recompute vs shipped."""
import json, sys
from fractions import Fraction as FQ
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
def mv(M,v): return (M[0][0]*v[0]+M[0][1]*v[1], M[1][0]*v[0]+M[1][1]*v[1])
def det(M): return M[0][0]*M[1][1]-M[0][1]*M[1][0]
def invTL(M): return FQ(M[1][1],1)/det(M)  # inverse top-left = d/det

w=widgets(json.load(open(f"{BASE}/vec-04-01.json")))
chk("0401 i1 y3", near(w["i1"]["answer"],mv([[2,0],[0,3]],(1,1))[1]))
chk("0401 k1 37", cl(w["k1"])=="⟨3, 7⟩" and mv([[1,2],[3,4]],(1,1))==(3,7))
chk("0401 k2 6", cl(w["k2"])=="6" and (1+5)==6)
chk("0401 k3 8", near(w["k3"]["answer"],2*4))
chk("0401 ch1 x7", near(w["ch1"]["answer"],mv([[3,1],[2,4]],(2,1))[0]) and mv([[3,1],[2,4]],(2,1))==(7,8))
chk("0401 rem id", cl(w["rem-vec0401-k"])=="⟨5, 7⟩" and mv([[1,0],[0,1]],(5,7))==(5,7))

w=widgets(json.load(open(f"{BASE}/vec-04-02.json")))
chk("0402 i1 10", near(w["i1"]["answer"],det([[3,1],[2,4]])) and det([[3,1],[2,4]])==10)
chk("0402 k1 0", near(w["k1"]["answer"],det([[1,2],[2,4]])) and det([[1,2],[2,4]])==0)
chk("0402 k1b half", near(w["k1b"]["answer"],float(invTL([[2,0],[0,3]]))) and invTL([[2,0],[0,3]])==FQ(1,2))
chk("0402 k2 noinv", cl(w["k2"]).startswith("No") and det([[3,6],[1,2]])==0)
chk("0402 ch1 neg2", near(w["ch1"]["answer"],float(invTL([[1,2],[3,4]]))) and invTL([[1,2],[3,4]])==FQ(-2))
chk("0402 rem neg2", near(w["rem-vec0402-k"]["answer"],det([[1,2],[3,4]])) and det([[1,2],[3,4]])==-2)

w=widgets(json.load(open(f"{BASE}/vec-04-03.json")))
M=[[2,1],[1,3]]; b=(5,10); D=det(M)
xs=FQ(det([[b[0],1],[b[1],3]]),1)/D; ys=FQ(det([[2,b[0]],[1,b[1]]]),1)/D
chk("0403 i1 det5", near(w["i1"]["answer"],D) and D==5)
chk("0403 k1 x1", near(w["k1"]["answer"],float(xs)) and xs==1)
chk("0403 k2 y3", near(w["k2"]["answer"],float(ys)) and ys==3)
chk("0403 k3 nounique", cl(w["k3"]).startswith("No unique") and det([[1,2],[2,4]])==0)
M2=[[3,1],[1,2]]; b2=(9,8); D2=det(M2)
xs2=FQ(det([[b2[0],1],[b2[1],2]]),1)/D2
chk("0403 ch1 x2", near(w["ch1"]["answer"],float(xs2)) and D2==5 and xs2==2)
chk("0403 rem neg2", near(w["rem-vec0403-k"]["answer"],det([[1,1],[1,-1]])) and det([[1,1],[1,-1]])==-2)

for lid in ("vec-04-01","vec-04-02","vec-04-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
