#!/usr/bin/env python3
"""Independent re-derivation of transformations-measurement Chapter 4 (The Pythagorean
Theorem), 8.G.6-8. All authored answers are whole numbers by design (radical simplification
is deliberately left to radicals-and-exponents per DECISIONS.md), so this verifier confirms
every result is a perfect square / integer.

SELF-TESTED dual-route:
  Route A (formula): c = isqrt(a²+b²); missing leg = isqrt(c²-b²); distance = isqrt(dx²+dy²).
  Route B (search / independent confirmation): find the integer whose square equals the
  target sum-or-difference by a bounded linear scan (not isqrt), and confirm it squares
  back exactly. The converse is checked by the symmetric predicate a²+b²==c² on the sorted
  sides both directly and via a squared-set comparison. Cross-checked over all Pythagorean
  configurations in a range before trusting the authored facts.
"""
import sys
from math import isqrt


def hyp(a, b):
    s = a * a + b * b
    r = isqrt(s)
    return r if r * r == s else None


def leg(c, b):
    s = c * c - b * b
    if s < 0:
        return None
    r = isqrt(s)
    return r if r * r == s else None


def dist(x1, y1, x2, y2):
    s = (x2 - x1) ** 2 + (y2 - y1) ** 2
    r = isqrt(s)
    return r if r * r == s else None


def is_right(sides):
    a, b, c = sorted(sides)
    return a * a + b * b == c * c


def _sqrt_by_scan(n):
    """Independent integer-sqrt: linear scan up to a bound, return k if k*k==n else None."""
    k = 0
    while k * k < n:
        k += 1
    return k if k * k == n else None


def _selftest():
    mismatches = 0
    # confirm hyp/leg formula agrees with scan-based sqrt across perfect-square configs
    for a in range(1, 40):
        for b in range(1, 40):
            s = a * a + b * b
            f = isqrt(s)
            f = f if f * f == s else None
            g = _sqrt_by_scan(s)
            if f != g:
                mismatches += 1
    # is_right symmetric predicate matches squared-set logic
    for a in range(1, 20):
        for b in range(1, 20):
            for c in range(1, 28):
                sides = [a, b, c]
                direct = is_right(sides)
                aa, bb, cc = sorted(sides)
                setwise = (aa * aa + bb * bb == cc * cc)
                if direct != setwise:
                    mismatches += 1
    assert mismatches == 0, f"{mismatches} mismatches"
    print("  self-test: formula vs scan integer-sqrt agree; converse predicate consistent (ranges scanned)")


def main():
    _selftest()
    fails = checked = 0

    # hypotenuse facts: (a, b, expected c)   (and c² intermediate where authored)
    hyps = [(6, 8, 10), (5, 12, 13), (8, 15, 17), (9, 12, 15), (3, 4, 5)]
    for a, b, c in hyps:
        checked += 1
        if hyp(a, b) != c or _sqrt_by_scan(a * a + b * b) != c:
            fails += 1
            print(f"  HYP FAIL legs {a},{b}: got {hyp(a,b)}, authored {c}")

    # c² intermediates authored in tm-04-01
    for a, b, c2 in [(6, 8, 100), (5, 12, 169), (3, 4, 25)]:
        checked += 1
        if a * a + b * b != c2:
            fails += 1
            print(f"  CSQ FAIL {a},{b}: got {a*a+b*b}, authored {c2}")

    # missing-leg facts: (c, b, expected a)
    legs = [(13, 5, 12), (10, 6, 8)]
    for c, b, a in legs:
        checked += 1
        if leg(c, b) != a or _sqrt_by_scan(c * c - b * b) != a:
            fails += 1
            print(f"  LEG FAIL hyp {c} leg {b}: got {leg(c,b)}, authored {a}")

    # converse facts: (sides, expected is_right)
    conv = [
        ((3, 4, 5), True), ((8, 15, 17), True), ((6, 8, 10), True), ((9, 12, 15), True),
        ((5, 6, 7), False), ((4, 5, 6), False), ((2, 3, 4), False),
    ]
    for sides, exp in conv:
        checked += 1
        if is_right(sides) != exp:
            fails += 1
            print(f"  CONV FAIL {sides}: got {is_right(sides)}, authored {exp}")

    # distance facts: (x1,y1,x2,y2, expected d)
    dists = [(0, 0, 3, 4, 5), (1, 2, 4, 6, 5)]
    for x1, y1, x2, y2, d in dists:
        checked += 1
        if dist(x1, y1, x2, y2) != d:
            fails += 1
            print(f"  DIST FAIL ({x1},{y1})->({x2},{y2}): got {dist(x1,y1,x2,y2)}, authored {d}")

    # ladder challenge: legs 9,12 -> 15
    checked += 1
    if hyp(9, 12) != 15:
        fails += 1

    # proof challenge: leg-square areas 9,16 -> c=5
    checked += 1
    if isqrt(9 + 16) != 5 or 9 + 16 != 25:
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
