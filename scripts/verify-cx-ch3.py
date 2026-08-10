"""Dual-route verifier: coordinate-proofs ch3 (classification proofs).
Route A: exact Fraction arithmetic on every squared distance, slope, and slope
product. Route B: geometric MEASUREMENT and CONSTRUCTION — every classification
verdict re-derived by measuring the actual figure (hypot side lengths, atan2
angles at the vertices, dot products for right angles); Varignon verified by
constructing midpoints of the actual quadrilateral, measuring both slope pairs,
comparing to the MEASURED diagonal directions, and checking the half-length claim
by hypot; the general rectangle proof instanced twice ((8,6) and a second (a,b) =
(5,12)) with both diagonals measured; the apex-design challenge verified by
placing (4,4) and measuring the apex angle = 90 and the two slants equal;
falsifications — the parallelogram-only figure measurably fails BOTH upgrade
tests, the rhombus measurably fails the square test. Deps: cx-ch1 (distance,
midpoint, equidistance line), cx-ch2 (slope criteria), pq (tests being executed),
tm (rigid-motion placement license), sy (midsegment theorem behind Varignon)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/coordinate-proofs/lessons/cx-03-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cx-03-01", "cx-03-02", "cx-03-03"}, sorted(L)

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

def d2(A, B):
    return F(A[0] - B[0])**2 + F(A[1] - B[1])**2

def dist(A, B):
    return math.hypot(A[0] - B[0], A[1] - B[1])

def ang_at(V, A, B):
    a1 = math.atan2(A[1] - V[1], A[0] - V[0])
    a2 = math.atan2(B[1] - V[1], B[0] - V[0])
    d = abs(math.degrees(a1 - a2)) % 360
    return min(d, 360 - d)

def slope(A, B):
    return F(B[1] - A[1], B[0] - A[0])

def mid(A, B):
    return (F(A[0] + B[0], 2), F(A[1] + B[1], 2))

# ---- Route B foundations ----
# right-isosceles triangle measured
T = [(1, 1), (5, 3), (3, 7)]
chk("modelB: A(1,1) B(5,3) C(3,7) — angle at B measured 90, legs measured equal",
    near(ang_at(T[1], T[0], T[2]), 90, 1e-9) and near(dist(T[0], T[1]), dist(T[1], T[2]), 1e-12)
    and d2(T[0], T[1]) + d2(T[1], T[2]) == d2(T[0], T[2]))
# isosceles (0,0)(6,0)(3,5) measured + apex on x=3
chk("modelB: (0,0)(6,0)(3,5) — slants measured equal, base differs",
    near(dist((0, 0), (3, 5)), dist((6, 0), (3, 5)), 1e-12)
    and not near(dist((0, 0), (3, 5)), 6, 0.01))
# scalene measured: all three sides distinct
S = [(0, 0), (5, 1), (2, 4)]
sides = sorted([d2(S[0], S[1]), d2(S[1], S[2]), d2(S[0], S[2])])
chk("modelB: scalene 18/20/26 all distinct (exact)", sides == [18, 20, 26] and len(set(sides)) == 3)
# parallelogram-only PQRS: measured slopes match; upgrades measurably FAIL (falsifications)
Pq = [(1, 2), (6, 3), (7, 7), (2, 6)]
chk("modelB: PQRS both slope pairs equal; sides UNEQUAL (not rhombus); diagonals UNEQUAL (not rectangle)",
    slope(Pq[0], Pq[1]) == slope(Pq[3], Pq[2]) and slope(Pq[1], Pq[2]) == slope(Pq[0], Pq[3])
    and d2(Pq[0], Pq[1]) == 26 and d2(Pq[1], Pq[2]) == 17
    and d2(Pq[0], Pq[2]) == 61 and d2(Pq[1], Pq[3]) == 25)
# rhombus measured: 4 equal sides; perpendicular diagonals (dot); NOT square (vertex angle != 90)
R = [(0, 0), (5, 0), (8, 4), (3, 4)]
diag1 = (R[2][0] - R[0][0], R[2][1] - R[0][1])
diag2 = (R[3][0] - R[1][0], R[3][1] - R[1][1])
chk("modelB: rhombus — four sides measured 5, diagonal dot = 0, vertex angle measurably != 90",
    all(near(dist(R[i], R[(i + 1) % 4]), 5, 1e-12) for i in range(4))
    and diag1[0] * diag2[0] + diag1[1] * diag2[1] == 0
    and not near(ang_at(R[0], R[1], R[3]), 90, 1))
# square measured
Sq = [(0, 0), (3, 4), (-1, 7), (-4, 3)]
chk("modelB: square — four sides 5 AND all four vertex angles measured 90",
    all(near(dist(Sq[i], Sq[(i + 1) % 4]), 5, 1e-12) for i in range(4))
    and all(near(ang_at(Sq[i], Sq[(i - 1) % 4], Sq[(i + 1) % 4]), 90, 1e-9) for i in range(4)))
# WXYZ challenge: diagonal midpoints coincide; upgrades fail
Wx = [(0, 0), (7, 3), (6, 8), (-1, 5)]
chk("modelB: WXYZ diagonal midpoints coincide at (3,4); sides 58/26; diagonals 100/68",
    mid(Wx[0], Wx[2]) == (3, 4) and mid(Wx[1], Wx[3]) == (3, 4)
    and d2(Wx[0], Wx[1]) == 58 and d2(Wx[1], Wx[2]) == 26
    and d2(Wx[0], Wx[2]) == 100 and d2(Wx[1], Wx[3]) == 68)
# Varignon constructed & measured
V = [(0, 0), (8, 2), (10, 8), (2, 6)]
M = [mid(V[i], V[(i + 1) % 4]) for i in range(4)]
chk("modelB: Varignon — midpoints (4,1)(9,5)(6,7)(1,3); both slope pairs match; pairs equal MEASURED diagonal slopes",
    M == [(4, 1), (9, 5), (6, 7), (1, 3)]
    and slope(M[0], M[1]) == slope(M[3], M[2]) == slope(V[0], V[2]) == F(4, 5)
    and slope(M[1], M[2]) == slope(M[0], M[3]) == slope(V[1], V[3]) == F(-2, 3))
chk("modelB: Varignon half-length measured — |M0M1| = |diag|/2 and sqrt(164)/sqrt(41) = 2",
    near(dist((4, 1), (9, 5)) * 2, dist(V[0], V[2]), 1e-12)
    and near(math.sqrt(164) / math.sqrt(41), 2, 1e-12))
# general rectangle instanced twice
for (a, b) in [(8, 6), (5, 12)]:
    Rc = [(0, 0), (a, 0), (a, b), (0, b)]
    if not (near(dist(Rc[0], Rc[2]), dist(Rc[1], Rc[3]), 1e-12)
            and near(dist(Rc[0], Rc[2]), math.sqrt(a * a + b * b), 1e-12)):
        FAIL.append(f"rect {a},{b}")
chk("modelB: general rectangle diagonals congruent — instanced at (8,6)->10 and (5,12)->13",
    "rect 8,6" not in FAIL and "rect 5,12" not in FAIL
    and near(dist((0, 0), (8, 6)), 10, 1e-12) and near(dist((0, 0), (5, 12)), 13, 1e-12))
# apex design: (4,4) measured
chk("modelB: apex (4,4) over (0,0)-(8,0) — angle measured 90, slants measured equal",
    near(ang_at((4, 4), (0, 0), (8, 0)), 90, 1e-9)
    and near(dist((4, 4), (0, 0)), dist((4, 4), (8, 0)), 1e-12))
# rectangle's midpoint rhombus measured
RM = [mid((0, 0), (8, 0)), mid((8, 0), (8, 6)), mid((8, 6), (0, 6)), mid((0, 6), (0, 0))]
chk("modelB: rectangle midpoint figure — four sides measured 5 (rhombus)",
    all(near(dist(RM[i], RM[(i + 1) % 4]), 5, 1e-12) for i in range(4)))

# ============ cx-03-01 ============
chk("01.k1 isosceles verdict", correct_label(widget("cx-03-01", "k1")).startswith("Isosceles"))
chk("01.k1 arithmetic", d2((0, 0), (3, 5)) == 34 and d2((6, 0), (3, 5)) == 34 and d2((0, 0), (6, 0)) == 36)
w = widget("cx-03-01", "k2")
chk("01.k2", w["answer"] == -1 and slope((1, 1), (5, 3)) * slope((5, 3), (3, 7)) == -1
    and traps(w) == {1, -4, 0.25} and F(1, 2)**2 == F(1, 4))
chk("01.k3 right+isosceles", correct_label(widget("cx-03-01", "k3")).startswith("Right AND isosceles"))
chk("01.i1 two certificates", correct_label(widget("cx-03-01", "i1")).startswith("Slope product"))
w = widget("cx-03-01", "i2")
chk("01.i2", w["answer"] == 26 and sides == [18, 20, 26] and traps(w) == {20, 18})
w = widget("cx-03-01", "ch")
chk("01.ch A", w["answer"] == 4 and F(4, 4) * F(-4, 4) == -1 and traps(w) == {8, 5.66, 2}
    and near(4 * math.sqrt(2), 5.66) and F(2, 4) * F(-2, 4) == F(-1, 4))
chk("01.ch B (apex measured above)", near(ang_at((4, 4), (0, 0), (8, 0)), 90, 1e-9))
chk("01.rem isosceles 25/25/36", correct_label(widget("cx-03-01", "rem-cx-classify-tri-k")).startswith("Isosceles")
    and d2((0, 0), (3, 4)) == 25 and d2((6, 0), (3, 4)) == 25)

# ============ cx-03-02 ============
chk("02.k1 parallelogram", correct_label(widget("cx-03-02", "k1")).startswith("PQ \u2225 SR"))
chk("02.k2 upgrades fail", correct_label(widget("cx-03-02", "k2")).startswith("Neither"))
w = widget("cx-03-02", "k3")
chk("02.k3 A", w["answer"] == -1 and slope((0, 0), (8, 4)) * slope((5, 0), (3, 4)) == -1
    and traps(w) == {1, -0.25, 0})
chk("02.k3 B (dot measured above)", diag1[0] * diag2[0] + diag1[1] * diag2[1] == 0)
chk("02.i1 rhombus not square", correct_label(widget("cx-03-02", "i1")).startswith("Adjacent SIDE slopes"))
chk("02.i1 arithmetic", slope(R[0], R[1]) == 0 and slope(R[1], R[2]) == F(4, 3)
    and d2(R[0], R[2]) == 80 and d2(R[1], R[3]) == 20)
w = widget("cx-03-02", "i2")
chk("02.i2 square", w["answer"] == -1 and slope((0, 0), (3, 4)) * slope((3, 4), (-1, 7)) == -1
    and traps(w) == {1, 0.5625} and F(3, 4)**2 == F(9, 16))
chk("02.ch parallelogram via midpoints", correct_label(widget("cx-03-02", "ch")).startswith("Parallelogram"))
chk("02.rem midpoint test", correct_label(widget("cx-03-02", "rem-cx-classify-quad-k")).startswith("Parallelogram"))
chk("02.rem arithmetic", mid((0, 0), (4, 6)) == (2, 3) and mid((5, 1), (-1, 5)) == (2, 3))

# ============ cx-03-03 ============
w = widget("cx-03-03", "k1")
chk("03.k1", w["answer"] == 10 and d2((0, 0), (8, 6)) == 100 and d2((8, 0), (0, 6)) == 100
    and traps(w) == {14, 100, 48} and 8 + 6 == 14 and 8 * 6 == 48)
w = widget("cx-03-03", "k2")
chk("03.k2 A", near(w["answer"], 0.8) and slope((4, 1), (9, 5)) == F(4, 5) and traps(w) == {1.25, -0.67, 4}
    and F(5, 4) == 1.25)
chk("03.k2 B (Varignon measured above)", slope(M[0], M[1]) == slope(V[0], V[2]))
chk("03.k3 midsegment proof", correct_label(widget("cx-03-03", "k3")).startswith("Each midpoint segment"))
chk("03.i1 symmetric placement", correct_label(widget("cx-03-03", "i1")).startswith("(\u2212a, 0), (a, 0), (0, b)"))
w = widget("cx-03-03", "i2")
chk("03.i2 half-length", w["answer"] == 2 and F(164, 41) == 4 and traps(w) == {4, 0.5})
w = widget("cx-03-03", "ch")
chk("03.ch A", w["answer"] == 5 and traps(w) == {10, 7, 25} and F(8 + 6, 2) == 7)
chk("03.ch B (midpoint rhombus measured above)",
    all(near(dist(RM[i], RM[(i + 1) % 4]), 5, 1e-12) for i in range(4)))
w = widget("cx-03-03", "rem-cx-general-proof-k")
chk("03.rem", w["answer"] == 6 and F(12, 2) == 6 and traps(w) == {12, 24})

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
print("verify-cx-ch3: ALL GREEN")
