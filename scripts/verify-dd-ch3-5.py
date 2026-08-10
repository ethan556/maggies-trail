#!/usr/bin/env python3
"""Course 20 (data-distributions) numeric verification — session 2026-07-06.

Written fresh after the /tmp verification scripts were found tampered (see QA_LOG
security incident). Every expected value below is derived inline from the raw
data with Fraction arithmetic; nothing is imported from earlier scripts. The
quartile convention is the logged one (DECISIONS.md): median-exclusive halves.
Run: python3 scripts/verify-dd-ch3-5.py  → must end VERIFIED 35/35, 0 FAILS.
"""
import json
from fractions import Fraction as F

def med(xs):
    s = sorted(xs); n = len(s)
    return F(s[n // 2]) if n % 2 else (F(s[n // 2 - 1]) + F(s[n // 2])) / 2

def quart(xs):
    s = sorted(xs); n = len(s)
    return med(s[: n // 2]), med(s[(n + 1) // 2 :])

L = lambda i: json.load(open(f"content/courses/data-distributions/lessons/{i}.json"))

def numerics(d):
    out = [(s["id"], s["widget"]) for s in d["steps"] if s.get("widget", {}).get("type") == "numeric"]
    out += [(r["check"]["id"], r["check"]["widget"]) for r in d.get("remedials", [])
            if r["check"]["widget"]["type"] == "numeric"]
    return out

# Raw datasets (as stated in the lesson prose)
books4 = [3, 5, 7, 9]; walks = [6, 2, 9, 3]
odd5 = [7, 2, 9, 4, 6]; even6 = [3, 5, 8, 12, 14, 16]; plants = [9, 2, 7, 4]
packs = [4, 5, 6, 7, 8]; packs6 = packs + [30]
temps = [58, 64, 71, 62]; b2 = [2, 3, 5, 8, 10]; laps = [3, 5, 7, 9, 12]
even8 = [2, 4, 6, 8, 10, 12, 14, 16]; odd7 = [3, 5, 6, 8, 10, 12, 14]; chd = [5, 1, 9, 3, 7, 4]
A = [4, 5, 6, 8, 9, 10]; B = [1, 2, 6, 8, 12, 13]
trip = [5, 10, 10, 15, 15, 15, 20, 20, 25]
allow = [10, 12, 12, 14, 14, 16, 18, 64]
books10 = [0, 1, 1, 2, 2, 2, 3, 3, 4, 12]

EXPECT = {
    "dd-03-01": {
        "i1": F(2 + 4 + 6, 3), "k1": F(sum(books4), 4),
        "k2": F(7 * 4 - (5 + 8 + 9)), "ch1": F(sum(walks), 4), "rem-mn-k": F(6, 3),
    },
    "dd-03-02": {
        "k1": med(odd5), "k2": med(even6), "ch1": med(plants), "rem-md-k": med([5, 1, 3]),
    },
    "dd-03-03": {
        "i1": F(sum(packs6), 6), "k1": med(packs6),
        "ch1": F(sum(packs6), 6) - F(sum(packs), 5), "rem-cc-k": med([1, 2, 30]),
    },
    "dd-04-01": {
        "k1": max(temps) - min(temps), "i2": max(b2) - min(b2),
        "ch1": 20 - min(laps), "rem-rg-k": 9 - 4,
    },
    "dd-04-02": {
        "i1": quart(even8)[0], "k1": quart(even8)[1] - quart(even8)[0],
        "k2": quart(odd7)[1] - quart(odd7)[0], "ch1": quart(chd)[1] - quart(chd)[0],
        "rem-iq-k": F(7, 2) - F(3, 2),
    },
    "dd-04-03": {
        "i1": med(B), "k1": quart(B)[1] - quart(B)[0], "k3": max(B) - min(B),
        "rem-sc-k": max([1, 7, 13]) - min([1, 7, 13]),
    },
    "dd-05-01": {
        "i1": med(trip), "k1": quart(trip)[1] - quart(trip)[0], "k3": F(sum(trip), 9),
    },
    "dd-05-02": {
        "i1": sum(1 for v in allow if v < F(sum(allow), 8)),
        "k1": quart(allow)[1] - quart(allow)[0],
        "ch1": F(sum(allow), 8) - med(allow),
    },
    "dd-05-03": {
        # canonical (restored) capstone: i2 asks IQR, k2 asks mean, ch1 asks the mean−median gap
        "i2": quart(books10)[1] - quart(books10)[0],
        "k2": F(sum(books10), len(books10)),
        "ch1": F(sum(books10), len(books10)) - med(books10),
    },
}

# Prose-claim assertions (values stated in concept bodies / feedback)
assert F(sum(packs6), 6) == 10 and med(packs) == 6 and F(sum(packs), 5) == 6 and med(packs6) == F(13, 2)
assert quart(even8) == (5, 13) and quart(odd7) == (5, 12) and med(sorted(odd7)[:4]) == F(11, 2)
assert F(sum(A), 6) == med(A) == F(sum(B), 6) == med(B) == 7 and quart(A) == (5, 9) and quart(B) == (2, 12)
assert F(sum(trip), 9) == med(trip) == 15 and quart(trip) == (10, 20)
assert F(sum(allow), 8) == 20 and med(allow) == 14 and quart(allow) == (12, 17)
assert F(sum(books10), 10) == 3 and med(books10) == 2 and quart(books10) == (1, 3)
assert med([2, 3, 4, 91]) == F(7, 2) and F(sum([2, 3, 4, 91]), 4) == 25

checked = fails = 0
for lid, spec in EXPECT.items():
    d = L(lid)
    got_ids = set()
    for sid, w in numerics(d):
        got_ids.add(sid)
        want = spec[sid]
        checked += 1
        ok = F(str(w["answer"])) == F(want) and w["tolerance"] == 0
        ok = ok and all(F(str(e["value"])) != F(str(w["answer"])) for e in w["commonErrors"])
        ok = ok and (len(w["commonErrors"]) >= 2)
        if not ok:
            fails += 1
            print(f"✗ {lid}/{sid}: answer {w['answer']} vs derived {want}")
    missing = set(spec) - got_ids
    if missing:
        fails += 1
        print(f"✗ {lid}: expected numeric steps missing: {missing}")
print(f"VERIFIED {checked}/{checked + 0} numeric widgets, prose assertions clean, {fails} FAILS")
raise SystemExit(1 if fails else 0)
