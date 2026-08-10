"""Dual-route verifier for sequences-series Ch1 (recursive vs explicit).

Route A: explicit formulas — a_n = a1 + (n-1)d and a_n = a1 * r**(n-1) — evaluated directly.
Route B: literal recursion — a tiny interpreter that walks the chain hop by hop, so every
         claimed term is recomputed WITHOUT any closed formula. Both routes must agree.
"""
import json, glob, sys

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/sequences-series/lessons/sr-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"sr-01-01", "sr-01-02", "sr-01-03"}, "expected 3 ch1 lessons")

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

# Route B: the formula-free chain walker
def walk(a1, hop, n):
    t = a1
    for _ in range(n - 1):
        t = hop(t)
    return t

# ---- L1 facts ----
ok(walk(4, lambda t: t + 3, 3) == 10 and 4 + 2 * 3 == 10, "L1 k1 dual route")
check_numeric("sr-01-01", "k1", 10)
ok(walk(4, lambda t: t + 3, 6) == 19 and 4 + 5 * 3 == 19, "L1 i2 dual route")
check_numeric("sr-01-01", "i2", 19)
# i2 traps are the real neighbouring slips
w = widget("sr-01-01", "i2")
ok({e["value"] for e in w["commonErrors"]} == {4 + 6 * 3, walk(4, lambda t: t + 3, 5)}, "L1 i2 traps are n-slip and a5")
ok(walk(2, lambda t: 2 * t, 4) == 16 and 2 * 2 ** 3 == 16, "L1 i3 dual route")
check_numeric("sr-01-01", "i3", 16)
ok(walk(5, lambda t: t + 6, 5) == 29 and 5 + 4 * 6 == 29, "L1 ch1 dual route")
check_numeric("sr-01-01", "ch1", 29)
ok(walk(3, lambda t: t + 2, 3) == 7, "L1 remedial dual route")
check_numeric("sr-01-01", "rem-sr0101-k", 7)
ok("a\u2099 = a\u2099\u208b\u2081 + 3" in one_correct("sr-01-01", "i1"), "L1 i1 keyed to the recursive form")
ok(one_correct("sr-01-01", "k2") == "the term right before it", "L1 k2 label")
# every WRONG i1 option must fail to be the recursive rule of 4,7,10,13
w = widget("sr-01-01", "i1")
for o in w["options"]:
    if not o["correct"]:
        ok("a\u2081 = 4, a\u2099 = a\u2099\u208b\u2081 + 3" != o["label"], "L1 i1 distractor collision")

# ---- L2 facts ----
ok(walk(20, lambda t: t - 4, 4) == 8 and 20 - 3 * 4 == 8, "L2 i1 dual route")
check_numeric("sr-01-02", "i1", 8)
ok(walk(1, lambda t: 3 * t, 4) == 27 and 1 * 3 ** 3 == 27, "L2 k1 dual route")
check_numeric("sr-01-02", "k1", 27)
# the mixed rule has NO arithmetic/geometric closed form here — walker only, cross-checked
seq = [walk(1, lambda t: 2 * t + 1, n) for n in (1, 2, 3, 4)]
ok(seq == [1, 3, 7, 15], "L2 mixed-rule chain")
diffs = {seq[i + 1] - seq[i] for i in range(3)}
ratios = {seq[i + 1] / seq[i] for i in range(3)}
ok(len(diffs) > 1 and len(ratios) > 1, "L2 mixed rule is genuinely neither arithmetic nor geometric")
check_numeric("sr-01-02", "i2", 7)
ok(one_correct("sr-01-02", "k2").startswith("computing every term"), "L2 k2 label")
# dragBucket: every item's keyed bucket is stated
w = widget("sr-01-02", "i3")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"q1": "rec", "q2": "exp", "q3": "rec", "q4": "exp"}, "L2 i3 bucket key")
ok(walk(2, lambda t: 3 * t - 1, 4) == 41, "L2 ch1 route B")
ok(3 * (3 * (3 * 2 - 1) - 1) - 1 == 41, "L2 ch1 route A (unrolled)")
check_numeric("sr-01-02", "ch1", 41)
ok(walk(5, lambda t: 2 * t, 3) == 20, "L2 remedial dual route")
check_numeric("sr-01-02", "rem-sr0102-k", 20)

# ---- L3 facts ----
ok(walk(5, lambda t: t + 4, 12) == 49 and 5 + 11 * 4 == 49, "L3 k1 dual route")
check_numeric("sr-01-03", "k1", 49)
ok(one_correct("sr-01-03", "i2") == "a\u2081 = 7, a\u2099 = a\u2099\u208b\u2081 + 5", "L3 i2 label")
# k2: prove the keyed explicit form matches the walker at n=1..6, and every distractor fails somewhere
ok(one_correct("sr-01-03", "k2") == "a\u2099 = 4\u00b73\u207f\u207b\u00b9", "L3 k2 label")
forms = {
    "a\u2099 = 4\u00b73\u207f\u207b\u00b9": lambda n: 4 * 3 ** (n - 1),
    "a\u2099 = 4\u00b73\u207f": lambda n: 4 * 3 ** n,
    "a\u2099 = (4\u00b73)\u207f\u207b\u00b9": lambda n: 12 ** (n - 1),
    "a\u2099 = 4 + (n \u2212 1)\u00b73": lambda n: 4 + (n - 1) * 3,
}
truth = [walk(4, lambda t: 3 * t, n) for n in range(1, 7)]
w = widget("sr-01-03", "k2")
for o in w["options"]:
    vals = [forms[o["label"]](n) for n in range(1, 7)]
    if o["correct"]:
        ok(vals == truth, "L3 k2 keyed form disagrees with the chain")
    else:
        ok(vals != truth, "L3 k2 distractor %s accidentally correct" % o["label"])
ok(walk(4, lambda t: 3 * t, 3) == 36 and 4 * 3 ** 2 == 36, "L3 i3 dual route")
check_numeric("sr-01-03", "i3", 36)
ok(walk(40, lambda t: t - 6, 15) == -44 and 40 + 14 * (-6) == -44, "L3 ch1 dual route")
check_numeric("sr-01-03", "ch1", -44)
check_numeric("sr-01-03", "rem-sr0103-k", 5)
# buildExpression: the accepted builds are the two commutative orders and nothing keyed uses "n"
w = widget("sr-01-03", "i1")
ok(w["correct"] == ["t9", "tplus", "tnm1", "tdot", "t2"], "L3 i1 correct build")
ok(["t9", "tplus", "t2", "tdot", "tnm1"] in w["acceptAlso"], "L3 i1 commutative build accepted")
ok("tn" not in w["correct"] and all("tn" not in a for a in w["acceptAlso"]), "L3 i1 n-token excluded from accepted builds")
ok(9 + (6 - 1) * 2 == walk(9, lambda t: t + 2, 6), "L3 i1 built rule dual route (n=6)")

print("verify-sr-ch1: all checks passed")
