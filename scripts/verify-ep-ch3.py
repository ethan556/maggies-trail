#!/usr/bin/env python3
"""Re-derivation of exponents-polynomials Ch3 (Multiplying Polynomials).

Reuses the {exp:coeff} Poly type from ch2 and adds mul() by convolution.
DUAL-ROUTE: every binomial product is checked by convolution mul() AND by an
independent term-by-term FOIL expansion; special products are checked against
the general expansion. SELF-TESTED before authoring.
Content pass parses the (...) factors from each prompt, multiplies, and re-derives
the asked coefficient/constant; mcq "which is the product" options are parsed and
compared to the computed product.
"""
import json, glob, re, sys


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


def degree(a):
    return max(a) if a else 0


def coeff(a, k):
    return a.get(k, 0)


def foil(a, b):
    """Independent term-by-term expansion (First/Outer/Inner/Last for binomials)."""
    r = {}
    for e1, c1 in a.items():
        for e2, c2 in b.items():
            r[e1 + e2] = r.get(e1 + e2, 0) + c1 * c2
    return {k: v for k, v in r.items() if v != 0}


def groups(prompt):
    return [parse_poly(g) for g in re.findall(r"\(([^()]+)\)", prompt.replace("\u2212", "-"))
            if parse_poly(g)]


def _selftest():
    P = parse_poly
    # monomial x poly
    assert mul(P("3x"), P("x + 4")) == {2: 3, 1: 12}
    assert mul(P("4x^2"), P("x^2 + 2x - 1")) == {4: 4, 3: 8, 2: -4}
    assert mul(P("5"), P("2x^2 - x + 3")) == {2: 10, 1: -5, 0: 15}
    # binomial x binomial, dual route mul vs foil
    for A, B, exp in [("x + 2", "x + 3", {2: 1, 1: 5, 0: 6}),
                      ("x + 5", "x - 2", {2: 1, 1: 3, 0: -10}),
                      ("x - 4", "x - 1", {2: 1, 1: -5, 0: 4}),
                      ("2x + 1", "x + 3", {2: 2, 1: 7, 0: 3}),
                      ("x + 3", "x - 3", {2: 1, 0: -9})]:
        assert mul(P(A), P(B)) == exp
        assert foil(P(A), P(B)) == mul(P(A), P(B))
    # special products vs general expansion
    assert mul(P("x + 4"), P("x + 4")) == {2: 1, 1: 8, 0: 16}
    assert mul(P("x - 5"), P("x - 5")) == {2: 1, 1: -10, 0: 25}
    assert mul(P("x + 6"), P("x - 6")) == {2: 1, 0: -36}
    assert mul(P("2x + 3"), P("2x + 3")) == {2: 4, 1: 12, 0: 9}
    assert mul(P("3x - 1"), P("3x + 1")) == {2: 9, 0: -1}
    print("  self-test: multiply toolkit OK (convolution vs FOIL, special products)")


def main():
    _selftest()
    fails = 0; checked = 0
    for f in sorted(glob.glob("content/courses/exponents-polynomials/lessons/ep-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower(); gs = groups(prompt)
            if w["type"] == "numeric":
                if len(gs) != 2:
                    continue
                res = mul(gs[0], gs[1]); want = None
                mk = re.search(r"coefficient of x\^(\d+)", low)
                if mk:
                    want = coeff(res, int(mk.group(1)))
                elif "coefficient of x" in low:
                    want = coeff(res, 1)
                elif "constant" in low:
                    want = coeff(res, 0)
                elif "degree" in low:
                    want = degree(res)
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
                if len(gs) == 2 and "x" in corr[0]["label"]:
                    res = mul(gs[0], gs[1]); opt = parse_poly(corr[0]["label"])
                    if opt != res:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: option {corr[0]['label']!r}={opt} exp {res}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
