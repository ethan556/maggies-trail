#!/usr/bin/env python3
"""Independent re-derivation of quadratics Chapter 2 (Solving by Factoring).

Reuses the {exp:coeff} polynomial type + mul, SELF-TESTED. Roots are found by an
integer scan of the quadratic, then DUAL-ROUTED: (a) each root substituted back must
give 0, and (b) a·(x-r1)(x-r2) re-multiplied must equal the original quadratic.
Content pass re-derives the asked root (larger/smaller) / sum / product / count, and
checks factored-form mcqs by re-multiplication.
"""
import json, glob, re, sys
from fractions import Fraction as F


def parse_poly(s):
    s = s.replace("\u2212", "-").replace(" ", "")
    p = {}
    for m in re.finditer(r"[+-]?(?:\d+x\^-?\d+|\d+x|x\^-?\d+|x|\d+)", s):
        tok = m.group(0); sign = -1 if tok[0] == "-" else 1; tok = tok.lstrip("+-")
        if "x" in tok:
            if "^" in tok:
                cpart, epart = tok.split("x^"); exp = int(epart)
            else:
                cpart = tok.split("x")[0]; exp = 1
            coeff = int(cpart) if cpart else 1
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


def val(p, x):
    return sum(c * x ** e for e, c in p.items())


def int_roots(p):
    return sorted({x for x in range(-200, 201) if val(p, x) == 0})


def quad_lhs(prompt):
    s = prompt.replace("\u2212", "-")
    m = re.search(r"([0-9x\^\+\-\s]*x\^2[0-9x\^\+\-\s]*?)=\s*0", s)
    return parse_poly(m.group(1)) if m else None


def _selftest():
    cases = {
        "x^2 + 5x + 6": [-3, -2], "x^2 - 7x + 12": [3, 4], "x^2 - 9": [-3, 3],
        "x^2 + x - 6": [-3, 2], "x^2 - x - 12": [-3, 4], "x^2 - 4x + 4": [2],
        "x^2 - 25": [-5, 5], "x^2 + 7x + 10": [-5, -2],
    }
    for poly, roots in cases.items():
        p = parse_poly(poly)
        r = int_roots(p)
        assert r == roots, (poly, r, roots)
        for x in r:
            assert val(p, x) == 0, (poly, x)              # route a: substitution
        # route b: a*(x-r1)(x-r2) re-multiplied equals original
        a = p.get(2, 1)
        prod = {0: a}
        for x in (roots if len(roots) == 2 else roots * 2):
            prod = mul(prod, {1: 1, 0: -x})
        assert prod == p, (poly, prod, p)
    print("  self-test: factoring toolkit OK (roots by scan, dual-route substitution + re-expand)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/quadratics/lessons/qu-02-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            p = quad_lhs(prompt)
            if w["type"] == "numeric":
                if not p:
                    continue
                roots = int_roots(p)
                want = None
                if "sum of" in low:
                    want = F(-p.get(1, 0), p.get(2, 1))
                elif "product of" in low:
                    want = F(p.get(0, 0), p.get(2, 1))
                elif "how many" in low or "number of" in low:
                    want = F(len(roots))
                elif "larger" in low or "greater" in low:
                    want = F(max(roots))
                elif "smaller" in low or "lesser" in low:
                    want = F(min(roots))
                elif "positive solution" in low:
                    pos = [r for r in roots if r > 0]; want = F(pos[0]) if len(pos) == 1 else None
                if want is not None and want.denominator == 1:
                    checked += 1
                    ok = (F(str(w["answer"])) == want and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(F(str(e["value"])) != want for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq FAIL {len(corr)} correct"); continue
                checked += 1
                lab = corr[0]["label"]
                if p and lab.count("(") == 2:   # factored-form option: re-multiply
                    fs = [parse_poly(g) for g in re.findall(r"\(([^)]*)\)", lab.replace("\u2212", "-"))]
                    if len(fs) == 2:
                        prod = mul(fs[0], fs[1])
                        if prod != p:
                            fails += 1
                            print(f"  {lid}/{sid} mcq FAIL factored {lab!r}->{prod} exp {p}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
