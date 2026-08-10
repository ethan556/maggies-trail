#!/usr/bin/env python3
"""Independent re-derivation of place-value-1000 Chapter 4
(Adding & Subtracting to 1000 with Concrete Strategies).

2.NBT.7: add/subtract within 1000 using concrete models/place-value strategies -- NOT the
compact standard carry/borrow algorithm (that belongs to place-value's own Ch3; deliberately
avoided here, see DECISIONS.md). SELF-TESTED dual-route: the place-value DECOMPOSITION
strategy (split each number into hundreds/tens/ones, combine each place separately, trade
10 of a place for 1 of the next when a place overflows) is cross-checked against raw
Python addition/subtraction (the builtin operator, a completely independent computation).
"""
import json, glob, re, sys


def decompose(n):
    return n // 100, (n // 10) % 10, n % 10


def add_by_place_value(a, b):
    ah, at, ao = decompose(a)
    bh, bt, bo = decompose(b)
    ones = ao + bo
    tens = at + bt + ones // 10
    hundreds = ah + bh + tens // 10
    return hundreds * 100 + (tens % 10) * 10 + (ones % 10)


def subtract_by_place_value(a, b):
    ah, at, ao = decompose(a)
    bh, bt, bo = decompose(b)
    if ao < bo:
        at -= 1
        ao += 10
    if at < bt:
        ah -= 1
        at += 10
    return (ah - bh) * 100 + (at - bt) * 10 + (ao - bo)


def _selftest():
    for a in range(0, 1000, 13):
        for b in range(0, min(a, 1000), 17) if a > 0 else [0]:
            assert add_by_place_value(a, b) == a + b, (a, b)                 # decomposition vs raw addition
            if a >= b:
                assert subtract_by_place_value(a, b) == a - b, (a, b)        # decomposition vs raw subtraction
    print("  self-test: place-value-decomposition toolkit OK (decompose-combine-trade vs raw arithmetic agree)")


def parse_add(prompt):
    m = re.search(r"(\d{1,3})\s*\+\s*(\d{1,3})\s*=", prompt)
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    want = add_by_place_value(a, b)
    assert want == a + b, (a, b)
    return want


def parse_subtract(prompt):
    m = re.search(r"(\d{1,3})\s*[-−]\s*(\d{1,3})\s*=", prompt)
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    if a < b:
        return None
    want = subtract_by_place_value(a, b)
    assert want == a - b, (a, b)
    return want


def _selftest_parsers():
    assert parse_add("324 + 251 = ?") == 575
    assert parse_add("247 + 186 = ?") == 433
    assert parse_subtract("562 - 238 = ?") == 324
    assert parse_subtract("400 - 156 = ?") == 244
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/place-value-1000/lessons/pv1000-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            prompt = w.get("prompt", "")
            want = parse_add(prompt)
            if want is None:
                want = parse_subtract(prompt)
            if want is None:
                continue
            checked += 1
            ok = (int(w["answer"]) == want and w["tolerance"] == 0
                  and len(w["commonErrors"]) >= 2
                  and all(e["value"] != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
