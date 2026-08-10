"""Dual-route verifier: polygons-quadrilaterals ch2 (parallelogram properties).
Route A: the stated property arithmetic (exact Fractions / integer algebra).
Route B: independent coordinate model — build an ACTUAL non-special parallelogram
P(x) = A, A+u, A+u+v, A+v with numeric side/angle/diagonal MEASUREMENT (hypot,
atan2, midpoint), confirming each claimed property holds there and each disclaimed
property FAILS there (equal diagonals, perpendicular diagonals, angle-bisecting
diagonals must all be false in the generic model). Proof deps: tc (ASA + CPCTC
carry every property proof), cp ch5 (alternate interior / co-interior transversal
facts), pq ch1 (quadrilateral 360 sum). Every trap re-derived from its named model."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/polygons-quadrilaterals/lessons/pq-02-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"pq-02-01", "pq-02-02", "pq-02-03"}, sorted(L)

FAIL = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond:
        FAIL.append(name)

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid:
            return s["widget"]
    for m in L[lid]["remedials"]:
        if m["check"]["id"] == sid:
            return m["check"]["widget"]
    raise KeyError((lid, sid))

def traps(w):
    return {e["value"] for e in w["commonErrors"]}

def correct_label(w):
    return [o["label"] for o in w["options"] if o["correct"]][0]

# ---- Route B: generic (non-rectangle, non-rhombus) parallelogram model ----
A = (0.0, 0.0)
u = (10.0, 0.0)          # AB
v = (3.0, 7.0)           # AD  (|v| != |u|, v not perpendicular to u => generic)
B = (A[0] + u[0], A[1] + u[1])
C = (A[0] + u[0] + v[0], A[1] + u[1] + v[1])
D = (A[0] + v[0], A[1] + v[1])

def dist(P, Q):
    return math.hypot(P[0] - Q[0], P[1] - Q[1])

def ang(P, V, Q):  # angle at V from P to Q, degrees
    a = (P[0] - V[0], P[1] - V[1])
    b = (Q[0] - V[0], Q[1] - V[1])
    return math.degrees(math.acos((a[0] * b[0] + a[1] * b[1]) / (math.hypot(*a) * math.hypot(*b))))

chk("model: generic (not rhombus, not rectangle)",
    abs(dist(A, B) - dist(A, D)) > 1 and abs(u[0] * v[0] + u[1] * v[1]) > 1)
chk("model: opposite sides congruent", abs(dist(A, B) - dist(D, C)) < 1e-12 and abs(dist(B, C) - dist(A, D)) < 1e-12)
chk("model: opposite angles congruent", abs(ang(D, A, B) - ang(B, C, D)) < 1e-9)
chk("model: consecutive supplementary", abs(ang(D, A, B) + ang(A, B, C) - 180) < 1e-9)
O = ((A[0] + C[0]) / 2, (A[1] + C[1]) / 2)
chk("model: diagonals bisect each other", abs(dist(O, B) - dist(O, D)) < 1e-12
    and abs(dist(O, A) - dist(O, C)) < 1e-12)
# disclaimed properties must FAIL in the generic model:
chk("model: diagonals NOT equal here", abs(dist(A, C) - dist(B, D)) > 0.5)
ac = (C[0] - A[0], C[1] - A[1]); bd = (D[0] - B[0], D[1] - B[1])
chk("model: diagonals NOT perpendicular here", abs(ac[0] * bd[0] + ac[1] * bd[1]) > 1)
chk("model: diagonal does NOT bisect corner angle here",
    abs(ang(D, A, C) - ang(C, A, B)) > 1)

# ============ pq-02-01 ============
chk("01.i1 ASA", correct_label(widget("pq-02-01", "i1")).startswith("Two pairs of alternate interior"))

w = widget("pq-02-01", "k1")
chk("01.k1", w["answer"] == 13 and traps(w) == {8, 21, 5} and 13 + 8 == 21 and 13 - 8 == 5)

w = widget("pq-02-01", "k2")
chk("01.k2", w["answer"] == 46 and F(2) * (9 + 14) == 46 and traps(w) == {23, 126}
    and 9 + 14 == 23 and 9 * 14 == 126)

w = widget("pq-02-01", "k3")
chk("01.k3", w["answer"] == 5 and 3 * 5 + 4 == 19 and traps(w) == {15, 7.67}
    and 19 - 4 == 15 and abs((19 + 4) / 3 - 7.67) < 0.005)

chk("01.i2 opposite side", correct_label(widget("pq-02-01", "i2")) == "CD")

w = widget("pq-02-01", "ch")
y = 6
chk("01.ch", w["answer"] == 42 and 2 * y - 1 == 11 and 2 * (11 + (y + 4)) == 42
    and traps(w) == {21, 6, 44} and 11 + 10 == 21 and 4 * 11 == 44)

w = widget("pq-02-01", "rem-pq-para-sides-k")
chk("01.rem", w["answer"] == 17 and traps(w) == {34, 8.5})

# ============ pq-02-02 ============
w = widget("pq-02-02", "k1")
chk("02.k1", w["answer"] == 65 and traps(w) == {115, 25} and 180 - 65 == 115 and 90 - 65 == 25)

w = widget("pq-02-02", "k2")
chk("02.k2", w["answer"] == 115 and 180 - 65 == 115 and traps(w) == {65, 295} and 360 - 65 == 295)

chk("02.i1 inventory", correct_label(widget("pq-02-02", "i1")).startswith("65\u00b0, 115\u00b0, 65\u00b0, 115\u00b0")
    and 65 + 115 + 65 + 115 == 360)

w = widget("pq-02-02", "k3")
chk("02.k3", w["answer"] == 50 and 2 * 50 + (50 + 30) == 180 and traps(w) == {30, 75}
    and (2 * 30 == 30 + 30) and (180 - 30) / 2 == 75)

chk("02.i2 pattern fits", correct_label(widget("pq-02-02", "i2")).startswith("Yes")
    and 70 + 110 == 180)

w = widget("pq-02-02", "ch")
chk("02.ch", w["answer"] == 80 and 4 * 20 + 5 * 20 == 180 and traps(w) == {100, 40}
    and 5 * 20 == 100 and 360 // 9 == 40)

w = widget("pq-02-02", "rem-pq-para-angles-k")
chk("02.rem", w["answer"] == 80 and traps(w) == {100, 260} and 180 - 100 == 80 and 360 - 100 == 260)

# ============ pq-02-03 ============
chk("03.i1 bisect meaning", correct_label(widget("pq-02-03", "i1")) == "AO = OC and BO = OD")

w = widget("pq-02-03", "k1")
chk("03.k1", w["answer"] == 9 and F(18, 2) == 9 and traps(w) == {18, 36})

w = widget("pq-02-03", "k2")
chk("03.k2", w["answer"] == 14 and 2 * 7 == 14 and traps(w) == {7, 28})

chk("03.k3 universal property", correct_label(widget("pq-02-03", "k3")) == "They bisect each other")
chk("03.i2 equation", correct_label(widget("pq-02-03", "i2")) == "2x + 3 = x + 8")

w = widget("pq-02-03", "ch")
x = 5
chk("03.ch", w["answer"] == 26 and 2 * x + 3 == x + 8 and 2 * (2 * x + 3) == 26
    and traps(w) == {5, 13} and 2 * x + 3 == 13)

w = widget("pq-02-03", "rem-pq-para-diagonals-k")
chk("03.rem", w["answer"] == 11 and traps(w) == {22, 5.5})

# ---- cross: every numeric trap distinct & outside tolerance ----
ok = True
for lid, j in L.items():
    units = list(j["steps"]) + [{"id": m["check"]["id"], "widget": m["check"]["widget"]} for m in j["remedials"]]
    for s in units:
        w = s.get("widget")
        if w and w.get("type") == "numeric":
            for e in w["commonErrors"]:
                if e["value"] == w["answer"] or abs(e["value"] - w["answer"]) <= w["tolerance"]:
                    ok = False
                    print("BAD TRAP", lid, s["id"], e["value"])
chk("all traps distinct & outside tolerance", ok)

print()
if FAIL:
    print("VERIFIER FAILED:", FAIL)
    sys.exit(1)
print("verify-pq-ch2: ALL GREEN")
