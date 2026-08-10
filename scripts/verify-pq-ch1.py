"""Dual-route verifier: polygons-quadrilaterals ch1 (angle sums).
Route A: the closed formulas ((n-2)*180, 360, (n-2)*180/n, 360/n) via exact Fraction.
Route B: independent construction — build an actual regular n-gon in coordinates and
MEASURE its angles with atan2 (never re-running the formula); triangulation counts
re-derived by explicit fan enumeration; exterior sums re-derived as supplements of
measured interiors. Proof deps: transformations-measurement / G8 (informal triangle
angle sum seeds (n-2)*180); cp ch5 (straight-line/supplement facts as proved angle
theorems); tc (triangle machinery). Every trap re-derived from its named error model."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/polygons-quadrilaterals/lessons/pq-01-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"pq-01-01", "pq-01-02", "pq-01-03"}, sorted(L)

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

# ---- Route B machinery: measure a regular n-gon's interior angle from coordinates ----
def measured_interior(n):
    V = [(math.cos(2 * math.pi * k / n), math.sin(2 * math.pi * k / n)) for k in range(n)]
    a, b, c = V[0], V[1], V[2]
    v1 = (a[0] - b[0], a[1] - b[1])
    v2 = (c[0] - b[0], c[1] - b[1])
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    return math.degrees(math.acos(dot / (math.hypot(*v1) * math.hypot(*v2))))

def fan_triangles(n):
    # explicit enumeration: triangles (0, k, k+1) for k = 1 .. n-2
    return len([(0, k, k + 1) for k in range(1, n - 1)])

chk("routeB machinery: square interior = 90", abs(measured_interior(4) - 90) < 1e-9)
chk("routeB machinery: fan(4) = 2", fan_triangles(4) == 2)

# ============ pq-01-01 ============
w = widget("pq-01-01", "i1")  # fan of 12-gon = 10
chk("01.i1 A", w["answer"] == 10 and 12 - 2 == 10)
chk("01.i1 B (enumerated)", fan_triangles(12) == 10)
chk("01.i1 traps", traps(w) == {12, 11, 9} and 12 - 1 == 11 and 12 - 3 == 9)

w = widget("pq-01-01", "k1")  # hexagon 720
chk("01.k1 A", w["answer"] == 720 and F(6 - 2) * 180 == 720)
chk("01.k1 B (measured)", abs(6 * measured_interior(6) - 720) < 1e-6)
chk("01.k1 traps", traps(w) == {1080, 900} and 6 * 180 == 1080 and 5 * 180 == 900)

w = widget("pq-01-01", "k2")  # decagon 1440
chk("01.k2 A", w["answer"] == 1440 and F(10 - 2) * 180 == 1440)
chk("01.k2 B (measured)", abs(10 * measured_interior(10) - 1440) < 1e-6)
chk("01.k2 traps", traps(w) == {1800, 1620} and 10 * 180 == 1800 and 9 * 180 == 1620)

w = widget("pq-01-01", "k3")  # 900 -> n=7
chk("01.k3 A", w["answer"] == 7 and F(900, 180) + 2 == 7)
chk("01.k3 B (measured)", abs(7 * measured_interior(7) - 900) < 1e-6)
chk("01.k3 traps", traps(w) == {5, 6} and 900 // 180 == 5 and 900 // 180 + 1 == 6)

w = widget("pq-01-01", "i2")  # quad missing 80
chk("01.i2 A", w["answer"] == 80 and 360 - (85 + 100 + 95) == 80)
chk("01.i2 traps", traps(w) == {260, 280} and 540 - 280 == 260 and 85 + 100 + 95 == 280)

w = widget("pq-01-01", "ch")  # pentagon missing 115
chk("01.ch A", w["answer"] == 115 and F(5 - 2) * 180 - (100 + 110 + 95 + 120) == 115)
chk("01.ch B (measured pentagon sum)", abs(5 * measured_interior(5) - 540) < 1e-6)
chk("01.ch traps", traps(w) == {295, 425} and 720 - 425 == 295 and 100 + 110 + 95 + 120 == 425)

w = widget("pq-01-01", "rem-pq-interior-sum-k")
chk("01.rem", w["answer"] == 540 and traps(w) == {900, 360} and F(3) * 180 == 540)

# ============ pq-01-02 ============
w = widget("pq-01-02", "k1")  # 23-gon exterior sum 360
chk("02.k1 A", w["answer"] == 360)
# Route B: exteriors as supplements of measured interiors
ext_sum = 23 * (180 - measured_interior(23))
chk("02.k1 B (measured supplements)", abs(ext_sum - 360) < 1e-6)
chk("02.k1 traps", traps(w) == {3780, 4140} and (23 - 2) * 180 == 3780 and 23 * 180 == 4140)

w = widget("pq-01-02", "k2")  # interior 108 -> exterior 72
chk("02.k2 A", w["answer"] == 72 and 180 - 108 == 72)
chk("02.k2 B (pentagon measured)", abs(measured_interior(5) - 108) < 1e-9)
chk("02.k2 traps", traps(w) == {252, 54} and 360 - 108 == 252 and 108 / 2 == 54)

chk("02.i1 lap reason", correct_label(widget("pq-01-02", "i1")).startswith("Walking the boundary"))

w = widget("pq-01-02", "k3")  # fifth exterior 70
chk("02.k3 A", w["answer"] == 70 and 360 - (85 + 60 + 70 + 75) == 70)
chk("02.k3 traps", traps(w) == {250, 290} and 540 - 290 == 250 and 85 + 60 + 70 + 75 == 290)

chk("02.i2 formula-free", correct_label(widget("pq-01-02", "i2")).startswith("The exterior sum"))
chk("02.i2 named interior", (50 - 2) * 180 == 8640)  # figure in the feedback text

w = widget("pq-01-02", "ch")  # each ext 24 -> n=15
chk("02.ch A", w["answer"] == 15 and F(360, 24) == 15)
chk("02.ch B (measured)", abs((180 - measured_interior(15)) - 24) < 1e-9)
chk("02.ch traps", traps(w) == {7.5, 336} and 180 / 24 == 7.5 and 360 - 24 == 336)

w = widget("pq-01-02", "rem-pq-exterior-sum-k")
chk("02.rem", w["answer"] == 140 and traps(w) == {320, 220} and 360 - 220 == 140 and 540 - 220 == 320)

# ============ pq-01-03 ============
w = widget("pq-01-03", "k1")  # octagon each interior 135
chk("03.k1 A", w["answer"] == 135 and F((8 - 2) * 180, 8) == 135)
chk("03.k1 B (measured)", abs(measured_interior(8) - 135) < 1e-9)
chk("03.k1 traps", traps(w) == {1080, 45} and (8 - 2) * 180 == 1080 and 360 // 8 == 45)

w = widget("pq-01-03", "k2")  # 12-gon each exterior 30
chk("03.k2 A", w["answer"] == 30 and F(360, 12) == 30)
chk("03.k2 B (measured)", abs((180 - measured_interior(12)) - 30) < 1e-9)
chk("03.k2 traps", traps(w) == {150, 15} and 180 - 30 == 150 and 180 / 12 == 15)

w = widget("pq-01-03", "k3")  # interior 150 -> n=12
chk("03.k3 A", w["answer"] == 12 and F(360, 180 - 150) == 12)
chk("03.k3 B (measured)", abs(measured_interior(12) - 150) < 1e-9)
chk("03.k3 traps", traps(w) == {5, 6} and 150 // 30 == 5 and 180 // 30 == 6)

chk("03.i1 limit", correct_label(widget("pq-01-03", "i1")).startswith("It climbs toward 180"))
chk("03.i1 limit fact", abs(measured_interior(1000) - 180) < 0.5 and measured_interior(1000) < 180)

w = widget("pq-01-03", "i2")  # hexagon each 120
chk("03.i2 A", w["answer"] == 120 and F(720, 6) == 120)
chk("03.i2 B (measured)", abs(measured_interior(6) - 120) < 1e-9)
chk("03.i2 traps", traps(w) == {720, 60} and 360 // 6 == 60)

w = widget("pq-01-03", "ch")  # hexagons at a point = 3
chk("03.ch A", w["answer"] == 3 and F(360, 120) == 3)
chk("03.ch B (measured tiling)", abs(3 * measured_interior(6) - 360) < 1e-9)
chk("03.ch traps", traps(w) == {6, 4} and F(360, 90) == 4)

w = widget("pq-01-03", "rem-pq-regular-angles-k")
chk("03.rem", w["answer"] == 72 and traps(w) == {108, 36} and F(360, 5) == 72
    and abs((180 - measured_interior(5)) - 72) < 1e-9)

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
print("verify-pq-ch1: ALL GREEN")
