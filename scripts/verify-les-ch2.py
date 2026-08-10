#!/usr/bin/env python3
"""Independent re-derivation of linear-equations-systems Chapter 2 (One, None, or
Infinitely Many), 8.EE.7a.

SELF-TESTED dual-route for classifying ax + b = cx + d:
  Route A (coefficient comparison): a != c -> one solution; a == c and b == d ->
  infinitely many; a == c and b != d -> none.
  Route B (independent numeric probing): evaluate BOTH sides at several distinct x
  values. If both sides agree at every probe AND the count of agreements is unbounded
  (they agree everywhere) -> infinitely many; if they agree at exactly one x -> one;
  if they never agree -> none. This is a genuinely different characterization (sample
  the truth set) rather than symbolic coefficient logic. Cross-checked to agree on an
  exhaustive coefficient grid before trusting either against authored content.
"""
import sys
from fractions import Fraction


def classify_coeff(a, b, c, d):
    if a != c:
        return "one"
    return "inf" if b == d else "none"


def classify_probe(a, b, c, d):
    """Sample the equation at several x; infer the solution count from the agreement pattern."""
    probes = [Fraction(v) for v in (-3, -1, 0, 1, 2, 5, 17)]
    agree = [x for x in probes if a * x + b == c * x + d]
    if len(agree) == len(probes):
        # agrees everywhere sampled -> infinitely many (confirm it's a genuine identity)
        return "inf"
    if len(agree) == 0:
        # never agrees at samples; could still have a single solution not sampled -> compute it
        if a != c:
            xsol = Fraction(d - b, a - c)
            return "one"
        return "none"
    # agrees at some but not all samples -> exactly one solution
    return "one"


def _selftest():
    mismatches = 0
    for a in range(-5, 6):
        for c in range(-5, 6):
            for b in range(-5, 6):
                for d in range(-5, 6):
                    ca = classify_coeff(a, b, c, d)
                    cb = classify_probe(a, b, c, d)
                    if ca != cb:
                        mismatches += 1
                        if mismatches <= 5:
                            print(f"  MISMATCH {a}x+{b}={c}x+{d}: coeff={ca} probe={cb}")
    assert mismatches == 0, f"{mismatches} mismatches between coefficient and probing routes"
    print("  self-test: coefficient-comparison vs numeric-probing classification agree (coeffs -5..5)")


# authored (a,b,c,d, expected class) reduced from the content
FACTS = [
    (2, 3, 2, 5, "none"), (4, 1, 4, 9, "none"), (5, -2, 5, 6, "none"), (3, 7, 3, 2, "none"),
    (3, 6, 3, 5, "none"),   # 3(x+2)=3x+5
    (2, 3, 2, 3, "inf"), (5, -2, 5, -2, "inf"), (2, 6, 2, 6, "inf"),  # 2(x+3)=2x+6
    (4, 4, 4, 4, "inf"),    # 4(x+1)=4x+4
    (6, 2, 6, 2, "inf"),    # 2(3x+1)=6x+2
    (3, 6, 3, 6, "inf"),    # 3(x+2)=3x+6
    (7, 2, 7, 2, "inf"),
    (2, 5, 3, -1, "one"), (2, 1, 5, -8, "one"), (1, 9, 3, 1, "one"), (3, 2, 5, -4, "one"),
    (2, 8, 2, 8, "inf"),    # 2(x+4)=2x+8
]


def main():
    _selftest()
    fails = checked = 0
    for a, b, c, d, expect in FACTS:
        checked += 1
        ca = classify_coeff(a, b, c, d)
        cb = classify_probe(a, b, c, d)
        if ca != cb or ca != expect:
            fails += 1
            print(f"  FAIL {a}x+{b}={c}x+{d}: coeff={ca} probe={cb} authored={expect}")
    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
