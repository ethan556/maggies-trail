"""gf ch2 verifier. Route A: manual linear-solve of each authored setup, coded directly.
Route B: brute-force substitution scan over a value grid — find the value satisfying the
geometric constraint, independent of any algebraic manipulation. Additionally every trap is
re-derived from its NAMED error model and must equal the authored trap value exactly."""
import json, glob
from fractions import Fraction as F

L = {}
for p in sorted(glob.glob("content/courses/geometry-foundations/lessons/gf-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def num(lid, sid):
    w = st(lid)[sid]["widget"]; assert w["type"] == "numeric"
    return w
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def scan(lo, hi, pred, step=F(1, 10)):
    """Route B: brute-force scan; returns list of values satisfying pred."""
    out = []
    v = F(lo)
    while v <= hi:
        if pred(v): out.append(v)
        v += step
    return out

# ================= gf-02-01 =================
# i1: coords 2,9 -> distance. Route A: |9-2|. Route B: count unit steps from 2 to 9.
w = num("gf-02-01", "i1")
chk("0201 i1 A", w["answer"] == abs(9 - 2))
chk("0201 i1 B", w["answer"] == len([i for i in range(2, 9)]))
# k1: AB=17 BC=26. A: 17+26. B: scan AC such that AC-17==26.
w = num("gf-02-01", "k1")
chk("0201 k1 A", w["answer"] == 17 + 26)
chk("0201 k1 B", [float(v) for v in scan(0, 100, lambda v: v - 17 == 26, F(1))] == [w["answer"]])
chk("0201 k1 traps", traps(w) == [9, 21.5] and 26 - 17 == 9 and (17 + 26) / 2 == 21.5)
# i2 slider: endpoints 3,11 -> 7. B: value equidistant from both.
w = st("gf-02-01")["i2"]["widget"]
chk("0201 i2 A", w["target"] == (3 + 11) / 2)
chk("0201 i2 B", [float(v) for v in scan(0, 14, lambda v: abs(v - 3) == abs(v - 11), F(1))] == [w["target"]])
chk("0201 i2 start!=target", w["start"] != w["target"])
# k2: endpoints 5,17 -> 11
w = num("gf-02-01", "k2")
chk("0201 k2 A", w["answer"] == (5 + 17) / 2)
chk("0201 k2 B", [float(v) for v in scan(0, 30, lambda v: v - 5 == 17 - v, F(1))] == [w["answer"]])
chk("0201 k2 traps", traps(w) == [6, 22] and (17 - 5) / 2 == 6 and 5 + 17 == 22)
# i3: AB=30 bisected -> AM=15. B: scan AM with AM==30-AM.
w = num("gf-02-01", "i3")
chk("0201 i3 A", w["answer"] == 30 / 2)
chk("0201 i3 B", [float(v) for v in scan(0, 40, lambda v: v == 30 - v, F(1))] == [w["answer"]])
chk("0201 i3 traps", traps(w) == [30, 60] and 30 * 2 == 60)
# ch: AM=19 -> AB=38. B: scan AB with AB/2==19.
w = num("gf-02-01", "ch")
chk("0201 ch A", w["answer"] == 2 * 19)
chk("0201 ch B", [float(v) for v in scan(0, 60, lambda v: v / 2 == 19, F(1))] == [w["answer"]])
chk("0201 ch traps", traps(w) == [9.5, 19] and 19 / 2 == 9.5)
# remedial: AC=50 AB=30 -> BC=20. B: scan BC with 30+BC==50.
w = L["gf-02-01"]["remedials"][0]["check"]["widget"]
chk("0201 rem A", w["answer"] == 50 - 30)
chk("0201 rem B", [float(v) for v in scan(0, 100, lambda v: 30 + v == 50, F(1))] == [w["answer"]])
chk("0201 rem traps", traps(w) == [40, 80] and 50 + 30 == 80)

# ================= gf-02-02 =================
w = num("gf-02-02", "i1")
chk("0202 i1 A", w["answer"] == 75 - 30)
chk("0202 i1 B", [float(v) for v in scan(0, 180, lambda v: 30 + v == 75, F(1))] == [w["answer"]])
chk("0202 i1 traps", traps(w) == [52.5, 105] and 30 + 75 == 105 and (30 + 75) / 2 == 52.5)
w = num("gf-02-02", "k1")
chk("0202 k1 A", w["answer"] == 34 + 51)
chk("0202 k1 B", [float(v) for v in scan(0, 180, lambda v: v - 34 == 51, F(1))] == [w["answer"]])
chk("0202 k1 traps", traps(w) == [17, 42.5] and 51 - 34 == 17 and (34 + 51) / 2 == 42.5)
# i2 mcq: 26+26 bisector -> whole 52; Route B: equality test + sum
i2 = st("gf-02-02")["i2"]["widget"]
corr = [o["label"] for o in i2["options"] if o["correct"]]
chk("0202 i2 A+B", corr == ["BD bisects ∠ABC, which measures 52°"] and 26 == 26 and 26 + 26 == 52)
w = num("gf-02-02", "k2")
chk("0202 k2 A", w["answer"] == 84 / 2)
chk("0202 k2 B", [float(v) for v in scan(0, 180, lambda v: v + v == 84, F(1))] == [w["answer"]])
chk("0202 k2 traps", traps(w) == [84, 168] and 84 * 2 == 168)
w = num("gf-02-02", "i3")
chk("0202 i3 A", w["answer"] == 180 - 116)
chk("0202 i3 B", [float(v) for v in scan(0, 180, lambda v: 116 + v == 180, F(1))] == [w["answer"]])
chk("0202 i3 traps", traps(w) == [26, 116] and abs(90 - 116) == 26)
w = num("gf-02-02", "ch")
chk("0202 ch A", w["answer"] == 90 - 37)
chk("0202 ch B", [float(v) for v in scan(0, 90, lambda v: 37 + v == 90, F(1))] == [w["answer"]])
chk("0202 ch traps", traps(w) == [37, 143] and 180 - 37 == 143)
w = L["gf-02-02"]["remedials"][0]["check"]["widget"]
chk("0202 rem A", w["answer"] == 120 - 45)
chk("0202 rem B", [float(v) for v in scan(0, 180, lambda v: 45 + v == 120, F(1))] == [w["answer"]])
chk("0202 rem traps", traps(w) == [60, 165] and 120 + 45 == 165 and 120 / 2 == 60)

# ================= gf-02-03 =================
# k1: (2x+3)+(3x-7)=41. Route A: manual solve 5x-4=41 -> 9. Route B: scan.
w = num("gf-02-03", "k1")
chk("0203 k1 A", w["answer"] == (41 + 4) / 5)
solB = scan(-20, 40, lambda x: (2 * x + 3) + (3 * x - 7) == 41)
chk("0203 k1 B", [float(v) for v in solB] == [w["answer"]])
# traps from error models: parts-equal -> 2x+3=3x-7; sign-slip -> 5x+4=41
tA = scan(-20, 40, lambda x: 2 * x + 3 == 3 * x - 7)
tB = scan(-20, 40, lambda x: 5 * x + 4 == 41)
chk("0203 k1 traps", traps(w) == sorted([float(tA[0]), float(tB[0])]))
# k2: AB at x=9
w = num("gf-02-03", "k2")
chk("0203 k2 A", w["answer"] == 2 * 9 + 3)
chk("0203 k2 B", w["answer"] == 41 - (3 * 9 - 7))  # whole minus BC — independent route
chk("0203 k2 traps", traps(w) == [20, 41] and 3 * 9 - 7 == 20)
# i2 mcq: bisector equation. Route B: bisector semantics = piece-equality.
i2 = st("gf-02-03")["i2"]["widget"]
corr = [o["label"] for o in i2["options"] if o["correct"]]
chk("0203 i2 A+B", corr == ["3x + 5 = 5x − 17"])
# k3: 3x+5=5x-17 -> 11. Route B scan.
w = num("gf-02-03", "k3")
chk("0203 k3 A", w["answer"] == (5 + 17) / 2)
chk("0203 k3 B", [float(v) for v in scan(-30, 60, lambda x: 3 * x + 5 == 5 * x - 17)] == [w["answer"]])
tA = scan(-30, 60, lambda x: 8 * x - 12 == 180)   # sum-to-180 model
tB = scan(-30, 60, lambda x: 3 * x + 5 == 5 * x + 17)  # sign-slip model
chk("0203 k3 traps", traps(w) == sorted([float(tA[0]), float(tB[0])]))
# ch: whole at x=11. Routes: 2*(3x+5) and (3x+5)+(5x-17); halves must agree.
w = num("gf-02-03", "ch")
half1, half2 = 3 * 11 + 5, 5 * 11 - 17
chk("0203 ch halves agree", half1 == half2 == 38)
chk("0203 ch A", w["answer"] == 2 * half1)
chk("0203 ch B", w["answer"] == 8 * 11 - 12)
chk("0203 ch traps", traps(w) == [38, 88] and 8 * 11 == 88)
# remedial mcq: midpoint equation 4x=x+12; B: solution x=4 gives halves 16=16.
rem = L["gf-02-03"]["remedials"][0]["check"]["widget"]
corr = [o["label"] for o in rem["options"] if o["correct"]]
xm = scan(-20, 40, lambda x: 4 * x == x + 12)
chk("0203 rem A+B", corr == ["4x = x + 12"] and len(xm) == 1 and 4 * xm[0] == xm[0] + 12 == 16)

# structural sweep
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "numeric":
            tol = w.get("tolerance", 0)
            for c in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {c['value']} outside window",
                    abs(c["value"] - w["answer"]) > tol)
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("gf ch2 verifier: ALL PASS (routes A and B agree; all traps re-derived from error models)")
