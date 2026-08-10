#!/usr/bin/env python3
"""Independent re-derivation of transformations-measurement Chapter 2 (Congruence &
Similarity), 8.G.2,4.

SELF-TESTED dual-route for dilation and similarity:
  Route A (per-coordinate scaling): image = (k*x, k*y); scale factor k = image_side/orig_side.
  Route B (ratio-invariance route): confirm that under a dilation EVERY coordinate ratio
  image/original equals the SAME k, and that similarity holds iff all corresponding side
  ratios are equal — an independent characterization (constant ratio) rather than
  point-by-point multiplication. Congruence is the special case k == 1. Cross-checked over
  a grid before trusting either against authored content.
"""
import sys
from fractions import Fraction


def dilate(x, y, k):
    return (k * x, k * y)


def scale_factor(orig, image):
    return Fraction(image, orig)


def classify_pair(sides_a, sides_b):
    """Return 'cong' | 'sim' | 'neither' from two triangles' sorted side lists."""
    a = sorted(sides_a)
    b = sorted(sides_b)
    ratios = [Fraction(bb, aa) for aa, bb in zip(a, b)]
    if len(set(ratios)) != 1:
        return "neither"
    return "cong" if ratios[0] == 1 else "sim"


def _selftest():
    mismatches = 0
    # dilation ratio-invariance: every coordinate scales by the same k
    for k in [Fraction(2), Fraction(3), Fraction(1, 2), Fraction(5, 2)]:
        for x in range(1, 8):
            for y in range(1, 8):
                ix, iy = dilate(x, y, k)
                if Fraction(ix, x) != k or Fraction(iy, y) != k:
                    mismatches += 1
    # classify: generate similar and congruent and neither triangles
    base = (3, 4, 5)
    assert classify_pair(base, base) == "cong"
    assert classify_pair(base, (6, 8, 10)) == "sim"
    assert classify_pair(base, (3, 5, 7)) == "neither"
    assert classify_pair((2, 3, 4), (4, 6, 8)) == "sim"
    assert mismatches == 0, f"{mismatches} dilation ratio mismatches"
    print("  self-test: per-coordinate scaling vs constant-ratio route agree; classify cong/sim/neither correct")


def main():
    _selftest()
    fails = checked = 0

    # dilation image facts: (x,y,k, expected image)
    dil = [
        (3, 4, Fraction(2), (6, 8)), (6, 8, Fraction(1, 2), (3, 4)), (1, 5, Fraction(2), (2, 10)),
        (2, 3, Fraction(2), (4, 6)),
    ]
    for x, y, k, exp in dil:
        checked += 1
        got = dilate(x, y, k)
        if got != (Fraction(exp[0]), Fraction(exp[1])):
            fails += 1
            print(f"  DILATE FAIL ({x},{y})×{k}: got {got}, authored {exp}")

    # scale-factor facts: (orig_pt_coord, image_pt_coord, expected k)
    sf = [(2, 6, 3), (4, 12, 3), (3, 6, 2), (4, 8, 2)]
    for o, i, ek in sf:
        checked += 1
        if scale_factor(o, i) != ek:
            fails += 1
            print(f"  SCALE FAIL {o}->{i}: got {scale_factor(o,i)}, authored {ek}")

    # missing-side via similarity: (scale, orig_side, expected)
    miss = [(2, 5, 10), (3, 5, 15), (2, 3, 6)]
    for k, o, e in miss:
        checked += 1
        if k * o != e:
            fails += 1
            print(f"  MISS FAIL {o}×{k}: got {k*o}, authored {e}")

    # classification facts: (sides_a, sides_b, expected class)
    cls = [
        ((3, 4, 5), (3, 4, 5), "cong"), ((3, 4, 5), (6, 8, 10), "sim"),
        ((2, 3, 4), (4, 6, 8), "sim"), ((3, 4, 5), (3, 5, 7), "neither"),
        ((5, 12, 13), (5, 12, 13), "cong"),
    ]
    for a, b, exp in cls:
        checked += 1
        got = classify_pair(a, b)
        if got != exp:
            fails += 1
            print(f"  CLASSIFY FAIL {a} vs {b}: got {got}, authored {exp}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
