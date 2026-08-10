#!/usr/bin/env python3
"""Independent re-derivation of two-step-equations Chapter 2 (Two-Step Equations, px+q=r).

7.EE.4a. SELF-TESTED dual-route: x = (r-q)/p (solving via inverse operations) is
cross-checked by SUBSTITUTING the solution back into the original equation p*x+q and
confirming it equals r exactly (exact Fraction arithmetic) -- a genuinely different check
than re-deriving the same formula: it verifies the SOLUTION satisfies the equation,
independent of how that solution was obtained.
"""
import json, glob, re, sys
from fractions import Fraction as F


def solve_two_step(p, q, r):
    x = F(r - q, p)
    assert p * x + q == r, (p, q, r, x)   # substitution check: solution satisfies the ORIGINAL equation
    return x


def _selftest():
    for p, q, r in [(3, 4, 19), (-2, 5, -7), (4, -3, 13), (-5, -2, 8), (2, 7, -1), (-3, 1, 10)]:
        x = solve_two_step(F(p), F(q), F(r))
        assert p * x + q == r          # redundant explicit re-check, cheap and clear
    print("  self-test: two-step-equation toolkit OK (solve-then-substitute-back agrees for every case)")


def parse_equation(prompt):
    m = re.search(r"(-?\d+)x\s*([+\-])\s*(\d+)\s*=\s*(-?\d+)", prompt)
    if not m:
        return None
    p, sign, qval, r = int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4))
    q = qval if sign == "+" else -qval
    return solve_two_step(F(p), F(q), F(r))


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def _selftest_parsers():
    assert parse_equation("Solve: 3x + 4 = 19") == 5
    assert parse_equation("Solve: -2x + 5 = -7") == 6
    assert parse_equation("Solve: 4x - 3 = 13") == 4
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/two-step-equations/lessons/tse-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            want = parse_equation(w.get("prompt", ""))
            if want is None:
                continue
            checked += 1
            ok = (F(w["answer"]) == want and w["tolerance"] == 0
                  and len(w["commonErrors"]) >= 2
                  and all(F(e["value"]) != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
