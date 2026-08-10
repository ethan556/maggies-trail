#!/usr/bin/env python3
"""Independent re-derivation of rational-number-operations Chapter 4
(Operations with Rational Numbers -- signed fractions and decimals).

7.NS.1d/2d/3: all four operations extended to signed fractions and decimals.
SELF-TESTED dual-route for every operation type:
- Fraction multiply/divide: sign computed separately (same rule as Ch3) cross-checked
  against direct exact Fraction multiplication/division (Python's Fraction operators).
- Decimal add/subtract: exact Fraction arithmetic (decimals converted to their exact
  Fraction form) cross-checked against raw float arithmetic, to within a cent tolerance --
  two independently-coded numeric paths, not the same code read twice.
"""
import json, glob, re, sys
from fractions import Fraction as F


def frac_sign_rule_multiply(a, b):
    sign = 1 if (a >= 0) == (b >= 0) else -1
    return sign * abs(a) * abs(b)


def frac_sign_rule_divide(a, b):
    sign = 1 if (a >= 0) == (b >= 0) else -1
    return sign * abs(a) / abs(b)


def _selftest():
    cases = [(F(-1, 2), F(2, 3)), (F(-3, 4), F(1, 2)), (F(2, 5), F(-3, 10)), (F(-5, 6), F(-1, 3))]
    for a, b in cases:
        assert frac_sign_rule_multiply(a, b) == a * b, (a, b)             # sign rule vs direct Fraction multiply
        assert frac_sign_rule_divide(a, b) == a / b, (a, b)               # sign rule vs direct Fraction divide
    for a_dec, b_dec in [(-2.5, 1.75), (3.25, -1.5), (-4.1, -2.9), (0.75, -0.25)]:
        a, b = F(str(a_dec)), F(str(b_dec))
        exact = float(a + b)
        raw = round(a_dec + b_dec, 10)
        assert abs(exact - raw) < 1e-9, (a_dec, b_dec, exact, raw)        # exact-fraction vs raw float
    print("  self-test: rational-ops toolkit OK (sign rule vs direct Fraction ops; exact vs raw-float decimals agree)")


def parse_fraction(s):
    s = s.strip()
    neg = s.startswith("-")
    if neg:
        s = s[1:]
    n, d = s.split("/")
    val = F(int(n), int(d))
    return -val if neg else val


def parse_frac_multiply(prompt):
    m = re.search(r"(-?\d+/\d+)\s*(?:×|\*)\s*(-?\d+/\d+)\s*=", prompt)
    if not m:
        return None
    a, b = parse_fraction(m.group(1)), parse_fraction(m.group(2))
    return frac_sign_rule_multiply(a, b)


def parse_frac_divide(prompt):
    m = re.search(r"(-?\d+/\d+)\s*(?:÷|/)\s*(-?\d+/\d+)\s*=", prompt)
    if not m:
        return None
    a, b = parse_fraction(m.group(1)), parse_fraction(m.group(2))
    return frac_sign_rule_divide(a, b)


def parse_decimal_add_sub(prompt):
    m = re.search(r"(-?\d+\.?\d*)\s*([+\-−])\s*\(?(-?\d+\.?\d*)\)?\s*=", prompt)
    if not m:
        return None
    a, op, b = float(m.group(1)), m.group(2), float(m.group(3))
    fa, fb = F(str(a)), F(str(b))
    if op == "+":
        return float(fa + fb)
    return float(fa - fb)


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def _selftest_parsers():
    assert parse_fraction("-1/2") == F(-1, 2)
    assert parse_frac_multiply("-1/2 × 2/3 = ?") == F(-1, 3)
    assert parse_frac_divide("-3/4 ÷ 1/2 = ?") == F(-3, 2)
    assert abs(parse_decimal_add_sub("-2.5 + 1.75 = ?") - (-0.75)) < 1e-9
    assert abs(parse_decimal_add_sub("3.25 - (-1.5) = ?") - 4.75) < 1e-9
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/rational-number-operations/lessons/rno-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = parse_decimal_add_sub(prompt)
                if want is not None:
                    checked += 1
                    ok = (abs(float(w["answer"]) - want) < 0.005 and w["tolerance"] <= 0.01
                          and len(w["commonErrors"]) >= 2
                          and all(abs(e["value"] - want) > 0.005 for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} decimal FAIL want {want} got {w['answer']}")
                    continue
            elif w["type"] == "mcq":
                want = parse_frac_multiply(prompt)
                if want is None:
                    want = parse_frac_divide(prompt)
                if want is not None:
                    corr = [o for o in w["options"] if o.get("correct")]
                    if len(corr) != 1:
                        fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                    checked += 1
                    if corr[0]["label"].strip() != frac_label(want):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL want {frac_label(want)!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
