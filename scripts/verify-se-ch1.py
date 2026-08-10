#!/usr/bin/env python3
"""Independent re-derivation of systems-equations Chapter 1 (Solving by Graphing).

Reuses the exact-Fraction line toolkit and EXTENDS + SELF-TESTS a 2x2 system solver:
  parse_lines(s) -> [(m,b), ...]   (find ALL "y = m x + b" in a prompt/label)
  solve_system((m1,b1),(m2,b2)) -> ('one',(x,y)) | ('none',) | ('infinite',)
      m1 != m2            -> one solution at x = (b2-b1)/(m1-m2), y = m1*x + b1
      m1 == m2, b1 == b2  -> infinite (same line)
      m1 == m2, b1 != b2  -> none (parallel)
Content pass re-derives intersection coordinates, verifies solution/candidate points,
and checks classification (one/none/infinite) for mcq and matchPairs.
"""
import json, glob, re, sys
from fractions import Fraction as F


def point_on_line(pt, m, b):
    x, y = pt
    return F(y) == F(m) * F(x) + F(b)


def _frac(tok):
    t = (tok or "").strip().replace("\u2212", "-").replace(" ", "")
    if t == "":
        return None
    if "/" in t:
        n, d = t.split("/")
        return F(int(n), int(d))
    return F(int(t))


LINE_FIND = re.compile(r"y\s*=\s*([+-]?\s*(?:\d+/\d+|\d*))\s*x\s*([+-]\s*(?:\d+/\d+|\d+))?", re.I)


def parse_lines(s):
    s2 = s.replace("\u2212", "-").replace("(", "").replace(")", "")
    out = []
    for m in LINE_FIND.finditer(s2):
        mtok = (m.group(1) or "").replace(" ", "")
        slope = F(1) if mtok in ("", "+") else F(-1) if mtok == "-" else _frac(mtok)
        btok = (m.group(2) or "").replace(" ", "")
        b = _frac(btok) if btok else F(0)
        out.append((slope, b))
    return out


def solve_system(l1, l2):
    (m1, b1), (m2, b2) = l1, l2
    if m1 == m2:
        return ("infinite",) if b1 == b2 else ("none",)
    x = (b2 - b1) / (m1 - m2)
    return ("one", (x, m1 * x + b1))


def parse_points(s):
    return [(int(a), int(b)) for a, b in
            re.findall(r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)", s.replace("\u2212", "-"))]


def parse_coord(s):
    m = re.search(r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)", s.replace("\u2212", "-"))
    return (int(m.group(1)), int(m.group(2))) if m else None


def label_yesno(lbl):
    s = lbl.strip().lower()
    if s.startswith("yes"):
        return "yes"
    if s.startswith("no"):
        return "no"
    return None


def label_class(lbl):
    s = lbl.strip().lower()
    if "infinite" in s:
        return "infinite"
    if "no solution" in s or "none" in s or "parallel" in s or "never" in s:
        return "none"
    if "one" in s or "exactly one" in s or "single" in s:
        return "one"
    return None


def _selftest():
    assert parse_lines("y = x + 1 and y = -x + 5") == [(F(1), F(1)), (F(-1), F(5))]
    assert parse_lines("y = 2x - 1 and y = x + 1") == [(F(2), F(-1)), (F(1), F(1))]
    assert parse_lines("y = (1/2)x + 3 and y = (1/2)x - 1") == [(F(1, 2), F(3)), (F(1, 2), F(-1))]
    assert solve_system((F(1), F(1)), (F(-1), F(5))) == ("one", (F(2), F(3)))
    assert solve_system((F(2), F(0)), (F(1), F(3))) == ("one", (F(3), F(6)))
    assert solve_system((F(-1), F(4)), (F(2), F(-5))) == ("one", (F(3), F(1)))
    assert solve_system((F(3), F(-4)), (F(1), F(2))) == ("one", (F(3), F(5)))
    assert solve_system((F(1), F(-1)), (F(-2), F(8))) == ("one", (F(3), F(2)))
    assert solve_system((F(2), F(1)), (F(-1), F(7))) == ("one", (F(2), F(5)))
    assert solve_system((F(2), F(1)), (F(2), F(-3))) == ("none",)
    assert solve_system((F(4), F(2)), (F(4), F(2))) == ("infinite",)
    assert solve_system((F(1, 2), F(3)), (F(1, 2), F(-1))) == ("none",)
    assert point_on_line((2, 3), 1, 1) and not point_on_line((1, 3), 1, 1)
    print("  self-test: 2x2 system solve / classify toolkit OK")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/systems-equations/lessons/se-01-*.json")):
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
            lines = parse_lines(prompt)
            cand = parse_points(prompt)
            sol = solve_system(lines[0], lines[1]) if len(lines) >= 2 else None

            if t == "numeric" and sol and sol[0] == "one":
                x, y = sol[1]
                exp = None
                if "x-coordinate" in low or "x coordinate" in low or "x-coord" in low:
                    exp = x
                elif "y-coordinate" in low or "y coordinate" in low or "y-coord" in low:
                    exp = y
                if exp is not None and exp.denominator == 1:
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
                if sol and "solution" in low and len(cand) == 1:
                    both = point_on_line(cand[0], *lines[0]) and point_on_line(cand[0], *lines[1])
                    yn = label_yesno(clab)
                    if yn is not None and yn != ("yes" if both else "no"):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: is-solution {cand[0]} both={both} label={yn}")
                elif sol and ("how many" in low or "solution" in low.split("?")[0]) and label_class(clab):
                    if label_class(clab) != sol[0]:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: class label {label_class(clab)} exp {sol[0]}")
                elif sol and sol[0] == "one" and parse_coord(clab):
                    if parse_coord(clab) != tuple(int(v) for v in sol[1]):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: solution pt {parse_coord(clab)} exp {sol[1]}")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right not distinct")
                llab = {i["id"]: i["label"] for i in w["left"]}
                rlab = {i["id"]: i["label"] for i in w["right"]}
                for a, b in w["pairs"].items():
                    ls = parse_lines(llab[a])
                    rc = label_class(rlab[b])
                    if len(ls) >= 2 and rc is not None:
                        if solve_system(ls[0], ls[1])[0] != rc:
                            fails += 1
                            print(f"  {lid}/{sid} matchPairs FAIL: {llab[a]!r} class "
                                  f"{solve_system(ls[0], ls[1])[0]} != {rc}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
