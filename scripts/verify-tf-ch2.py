"""Dual-route verifier for trig-functions Ch2 (radians & arc length).

Route A: the taught conversion factors (pi/180, 180/pi) and s = r*theta.
Route B: POLYGONAL ARC MEASUREMENT — every arc-length claim is re-measured by
         chording the arc into 20,000 tiny segments on an actual circle and
         summing chord lengths (no s = r*theta anywhere in the route). Every
         conversion claim is re-derived from the single definition
         "full turn = 2*pi rad = 360 deg" by pure proportion.
"""
import json, glob, sys, math

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/trig-functions/lessons/tf-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"tf-02-01", "tf-02-02", "tf-02-03"}, "expected 3 ch2 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step %s/%s" % (lid, sid))

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["answer"] == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " needs >=2 traps")
    for e in w["commonErrors"]:
        ok(e["value"] != expect, "%s/%s trap == answer" % (lid, sid))

def arc_by_chords(r, theta, n=20000):
    """Route B: sum chord lengths along the arc — formula-free."""
    total = 0.0
    for k in range(n):
        a0 = theta * k / n
        a1 = theta * (k + 1) / n
        p0 = (r * math.cos(a0), r * math.sin(a0))
        p1 = (r * math.cos(a1), r * math.sin(a1))
        total += math.dist(p0, p1)
    return total

def deg_by_proportion(rad):
    """Route B for conversions: pure proportion off the full-turn definition."""
    return 360.0 * rad / (2 * math.pi)

def near(a, b, tol=5e-3):
    return abs(a - b) <= tol

# ---- L1 ----
# full turn: chords around the whole rim of a unit circle must total 2*pi
ok(near(arc_by_chords(1, 2 * math.pi), 6.28, 5e-3), "L1 i1: chorded full rim = 6.28 radii")
check_numeric("tf-02-01", "i1", 6.28)
ok(near(arc_by_chords(1, math.pi / 2), 1.57, 5e-3), "L1 k1: chorded quarter rim")
check_numeric("tf-02-01", "k1", 1.57)
ok(one_correct("tf-02-01", "i2").startswith("It's the angle whose arc equals one radius"), "L1 i2 label")
ok(near(deg_by_proportion(1), 57.3, 5e-2), "L1 i2: 1 rad = 57.3 deg by proportion")
# k2: an arc of 3 radii — find theta such that chorded arc = 3r; must be 3
r = 7.0
ok(near(arc_by_chords(r, 3) / r, 3, 1e-6), "L1 k2: 3-radius arc subtends 3 rad, any radius")
ok(near(deg_by_proportion(3), 171.9, 5e-2) and near(3 * math.pi, 9.42, 5e-3), "L1 k2 traps")
check_numeric("tf-02-01", "k2", 3)
ok(near(2 * math.pi * 60 / 360, 1.05, 5e-3), "L1 i3: 60 deg by proportion")
ok(near(60 / 180, 0.33, 5e-3) and near(math.pi / 2, 1.57, 5e-3), "L1 i3 traps")
check_numeric("tf-02-01", "i3", 1.05)
ok(near(deg_by_proportion(2), 114.6, 5e-2), "L1 ch1 by proportion")
ok(near(2 * math.pi / 180, 0.03, 5e-3), "L1 ch1 wrong-direction trap")
check_numeric("tf-02-01", "ch1", 114.6)
ok(near(2 * math.pi * 90 / 360, 1.57, 5e-3), "L1 remedial by proportion")
check_numeric("tf-02-01", "rem-tf0201-k", 1.57)

# ---- L2 ----
w = widget("tf-02-02", "i1")
pair_deg = {"d1": 30, "d2": 45, "d3": 90, "d4": 120}
pair_rad = {"r1": math.pi / 6, "r2": math.pi / 4, "r3": math.pi / 2, "r4": 2 * math.pi / 3}
for lft, rgt in w["pairs"].items():
    ok(near(deg_by_proportion(pair_rad[rgt]), pair_deg[lft], 1e-9), "L2 i1 pair %s->%s" % (lft, rgt))
for e in w["pairErrors"]:
    ok(not near(deg_by_proportion(pair_rad[e["right"]]), pair_deg[e["left"]], 1e-9), "L2 i1 pairError is actually correct")
ok(near(deg_by_proportion(3 * math.pi / 4), 135, 1e-9), "L2 k1: 3pi/4 = 135 by proportion")
ok(near(deg_by_proportion(4 * math.pi / 4), 180, 1e-9) and near(deg_by_proportion(6 * math.pi / 4), 270, 1e-9), "L2 k1 traps")
check_numeric("tf-02-02", "k1", 3)
ok(near(deg_by_proportion(5 * math.pi / 6), 150, 1e-9) and near(deg_by_proportion(7 * math.pi / 6), 210, 1e-9), "L2 i2 + overcount trap")
check_numeric("tf-02-02", "i2", 150)
ok(near(deg_by_proportion(3 * math.pi / 2), 270, 1e-9), "L2 k2 by proportion")
check_numeric("tf-02-02", "k2", 270)
ok(near(2 * math.pi + math.pi / 2, 7.85, 5e-3), "L2 i3: lap + quarter")
check_numeric("tf-02-02", "i3", 7.85)
ok(near(deg_by_proportion(7 * math.pi / 6), 210, 1e-9) and near(deg_by_proportion(11 * math.pi / 6), 330, 1e-9), "L2 ch1 + traps")
check_numeric("tf-02-02", "ch1", 210)
ok(near(2 * math.pi * 60 / 360, math.pi / 3, 1e-12), "L2 remedial: 60 deg is pi/3 by proportion")
check_numeric("tf-02-02", "rem-tf0202-k", 3)

# ---- L3 ---- (every arc claim re-measured by chording)
ok(near(arc_by_chords(10, 1.5), 15, 5e-3), "L3 i1 chorded")
ok(near(10 / 1.5, 6.67, 5e-3) and 10 + 1.5 == 11.5, "L3 i1 traps")
check_numeric("tf-02-03", "i1", 15)
ok(near(arc_by_chords(6, math.pi / 3), 6.28, 5e-3), "L3 k1 chorded")
ok(near(math.pi / 3, 1.05, 5e-3) and near(arc_by_chords(12, math.pi / 3), 12.57, 5e-3), "L3 k1 traps (diameter slip re-measured too)")
check_numeric("tf-02-03", "k1", 6.28)
ok(near(arc_by_chords(4, math.pi / 2), 6.28, 5e-3), "L3 i2 chorded")
ok(near(arc_by_chords(4, math.pi / 4), 3.14, 5e-3), "L3 i2 wrong-conversion trap re-measured")
# the 360 trap is impossible: the whole rim is only 2*pi*4
ok(arc_by_chords(4, 2 * math.pi) < 26 < 360, "L3 i2: 360 exceeds the entire rim")
check_numeric("tf-02-03", "i2", 6.28)
# k2 backwards: chorded arc of theta=3 on r=4 must measure 12
ok(near(arc_by_chords(4, 3), 12, 5e-3), "L3 k2: theta=3 reproduces arc 12")
check_numeric("tf-02-03", "k2", 3)
ok(near(arc_by_chords(0.35, 20 % (2 * math.pi)) + 3 * arc_by_chords(0.35, 2 * math.pi), 7, 5e-3),
   "L3 i3 chorded across full laps (20 rad = 3 laps + remainder)")
check_numeric("tf-02-03", "i3", 7)
ok(near(arc_by_chords(2.5, math.radians(40)), 1.75, 5e-3), "L3 ch1 chorded")
ok(near(math.radians(40), 0.7, 5e-3) and 2.5 * 40 == 100, "L3 ch1 traps")
check_numeric("tf-02-03", "ch1", 1.75)
ok(near(arc_by_chords(2, 3), 6, 5e-3), "L3 remedial chorded")
check_numeric("tf-02-03", "rem-tf0203-k", 6)

print("verify-tf-ch2: all checks passed")
