#!/usr/bin/env python3
"""Independent re-derivation of geometry-g7 Chapter 3 (Angle Equations), 7.G.5.

SELF-TESTED dual-route:
  Route A (subtraction/algebra): partner = total - known; for kx-form equations, x = total/k
    after combining coefficients.
  Route B (counting-up / substitution check): partner found by counting up from the known
    angle to the total in unit steps; equation solutions verified by SUBSTITUTING back into
    the original equation and checking the total. Both routes must agree; cross-checked over
    a grid first.
"""
import sys


def partner_A(known, total):
    return total - known


def partner_B(known, total):
    steps = 0
    v = known
    while v < total:
        v += 1
        steps += 1
    return steps


def solve_kx(coeff_sum, const, total):
    """Solve coeff_sum*x + const = total."""
    rem = total - const
    if rem % coeff_sum:
        return None
    return rem // coeff_sum


def check_by_substitution(x, terms, const, total):
    """terms: list of coefficients; verify sum(c*x) + const == total."""
    return sum(c * x for c in terms) + const == total


def _selftest():
    mism = 0
    for total in (90, 180):
        for known in range(1, total):
            if partner_A(known, total) != partner_B(known, total):
                mism += 1
    for coeffs, const, total in [((1, 2), 0, 90), ((1, 3), 0, 180), ((1, 1), 20, 90), ((1, 2), 60, 180), ((1, 1), 0, 90)]:
        x = solve_kx(sum(coeffs), const, total)
        if x is None or not check_by_substitution(x, list(coeffs), const, total):
            mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: subtraction vs counting-up partners agree; kx solutions verify by substitution")


def main():
    _selftest()
    fails = checked = 0

    # complement/supplement partners: (known, total, expected)
    for known, total, e in [(35, 90, 55), (62, 90, 28), (30, 90, 60), (110, 180, 70)]:
        checked += 1
        if partner_A(known, total) != e or partner_B(known, total) != e:
            fails += 1
            print(f"  PARTNER FAIL {known}/{total}: {partner_A(known,total)} vs {e}")

    # three-angle corner: 90 - 25 - 40 = 25
    checked += 1
    if 90 - 25 - 40 != 25 or partner_B(65, 90) != 25:
        fails += 1

    # vertical/adjacent at a crossing: (angle, vertical, adjacent)
    for a, v, adj in [(75, 75, 105), (130, 130, 50), (40, 40, 140), (60, 60, 120)]:
        checked += 1
        if v != a or partner_A(a, 180) != adj or partner_B(a, 180) != adj:
            fails += 1
            print(f"  CROSSING FAIL {a}: adj {partner_A(a,180)} vs {adj}")
    # four angles at a crossing total 360
    checked += 1
    if 40 + 140 + 40 + 140 != 360:
        fails += 1

    # equation facts: (coeffs, const, total, expected x)
    eqs = [((1, 2), 0, 90, 30), ((1, 3), 0, 180, 45), ((1, 1), 20, 90, 35),
           ((1, 2), 60, 180, 40), ((1, 1), 0, 90, 45), ((1, 2), 0, 180, 60)]
    for coeffs, const, total, e in eqs:
        checked += 1
        x = solve_kx(sum(coeffs), const, total)
        if x != e or not check_by_substitution(x, list(coeffs), const, total):
            fails += 1
            print(f"  EQN FAIL {coeffs}x+{const}={total}: {x} vs {e}")

    # vertical-equality algebra: 3x with x=25 -> 75; 2x = 80 -> x = 40
    checked += 1
    if 3 * 25 != 75:
        fails += 1
    checked += 1
    if solve_kx(2, 0, 80) != 40 or 2 * 40 != 80:
        fails += 1

    # x+20 companion: x=35 -> other angle 55, sum 90
    checked += 1
    if 35 + 20 != 55 or 35 + 55 != 90:
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
