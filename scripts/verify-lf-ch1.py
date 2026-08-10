#!/usr/bin/env python3
"""Independent re-derivation of linear-functions Chapter 1 (Slope & Rate of Change).

Symbolic linear toolkit (exact Fraction arithmetic), SELF-TESTED before any content is
checked (run with --selftest, or it runs automatically first):
  slope(p1,p2)              -> exact Fraction (y2-y1)/(x2-x1); raises on vertical
  line_through(p1,p2)       -> (m, b) with b = y1 - m*x1
  point_on_line(pt, m, b)   -> bool
  si_to_standard(m, b)      -> (A, B, C) ints, A>=0 (B>=0 if A==0), gcd==1, for Ax+By=C
  classify(m_or_None)       -> 'positive'|'negative'|'zero'|'undefined'

Content pass parses the controlled prompt formats this course authors:
  - two-point slope:   "... through (a, b) and (c, d) ..."
  - rise/run:          "rises R ... run N"  /  "up R ... over N"  /  "Rise = R, run = N"
and re-derives numeric answers, verifies mcq correct-option labels parse to the true
slope, checks trap distinctness (>=2, none equal to the answer), plotPoint collinearity
(+ connect flag + off-line pointErrors), and mcq single-correct.
"""
import json, glob, re, sys
from fractions import Fraction as F
from math import gcd


def slope(p1, p2):
    (x1, y1), (x2, y2) = p1, p2
    if x2 == x1:
        raise ZeroDivisionError("vertical line: undefined slope")
    return F(y2 - y1, x2 - x1)


def line_through(p1, p2):
    m = slope(p1, p2)
    (x1, y1) = p1
    return m, F(y1) - m * F(x1)


def point_on_line(pt, m, b):
    x, y = pt
    return F(y) == m * F(x) + b


def si_to_standard(m, b):
    # y = m x + b  ->  -m x + 1 y = b ; clear denominators, normalize.
    dens = [F(m).denominator, F(b).denominator]
    L = 1
    for d in dens:
        L = L * d // gcd(L, d)
    A = int(-m * L)
    B = int(1 * L)
    C = int(b * L)
    g = gcd(gcd(abs(A), abs(B)), abs(C)) or 1
    A, B, C = A // g, B // g, C // g
    if A < 0 or (A == 0 and B < 0):
        A, B, C = -A, -B, -C
    return A, B, C


def classify(m):
    if m is None:
        return "undefined"
    if m > 0:
        return "positive"
    if m < 0:
        return "negative"
    return "zero"


def _selftest():
    # slope: integer, fractional, negative, zero; vertical raises
    assert slope((1, 1), (4, 7)) == F(2)
    assert slope((2, 3), (5, 12)) == F(3)
    assert slope((0, 0), (3, 2)) == F(2, 3)
    assert slope((1, 5), (3, 1)) == F(-2)
    assert slope((0, 4), (6, 4)) == F(0)
    try:
        slope((2, 1), (2, 9)); assert False
    except ZeroDivisionError:
        pass
    # line_through + point_on_line
    m, b = line_through((1, 1), (4, 7))       # y = 2x - 1
    assert (m, b) == (F(2), F(-1))
    assert point_on_line((3, 5), m, b) and not point_on_line((3, 6), m, b)
    # rise/run
    assert F(6, 3) == F(2) and F(10, 5) == F(2)
    # standard-form conversion + normalization
    assert si_to_standard(F(2), F(-1)) == (2, -1, 1)      # y=2x-1 -> 2x - y = 1
    assert si_to_standard(F(-3), F(2)) == (3, 1, 2)       # y=-3x+2 -> 3x + y = 2
    assert si_to_standard(F(2, 3), F(1)) == (2, -3, -3)   # y=2/3 x +1 -> 2x-3y=-3
    assert si_to_standard(F(0), F(4)) == (0, 1, 4)        # y=4 -> y=4
    # classify
    assert (classify(F(3)), classify(F(-1)), classify(F(0)), classify(None)) == (
        "positive", "negative", "zero", "undefined")
    print("  self-test: slope/line/standard/classify toolkit OK")


# ---- label / prompt parsers for the content pass ----
PT = r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)"
TWO_PT = re.compile(r"through\s*" + PT + r"\s*and\s*" + PT, re.I)
RISE_RUN = [
    re.compile(r"rises?\s+(-?\d+).*?run\s+of?\s*(-?\d+)", re.I),
    re.compile(r"up\s+(-?\d+).*?over\s+(-?\d+)", re.I),
    re.compile(r"rise\s*=\s*(-?\d+).*?run\s*=\s*(-?\d+)", re.I),
]


def slope_from_prompt(p):
    m = TWO_PT.search(p)
    if m:
        a, b, c, d = map(int, m.groups())
        if c == a:
            return "undefined"
        return F(d - b, c - a)
    for rx in RISE_RUN:
        m = rx.search(p)
        if m:
            r, n = int(m.group(1)), int(m.group(2))
            if n == 0:
                return "undefined"
            return F(r, n)
    return None


def class_from_label(lbl):
    s = lbl.strip().lower()
    for k in ("undefined", "positive", "negative", "zero"):
        if k in s:
            return k
    return None


def label_to_frac(lbl):
    s = lbl.strip().lower().replace("−", "-").replace(" ", "")
    if s in ("undefined", "noslope", "none"):
        return "undefined"
    mm = re.fullmatch(r"(-?\d+)/(-?\d+)", s)
    if mm:
        return F(int(mm.group(1)), int(mm.group(2)))
    mm = re.fullmatch(r"-?\d+", s)
    if mm:
        return F(int(s))
    return None


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/linear-functions/lessons/lf-01-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget"), s.get("body", "")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget"), r["check"].get("body", ""))
                  for r in d.get("remedials", [])]
        for sid, w, _body in steps:
            if not w:
                continue
            t = w["type"]
            if t == "numeric":
                truth = slope_from_prompt(w["prompt"])
                if truth is not None and truth != "undefined":
                    checked += 1
                    ok = (truth.denominator == 1 and F(str(w["answer"])) == truth
                          and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(F(str(e["value"])) != truth for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: prompt-slope {truth} "
                              f"authored {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif t == "mcq":
                checked += 1
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct options")
                    continue
                truth = slope_from_prompt(w["prompt"])
                if truth is not None:
                    lab = label_to_frac(corr[0]["label"])
                    tv = "undefined" if truth == "undefined" else truth
                    if lab is not None and lab != tv:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: correct label {corr[0]['label']!r} "
                              f"parses {lab} but true slope is {tv}")
            elif t == "plotPoint":
                checked += 1
                tg = [(p["x"], p["y"]) for p in w["targets"]]
                if len(tg) >= 3:
                    m0 = slope(tg[0], tg[1])
                    if any(slope(tg[0], tg[i]) != m0 for i in range(2, len(tg))):
                        fails += 1
                        print(f"  {lid}/{sid} plotPoint FAIL: targets not collinear {tg}")
                    if not w.get("connectTargets"):
                        fails += 1
                        print(f"  {lid}/{sid} plotPoint FAIL: collinear targets but connectTargets not set")
                    mm, bb = line_through(tg[0], tg[1])
                    for pe in w.get("pointErrors", []):
                        if point_on_line((pe["x"], pe["y"]), mm, bb):
                            fails += 1
                            print(f"  {lid}/{sid} plotPoint FAIL: pointError ({pe['x']},{pe['y']}) is ON the line")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right labels not distinct")
                llab = {i["id"]: i["label"] for i in w["left"]}
                rlab = {i["id"]: i["label"] for i in w["right"]}
                for a, b in w["pairs"].items():
                    truth = slope_from_prompt(llab[a])
                    if truth is None:
                        continue
                    want = label_to_frac(rlab[b])
                    if truth != "undefined" and want is not None and truth != want:
                        fails += 1
                        print(f"  {lid}/{sid} matchPairs FAIL: {llab[a]!r}->{rlab[b]!r} "
                              f"(slope {truth} vs label {want})")
                    wc = class_from_label(rlab[b])
                    if wc is not None:
                        tc = "undefined" if truth == "undefined" else classify(truth)
                        if wc != tc:
                            fails += 1
                            print(f"  {lid}/{sid} matchPairs FAIL: {llab[a]!r}->{rlab[b]!r} "
                                  f"(class {tc} vs label {wc})")
            elif t == "dragOrder":
                checked += 1
                if [i["id"] for i in w["items"]] == w["correctOrder"]:
                    fails += 1
                    print(f"  {lid}/{sid} dragOrder pre-sorted")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
