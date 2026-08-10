"""Dual-route verifier for trig-functions Ch3 (unit circle, reference angles, exact values).

Route A: the taught system — quadrantal landmarks, reference-angle rules, the
         30-45-60 exact table, A-S-T-C signs.
Route B: DIRECT COORDINATE EVALUATION — every claim is re-checked against
         math.sin/math.cos of the raw angle (no reference-angle machinery), plus
         exact radical identities (1/2, sqrt2/2, sqrt3/2) cross-checked
         symbolically, and every quadrant-sign claim verified from the actual
         coordinates of the rotated point.
"""
import json, glob, sys, math

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/trig-functions/lessons/tf-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"tf-03-01", "tf-03-02", "tf-03-03"}, "expected 3 ch3 lessons")

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

D = math.radians
def pt(deg):
    """Route B: the actual rotated point on the unit circle."""
    return (math.cos(D(deg)), math.sin(D(deg)))

def near(a, b, tol=5e-3):
    return abs(a - b) <= tol

R2, R3 = math.sqrt(2) / 2, math.sqrt(3) / 2
# exact radical identities: these ARE the table's values
ok(near(math.sin(D(30)), 0.5, 1e-12) and near(math.sin(D(45)), R2, 1e-12) and near(math.sin(D(60)), R3, 1e-12),
   "exact table matches direct evaluation")
ok(near(math.cos(D(60)), 0.5, 1e-12) and near(math.cos(D(45)), R2, 1e-12) and near(math.cos(D(30)), R3, 1e-12),
   "cosine table reversed, matches direct evaluation")
ok(2 * R2 * R2 == 1.0000000000000002 or abs(2 * R2 * R2 - 1) < 1e-12, "sqrt2/2 squared doubles to 1")
ok(abs(R3 * R3 - 0.75) < 1e-12, "sqrt3/2 squared is 3/4")

# ---- L1 ----
x, y = pt(90)
ok(near(y, 1, 1e-12) and near(x, 0, 1e-12), "L1 i1: point at 90 is (0,1)")
check_numeric("tf-03-01", "i1", 1)
x, y = pt(180)
ok(near(x, -1, 1e-12) and near(y, 0, 1e-12), "L1 k1: point at 180 is (-1,0)")
check_numeric("tf-03-01", "k1", -1)
w = widget("tf-03-01", "i2")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"v1": "neg", "v2": "neg", "v3": "pos", "v4": "pos"}, "L1 i2 bucket key")
ok(pt(200)[1] < 0 and pt(100)[0] < 0 and pt(100)[1] > 0 and pt(320)[0] > 0, "L1 i2: every sign from actual coordinates")
ok(one_correct("tf-03-01", "k2") == "Quadrant III", "L1 k2 label")
# verify quadrant sign claims exhaustively at a witness in each quadrant
ok(pt(210)[0] < 0 and pt(210)[1] < 0, "Q3 both negative (witness 210)")
ok(pt(120)[0] < 0 and pt(120)[1] > 0, "Q2 sine positive (witness 120)")
ok(pt(320)[0] > 0 and pt(320)[1] < 0, "Q4 cosine positive (witness 320)")
ok(one_correct("tf-03-01", "i3").startswith("Undefined"), "L1 i3 label")
ok(near(pt(90)[0], 0, 1e-12), "L1 i3: x really is 0 at 90 — division breaks")
ok(near(math.tan(D(45)), 1, 1e-12) and near(math.tan(D(180)), 0, 1e-12), "L1 i3 distractor values")
x, y = pt(270)
ok(near(y, -1, 1e-12) and near(x, 0, 1e-12), "L1 ch1: point at 270 is (0,-1)")
check_numeric("tf-03-01", "ch1", -1)
ok(near(pt(0)[0], 1, 1e-15), "L1 remedial: cos 0 = 1")
check_numeric("tf-03-01", "rem-tf0301-k", 1)

# ---- L2 ---- (every reference claim: |trig of angle| == trig of reference, by direct evaluation)
def ref_claim(angle_deg, ref_deg):
    ok(near(abs(math.sin(D(angle_deg))), math.sin(D(ref_deg)), 1e-12) and
       near(abs(math.cos(D(angle_deg))), math.cos(D(ref_deg)), 1e-12),
       "reference claim %s->%s fails direct evaluation" % (angle_deg, ref_deg))

ref_claim(150, 30); check_numeric("tf-03-02", "i1", 30)
ok(not near(abs(math.cos(D(150))), math.cos(D(60)), 1e-6), "L2 i1: 60 is NOT 150's reference")
ref_claim(225, 45); check_numeric("tf-03-02", "k1", 45)
ok(not near(abs(math.sin(D(225))), math.sin(D(35)), 1e-6), "L2 k1 sanity: wrong refs fail")
ref_claim(300, 60); check_numeric("tf-03-02", "i2", 60)
ok(not near(abs(math.sin(D(300))), math.sin(D(30)), 1e-6), "L2 i2: 30 is NOT 300's reference")
ref_claim(150, 30)  # 5pi/6 == 150
ok(near(math.pi - 5 * math.pi / 6, math.pi / 6, 1e-15), "L2 k2: pi - 5pi/6 = pi/6")
check_numeric("tf-03-02", "k2", 6)
ok(near(math.cos(D(150)), -0.87, 5e-3) and near(math.cos(D(150)), -R3, 1e-12), "L2 i3 direct + radical")
check_numeric("tf-03-02", "i3", -0.87)
ok(near(math.sin(D(225)), -0.71, 5e-3) and near(math.sin(D(225)), -R2, 1e-12), "L2 ch1 direct + radical")
check_numeric("tf-03-02", "ch1", -0.71)
ref_claim(120, 60); check_numeric("tf-03-02", "rem-tf0302-k", 60)

# ---- L3 ---- (exact values: direct evaluation AND radical identity, both routes)
ok(near(math.sin(D(60)), 0.87, 5e-3) and near(math.sin(D(60)), R3, 1e-12), "L3 i1")
ok(near(math.sin(D(30)), 0.5, 1e-12) and near(math.sin(D(45)), 0.71, 5e-3), "L3 i1 trap values")
check_numeric("tf-03-03", "i1", 0.87)
ok(near(math.cos(D(45)), 0.71, 5e-3) and near(math.cos(D(45)), R2, 1e-12), "L3 k1")
ok(near(math.cos(D(60)), 0.5, 1e-12) and near(math.cos(D(30)), 0.87, 5e-3), "L3 k1 trap values")
ok(near(math.sin(D(45)), math.cos(D(45)), 1e-15), "L3 k1: 45 is the balance point")
check_numeric("tf-03-03", "k1", 0.71)
ok(near(math.cos(D(300)), 0.5, 1e-12), "L3 i2 direct")
ok(math.cos(D(300)) > 0, "L3 i2: Q4 cosine positive from the actual coordinate")
check_numeric("tf-03-03", "i2", 0.5)
ok(near(math.sin(D(330)), -0.5, 1e-12) and math.sin(D(330)) < 0, "L3 k2 direct + sign")
check_numeric("tf-03-03", "k2", -0.5)
ok(near(math.sin(math.pi / 3), 0.87, 5e-3) and near(math.sin(math.pi / 3), R3, 1e-12), "L3 i3")
ok(near(math.pi / 3, 1.05, 5e-3), "L3 i3 converted-angle trap")
check_numeric("tf-03-03", "i3", 0.87)
ok(near(math.cos(7 * math.pi / 6), -0.87, 5e-3) and near(math.cos(7 * math.pi / 6), -R3, 1e-12), "L3 ch1 direct + radical")
ok(math.cos(7 * math.pi / 6) < 0 and math.sin(7 * math.pi / 6) < 0, "L3 ch1: Q3 both negative directly")
check_numeric("tf-03-03", "ch1", -0.87)
ok(near(math.sin(D(30)), 0.5, 1e-12), "L3 remedial")
check_numeric("tf-03-03", "rem-tf0303-k", 0.5)

print("verify-tf-ch3: all checks passed")
