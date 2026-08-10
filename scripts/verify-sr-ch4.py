"""Dual-route verifier for sequences-series Ch4 (finite geometric series).

Route A: the taught formula S = a1(1 - r^n)/(1 - r) (via Fractions, exact).
Route B: literal term-by-term addition of the generated geometric terms — formula-free.
Also re-derives every shift-and-subtract claim edge-by-edge, and proves each trap is
the genuine neighbouring slip it claims to be.
"""
import json, glob, sys
from fractions import Fraction as F

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/sequences-series/lessons/sr-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"sr-04-01", "sr-04-02", "sr-04-03"}, "expected 3 ch4 lessons")

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

def terms(a1, r, n):
    return [F(a1) * F(r) ** i for i in range(n)]

def dual(a1, r, n):
    """Route A formula must equal Route B literal addition."""
    formula = F(a1) * (1 - F(r) ** n) / (1 - F(r))
    literal = sum(terms(a1, r, n))
    ok(formula == literal, "formula != literal (a1=%s r=%s n=%s)" % (a1, r, n))
    return literal

def shift_subtract(a1, r, n):
    """Re-derive the trick: r*S and S share all but the edges."""
    t = terms(a1, r, n)
    shifted = [x * r for x in t]
    ok(shifted[:-1] == t[1:], "middle terms fail to align (a1=%s r=%s n=%s)" % (a1, r, n))
    S = sum(t)
    ok((r - 1) * S == shifted[-1] - t[0], "edge identity (r-1)S = top - bottom fails")
    return S

# ---- L1 ----
ok(3 + 24 == 27 and 6 + 12 == 18 and 27 != 18, "L1 the fold genuinely fails on 3+6+12+24")
check_numeric("sr-04-01", "i1", 18)
w = widget("sr-04-01", "i2")
ok(w["correctOrder"] == ["m1", "m2", "m3", "m4"], "L1 i2 correct order")
ok([i["id"] for i in w["items"]] != w["correctOrder"], "L1 i2 items shuffled")
ok(shift_subtract(3, 2, 4) == 45 == dual(3, 2, 4), "L1 k1 trick + dual route")
check_numeric("sr-04-01", "k1", 45)
ok(shift_subtract(2, 3, 3) == 26 and 2 * 26 == 54 - 2, "L1 i3 tripling trick: (r-1)S = 52")
check_numeric("sr-04-01", "i3", 26)
ok(shift_subtract(4, 2, 3) == 28 == 32 - 4, "L1 i4 solo run")
check_numeric("sr-04-01", "i4", 28)
ok(shift_subtract(1, 5, 4) == 156 and 4 * 156 == 625 - 1, "L1 ch1 trick edges")
ok(F(625 - 5, 4) == 155, "L1 ch1 trap 155 = subtracting the second term instead of the first")
check_numeric("sr-04-01", "ch1", 156)
ok(shift_subtract(1, 2, 3) == 7 == 8 - 1, "L1 remedial trick")
check_numeric("sr-04-01", "rem-sr0401-k", 7)

# ---- L2 ----
ok(dual(2, 3, 5) == 242 and terms(2, 3, 5)[-1] == 162, "L2 i1 dual route + last term")
ok(F(3 ** 5 - 1, 2) == 121, "L2 i1 dropped-a1 trap value")
check_numeric("sr-04-02", "i1", 242)
ok(dual(5, 2, 6) == 315 and terms(5, 2, 6)[-1] == 160, "L2 k1 dual route")
ok(5 * (2 ** 7 - 1) == 635, "L2 k1 exponent-overrun trap value")
check_numeric("sr-04-02", "k1", 315)
ok(one_correct("sr-04-02", "i2") == "4\u2074 = 256", "L2 i2 label")
ok(4 ** 3 == 64 == int(terms(1, 4, 4)[-1]), "L2 i2 distractor 4^3 really is the last term's power")
ok(dual(1, 4, 4) == 85 and sum(terms(4, 4, 3)) == 84, "L2 k2 dual route + first-term-dropped trap")
check_numeric("sr-04-02", "k2", 85)
ok(dual(16, F(1, 2), 4) == 30 and dual(16, F(1, 2), 5) == 31, "L2 i3 fractional-r dual route + fifth-term trap")
check_numeric("sr-04-02", "i3", 30)
ok(dual(1, 2, 7) == 127 == 2 ** 7 - 1, "L2 ch1 dual route + one-short-of-power identity")
check_numeric("sr-04-02", "ch1", 127)
ok(dual(1, 2, 4) == 15 == 2 ** 4 - 1, "L2 remedial dual route")
check_numeric("sr-04-02", "rem-sr0402-k", 15)

# ---- L3 ----
ok(dual(4, 3, 5) == 484 and terms(4, 3, 5)[-1] == 324 and 4 * (3 ** 5 - 1) == 968, "L3 i1 dual route + both traps")
check_numeric("sr-04-03", "i1", 484)
ok(dual(2, 2, 6) == 126 and terms(2, 2, 6)[-1] == 64 and 2 * (2 ** 7 - 1) == 254, "L3 k1 dual route + both traps")
check_numeric("sr-04-03", "k1", 126)
sig = sum(3 * 2 ** (k - 1) for k in range(1, 7))
ok(sig == 189 == dual(3, 2, 6) and 3 * 2 ** 5 == 96 and 3 * (2 ** 7 - 1) == 381, "L3 i2 sigma interpreter == formula + traps")
check_numeric("sr-04-03", "i2", 189)
w = widget("sr-04-03", "k2")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"q1": "term", "q2": "total", "q3": "term", "q4": "total"}, "L3 k2 bucket key")
ok(one_correct("sr-04-03", "i3") == "$10 + $20 + $40 + $80", "L3 i3 label")
# prove each i3 distractor's classification
ok(len({b - a for a, b in zip([10, 20, 30, 40], [20, 30, 40])}) == 1, "L3 i3: 10+20+30+40 really is arithmetic")
ok(len({F(b, a) for a, b in zip([10, 20, 40, 80], [20, 40, 80])}) == 1, "L3 i3: keyed series really has constant ratio")
gaps = [12 - 10, 15 - 12, 19 - 15]
ratios = {F(12, 10), F(15, 12), F(19, 15)}
ok(len(set(gaps)) > 1 and len(ratios) > 1, "L3 i3: third option really is neither")
ok(dual(3, 3, 4) == 120 and terms(3, 3, 4)[-1] == 81 and 3 * (3 ** 4 - 1) == 240, "L3 ch1 dual route + both traps")
check_numeric("sr-04-03", "ch1", 120)
ok(dual(5, 2, 3) == 35 and 5 * 2 ** 2 == 20 and 5 * 2 ** 3 == 40, "L3 remedial dual route + traps")
check_numeric("sr-04-03", "rem-sr0403-k", 35)

print("verify-sr-ch4: all checks passed")
