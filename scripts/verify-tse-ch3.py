#!/usr/bin/env python3
"""Independent re-derivation of two-step-equations Chapter 3 (Equations with Parentheses, p(x+q)=r).

7.EE.4a. SELF-TESTED dual-route: x = r/p - q (distribute-then-solve) is cross-checked by
SUBSTITUTING the solution back into the ORIGINAL parenthesized equation p*(x+q) and
confirming it equals r exactly (exact Fraction arithmetic) -- verifying the solution
satisfies the un-distributed form directly, not just the algebra that produced it.
"""
import json, glob, re, sys
from fractions import Fraction as F


def solve_parens(p, q, r):
    x = F(r, p) - q
    assert p * (x + q) == r, (p, q, r, x)   # substitution into the ORIGINAL parenthesized form
    return x


def _selftest():
    for p, q, r in [(3, 2, 18), (-2, 5, -6), (4, -3, 8), (-5, 1, -20), (2, -4, 10), (-3, -2, 15)]:
        x = solve_parens(F(p), F(q), F(r))
        assert p * (x + q) == r
    print("  self-test: parenthesized-equation toolkit OK (distribute-then-solve vs substitute-into-original agree)")


def parse_equation(prompt):
    m = re.search(r"(-?\d+)\(x\s*([+\-])\s*(\d+)\)\s*=\s*(-?\d+)", prompt)
    if not m:
        return None
    p, sign, qval, r = int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4))
    q = qval if sign == "+" else -qval
    return solve_parens(F(p), F(q), F(r))


def _selftest_parsers():
    assert parse_equation("Solve: 3(x + 2) = 18") == 4
    assert parse_equation("Solve: -2(x + 5) = -6") == -2
    assert parse_equation("Solve: 4(x - 3) = 8") == 5
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/two-step-equations/lessons/tse-03-*.json")):
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
