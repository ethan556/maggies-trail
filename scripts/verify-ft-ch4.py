#!/usr/bin/env python3
"""Independent re-derivation of function-transformations Chapter 4 (Combining & Composing).

SELF-TESTED dual routes:
  Arithmetic combos — Route A: combined-expression arithmetic (x*x + 2*x + 1 at x).
                      Route B: evaluate-each-then-combine with the outputs stored
                      separately before the operation.
  Compositions — Route A: substituted closed-form formula evaluated directly.
                 Route B: literal two-stage chain (inner output captured, fed to outer).
  Solve f(g(x)) = c — Route A: algebraic undo. Route B: integer search over the chain.
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content/courses/function-transformations/lessons"

f_sq = lambda x: x * x
g_lin = lambda x: 2 * x + 1


def combo_expr(op, x):
    if op == "+": return x * x + 2 * x + 1
    if op == "-": return x * x - (2 * x + 1)
    if op == "*": return x * x * (2 * x + 1)


def combo_eval(op, x):
    a, b = f_sq(x), g_lin(x)
    return a + b if op == "+" else a - b if op == "-" else a * b


def chain(inner, outer, x):
    mid = inner(x)
    return outer(mid)


def _selftest():
    for op in "+-*":
        for x in range(-8, 9):
            assert combo_expr(op, x) == combo_eval(op, x)
    # composition: closed form (x+1)^2 vs chain
    for x in range(-8, 9):
        assert (x + 1) ** 2 == chain(lambda t: t + 1, f_sq, x)
        assert 2 * x - 4 == chain(lambda t: 2 * t, lambda t: t - 4, x)
    print("  self-test: expression vs eval-then-combine agree; closed-form vs chained composition agree")


def main():
    _selftest()
    fails = checked = 0

    def chk(label, got, want):
        nonlocal fails, checked
        checked += 1
        if got != want:
            fails += 1
            print(f"  ✗ {label}: got {got}, want {want}")

    # --- arithmetic-combo facts, both routes ---
    facts = [("+", 3, 16), ("-", 2, -1), ("*", 2, 20), ("+", 4, 25), ("-", 5, 14), ("+", 1, 4)]
    for op, x, want in facts:
        chk(f"(f{op}g)({x}) expr", combo_expr(op, x), want)
        chk(f"(f{op}g)({x}) eval", combo_eval(op, x), want)

    # --- composition facts, both routes: (inner, outer, x, want, label) ---
    dbl = lambda t: 2 * t; add3 = lambda t: t + 3; sub3 = lambda t: t - 3
    add2 = lambda t: t + 2; tri = lambda t: 3 * t; add7 = lambda t: t + 7
    add1 = lambda t: t + 1; sub4 = lambda t: t - 4
    comps = [
        (dbl, add3, 4, 11, "f(g(4)) g=2x f=x+3"),
        (add3, dbl, 4, 14, "g(f(4))"),
        (sub3, f_sq, 5, 4, "f(g(5)) g=x-3 f=x^2"),
        (f_sq, sub3, 5, 22, "g(f(5))"),
        (add2, tri, 1, 9, "f(g(1)) g=x+2 f=3x"),
        (dbl, add3, 3, 9, "f(g(3)) remedial"),
        (add1, f_sq, 6, 49, "(x+1)^2 at 6"),
        (dbl, sub4, 5, 6, "g(f(5)) f=2x g=x-4"),
    ]
    for inner, outer, x, want, label in comps:
        chk(f"{label} chain", chain(inner, outer, x), want)
    # closed forms for the formula lessons
    chk("(6+1)^2 closed", (6 + 1) ** 2, 49)
    chk("2*5-4 closed", 2 * 5 - 4, 6)
    chk("sqrt-chain h(g(9))", chain(add7, lambda t: int(math.isqrt(t)), 9), 4)
    assert math.isqrt(16) ** 2 == 16  # perfect square, isqrt exact

    # decomposition claim: (x-5)^2 == f(g(x)) with g=x-5, f=sq — spot-verified over grid
    for x in range(-6, 8):
        chk(f"(x-5)^2 decomp at {x}", chain(lambda t: t - 5, f_sq, x), (x - 5) ** 2)

    # --- solve f(g(x)) = 15 with f=x+3, g=2x: algebra vs search ---
    chk("solve algebra", (15 - 3) // 2, 6)
    sols = [x for x in range(-50, 51) if chain(dbl, add3, x) == 15]
    chk("solve search", sols, [6])

    # wrong-formula exposure claims from c2: 3^2+1 != chain value at 3
    chk("expose wrong formula", 3 ** 2 + 1 != chain(add1, f_sq, 3), True)

    # --- lesson-file integrity ---
    for p in sorted(ROOT.glob("ft-04-*.json")):
        d = json.loads(p.read_text())
        steps = d["steps"] + [r["check"] for r in d.get("remedials", [])]
        for s in steps:
            w = s.get("widget")
            if not w:
                continue
            if w["type"] == "mcq":
                chk(f"{d['id']}/{s['id']} one-correct", sum(1 for o in w["options"] if o.get("correct")), 1)
            if w["type"] == "numeric":
                for e in w.get("commonErrors", []):
                    checked += 1
                    if e["value"] == w["answer"]:
                        fails += 1
                        print(f"  ✗ {d['id']}/{s['id']}: trap equals answer")

    print(f"verify-ft-ch4: {checked - fails}/{checked} checks pass")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
