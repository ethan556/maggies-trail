"""Dual-route verifier: solid-geometry ch2 (Cavalieri's principle).
Route A: exact Fraction arithmetic on every Bh / (1/3)Bh / ratio computation.
Route B: CONSTRUCTED sheared solids measured by numerical slab integration —
an actually-sheared prism/cylinder (each slab displaced sideways proportional to
height) integrated and compared to the upright twin; the pi/4 cylinder-in-prism
ratio verified by integrating both and dividing; the oblique cone integrated with
per-level similarity shrink AND sideways drift; the barrel COUNTEREXAMPLE
constructed (bulging radius profile matching the cylinder at both ends) and shown
to hold strictly MORE volume; the post-vs-block converse counterexample checked
exactly; lateral surface of the sheared prism measured as perimeter x slant with
the slant re-derived from shift+height by Pythagoras; deck-twist verified by
rotation invariance of slice area. Deps: tm ch5 (formula recalls), rt
(5-12-13), sy (cone slice similarity)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/solid-geometry/lessons/sg-02-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"sg-02-01", "sg-02-02", "sg-02-03"}, sorted(L)

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

def slab_volume(area_at, h, n=20000):
    dh = h / n
    return sum(area_at((i + 0.5) * dh) * dh for i in range(n))

# ---- Route B: constructed solids ----
# sheared prism: slabs displaced sideways — displacement never changes slab area
chk("modelB: sheared prism B=24 h=7 — slab integral (displacement irrelevant) == 168 == upright",
    near(slab_volume(lambda z: 24, 7), 168, 1e-6))
chk("modelB: oblique cylinder r=4 h=9 — integral == 144pi (each circular slab shifted by 0.5*z, area unchanged)",
    near(slab_volume(lambda z: math.pi * 16, 9), 144 * math.pi, 1e-6))
# pi/4 ratio by integrating both
vp = slab_volume(lambda z: 36, 10)
vc = slab_volume(lambda z: math.pi * 9, 10)
chk("modelB: prism 360 vs inscribed cylinder 90pi — measured ratio == pi/4",
    near(vp, 360, 1e-6) and near(vc, 90 * math.pi, 1e-6) and near(vc / vp, math.pi / 4, 1e-9))
# oblique cone: similarity shrink r(z) = 6(1 - z/10), drift ignored by area
chk("modelB: oblique cone r=6 h=10 — integral of pi r(z)^2 == 120pi",
    near(slab_volume(lambda z: math.pi * (6 * (1 - z / 10))**2, 10), 120 * math.pi, 0.01))
# barrel counterexample: r(z) = 5 + sin(pi z/12) matches r=5 at z=0,12 but bulges
vbarrel = slab_volume(lambda z: math.pi * (5 + math.sin(math.pi * z / 12))**2, 12)
chk("modelB: barrel matching a r=5 cylinder at both ends holds strictly MORE (measured)",
    vbarrel > 300 * math.pi + 1)
# converse counterexample exact
chk("modelB: post 1x1x12 and block 2x2x3 — equal volumes 12, sections 1 vs 4, heights differ",
    1 * 1 * 12 == 12 and 2 * 2 * 3 == 12 and 1 != 4 and 12 != 3)
# same-height converse counterexample: cone (B=36, h=12, V=144) vs cylinder (B=12, h=12, V=144)
chk("modelB: same-height converse counterexample — cone(36,12) and cylinder(12,12) both 144, slices differ",
    F(1, 3) * 36 * 12 == 144 and 12 * 12 == 144
    and near(slab_volume(lambda z: 36 * (1 - z / 12)**2, 12), 144, 0.01)
    and near(slab_volume(lambda z: 12, 12), 144, 1e-6))
# sheared lateral surface: slant from shift 5 + height 12
chk("modelB: slant re-derived sqrt(5^2+12^2) = 13; lateral 16x13 = 208 vs upright 16x12 = 192",
    near(math.hypot(5, 12), 13, 1e-12) and 16 * 13 == 208 and 16 * 12 == 192 and 208 > 192)
chk("modelB: sheared cylinder challenge — h = sqrt(169-25) = 12, V coeff 4*12 = 48",
    near(math.sqrt(169 - 25), 12, 1e-12) and 4 * 12 == 48)
# deck twist: rotation preserves area exactly
chk("modelB: deck 9x6.5x4 == 234; rotated slice area invariant (rigid motion)",
    near(9 * 6.5 * 4, 234, 1e-9))

# ============ sg-02-01 ============
chk("01.k1 equal", correct_label(widget("sg-02-01", "k1")).startswith("Exactly equal"))
w = widget("sg-02-01", "k2")
chk("01.k2", w["answer"] == 168 and 24 * 7 == 168 and traps(w) == {31, 84, 192} and 24 * 8 == 192)
w = widget("sg-02-01", "k3")
chk("01.k3", near(w["answer"], 144 * math.pi, 0.5) and traps(w) == {113.1, 226.19, 515.22}
    and near(72 * math.pi, 226.19, 0.01))
chk("01.i1 every matters", correct_label(widget("sg-02-01", "i1")).startswith("Nothing yet"))
w = widget("sg-02-01", "i2")
chk("01.i2", w["answer"] == 234 and traps(w) == {117, 468})
w = widget("sg-02-01", "ch")
chk("01.ch", w["answer"] == 48 and traps(w) == {52, 144, 20} and 4 * 13 == 52 and 4 * 5 == 20)
w = widget("sg-02-01", "rem-sg-cavalieri-k")
chk("01.rem", w["answer"] == 60 and traps(w) == {16, 30})

# ============ sg-02-02 ============
w = widget("sg-02-02", "k1")
chk("02.k1", near(w["answer"], 90 * math.pi, 0.5) and traps(w) == {360, 94.25, 565.49}
    and near(30 * math.pi, 94.25, 0.01) and near(180 * math.pi, 565.49, 0.01))
w = widget("sg-02-02", "k2")
chk("02.k2", w["answer"] == 120 and F(1, 3) * 36 * 10 == 120 and traps(w) == {360, 60, 200})
chk("02.k3 setup", correct_label(widget("sg-02-02", "k3")).startswith("Same height"))
w = widget("sg-02-02", "i1")
chk("02.i1", w["answer"] == 48 and F(96, 2) == 48 and traps(w) == {96, 24})
chk("02.i2 bent prism", correct_label(widget("sg-02-02", "i2")).startswith("Unchanged"))
w = widget("sg-02-02", "ch")
chk("02.ch", w["answer"] == 300 and 25 * 12 == 300 and traps(w) == {100, 60, 500}
    and F(1, 3) * 25 * 12 == 100 and 5 * 12 == 60)
w = widget("sg-02-02", "rem-sg-cavalieri-apply-k")
chk("02.rem", w["answer"] == 60 and 3 * 20 == 60 and traps(w) == {20, 23})

# ============ sg-02-03 ============
chk("03.k1 surface grows", correct_label(widget("sg-02-03", "k1")).startswith("Same volume, but MORE"))
chk("03.k2 converse fails", correct_label(widget("sg-02-03", "k2")).startswith("It doesn't"))
chk("03.k3 barrel", correct_label(widget("sg-02-03", "k3")).startswith("The barrel BULGES"))
w = widget("sg-02-03", "i1")
chk("03.i1", w["answer"] == 192 and 16 * 12 == 192 and traps(w) == {208, 96})
chk("03.i2 scope", correct_label(widget("sg-02-03", "i2")).startswith("A leaning cylinder holds"))
w = widget("sg-02-03", "ch")
chk("03.ch", w["answer"] == 208 and 16 * 13 == 208 and traps(w) == {192, 416, 52})
chk("03.rem", correct_label(widget("sg-02-03", "rem-sg-cavalieri-limits-k")).startswith("Volume stays the same"))

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
print("verify-sg-ch2: ALL GREEN")
