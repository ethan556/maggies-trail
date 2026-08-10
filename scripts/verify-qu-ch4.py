#!/usr/bin/env python3
"""Independent re-derivation of quadratics Chapter 4 (Applications).

Reuses the exact quadratic machinery, SELF-TESTED. Word problems are authored in x with
the resulting quadratic stated inline (ax^2+bx+c=0, incl. c=0 or b=0 forms), so the
verifier re-derives the roots and cross-checks each by substitution. Also computes the
vertex (axis=-b/2a, max/min value) for optimization prompts. Content pass re-derives the
valid (positive) root / larger|smaller root / maximum value / time-of-maximum.
"""
import json, glob, re, sys
from fractions import Fraction as F
from math import isqrt


def norm(s):
    return s.replace("\u2212", "-").replace(" ", "")


def perfect_sqrt(n):
    if n < 0:
        return None
    r = isqrt(n); return r if r * r == n else None


def standard_form(s):
    s = norm(s)
    for pat, hasb, hasc in (
        (r"(-?\d*)x\^2([+-]\d+)x([+-]\d+)=0", True, True),
        (r"(-?\d*)x\^2([+-]\d+)x=0", True, False),
        (r"(-?\d*)x\^2([+-]\d+)=0", False, True),
    ):
        m = re.search(pat, s)
        if m:
            a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
            b = int(m.group(2)) if hasb else 0
            c = int(m.group(3)) if (hasb and hasc) else (int(m.group(2)) if hasc else 0)
            return (a, b, c)
    return None


def disc(a, b, c):
    return b * b - 4 * a * c


def roots_std(a, b, c):
    r = perfect_sqrt(disc(a, b, c))
    return None if r is None else sorted({F(-b + r, 2 * a), F(-b - r, 2 * a)})


def disc(a, b, c):
    return b * b - 4 * a * c


def num_real(a, b, c):
    D = disc(a, b, c)
    return 2 if D > 0 else (1 if D == 0 else 0)


def axis(a, b):
    return F(-b, 2 * a)


def fval(a, b, c, x):
    return a * x * x + b * x + c


def _selftest():
    for expr, exp in [("x^2 - 6x = 0", [F(0), F(6)]), ("x^2 - 8x = 0", [F(0), F(8)]),
                      ("x^2 - 4x - 5 = 0", [F(-1), F(5)]), ("x^2 + 3x - 40 = 0", [F(-8), F(5)]),
                      ("x^2 + 5x - 36 = 0", [F(-9), F(4)]), ("x^2 + 2x - 48 = 0", [F(-8), F(6)]),
                      ("x^2 + 4x - 45 = 0", [F(-9), F(5)])]:
        a, b, c = standard_form(expr)
        r = roots_std(a, b, c)
        assert r == exp, (expr, r, exp)
        for x in r:
            assert fval(a, b, c, x) == 0, (expr, x)      # substitution route
    # vertex/optimization
    assert axis(-1, 6) == 3 and fval(-1, 6, 0, 3) == 9
    assert axis(-1, 8) == 4 and fval(-1, 8, 0, 4) == 16
    print("  self-test: applications toolkit OK (roots by substitution + vertex optimization)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/quadratics/lessons/qu-04-*.json")):
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
            if not sf:
                continue
            a, b, c = sf
            roots = roots_std(a, b, c)
            want = None
            time_q = any(t in low for t in ("time of", "when is", "when does", "at what time", "axis"))
            if "how many real" in low or "number of real" in low:
                want = F(num_real(a, b, c))
            elif time_q:
                want = axis(a, b)
            elif "maximum" in low or "greatest" in low:
                want = fval(a, b, c, axis(a, b))
            elif roots is not None and ("positive" in low or "valid" in low or "how wide" in low or "width" in low):
                pos = [r for r in roots if r > 0]
                want = pos[0] if len(pos) == 1 else None
            elif roots is not None and "larger" in low:
                want = max(roots)
            elif roots is not None and "smaller" in low:
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
