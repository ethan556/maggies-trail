#!/usr/bin/env python3
"""Independent re-derivation of bivariate-statistics Chapter 3 (Using the Line to Predict),
8.SP.3. The checkable content is prediction: plug a new x into y = mx + b.

SELF-TESTED dual-route:
  Route A (direct): y = m*x + b.
  Route B (point-slope reconstruction): the line also passes through its intercept point
    (0, b); predict via y = y0 + m*(x - x0) with (x0, y0) = (0, b). Algebraically identical
    but computed by a different expression path, catching order-of-operations slips. Both use
    exact Fractions so the ½-slope case stays exact. Cross-checked over a grid before trusting
    the authored predictions.
"""
import sys
from fractions import Fraction as F


def predict_direct(m, b, x):
    return m * x + b


def predict_pointslope(m, b, x):
    # line through (0, b): y = y0 + m*(x - x0)
    x0, y0 = 0, b
    return y0 + m * (x - x0)


def _selftest():
    mism = 0
    for mnum in range(-5, 6):
        for b in range(-5, 6):
            for x in range(-3, 12):
                m = F(mnum)
                if predict_direct(m, b, x) != predict_pointslope(m, b, x):
                    mism += 1
    # fractional slope
    for x in range(0, 12):
        if predict_direct(F(1, 2), 2, x) != predict_pointslope(F(1, 2), 2, x):
            mism += 1
    assert mism == 0, f"{mism} mismatches between direct and point-slope routes"
    print("  self-test: direct and point-slope prediction routes agree (m,b,x grid incl. ½ slope)")


def main():
    _selftest()
    fails = checked = 0

    # authored prediction facts: (m, b, x, expected y)
    facts = [
        (2, 3, 4, 11), (2, 3, 10, 23),
        (3, 1, 4, 13),
        (5, 0, 4, 20),
        (-2, 20, 4, 12),
        (4, 5, 4, 21),
        (F(1, 2), 2, 4, 4),
        (6, 5, 3, 23),   # pool example in bv-03-02 steppedReveal: 6*3+5
        (2, 10, 5, 20),  # phone plan sanity: 2*5+10
        (20, 50, 3, 110),  # savings sanity: 20*3+50
        (3, 4, 5, 19),   # taxi sanity: 3*5+4
    ]
    for m, b, x, e in facts:
        checked += 1
        a = predict_direct(F(m) if not isinstance(m, F) else m, b, x)
        c = predict_pointslope(F(m) if not isinstance(m, F) else m, b, x)
        if a != e or c != e:
            fails += 1
            print(f"  PRED FAIL y={m}x+{b} at x={x}: direct {a}, pointslope {c}, authored {e}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
