#!/usr/bin/env python3
"""Independent re-derivation of linear-functions Chapter 3 (Point-Slope & Standard Form).

Reuses the Ch1/Ch2 symbolic toolkit (exact Fraction) and EXTENDS it, SELF-TESTED first.
  parse_line("y = m x + b")             -> (m, b)                       (Ch2)
  parse_point_slope("y - k = m(x - h)") -> (m, (h, k))  simplified signed form
  ps_to_b(m, h, k)                      -> b = k - m*h
  parse_standard("A x + B y = C")       -> (A, B, C) ints
  std_slope/std_xint/std_yint           -> -A/B , C/A , C/B  (exact Fraction)
  si_to_standard(m, b)                  -> (A,B,C) normalized A>=0, gcd 1  (Ch1)
Content pass re-derives numeric answers and checks mcq/buildExpression/matchPairs
semantics for point-slope reads, conversions, and standard-form intercepts/slope.
"""
import json, glob, re, sys
from fractions import Fraction as F
from math import gcd


def slope(p1, p2):
    (x1, y1), (x2, y2) = p1, p2
    if x2 == x1:
        raise ZeroDivisionError("vertical")
    return F(y2 - y1, x2 - x1)


def line_through(p1, p2):
    m = slope(p1, p2)
    (x1, y1) = p1
    return m, F(y1) - m * F(x1)


def point_on_line(pt, m, b):
    x, y = pt
    return F(y) == m * F(x) + b


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


def ps_to_b(m, h, k):
    return F(k) - F(m) * F(h)


def std_slope(A, B):
    return F(-A, B)


def std_xint(A, C):
    return F(C, A)


def std_yint(B, C):
    return F(C, B)


def _frac(tok):
    if tok is None:
        return None
    t = tok.strip().replace("\u2212", "-").replace(" ", "")
    if t == "":
        return None
    if "/" in t:
        n, d = t.split("/")
        return F(int(n), int(d))
    return F(int(t))


LINE_RE = re.compile(r"y\s*=\s*([+-]?\s*(?:\d+/\d+|\d*))\s*x\s*([+-]\s*(?:\d+/\d+|\d+))?", re.I)


def parse_line(s):
    s2 = s.replace("\u2212", "-").replace("(", "").replace(")", "")
    m = LINE_RE.search(s2)
    if not m:
        return None
    mtok = m.group(1).replace(" ", "") if m.group(1) is not None else ""
    slope_m = F(1) if mtok in ("", "+") else F(-1) if mtok == "-" else _frac(mtok)
    btok = m.group(2).replace(" ", "") if m.group(2) else ""
    b = _frac(btok) if btok else F(0)
    return slope_m, b


PS_RE = re.compile(r"y\s*([+-])\s*(\d+)\s*=\s*(-?\d+)\s*\(\s*x\s*([+-])\s*(\d+)\s*\)")


def parse_point_slope(s):
    s2 = s.replace("\u2212", "-")
    m = PS_RE.search(s2)
    if not m:
        return None
    ysign, yabs, mm, xsign, xabs = m.groups()
    k = int(yabs) if ysign == "-" else -int(yabs)
    h = int(xabs) if xsign == "-" else -int(xabs)
    return F(int(mm)), (h, k)


STD_RE = re.compile(r"(-?\d*)\s*x\s*([+-]\s*\d*)\s*y\s*=\s*(-?\d+)")


def parse_standard(s):
    s2 = s.replace("\u2212", "-").replace(" ", "")
    m = STD_RE.search(s2)
    if not m:
        return None
    atok, btok, ctok = m.groups()
    A = 1 if atok in ("", "+") else -1 if atok == "-" else int(atok)
    B = 1 if btok == "+" else -1 if btok == "-" else int(btok)
    C = int(ctok)
    return A, B, C


def parse_coord(s):
    m = re.search(r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)", s.replace("\u2212", "-"))
    return (int(m.group(1)), int(m.group(2))) if m else None


def label_to_frac(lbl):
    s = lbl.strip().lower().replace("\u2212", "-").replace(" ", "")
    if s in ("undefined", "noslope", "none"):
        return "none"
    mm = re.fullmatch(r"\(?(-?\d+)/(-?\d+)\)?", s)
    if mm:
        return F(int(mm.group(1)), int(mm.group(2)))
    mm = re.fullmatch(r"-?\d+", s)
    if mm:
        return F(int(s))
    return None


def _selftest():
    assert parse_point_slope("y - 5 = 3(x - 2)") == (F(3), (2, 5))
    assert parse_point_slope("y + 2 = 4(x - 3)") == (F(4), (3, -2))
    assert parse_point_slope("y + 1 = 2(x - 5)") == (F(2), (5, -1))
    assert parse_point_slope("y - 4 = -2(x + 3)") == (F(-2), (-3, 4))
    assert ps_to_b(2, 1, 3) == F(1)
    assert ps_to_b(3, 2, -4) == F(-10)
    assert ps_to_b(4, 2, 1) == F(-7)
    assert ps_to_b(-3, 1, 2) == F(5)
    assert ps_to_b(2, 3, 7) == F(1)
    assert parse_standard("2x - y = 5") == (2, -1, 5)
    assert parse_standard("3x + 2y = 12") == (3, 2, 12)
    assert parse_standard("x - 2y = -6") == (1, -2, -6)
    assert parse_standard("6x + 2y = 10") == (6, 2, 10)
    assert std_slope(3, 2) == F(-3, 2)
    assert std_xint(3, 12) == F(4) and std_yint(2, 12) == F(6)
    assert std_slope(6, 2) == F(-3)
    assert std_xint(4, 20) == F(5) and std_yint(5, 20) == F(4)
    assert si_to_standard(F(2), F(-5)) == (2, -1, 5)
    assert si_to_standard(F(2), F(3)) == (2, -1, -3)
    assert parse_line("y = 2x + 1") == (F(2), F(1))
    print("  self-test: point-slope / conversion / standard toolkit OK")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/linear-functions/lessons/lf-03-*.json")):
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
            low = prompt.lower()
            ps = parse_point_slope(prompt)
            std = parse_standard(prompt)
            sl = parse_line(prompt)

            if t == "numeric":
                exp = None
                if ps and ("b" in low or "y-intercept" in low or "slope-intercept" in low):
                    m, (h, k) = ps
                    exp = ps_to_b(m, h, k)
                elif std:
                    A, B, C = std
                    if "x-intercept" in low:
                        exp = std_xint(A, C)
                    elif "y-intercept" in low:
                        exp = std_yint(B, C)
                    elif "slope" in low:
                        exp = std_slope(A, B)
                if exp is not None and exp != "none":
                    checked += 1
                    ok = (exp.denominator == 1
                          and F(str(w["answer"])) == exp
                          and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(F(str(e["value"])) != exp for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: expected {exp} authored {w['answer']} "
                              f"traps {[e['value'] for e in w['commonErrors']]}")
            elif t == "mcq":
                checked += 1
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct options")
                    continue
                clab = corr[0]["label"]
                if ps and ("point" in low or "pass" in low or "through" in low):
                    _, pt = ps
                    got = parse_coord(clab)
                    if got is not None and got != pt:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: point {clab!r}={got} but eqn point {pt}")
                elif ps and "slope" in low:
                    m, _ = ps
                    lf = label_to_frac(clab)
                    if lf is not None and lf != m:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: slope {clab!r}={lf} but eqn slope {m}")
                elif ps and clab.replace(" ", "").startswith("y="):
                    m, (h, k) = ps
                    want = (m, ps_to_b(m, h, k))
                    got = parse_line(clab)
                    if got is not None and got != want:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: SI {clab!r}={got} but converts to {want}")
                elif sl and parse_standard(clab):
                    m, b = sl
                    want = si_to_standard(m, b)
                    got = parse_standard(clab)
                    if got != want:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: standard {clab!r}={got} but si_to_standard {want}")
                elif std and "slope" in low:
                    A, B, C = std
                    lf = label_to_frac(clab)
                    if lf is not None and lf != std_slope(A, B):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: slope {clab!r}={lf} but standard slope {std_slope(A, B)}")
            elif t == "buildExpression":
                checked += 1
                lab = {tk["id"]: tk["label"] for tk in w["tokens"]}
                built = "".join(lab[i] for i in w["correct"])
                pb = parse_point_slope(built)
                ptp = parse_coord(prompt)
                msl = re.search(r"slope\s+(-?\d+)", low)
                if pb is None:
                    fails += 1
                    print(f"  {lid}/{sid} buildExpression FAIL: {built!r} not point-slope")
                elif ptp is not None and msl is not None:
                    want = (F(int(msl.group(1))), ptp)
                    if pb != want:
                        fails += 1
                        print(f"  {lid}/{sid} buildExpression FAIL: built {pb} but wants {want}")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right labels not distinct")
                llab = {i["id"]: i["label"] for i in w["left"]}
                rlab = {i["id"]: i["label"] for i in w["right"]}
                for a, b in w["pairs"].items():
                    pb = parse_point_slope(llab[a])
                    rc = parse_coord(rlab[b])
                    if pb is not None and rc is not None and pb[1] != rc:
                        fails += 1
                        print(f"  {lid}/{sid} matchPairs FAIL: {llab[a]!r}->{rlab[b]!r} (pt {pb[1]} vs {rc})")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
