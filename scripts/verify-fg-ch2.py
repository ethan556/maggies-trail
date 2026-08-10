#!/usr/bin/env python3
"""Independent re-derivation of functions-g8 Chapter 2 (Rate of Change & Initial Value),
8.F.4 + 8.EE.6.

SELF-TESTED dual-route for slope between two points:
  Route A (direct division): slope = (y2 - y1) / (x2 - x1) as an exact Fraction.
  Route B (similar-triangles / scaling route): find the smallest integer step of the
  run, scale the rise by the same factor, and confirm the reduced rise-over-run matches —
  an independent path modeling the CCSS similar-triangles argument (scale a triangle up or
  down and the ratio is invariant) rather than a single division. Cross-checked to agree
  on an exhaustive grid of integer point pairs before trusting either against authored content.
"""
import json, glob, re, sys
from fractions import Fraction
from math import gcd


def slope_direct(x1, y1, x2, y2):
    return Fraction(y2 - y1, x2 - x1)


def slope_similar_triangles(x1, y1, x2, y2):
    """Independent route: reduce the run/rise triangle to its primitive form (dividing both
    legs by their gcd), which is exactly the 'smallest similar triangle' — then the slope is
    the reduced rise over the reduced run. Models scale-invariance of similar triangles."""
    run = x2 - x1
    rise = y2 - y1
    if run == 0:
        return None  # vertical, undefined
    g = gcd(abs(run), abs(rise)) or 1
    prim_run = run // g
    prim_rise = rise // g
    # normalize sign so the run is positive (a triangle scaled by a negative is the same line)
    if prim_run < 0:
        prim_run = -prim_run
        prim_rise = -prim_rise
    return Fraction(prim_rise, prim_run)


def _selftest():
    mismatches = 0
    for x1 in range(-5, 6):
        for y1 in range(-5, 6):
            for x2 in range(-5, 6):
                for y2 in range(-5, 6):
                    if x1 == x2:
                        continue
                    a = slope_direct(x1, y1, x2, y2)
                    b = slope_similar_triangles(x1, y1, x2, y2)
                    if a != b:
                        mismatches += 1
                        if mismatches <= 5:
                            print(f"  MISMATCH ({x1},{y1})->({x2},{y2}): direct={a} sim-tri={b}")
    assert mismatches == 0, f"{mismatches} mismatches between direct and similar-triangles routes"
    print("  self-test: direct-division vs similar-triangles slope routes agree (all integer pairs -5..5)")


# authored slope facts: ((x1,y1),(x2,y2), expected slope as Fraction)
SLOPE_FACTS = [
    ((1, 1), (4, 7), Fraction(2)), ((2, 3), (5, 12), Fraction(3)), ((0, 0), (3, 2), Fraction(2, 3)),
    ((-1, 2), (3, 14), Fraction(3)), ((1, 2), (4, 8), Fraction(2)),
]
# authored rate-of-change facts: (in1,out1,in2,out2, expected rate)
RATE_FACTS = [
    (3, 10, 5, 18, Fraction(4)), (2, 4, 5, 19, Fraction(5)), (1, 10, 3, 4, Fraction(-3)),
    (2, 50, 6, 30, Fraction(-5)), (1, 2, 3, 8, Fraction(3)),
    (0, 0, 1, 5, Fraction(5)), (0, 0, 2, 6, Fraction(3)), (0, 0, 1, 2, Fraction(2)),
]
# authored initial-value facts: (slope, point_x, point_y, expected initial value b)
INIT_FACTS = [
    (2, 3, 10, 4), (3, 0, 1, 1),  # from (0,1) directly
]
# table-based initial value: (list of (x,y), expected b)
TABLE_INIT = [([(0, 7), (1, 10), (2, 13)], 7)]
# similar-triangle scaling: small rise/run, big run -> expected big rise
SCALE_FACTS = [(3, 1, 3, 9)]  # slope 3/1, big run 3 -> rise 9


def main():
    _selftest()
    fails = checked = 0

    for (p1, p2, expect) in SLOPE_FACTS:
        checked += 1
        a = slope_direct(*p1, *p2)
        b = slope_similar_triangles(*p1, *p2)
        if a != b or a != expect:
            fails += 1
            print(f"  SLOPE FAIL {p1}->{p2}: direct={a} sim={b} authored={expect}")

    for (i1, o1, i2, o2, expect) in RATE_FACTS:
        checked += 1
        rate = Fraction(o2 - o1, i2 - i1)
        if rate != expect:
            fails += 1
            print(f"  RATE FAIL ({i1},{o1})->({i2},{o2}): computed {rate}, authored {expect}")

    for (m, px, py, expect_b) in INIT_FACTS:
        checked += 1
        b = py - m * px
        if b != expect_b:
            fails += 1
            print(f"  INIT FAIL slope {m} thru ({px},{py}): computed b={b}, authored {expect_b}")

    for (table, expect_b) in TABLE_INIT:
        checked += 1
        b = next((y for x, y in table if x == 0), None)
        if b != expect_b:
            fails += 1
            print(f"  TABLE-INIT FAIL {table}: computed b={b}, authored {expect_b}")

    for (small_rise, small_run, big_run, expect_big_rise) in SCALE_FACTS:
        checked += 1
        big_rise = Fraction(small_rise, small_run) * big_run
        if big_rise != expect_big_rise:
            fails += 1
            print(f"  SCALE FAIL slope {small_rise}/{small_run}, run {big_run}: computed rise {big_rise}, authored {expect_big_rise}")

    # matchPairs (fg-02-01 i2): three rate computations
    checked += 1
    mp = {"l1": (0, 0, 1, 5, 5), "l2": (0, 0, 2, 6, 3), "l3": (0, 0, 1, 2, 2)}
    for k, (i1, o1, i2, o2, want) in mp.items():
        if Fraction(o2 - o1, i2 - i1) != want:
            fails += 1
            print(f"  MATCHPAIRS FAIL {k}: expected {want}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
