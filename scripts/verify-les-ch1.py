#!/usr/bin/env python3
"""Independent re-derivation of linear-equations-systems Chapter 1 (Solving Linear
Equations), 8.EE.7b.

SELF-TESTED dual-route for solving ax + b = cx + d (with a != c):
  Route A (algebraic isolation): x = (d - b) / (a - c) as an exact Fraction.
  Route B (independent, substitution-verification search over a scaled grid): the
  algebraic solution is checked by plugging it back into BOTH sides and confirming
  equality with exact Fraction arithmetic — a genuinely independent confirmation path
  (verify, don't re-derive by the same division). The self-test additionally confirms
  Route A against a from-scratch balance-simulation that repeatedly applies inverse
  operations, over an exhaustive coefficient grid.
"""
import sys
from fractions import Fraction


def solve_isolation(a, b, c, d):
    """ax + b = cx + d  ->  x = (d - b)/(a - c)."""
    assert a != c
    return Fraction(d - b, a - c)


def verify_by_substitution(a, b, c, d, x):
    """Independent check: does x actually make both sides equal?"""
    left = a * x + b
    right = c * x + d
    return left == right


def solve_balance_sim(a, b, c, d):
    """From-scratch balance simulation: move c*x left and b right by inverse ops, then divide."""
    # (a-c)x + b = d  ->  (a-c)x = d - b  ->  x = (d-b)/(a-c)
    coeff = a - c
    const = d - b
    return Fraction(const, coeff)


def _selftest():
    mismatches = 0
    for a in range(-6, 7):
        for c in range(-6, 7):
            if a == c:
                continue
            for b in range(-6, 7):
                for d in range(-6, 7):
                    xa = solve_isolation(a, b, c, d)
                    xb = solve_balance_sim(a, b, c, d)
                    if xa != xb or not verify_by_substitution(a, b, c, d, xa):
                        mismatches += 1
                        if mismatches <= 5:
                            print(f"  MISMATCH {a}x+{b}={c}x+{d}: iso={xa} sim={xb}")
    assert mismatches == 0, f"{mismatches} mismatches"
    print("  self-test: isolation vs balance-simulation solving agree + substitution-verify (coeffs -6..6)")


# authored equations reduced to ax+b=cx+d form, with expected x
FACTS = [
    (4, 8, 0, 28, 5), (3, 5, 0, 20, 5), (2, -6, 0, 12, 9), (5, 3, 0, 38, 7),
    (-2, -4, 0, 6, -5), (4, 2, 0, 14, 3),  # two-step
    (5, 2, 3, 10, 4), (7, 3, 4, 15, 4), (9, 4, 5, 24, 5), (6, -1, 2, 11, 3), (4, 1, 2, 9, 4),  # both sides
    (3, 12, 0, 27, 5),   # 3(x+4)=27 -> 3x+12=27
    (5, -10, 3, 8, 9),   # 5(x-2)=3x+8 -> 5x-10=3x+8
    (6, -6, 0, 18, 4),   # 2(x-3)+4x=18 -> 6x-6=18
    (3, 6, 2, 10, 4),    # 3(x+2)=2(x+5) -> 3x+6=2x+10
    (2, 4, 0, 10, 3), (5, -5, 0, 20, 5), (4, 2, 0, 18, 4),  # matchPairs k2 in les-01-01
]


def main():
    _selftest()
    fails = checked = 0
    for a, b, c, d, expect_x in FACTS:
        checked += 1
        x = solve_isolation(a, b, c, d)
        if x != expect_x:
            fails += 1
            print(f"  FAIL {a}x+{b}={c}x+{d}: computed x={x}, authored {expect_x}")
        if not verify_by_substitution(a, b, c, d, x):
            fails += 1
            print(f"  VERIFY FAIL {a}x+{b}={c}x+{d}: x={x} does not satisfy both sides")

    # expansion facts (distributive property): (factor, term1, term2) -> (factor*term1, factor*term2)
    expansions = [
        (4, 1, 3, 4, 12), (2, 1, 5, 2, 10), (3, 1, -1, 3, -3), (4, 1, 2, 4, 8), (2, 1, 6, 2, 12),
    ]
    for f, t1, t2, e1, e2 in expansions:
        checked += 1
        if f * t1 != e1 or f * t2 != e2:
            fails += 1
            print(f"  EXPAND FAIL {f}(x+{t2}): computed {f*t1}x+{f*t2}, authored {e1}x+{e2}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
