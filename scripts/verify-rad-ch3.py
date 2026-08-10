#!/usr/bin/env python3
"""Independent re-derivation of radicals-and-exponents Chapter 3 (Rational Exponents).

Exact arithmetic, SELF-TESTED. Parses a^(m/n) (m may be negative). Evaluates by taking the
exact integer n-th root of a (r, where r**n == a), then r**|m|, reciprocating if m<0.
DUAL-ROUTE: the integer n-th root is confirmed by r**n == a, and the power route
(r**m)**n == a**m is checked in the self-test. Integer results are authored as numerics;
fractional results (negative exponents) as mcq exact labels.
"""
import json, glob, re, sys
from fractions import Fraction as F


def iroot(a, n):
    if a < 0:
        return None
    r = round(a ** (1.0 / n))
    for c in (r - 1, r, r + 1):
        if c >= 0 and c ** n == a:
            return c
    return None


def parse_pow(prompt):
    m = re.search(r"(\d+)\^\(?(-?\d+)/(\d+)\)?", prompt.replace(" ", ""))
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))
    return None


def value(a, m, n):
    r = iroot(a, n)
    if r is None:
        return None
    v = r ** abs(m)
    return F(1, v) if m < 0 else F(v)


def parse_frac(label):
    s = label.replace(" ", "")
    m = re.fullmatch(r"(-?\d+)/(\d+)", s)
    if m:
        return F(int(m.group(1)), int(m.group(2)))
    m = re.fullmatch(r"-?\d+", s)
    if m:
        return F(int(s))
    return None


def _selftest():
    pos = {(16, 1, 2): 4, (27, 1, 3): 3, (81, 1, 4): 3, (32, 1, 5): 2, (8, 1, 3): 2,
           (100, 1, 2): 10, (64, 1, 3): 4, (8, 2, 3): 4, (16, 3, 4): 8, (27, 2, 3): 9,
           (32, 2, 5): 4, (4, 3, 2): 8, (8, 4, 3): 16, (81, 3, 4): 27}
    for (a, m, n), want in pos.items():
        r = iroot(a, n)
        assert r is not None and r ** n == a                       # route 1: root check
        assert value(a, m, n) == want, (a, m, n, value(a, m, n))
        assert (r ** m) ** n == a ** m, (a, m, n)                  # route 2: power identity
    neg = {(8, -1, 3): F(1, 2), (16, -1, 2): F(1, 4), (27, -2, 3): F(1, 9),
           (4, -1, 2): F(1, 2), (32, -1, 5): F(1, 2), (8, -2, 3): F(1, 4), (16, -3, 4): F(1, 8)}
    for (a, m, n), want in neg.items():
        assert value(a, m, n) == want, (a, m, n, value(a, m, n))
    assert parse_frac("1/2") == F(1, 2) and parse_frac("4") == 4
    print("  self-test: rational-exponent toolkit OK (root then power, dual-route identity)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/radicals-and-exponents/lessons/rad-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            pw = parse_pow(w.get("prompt", ""))
            if not pw:
                if w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            val = value(*pw)
            if val is None:
                continue
            if w["type"] == "numeric":
                if val.denominator != 1:
                    continue
                checked += 1
                ok = (F(str(w["answer"])) == val and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(F(str(e["value"])) != val for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {val} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                pf = parse_frac(corr[0]["label"])
                if pf is not None and pf != val:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL label {corr[0]['label']!r} != {val}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
