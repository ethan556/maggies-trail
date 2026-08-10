#!/usr/bin/env python3
"""Independent re-derivation of quadratics Chapter 3 (Square Roots & the Quadratic Formula).

Exact arithmetic, SELF-TESTED. Parses ax^2+bx+c=0 (and x^2=k, (x-h)^2=k). Computes the
discriminant D=b^2-4ac exactly; when D is a perfect square, roots=(-b±√D)/(2a) as exact
Fractions. DUAL-ROUTE: each root is verified BOTH by substitution (a r^2+b r+c == 0) AND
by re-expanding a(x-r1)(x-r2) to the original quadratic. Real-root count from sign(D).
Content pass re-derives discriminant / number-of-real-roots / integer larger|smaller root;
fractional roots are authored as mcq exact labels (not numeric), so the verifier only
number-checks integer roots.
"""
import json, glob, re, sys
from fractions import Fraction as F
from math import isqrt


def norm(s):
    return s.replace("\u2212", "-").replace(" ", "")


def perfect_sqrt(n):
    if n < 0:
        return None
    r = isqrt(n)
    return r if r * r == n else None


def standard_form(s):
    s = norm(s)
    m = re.search(r"(-?\d*)x\^2([+-]\d+)x([+-]\d+)=0", s)
    if m:
        a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
        return (a, int(m.group(2)), int(m.group(3)))
    m = re.search(r"(-?\d*)x\^2([+-]\d+)=0", s)   # ax^2 + c = 0  (b=0)
    if m and "x^2" in s:
        a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
        return (a, 0, int(m.group(2)))
    return None


def disc(a, b, c):
    return b * b - 4 * a * c


def roots_std(a, b, c):
    D = disc(a, b, c)
    r = perfect_sqrt(D)
    if r is None:
        return None
    return sorted({F(-b + r, 2 * a), F(-b - r, 2 * a)})


def roots_of(prompt):
    s = norm(prompt)
    sf = standard_form(prompt)
    if sf:
        return roots_std(*sf)
    m = re.search(r"x\^2=(\d+)", s)          # x^2 = k
    if m:
        r = perfect_sqrt(int(m.group(1)))
        return None if r is None else sorted({F(r), F(-r)})
    m = re.search(r"\(x([+-]\d+)\)\^2=(\d+)", s)   # (x - h)^2 = k
    if m:
        h = -int(m.group(1)); r = perfect_sqrt(int(m.group(2)))
        return None if r is None else sorted({F(h + r), F(h - r)})
    return None


def num_real(a, b, c):
    D = disc(a, b, c)
    return 2 if D > 0 else (1 if D == 0 else 0)


def _selftest():
    # square roots
    assert roots_of("x^2 = 9") == [F(-3), F(3)]
    assert roots_of("x^2 - 49 = 0") == [F(-7), F(7)]
    assert roots_of("(x - 3)^2 = 16") == [F(-1), F(7)]
    assert roots_of("(x + 2)^2 = 9") == [F(-5), F(1)]
    # formula (perfect-square D) + dual-route
    from fractions import Fraction
    def poly(a, b, c):
        return {2: a, 1: b, 0: c}
    def expand(a, r1, r2):
        # a(x-r1)(x-r2) = a x^2 - a(r1+r2) x + a r1 r2
        return {2: a, 1: -a * (r1 + r2), 0: a * r1 * r2}
    cases = [(1, -5, 6, [F(2), F(3)]), (1, 2, -8, [F(-4), F(2)]),
             (1, -2, -3, [F(-1), F(3)]), (2, -7, 3, [F(1, 2), F(3)]),
             (1, -6, 9, [F(3)]), (1, 5, 4, [F(-4), F(-1)])]
    for a, b, c, exp in cases:
        r = roots_std(a, b, c)
        assert r == exp, (a, b, c, r, exp)
        for x in r:
            assert a * x * x + b * x + c == 0, (a, b, c, x)          # route 1: substitution
        rr = r if len(r) == 2 else r * 2
        assert expand(a, rr[0], rr[1]) == {k: v for k, v in poly(a, b, c).items() if v != 0}, (a, b, c)  # route 2
    # discriminant sign -> count
    assert num_real(1, -5, 6) == 2 and disc(1, -5, 6) == 1
    assert num_real(1, -6, 9) == 1 and disc(1, -6, 9) == 0
    assert num_real(1, 1, 1) == 0 and disc(1, 1, 1) == -3
    assert num_real(1, -4, -5) == 2 and disc(1, -4, -5) == 36
    assert num_real(1, -3, 5) == 0 and disc(1, -3, 5) == -11
    print("  self-test: formula toolkit OK (exact discriminant, dual-route substitution + re-expand)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/quadratics/lessons/qu-03-*.json")):
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
            prompt = w.get("prompt", ""); low = prompt.lower()
            sf = standard_form(prompt)
            roots = roots_of(prompt)
            want = None
            if "discriminant" in low and sf:
                want = F(disc(*sf))
            elif ("how many real" in low or "number of real" in low or "how many solutions" in low) and sf:
                want = F(num_real(*sf))
            elif roots is not None and ("larger" in low or "greater" in low):
                want = max(roots)
            elif roots is not None and ("smaller" in low or "lesser" in low):
                want = min(roots)
            if want is not None and want.denominator == 1:
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
