#!/usr/bin/env python3
"""Independent re-derivation of transformations-measurement Chapter 3 (Angle
Relationships), 8.G.5.

Checks the arithmetic facts two independent ways:
  Triangle angle sum: third = 180 - a - b (Route A), cross-checked by Route B that the
  three angles as a multiset sum to exactly 180 and each is positive (a valid triangle).
  Exterior angle: exterior = sum of remote interiors (Route A), cross-checked against
  180 - (third interior) (Route B) — the two must agree, which is the exterior-angle theorem.
  Transversal angles: corresponding/alternate = equal; straight-line/co-interior = 180 - x.
  AA similarity: two triangles are similar iff their angle multisets are equal; the third
  angle is computed independently for each and the full sets compared.
Self-test confirms the exterior-angle identity (remote-sum == 180 - third) over all valid
integer angle pairs before trusting the authored facts.
"""
import sys


def third_angle(a, b):
    return 180 - a - b


def exterior_from_remote(a, b):
    return a + b


def exterior_from_supplement(a, b):
    return 180 - third_angle(a, b)


def supplement(x):
    return 180 - x


def similar_by_angles(anglesA, anglesB):
    """Each list has two given angles; compute the third and compare full multisets."""
    a3 = third_angle(anglesA[0], anglesA[1])
    b3 = third_angle(anglesB[0], anglesB[1])
    setA = sorted(anglesA + [a3])
    setB = sorted(anglesB + [b3])
    return setA == setB


def _selftest():
    mismatches = 0
    for a in range(1, 179):
        for b in range(1, 180 - a):
            # valid triangle: third > 0
            t = third_angle(a, b)
            if t <= 0:
                continue
            if exterior_from_remote(a, b) != exterior_from_supplement(a, b):
                mismatches += 1
            if a + b + t != 180:
                mismatches += 1
    assert mismatches == 0, f"{mismatches} exterior-angle / sum mismatches"
    print("  self-test: exterior-angle theorem (remote-sum == 180 - third) holds for all valid integer triangles")


def main():
    _selftest()
    fails = checked = 0

    # triangle third-angle facts: (a, b, expected)
    tri = [(40, 60, 80), (90, 35, 55), (25, 115, 40), (50, 60, 70), (40, 75, 65)]
    for a, b, e in tri:
        checked += 1
        if third_angle(a, b) != e:
            fails += 1
            print(f"  TRI FAIL {a},{b}: got {third_angle(a,b)}, authored {e}")

    # equilateral / equal-angle
    checked += 1
    if 180 // 3 != 60:
        fails += 1

    # exterior-angle facts: (remote1, remote2, expected exterior)
    ext = [(50, 60, 110), (70, 60, 130)]
    for a, b, e in ext:
        checked += 1
        if exterior_from_remote(a, b) != e or exterior_from_supplement(a, b) != e:
            fails += 1
            print(f"  EXT FAIL {a},{b}: remote={exterior_from_remote(a,b)} suppl={exterior_from_supplement(a,b)} authored {e}")

    # transversal / supplement facts: (angle, kind, expected)
    trans = [
        (70, "corresponding", 70), (70, "straight-line", 110), (65, "alt-interior", 65),
        (120, "corr-then-supplement", 60), (80, "corresponding", 80),
    ]
    for x, kind, e in trans:
        checked += 1
        if kind in ("corresponding", "alt-interior"):
            got = x
        elif kind == "straight-line":
            got = supplement(x)
        elif kind == "corr-then-supplement":
            got = supplement(x)  # corresponding equals x, then its supplement
        if got != e:
            fails += 1
            print(f"  TRANS FAIL {x} {kind}: got {got}, authored {e}")

    # AA similarity facts: (anglesA, anglesB, expected_similar)
    aa = [
        ([50, 60], [50, 60], True), ([40, 75], [40, 75], True), ([90, 30], [90, 30], True),
        ([80, 40], [80, 60], True), ([50, 60], [50, 80], False),
    ]
    for A, B, exp in aa:
        checked += 1
        if similar_by_angles(A, B) != exp:
            fails += 1
            print(f"  AA FAIL {A} vs {B}: got {similar_by_angles(A,B)}, authored {exp}")

    # AA-with-length: scale factor 6/3=2, side 4 -> 8
    checked += 1
    if 4 * (6 // 3) != 8:
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
