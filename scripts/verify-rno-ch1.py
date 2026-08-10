#!/usr/bin/env python3
"""Independent re-derivation of rational-number-operations Chapter 1 (Adding Integers).

7.NS.1: add signed integers. SELF-TESTED dual-route: the CCSS-taught RULE (same signs ->
add magnitudes and keep the sign; different signs -> subtract the smaller magnitude from
the larger and keep the sign of the larger-magnitude number) is cross-checked against raw
Python integer addition (a completely independent computational path -- the built-in
operator, not a re-implementation of the rule) for every integer pair in a wide range.
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
    # different signs: subtract smaller magnitude from larger, keep sign of larger magnitude
    if abs(a) >= abs(b):
        mag = abs(a) - abs(b)
        return mag if a > 0 else -mag
    else:
        mag = abs(b) - abs(a)
        return mag if b > 0 else -mag


def _selftest():
    for a in range(-20, 21):
        for b in range(-20, 21):
            assert add_by_rule(a, b) == a + b, (a, b, add_by_rule(a, b), a + b)   # rule vs builtin
    print("  self-test: integer-addition toolkit OK (CCSS rule vs raw builtin agree, -20..20)")


def parse_add(prompt):
    m = re.search(r"(-?\d+)\s*\+\s*\(?(-?\d+)\)?\s*=", prompt)
    if not m:
        m = re.search(r"what is (-?\d+)\s*\+\s*\(?(-?\d+)\)?", prompt.lower())
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    return add_by_rule(a, b)


def _selftest_parsers():
    assert parse_add("-4 + 9 = ?") == 5
    assert parse_add("What is -4 + (-9)?") == -13
    assert parse_add("7 + (-3) = ?") == 4
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/rational-number-operations/lessons/rno-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            want = parse_add(w.get("prompt", ""))
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
