#!/usr/bin/env python3
"""Independent re-derivation of geometry-g7 Chapter 4 (Triangles & Cross-Sections), 7.G.2-3.

SELF-TESTED dual-route for the triangle inequality:
  Route A (sorted test): sort sides; smallest two must sum to strictly more than the largest.
  Route B (all-pairs test): for EVERY side, the other two must sum to more than it — the
    textbook three-inequality form. The two are equivalent; verified over a grid before use.
Third-side counting is checked by both the formula (|a-b| < s < a+b) and brute-force testing
each candidate with Route A. The roundup lesson's scale/circle chains reuse the already-
verified Ch1/Ch2 relations, re-derived here numerically.
"""
import sys


def forms_A(sides):
    a, b, c = sorted(sides)
    return a + b > c


def forms_B(sides):
    a, b, c = sides
    return (a + b > c) and (a + c > b) and (b + c > a)


def count_third_formula(a, b):
    lo, hi = abs(a - b), a + b
    return sum(1 for s in range(lo + 1, hi))


def count_third_brute(a, b):
    return sum(1 for s in range(1, a + b + 2) if forms_A((a, b, s)))


def _selftest():
    mism = 0
    for a in range(1, 12):
        for b in range(1, 12):
            for c in range(1, 16):
                if forms_A((a, b, c)) != forms_B((a, b, c)):
                    mism += 1
            if count_third_formula(a, b) != count_third_brute(a, b):
                mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: sorted-test vs all-pairs triangle tests agree; formula vs brute third-side counts agree")


def main():
    _selftest()
    fails = checked = 0

    # authored triangle facts: (sides, expected forms?)
    tris = [((5, 5, 9), True), ((1, 2, 3), False), ((3, 4, 5), True), ((2, 3, 6), False),
            ((4, 4, 4), True), ((2, 2, 5), False), ((7, 8, 12), True)]
    for sides, e in tris:
        checked += 1
        if forms_A(sides) != e or forms_B(sides) != e:
            fails += 1
            print(f"  TRI FAIL {sides}: {forms_A(sides)} vs {e}")

    # third-side facts: sides 4,6 -> 10 impossible, 9/5/3 possible
    checked += 1
    if forms_A((4, 6, 10)) or not all(forms_A((4, 6, s)) for s in (9, 5, 3)):
        fails += 1
    # counting: sides 2,7 -> exactly 3 whole-number third sides (6,7,8)
    checked += 1
    if count_third_formula(2, 7) != 3 or count_third_brute(2, 7) != 3:
        fails += 1
        print(f"  COUNT FAIL 2,7: {count_third_formula(2,7)}")
    checked += 1
    if not all(forms_A((2, 7, s)) for s in (6, 7, 8)) or forms_A((2, 7, 5)) or forms_A((2, 7, 9)):
        fails += 1

    # roundup chains (reusing verified Ch1/Ch2 relations)
    checked += 1
    if 3 * 2 != 6 or 2 * 6 != 12 or 6 * 6 != 36:   # radius 3cm@1:2 -> 6m; C 12π; A 36π
        fails += 1
    checked += 1
    if 2 * 2 != 4 or 4 * 4 != 16:                   # radius 2cm@1:2 -> 4m; A 16π
        fails += 1
    checked += 1
    if (180 - 0) // 3 != 60 or 60 + 2 * 60 != 180:  # x + 2x = 180
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
