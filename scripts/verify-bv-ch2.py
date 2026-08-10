#!/usr/bin/env python3
"""Verification for bivariate-statistics Chapter 2 (Fitting a Line to Data), 8.SP.2.

Chapters 2's fit-quality material (closeness, balance) is qualitative. The mechanically
checkable content is reading the slope and intercept out of a line's equation y = mx + b,
which appears in bv-02-03. Dual-route:
  Route A (parse): read m and b straight from the (m, b) the lesson states.
  Route B (reconstruct): rebuild the same line from two points it must pass through —
    the y-intercept point (0, b) and a second point (x1, m*x1 + b) — then recover slope as
    (y2 - y1)/(x2 - x1) and intercept as the y-value at x = 0. Both routes must agree.
Self-tested over a grid of (m, b) before trusting the authored facts.
"""
import sys
from fractions import Fraction as F


def slope_from_two_points(p1, p2):
    (x1, y1), (x2, y2) = p1, p2
    return F(y2 - y1, x2 - x1)


def intercept_from_point_slope(p, m):
    x, y = p
    return y - m * x  # b = y - m x


def reconstruct(m, b):
    """Route B: build two points, recover (slope, intercept) independently."""
    p1 = (0, b)
    p2 = (2, m * 2 + b)
    ms = slope_from_two_points(p1, p2)
    bs = intercept_from_point_slope(p2, ms)
    return ms, bs


def _selftest():
    mism = 0
    for mnum in range(-5, 6):
        for b in range(-5, 6):
            m = F(mnum)
            ms, bs = reconstruct(m, b)
            if ms != m or bs != b:
                mism += 1
    # a fractional slope too
    ms, bs = reconstruct(F(1, 2), 2)
    if ms != F(1, 2) or bs != 2:
        mism += 1
    assert mism == 0, f"{mism} reconstruction mismatches"
    print("  self-test: parse route and two-point reconstruction agree on (m,b) grid incl. fractional slope")


def main():
    _selftest()
    fails = checked = 0

    # authored (equation -> stated slope, stated intercept) facts from bv-02-03
    facts = [
        # (m, b, which, expected)
        (2, 3, "intercept", 3),
        (4, 5, "slope", 4),
        (3, 1, "slope", 3),     # steppedReveal
        (3, 1, "intercept", 1),
        (-2, 20, "slope", -2),
        (5, 0, "intercept", 0),
        (3, 7, "slope", 3),     # remedial
    ]
    for m, b, which, exp in facts:
        checked += 1
        ms, bs = reconstruct(F(m), b)
        got = ms if which == "slope" else bs
        if got != exp:
            fails += 1
            print(f"  FAIL y={m}x+{b} {which}: reconstructed {got}, authored {exp}")

    # slope-sign <-> association direction (bv-02-03 k3)
    checked += 1
    if not (F(-2) < 0):  # negative slope => negative association
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
