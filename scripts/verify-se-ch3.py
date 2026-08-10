#!/usr/bin/env python3
"""Independent re-derivation of systems-equations Chapter 3 (Elimination).

Extends the Ch1 toolkit with a GENERAL 2x2 solver that accepts both forms and
SELF-TESTS before authoring:
  parse_equation("y = m x + b" | "a x + b y = c") -> (A, B, C)   meaning A*x + B*y = C
      y = m x + b       -> (-m, 1, b)
      a x + b y = c     -> (a, b, c)
  parse_system(s) -> [(A,B,C), ...]  (all equations found in a prompt/label)
  solve_general((A1,B1,C1),(A2,B2,C2)) -> ('one',(x,y)) | ('none',) | ('infinite',)
      via exact-Fraction Cramer: det = A1B2 - A2B1
Content pass re-derives the solved x/y (integer), solution points (mcq/matchPairs).
"""
import json, glob, re, sys
from fractions import Fraction as F


def _frac(tok):
    t = (tok or "").strip().replace("\u2212", "-").replace(" ", "")
    if t == "":
        return None
    if "/" in t:
        n, d = t.split("/")
        return F(int(n), int(d))
    return F(int(t))


LINE_FIND = re.compile(r"y\s*=\s*([+-]?\s*(?:\d+/\d+|\d*))\s*x\s*([+-]\s*(?:\d+/\d+|\d+))?", re.I)
STD_FIND = re.compile(r"([+-]?\d*)\s*x\s*([+-]\s*\d*)\s*y\s*=\s*(-?\d+)")


def _line_abc(m):
    mtok = (m.group(1) or "").replace(" ", "")
    slope = F(1) if mtok in ("", "+") else F(-1) if mtok == "-" else _frac(mtok)
    btok = (m.group(2) or "").replace(" ", "")
    b = _frac(btok) if btok else F(0)
    return (-slope, F(1), b)


def _std_abc(m):
    atok, btok, ctok = m.group(1), m.group(2).replace(" ", ""), m.group(3)
    A = F(1) if atok in ("", "+") else F(-1) if atok == "-" else F(int(atok))
    B = F(1) if btok == "+" else F(-1) if btok == "-" else F(int(btok))
    return (A, B, F(int(ctok)))


def parse_system(s):
    s2 = s.replace("\u2212", "-")
    eqs = [_line_abc(m) for m in LINE_FIND.finditer(s2.replace("(", "").replace(")", ""))]
    eqs += [_std_abc(m) for m in STD_FIND.finditer(s2)]
    return eqs


def solve_general(e1, e2):
    (A1, B1, C1), (A2, B2, C2) = e1, e2
    det = A1 * B2 - A2 * B1
    if det == 0:
        same = (A1 * C2 == A2 * C1) and (B1 * C2 == B2 * C1)
        return ("infinite",) if same else ("none",)
    x = (C1 * B2 - C2 * B1) / det
    y = (A1 * C2 - A2 * C1) / det
    return ("one", (x, y))


def solve_prompt(s):
    eqs = parse_system(s)
    return solve_general(eqs[0], eqs[1]) if len(eqs) >= 2 else None


def parse_coord(s):
    m = re.search(r"\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)", s.replace("\u2212", "-"))
    return (int(m.group(1)), int(m.group(2))) if m else None


def label_class(lbl):
    t = lbl.strip().lower()
    if "infinite" in t:
        return "infinite"
    if "no solution" in t or "none" in t or "parallel" in t or "never" in t:
        return "none"
    if "one" in t or "single" in t:
        return "one"
    return None


def _selftest():
    P = parse_system
    S = solve_general
    def one(s):
        e = P(s); r = S(e[0], e[1]); assert r[0] == "one", (s, r); return r[1]
    assert one("y = 2x - 1 and 3x + y = 9") == (F(2), F(3))
    assert one("y = x + 1 and x + y = 7") == (F(3), F(4))
    assert one("y = 3x and 2x + y = 10") == (F(2), F(6))
    assert one("y = 2x and x + y = 9") == (F(3), F(6))
    assert one("y = x - 2 and 2x + y = 10") == (F(4), F(2))
    assert one("y = 4x and x + y = 10") == (F(2), F(8))
    assert one("x + y = 8 and 3x - y = 4") == (F(3), F(5))
    assert one("x - y = 1 and 2x + y = 8") == (F(3), F(2))
    assert one("x + 2y = 8 and x - y = 2") == (F(4), F(2))
    assert one("x + y = 9 and 2x - y = 6") == (F(5), F(4))
    assert one("x - y = 2 and x + 2y = 11") == (F(5), F(3))
    assert one("y = 2x - 3 and x + y = 9") == (F(4), F(5))
    assert one("y = x + 2 and x + y = 8") == (F(3), F(5))
    assert one("y = x - 1 and 2x + y = 11") == (F(4), F(3))
    assert one("x + y = 10 and y = 3x + 2") == (F(2), F(8))
    assert one("2x + y = 7 and y = x - 2") == (F(3), F(1))
    assert one("x + y = 6 and y = 2x") == (F(2), F(4))
    assert one("x + 2y = 12 and y = x - 3") == (F(6), F(3))
    assert one("y = 3x - 5 and x + y = 7") == (F(3), F(4))
    assert one("x + 2y = 11 and 3x + y = 13") == (F(3), F(4))
    # degenerate
    assert S(P("y = 2x + 1")[0], P("y = 2x - 3")[0]) == ("none",)
    assert S(P("y = 4x + 2")[0], P("y = 4x + 2")[0]) == ("infinite",)
    # Ch3 elimination systems (one-solution)
    assert one("x + y = 8 and x - y = 2") == (F(5), F(3))
    assert one("3x + y = 10 and x - y = 2") == (F(3), F(1))
    assert one("2x + y = 9 and x + y = 6") == (F(3), F(3))
    assert one("2x + 3y = 13 and 2x + y = 7") == (F(2), F(3))
    assert one("x + 2y = 11 and x - 2y = -5") == (F(3), F(4))
    assert one("4x + y = 14 and 2x + y = 8") == (F(3), F(2))
    assert one("2x + y = 7 and x + 3y = 11") == (F(2), F(3))
    assert one("x + 3y = 9 and 2x - y = 4") == (F(3), F(2))
    assert one("3x + 2y = 16 and x + y = 6") == (F(4), F(2))
    assert one("x + y = 5 and 2x + 3y = 12") == (F(3), F(2))
    assert one("2x + 3y = 12 and x - y = 1") == (F(3), F(2))
    assert one("2x + 3y = 13 and 3x + 2y = 12") == (F(2), F(3))
    assert one("3x + 4y = 10 and 2x + 3y = 7") == (F(2), F(1))
    assert one("4x + 3y = 18 and 3x + 2y = 13") == (F(3), F(2))
    assert one("5x + 2y = 16 and 3x + 4y = 18") == (F(2), F(3))
    # special cases (none / infinite)
    assert S(P("2x + y = 5")[0], P("4x + 2y = 3")[0]) == ("none",)
    assert S(P("x + y = 3")[0], P("2x + 2y = 6")[0]) == ("infinite",)
    print("  self-test: general 2x2 (line+standard) solver OK")


def main():
    _selftest()
    fails = 0
    checked = 0
    for f in sorted(glob.glob("content/courses/systems-equations/lessons/se-03-*.json")):
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
            sol = solve_prompt(prompt)
            askx = any(k in low for k in ["x-coordinate", "value of x", "what is x", "solve for x"])
            asky = any(k in low for k in ["y-coordinate", "value of y", "what is y", "solve for y"])

            if t == "numeric" and sol and sol[0] == "one":
                x, y = sol[1]
                exp = x if askx else y if asky else None
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
                if sol and sol[0] == "one" and parse_coord(clab):
                    if parse_coord(clab) != tuple(int(v) for v in sol[1]):
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: solution {parse_coord(clab)} exp {sol[1]}")
                elif sol and sol[0] in ("none", "infinite") and label_class(clab):
                    if label_class(clab) != sol[0]:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL: class {label_class(clab)} exp {sol[0]}")
            elif t == "matchPairs":
                checked += 1
                if len(set(i["label"] for i in w["right"])) != len(w["right"]):
                    fails += 1
                    print(f"  {lid}/{sid} matchPairs FAIL: right not distinct")
                llab = {i["id"]: i["label"] for i in w["left"]}
                rlab = {i["id"]: i["label"] for i in w["right"]}
                for a, b in w["pairs"].items():
                    r = solve_prompt(llab[a])
                    rc = parse_coord(rlab[b])
                    if r and r[0] == "one" and rc is not None:
                        if tuple(int(v) for v in r[1]) != rc:
                            fails += 1
                            print(f"  {lid}/{sid} matchPairs FAIL: {llab[a]!r} -> {r[1]} != {rc}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
