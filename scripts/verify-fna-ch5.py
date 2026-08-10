"""Dual-route verifier for function-analysis Ch5. Reads shipped JSON only."""
import json, sys, math
BASE="content/courses/function-analysis/lessons"
def near(a,b,eps=1e-9): return abs(float(a)-float(b))<=eps
def widgets(L):
    out={}
    for s in L["steps"]:
        if "widget" in s: out[s["id"]]=s["widget"]
    for r in L.get("remedials",[]): out[r["check"]["id"]]=r["check"]["widget"]
    return out
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)
def cl(W): return [o for o in W["options"] if o.get("correct")][0]["label"]

w=widgets(json.load(open(f"{BASE}/fna-05-01.json")))
chk("51 i1 collide 3", near(w["i1"]["answer"],3) and (-3)**2==3**2 and math.isqrt(9)==3)
chk("51 k1 ambiguity", "9 to both 3 and −3" in cl(w["k1"]))
chk("51 k2 cube 1-1", cl(w["k2"])=="f(x) = x³" and len({x**3 for x in range(-9,10)})==19 and len({x*x for x in range(-9,10)})<19)
chk("51 k3 |±4|=4", near(w["k3"]["answer"],4) and abs(-4)==abs(4)==4)
tab={1:5,2:8,3:5,4:11}
rep=[v for v in tab.values() if list(tab.values()).count(v)>1]
chk("51 ch1 table repeat=5", cl(w["ch1"]).startswith("No — the output 5") and rep==[5,5] and tab[1]==tab[3])
g={0:2,1:7,4:2,5:9}
chk("51 rem repeated=2", near(w["rem-fna0501-k"]["answer"],2) and g[0]==g[4]==2)

w=widgets(json.load(open(f"{BASE}/fna-05-02.json")))
chk("52 i1 inv(16)=4", near(w["i1"]["answer"],4) and 4*4==16 and math.sqrt(16)==4)
chk("52 k1 inv(1)=4", near(w["k1"]["answer"],4) and (4-3)**2==1 and 3+math.sqrt(1)==4)
chk("52 k2 left branch", cl(w["k2"]).startswith("x ≤ 3") and (2-3)**2==(4-3)**2)  # straddle counterexample real
chk("52 k3 domain x>=0", cl(w["k3"]).startswith("x ≥ 0"))
chk("52 ch1 inv(10)=3", near(w["ch1"]["answer"],3) and 3*3+1==10 and math.sqrt(10-1)==3)
chk("52 rem inv(25)=5", near(w["rem-fna0502-k"]["answer"],5) and 5*5==25 and math.sqrt(25)==5)

w=widgets(json.load(open(f"{BASE}/fna-05-03.json")))
f=lambda x:2*x+6; g=lambda x:(x-6)/2
comp_fg=lambda x:2*((x-6)/2)+6  # route B: expanded rule
comp_gf=lambda x:((2*x+6)-6)/2
chk("53 i1 f(g(10))=10", near(w["i1"]["answer"], f(g(10))) and near(w["i1"]["answer"], comp_fg(10)))
chk("53 k1 identity=x", cl(w["k1"])=="x" and all(comp_fg(x)==x for x in range(-20,21)))
chk("53 k2 reflect (10,2)", cl(w["k2"])=="(10, 2)" and f(2)==10 and g(10)==2)
h=lambda x:3*x+1; j=lambda x:x/3+1
chk("53 k3 false inverse", cl(w["k3"]).startswith("h(j(3)) = 7") and h(j(3))==7 and j(3)==2)
chk("53 ch1 g(f(-3))=-3", near(w["ch1"]["answer"], g(f(-3))) and near(w["ch1"]["answer"], comp_gf(-3)))
chk("53 rem g(f(8))=8", near(w["rem-fna0503-k"]["answer"], g(f(8))) and near(w["rem-fna0503-k"]["answer"], comp_gf(8)))

for lid in ("fna-05-01","fna-05-02","fna-05-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap {e['value']} outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))

print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
