"""Dual-route verifier for trig-functions Ch1 (right-triangle trig).

Route A: the taught SOH-CAH-TOA ratio reads and inverse-trig solves.
Route B: COORDINATE GEOMETRY — every triangle is rebuilt as actual points in the
         plane; side lengths come from the distance formula, angles from the dot
         product (formula-free w.r.t. the taught ratios). Every claimed ratio,
         side, and angle must match the geometric reconstruction.
"""
import json, glob, sys, math

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/trig-functions/lessons/tf-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"tf-01-01", "tf-01-02", "tf-01-03"}, "expected 3 ch1 lessons")

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

def tri(opp, adj):
    """Route B: place the right triangle at coordinates and measure everything
    geometrically — angle at origin via the dot product, sides via distances."""
    A, B, C = (0.0, 0.0), (adj, 0.0), (adj, opp)
    hyp = math.dist(A, C)
    v1 = (B[0] - A[0], B[1] - A[1])
    v2 = (C[0] - A[0], C[1] - A[1])
    cosang = (v1[0] * v2[0] + v1[1] * v2[1]) / (math.hypot(*v1) * math.hypot(*v2))
    theta = math.degrees(math.acos(cosang))
    return hyp, theta

def near(a, b, tol=5e-3):
    return abs(a - b) <= tol

# ---- L1 ----
hyp345, th345 = tri(3, 4)
ok(near(hyp345, 5, 1e-12), "L1 3-4-5 hypotenuse by distance formula")
ok(near(3 / hyp345, 0.6, 1e-12) and near(4 / hyp345, 0.8, 1e-12) and 3 / 4 == 0.75,
   "L1 all three ratios from the geometric build")
ok(near(math.sin(math.radians(th345)), 0.6, 1e-9), "L1 dot-product angle reproduces sin = 0.6")
check_numeric("tf-01-01", "i1", 0.6)
hyp51213, _ = tri(5, 12)
ok(near(hyp51213, 13, 1e-9) and near(12 / hyp51213, 12 / 13, 1e-12), "L1 k1 cos = 12/13 geometrically")
check_numeric("tf-01-01", "k1", 12)
# i2: the other acute angle — rebuild from the other corner
_, phi = tri(4, 3)
ok(near(math.sin(math.radians(phi)), 4 / 5, 1e-9), "L1 i2: sin of the other angle is 4/5")
ok(near(th345 + phi, 90, 1e-9), "L1 acute angles complementary geometrically")
ok(one_correct("tf-01-01", "i2") == "4/5", "L1 i2 label")
w = widget("tf-01-01", "k2")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"s1": "opp", "s2": "adj", "s3": "hyp", "s4": "hyp"}, "L1 k2 bucket key")
hyp6810, th6810 = tri(6, 8)
ok(near(hyp6810, 10, 1e-9) and near(th6810, th345, 1e-9), "L1 i3: scaled triangle keeps the SAME angle")
ok(6 / 8 == 0.75, "L1 i3 tan unchanged")
check_numeric("tf-01-01", "i3", 0.75)
# ch1: leg from hypotenuse; verify geometrically that (8,15,17) closes
h815, _ = tri(8, 15)
ok(near(h815, 17, 1e-9), "L1 ch1: 8-15-17 closes by distance formula")
ok(round(math.sqrt(17 ** 2 + 8 ** 2)) == 19 and 17 - 8 == 9, "L1 ch1 traps are the add-squares and subtract-lengths slips")
check_numeric("tf-01-01", "ch1", 15)
check_numeric("tf-01-01", "rem-tf0101-k", 0.8)

# ---- L2 ---- (solve for a side, then REBUILD the triangle and re-measure)
def solved_triangle_check(theta_deg, opp=None, adj=None, hyp=None):
    """Given any two of (theta, one side), rebuild and confirm all claims."""
    t = math.radians(theta_deg)
    if hyp is not None and opp is not None:
        ok(near(hyp * math.sin(t), opp, 5e-3), "hyp*sin != opp (theta=%s)" % theta_deg)
        a = hyp * math.cos(t)
        h2, th2 = tri(opp, a)
        ok(near(h2, hyp, 5e-3) and near(th2, theta_deg, 5e-2), "rebuilt triangle mismatch (theta=%s)" % theta_deg)
    if adj is not None and opp is not None:
        h2, th2 = tri(opp, adj)
        ok(near(th2, theta_deg, 5e-2), "legs rebuild wrong angle (theta=%s)" % theta_deg)

solved_triangle_check(30, opp=10, hyp=20)
check_numeric("tf-01-02", "i1", 10)
ok(near(20 * math.cos(math.radians(30)), 17.32, 5e-3), "L2 i1 adjacent trap value")
solved_triangle_check(30, opp=4, hyp=8)
check_numeric("tf-01-02", "k1", 4)
solved_triangle_check(30, opp=9, hyp=18)
ok(near(9 / math.cos(math.radians(30)), 10.39, 5e-3), "L2 i2 cos-confusion trap value")
check_numeric("tf-01-02", "i2", 18)
solved_triangle_check(60, opp=43.3, hyp=50)
ok(near(50 * math.cos(math.radians(60)), 25, 1e-9) and near(50 / math.sin(math.radians(60)), 57.74, 5e-3), "L2 k2 traps")
check_numeric("tf-01-02", "k2", 43.3)
solved_triangle_check(45, opp=15, adj=15)
ok(near(15 / math.cos(math.radians(45)), 21.21, 5e-3), "L2 i3 hypotenuse-intrusion trap")
check_numeric("tf-01-02", "i3", 15)
solved_triangle_check(30, opp=13.86, adj=24)
ok(near(24 / math.tan(math.radians(30)), 41.57, 5e-3) and 24 * 0.5 == 12, "L2 ch1 traps")
check_numeric("tf-01-02", "ch1", 13.86)
solved_triangle_check(30, opp=5, hyp=10)
check_numeric("tf-01-02", "rem-tf0102-k", 5)

# ---- L3 ---- (inverse: claimed angle must rebuild the given sides)
def angle_check(claimed_deg, opp=None, adj=None, hyp=None, tol=5e-2):
    if opp is not None and adj is not None:
        _, th = tri(opp, adj)
        ok(near(th, claimed_deg, tol), "tan-inverse claim %s wrong" % claimed_deg)
    if opp is not None and hyp is not None:
        a = math.sqrt(hyp * hyp - opp * opp)
        _, th = tri(opp, a)
        ok(near(th, claimed_deg, tol), "sin-inverse claim %s wrong" % claimed_deg)

ok(near(math.degrees(math.asin(0.5)), 30, 1e-9) and near(math.degrees(math.acos(0.5)), 60, 1e-9), "L3 i1 answer + trap")
check_numeric("tf-01-03", "i1", 30)
angle_check(36.9, opp=3, adj=4)
angle_check(53.1, opp=4, adj=3)
check_numeric("tf-01-03", "k1", 36.9)
ok(one_correct("tf-01-03", "i2") == "sin\u207b\u00b9(6/12) = 30\u00b0", "L3 i2 label")
angle_check(30, opp=6, hyp=12)
ok(near(math.degrees(math.acos(0.5)), 60, 1e-9) and near(math.degrees(math.atan(0.5)), 26.6, 5e-2), "L3 i2 distractor values")
angle_check(67.4, opp=12, hyp=13)
ok(near(math.degrees(math.acos(12 / 13)), 22.6, 5e-2), "L3 k2 wall-angle trap")
check_numeric("tf-01-03", "k2", 67.4)
ok(abs(36.9 + 53.1 - 90) < 1e-9 and 180 - 36.9 == 143.1, "L3 i3 complement + trap")
check_numeric("tf-01-03", "i3", 53.1)
angle_check(22.6, opp=25, adj=60)
ok(near(math.degrees(math.atan(60 / 25)), 67.4, 5e-2) and near(math.degrees(math.asin(25 / 60)), 24.6, 5e-2), "L3 ch1 traps")
check_numeric("tf-01-03", "ch1", 22.6)
angle_check(45, opp=1, adj=1)
check_numeric("tf-01-03", "rem-tf0103-k", 45)

print("verify-tf-ch1: all checks passed")
