"""Dual-route verifier for sequences-series Ch2 (sigma notation).

Route A: authored closed values / shortcut identities.
Route B: brute-force expansion — a literal sigma interpreter that iterates the counter
         and sums, with no closed formulas. Every claimed value and every mcq option's
         FORM is recomputed against the brute expansion.
"""
import json, glob, sys

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/sequences-series/lessons/sr-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"sr-02-01", "sr-02-02", "sr-02-03"}, "expected 3 ch2 lessons")

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

def sigma(lo, hi, rule):
    """Route B: literal interpreter — iterate and add."""
    total = 0
    for k in range(lo, hi + 1):
        total += rule(k)
    return total

# ---- L1 ----
ok(sigma(1, 5, lambda k: 2 * k + 1) == 3 + 5 + 7 + 9 + 11 == 35, "L1 anatomy sum dual route")
check_numeric("sr-02-01", "i2", 35)
ok(sigma(1, 3, lambda k: k * k) == 1 + 4 + 9 == 14, "L1 k2 dual route")
ok((1 + 2 + 3) ** 2 == 36 != 14, "L1 k2 trap is the genuinely different square-of-sum")
check_numeric("sr-02-01", "k2", 14)
ok(sigma(1, 4, lambda k: 3) == 12, "L1 i3 dual route")
check_numeric("sr-02-01", "i3", 12)
ok(sigma(1, 4, lambda k: k * k - k) == 0 + 2 + 6 + 12 == 20, "L1 ch1 dual route")
check_numeric("sr-02-01", "ch1", 20)
ok(sigma(1, 3, lambda k: k + 2) == 12, "L1 remedial dual route")
check_numeric("sr-02-01", "rem-sr0201-k", 12)
ok(one_correct("sr-02-01", "i1") == "stop the counter when k reaches 5", "L1 i1 label")
# matchPairs: every keyed pair verified by expansion; every pairError is a real mismatch
w = widget("sr-02-01", "k1")
rules = {"s1": lambda k: 2 * k, "s2": lambda k: k + 1, "s3": lambda k: k * k}
exps = {"r1": [2, 4, 6], "r2": [2, 3, 4], "r3": [1, 4, 9]}
for lft, rgt in w["pairs"].items():
    ok([rules[lft](k) for k in (1, 2, 3)] == exps[rgt], "L1 k1 pair %s->%s" % (lft, rgt))
for e in w["pairErrors"]:
    ok([rules[e["left"]](k) for k in (1, 2, 3)] != exps[e["right"]], "L1 k1 pairError is actually correct")

# ---- L2 ----
ok(sigma(1, 4, lambda k: 3 * k - 1) == 2 + 5 + 8 + 11 == 26, "L2 i1 dual route")
check_numeric("sr-02-02", "i1", 26)
ok(sigma(3, 6, lambda k: k) == 18, "L2 k1 dual route")
ok(sigma(1, 6, lambda k: k) == 21 and sigma(4, 6, lambda k: k) == 15, "L2 k1 traps are the started-at-1 and dropped-3 sums")
check_numeric("sr-02-02", "k1", 18)
ok(len(list(range(3, 12))) == 11 - 3 + 1 == 9, "L2 i2 fencepost dual route")
check_numeric("sr-02-02", "i2", 9)
ok(sigma(0, 3, lambda k: 2 ** k) == 15 and sigma(1, 3, lambda k: 2 ** k) == 14, "L2 k2 dual route + dropped-k0 trap")
check_numeric("sr-02-02", "k2", 15)
ok(4 * sigma(1, 6, lambda k: k) == sigma(1, 6, lambda k: 4 * k) == 84, "L2 i3 factor-out identity, both routes")
check_numeric("sr-02-02", "i3", 84)
ok(sigma(2, 5, lambda k: k * k) == 54 and sigma(1, 5, lambda k: k * k) == 55, "L2 ch1 dual route + included-1 trap")
check_numeric("sr-02-02", "ch1", 54)
ok(len(list(range(5, 10))) == 5, "L2 remedial fencepost")
check_numeric("sr-02-02", "rem-sr0202-k", 5)

# ---- L3 ----
target_evens = list(range(2, 21, 2))
forms_i1 = {
    "\u03a3 from k = 1 to 10 of 2k": [2 * k for k in range(1, 11)],
    "\u03a3 from k = 1 to 20 of 2k": [2 * k for k in range(1, 21)],
    "\u03a3 from k = 2 to 20 of k": list(range(2, 21)),
    "\u03a3 from k = 1 to 10 of (k + 1)": [k + 1 for k in range(1, 11)],
}
w = widget("sr-02-03", "i1")
for o in w["options"]:
    terms = forms_i1[o["label"]]
    if o["correct"]:
        ok(terms == target_evens, "L3 i1 keyed form fails expansion")
    else:
        ok(terms != target_evens, "L3 i1 distractor accidentally correct: " + o["label"])

target_sq = [k * k for k in range(1, 8)]
forms_k1 = {
    "\u03a3 from k = 1 to 7 of k\u00b2": [k * k for k in range(1, 8)],
    "\u03a3 from k = 1 to 49 of k\u00b2": [k * k for k in range(1, 50)],
    "\u03a3 from k = 1 to 7 of 2k": [2 * k for k in range(1, 8)],
    "\u03a3 from k = 1 to 7 of k": list(range(1, 8)),
}
w = widget("sr-02-03", "k1")
for o in w["options"]:
    terms = forms_k1[o["label"]]
    ok((terms == target_sq) == bool(o["correct"]), "L3 k1 option truth mismatch: " + o["label"])

# buildExpression rule 3k+1: both accepted builds expand to the target sum; both commonBuilds fail
target = [4, 7, 10, 13]
ok([3 * k + 1 for k in range(1, 5)] == target, "L3 rule expansion")
ok([k + 3 for k in range(1, 5)] != target and [3 * k + 4 for k in range(1, 5)] != target, "L3 i2 commonBuilds are real misses")
w = widget("sr-02-03", "i2")
ok(w["correct"] == ["t3", "tdot", "tk", "tplus", "t1"], "L3 i2 correct tokens")
ok(["t1", "tplus", "t3", "tdot", "tk"] in w["acceptAlso"], "L3 i2 commutative accepted")

ok(3 * 10 == 30 and [3 * k for k in range(1, 11)] == list(range(3, 31, 3)), "L3 k2 bound dual route")
check_numeric("sr-02-03", "k2", 10)

target4 = [4, 7, 10, 13]
forms_i3 = {
    "\u03a3 from k = 0 to 3 of (3k + 4)": [3 * k + 4 for k in range(0, 4)],
    "\u03a3 from k = 0 to 4 of (3k + 4)": [3 * k + 4 for k in range(0, 5)],
    "\u03a3 from k = 1 to 4 of (3k + 4)": [3 * k + 4 for k in range(1, 5)],
    "\u03a3 from k = 0 to 3 of (4k + 3)": [4 * k + 3 for k in range(0, 4)],
}
w = widget("sr-02-03", "i3")
for o in w["options"]:
    ok((forms_i3[o["label"]] == target4) == bool(o["correct"]), "L3 i3 option truth mismatch: " + o["label"])

ok([4 * k + 2 for k in range(1, 6)] == [6, 10, 14, 18, 22], "L3 ch1 c=2 dual route")
check_numeric("sr-02-03", "ch1", 2)
ok([3 * k + 2 for k in range(1, 4)] == [5, 8, 11], "L3 remedial c=2 dual route")
check_numeric("sr-02-03", "rem-sr0203-k", 2)

print("verify-sr-ch2: all checks passed")
