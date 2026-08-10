"""Dual-route verifier: polygons-quadrilaterals ch5 (tests, hierarchy, capstone).
Route A: exact Fraction algebra on every numeric. Route B: coordinate models —
build the certified figures and MEASURE the claimed certifications: a jig-rectangle
from equal mutually-bisecting diagonals; the 10/24 perpendicular-bisecting-diagonal
rhombus (measured sides + shoelace area for the 120 trap); the 8-15-17 rectangle;
plus FALSIFICATION of the invalid mixed-pairs test via the ch4 isosceles trapezoid
model (data holds, parallelogram-hood measurably fails). Deps: pq-ch1 (angle formula),
pq-ch2 (properties whose converses these are), pq-ch3 (upgrades), pq-ch4
(iso-trapezoid counterexample, kite geography), tc (SAS/CPCTC), cg (convention)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/polygons-quadrilaterals/lessons/pq-05-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"pq-05-01", "pq-05-02", "pq-05-03"}, sorted(L)

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

def dist(P, Q):
    return math.hypot(P[0] - Q[0], P[1] - Q[1])

def mid(P, Q):
    return ((P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2)

def slope_parallel(P, Q, R, S):
    return near((Q[1] - P[1]) * (S[0] - R[0]), (S[1] - R[1]) * (Q[0] - P[0]), 1e-9)

def shoelace(pts):
    s = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2

# ---- Route B: test-3 certification measured on a generic instance ----
# Diagonals along directions (4,1) and (-1,2) crossing at origin at their midpoints.
u, v = (4, 1), (-1, 2)
P1, P3 = (u[0], u[1]), (-u[0], -u[1])
P2, P4 = (v[0], v[1]), (-v[0], -v[1])
chk("modelB: mutual bisection => both side pairs parallel (measured)",
    slope_parallel(P1, P2, P4, P3) and slope_parallel(P2, P3, P1, P4))
chk("modelB: mutual bisection => opposite sides congruent (measured)",
    near(dist(P1, P2), dist(P3, P4), 1e-12) and near(dist(P2, P3), dist(P4, P1), 1e-12))
# jig: EQUAL rods crossing at midpoints -> rectangle (equal diagonals, right angles measured)
r1 = (5, 0)
r2 = (3, 4)  # same length 5
J1, J3, J2, J4 = r1, (-r1[0], -r1[1]), r2, (-r2[0], -r2[1])
def dot(a, b, c):
    return (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])
chk("modelB: equal rods at midpoints => right angle measured at a vertex",
    near(dot(J2, J1, J4), 0, 1e-9))
# falsification: mixed-pairs data on iso-trapezoid, parallelogram-hood fails
A, B, C, D = (0, 0), (10, 0), (8, 4), (2, 4)
chk("modelB: iso-trapezoid HAS mixed-pair data (AD congruent BC, AB parallel DC)",
    near(dist(A, D), dist(B, C), 1e-12) and slope_parallel(A, B, D, C))
chk("modelB: ...yet is NOT a parallelogram (legs measurably non-parallel)",
    not slope_parallel(A, D, B, C))
# the 10/24 rhombus (k1/k2)
R1, R2, R3, R4 = (5, 0), (0, 12), (-5, 0), (0, -12)
chk("modelB: 10/24 figure all sides 13 (measured)",
    all(near(dist(a, b), 13, 1e-12) for a, b in [(R1, R2), (R2, R3), (R3, R4), (R4, R1)]))
chk("modelB: 10/24 figure area 120 (shoelace, the k2 trap's true identity)",
    near(shoelace([R1, R2, R3, R4]), 120, 1e-12))
# the 8-15-17 rectangle (ch)
X1, X2, X3, X4 = (0, 0), (8, 0), (8, 15), (0, 15)
chk("modelB: 8x15 rectangle diagonals congruent 17 & bisecting (measured)",
    near(dist(X1, X3), 17, 1e-12) and near(dist(X2, X4), 17, 1e-12)
    and mid(X1, X3) == mid(X2, X4))

# ============ pq-05-01 ============
chk("01.i1 converse direction", correct_label(widget("pq-05-01", "i1")).startswith("A property flows FROM"))
w = widget("pq-05-01", "k1")
x = F(4 + 10, 3 - 1)
chk("01.k1 A", x == 7 and x + 4 == 11 and w["answer"] == 11)
chk("01.k1 B (both expressions agree at x=7)", 3 * 7 - 10 == 11)
chk("01.k1 traps", traps(w) == {7, 22, 3} and 2 * 11 == 22)
chk("01.k2 counterexample", correct_label(widget("pq-05-01", "k2")) == "An isosceles trapezoid")
chk("01.k3 valid test", correct_label(widget("pq-05-01", "k3")).startswith("PQ \u2245 SR and PQ \u2225 SR"))
chk("01.i2 jig rectangle", correct_label(widget("pq-05-01", "i2")).startswith("A rectangle"))
chk("01.ch minimal repair", correct_label(widget("pq-05-01", "ch")).startswith("Show AD \u2245 BC"))
chk("01.rem same-pair", correct_label(widget("pq-05-01", "rem-pq-para-tests-k")).startswith("One pair of opposite sides is both"))

# ============ pq-05-02 ============
chk("02.k1 up-flow", correct_label(widget("pq-05-02", "k1")).startswith("Always"))
chk("02.k2 down-flow", correct_label(widget("pq-05-02", "k2")).startswith("Sometimes \u2014 exactly when it has a right angle"))
chk("02.k3 branch-jump never", correct_label(widget("pq-05-02", "k3")).startswith("Never true"))
w = widget("pq-05-02", "i1")
chk("02.i1 A", w["answer"] == 90 and F((4 - 2) * 180, 4) == 90)
chk("02.i1 traps", traps(w) == {360, 108} and F((5 - 2) * 180, 5) == 108)
chk("02.i2 rhombus-kite always", correct_label(widget("pq-05-02", "i2")).startswith("Always"))
chk("02.ch verdicts", correct_label(widget("pq-05-02", "ch")) == "A: always. B: sometimes. C: never")
chk("02.rem up-flow", correct_label(widget("pq-05-02", "rem-pq-hierarchy-k")).startswith("Always true"))

# ============ pq-05-03 ============
chk("03.i1 most specific rhombus", correct_label(widget("pq-05-03", "i1")).startswith("Rhombus"))
w = widget("pq-05-03", "k1")
chk("03.k1 A", w["answer"] == 13 and F(5)**2 + F(12)**2 == F(13)**2)
chk("03.k1 B (measured)", near(dist(R1, R2), 13, 1e-12))
chk("03.k1 traps", traps(w) == {17, 26, 34} and 5 + 12 == 17
    and near(math.hypot(10, 24), 26, 1e-9) and 10 + 24 == 34)
w = widget("pq-05-03", "k2")
chk("03.k2 A", w["answer"] == 52 and 4 * 13 == 52)
chk("03.k2 traps", traps(w) == {13, 120, 68} and 0.5 * 10 * 24 == 120 and 2 * (10 + 24) == 68)
chk("03.k3 kite geography", correct_label(widget("pq-05-03", "k3")).startswith("Kite"))
chk("03.i2 congruent diagonals", correct_label(widget("pq-05-03", "i2")).startswith("The diagonals are congruent"))
w = widget("pq-05-03", "ch")
chk("03.ch A", w["answer"] == 15 and F(17)**2 - F(8)**2 == F(15)**2)
chk("03.ch B (measured on 8x15 rectangle)", near(dist(X2, X3), 15, 1e-12))
chk("03.ch traps", traps(w) == {9, 18.79, 12.5} and 17 - 8 == 9
    and near(math.sqrt(289 + 64), 18.79) and (17 + 8) / 2 == 12.5)
chk("03.rem rectangle stop", correct_label(widget("pq-05-03", "rem-pq-capstone-k")) == "Rectangle")

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
print("verify-pq-ch5: ALL GREEN")
