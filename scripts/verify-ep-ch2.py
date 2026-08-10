#!/usr/bin/env python3
"""Independent re-derivation of exponents-polynomials Chapter 2 (Polynomial Basics).

New toolkit — a tiny exact polynomial type {exp: coeff}, SELF-TESTED:
  parse_poly("3x^2 + 2x - 5") -> {2:3, 1:2, 0:-5}
  add / sub                    -> combine like terms
  degree / coeff               -> highest exponent / coefficient of x^k
Dual-route where useful: a difference p - q is also checked by add(p, scale(q,-1)).
Content pass parses polynomials from (...) groups in each prompt and re-derives the
asked coefficient / degree / constant, and mcq sum/difference option polynomials.
"""
import json, glob, re, sys

TERM = re.compile(r"([+-]?)\s*(\d*)\s*(x)?\s*(?:\^\s*(-?\d+))?")


def parse_poly(s):
    s = s.replace("\u2212", "-").replace(" ", "")
    p = {}
    i = 0
    # tokenize into signed terms
    for m in re.finditer(r"[+-]?(?:\d+x\^-?\d+|\d+x|x\^-?\d+|x|\d+)", s):
        tok = m.group(0)
        sign = -1 if tok[0] == "-" else 1
        tok = tok.lstrip("+-")
        if "x" in tok:
            if "^" in tok:
                cpart, epart = tok.split("x^")
                exp = int(epart)
            else:
                cpart = tok.split("x")[0]
                exp = 1
            coeff = int(cpart) if cpart else 1
        else:
            coeff = int(tok)
            exp = 0
        p[exp] = p.get(exp, 0) + sign * coeff
    return {k: v for k, v in p.items() if v != 0}


def add(a, b):
    r = dict(a)
    for k, v in b.items():
        r[k] = r.get(k, 0) + v
    return {k: v for k, v in r.items() if v != 0}


def scale(a, c):
    return {k: v * c for k, v in a.items()}


def sub(a, b):
    return add(a, scale(b, -1))


def degree(a):
    return max(a) if a else 0


def coeff(a, k):
    return a.get(k, 0)


def groups(prompt):
    return [parse_poly(g) for g in re.findall(r"\(([^)]*x[^)]*)\)", prompt.replace("\u2212", "-"))]


def _selftest():
    assert parse_poly("3x^2 + 2x - 5") == {2: 3, 1: 2, 0: -5}
    assert parse_poly("x^2 - 4x + 1") == {2: 1, 1: -4, 0: 1}
    assert parse_poly("-x^2 + x") == {2: -1, 1: 1}
    assert parse_poly("6x^5 - x^2 + 10") == {5: 6, 2: -1, 0: 10}
    assert add(parse_poly("3x^2 + 2x - 5"), parse_poly("x^2 - 4x + 1")) == {2: 4, 1: -2, 0: -4}
    assert add(parse_poly("x^3 + 4x - 1"), parse_poly("2x^3 - x + 6")) == {3: 3, 1: 3, 0: 5}
    r = sub(parse_poly("5x^2 + 3x - 2"), parse_poly("2x^2 + 7x - 6"))
    assert r == {2: 3, 1: -4, 0: 4}
    # dual route: p - q == p + (-1)q
    assert r == add(parse_poly("5x^2 + 3x - 2"), scale(parse_poly("2x^2 + 7x - 6"), -1))
    assert sub(parse_poly("6x^2 + 2x - 1"), parse_poly("3x^2 + 2x - 5")) == {2: 3, 0: 4}
    assert degree(parse_poly("3x^2 + 5x^4 - x")) == 4
    assert coeff(parse_poly("7x^3 - 2x^2 + x - 9"), 2) == -2
    assert coeff(parse_poly("4x^2 + 3x - 8"), 0) == -8
    assert degree(parse_poly("6x^5 - x^2 + 10")) == 5
    assert coeff(parse_poly("2x^3 + 9x^2 - x"), degree(parse_poly("2x^3 + 9x^2 - x"))) == 2
    print("  self-test: polynomial type OK (parse/add/sub/degree/coeff, dual-route sub)")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/exponents-polynomials/lessons/ep-02-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget"), s.get("body", "")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget"), r["check"].get("body", ""))
                  for r in d.get("remedials", [])]
        for sid, w, _b in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            low = prompt.lower()
            gs = groups(prompt)
            if w["type"] == "numeric":
                res = None
                if len(gs) == 2:
                    res = sub(gs[0], gs[1]) if ("subtract" in low or "minus" in low or "difference" in low) else add(gs[0], gs[1])
                elif len(gs) == 1:
                    res = gs[0]
                if res is None:
                    continue
                want = None
                mk = re.search(r"coefficient of x\^(\d+)", low)
                if mk:
                    want = coeff(res, int(mk.group(1)))
                elif "coefficient of x" in low:
                    want = coeff(res, 1)
                elif "degree" in low:
                    want = degree(res)
                elif "constant" in low:
                    want = coeff(res, 0)
                elif "leading coefficient" in low:
                    want = coeff(res, degree(res))
                if want is not None:
                    checked += 1
                    ok = (int(w["answer"]) == want and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(int(e["value"]) != want for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: want {want} got {w['answer']} "
                              f"traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct")
                    continue
                checked += 1
                if len(gs) == 2:
                    res = sub(gs[0], gs[1]) if ("subtract" in low or "minus" in low or "difference" in low) else add(gs[0], gs[1])
                    opt = parse_poly(corr[0]["label"])
                    if "x" in corr[0]["label"] and opt != res:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: option {corr[0]['label']!r}={opt} exp {res}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
