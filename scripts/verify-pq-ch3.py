"""Dual-route verifier: polygons-quadrilaterals ch3 (rectangles, rhombi, squares).
Route A: the taught formulas/algebra evaluated exactly (Fraction where possible).
Route B: build a GENERIC coordinate instance of each figure and MEASURE the claimed
property (no formula reuse): rectangle 9x12 measured with hypot + midpoint distances;
rhombus from perpendicular half-diagonal vectors measured for side/angle-bisection;
square via rotated coordinates. Also disclaimed-property falsification: a leaning
parallelogram must FAIL diagonal congruence; a non-square rectangle must FAIL
diagonal perpendicularity. Proof deps: pq-ch2 (bisection, supplements — inherited
properties cited not re-proved), tc (SSS/SAS/CPCTC underlying the theorems),
rt-ch1 (Pythagoras, 45-45-90 s*sqrt2), cg (exclusive-trapezoid convention context)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/polygons-quadrilaterals/lessons/pq-03-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"pq-03-01", "pq-03-02", "pq-03-03"}, sorted(L)

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

def near(a, b, t=0.005):
    return abs(a - b) <= t

def correct_label(w):
    return [o["label"] for o in w["options"] if o["correct"]][0]

def traps(w):
    return {e["value"] for e in w["commonErrors"]}

def mid(P, Q):
    return ((P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2)

def dist(P, Q):
    return math.hypot(P[0] - Q[0], P[1] - Q[1])

def dot(u, v):
    return u[0] * v[0] + u[1] * v[1]

# ---- Route B model instances ----
# Rectangle 9 x 12
RA, RB, RC, RD = (0, 0), (12, 0), (12, 9), (0, 9)
chk("modelB: rectangle diagonals congruent (measured)", near(dist(RA, RC), dist(RB, RD), 1e-12))
chk("modelB: rectangle diagonals bisect (measured)", mid(RA, RC) == mid(RB, RD))
chk("modelB: leaning parallelogram diagonals NOT congruent",
    not near(dist((0, 0), (12 + 3, 9)), dist((12, 0), (3, 9)), 0.01))  # shear by 3
chk("modelB: non-square rectangle diagonals NOT perpendicular",
    abs(dot((RC[0] - RA[0], RC[1] - RA[1]), (RD[0] - RB[0], RD[1] - RB[1]))) > 1)
# Rhombus with half-diagonals 6, 8 (diagonals 12 along x, 16 along y)
HP, HQ = 6, 8
V1, V2, V3, V4 = (HP, 0), (0, HQ), (-HP, 0), (0, -HQ)
sides = [dist(V1, V2), dist(V2, V3), dist(V3, V4), dist(V4, V1)]
chk("modelB: rhombus all sides 10 (measured)", all(near(s, 10, 1e-12) for s in sides))
chk("modelB: rhombus diagonals perpendicular (axes)", dot((2 * HP, 0), (0, 2 * HQ)) == 0)
# angle bisection at V1: angle between V1->V2 and V1->V3(axis) equals angle V1->V4 vs axis
a12 = math.atan2(HQ - 0, 0 - HP)
a14 = math.atan2(-HQ - 0, 0 - HP)
axis = math.pi  # direction V1 -> V3
chk("modelB: rhombus diagonal bisects vertex angle (measured)",
    near(abs(a12 - axis), abs(a14 - (-axis)), 1e-12) or near(abs(axis - a12), abs(a14 + axis), 1e-12))

# ============ pq-03-01 rectangles ============
w = widget("pq-03-01", "k1")  # 2x+1 = x+9 -> AC = 34
x = F(9 - 1, 2 - 1)
chk("01.k1 A", x == 8 and 2 * x + 1 == 17 and w["answer"] == 34 and 2 * (2 * x + 1) == 34)
chk("01.k1 B (both halves agree)", x + 9 == 17)
chk("01.k1 traps", traps(w) == {8, 17, 26} and 17 + 9 == 26)

chk("01.k2 rectangle-only claim", correct_label(widget("pq-03-01", "k2")) == "AC = BD")

w = widget("pq-03-01", "k3")  # diag 15
chk("01.k3 A", w["answer"] == 15 and F(9)**2 + F(12)**2 == F(15)**2)
chk("01.k3 B (measured)", near(dist(RA, RC), 15, 1e-12))
chk("01.k3 traps", traps(w) == {21, 10.5, 7.94} and 9 + 12 == 21 and (9 + 12) / 2 == 10.5
    and near(math.sqrt(144 - 81), 7.94))

w = widget("pq-03-01", "i2")  # half diag 7.5
chk("01.i2", w["answer"] == 7.5 and traps(w) == {15, 5.25})
chk("01.i2 B (all four corner distances measured)",
    all(near(dist(mid(RA, RC), P), 7.5, 1e-12) for P in [RA, RB, RC, RD]))

chk("01.ch door test", correct_label(widget("pq-03-01", "ch")).startswith("The frame is a true rectangle"))
chk("01.rem inherited-vs-new", correct_label(widget("pq-03-01", "rem-pq-rectangle-k")).startswith("Parallelogram property"))

# ============ pq-03-02 rhombi ============
w = widget("pq-03-02", "k1")
chk("02.k1", w["answer"] == 36 and 4 * 9 == 36 and traps(w) == {18, 81})

w = widget("pq-03-02", "k2")  # 70 -> 35
chk("02.k2 A", w["answer"] == 35 and F(70, 2) == 35)
chk("02.k2 traps", traps(w) == {70, 55, 20} and (180 - 70) / 2 == 55 and 90 - 70 == 20)

w = widget("pq-03-02", "k3")  # diagonals 12,16 -> side 10
chk("02.k3 A", w["answer"] == 10 and F(6)**2 + F(8)**2 == F(10)**2)
chk("02.k3 B (measured on model)", all(near(s, 10, 1e-12) for s in sides))
chk("02.k3 traps", traps(w) == {20, 14, 28} and near(math.hypot(12, 16), 20, 1e-9) and 6 + 8 == 14 and 12 + 16 == 28)

chk("02.i1 upgrade matching", correct_label(widget("pq-03-02", "i1")).startswith("Rectangle: congruent"))
w = widget("pq-03-02", "i2")
chk("02.i2", w["answer"] == 90 and traps(w) == {45, 60})

w = widget("pq-03-02", "ch")  # side 13, d1=10 -> d2=24
chk("02.ch A", w["answer"] == 24 and F(13)**2 - F(5)**2 == F(12)**2)
# Route B: build that rhombus and measure the other diagonal
h2 = math.sqrt(13**2 - 5**2)
W1, W2, W3, W4 = (5, 0), (0, h2), (-5, 0), (0, -h2)
chk("02.ch B (measured)", all(near(dist(a, b), 13, 1e-9) for a, b in [(W1, W2), (W2, W3), (W3, W4), (W4, W1)])
    and near(dist(W2, W4), 24, 1e-9))
chk("02.ch traps", traps(w) == {12, 26, 13.93} and 2 * 13 == 26 and near(math.sqrt(169 + 25), 13.93))

w = widget("pq-03-02", "rem-pq-rhombus-k")
chk("02.rem", w["answer"] == 5 and traps(w) == {10, 7} and F(3)**2 + F(4)**2 == F(5)**2
    and near(math.hypot(6, 8), 10, 1e-9))

# ============ pq-03-03 squares ============
chk("03.i1 full inheritance", correct_label(widget("pq-03-03", "i1")).startswith("Congruent, perpendicular"))

w = widget("pq-03-03", "k1")  # side 5 -> 7.07
chk("03.k1 A", near(5 * math.sqrt(2), w["answer"], w["tolerance"]))
SQ = [(0, 0), (5, 0), (5, 5), (0, 5)]
chk("03.k1 B (measured)", near(dist(SQ[0], SQ[2]), 5 * math.sqrt(2), 1e-12))
chk("03.k1 traps", traps(w) == {10, 3.54, 25} and near(5 / math.sqrt(2), 3.54) and 5**2 == 25)

w = widget("pq-03-03", "k2")  # diag 10 -> 7.07
chk("03.k2 A", near(10 / math.sqrt(2), w["answer"], w["tolerance"]))
chk("03.k2 B (rebuild: side 7.0711 gives diagonal 10)", near(10 / math.sqrt(2) * math.sqrt(2), 10, 1e-12))
chk("03.k2 traps", traps(w) == {14.14, 5, 100} and near(10 * math.sqrt(2), 14.14) and 10**2 == 100)
chk("03.k2 same numeric value as k1 is coincidence-checked", near(5 * math.sqrt(2), 10 / math.sqrt(2), 1e-12))

chk("03.k3 one-way arrows", correct_label(widget("pq-03-03", "k3")).startswith("Every square is a rhombus"))

w = widget("pq-03-03", "i2")
chk("03.i2", w["answer"] == 45 and traps(w) == {90, 60})
# Route B: measure diagonal-side angle on the model square
v_side = (5, 0)
v_diag = (5, 5)
ang = math.degrees(math.acos(dot(v_side, v_diag) / (5 * math.hypot(5, 5))))
chk("03.i2 B (measured 45)", near(ang, 45, 1e-9))

chk("03.ch certify square", correct_label(widget("pq-03-03", "ch")).startswith("Two consecutive sides"))
chk("03.rem inheritance routing", correct_label(widget("pq-03-03", "rem-pq-square-k")).startswith("The rhombus side"))

# ---- cross: every numeric trap distinct & outside tolerance; 45-45-90 dep ----
chk("dep: 45-45-90 ratio (rt-ch1)", near(math.hypot(1, 1), math.sqrt(2), 1e-12))
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
print("verify-pq-ch3: ALL GREEN")
