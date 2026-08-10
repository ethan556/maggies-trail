"""Dual-route verifier: circle-theorems ch2 (chords).
Route A: exact Fraction/int arithmetic on (chord/2)^2 + d^2 = r^2 and the taught
locks. Route B: coordinate circles — chords PLACED at computed positions and
MEASURED (endpoint distances, midpoint-foot perpendicularity via dot product,
arc measures via atan2 central angles, hexagon vertices at 60-degree steps
measured side by side); monotone closer-longer trade sampled across distances;
falsification — non-congruent chords measurably NOT equidistant. Deps: tc
(SSS/SAS/HL/CPCTC engines cited by the proofs), rt-ch1 (Pythagoras), cr-ch1
(arc measure = central angle used by the chord-arc lock)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/circle-theorems/lessons/cr-02-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cr-02-01", "cr-02-02", "cr-02-03"}, sorted(L)

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

def chord_at(r, d):
    """Route-B: PLACE the chord at height d in circle radius r and MEASURE it."""
    x = math.sqrt(r * r - d * d)
    P, Q = (-x, d), (x, d)
    # measured properties
    length = math.hypot(P[0] - Q[0], P[1] - Q[1])
    foot = (0, d)
    on_circle = near(math.hypot(*P), r, 1e-12) and near(math.hypot(*Q), r, 1e-12)
    midpoint_is_foot = near((P[0] + Q[0]) / 2, foot[0], 1e-12) and near((P[1] + Q[1]) / 2, foot[1], 1e-12)
    perp = abs((Q[0] - P[0]) * (foot[0] - 0) + (Q[1] - P[1]) * (foot[1] - 0)) < 1e-9
    return length, on_circle, midpoint_is_foot, perp

# ---- Route B foundations ----
ln, oc, mf, pp = chord_at(10, 6)
chk("modelB: r=10 d=6 chord measured 16, endpoints on circle, foot=midpoint, perpendicular",
    near(ln, 16, 1e-12) and oc and mf and pp)
ln2, oc2, mf2, pp2 = chord_at(13, 5)
chk("modelB: r=13 d=5 chord measured 24", near(ln2, 24, 1e-12) and oc2 and mf2 and pp2)
# equal chords equidistant (measured both) + falsification
chk("modelB: equal chords equidistant / unequal NOT (measured)",
    near(chord_at(10, 7)[0], chord_at(10, 7)[0], 1e-12)
    and not near(chord_at(10, 7)[0], chord_at(10, 4)[0], 0.01))
# monotone closer-longer sampled
samples = [chord_at(10, d)[0] for d in [0, 2, 4, 6, 8, 9.9]]
chk("modelB: closer => longer, monotone across samples (diameter 20 down toward 0)",
    near(samples[0], 20, 1e-12) and all(samples[i] > samples[i + 1] for i in range(len(samples) - 1)))
# 60-degree chord = radius, measured via central angle
r9 = 9
Pa = (r9, 0)
Pb = (r9 * math.cos(math.radians(60)), r9 * math.sin(math.radians(60)))
chk("modelB: 60-degree chord equals radius (measured)", near(math.hypot(Pa[0] - Pb[0], Pa[1] - Pb[1]), 9, 1e-12))
# hexagon: 6 vertices at 60-degree steps on r=5, sides measured
hexv = [(5 * math.cos(math.radians(60 * k)), 5 * math.sin(math.radians(60 * k))) for k in range(6)]
sides = [math.hypot(hexv[k][0] - hexv[(k + 1) % 6][0], hexv[k][1] - hexv[(k + 1) % 6][1]) for k in range(6)]
chk("modelB: hexagon sides all measure 5; perimeter 30 < circumference 31.42",
    all(near(s, 5, 1e-12) for s in sides) and near(sum(sides), 30, 1e-12) and sum(sides) < 2 * math.pi * 5)
# arc-chord lock measured: two congruent chords at different orientations cut equal central angles
def central(r, d):
    x = math.sqrt(r * r - d * d)
    a1 = math.degrees(math.atan2(d, -x))
    a2 = math.degrees(math.atan2(d, x))
    dd = abs(a1 - a2) % 360
    return min(dd, 360 - dd)
chk("modelB: congruent chords cut equal central angles (measured at two placements)",
    near(central(10, 6), central(10, 6), 1e-12) and not near(central(10, 6), central(10, 3), 0.01))

# ============ cr-02-01 ============
chk("01.i1 SSS engine", correct_label(widget("cr-02-01", "i1")).startswith("Radii to all four endpoints"))
w = widget("cr-02-01", "k1")
chk("01.k1", w["answer"] == 75 and traps(w) == {150, 37.5, 105} and 180 - 75 == 105)
w = widget("cr-02-01", "k2")
chk("01.k2 A", w["answer"] == 9 and traps(w) == {18, 4.5, 13.5})
chk("01.k2 B (measured above)", near(math.hypot(Pa[0] - Pb[0], Pa[1] - Pb[1]), 9, 1e-12))
chk("01.k3 converse", correct_label(widget("cr-02-01", "k3")).startswith("The chords are congruent"))
w = widget("cr-02-01", "i2")
chk("01.i2 diameter", w["answer"] == 14 and 2 * 7 == 14 and traps(w) == {7, 44}
    and near(2 * math.pi * 7, 44, 0.05))
w = widget("cr-02-01", "ch")
chk("01.ch A", w["answer"] == 30 and 6 * 5 == 30)
chk("01.ch B (hexagon measured above)", near(sum(sides), 30, 1e-12))
chk("01.ch traps", traps(w) == {31.42, 25, 60} and near(2 * math.pi * 5, 31.42, 0.005) and 5**2 == 25)
w = widget("cr-02-01", "rem-cr-chord-arc-k")
chk("01.rem", w["answer"] == 40 and traps(w) == {20, 80})

# ============ cr-02-02 ============
w = widget("cr-02-02", "k1")
chk("02.k1 A", w["answer"] == 16 and F(16, 2)**2 + F(6)**2 == F(10)**2)
chk("02.k1 B (measured)", near(chord_at(10, 6)[0], 16, 1e-12))
chk("02.k1 traps", traps(w) == {8, 23.32, 4} and near(2 * math.sqrt(136), 23.32) and 10 - 6 == 4)
w = widget("cr-02-02", "k2")
chk("02.k2 A", w["answer"] == 5 and F(24, 2)**2 + F(5)**2 == F(13)**2)
chk("02.k2 B (measured)", near(chord_at(13, 5)[0], 24, 1e-12))
chk("02.k2 traps", traps(w) == {12, 25, 1} and 13 + 12 == 25 and 13 - 12 == 1)
chk("02.k3 center-finder", correct_label(widget("cr-02-02", "k3")).startswith("Draw two chords"))
chk("02.i1 endpoint exception", correct_label(widget("cr-02-02", "i1")) == "Pass through an endpoint of the chord")
w = widget("cr-02-02", "i2")
chk("02.i2 tunnel", w["answer"] == 8 and F(6)**2 + F(8)**2 == F(10)**2 and traps(w) == {4, 11.66}
    and near(math.sqrt(136), 11.66))
w = widget("cr-02-02", "ch")
chk("02.ch A", w["answer"] == 2 and F(16, 2)**2 + F(6)**2 == F(10)**2 and F(12, 2)**2 + F(8)**2 == F(10)**2
    and 8 - 6 == 2)
chk("02.ch B (both chords measured at their distances)",
    near(chord_at(10, 6)[0], 16, 1e-12) and near(chord_at(10, 8)[0], 12, 1e-12))
chk("02.ch traps", traps(w) == {14, 4, 6} and 6 + 8 == 14 and 16 - 12 == 4)
w = widget("cr-02-02", "rem-cr-chord-perp-k")
chk("02.rem", w["answer"] == 8 and traps(w) == {4, 2} and F(3)**2 + F(4)**2 == F(5)**2)

# ============ cr-02-03 ============
w = widget("cr-02-03", "k1")
chk("03.k1", w["answer"] == 7 and traps(w) == {14, 3.5})
chk("03.k2 closest-longest", correct_label(widget("cr-02-03", "k2")) == "The chord at distance 4")
w = widget("cr-02-03", "k3")
chk("03.k3 A", w["answer"] == 6 and F(9)**2 + F(12)**2 == F(15)**2 and 24 - 18 == 6)
chk("03.k3 B (both measured)", near(chord_at(15, 9)[0], 24, 1e-12) and near(chord_at(15, 12)[0], 18, 1e-12))
chk("03.k3 traps", traps(w) == {3, 24, 12} and 12 - 9 == 3)
chk("03.i1 extremes", correct_label(widget("cr-02-03", "i1")).startswith("It shrinks from the full diameter"))
w = widget("cr-02-03", "i2")
chk("03.i2 A", w["answer"] == 8 and F(6)**2 + F(8)**2 == F(10)**2)
chk("03.i2 B (measured + 19-trap identity)", near(chord_at(10, 8)[0], 12, 1e-12)
    and near(math.sqrt(100 - 9.5**2), 3.12, 0.005))
chk("03.i2 traps", traps(w) == {3.12, 6})
w = widget("cr-02-03", "ch")
chk("03.ch A", w["answer"] == 4 and 10 - 6 == 4 and F(16, 2)**2 + F(6)**2 == F(10)**2)
chk("03.ch B (surface chord measured; depth below radius sanity)",
    near(chord_at(10, 6)[0], 16, 1e-12) and 4 < 10)
chk("03.ch traps", traps(w) == {6, 16, 8} and 16 / 2 == 8)
chk("03.rem longer-closer", correct_label(widget("cr-02-03", "rem-cr-chord-dist-k")).startswith("The 14-chord"))

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
print("verify-cr-ch2: ALL GREEN")
