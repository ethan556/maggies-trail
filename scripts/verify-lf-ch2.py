#!/usr/bin/env python3
"""Independent re-derivation of linear-functions Chapter 2 (Slope-Intercept Form).

Reuses the Ch1 symbolic toolkit (exact Fraction) and EXTENDS it, SELF-TESTED before any
content is checked (run with --selftest, or it runs automatically first):
  parse_line("y = m x + b") -> (m, b) as exact Fractions   (m defaults 1 for bare 'x')
  eval_y(m, b, x)           -> y = m x + b
  y_intercept(m, b)         -> b
  x_intercept(m, b)         -> exact Fraction -b/m ; 'none' if m == 0 (b!=0)
  point_on_line, si_to_standard, classify  (as Ch1)

Content pass parses the controlled prompt formats Ch2 authors:
  - an explicit line equation "y = m x + b" inside numeric/mcq/plotPoint prompts,
  - the question type from keywords: 'y-intercept', 'x-intercept', or 'when x = N' (eval),
  - buildExpression targets stated as "slope S ... y-intercept B".
It re-derives every numeric answer, checks mcq correct-option labels, verifies plotPoint
targets lie on the stated line (+ collinear + off-line pointErrors), confirms the
assembled buildExpression equals y = Sx + B, and enforces trap distinctness.
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


def eval_y(m, b, x):
    return m * F(x) + b


def y_intercept(m, b):
    return b


def x_intercept(m, b):
    if m == 0:
        return "none"
    return -b / m


def si_to_standard(m, b):
    dens = [F(m).denominator, F(b).denominator]
    L = 1
    for d in dens:
        L = L * d // gcd(L, d)
    A = int(-m * L); B = int(1 * L); C = int(b * L)
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


# ---- parsers ----
def _frac(tok):
    """int or a/b string -> Fraction; '' or None -> None."""
    if tok is None:
        return None
    t = tok.strip().replace("−", "-").replace(" ", "")
    if t == "":
        return None
    if "/" in t:
        n, d = t.split("/")
        return F(int(n), int(d))
    return F(int(t))


LINE_RE = re.compile(r"y\s*=\s*([+-]?\s*(?:\d+/\d+|\d*))\s*x\s*([+-]\s*(?:\d+/\d+|\d+))?", re.I)


def parse_line(s):
    """Parse 'y = m x + b' (parentheses around a fractional slope allowed). Returns (m,b) or None."""
    s2 = s.replace("−", "-").replace("(", "").replace(")", "")
    m = LINE_RE.search(s2)
    if not m:
        return None
    mtok = m.group(1).replace(" ", "") if m.group(1) is not None else ""
    if mtok in ("", "+"):
        slope_m = F(1)
    elif mtok == "-":
        slope_m = F(-1)
    else:
        slope_m = _frac(mtok)
    btok = m.group(2).replace(" ", "") if m.group(2) else ""
    b = _frac(btok) if btok else F(0)
    return slope_m, b


PT = r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)"
TWO_PT = re.compile(r"through\s*" + PT + r"\s*and\s*" + PT, re.I)
WHEN_X = re.compile(r"\bx\s*=\s*(-?\d+)", re.I)


def label_to_frac(lbl):
    s = lbl.strip().lower().replace("−", "-").replace(" ", "")
    if s in ("undefined", "noslope", "none", "noxintercept"):
        return "none"
    mm = re.fullmatch(r"\(?(-?\d+)/(-?\d+)\)?", s)
    if mm:
        return F(int(mm.group(1)), int(mm.group(2)))
    mm = re.fullmatch(r"-?\d+", s)
    if mm:
        return F(int(s))
    # coordinate label like "(3,0)" -> take the meaningful nonzero coord for an intercept
    mm = re.fullmatch(r"\((-?\d+),(-?\d+)\)", s)
    if mm:
        a, bb = int(mm.group(1)), int(mm.group(2))
        return F(a) if bb == 0 else F(bb)
    return None


def _selftest():
    assert parse_line("y = 2x + 3") == (F(2), F(3))
    assert parse_line("y = -x + 5") == (F(-1), F(5))
    assert parse_line("y = x - 4") == (F(1), F(-4))
    assert parse_line("y = 3x") == (F(3), F(0))
    assert parse_line("y = -2x - 1") == (F(-2), F(-1))
    assert parse_line("y = (1/2)x + 1") == (F(1, 2), F(1))
    assert parse_line("the line y = 4x + 0 crosses") == (F(4), F(0))
    # eval + intercepts
    m, b = parse_line("y = 2x + 3")
    assert eval_y(m, b, 4) == F(11)
    assert y_intercept(m, b) == F(3)
    assert x_intercept(m, b) == F(-3, 2)
    assert x_intercept(F(2), F(-6)) == F(3)
    assert x_intercept(F(-1), F(5)) == F(5)
    assert x_intercept(F(0), F(4)) == "none"
    # toolkit sanity (as Ch1)
    assert si_to_standard(F(2), F(-1)) == (2, -1, 1)
    assert point_on_line((3, 5), F(2), F(-1))
    assert classify(F(0)) == "zero"
    print("  self-test: line/eval/intercept/toolkit OK")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/linear-functions/lessons/lf-02-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget"), s.get("body", "")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget"), r["check"].get("body", ""))
                  for r in d.get("remedials", [])]
        for sid, w, _body in steps:
            if not w:
                continue
            t = w["type"]
            prompt = w.get("prompt", "")
            line = parse_line(prompt)
            low = prompt.lower()

            def expected_from_prompt():
                """Return exact expected numeric value for the prompt's question, or None."""
                if line is None:
                    return None
                m, b = line
                if "y-intercept" in low or "y intercept" in low:
                    return y_intercept(m, b)
                if "x-intercept" in low or "x intercept" in low:
                    return x_intercept(m, b)
                wx = WHEN_X.search(prompt)
                # avoid matching the 'x' coefficient: WHEN_X requires 'x =', the eqn has 'x +'/'x -'
                if wx:
                    return eval_y(m, b, int(wx.group(1)))
                return None

            if t == "numeric":
                exp = expected_from_prompt()
                if exp is not None and exp != "none":
                    checked += 1
                    ok = (exp.denominator == 1
                          and F(str(w["answer"])) == exp
                          and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(F(str(e["value"])) != exp for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: expected {exp} "
                              f"authored {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif t == "mcq":
                checked += 1
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct options")
                    continue
                if line is not None:
                    m, b = line
                    want = None
                    if "slope" in low or "value of m" in low or "\u2019s m" in low or "read the slope" in low:
                        want = m
                    elif "y-intercept" in low or "value of b" in low or "y intercept" in low:
                        want = b
                    elif "x-intercept" in low or "x intercept" in low:
                        want = x_intercept(m, b)
                    if want is not None:
                        lab = label_to_frac(corr[0]["label"])
                        wv = "none" if want == "none" else want
                        if lab is not None and lab != wv:
                            fails += 1
                            print(f"  {lid}/{sid} mcq FAIL: correct label {corr[0]['label']!r} "
                                  f"parses {lab} but expected {wv}")
            elif t == "plotPoint":
                checked += 1
                tg = [(p["x"], p["y"]) for p in w["targets"]]
                if len(tg) >= 2:
                    if line is not None:
                        m, b = line
                        for p in tg:
                            if not point_on_line(p, m, b):
                                fails += 1
                                print(f"  {lid}/{sid} plotPoint FAIL: target {p} not on stated line y={m}x+{b}")
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
            elif t == "buildExpression":
                checked += 1
                lab = {tk["id"]: tk["label"] for tk in w["tokens"]}
                built = "".join(lab[i] for i in w["correct"])
                pl = parse_line(built)
                # target stated in the prompt: "slope S ... y-intercept B"
                ms = re.search(r"slope\s+(?:of\s+)?(-?\d+(?:/\d+)?)", low)
                bs = re.search(r"y-intercept\s+(?:of\s+)?(-?\d+(?:/\d+)?)", low)
                if pl is None:
                    fails += 1
                    print(f"  {lid}/{sid} buildExpression FAIL: correct build {built!r} doesn't parse as a line")
                elif ms and bs:
                    tgt = (_frac(ms.group(1)), _frac(bs.group(1)))
                    if pl != tgt:
                        fails += 1
                        print(f"  {lid}/{sid} buildExpression FAIL: built {pl} but prompt wants {tgt}")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right labels not distinct")
                llab = {i["id"]: i["label"] for i in w["left"]}
                rlab = {i["id"]: i["label"] for i in w["right"]}
                for a, b in w["pairs"].items():
                    pl = parse_line(llab[a])
                    if pl is None:
                        continue
                    mm, bb = pl
                    want = label_to_frac(rlab[b])
                    # match target may be slope OR y-intercept depending on the prompt
                    if want is not None and want not in (mm, bb):
                        fails += 1
                        print(f"  {lid}/{sid} matchPairs WARN: {llab[a]!r}->{rlab[b]!r} label {want} "
                              f"is neither slope {mm} nor intercept {bb}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
