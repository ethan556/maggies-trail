#!/usr/bin/env python3
"""Independent re-derivation of rational-number-operations Chapter 2 (Subtracting Integers).

7.NS.1c: subtracting a signed number equals adding its opposite: a - b = a + (-b).
SELF-TESTED dual-route: the CCSS-taught "add the opposite" rule (reusing Ch1's independently
verified addition rule) is cross-checked against raw Python integer subtraction -- two
genuinely separate computational paths for every integer pair in a wide range.
"""
import json, glob, re, sys


def add_by_rule(a, b):
    if a == 0:
        return b
    if b == 0:
        return a
    if (a > 0) == (b > 0):
        mag = abs(a) + abs(b)
        return mag if a > 0 else -mag
    if abs(a) >= abs(b):
        mag = abs(a) - abs(b)
        return mag if a > 0 else -mag
    else:
        mag = abs(b) - abs(a)
        return mag if b > 0 else -mag


def subtract_as_add_opposite(a, b):
    return add_by_rule(a, -b)


def _selftest():
    for a in range(-20, 21):
        for b in range(-20, 21):
            assert subtract_as_add_opposite(a, b) == a - b, (a, b)   # add-the-opposite vs raw subtraction
    print("  self-test: integer-subtraction toolkit OK (add-the-opposite vs raw subtraction agree, -20..20)")


def parse_subtract(prompt):
    m = re.search(r"(-?\d+)\s*[-−]\s*\(?(-?\d+)\)?\s*=", prompt)
    if not m:
        m = re.search(r"what is (-?\d+)\s*[-−]\s*\(?(-?\d+)\)?", prompt.lower())
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    return subtract_as_add_opposite(a, b)


def _selftest_parsers():
    assert parse_subtract("5 - (-3) = ?") == 8
    assert parse_subtract("What is -4 - 6?") == -10
    assert parse_subtract("-2 − (-8) = ?") == 6
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/rational-number-operations/lessons/rno-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            want = parse_subtract(w.get("prompt", ""))
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
