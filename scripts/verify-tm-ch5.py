#!/usr/bin/env python3
"""Independent re-derivation of transformations-measurement Chapter 5 (Volume of Round
Solids), 8.G.9. Volumes are authored as exact coefficients of pi.

SELF-TESTED dual-route:
  Route A (formula, exact rational coefficient of pi): cylinder = r²h; cone = r²h/3;
  sphere = 4r³/3, all as Fractions so results stay exact.
  Route B (independent geometric relations): the cone coefficient must equal the cylinder
  coefficient divided by 3 (same r,h); the sphere is recomputed as (4/3)*r*r*r built up by
  repeated multiplication rather than exponentiation. The rounding facts are checked by
  multiplying the coefficient by 3.14 and rounding, computed independently. Cross-checked
  over a grid of (r,h) before trusting the authored facts.
"""
import sys
from fractions import Fraction


def cyl_coeff(r, h):
    return Fraction(r) * r * h  # coefficient of pi


def cone_coeff(r, h):
    return Fraction(r * r * h, 3)


def sphere_coeff(r):
    return Fraction(4 * r ** 3, 3)


def cone_from_cyl(r, h):
    """Independent route: cone is cylinder / 3."""
    return cyl_coeff(r, h) / 3


def sphere_buildup(r):
    """Independent route: (4/3) * r * r * r by repeated multiply."""
    v = Fraction(4, 3)
    for _ in range(3):
        v *= r
    return v


def _selftest():
    mismatches = 0
    for r in range(1, 12):
        for h in range(1, 12):
            if cone_coeff(r, h) != cone_from_cyl(r, h):
                mismatches += 1
        if sphere_coeff(r) != sphere_buildup(r):
            mismatches += 1
    assert mismatches == 0, f"{mismatches} mismatches between formula and relational routes"
    print("  self-test: cone == cylinder/3 and sphere formula == build-up route agree (r,h in 1..11)")


def main():
    _selftest()
    fails = checked = 0

    # cylinder facts: (r, h, expected coefficient of pi)
    cyls = [(3, 4, 36), (5, 2, 50), (2, 10, 40), (4, 3, 48), (3, 2, 18)]
    for r, h, e in cyls:
        checked += 1
        if cyl_coeff(r, h) != e:
            fails += 1
            print(f"  CYL FAIL r={r},h={h}: got {cyl_coeff(r,h)}, authored {e}")

    # cone facts: (r, h, expected coefficient)
    cones = [(3, 4, 12), (6, 5, 60), (2, 9, 12), (3, 6, 18)]
    for r, h, e in cones:
        checked += 1
        if cone_coeff(r, h) != e or cone_from_cyl(r, h) != e:
            fails += 1
            print(f"  CONE FAIL r={r},h={h}: got {cone_coeff(r,h)}, authored {e}")

    # cone-from-cylinder: cylinder 90 -> cone 30
    checked += 1
    if Fraction(90, 3) != 30:
        fails += 1

    # sphere facts: (r, expected coefficient)
    sphs = [(3, 36), (6, 288)]
    for r, e in sphs:
        checked += 1
        if sphere_coeff(r) != e or sphere_buildup(r) != e:
            fails += 1
            print(f"  SPHERE FAIL r={r}: got {sphere_coeff(r)}, authored {e}")

    # sphere radius 1 -> 4/3
    checked += 1
    if sphere_coeff(1) != Fraction(4, 3):
        fails += 1
        print(f"  SPHERE r=1 FAIL: got {sphere_coeff(1)}")

    # rounding facts: coefficient 36 with pi=3.14 -> 113
    checked += 1
    if round(36 * 3.14) != 113:
        fails += 1
        print(f"  ROUND FAIL: got {round(36*3.14)}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
