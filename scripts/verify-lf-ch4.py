#!/usr/bin/env python3
"""Independent re-derivation of linear-functions Chapter 4 (Writing Equations of Lines).

Reuses the Ch1-3 exact-Fraction toolkit and EXTENDS + SELF-TESTS it:
  line_through(p1,p2) -> (m,b) ; point_on_line(pt,m,b)      (writes a line from two points)
  b_from_point_slope(m,(x1,y1)) = y1 - m*x1                 (line from a point + slope)
  parallel_slope(m)   = m                                   (equal slope)
  perp_slope(m)       = -1/m  (negative reciprocal; m1*m2 = -1)
  parse_line("y = m x + b") handles fractional m like 1/2   (Ch2)
Content pass parses two-point / point+slope / parallel / perpendicular / horizontal /
vertical prompts and re-derives every numeric answer, and checks mcq/buildExpression
final-equation and slope semantics (incl. exact fractional slope labels).
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


def b_from_point_slope(m, pt):
    x1, y1 = pt
    return F(y1) - F(m) * F(x1)


def parallel_slope(m):
    return F(m)


def perp_slope(m):
    return -1 / F(m)


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


COORD_RE = re.compile(r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)")


def parse_points(s):
    return [(int(a), int(b)) for a, b in COORD_RE.findall(s.replace("\u2212", "-"))]


SLOPEKW_RE = re.compile(r"slope\s+(-?\d+(?:/\d+)?)", re.I)


def parse_slope_kw(s):
    m = SLOPEKW_RE.search(s.replace("\u2212", "-"))
    if not m:
        return None
    t = m.group(1)
    return F(int(t.split("/")[0]), int(t.split("/")[1])) if "/" in t else F(int(t))


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


def label_hv(lbl):
    s = lbl.replace(" ", "").replace("\u2212", "-").lower()
    m = re.fullmatch(r"y=(-?\d+)", s)
    if m:
        return ("h", int(m.group(1)))
    m = re.fullmatch(r"x=(-?\d+)", s)
    if m:
        return ("v", int(m.group(1)))
    return None


def _selftest():
    assert line_through((1, 2), (3, 8)) == (F(3), F(-1))
    assert line_through((1, 1), (4, 10)) == (F(3), F(-2))
    assert line_through((-1, -1), (2, 5)) == (F(2), F(1))
    assert line_through((1, 2), (3, 5)) == (F(3, 2), F(1, 2))
    assert point_on_line((3, 8), F(3), F(-1)) and point_on_line((1, 2), F(3), F(-1))
    assert b_from_point_slope(2, (1, 5)) == F(3)
    assert b_from_point_slope(4, (2, 3)) == F(-5)
    assert b_from_point_slope(3, (-1, 2)) == F(5)
    assert b_from_point_slope(-1, (3, 4)) == F(7)
    assert b_from_point_slope(-2, (4, 1)) == F(9)
    assert b_from_point_slope(0, (2, 5)) == F(5)          # horizontal
    assert parallel_slope(2) == F(2) and parallel_slope(3) == F(3)
    assert perp_slope(2) == F(-1, 2)
    assert perp_slope(F(1, 2)) == F(-2)
    assert perp_slope(F(1, 3)) == F(-3)
    assert perp_slope(F(-1, 2)) == F(2)
    assert perp_slope(2) * F(2) == F(-1)                  # m1*m2 = -1
    # write parallel/perpendicular line through a point
    assert F(5) - parallel_slope(2) * 1 == F(3)           # (1,5) || slope2 -> b=3
    assert b_from_point_slope(perp_slope(F(1, 2)), (1, 3)) == F(5)  # (1,3) ⟂ slope1/2 -> b=5
    assert parse_line("y = (1/2)x + 4") == (F(1, 2), F(4))
    assert parse_line("y = 2x - 1") == (F(2), F(-1))
    print("  self-test: two-point / point-slope-line / parallel-perp toolkit OK")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/linear-functions/lessons/lf-04-*.json")):
        d = json.load(open(f))
        lid = d["id"]
        steps = [(s["id"], s.get("widget"), s.get("body", "")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget"), r["check"].get("body", ""))
                  for r in d.get("remedials", [])]
        for sid, w, _b in steps:
            if not w:
                continue
            t = w["type"]
            prompt = w.get("prompt", "")
            low = prompt.lower()
            pts = parse_points(prompt)
            msl = parse_slope_kw(prompt)
            pl = parse_line(prompt)

            # derive the (m, b) or slope this prompt is about
            ctx = None  # ('mb', m, b) | ('slope', m) | ('vert', h) | ('horiz', k)
            two = len(pts) == 2
            if "perpendicular" in low and pl is not None:
                pm = perp_slope(pl[0])
                if "b" in low or "y-intercept" in low:
                    if pts:
                        ctx = ("mb", pm, b_from_point_slope(pm, pts[0]))
                else:
                    ctx = ("slope", pm)
            elif "parallel" in low and pl is not None:
                pm = parallel_slope(pl[0])
                if "b" in low or "y-intercept" in low:
                    if pts:
                        ctx = ("mb", pm, b_from_point_slope(pm, pts[0]))
                else:
                    ctx = ("slope", pm)
            elif two and pts[0][0] == pts[1][0]:
                ctx = ("vert", pts[0][0])
            elif two:
                m, b = line_through(pts[0], pts[1])
                if "slope" in low and "b" not in low and "y-intercept" not in low and "equation" not in low and t == "numeric":
                    ctx = ("slope", m)
                else:
                    ctx = ("mb", m, b)
            elif len(pts) == 1 and msl is not None:
                if msl == 0:
                    ctx = ("horiz", pts[0][1])
                else:
                    ctx = ("mb", msl, b_from_point_slope(msl, pts[0]))

            if t == "numeric":
                exp = None
                if ctx and ctx[0] == "slope":
                    exp = ctx[1]
                elif ctx and ctx[0] == "mb" and ("b" in low or "y-intercept" in low):
                    exp = ctx[2]
                if exp is not None and getattr(exp, "denominator", 2) == 1:
                    checked += 1
                    ok = (F(str(w["answer"])) == exp and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2
                          and all(F(str(e["value"])) != exp for e in w["commonErrors"]))
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric FAIL: exp {exp} got {w['answer']} "
                              f"traps {[e['value'] for e in w['commonErrors']]}")
            elif t == "mcq":
                checked += 1
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL: {len(corr)} correct")
                    continue
                clab = corr[0]["label"]
                if ctx and ctx[0] == "slope":
                    lf = label_to_frac(clab)
                    if lf is not None and lf != ctx[1]:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: slope {clab!r}={lf} exp {ctx[1]}")
                elif ctx and ctx[0] == "mb" and parse_line(clab):
                    got = parse_line(clab)
                    if got != (ctx[1], ctx[2]):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: line {clab!r}={got} exp {(ctx[1], ctx[2])}")
                    elif not (point_on_line(pts[0], *got) if pts else True):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: {pts[0]} not on {got}")
                elif ctx and ctx[0] == "horiz":
                    hv = label_hv(clab)
                    if hv is not None and hv != ("h", ctx[1]):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: horiz {clab!r}={hv} exp ('h',{ctx[1]})")
                elif ctx and ctx[0] == "vert":
                    hv = label_hv(clab)
                    if hv is not None and hv != ("v", ctx[1]):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: vert {clab!r}={hv} exp ('v',{ctx[1]})")
            elif t == "buildExpression":
                checked += 1
                lab = {tk["id"]: tk["label"] for tk in w["tokens"]}
                built = "".join(lab[i] for i in w["correct"])
                got = parse_line(built)
                if ctx and ctx[0] == "mb":
                    if got is None or got != (ctx[1], ctx[2]):
                        fails += 1
                        print(f"  {lid}/{sid} buildExpression FAIL: built {got} exp {(ctx[1], ctx[2])}")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right labels not distinct")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
