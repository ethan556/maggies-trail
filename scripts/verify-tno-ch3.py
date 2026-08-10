#!/usr/bin/env python3
"""Independent re-derivation of tens-and-ones Chapter 3 (Adding & Subtracting Tens).

Exact integer arithmetic, SELF-TESTED. Every problem adds or subtracts a multiple of ten
from a two-digit number, so only the tens digit changes and every result stays in 0..99.
DUAL-ROUTE: the direct sum a±b is cross-checked in the self-test against decomposing a into
tens/ones and adjusting ONLY the tens count by b//10 (the "ones ride along unchanged" claim).
"""
import json, glob, re, sys


def answer(prompt):
    p = prompt.replace("\u2212", "-")                       # normalize unicode minus
    m = re.search(r"(\d+)\s*([+\-])\s*(\d+)\s*=", p)
    if not m:
        return None
    a, op, b = int(m.group(1)), m.group(2), int(m.group(3))
    return a + b if op == "+" else a - b


def _selftest():
    # DUAL-ROUTE invariant: adjusting only the tens count equals direct add/subtract,
    # for every 2-digit a and every multiple-of-ten b that keeps the result in 0..99.
    for a in range(10, 100):
        tens, ones = a // 10, a % 10
        for b in range(10, 100, 10):
            k = b // 10
            if a + b <= 99:
                assert (tens + k) * 10 + ones == a + b, (a, "+", b)
            if tens - k >= 0:
                assert (tens - k) * 10 + ones == a - b, (a, "-", b)
    cases = {
        "34 + 10 = ?": 44, "57 + 10 = ?": 67, "62 - 10 = ?": 52, "48 - 10 = ?": 38,
        "25 + 10 = ?": 35, "80 - 10 = ?": 70, "19 + 10 = ?": 29,
        "40 + 30 = ?": 70, "42 + 20 = ?": 62, "26 + 40 = ?": 66, "55 + 30 = ?": 85,
        "33 + 30 = ?": 63, "17 + 20 = ?": 37, "44 + 50 = ?": 94,
        "65 - 30 = ?": 35, "71 - 50 = ?": 21, "90 - 40 = ?": 50, "88 - 20 = ?": 68,
        "56 - 20 = ?": 36, "47 - 30 = ?": 17, "83 - 60 = ?": 23,
    }
    for p, want in cases.items():
        assert answer(p) == want, (p, answer(p), want)
        assert 0 <= want <= 99
    print("  self-test: add/subtract-tens toolkit OK (only-tens-digit-changes invariant)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/tens-and-ones/lessons/tno-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            want = answer(w.get("prompt", ""))
            if want is None:
                continue
            checked += 1
            ok = (int(w["answer"]) == want and w["tolerance"] == 0 and 0 <= want <= 99
                  and len(w["commonErrors"]) >= 2
                  and all(e["value"] != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
