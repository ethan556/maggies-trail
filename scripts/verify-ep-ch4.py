#!/usr/bin/env python3
"""Re-derivation of exponents-polynomials Ch4 (Factoring) — course-closing chapter.

Reuses parse_poly + mul. Factoring is verified the only honest way: FACTOR the
polynomial independently (GCF via gcd of coefficients; monic trinomial via integer
search; difference of squares via integer roots) and CONFIRM BY RE-MULTIPLYING the
found factors back to the original. That re-multiplication is the dual route.
Content pass re-derives each asked feature and checks every mcq factored form by
parsing it into factors and multiplying them back to the original.
"""
import json, glob, re, sys
from math import gcd, isqrt


def parse_poly(s):
    s = s.replace("\u2212", "-").replace(" ", "")
    p = {}
    for m in re.finditer(r"[+-]?(?:\d+x\^-?\d+|\d+x|x\^-?\d+|x|\d+)", s):
        tok = m.group(0); sign = -1 if tok[0] == "-" else 1; tok = tok.lstrip("+-")
        if "x" in tok:
            if "^" in tok:
                c, e = tok.split("x^"); exp = int(e)
            else:
                c = tok.split("x")[0]; exp = 1
            coeff = int(c) if c else 1
        else:
            coeff = int(tok); exp = 0
        p[exp] = p.get(exp, 0) + sign * coeff
    return {k: v for k, v in p.items() if v != 0}


def mul(a, b):
    r = {}
    for e1, c1 in a.items():
        for e2, c2 in b.items():
            r[e1 + e2] = r.get(e1 + e2, 0) + c1 * c2
    return {k: v for k, v in r.items() if v != 0}


def gcf_coeff(poly):
    g = 0
    for c in poly.values():
        g = gcd(g, abs(c))
    return g


def gcf_deg(poly):
    return min(poly) if poly else 0


def factor_trinomial(poly):
    """Monic x^2 + bx + c -> (p, q) with p<=q, p+q=b, p*q=c; confirmed by re-multiply."""
    b, c = poly.get(1, 0), poly.get(0, 0)
    for p in range(-200, 201):
        q = b - p
        if p <= q and p * q == c:
            assert mul({1: 1, 0: p}, {1: 1, 0: q}) == poly, (poly, p, q)
            return (p, q)
    return None


def factor_dos(poly):
    """(m x)^2 - a^2 -> (m, a); confirmed by re-multiply."""
    lead, const = poly.get(2, 0), poly.get(0, 0)
    assert poly.get(1, 0) == 0 and const < 0
    m, a = isqrt(lead), isqrt(-const)
    assert m * m == lead and a * a == -const
    assert mul({1: m, 0: a}, {1: m, 0: -a}) == poly, (poly, m, a)
    return (m, a)


def parse_factored(s):
    s = s.replace("\u2212", "-").replace(" ", "")
    idx = s.find("(")
    if idx == -1:
        return parse_poly(s)
    factors = []
    if idx > 0:
        lead = parse_poly(s[:idx])
        if lead:
            factors.append(lead)
    for g in re.findall(r"\(([^()]+)\)", s):
        pg = parse_poly(g)
        if pg:
            factors.append(pg)
    prod = factors[0]
    for f in factors[1:]:
        prod = mul(prod, f)
    return prod


def groups(prompt):
    return [parse_poly(g) for g in re.findall(r"\(([^()]+)\)", prompt.replace("\u2212", "-"))
            if parse_poly(g)]


def _selftest():
    P = parse_poly
    assert gcf_coeff(P("6x^2 + 9x")) == 3 and gcf_deg(P("6x^2 + 9x")) == 1
    assert mul(P("3x"), P("2x + 3")) == P("6x^2 + 9x")            # re-multiply GCF
    assert gcf_coeff(P("8x^3 + 12x^2")) == 4 and gcf_deg(P("8x^3 + 12x^2")) == 2
    assert gcf_coeff(P("10x^2 - 15x")) == 5 and gcf_deg(P("10x^2 - 15x")) == 1
    assert factor_trinomial(P("x^2 + 5x + 6")) == (2, 3)
    assert factor_trinomial(P("x^2 + 7x + 12")) == (3, 4)
    assert factor_trinomial(P("x^2 - 5x + 6")) == (-3, -2)
    assert factor_trinomial(P("x^2 - x - 6")) == (-3, 2)
    assert factor_dos(P("x^2 - 9")) == (1, 3)
    assert factor_dos(P("x^2 - 25")) == (1, 5)
    assert factor_dos(P("x^2 - 36")) == (1, 6)
    assert factor_dos(P("4x^2 - 9")) == (2, 3)
    assert parse_factored("3x(2x + 3)") == P("6x^2 + 9x")
    assert parse_factored("(x + 2)(x + 3)") == P("x^2 + 5x + 6")
    assert parse_factored("(x + 6)(x - 6)") == P("x^2 - 36")
    assert parse_factored("(2x + 3)(2x - 3)") == P("4x^2 - 9")
    print("  self-test: factoring toolkit OK (factor + confirm by re-multiply)")


def main():
    _selftest()
    fails = 0; checked = 0
    for f in sorted(glob.glob("content/courses/exponents-polynomials/lessons/ep-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower(); gs = groups(prompt)
            if not gs:
                continue
            orig = gs[0]
            if w["type"] == "numeric":
                want = None
                try:
                    if "gcf coefficient" in low:
                        want = gcf_coeff(orig)
                    elif "gcf" in low and "exponent" in low:
                        want = gcf_deg(orig)
                    elif "larger" in low:
                        want = factor_trinomial(orig)[1]
                    elif "smaller" in low:
                        want = factor_trinomial(orig)[0]
                    elif "find a" in low or "value of a" in low:
                        want = factor_dos(orig)[1]
                except (AssertionError, TypeError):
                    fails += 1; print(f"  {lid}/{sid}: factorization failed for {orig}"); continue
                if want is not None:
                    checked += 1
                    ok = (int(w["answer"]) == want and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(int(e["value"]) != want for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1 correct"); continue
                checked += 1
                if "(" in corr[0]["label"]:
                    if parse_factored(corr[0]["label"]) != orig:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: {corr[0]['label']!r} re-multiplies to {parse_factored(corr[0]['label'])}, not {orig}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
