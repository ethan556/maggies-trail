"""Dual-route verifier for complex-numbers Ch2 (i, powers of i, complex plane).

Route A: rule-based (sqrt(-k)=i*sqrt(k), remainder-mod-4 cycle, a+bi part-reading).
Route B: Python's native complex type / integer pow, as an independent oracle.
"""
import json, glob, sys, math

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/complex-numbers/lessons/cn-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"cn-02-01", "cn-02-02", "cn-02-03"}, "expected 3 ch2 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step " + lid + "/" + sid)

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["answer"] == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    for e in w["commonErrors"]:
        ok(e["value"] != expect, "%s/%s trap equals answer" % (lid, sid))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " traps")

# ---- L1: sqrt of negatives ----
def principal_root_label(k):
    # Route A: i*sqrt(k) -> "ni". Route B: cmath sqrt.
    import cmath
    r = cmath.sqrt(-k)
    n = int(math.isqrt(k))
    ok(n * n == k, "k not a perfect square: %s" % k)
    ok(abs(r - complex(0, n)) < 1e-12, "cmath principal root disagrees for -%s" % k)
    return "%di" % n

ok(principal_root_label(25) == "5i" and one_correct("cn-02-01", "i1") == "5i", "L1 i1")
ok(principal_root_label(49) == "7i" and one_correct("cn-02-01", "k1") == "7i", "L1 k1")
ok(principal_root_label(36) == "6i" and one_correct("cn-02-01", "rem-cn0201-k") == "6i", "L1 remedial")
# i2: x^2 = -16 -> ±4i; oracle: both roots square to -16
ok(complex(0, 4) ** 2 == -16 and complex(0, -4) ** 2 == -16, "L1 i2 oracle")
ok(one_correct("cn-02-01", "i2") == "x = ±4i", "L1 i2 label")
ok(complex(0, 1) ** 2 == -1 and one_correct("cn-02-01", "k2") == "−1", "L1 k2")
ok((complex(0, 3)) ** 2 == -9 and one_correct("cn-02-01", "k3") == "−9", "L1 k3")
# ch1: (5i)^2 + 30 = 5 — oracle
val = (complex(0, 5)) ** 2 + 30
ok(val == complex(5, 0), "L1 ch1 oracle %s" % val)
check_numeric("cn-02-01", "ch1", 5)
# trap sanity: 55 = treating (5i)^2 as +25
ok(25 + 30 == 55, "L1 ch1 trap derivation")

# ---- L2: powers of i ----
CYC = {0: "1", 1: "i", 2: "−1", 3: "−i"}
def ipow_label(n):
    # Route A: remainder cycle
    a = CYC[n % 4]
    # Route B: Python complex pow
    v = complex(0, 1) ** n
    m = {complex(1, 0): "1", complex(0, 1): "i", complex(-1, 0): "−1", complex(0, -1): "−i"}
    b = min(m.items(), key=lambda kv: abs(v - kv[0]))[1]
    ok(abs(v - [k for k, s in m.items() if s == b][0]) < 1e-9, "pow oracle noisy n=%d" % n)
    ok(a == b, "cycle vs pow disagree for n=%d: %s vs %s" % (n, a, b))
    return a

for lid_sid, n in [(("cn-02-02", "i1"), 3), (("cn-02-02", "k1"), 10), (("cn-02-02", "i2"), 23),
                   (("cn-02-02", "k2"), 40), (("cn-02-02", "rem-cn0202-k"), 6)]:
    ok(one_correct(*lid_sid) == ipow_label(n), "L2 %s/%s i^%d" % (lid_sid[0], lid_sid[1], n))
# k3: i^4+i^8+i^12 = 3 — dual route
sA = sum({0: 1, 2: -1}[n % 4] for n in (4, 8, 12))
sB = complex(0, 1) ** 4 + complex(0, 1) ** 8 + complex(0, 1) ** 12
ok(sA == 3 and abs(sB - 3) < 1e-9, "L2 k3 routes")
check_numeric("cn-02-02", "k3", 3)
# ch1: i^2+i^4+i^6 = -1
sA = sum({0: 1, 2: -1}[n % 4] for n in (2, 4, 6))
sB = sum(complex(0, 1) ** n for n in (2, 4, 6))
ok(sA == -1 and abs(sB - (-1)) < 1e-9, "L2 ch1 routes")
check_numeric("cn-02-02", "ch1", -1)

# ---- L3: the plane ----
def parts(z):
    return z.real, z.imag

ok(parts(complex(4, -7))[0] == 4 and one_correct("cn-02-03", "i1") == "4", "L3 i1")
ok(parts(complex(6, 5))[1] == 5 and one_correct("cn-02-03", "k2") == "5", "L3 k2")
check_numeric("cn-02-03", "rem-cn0203-k", 9)
ok(parts(complex(9, 3))[0] == 9, "L3 remedial oracle")
# plotPoint integrity: targets = (re, im); errors differ, in-grid
for sid, re_, im_ in [("k1", 3, 2), ("k3", 1, 4)]:
    w = widget("cn-02-03", sid)
    ok(w["targets"] == [{"x": re_, "y": im_}], "L3 %s target" % sid)
    ok(1 <= re_ <= w["cols"] and 1 <= im_ <= w["rows"], "L3 %s target off-grid" % sid)
    for e in w["pointErrors"]:
        ok((e["x"], e["y"]) != (re_, im_), "L3 %s error hits target" % sid)
        ok(1 <= e["x"] <= w["cols"] and 1 <= e["y"] <= w["rows"], "L3 %s error off-grid" % sid)
    ok(w["yLabels"][0].endswith("i"), "L3 %s imaginary-axis labels" % sid)
# i2: 5i on vertical axis (real part 0); distractors have nonzero real part or are real
ok(parts(complex(0, 5))[0] == 0, "L3 i2 oracle")
ok(one_correct("cn-02-03", "i2") == "5i", "L3 i2 label")
ok(one_correct("cn-02-03", "ch1") == "2 + 5i" and parts(complex(2, 5)) == (2, 5), "L3 ch1")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-cn-ch2: %d/%d checks passed" % (PASS, PASS))
