#!/usr/bin/env python3
"""Independent re-derivation of exponents-polynomials Chapter 1 (Exponent Rules).

New toolkit (NOT shared with the linear solvers) — exact integer/Fraction, SELF-TESTED:
  result(expr) -> (base, exp)   for single power, product/quotient (same base), power-of-power
  val(base, exp) -> Fraction    (numeric bases only; negative exp -> fraction)
Dual-route: product a^m·a^n is checked by (a^m)*(a^n) == a^(m+n) computed independently;
power-of-power (a^m)^n by ((a^m))^n == a^(m*n). Content pass re-derives the asked
resulting exponent (may be negative) or the integer value for every numeric widget.
"""
import json, glob, re, sys
from fractions import Fraction as F

TERM = r"(-?\d+|[xy])\s*\^\s*(-?\d+)"


def _norm(s):
    return s.replace("\u00b7", "*").replace("\u2212", "-").replace("\u00d7", "*").replace(" ", "")


def result(expr):
    e = _norm(expr)
    m = re.fullmatch(r"\((-?\d+|[xy])\^(-?\d+)\)\^(-?\d+)", e)
    if m:
        return (m.group(1), int(m.group(2)) * int(m.group(3)))
    m = re.fullmatch(r"(-?\d+|[xy])\^(-?\d+)\*(-?\d+|[xy])\^(-?\d+)", e)
    if m and m.group(1) == m.group(3):
        return (m.group(1), int(m.group(2)) + int(m.group(4)))
    m = re.fullmatch(r"(-?\d+|[xy])\^(-?\d+)/(-?\d+|[xy])\^(-?\d+)", e)
    if m and m.group(1) == m.group(3):
        return (m.group(1), int(m.group(2)) - int(m.group(4)))
    m = re.fullmatch(r"(-?\d+|[xy])\^(-?\d+)", e)
    if m:
        return (m.group(1), int(m.group(2)))
    return None


def is_num(base):
    return re.fullmatch(r"-?\d+", base) is not None


def val(base, exp):
    return F(int(base)) ** exp


def find_expr(prompt):
    """Pull the first power-expression out of prose (power-of-power, product, quotient, single)."""
    e = _norm(prompt)
    for pat in (r"\((-?\d+|[xy])\^(-?\d+)\)\^(-?\d+)",
                r"(-?\d+|[xy])\^(-?\d+)\*(-?\d+|[xy])\^(-?\d+)",
                r"(-?\d+|[xy])\^(-?\d+)/(-?\d+|[xy])\^(-?\d+)",
                r"(-?\d+|[xy])\^(-?\d+)"):
        m = re.search(pat, e)
        if m:
            return m.group(0)
    return None


def _selftest():
    # parse + dual-route
    assert result("2^3 * 2^4") == ("2", 7)
    assert val("2", 3) * val("2", 4) == val("2", 7) == F(128)      # dual route product
    assert result("3^5 / 3^2") == ("3", 3) and val("3", 3) == F(27)
    assert result("x^5 * x^3") == ("x", 8)
    assert result("5^4 / 5^2") == ("5", 2) and val("5", 2) == F(25)
    assert result("x^7 / x^3") == ("x", 4)
    assert result("(2^3)^2") == ("2", 6) and val("2", 6) == F(64)
    assert val("2", 3) ** 2 == val("2", 6)                          # dual route power-of-power
    assert result("(3^2)^2") == ("3", 4) and val("3", 4) == F(81)
    assert result("(x^4)^3") == ("x", 12)
    assert result("2^3 * 2^-1") == ("2", 2) and val("2", 2) == F(4)
    assert result("x^5 * x^-2") == ("x", 3)
    assert result("3^4 / 3^6") == ("3", -2) and val("3", -2) == F(1, 9)
    assert result("5^0") == ("5", 0) and val("5", 0) == F(1)
    assert result("2^-3") == ("2", -3) and val("2", -3) == F(1, 8)
    assert find_expr("Simplify 2^3 · 2^4. What is the exponent?") == "2^3*2^4"
    print("  self-test: exponent-rules toolkit OK (dual-route product & power)")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/exponents-polynomials/lessons/ep-01-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget"), s.get("body", "")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget"), r["check"].get("body", ""))
                  for r in d.get("remedials", [])]
        for sid, w, _b in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq":
                    corr = [o for o in w["options"] if o.get("correct")]
                    if len(corr) != 1:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct")
                continue
            prompt = w.get("prompt", "")
            low = prompt.lower()
            expr = find_expr(prompt)
            if not expr:
                continue
            r = result(expr)
            if r is None:
                continue
            base, exp = r
            want = None
            if "exponent" in low:
                want = F(exp)
            elif ("evaluate" in low or "value" in low) and is_num(base):
                want = val(base, exp)
            if want is not None and want.denominator == 1:
                checked += 1
                ok = (F(str(w["answer"])) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(F(str(e["value"])) != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL: expr {expr} want {want} got {w['answer']} "
                          f"traps {[e['value'] for e in w['commonErrors']]}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
