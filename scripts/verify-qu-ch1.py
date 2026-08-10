#!/usr/bin/env python3
"""Independent re-derivation of quadratics Chapter 1 (Graphing Parabolas).

Exact-Fraction toolkit, SELF-TESTED. Parses vertex form y=a(x-h)^2+k and standard
form y=ax^2+bx+c; re-derives vertex (h,k) / axis and, for standard form, the vertex
via axis=-b/(2a) and y=f(axis). Dual-route: for standard forms that are perfect-square
translations, vertex from -b/2a is cross-checked against completing the square by hand
in the self-test. Content pass re-derives the asked vertex x / vertex y / axis (integers).
"""
import json, glob, re, sys
from fractions import Fraction as F


def norm(s):
    return s.replace("\u2212", "-").replace(" ", "")


def vertex_form(s):
    s = norm(s)
    m = re.search(r"y=(-?\d*)\(x([+-]\d+)\)\^2([+-]\d+)?", s)
    if m:
        a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
        h = -int(m.group(2))
        k = int(m.group(3)) if m.group(3) else 0
        return (a, h, k)
    m = re.search(r"y=(-?\d*)x\^2([+-]\d+)?$", s)   # y = x^2 + k  (vertex at 0,k)
    if m and "(" not in s:
        a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
        k = int(m.group(2)) if m.group(2) else 0
        return (a, 0, k)
    return None


def standard_form(s):
    s = norm(s)
    m = re.search(r"y=(-?\d*)x\^2([+-]\d+)x([+-]\d+)", s)
    if m:
        a = m.group(1); a = -1 if a == "-" else (1 if a in ("", "+") else int(a))
        return (a, int(m.group(2)), int(m.group(3)))
    return None


def axis_std(a, b):
    return F(-b, 2 * a)


def f_std(a, b, c, x):
    return a * x * x + b * x + c


def _selftest():
    assert vertex_form("y = (x - 3)^2 + 2") == (1, 3, 2)
    assert vertex_form("y = (x + 1)^2 - 4") == (1, -1, -4)
    assert vertex_form("y = -(x - 1)^2 + 3") == (-1, 1, 3)
    assert vertex_form("y = 2(x - 5)^2 + 1") == (2, 5, 1)
    assert vertex_form("y = (x - 2)^2") == (1, 2, 0)
    assert vertex_form("y = x^2 + 7") == (1, 0, 7)
    assert vertex_form("y = 2(x + 3)^2 - 1") == (2, -3, -1)
    assert vertex_form("y = -(x - 4)^2 - 6") == (-1, 4, -6)
    a, b, c = standard_form("y = x^2 - 6x + 5")
    assert (a, b, c) == (1, -6, 5) and axis_std(a, b) == 3 and f_std(a, b, c, 3) == -4
    a, b, c = standard_form("y = x^2 + 4x + 1")
    assert axis_std(a, b) == -2 and f_std(a, b, c, -2) == -3
    a, b, c = standard_form("y = x^2 - 2x - 3")
    assert axis_std(a, b) == 1 and f_std(a, b, c, 1) == -4
    a, b, c = standard_form("y = x^2 + 8x + 10")
    assert axis_std(a, b) == -4 and f_std(a, b, c, -4) == -6
    # dual route: y=x^2-6x+5 == (x-3)^2-4  -> vertex (3,-4) both ways
    assert vertex_form("y = (x - 3)^2 - 4") == (1, 3, -4)
    print("  self-test: parabola toolkit OK (vertex form + standard form, dual-route vertex)")


def _vertex_axis(prompt):
    vf = vertex_form(prompt)
    if vf:
        a, h, k = vf
        return h, k, F(h)
    sf = standard_form(prompt)
    if sf:
        a, b, c = sf
        ax = axis_std(a, b)
        return ax, f_std(a, b, c, ax), ax
    return None


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/quadratics/lessons/qu-01-*.json")):
        d = json.load(open(f))
        lid = d["id"]
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
            va = _vertex_axis(prompt)
            if va is None:
                continue
            vx, vy, ax = va
            want = None
            if "axis of symmetry" in low:
                want = ax
            elif "y-coordinate of the vertex" in low or "y-coordinate" in low:
                want = vy
            elif "x-coordinate of the vertex" in low or "x-coordinate" in low:
                want = F(vx)
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
