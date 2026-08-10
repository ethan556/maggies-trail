"""Dual-route verifier: right-triangles-trig ch4 (elevation/depression + applications).
Route A: forward trig at the stated angle. Route B: independent reconstruction —
recover the angle from the answer via atan2/asin (or verify with the OTHER triangle
in two-reading problems). Proof deps: rt-ch3 (side/angle solving), rt-ch2 (ratio
definitions), transformations-measurement / parallel-lines material (alternate
interior angles justify depression relocation), sy (similar triangles under a
shared sun angle). No tf dep (trig-seam decision). Every trap re-derived from
its named error model; two-reading system solved independently here."""
import json, glob, math, sys

r = math.radians
d = math.degrees

L = {j["id"]: j for f in glob.glob("content/courses/right-triangles-trig/lessons/rt-04-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"rt-04-01", "rt-04-02", "rt-04-03"}, sorted(L)

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

# ============ rt-04-01 ============
w = widget("rt-04-01", "k1")  # 50 tan32 = 31.24
chk("01.k1 A", near(50 * math.tan(r(32)), w["answer"], w["tolerance"]))
chk("01.k1 B", near(d(math.atan2(w["answer"], 50)), 32, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("01.k1 traps", tr == {26.5, 80.02, 42.4} and near(50 * math.sin(r(32)), 26.5)
    and near(50 / math.tan(r(32)), 80.02) and near(50 * math.cos(r(32)), 42.4))

w = widget("rt-04-01", "k1b")  # 60 tan25 = 27.98
chk("01.k1b A", near(60 * math.tan(r(25)), w["answer"], w["tolerance"]))
chk("01.k1b B", near(d(math.atan2(w["answer"], 60)), 25, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("01.k1b traps", tr == {25.36, 128.67, 54.38} and near(60 * math.sin(r(25)), 25.36)
    and near(60 / math.tan(r(25)), 128.67) and near(60 * math.cos(r(25)), 54.38))

# k2 mcq: depression = elevation (alternate interior angles)
chk("01.k2 relocation", correct_label(widget("rt-04-01", "k2")).startswith("15\u00b0"))
# i2 mcq: tan27 = 120/x setup
chk("01.i2 setup", correct_label(widget("rt-04-01", "i2")) == "tan 27\u00b0 = 120/x")

w = widget("rt-04-01", "ch")  # 80/tan15 = 298.56
chk("01.ch A", near(80 / math.tan(r(15)), w["answer"], w["tolerance"]))
chk("01.ch B", near(d(math.atan2(80, w["answer"])), 15, 0.02) and w["answer"] > 80)
tr = {e["value"] for e in w["commonErrors"]}
chk("01.ch traps", tr == {21.44, 309.1, 20.71} and near(80 * math.tan(r(15)), 21.44)
    and near(80 / math.sin(r(15)), 309.1, 0.05) and near(80 * math.sin(r(15)), 20.71)
    and 309.1 > w["answer"])  # slant > horizontal leg, consistent geometry

w = widget("rt-04-01", "rem-rt-elev-depress-k")
chk("01.rem", w["answer"] == 40 and {e["value"] for e in w["commonErrors"]} == {50, 140}
    and 90 - 40 == 50 and 180 - 40 == 140)

# ============ rt-04-02 ============
w = widget("rt-04-02", "k1")  # 40 tan55 + 1.6 = 58.73
chk("02.k1 A", near(40 * math.tan(r(55)) + 1.6, w["answer"], w["tolerance"]))
chk("02.k1 B", near(d(math.atan2(w["answer"] - 1.6, 40)), 55, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("02.k1 traps", tr == {57.13, 34.37} and near(40 * math.tan(r(55)), 57.13)
    and near(40 * math.sin(r(55)) + 1.6, 34.37) and near(w["answer"] - 57.13, 1.6, 0.01))

w = widget("rt-04-02", "k2")  # 90 sin48 = 66.88
chk("02.k2 A", near(90 * math.sin(r(48)), w["answer"], w["tolerance"]))
chk("02.k2 B", near(d(math.asin(w["answer"] / 90)), 48, 0.02) and w["answer"] < 90)  # kite below string length
tr = {e["value"] for e in w["commonErrors"]}
chk("02.k2 traps", tr == {60.22, 99.96} and near(90 * math.cos(r(48)), 60.22)
    and near(90 * math.tan(r(48)), 99.96) and 99.96 > 90)  # named impossibility: higher than string

# i2 mcq: 60-degree kite higher, sin ratio ~1.73
chk("02.i2", correct_label(widget("rt-04-02", "i2")).startswith("The 60\u00b0 kite")
    and near(90 * math.sin(r(60)), 77.9, 0.05) and near(90 * math.sin(r(30)), 45, 1e-9))
chk("02.i2 factor", near(math.sin(r(60)) / math.sin(r(30)), 1.732, 0.001))

# k3 mcq setup: 2500 / tan12
chk("02.k3 setup", correct_label(widget("rt-04-02", "k3")) == "2500 \u00f7 tan 12\u00b0")

w = widget("rt-04-02", "ch")  # 2500/tan12 = 11761.58
chk("02.ch A", near(2500 / math.tan(r(12)), w["answer"], w["tolerance"]))
chk("02.ch B", near(d(math.atan2(2500, w["answer"])), 12, 0.01) and w["answer"] > 2500)
tr = {e["value"] for e in w["commonErrors"]}
chk("02.ch traps", tr == {531.39, 12024.34} and near(2500 * math.tan(r(12)), 531.39, 0.05)
    and near(2500 / math.sin(r(12)), 12024.34, 0.05)
    and near(math.hypot(2500, w["answer"]), 12024.34, 6))  # slant consistency via Pythagoras

w = widget("rt-04-02", "rem-rt-height-apps-k")  # 20 sin70 = 18.79
chk("02.rem", near(20 * math.sin(r(70)), w["answer"], w["tolerance"])
    and {e["value"] for e in w["commonErrors"]} == {6.84, 54.95}
    and near(20 * math.cos(r(70)), 6.84) and near(20 * math.tan(r(70)), 54.95)
    and near(math.hypot(18.79, 6.84), 20, 0.01))

# ============ rt-04-03 ============
w = widget("rt-04-03", "k1")  # 12/tan38 = 15.36
chk("03.k1 A", near(12 / math.tan(r(38)), w["answer"], w["tolerance"]))
chk("03.k1 B", near(d(math.atan2(12, w["answer"])), 38, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("03.k1 traps", tr == {9.38, 19.49, 7.39} and near(12 * math.tan(r(38)), 9.38)
    and near(12 / math.sin(r(38)), 19.49) and near(12 * math.sin(r(38)), 7.39))

w = widget("rt-04-03", "k2")  # 18/sin65 = 19.86
chk("03.k2 A", near(18 / math.sin(r(65)), w["answer"], w["tolerance"]))
chk("03.k2 B", near(d(math.asin(18 / w["answer"])), 65, 0.02) and w["answer"] > 18)
tr = {e["value"] for e in w["commonErrors"]}
chk("03.k2 traps", tr == {16.31, 42.59, 38.6} and near(18 * math.sin(r(65)), 16.31)
    and near(18 / math.cos(r(65)), 42.59) and near(18 * math.tan(r(65)), 38.6) and 16.31 < 18)

# k3 mcq: two-reading equation orientation (near sees steeper angle)
lbl = correct_label(widget("rt-04-03", "k3"))
chk("03.k3 setup", lbl == "x\u00b7tan 55\u00b0 = (x + 30)\u00b7tan 40\u00b0")
# verify the wrong orientation truly fails (x negative): x(tan40 - tan55) = 30 tan55 -> x < 0
t40, t55 = math.tan(r(40)), math.tan(r(55))
chk("03.k3 wrong-orientation negative", (30 * t55) / (t40 - t55) < 0)

# i2: far distance x + 30 = 72.74, from independently solved system
x = 30 * t40 / (t55 - t40)
w = widget("rt-04-03", "i2")
chk("03.i2 A", near(x + 30, w["answer"], 0.05))
chk("03.i2 traps", {e["value"] for e in w["commonErrors"]} == {42.74, 12.74} and near(x, 42.74, 0.05)
    and near(42.74 - 30, 12.74, 1e-9))

# ch: h = 61.03. Route A near triangle; Route B far triangle (independent).
w = widget("rt-04-03", "ch")
h_near = x * t55
h_far = (x + 30) * t40
chk("03.ch A (near)", near(h_near, w["answer"], w["tolerance"]))
chk("03.ch B (far, independent)", near(h_far, w["answer"], w["tolerance"]) and near(h_near, h_far, 1e-9))
tr = {e["value"] for e in w["commonErrors"]}
chk("03.ch traps", tr == {25.17, 42.84, 35.86} and near(30 * t40, 25.17) and near(30 * t55, 42.84)
    and near(42.74 * t40, 35.86))

w = widget("rt-04-03", "rem-rt-trig-apps-k")  # 45-degree shadow: h = 25 exactly
chk("03.rem", w["answer"] == 25 and near(math.tan(r(45)), 1, 1e-12))
chk("03.rem traps", {e["value"] for e in widget("rt-04-03", "rem-rt-trig-apps-k")["commonErrors"]} == {17.68, 35.36}
    and near(25 * math.sin(r(45)), 17.68) and near(25 / math.cos(r(45)), 35.36))

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
print("verify-rt-ch4: ALL GREEN")
