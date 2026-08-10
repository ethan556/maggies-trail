#!/usr/bin/env python3
"""Independent re-derivation of exponential-functions Chapter 1 (Growth & Decay).

Exact-Fraction arithmetic, SELF-TESTED. Parses f(x)=a·b^x (b may be an integer or a
fraction like 1/2); evaluates f(k)=a·b^k exactly. Also parses integer sequences to
re-derive the constant ratio and the next term. Dual-route: f(k) is checked against the
step-by-step repeated-multiplication route in the self-test.
Content pass re-derives f(k) / initial value / constant ratio / next term (integers only;
fractional results are authored as mcq exact labels, not numeric).
"""
import json, glob, re, sys
from fractions import Fraction as F


def norm(s):
    return s.replace("\u2212", "-").replace("\u00b7", "*").replace(" ", "")


def parse_f(prompt):
    s = norm(prompt)
    m = re.search(r"f\(x\)=(\d+)\*\(?(\d+/\d+|\d+)\)?\^x", s)
    if m:
        return F(int(m.group(1))), F(m.group(2))
    m = re.search(r"f\(x\)=\(?(\d+/\d+|\d+)\)?\^x", s)
    if m:
        return F(1), F(m.group(1))
    return None


def evalf(a, b, k):
    return a * (b ** k)


def seq_ints(prompt):
    # integers in a listed sequence (comma/space separated), used only when 'sequence'/'table' present
    return [int(x) for x in re.findall(r"-?\d+", prompt)]


def ratio_of(seq):
    if len(seq) < 2 or seq[0] == 0:
        return None
    r = F(seq[1], seq[0])
    for i in range(1, len(seq) - 1):
        if seq[i] == 0 or F(seq[i + 1], seq[i]) != r:
            return None
    return r


def _selftest():
    assert parse_f("f(x) = 3 * 2^x") == (F(3), F(2))
    assert parse_f("f(x) = 2^x") == (F(1), F(2))
    assert parse_f("f(x) = 16 * (1/2)^x") == (F(16), F(1, 2))
    assert parse_f("f(x) = 8 * (3/2)^x") == (F(8), F(3, 2))
    # evaluation, dual-route (formula vs repeated multiply)
    for a, b, k, want in [(F(3), F(2), 2, 12), (F(5), F(3), 2, 45), (F(1), F(2), 5, 32),
                          (F(16), F(1, 2), 3, 2), (F(8), F(3, 2), 3, 27), (F(2), F(3), 3, 54),
                          (F(81), F(1, 3), 2, 9), (F(32), F(1, 2), 4, 2)]:
        v = evalf(a, b, k)
        assert v == want, (a, b, k, v, want)
        step = a
        for _ in range(k):
            step *= b
        assert step == v, (a, b, k)                       # route 2: repeated multiply
    # sequences
    assert ratio_of([2, 6, 18, 54]) == 3
    assert ratio_of([5, 10, 20, 40]) == 2
    assert ratio_of([16, 8, 4, 2]) == F(1, 2)
    assert ratio_of([5, 15, 45, 135]) == 3
    assert ratio_of([3, 5, 7]) is None                    # arithmetic, not geometric
    print("  self-test: exponential toolkit OK (a*b^x dual-route, constant ratio, next term)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/exponential-functions/lessons/exp-01-*.json")):
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
            want = None
            pf = parse_f(prompt)
            if "f(x)" in low and pf:
                a, b = pf
                if "initial value" in low or "f(0)" in low:
                    want = evalf(a, b, 0)
                else:
                    all_k = re.findall(r"f\((\d+)\)", norm(prompt))  # f(x) never matches (x is not a digit)
                    if all_k:
                        want = evalf(a, b, int(all_k[-1]))
            elif ("sequence" in low or "table" in low):
                seq = seq_ints(prompt)
                r = ratio_of(seq)
                if r is not None:
                    if "next" in low:
                        want = F(seq[-1]) * r
                    elif "ratio" in low or "multiplied by" in low or "constant" in low:
                        want = r
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
