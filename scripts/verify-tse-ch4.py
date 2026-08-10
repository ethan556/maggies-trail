#!/usr/bin/env python3
"""Independent re-derivation of two-step-equations Chapter 4 (Two-Step Inequalities, px+q>r).

7.EE.4b, including the sign-flip rule (multiplying/dividing by a negative flips the
inequality direction). SELF-TESTED dual-route: Route A solves symbolically using the
sign-flip rule. Route B never invokes that rule at all -- it substitutes test points
directly into the ORIGINAL (undistributed) inequality on each side of the boundary and
checks which side actually satisfies it. If both routes agree on the solution direction
for every case, the sign-flip rule is verified independently of itself.
"""
import json, glob, re, sys
from fractions import Fraction as F


def solve_inequality_symbolic(p, q, comparator, r):
    """Route A: symbolic solve with the sign-flip rule."""
    boundary = F(r - q, p)
    flips = p < 0
    flip_map = {">": "<", "<": ">", ">=": "<=", "<=": ">="}
    direction = flip_map[comparator] if flips else comparator
    return boundary, direction


def solve_inequality_by_testing(p, q, comparator, r):
    """Route B: never uses the flip rule -- tests points directly against the ORIGINAL inequality."""
    boundary = F(r - q, p)
    test_below = boundary - 1
    test_above = boundary + 1

    def satisfies(x, comp, rhs):
        lhs = p * x + q
        if comp == ">": return lhs > rhs
        if comp == "<": return lhs < rhs
        if comp == ">=": return lhs >= rhs
        return lhs <= rhs

    below_ok = satisfies(test_below, comparator, r)
    above_ok = satisfies(test_above, comparator, r)
    assert below_ok != above_ok, (p, q, comparator, r)   # exactly one side should satisfy a strict inequality
    return boundary, ("<" if below_ok else ">") if comparator in ("<", ">") else ("<=" if below_ok else ">=")


def _selftest():
    for p, q, comp, r in [(3, 2, ">", 14), (-2, 5, ">", -3), (4, -1, "<", 15),
                          (-3, 2, "<", -7), (2, 4, ">=", 10), (-5, 1, "<=", -9)]:
        a = solve_inequality_symbolic(p, q, comp, r)
        b = solve_inequality_by_testing(p, q, comp, r)
        assert a == b, (p, q, comp, r, a, b)   # symbolic sign-flip rule vs direct point-testing agree
    print("  self-test: inequality toolkit OK (sign-flip rule vs direct point-testing agree, incl. sign flips)")


def parse_inequality(prompt):
    m = re.search(r"(-?\d+)x\s*([+\-])\s*(\d+)\s*(>=|<=|>|<)\s*(-?\d+)", prompt)
    if not m:
        return None
    p, sign, qval, comp, r = int(m.group(1)), m.group(2), int(m.group(3)), m.group(4), int(m.group(5))
    q = qval if sign == "+" else -qval
    return solve_inequality_symbolic(F(p), F(q), comp, F(r))


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def _selftest_parsers():
    assert parse_inequality("Solve: 3x + 2 > 14") == (4, ">")
    assert parse_inequality("Solve: -2x + 5 > -3") == (4, "<")
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/two-step-equations/lessons/tse-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "mcq":
                continue
            want = parse_inequality(w.get("prompt", ""))
            if want is None:
                continue
            boundary, direction = want
            want_label = f"x {direction} {frac_label(boundary)}"
            corr = [o for o in w["options"] if o.get("correct")]
            if len(corr) != 1:
                fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
            checked += 1
            if corr[0]["label"].strip() != want_label:
                fails += 1
                print(f"  {lid}/{sid} mcq FAIL want {want_label!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
