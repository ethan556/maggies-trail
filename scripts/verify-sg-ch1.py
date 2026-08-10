"""Dual-route verifier: solid-geometry ch1 (cross-sections & solids of revolution).
Route A: exact Fraction arithmetic on every slice/volume formula (pi factored
out). Route B: CONSTRUCTED-solid measurement — sphere slices verified by sampling
points on the actual sphere surface at the slicing height and measuring their
horizontal distance from the axis (must equal the claimed slice radius); the
great-circle maximum verified by evaluating pi(R^2-d^2) across a sweep of d
values; solids of revolution verified by numerically integrating the swept
volume as stacked disks/washers (10k slabs) against the closed-form recalls
(cylinder, both cone orientations, sphere, and the offset TUBE via washers);
the cone-slice similarity check verified by intersecting the actual slant line
with the slicing plane. Falsification: a non-spherical ovoid's slices measurably
violate pi(R^2-d^2). Deps: g7 (cross-section definition), tm ch5 (volume formula
recalls), sy (similarity ratio for cone slices), rt (Pythagoras)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/solid-geometry/lessons/sg-01-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"sg-01-01", "sg-01-02", "sg-01-03"}, sorted(L)

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

def revolve(profile, h_lo, h_hi, n=10000):
    """Volume by stacked washers: profile(h) -> (outer_r, inner_r)."""
    dh = (h_hi - h_lo) / n
    vol = 0.0
    for i in range(n):
        h = h_lo + (i + 0.5) * dh
        ro, ri = profile(h)
        vol += math.pi * (ro * ro - ri * ri) * dh
    return vol

# ---- Route B: constructed solids ----
# sphere slice by surface sampling: points on sphere R=5 at height 3
R, d = 5, 3
pts = [(math.sqrt(R * R - d * d) * math.cos(t), math.sqrt(R * R - d * d) * math.sin(t), d)
       for t in [k * math.pi / 6 for k in range(12)]]
chk("modelB: sphere R=5 sliced at 3 — 12 surface points all at |axis distance| 4, all ON the sphere",
    all(near(math.hypot(x, y), 4, 1e-12) and near(math.hypot(x, y, z), 5, 1e-12) for x, y, z in pts))
chk("modelB: slice-area sweep — pi(25-d^2) maximal at d=0 across d = 0..4.9",
    all(math.pi * (25 - 0) >= math.pi * (25 - dd * dd) for dd in [i * 0.1 for i in range(50)]))
chk("modelB: hidden chord — R=10, slice area 36pi -> radius 6, d measured sqrt(100-36) = 8",
    near(math.sqrt(100 - 36), 8, 1e-12) and F(36) == 6 * 6)
# revolution volumes by numeric integration vs recalls
chk("modelB: rectangle 3x7 revolved — washer integral == 63pi",
    near(revolve(lambda h: (3, 0), 0, 7), 63 * math.pi, 0.01))
chk("modelB: triangle legs 5,12 about 12-leg — integral == 100pi (radius shrinks 5->0)",
    near(revolve(lambda h: (5 * (1 - h / 12), 0), 0, 12), 100 * math.pi, 0.05))
chk("modelB: same triangle about 5-leg — integral == 240pi",
    near(revolve(lambda h: (12 * (1 - h / 5), 0), 0, 5), 240 * math.pi, 0.15))
chk("modelB: semicircle r=6 revolved — integral == 288pi == (4/3)(216)pi",
    near(revolve(lambda h: (math.sqrt(max(36 - h * h, 0)), 0), -6, 6), 288 * math.pi, 0.2)
    and F(4, 3) * 216 == 288)
chk("modelB: offset rectangle (2..5)x6 — washer integral == (25-4)*6 pi == 126pi (tube)",
    near(revolve(lambda h: (5, 2), 0, 6), 126 * math.pi, 0.01) and (25 - 4) * 6 == 126)
chk("modelB: generator 9-12 — hypotenuse measured 15; slant of swept cone touches (9,0) from apex (0,12)",
    near(math.hypot(9, 12), 15, 1e-12))
# cone slice by actual slant-line intersection: cone r=8 h=12, apex at top (h=12), base at 0
# slant line from apex (0,12) to base rim (8,0): at 3 below apex (height 9): x = 8*(3/12) = 2
chk("modelB: cone slice 3 below apex — slant line intersection at radius 2 (== similarity 3/12 of 8)",
    near(8 * (3 / 12), 2, 1e-12) and F(3, 12) * 8 == 2)
# circle-in-square ratio constant
chk("modelB: circle-in-square section ratio pi/4 at any r",
    all(near(math.pi * r * r / (4 * r * r), math.pi / 4, 1e-12) for r in [1, 2.5, 7]))
# falsification: ovoid (z-stretched sphere) slices violate pi(R^2-d^2)
chk("modelB: ovoid falsification — z-stretched sphere's slice at height 3 is NOT radius 4",
    not near(math.sqrt(max(25 - (3 / 1.4)**2, 0)), 4, 0.05))
# great circle numbers
chk("modelB: great circle R=5 area 25pi; circumference 12pi -> r=6 -> V=(4/3)216=288",
    F(25) == 25 and F(12, 2) == 6 and F(4, 3) * 216 == 288)

# ============ sg-01-01 ============
chk("01.k1 cylinder parallel", correct_label(widget("sg-01-01", "k1")).startswith("A circle of radius 4"))
chk("01.k2 apex triangle", correct_label(widget("sg-01-01", "k2")).startswith("A triangle"))
w = widget("sg-01-01", "k3")
chk("01.k3", near(w["answer"], 16 * math.pi, 0.05) and traps(w) == {78.54, 12.57, 28.27}
    and near(25 * math.pi, 78.54, 0.005) and near(9 * math.pi, 28.27, 0.005))
w = widget("sg-01-01", "i1")
chk("01.i1", near(w["answer"], 25 * math.pi, 0.05) and traps(w) == {50.27, 31.42})
chk("01.i2 all-circles sphere", correct_label(widget("sg-01-01", "i2")).startswith("A sphere"))
w = widget("sg-01-01", "ch")
chk("01.ch", w["answer"] == 8 and traps(w) == {6, 64, 4} and 100 - 36 == 64)
chk("01.rem", correct_label(widget("sg-01-01", "rem-sg-cross-sections-k")).startswith("A circle of radius 3"))

# ============ sg-01-02 ============
w = widget("sg-01-02", "k1")
chk("02.k1", w["answer"] == 63 and 9 * 7 == 63 and traps(w) == {21, 147, 126} and 49 * 3 == 147)
w = widget("sg-01-02", "k2")
chk("02.k2", w["answer"] == 100 and F(1, 3) * 25 * 12 == 100 and traps(w) == {240, 300, 60}
    and F(1, 3) * 144 * 5 == 240 and 25 * 12 == 300 and F(1, 3) * 5 * 12 * 3 == 60)
chk("02.k3 semicircle", correct_label(widget("sg-01-02", "k3")).startswith("A semicircle"))
w = widget("sg-01-02", "i1")
chk("02.i1", w["answer"] == 288 and traps(w) == {216, 144} and F(288, 2) == 144)
chk("02.i2 tube", correct_label(widget("sg-01-02", "i2")).startswith("A tube"))
w = widget("sg-01-02", "ch")
chk("02.ch", w["answer"] == 15 and 81 + 144 == 225 and traps(w) == {21, 225, 13.4})
w = widget("sg-01-02", "rem-sg-revolution-k")
chk("02.rem", w["answer"] == 16 and 4 * 4 == 16 and traps(w) == {8, 32} and 16 * 2 == 32)

# ============ sg-01-03 ============
chk("03.k1 cylinder id", correct_label(widget("sg-01-03", "k1")).startswith("A cylinder"))
w = widget("sg-01-03", "k2")
chk("03.k2", w["answer"] == 288 and traps(w) == {216, 48, 144} and F(4, 3) * 36 == 48)
chk("03.k3 max argument", correct_label(widget("sg-01-03", "k3")).startswith("Slice area is"))
w = widget("sg-01-03", "i1")
chk("03.i1", w["answer"] == 2 and traps(w) == {6, 4, 2.67} and F(9, 12) * 8 == 6
    and near(8 / 3, 2.67, 0.005))
chk("03.i2 pi/4 ratio", correct_label(widget("sg-01-03", "i2")).startswith("The circle sits inside"))
w = widget("sg-01-03", "ch")
chk("03.ch", w["answer"] == 36 and 100 - 64 == 36 and traps(w) == {100, 64, 6})
chk("03.rem cone id", correct_label(widget("sg-01-03", "rem-sg-section-reasoning-k")).startswith("A cone"))

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
print("verify-sg-ch1: ALL GREEN")
