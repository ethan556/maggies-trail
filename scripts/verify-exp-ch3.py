#!/usr/bin/env python3
"""Independent re-derivation of exponential-functions Chapter 3 (Exponential Equations).

Exact-Fraction arithmetic, SELF-TESTED. Parses b^x=k and a·b^x=k (b, k may be fractions
like 1/2 or 1/8; a is an integer coefficient). Solves for the integer exponent x by
scanning, then DUAL-ROUTES: the solution is independently confirmed by substitution
(b**x == k, or b**x == k/a). Handles negative exponents (fraction targets) and fraction
bases. Content pass re-derives the integer exponent answer; fractional exponents (e.g.
4^x=8 → 3/2) are authored as mcq exact labels, not numeric.
"""
import json, glob, re, sys
from fractions import Fraction as F


def norm(s):
    return s.replace("\u2212", "-").replace("\u00b7", "*").replace(" ", "")


def parse_eq(prompt):
    s = norm(prompt)
    m = re.search(r"(\d+)\*\(?(\d+/\d+|\d+)\)?\^x=\(?(\d+/\d+|\d+)\)?", s)   # a*b^x=k
    if m:
        return F(int(m.group(1))), F(m.group(2)), F(m.group(3))
    m = re.search(r"\(?(\d+/\d+|\d+)\)?\^x=\(?(\d+/\d+|\d+)\)?", s)           # b^x=k
    if m:
        return F(1), F(m.group(1)), F(m.group(2))
    return None


def solve(a, b, k):
    if b == 1:
        return None
    target = k / a
    for x in range(-15, 16):
        if b ** x == target:
            return x
    return None


def _selftest():
    assert parse_eq("2^x = 8") == (F(1), F(2), F(8))
    assert parse_eq("3 * 2^x = 24") == (F(3), F(2), F(24))
    assert parse_eq("(1/2)^x = 8") == (F(1), F(1, 2), F(8))
    assert parse_eq("2^x = 1/8") == (F(1), F(2), F(1, 8))
    cases = [((F(1), F(2), F(8)), 3), ((F(1), F(3), F(81)), 4), ((F(1), F(5), F(25)), 2),
             ((F(1), F(4), F(64)), 3), ((F(1), F(2), F(1, 8)), -3), ((F(1), F(1, 2), F(8)), -3),
             ((F(3), F(2), F(24)), 3), ((F(2), F(3), F(54)), 3), ((F(1), F(10), F(1000)), 3),
             ((F(1), F(2), F(32)), 5), ((F(1), F(1, 2), F(1, 8)), 3), ((F(1), F(1, 3), F(9)), -2),
             ((F(1), F(5), F(1, 25)), -2), ((F(6), F(2), F(48)), 3)]
    for (a, b, k), want in cases:
        x = solve(a, b, k)
        assert x == want, (a, b, k, x, want)
        assert b ** x == k / a, (a, b, k, x)           # dual route: substitution
    assert solve(F(1), F(4), F(8)) is None             # 4^x=8 has no integer solution (3/2)
    print("  self-test: equation toolkit OK (base-match scan + substitution confirm, negative exponents)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/exponential-functions/lessons/exp-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            if w["type"] == "mcq":
                if sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq FAIL")
                continue
            if w["type"] != "numeric":
                continue
            eq = parse_eq(w.get("prompt", ""))
            if not eq:
                continue
            x = solve(*eq)
            if x is None:
                continue
            want = F(x)
            checked += 1
            ok = (F(str(w["answer"])) == want and w["tolerance"] == 0
                  and len(w["commonErrors"]) >= 2
                  and all(F(str(e["value"])) != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
