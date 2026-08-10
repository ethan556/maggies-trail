"""Dual-route verifier for kc-05-01 Make Ten (K.OA.4). Independent partner recompute vs shipped."""
import json, sys
p="content/courses/counting-to-20-k/lessons/kc-05-01.json"
L=json.load(open(p))
def cl(W): return [o for o in W["options"] if o.get("correct")][0]["label"]
fails=[]
def chk(n,c):
    if not c: fails.append(n)
    print(("✓" if c else "✗"),n)
partner=lambda n: 10-n   # route B: independent make-10 partner

steps={s["id"]:s for s in L["steps"]}
# tenFrame i1: preFilled 8 -> add partner(8)=2, target 10
i1=steps["i1"]["widget"]; chk("i1 target10", i1["target"]==10 and i1["preFilled"]==8 and partner(8)==2)
# tenFrame i2: preFilled 7 -> add 3
i2=steps["i2"]["widget"]; chk("i2 preFilled7", i2["target"]==10 and i2["preFilled"]==7 and partner(7)==3)
# preFilled < target rule
for sid in ("i1","i2"):
    w=steps[sid]["widget"]; chk(f"{sid} preFilled<target", w["preFilled"]<w["target"])
    for c in w["commonCounts"]: chk(f"{sid} commonCount {c['count']} valid", 0<=c["count"]<=10 and c["count"]!=w["target"])
# mcq partners
chk("k1 six->4", cl(steps["k1"]["widget"])=="4" and partner(6)==4)
chk("k2 nine->1", cl(steps["k2"]["widget"])=="1" and partner(9)==1)
chk("k3 three->7", cl(steps["k3"]["widget"])=="7" and partner(3)==7)
# challenge: the correct pair sums to 10, distractors do not
chwin=cl(steps["ch1"]["widget"])
a,b=[int(x) for x in chwin.replace("and","").split()]
chk("ch1 pair makes 10", a+b==10 and chwin=="5 and 5")
for o in steps["ch1"]["widget"]["options"]:
    if not o.get("correct"):
        x,y=[int(t) for t in o["label"].replace("and","").split()]
        chk(f"ch1 distractor {o['label']} ≠10", x+y!=10)
# remedial: preFilled 8 -> 2
rem=L["remedials"][0]["check"]["widget"]; chk("rem eight->2", cl(rem)=="2" and partner(8)==2)
# every mcq exactly one correct + no dup labels
for sid,s in steps.items():
    w=s.get("widget",{})
    if w.get("type")=="mcq":
        labs=[o["label"] for o in w["options"]]
        chk(f"{sid} labels unique", len(labs)==len(set(labs)))
        chk(f"{sid} one correct", sum(1 for o in w["options"] if o.get("correct"))==1)
print("\n"+("ALL GREEN" if not fails else "FAILURES: "+str(fails)))
sys.exit(1 if fails else 0)
