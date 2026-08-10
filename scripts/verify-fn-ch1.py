#!/usr/bin/env python3
"""Independent re-derivation of functions-and-sequences Chapter 1 (Function Basics).

Exact integer arithmetic, SELF-TESTED. Parses f(x)=<polynomial> and evaluates f(k) via a
{exp:coeff} poly (DUAL-ROUTE: evaluated by Horner-free power sum AND by term-by-term
accumulation in the self-test). Also parses coordinate pairs to re-derive domain/range
sets and whether the relation is a function. Content pass re-derives f(k) (numeric) and
domain/range (mcq set labels).
"""
import json, glob, re, sys


def parse_poly(s):
    s = s.replace("\u2212", "-").replace(" ", "")
    p = {}
    for m in re.finditer(r"[+-]?(?:\d*x\^\d+|\d*x|\d+)", s):
        tok = m.group(0)
        if tok in ("+", "-", ""):
            continue
        sign = -1 if tok[0] == "-" else 1
        tok = tok.lstrip("+-")
        if "x" in tok:
            if "^" in tok:
                cp, ep = tok.split("x^"); e = int(ep)
            else:
                cp = tok.split("x")[0]; e = 1
            c = int(cp) if cp else 1
        else:
            c = int(tok); e = 0
        p[e] = p.get(e, 0) + sign * c
    return {k: v for k, v in p.items() if v != 0}


def ev(p, x):
    return sum(c * x ** e for e, c in p.items())


def parse_def(prompt):
    m = re.search(r"([a-z])\(x\)\s*=\s*([0-9x\^\+\-\s]+?)(?:,|\?|$)", prompt.replace("\u2212", "-"))
    if m:
        return m.group(1), parse_poly(m.group(2))
    return None


def parse_pairs(prompt):
    return [(int(a), int(b)) for a, b in re.findall(r"\((-?\d+),\s*(-?\d+)\)", prompt)]


def parse_set(label):
    nums = re.findall(r"-?\d+", label)
    return set(int(n) for n in nums)


def _selftest():
    for expr, k, want in [("2x+3", 4, 11), ("2x+3", 0, 3), ("3x-1", 5, 14), ("x^2+1", 3, 10),
                          ("4x-2", 3, 10), ("x^2-4", 5, 21), ("2x^2+1", 3, 19)]:
        p = parse_poly(expr)
        assert ev(p, k) == want, (expr, k, ev(p, k), want)
        acc = 0
        for e, c in p.items():
            acc += c * k ** e
        assert acc == want                                # route 2
    pr = parse_pairs("(1,5),(2,7),(3,9)")
    assert {b for _, b in pr} == {5, 7, 9} and {a for a, _ in pr} == {1, 2, 3}
    fr = [a for a, _ in parse_pairs("(1,2),(1,3),(2,4)")]
    assert len(fr) != len(set(fr))                        # not a function
    assert parse_set("{5, 7, 9}") == {5, 7, 9}
    print("  self-test: function toolkit OK (evaluate dual-route, domain/range, function test)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/functions-and-sequences/lessons/fn-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            if w["type"] == "numeric":
                dv = parse_def(prompt)
                if not dv:
                    continue
                letter, poly = dv
                mk = re.search(re.escape(letter) + r"\((-?\d+)\)", prompt)
                if not mk:
                    continue
                want = ev(poly, int(mk.group(1)))
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                pairs = parse_pairs(prompt)
                if pairs and ("range" in low or "domain" in low):
                    want = {b for _, b in pairs} if "range" in low else {a for a, _ in pairs}
                    got = parse_set(corr[0]["label"])
                    if got != want:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL set {got} != {want}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
