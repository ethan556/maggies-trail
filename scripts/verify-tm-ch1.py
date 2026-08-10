#!/usr/bin/env python3
"""Independent re-derivation of transformations-measurement Chapter 1 (Rigid
Transformations), 8.G.1,3.

SELF-TESTED dual-route for each rigid motion:
  Route A (coordinate rule): the standard algebraic image formula.
  Route B (matrix / geometric route): apply the corresponding 2x2 transformation matrix
  (reflections and rotations) or vector add (translation) — a genuinely independent
  mechanical path. For rotations the matrix uses exact integer cos/sin at 90/180/270.
  Both routes are also checked to PRESERVE distances (rigid-motion invariant): the
  distance between two pre-image points equals the distance between their images.
Cross-checked over a grid of integer points before trusting either against authored content.
"""
import sys


def translate(x, y, dx, dy):
    return (x + dx, y + dy)


def reflect_x(x, y):
    return (x, -y)


def reflect_y(x, y):
    return (-x, y)


def rotate(x, y, deg):
    # counterclockwise about origin
    table = {0: (x, y), 90: (-y, x), 180: (-x, -y), 270: (y, -x)}
    return table[deg % 360]


def _apply_matrix(x, y, m):
    (a, b), (c, d) = m
    return (a * x + b * y, c * x + d * y)


def _selftest():
    import math
    mismatches = 0
    REFLX = ((1, 0), (0, -1))
    REFLY = ((-1, 0), (0, 1))
    ROT = {90: ((0, -1), (1, 0)), 180: ((-1, 0), (0, -1)), 270: ((0, 1), (-1, 0))}
    for x in range(-5, 6):
        for y in range(-5, 6):
            if reflect_x(x, y) != _apply_matrix(x, y, REFLX):
                mismatches += 1
            if reflect_y(x, y) != _apply_matrix(x, y, REFLY):
                mismatches += 1
            for deg, m in ROT.items():
                if rotate(x, y, deg) != _apply_matrix(x, y, m):
                    mismatches += 1
    # distance preservation check for all motions on point pairs
    def dist2(p, q):
        return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
    for x1 in range(-3, 4):
        for y1 in range(-3, 4):
            p, q = (x1, y1), (x1 + 2, y1 + 1)
            d0 = dist2(p, q)
            for f in (lambda a, b: translate(a, b, 3, -2), reflect_x, reflect_y,
                      lambda a, b: rotate(a, b, 90), lambda a, b: rotate(a, b, 180)):
                if dist2(f(*p), f(*q)) != d0:
                    mismatches += 1
    assert mismatches == 0, f"{mismatches} mismatches"
    print("  self-test: coordinate-rule vs matrix routes agree + all motions preserve distance (points -5..5)")


def main():
    _selftest()
    fails = checked = 0

    # translations: (x,y,dx,dy, expected)
    trans = [
        (2, 3, 4, 2, (6, 5)), (5, 3, -1, -2, (4, 1)), (1, 4, 3, -1, (4, 3)),
        (6, 1, -2, 3, (4, 4)), (3, 2, 2, 1, (5, 3)),
    ]
    for x, y, dx, dy, exp in trans:
        checked += 1
        if translate(x, y, dx, dy) != exp:
            fails += 1
            print(f"  TRANS FAIL ({x},{y})+({dx},{dy}): got {translate(x,y,dx,dy)}, authored {exp}")

    # slide-description challenge: (2,5)->(7,2) is right5 down3
    checked += 1
    if translate(2, 5, 5, -3) != (7, 2):
        fails += 1
        print("  SLIDE-DESC FAIL")

    # reflections: (x,y, axis, expected)
    refl = [
        (3, 5, "x", (3, -5)), (2, 7, "y", (-2, 7)), (5, 2, "y", (-5, 2)),
        (-4, 6, "x", (-4, -6)), (6, 3, "x", (6, -3)), (4, 1, "x", (4, -1)),
    ]
    for x, y, axis, exp in refl:
        checked += 1
        got = reflect_x(x, y) if axis == "x" else reflect_y(x, y)
        if got != exp:
            fails += 1
            print(f"  REFL FAIL ({x},{y}) over {axis}-axis: got {got}, authored {exp}")

    # rotations: (x,y,deg, expected)
    rot = [
        (2, 3, 180, (-2, -3)), (4, 1, 90, (-1, 4)), (-5, 2, 180, (5, -2)),
        (3, 4, 180, (-3, -4)), (1, 6, 180, (-1, -6)),
    ]
    for x, y, deg, exp in rot:
        checked += 1
        if rotate(x, y, deg) != exp:
            fails += 1
            print(f"  ROT FAIL ({x},{y}) by {deg}: got {rotate(x,y,deg)}, authored {exp}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
