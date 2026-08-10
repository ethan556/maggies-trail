#!/usr/bin/env python3
"""Independent re-derivation of exponential-functions Chapter 4 (Graphs & Comparisons).

Reuses the exact a·b^x machinery (any single-letter model), SELF-TESTED. Evaluates the
y-intercept (f(0)=a) and f(k) for graph-reading and comparison prompts; the "grows faster
= larger base" and exponential-vs-linear classifications are structural mcqs. Dual-route:
evaluation cross-checked against repeated multiplication in the self-test.
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
    assert parse_g("f(x) = 5 * 2^x") == ("f", F(5), F(2))
    assert parse_g("g(x) = 1 * 4^x") == ("g", F(1), F(4))
    for a, b, k, want in [(F(5), F(2), 0, 5), (F(3), F(4), 0, 3), (F(7), F(2), 0, 7),
                          (F(2), F(3), 2, 18), (F(10), F(2), 2, 40), (F(2), F(3), 3, 54),
                          (F(1), F(4), 3, 64), (F(2), F(2), 4, 32), (F(3), F(2), 4, 48),
                          (F(5), F(2), 3, 40), (F(4), F(5), 0, 4), (F(10), F(3), 0, 10)]:
        v = evalf(a, b, k)
        assert v == want, (a, b, k, v, want)
        step = a
        for _ in range(k):
            step *= b
        assert step == v, (a, b, k)
    print("  self-test: graphs/comparison toolkit OK (y-intercept + eval, dual-route)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/exponential-functions/lessons/exp-04-*.json")):
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
            if "y-intercept" in low or "cross the y-axis" in low or "crosses the y-axis" in low:
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
