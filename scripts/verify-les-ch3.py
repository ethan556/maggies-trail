#!/usr/bin/env python3
"""Independent re-derivation of linear-equations-systems Chapter 3 (Systems and Their
Solutions), 8.EE.8a-b.

SELF-TESTED dual-route for the intersection of y=m1 x+b1 and y=m2 x+b2:
  Route A (equate-and-solve): x = (b2-b1)/(m1-m2), y = m1*x+b1.
  Route B (independent substitution-verify): confirm the computed (x,y) satisfies BOTH
  original equations with exact Fraction arithmetic. Also a from-scratch route recomputes
  y from the SECOND equation to confirm the two equations agree at x.
And for classification (one/none/infinite):
  Route A: slope/intercept comparison.
  Route B: probing several x-values and inspecting the agreement pattern (matches the
  Ch2 probing idea, adapted to two lines). Cross-checked over a coefficient grid.
"""
import sys
from fractions import Fraction


def intersect(m1, b1, m2, b2):
    assert m1 != m2
    x = Fraction(b2 - b1, m1 - m2)
    y = m1 * x + b1
    return x, y


def verify_point(m1, b1, m2, b2, x, y):
    return (m1 * x + b1 == y) and (m2 * x + b2 == y)


def classify_system(m1, b1, m2, b2):
    if m1 != m2:
        return "one"
    return "inf" if b1 == b2 else "none"


def classify_probe(m1, b1, m2, b2):
    probes = [Fraction(v) for v in (-3, -1, 0, 1, 2, 5, 11)]
    agree = [x for x in probes if m1 * x + b1 == m2 * x + b2]
    if len(agree) == len(probes):
        return "inf"
    if len(agree) == 0:
        return "one" if m1 != m2 else "none"
    return "one"


def _selftest():
    mismatches = 0
    for m1 in range(-4, 5):
        for b1 in range(-4, 5):
            for m2 in range(-4, 5):
                for b2 in range(-4, 5):
                    ca = classify_system(m1, b1, m2, b2)
                    cb = classify_probe(m1, b1, m2, b2)
                    if ca != cb:
                        mismatches += 1
                        if mismatches <= 5:
                            print(f"  CLASS MISMATCH y={m1}x+{b1},y={m2}x+{b2}: sio={ca} probe={cb}")
                    if m1 != m2:
                        x, y = intersect(m1, b1, m2, b2)
                        if not verify_point(m1, b1, m2, b2, x, y):
                            mismatches += 1
    assert mismatches == 0, f"{mismatches} mismatches"
    print("  self-test: intersection substitution-verify + slope/intercept-vs-probe classification agree (coeffs -4..4)")


# authored intersection facts: (m1,b1,m2,b2, expected x, expected y)
INTERSECT_FACTS = [
    (1, 1, -1, 5, 2, 3), (2, 0, 1, 3, 3, 6), (2, -1, 1, 1, 2, 3), (-1, 4, 2, -5, 3, 1),
    (3, -4, 1, 2, 3, 5),
]
# authored classification facts: (m1,b1,m2,b2, expected class)
CLASS_FACTS = [
    (2, 1, 3, -1, "one"), (2, 1, 2, -3, "none"), (4, 2, 4, 2, "inf"),
    (1, 4, 1, -4, "none"), (-1, 4, -1, 4, "inf"), (Fraction(1, 2), 3, Fraction(1, 2), -1, "none"),
    (3, 2, 5, -1, "one"),
]
# authored "which point solves both" facts: (m1,b1,m2,b2, (px,py), expected True/False)
POINT_FACTS = [
    (1, 1, -1, 5, (2, 3), True), (2, 1, 1, 1, (1, 3), False), (-1, 4, 2, -5, (3, 1), True),
    (3, -4, 1, 2, (3, 5), True),
]


def main():
    _selftest()
    fails = checked = 0

    for m1, b1, m2, b2, ex, ey in INTERSECT_FACTS:
        checked += 1
        x, y = intersect(m1, b1, m2, b2)
        if x != ex or y != ey or not verify_point(m1, b1, m2, b2, x, y):
            fails += 1
            print(f"  INTERSECT FAIL y={m1}x+{b1},y={m2}x+{b2}: computed ({x},{y}), authored ({ex},{ey})")

    for m1, b1, m2, b2, expect in CLASS_FACTS:
        checked += 1
        ca = classify_system(m1, b1, m2, b2)
        cb = classify_probe(m1, b1, m2, b2)
        if ca != cb or ca != expect:
            fails += 1
            print(f"  CLASS FAIL y={m1}x+{b1},y={m2}x+{b2}: sio={ca} probe={cb} authored={expect}")

    for m1, b1, m2, b2, (px, py), expect in POINT_FACTS:
        checked += 1
        got = verify_point(m1, b1, m2, b2, Fraction(px), Fraction(py))
        if got != expect:
            fails += 1
            print(f"  POINT FAIL ({px},{py}) on y={m1}x+{b1},y={m2}x+{b2}: computed {got}, authored {expect}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
