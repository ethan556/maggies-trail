#!/usr/bin/env python3
"""Independent re-derivation of exponential-functions Chapter 2 (Modeling).

Reuses the exact a·b^x machinery, generalized to any single-letter model name
(P, A, V, N, …), SELF-TESTED. Word problems state the model explicitly (e.g.
P(x)=200·3^x) so the verifier evaluates the queried value exactly; the percent→base
reasoning (50% growth → factor 3/2, etc.) is taught in prose and always cashed out as an
explicit base in the numeric prompt. Dual-route: evaluation cross-checked against
repeated multiplication in the self-test. Content pass re-derives model(k) / initial value.
"""
import json, glob, re, sys
from fractions import Fraction as F


def norm(s):
    return s.replace("\u2212", "-").replace("\u00b7", "*").replace(" ", "")


def parse_g(prompt):
    s = norm(prompt)
    m = re.search(r"([A-Za-z])\(x\)=(\d+)\*\(?(\d+/\d+|\d+)\)?\^x", s)
    if m:
        return m.group(1), F(int(m.group(2))), F(m.group(3))
    m = re.search(r"([A-Za-z])\(x\)=\(?(\d+/\d+|\d+)\)?\^x", s)
    if m:
        return m.group(1), F(1), F(m.group(2))
    return None


def evalf(a, b, k):
    return a * (b ** k)


def _selftest():
    assert parse_g("P(x) = 200 * 3^x") == ("P", F(200), F(3))
    assert parse_g("V(x) = 8000 * (1/2)^x") == ("V", F(8000), F(1, 2))
    assert parse_g("M(x) = 16 * (3/2)^x") == ("M", F(16), F(3, 2))
    for a, b, k, want in [(F(200), F(3), 2, 1800), (F(500), F(2), 3, 4000),
                          (F(8000), F(1, 2), 2, 2000), (F(8000), F(1, 2), 3, 1000),
                          (F(3), F(4), 3, 192), (F(16), F(3, 2), 2, 36), (F(200), F(3), 0, 200)]:
        v = evalf(a, b, k)
        assert v == want, (a, b, k, v, want)
        step = a
        for _ in range(k):
            step *= b
        assert step == v, (a, b, k)
    print("  self-test: modeling toolkit OK (any-letter a*b^x, dual-route)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/exponential-functions/lessons/exp-02-*.json")):
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
            g = parse_g(prompt)
            if not g:
                continue
            letter, a, b = g
            want = None
            if "initial value" in low or f"{letter.lower()}(0)" in low or "starting value" in low:
                want = evalf(a, b, 0)
            else:
                ks = re.findall(re.escape(letter) + r"\((\d+)\)", norm(prompt))
                if ks:
                    want = evalf(a, b, int(ks[-1]))
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
