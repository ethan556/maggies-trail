"""Dual-route verifier: coordinate-proofs ch1 (distance, midpoint, applications).
Route A: exact Fraction/integer arithmetic on the formulas (squares kept exact;
irrational answers checked as squared integers). Route B: independent geometric
reconstruction — distances re-measured with math.hypot on the raw points (a
different code path than the formula), symmetry d(A,B)==d(B,A) checked on
concrete pairs, midpoints verified by MEASURING both halves equal AND collinear
(cross-product zero), the endpoint inversion verified by re-averaging, the
parallelogram challenge verified by measuring BOTH pairs of opposite sides equal
on the solved vertex, equidistance verified by sampling three y-values on x=3,
the Pythagorean-converse triple verified by building an actual 20/45/65 triangle
from coordinates and measuring its right angle, and the wire routes re-summed.
Falsification: a NON-midpoint fails the equal-halves test. Deps: tm-ch4
(Pythagoras), pq (diagonal bisection cited by the challenge), gf (unsigned
segment measure convention)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/coordinate-proofs/lessons/cx-01-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cx-01-01", "cx-01-02", "cx-01-03"}, sorted(L)

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

def d(P, Q):
    return math.hypot(P[0] - Q[0], P[1] - Q[1])

def is_mid(M, A, B):
    """Measured: both halves equal AND collinear."""
    cross = (B[0] - A[0]) * (M[1] - A[1]) - (B[1] - A[1]) * (M[0] - A[0])
    return near(d(A, M), d(M, B), 1e-12) and abs(cross) < 1e-9 and near(d(A, M) + d(M, B), d(A, B), 1e-12)

# ---- Route B foundations ----
A, B = (1, 2), (7, 10)
chk("modelB: d(A,B)=10 by hypot; symmetric both orders", near(d(A, B), 10, 1e-12) and near(d(B, A), 10, 1e-12))
chk("modelB: signed pair (-3,4),(3,-4) measures 10", near(d((-3, 4), (3, -4)), 10, 1e-12))
chk("modelB: vertical (4,7),(4,-2) measures 9", near(d((4, 7), (4, -2)), 9, 1e-12))
M = (4, 6)
chk("modelB: (4,6) IS the midpoint of A,B (equal halves + collinear, measured)", is_mid(M, A, B))
chk("modelB: falsification — (4,7) is NOT the midpoint", not is_mid((4, 7), A, B))
M2 = (5, 5)
chk("modelB: (5,5) is midpoint of (2,3),(8,7)", is_mid(M2, (2, 3), (8, 7)))
chk("modelB: endpoint inversion re-averages — (2*5-2, 2*5-3)=(8,7) averages back to (5,5)",
    (2 * 5 - 2, 2 * 5 - 3) == (8, 7) and ((2 + 8) / 2, (3 + 7) / 2) == (5.0, 5.0))
# parallelogram challenge: S=(2,7) makes BOTH opposite side pairs equal
Pt, Q, R, S = (0, 1), (5, 0), (7, 6), (2, 7)
chk("modelB: parallelogram P(0,1)Q(5,0)R(7,6)S(2,7) — opposite sides measured equal AND diagonal midpoints coincide",
    near(d(Pt, Q), d(S, R), 1e-12) and near(d(Q, R), d(Pt, S), 1e-12)
    and is_mid((3.5, 3.5), Pt, R) and is_mid((3.5, 3.5), Q, S))
# equidistance sampled on x=3
chk("modelB: x=3 equidistant from (0,0),(6,0) at three sampled heights",
    all(near(d((3, y), (0, 0)), d((3, y), (6, 0)), 1e-12) for y in [-2, 0.5, 7]))
# Pythagorean-converse triple 20/45/65 built and measured
T1, T2, T3 = (0, 0), (2, 4), (2 - 6, 4 + 3)  # sides^2: 4+16=20; 36+9=45; T1->T3: 16+49=65
chk("modelB: triangle with squared sides 20/45/65 constructed; right angle measured at T2",
    near(d(T1, T2)**2, 20, 1e-9) and near(d(T2, T3)**2, 45, 1e-9) and near(d(T1, T3)**2, 65, 1e-9)
    and abs((T1[0] - T2[0]) * (T3[0] - T2[0]) + (T1[1] - T2[1]) * (T3[1] - T2[1])) < 1e-9)
# wire routes re-summed
chk("modelB: wire routes 13 vs 9+3=12, gap 1",
    near(d((0, 0), (5, 12)), 13, 1e-12) and near(d((0, 0), (9, 0)) + d((9, 0), (9, 3)), 12, 1e-12))
# isosceles + perimeter measured
chk("modelB: isosceles (0,0)(6,0)(3,5) — two sides measure sqrt(34)",
    near(d((0, 0), (3, 5)), math.sqrt(34), 1e-12) and near(d((6, 0), (3, 5)), math.sqrt(34), 1e-12))
chk("modelB: perimeter (0,0)(3,4)(6,0) measured 16",
    near(d((0, 0), (3, 4)) + d((3, 4), (6, 0)) + d((6, 0), (0, 0)), 16, 1e-12))

# ============ cx-01-01 ============
w = widget("cx-01-01", "k1")
chk("01.k1 A", w["answer"] == 10 and F(6)**2 + F(8)**2 == F(10)**2 and traps(w) == {14, 100, 3.74}
    and near(math.sqrt(14), 3.74) and 6 + 8 == 14)
w = widget("cx-01-01", "k2")
chk("01.k2", w["answer"] == 10 and F(6)**2 + F(-8)**2 == 100 and traps(w) == {0, 2, 14})
w = widget("cx-01-01", "k3")
chk("01.k3", w["answer"] == 9 and abs(7 - (-2)) == 9 and traps(w) == {5, 81, 11}
    and 7 - 2 == 5 and 4 + 7 == 11)
chk("01.i1 symmetry", correct_label(widget("cx-01-01", "i1")).startswith("Always equal"))
w = widget("cx-01-01", "i2")
chk("01.i2 tie at sqrt50", near(w["answer"], math.sqrt(50), 0.05) and traps(w) == {50, 10}
    and near(d((5, 5), (0, 0)), d((1, 7), (0, 0)), 1e-12))
w = widget("cx-01-01", "ch")
chk("01.ch A", w["answer"] == 9 and F(9 - 1)**2 + 36 == 100 and F(-7 - 1)**2 + 36 == 100)
chk("01.ch B (both k-solutions measured at distance 10)",
    near(d((9, 8), (1, 2)), 10, 1e-12) and near(d((-7, 8), (1, 2)), 10, 1e-12))
chk("01.ch traps", traps(w) == {65, -7, 11} and 100 - 36 + 1 == 65 and 1 + 10 == 11)
w = widget("cx-01-01", "rem-cx-distance-k")
chk("01.rem", w["answer"] == 5 and traps(w) == {7, 25})

# ============ cx-01-02 ============
w = widget("cx-01-02", "k1")
chk("02.k1", w["answer"] == 5 and F(2 + 8, 2) == 5 and traps(w) == {6, 10, 3})
w = widget("cx-01-02", "k2")
chk("02.k2 A", w["answer"] == 1 and F(5 + (-3), 2) == 1 and traps(w) == {4, -1, 2}
    and F(5 + 3, 2) == 4 and F(-6 + 4, 2) == -1)
chk("02.k2 B (measured midpoint)", is_mid((-1, 1), (-6, 5), (4, -3)))
w = widget("cx-01-02", "k3")
chk("02.k3", w["answer"] == 8 and 2 * 5 - 2 == 8 and traps(w) == {3.5, 7, 12}
    and F(5 + 2, 2) == 3.5 and 2 * 5 - 3 == 7 and 2 * 5 + 2 == 12)
w = widget("cx-01-02", "i1")
chk("02.i1 half-distance", w["answer"] == 5 and traps(w) == {10, 4} and near(d((1, 2), (4, 6)), 5, 1e-12))
chk("02.i2 similar triangles", correct_label(widget("cx-01-02", "i2")).startswith("Similar right triangles"))
w = widget("cx-01-02", "ch")
chk("02.ch A", w["answer"] == 2 and 2 * 3.5 - 5 == 2 and F(0 + 7, 2) == 3.5)
chk("02.ch B (parallelogram measured above)", near(d((0, 1), (5, 0)), d((2, 7), (7, 6)), 1e-12))
chk("02.ch traps", traps(w) == {3.5, 12, -2} and 5 + 7 == 12 and 5 - 7 == -2)
w = widget("cx-01-02", "rem-cx-midpoint-k")
chk("02.rem", w["answer"] == 5 and traps(w) == {8, 4})

# ============ cx-01-03 ============
w = widget("cx-01-03", "k1")
chk("03.k1 A", near(w["answer"], math.sqrt(34), 0.05) and traps(w) == {8, 34, 4}
    and 3 + 5 == 8 and near(math.sqrt(25 - 9), 4, 1e-9))
w = widget("cx-01-03", "k2")
chk("03.k2 A", w["answer"] == 16 and 5 + 5 + 6 == 16 and traps(w) == {11, 14, 12}
    and 3 + 4 + 3 + 4 == 14)
chk("03.k3 converse", correct_label(widget("cx-01-03", "k3")).startswith("Right \u2014"))
chk("03.k3 arithmetic", 20 + 45 == 65)
w = widget("cx-01-03", "i1")
chk("03.i1 bisector", w["answer"] == 3 and traps(w) == {6, 0})
chk("03.i2 cheap side", correct_label(widget("cx-01-03", "i2")).startswith("Both endpoints share y = 0"))
w = widget("cx-01-03", "ch")
chk("03.ch A", w["answer"] == 1 and 13 - 12 == 1 and traps(w) == {13, 12, 5})
w = widget("cx-01-03", "rem-cx-dist-apps-k")
chk("03.rem", w["answer"] == 5 and traps(w) == {7, 25})

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
print("verify-cx-ch1: ALL GREEN")
