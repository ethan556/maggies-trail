#!/usr/bin/env python3
"""Independent re-derivation of rational-number-operations Chapter 3
(Multiplying & Dividing Integers).

7.NS.2a-c: same-sign product/quotient is positive; different-sign is negative.
SELF-TESTED dual-route: the CCSS-taught sign rule (compute the magnitude and sign
separately) is cross-checked against raw Python multiplication/(exact) division --
two genuinely independent computational paths, across a wide range including a
generalized odd/even-negative-count rule for products of 3+ factors.
"""
import json, glob, re, sys


def multiply_by_rule(a, b):
    sign = 1 if (a >= 0) == (b >= 0) else -1
    return sign * abs(a) * abs(b)


def multiply_n_by_rule(factors):
    neg_count = sum(1 for f in factors if f < 0)
    mag = 1
    for f in factors:
        mag *= abs(f)
    return mag if neg_count % 2 == 0 else -mag


def divide_by_rule(a, b):
    assert a % b == 0, (a, b, "must divide evenly for this course's scope")
    sign = 1 if (a >= 0) == (b >= 0) else -1
    return sign * (abs(a) // abs(b))


def _selftest():
    for a in range(-20, 21):
        for b in range(-20, 21):
            assert multiply_by_rule(a, b) == a * b, (a, b)          # rule vs raw multiplication
    for factors in [(-2, -3, -4), (2, -3, 4), (-1, -1, -1, -1), (5, -2, -2)]:
        prod = 1
        for f in factors:
            prod *= f
        assert multiply_n_by_rule(factors) == prod, factors          # n-factor rule vs raw product
    for a in range(-40, 41):
        for b in range(1, 11):
            if a % b == 0:
                assert divide_by_rule(a, b) == a // b if a * b >= 0 else divide_by_rule(a, b) == -(abs(a) // b), (a, b)
            if a % b == 0:
                assert divide_by_rule(a, b) * b == a, (a, b)          # exact-division round trip
    print("  self-test: integer-multiply/divide toolkit OK (sign rule vs raw arithmetic agree, incl. n-factor)")


def parse_multiply(prompt):
    m = re.search(r"(-?\d+)\s*(?:×|\*)\s*(-?\d+)\s*(?:×|\*)\s*(-?\d+)(?:\s*(?:×|\*)\s*(-?\d+))?\s*=", prompt)
    if m:
        factors = [int(g) for g in m.groups() if g is not None]
        return multiply_n_by_rule(factors)
    m = re.search(r"(-?\d+)\s*(?:×|\*)\s*(-?\d+)\s*=", prompt)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return multiply_by_rule(a, b)
    return None


def parse_divide(prompt):
    m = re.search(r"(-?\d+)\s*(?:÷|/)\s*(-?\d+)\s*=", prompt)
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    if b == 0 or a % b != 0:
        return None
    return divide_by_rule(a, b)


def _selftest_parsers():
    assert parse_multiply("-4 × 5 = ?") == -20
    assert parse_multiply("-3 × -6 = ?") == 18
    assert parse_multiply("-2 × -3 × -4 = ?") == -24
    assert parse_divide("-20 ÷ 4 = ?") == -5
    assert parse_divide("-18 / -3 = ?") == 6
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/rational-number-operations/lessons/rno-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            prompt = w.get("prompt", "")
            want = parse_multiply(prompt)
            if want is None:
                want = parse_divide(prompt)
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
