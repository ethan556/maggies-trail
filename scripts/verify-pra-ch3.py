"""Dual-route verifier for pra Ch3. Reads shipped JSON only."""
import json, sys
from fractions import Fraction as FQ
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
def polydiv(num,den):
    num=num[:]; q=[]
    while len(num)>=len(den):
        c=FQ(num[0],den[0]); q.append(c)
        for i,d in enumerate(den): num[i]-=c*d
        num.pop(0)
    return q,num
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)

# gap-classification route B: numeric limits
def far(fnum,fden,X=10**7):
    n=sum(c*X**(len(fnum)-1-i) for i,c in enumerate(fnum))
    d=sum(c*X**(len(fden)-1-i) for i,c in enumerate(fden))
    return FQ(n,d)

w=widgets(json.load(open(f"{BASE}/pra-03-01.json")))
chk("31 i1 slant", cl(w["i1"]).startswith("A slant") and len([1,3,5])-len([1,1])==1)
chk("31 k1 y=0", cl(w["k1"]).startswith("the horizontal asymptote y = 0") and abs(float(far([5,2],[1,0,-9])))<1e-5)
chk("31 k2 yes slant", cl(w["k2"]).startswith("Yes"))
chk("31 k3 none", cl(w["k3"]).startswith("No horizontal or slant") and float(far([1,0,0,0,2],[1,-1]))>10**18)
chk("31 ch1 middle", cl(w["ch1"])=="(x² − 1)/(x − 5)" and near(float(far([3,0,1],[1,0,2])),3,1e-5))
chk("31 rem slant", cl(w["rem-pra0301-k"]).startswith("Slant"))

w=widgets(json.load(open(f"{BASE}/pra-03-02.json")))
q,r=polydiv([1,3,5],[1,1])
chk("32 i1 c=2", near(w["i1"]["answer"],2) and q==[1,2] and r==[3])
chk("32 k1 y=x+2", cl(w["k1"])=="y = x + 2" and polymul([1,1],[1,2])[0:2]==[1,3] and polymul([1,1],[1,2])[2]+3==5)
q2,r2=polydiv([1,0,-4],[1,-1])
chk("32 k2 y=x+1", cl(w["k2"])=="y = x + 1" and q2==[1,1] and r2==[-3])
gap=(FQ(101)**2-4)/(FQ(101)-1)-102
chk("32 k3 gap −0.03", near(w["k3"]["answer"],float(gap),1e-12) and gap==FQ(-3,100))
q3,r3=polydiv([2,5,1],[1,2])
chk("32 ch1 b=1", near(w["ch1"]["answer"],1) and q3==[2,1] and r3==[-1] and polymul([1,2],[2,1])==[2,5,2])
chk("32 rem 3x−2", cl(w["rem-pra0302-k"])=="y = 3x − 2")

w=widgets(json.load(open(f"{BASE}/pra-03-03.json")))
chk("33 i1 VA x=1", near(w["i1"]["answer"],1) and (1-1)==0 and (1*1-4)!=0)
chk("33 k1 slant x+1", cl(w["k1"]).startswith("the slant line y = x + 1") and q2==[1,1])
chk("33 k2 cross rule", cl(w["k2"]).startswith("A graph may cross its slant"))
chk("33 k3 nowhere", cl(w["k3"]).startswith("Nowhere") and r2==[-3] and all((FQ(-3)/(FQ(x)-1))!=0 for x in range(-50,52) if x!=1))
chk("33 ch1 portrait", cl(w["ch1"])=="Vertical x = −2 and slant y = 2x + 1" and q3==[2,1] and (-2+2)==0 and (2*4-10+1)!=0)
chk("33 rem VA3 HA4", cl(w["rem-pra0303-k"])=="Vertical x = 3, horizontal y = 4" and near(float(far([4,1],[1,-3])),4,1e-5))

for lid in ("pra-03-01","pra-03-02","pra-03-03"):
    for sid,W in widgets(json.load(open(f"{BASE}/{lid}.json"))).items():
        if W["type"]=="numeric":
            for e in W["commonErrors"]:
                chk(f"{lid}/{sid} trap outside tol", abs(e["value"]-W["answer"])>W.get("tolerance",0))
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
