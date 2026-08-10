#!/usr/bin/env python3
"""Independent re-derivation of geometry-g7 Chapter 2 (Circles), 7.G.4. Answers are exact
coefficients of pi.

SELF-TESTED dual-route:
  Route A (formulas): C-coefficient = 2r (or d); A-coefficient = r².
  Route B (relational): C from the DIAMETER route must equal C from the RADIUS route via
    d = 2r; A rebuilt by repeated addition of r, r times (r² without the ** operator); the
    cylinder-link fact rebuilt as base-area × height and cross-checked against tm-05's
    verified 36π. Rounding facts recomputed with 3.14 independently.
"""
import sys


def circ_from_r(r):
    return 2 * r


def circ_from_d(d):
    return d


def area_coeff(r):
    return r * r


def area_by_addition(r):
    total = 0
    for _ in range(r):
        total += r
    return total


def _selftest():
    mism = 0
    for r in range(1, 30):
        d = 2 * r
        if circ_from_r(r) != circ_from_d(d):
            mism += 1
        if area_coeff(r) != area_by_addition(r):
            mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: radius/diameter circumference routes and multiply/addition area routes agree (r=1..29)")


def main():
    _selftest()
    fails = checked = 0

    # d = 2r facts: (r, d)
    for r, d in [(5, 10), (7, 14), (4, 8), (6, 12)]:
        checked += 1
        if 2 * r != d or d // 2 != r:
            fails += 1
            print(f"  RD FAIL r={r} d={d}")

    # radius-difference challenge: diameters 20 and 6 -> radii 10, 3 -> diff 7
    checked += 1
    if (20 // 2) - (6 // 2) != 7:
        fails += 1

    # circumference coefficients: (given, kind, expected)
    for given, kind, e in [(5, "r", 10), (7, "r", 14), (10, "r", 20), (4, "r", 8), (8, "d", 8)]:
        checked += 1
        got = circ_from_r(given) if kind == "r" else circ_from_d(given)
        alt = circ_from_d(2 * given) if kind == "r" else circ_from_r(given // 2)
        if got != e or alt != e:
            fails += 1
            print(f"  CIRC FAIL {kind}={given}: {got}/{alt} vs {e}")

    # area coefficients: (r, expected) — including diameter-first cases
    for r, e in [(5, 25), (10, 100), (3, 9), (4, 16), (8 // 2, 16), (10 // 2, 25)]:
        checked += 1
        if area_coeff(r) != e or area_by_addition(r) != e:
            fails += 1
            print(f"  AREA FAIL r={r}: {area_coeff(r)} vs {e}")

    # rounding: 6π with 3.14 -> 18.84 -> 19
    checked += 1
    if round(6 * 3.14) != 19:
        fails += 1
        print(f"  ROUND FAIL: {6*3.14}")

    # cylinder-link: base 9π stacked 4 high -> 36π (matches tm-05's verified fact)
    checked += 1
    base = area_coeff(3)
    if base != 9 or base * 4 != 36:
        fails += 1

    # C vs A mixup sanity: at r=10, C-coeff (20) << A-coeff (100)
    checked += 1
    if not (circ_from_r(10) < area_coeff(10)):
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
