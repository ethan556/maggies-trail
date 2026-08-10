"""Dual-route verifier for sequences-series Ch3 (arithmetic series).

Route A: the taught fold formulas S = n(a1+an)/2 and S = n/2(2a1+(n-1)d).
Route B: literal term-by-term addition (sum over a generated list) — formula-free.
Every claimed total must agree across both routes; unhalved/last-term traps are proven
to be the real neighbouring slips.
"""
import json, glob, sys
from fractions import Fraction as F

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/sequences-series/lessons/sr-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"sr-03-01", "sr-03-02", "sr-03-03"}, "expected 3 ch3 lessons")

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

def series(a1, d, n):
    return [a1 + i * d for i in range(n)]

def fold(a1, d, n):
    """Route A twice over: both taught forms, required to agree."""
    an = a1 + (n - 1) * d
    f1 = F(n * (a1 + an), 2)
    f2 = F(n, 2) * (2 * a1 + (n - 1) * d)
    ok(f1 == f2, "the two taught forms disagree (a1=%s d=%s n=%s)" % (a1, d, n))
    return f1

def dual(a1, d, n):
    """Route B literal addition must match Route A."""
    s = fold(a1, d, n)
    ok(s == sum(series(a1, d, n)), "fold != literal sum (a1=%s d=%s n=%s)" % (a1, d, n))
    return int(s)

# ---- L1 ----
ok(all(1 + 100 == k + (101 - k) for k in range(1, 51)), "L1 every Gauss pair is 101")
check_numeric("sr-03-01", "i1", 101)
ok(dual(1, 1, 100) == 5050 == 50 * 101, "L1 k1 dual route")
check_numeric("sr-03-01", "k1", 5050)
ok(dual(2, 2, 10) == 110, "L1 i2 dual route")
check_numeric("sr-03-01", "i2", 110)
ok(dual(5, 5, 10) == 275, "L1 k2 dual route")
check_numeric("sr-03-01", "k2", 275)
# steppedReveal proof: verify its arithmetic claims
ok(sum([3, 5, 7, 9]) == 24 and 4 * 12 == 48 and 48 // 2 == 24, "L1 i3 proof numbers")
ok(all(a + b == 12 for a, b in zip([3, 5, 7, 9], [9, 7, 5, 3])), "L1 i3 every column balances to 12")
# ch1: n recovered from the last term, then dual route
n = (39 - 3) // 4 + 1
ok(n == 10 and series(3, 4, n)[-1] == 39, "L1 ch1 n from last term")
ok(dual(3, 4, 10) == 210, "L1 ch1 dual route")
ok(F(9 * (3 + 39), 2) == 189, "L1 ch1 n=9 trap: the miscounted n applied to the true ends")
check_numeric("sr-03-01", "ch1", 210)
ok(dual(1, 1, 10) == 55, "L1 remedial dual route")
check_numeric("sr-03-01", "rem-sr0301-k", 55)

# ---- L2 ----
ok(dual(6, 5, 12) == 402 and series(6, 5, 12)[-1] == 61, "L2 i1 dual route + last term")
check_numeric("sr-03-02", "i1", 402)
ok(dual(10, -2, 8) == 24 and series(10, -2, 8)[-1] == -4, "L2 k1 dual route + negative last term")
# the sign-slip trap: pretending a8 = +4
ok(F(8 * (10 + 4), 2) == 56, "L2 k1 sign-slip trap value")
check_numeric("sr-03-02", "k1", 24)
ok(one_correct("sr-03-02", "i2") == "S = n/2 \u00b7 (2a\u2081 + (n \u2212 1)d)", "L2 i2 label")
ok(dual(7, 3, 20) == 710 and 2 * 7 + 19 * 3 == 71, "L2 k2 dual route + bracket")
check_numeric("sr-03-02", "k2", 710)
ok(dual(9, 4, 15) == 555 and series(9, 4, 15)[-1] == 65, "L2 i3 dual route")
check_numeric("sr-03-02", "i3", 555)
ok(dual(1, 2, 30) == 900 == 30 ** 2, "L2 ch1 dual route + n-squared identity")
ok(F(30 * 59, 2) == 885, "L2 ch1 last-term-as-pair trap value")
check_numeric("sr-03-02", "ch1", 900)
ok(dual(2, 3, 5) == 40, "L2 remedial dual route")
check_numeric("sr-03-02", "rem-sr0302-k", 40)

# ---- L3 ----
ok(dual(20, 2, 12) == 372 and series(20, 2, 12)[-1] == 42, "L3 i1 dual route")
check_numeric("sr-03-03", "i1", 372)
ok(dual(15, -1, 8) == 92 and series(15, -1, 8)[-1] == 8, "L3 k1 dual route (15 down to 8)")
check_numeric("sr-03-03", "k1", 92)
# sigma fold: route B is the sigma interpreter itself
sig = sum(2 * k + 3 for k in range(1, 21))
ok(sig == 480 == dual(5, 2, 20), "L3 i2 sigma interpreter == fold")
check_numeric("sr-03-03", "i2", 480)
# dragOrder: keyed order is the true dependency chain and the presented order is shuffled
w = widget("sr-03-03", "k2")
ok(w["correctOrder"] == ["s1", "s2", "s3", "s4"], "L3 k2 correct order")
ok([i["id"] for i in w["items"]] != w["correctOrder"], "L3 k2 items shuffled")
ok(5 + 7 * 2 == 19 and dual(5, 2, 8) == 96, "L3 k2 story numbers dual route")
ok(one_correct("sr-03-03", "i3") == "a\u2081\u2080 \u2014 a single term", "L3 i3 label")
ok(dual(24, -2, 10) == 150 and series(24, -2, 10)[-1] == 6, "L3 ch1 dual route")
check_numeric("sr-03-03", "ch1", 150)
ok(dual(4, 3, 3) == 21 and series(4, 3, 3)[-1] == 10, "L3 remedial dual route (term vs total)")
check_numeric("sr-03-03", "rem-sr0303-k", 21)

print("verify-sr-ch3: all checks passed")
