"""Dual-route verifier for vec Ch5 (transformations). Independent matrix recompute vs shipped."""
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
def mv(M,v): return (M[0][0]*v[0]+M[0][1]*v[1], M[1][0]*v[0]+M[1][1]*v[1])
def mm(A,B):
    return [[A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
            [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]]]

w=widgets(json.load(open(f"{BASE}/vec-05-01.json")))
chk("0501 i1 x2", near(w["i1"]["answer"],mv([[2,0],[0,2]],(1,1))[0]))
chk("0501 k1 reflx", cl(w["k1"])=="⟨2, −3⟩" and mv([[1,0],[0,-1]],(2,3))==(2,-3))
chk("0501 k2 col1", cl(w["k2"]).startswith("⟨3, 2⟩") and mv([[3,1],[2,4]],(1,0))==(3,2))
chk("0501 k3 refly=x", cl(w["k3"])=="⟨3, 2⟩" and mv([[0,1],[1,0]],(2,3))==(3,2))
chk("0501 ch1 x6", near(w["ch1"]["answer"],mv([[3,0],[0,1]],(2,5))[0]) and mv([[3,0],[0,1]],(2,5))==(6,5))
chk("0501 rem reflY", cl(w["rem-vec0501-k"])=="⟨−4, 2⟩" and mv([[-1,0],[0,1]],(4,2))==(-4,2))

R90=[[0,-1],[1,0]]
w=widgets(json.load(open(f"{BASE}/vec-05-02.json")))
chk("0502 i1 R90mat", cl(w["i1"])=="[[0, −1], [1, 0]]")
chk("0502 k1 rot32", cl(w["k1"])=="⟨−2, 3⟩" and mv(R90,(3,2))==(-2,3))
chk("0502 k2 rot180", cl(w["k2"])=="⟨−2, −3⟩" and mv([[-1,0],[0,-1]],(2,3))==(-2,-3))
chk("0502 k3 magpres", near(w["k3"]["answer"],round(math.hypot(-2,3),2),0.011) and math.hypot(-2,3)==math.hypot(3,2))
chk("0502 ch1 y1", near(w["ch1"]["answer"],mv(R90,(1,0))[1]) and mv(R90,(1,0))==(0,1))
chk("0502 rem rot180", cl(w["rem-vec0502-k"])=="⟨−5, −1⟩" and mv([[-1,0],[0,-1]],(5,1))==(-5,-1))

A=[[1,0],[0,-1]]; B=[[0,1],[1,0]]; AB=mm(A,B)
w=widgets(json.load(open(f"{BASE}/vec-05-03.json")))
chk("0503 i1 tl0", near(w["i1"]["answer"],AB[0][0]) and AB[0][0]==0)
chk("0503 AB matrix", AB==[[0,1],[-1,0]])
chk("0503 k1 cw", cl(w["k1"]).startswith("90° clockwise") )
chk("0503 k2 land", cl(w["k2"])=="⟨0, −1⟩" and mv(AB,(1,0))==(0,-1))
# two-step path matches
chk("0503 k2 twostep", mv(A,mv(B,(1,0)))==(0,-1))
BA=mm(B,A); chk("0503 k3 ccw", cl(w["k3"]).startswith("A 90° counterclockwise") and BA==[[0,-1],[1,0]] and BA!=AB)
S=mm([[2,0],[0,1]],[[1,0],[0,3]])
chk("0503 ch1 br3", near(w["ch1"]["answer"],S[1][1]) and S==[[2,0],[0,3]])
chk("0503 rem tl1", near(w["rem-vec0503-k"]["answer"],mm([[1,2],[0,1]],[[1,0],[0,1]])[0][0]))

for lid in ("vec-05-01","vec-05-02","vec-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
