"""Dual-route verifier: right-triangles-trig ch2 (rt-02-01, the compressed trig on-ramp).
Route A: exact Fraction ratios from the named triangles. Route B: math.sin/cos/tan on the
angle recovered independently via atan2/asin. Proof deps: sy (AA similarity -> constant
ratios), rt ch1 (45-45-90 legs equal -> tan 45 = 1; 3-4-5 and 5-12-13 are triples).
No tf dep by design (trig-seam decision: rt self-contained)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {d["id"]: d for f in glob.glob("content/courses/right-triangles-trig/lessons/rt-02-*.json")
     for d in [json.load(open(f))]}
assert set(L) == {"rt-02-01"}, sorted(L)
d = L["rt-02-01"]

FAIL = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond:
        FAIL.append(name)

def widget(sid):
    for s in d["steps"]:
        if s["id"] == sid:
            return s["widget"]
    for r in d["remedials"]:
        if r["check"]["id"] == sid:
            return r["check"]["widget"]
    raise KeyError(sid)

def traps(w):
    return {e["value"] for e in w["commonErrors"]}

def correct_label(w):
    return [o["label"] for o in w["options"] if o["correct"]][0]

# proof deps: 3-4-5 and 5-12-13 are right (feeds every ratio below)
chk("dep: 3-4-5 right", F(3)**2 + F(4)**2 == F(5)**2)
chk("dep: 5-12-13 right", F(5)**2 + F(12)**2 == F(13)**2)
chk("dep: 6-8-10 right (remedial)", F(6)**2 + F(8)**2 == F(10)**2)

# figure fact: sin 35 deg ~= 0.574 (the ratio-constant-sweep centerpiece claim)
chk("figure: sin35=0.574", abs(math.sin(math.radians(35)) - 0.574) < 0.001)
# figure verticals: 70/110/150 * sin35 = 40.2/63.1/86.0
for r, y in [(70, 40.2), (110, 63.1), (150, 86.0)]:
    chk(f"figure: {r}*sin35={y}", abs(r * math.sin(math.radians(35)) - y) < 0.05)

# k1: sin theta = 3/5. Route A exact; Route B via angle recovered from legs.
w = widget("k1")
theta = math.atan2(3, 4)
chk("k1 route A", w["answer"] == 0.6 and F(3, 5) == F(6, 10))
chk("k1 route B", abs(math.sin(theta) - 0.6) < 1e-12)
chk("k1 traps", traps(w) == {0.8, 0.75, 1.67} and abs(F(5, 3) - F(167, 100)) < F(1, 100))  # cos, tan, flipped

# k2: cos theta = 4/5.
w = widget("k2")
chk("k2 route A", w["answer"] == 0.8 and F(4, 5) == F(8, 10))
chk("k2 route B", abs(math.cos(theta) - 0.8) < 1e-12)
chk("k2 traps", traps(w) == {0.6, 1.33, 0.75} and abs(4 / 3 - 1.33) < 0.005)

# i2: sin phi = 4/5 = cos theta (cofunction via angle swap). Route B: phi = pi/2 - theta.
phi = math.pi / 2 - theta
chk("i2 route A", correct_label(widget("i2")).startswith("4/5"))
chk("i2 route B", abs(math.sin(phi) - math.cos(theta)) < 1e-12 and abs(math.sin(phi) - 0.8) < 1e-12)

# k3: tan 45 = 1. Route A: equal legs ratio. Route B: math.tan.
w = widget("k3")
chk("k3 route A", w["answer"] == 1 and F(1, 1) == 1)
chk("k3 route B", abs(math.tan(math.radians(45)) - 1) < 1e-12)
chk("k3 traps", traps(w) == {0.71, 1.41, 2} and abs(1 / math.sqrt(2) - 0.71) < 0.005 and abs(math.sqrt(2) - 1.41) < 0.005)

# ch: 5-12-13, tan = 5/12 = 0.4167. Route B: tan(asin(5/13)).
w = widget("ch")
chk("ch route A", abs(w["answer"] - float(F(5, 12))) <= w["tolerance"])
chk("ch route B", abs(math.tan(math.asin(5 / 13)) - 5 / 12) < 1e-12)
chk("ch traps", traps(w) == {0.3846, 0.9231, 2.4}
    and abs(5 / 13 - 0.3846) < 0.0001 and abs(12 / 13 - 0.9231) < 0.0001 and F(12, 5) == F(24, 10))
chk("ch traps outside tol", all(abs(v - w["answer"]) > w["tolerance"] for v in traps(w)))

# remedials
w = widget("rem-rt-sohcahtoa-k")
chk("rem1", w["answer"] == 0.6 and F(6, 10) == F(3, 5) and abs(math.sin(math.atan2(6, 8)) - 0.6) < 1e-12)
w = widget("rem-rt-trig-constant-k")
chk("rem2 scale-invariance", w["answer"] == 0.6 and F(2 * 3, 2 * 5) == F(3, 5))

# cross: all numeric traps distinct & outside tolerance
ok = True
steps = list(d["steps"]) + [{"widget": r["check"]["widget"], "id": r["check"]["id"]} for r in d["remedials"]]
for s in steps:
    w = s.get("widget")
    if w and w.get("type") == "numeric":
        for e in w["commonErrors"]:
            if e["value"] == w["answer"] or abs(e["value"] - w["answer"]) <= w["tolerance"]:
                ok = False
                print("BAD TRAP", s["id"], e["value"])
chk("all traps distinct & outside tolerance", ok)

print()
if FAIL:
    print("VERIFIER FAILED:", FAIL)
    sys.exit(1)
print("verify-rt-ch2: ALL GREEN")
