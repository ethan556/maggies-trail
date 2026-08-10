"""Dual-route verifier: coordinate-proofs ch4 (perimeter & area on the plane).
Route A: exact arithmetic — Fraction/integer side sums, box-minus-corners
decompositions term by term, shoelace cross-terms recomputed symbolically.
Route B: independent MEASUREMENT — perimeters re-summed with hypot in a
different traversal order; every area computed by a SECOND method than the
lesson's route (Monte-Carlo-free: triangulation-from-vertex fan using the exact
shoelace on triangles vs the box decomposition vs g7 formulas), Varignon's
half-area verified by measuring parent and child independently, the surveyor
pentagon audited by box-minus-corner. Falsification: a scrambled (self-crossing)
vertex order provably prices a DIFFERENT area than boundary order. Deps: cx-ch1
(distance), cx-ch3 (right-isosceles triangle + Varignon reused by design),
g7 (trapezoid formula), rt (3-4-5s)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/coordinate-proofs/lessons/cx-04-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cx-04-01", "cx-04-02", "cx-04-03"}, sorted(L)

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

def perim(P):
    return sum(math.hypot(P[i][0] - P[(i + 1) % len(P)][0],
                          P[i][1] - P[(i + 1) % len(P)][1]) for i in range(len(P)))

def shoe(P):
    s = F(0)
    for i in range(len(P)):
        x1, y1 = P[i]
        x2, y2 = P[(i + 1) % len(P)]
        s += F(x1) * y2 - F(x2) * y1
    return abs(s) / 2

def fan_area(P):
    """Independent second route: triangulate from vertex 0, sum exact triangle areas."""
    total = F(0)
    for i in range(1, len(P) - 1):
        total += shoe([P[0], P[i], P[i + 1]])
    return total

# ---- Route B foundations ----
T345 = [(0, 0), (6, 0), (6, 8)]
chk("modelB: 3-4-5 lap — perimeter measured 24 (reverse order too)",
    near(perim(T345), 24, 1e-12) and near(perim(T345[::-1]), 24, 1e-12))
RH = [(0, 0), (5, 0), (8, 4), (3, 4)]
chk("modelB: rhombus perimeter measured 20", near(perim(RH), 20, 1e-12))
TR = [(0, 0), (8, 0), (6, 4), (2, 4)]
chk("modelB: trapezoid perimeter measured 12+4sqrt5; area by g7 formula == shoelace == fan == 24",
    near(perim(TR), 12 + 4 * math.sqrt(5), 1e-12)
    and F(8 + 4, 2) * 4 == 24 and shoe(TR) == 24 and fan_area(TR) == 24)
TRI = [(1, 1), (5, 3), (3, 7)]
chk("modelB: ch3 triangle — box(24)-corners(14) == shoelace == fan == leg-route 10",
    4 * 6 - (F(4 * 2, 2) + F(2 * 4, 2) + F(2 * 6, 2)) == 10
    and shoe(TRI) == 10 and fan_area(TRI) == 10
    and F(1, 2) * 20 == 10)
Q = [(0, 0), (8, 2), (10, 8), (2, 6)]
# the four OUTSIDE corner triangles, each shoelaced independently:
corners_q = (shoe([(0, 0), (10, 0), (8, 2)]) + shoe([(10, 0), (10, 8), (8, 2)])
             + shoe([(10, 8), (0, 8), (2, 6)]) + shoe([(0, 8), (0, 0), (2, 6)]))
chk("modelB: quad — box(80)-corners == shoelace == fan == 44",
    10 * 8 - corners_q == 44 and shoe(Q) == 44 and fan_area(Q) == 44)
M = [(4, 1), (9, 5), (6, 7), (1, 3)]
chk("modelB: Varignon half-area — child shoelace 22 == parent/2, fan agrees",
    shoe(M) == 22 and shoe(Q) == 44 and fan_area(M) == 22)
PENT = [(0, 0), (9, 0), (9, 5), (5, 8), (0, 8)]
chk("modelB: pentagon — perimeter measured 32; shoelace == fan == 66 == box(72)-corner(6)",
    near(perim(PENT), 32, 1e-12) and shoe(PENT) == 66 and fan_area(PENT) == 66
    and 9 * 8 - F(4 * 3, 2) == 66)
ISO = [(-3, 0), (3, 0), (0, 4)]
chk("modelB: symmetric isosceles — perimeter measured 16", near(perim(ISO), 16, 1e-12))
# falsification: scrambled order prices a different figure
SCR = [(0, 0), (10, 8), (8, 2), (2, 6)]
chk("modelB: scrambled-order falsification — bowtie area != 44", shoe(SCR) != 44)
# reversal invariance (benign change)
chk("modelB: reversed order — same 44", shoe(Q[::-1]) == 44)
# radical hygiene: 4*sqrt(18) == 12*sqrt(2), and early rounding differs
chk("modelB: 4sqrt18 == 12sqrt2 exactly; 4*4.24 measurably below the true value",
    near(4 * math.sqrt(18), 12 * math.sqrt(2), 1e-12)
    and abs(4 * 4.24 - 12 * math.sqrt(2)) > 0.005)

# ============ cx-04-01 ============
w = widget("cx-04-01", "k1")
chk("01.k1", w["answer"] == 24 and 6 + 8 + 10 == 24 and traps(w) == {14, 48, 10})
w = widget("cx-04-01", "k2")
chk("01.k2", w["answer"] == 20 and traps(w) == {25, 10, 100})
w = widget("cx-04-01", "k3")
chk("01.k3", near(w["answer"], 12 + 4 * math.sqrt(5), 0.05) and traps(w) == {16.47, 24, 20}
    and near(12 + math.sqrt(20), 16.47, 0.005))
chk("01.i1 radical hygiene", correct_label(widget("cx-04-01", "i1")).startswith("4\u221a18"))
w = widget("cx-04-01", "i2")
chk("01.i2", w["answer"] == 16 and traps(w) == {10, 11})
w = widget("cx-04-01", "ch")
chk("01.ch A", w["answer"] == 32 and 9 + 5 + 5 + 5 + 8 == 32 and traps(w) == {27, 24, 33.4}
    and 32 - 5 == 27 and near(9 + 5 + math.sqrt(41) + 5 + 8, 33.4, 0.1))
chk("01.ch B (measured above)", near(perim(PENT), 32, 1e-12))
w = widget("cx-04-01", "rem-cx-perimeter-k")
chk("01.rem", w["answer"] == 12 and traps(w) == {7, 5})

# ============ cx-04-02 ============
w = widget("cx-04-02", "k1")
chk("02.k1", w["answer"] == 24 and (5 - 1) * (7 - 1) == 24 and traps(w) == {10, 28, 20})
w = widget("cx-04-02", "k2")
chk("02.k2", w["answer"] == 10 and 24 - 14 == 10 and traps(w) == {14, 24, 5})
w = widget("cx-04-02", "k3")
chk("02.k3 leg audit", w["answer"] == 10 and traps(w) == {20, 4.47, 40}
    and near(math.sqrt(20), 4.47, 0.005))
chk("02.i1 axis-aligned corners", correct_label(widget("cx-04-02", "i1")).startswith("Every subtracted corner"))
w = widget("cx-04-02", "i2")
chk("02.i2", w["answer"] == 44 and 80 - 36 == 44 and corners_q == 36 and traps(w) == {36, 80})
w = widget("cx-04-02", "ch")
chk("02.ch A", w["answer"] == 24 and F(8 + 4, 2) * 4 == 24 and 32 - 8 == 24
    and traps(w) == {32, 48, 20.94})
chk("02.ch B (three routes agree above)", shoe(TR) == 24)
w = widget("cx-04-02", "rem-cx-area-box-k")
chk("02.rem", w["answer"] == 8 and 16 - 8 == 8 and shoe([(0, 0), (4, 2), (0, 4)]) == 8
    and traps(w) == {16, 4})

# ============ cx-04-03 ============
w = widget("cx-04-03", "k1")
terms_tri = [F(1) * 3 - F(5) * 1, F(5) * 7 - F(3) * 3, F(3) * 1 - F(1) * 7]
chk("03.k1", w["answer"] == 10 and terms_tri == [-2, 26, -4] and sum(terms_tri) == 20
    and traps(w) == {20, 5, 32} and 2 + 26 + 4 == 32)
w = widget("cx-04-03", "k2")
terms_q = [F(0) * 2 - F(8) * 0, F(8) * 8 - F(10) * 2, F(10) * 6 - F(2) * 8, F(2) * 0 - F(0) * 6]
chk("03.k2", w["answer"] == 44 and terms_q == [0, 44, 44, 0] and traps(w) == {88, 22, 80})
chk("03.k3 reversal", correct_label(widget("cx-04-03", "k3")).startswith("The raw sum flips sign"))
chk("03.k3 B (reversal measured above)", shoe(Q[::-1]) == 44)
w = widget("cx-04-03", "i1")
chk("03.i1 Varignon half", w["answer"] == 22 and shoe(M) == 22 and traps(w) == {44, 11})
chk("03.i2 scrambled fatal", correct_label(widget("cx-04-03", "i2")).startswith("Scrambled order"))
chk("03.i2 B (bowtie measured above)", shoe(SCR) != 44)
w = widget("cx-04-03", "ch")
terms_p = [F(0), F(9) * 5 - F(9) * 0, F(9) * 8 - F(5) * 5, F(5) * 8 - F(0) * 8, F(0) * 0 - F(0) * 8]
chk("03.ch A", w["answer"] == 66 and terms_p == [0, 45, 47, 40, 0] and sum(terms_p) == 132
    and traps(w) == {132, 72, 33} and 9 * 8 == 72)
chk("03.ch B (fan + box audits above)", fan_area(PENT) == 66)
w = widget("cx-04-03", "rem-cx-shoelace-k")
chk("03.rem", w["answer"] == 12 and shoe([(0, 0), (6, 0), (0, 4)]) == 12 and traps(w) == {24, 48})

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
print("verify-cx-ch4: ALL GREEN")
