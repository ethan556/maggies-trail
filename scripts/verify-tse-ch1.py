#!/usr/bin/env python3
"""Independent re-derivation of two-step-equations Chapter 1
(Distributing & Combining Like Terms with Rational Coefficients).

7.EE.1: apply properties of operations to distribute/combine linear expressions with
rational (incl. negative, fractional) coefficients. SELF-TESTED dual-route for algebraic
identities: the symbolic simplification rule (p(x+q) = px+pq; ax+bx = (a+b)x) is
cross-checked by EVALUATING both the original and simplified expression at several
distinct x-values using exact Fraction arithmetic -- if they agree at every test value,
the simplification is verified independently of the symbolic rule itself.
"""
import json, glob, re, sys
from fractions import Fraction as F


def distribute(p, q):
    """p(x+q) -> coefficient of x is p, constant term is p*q."""
    return p, p * q


def combine_like_terms(a, b):
    """ax + bx -> (a+b)x."""
    return a + b


def _selftest():
    test_xs = [F(0), F(1), F(2), F(-3), F(1, 2), F(-5, 2)]
    for p, q in [(F(-3), F(2)), (F(2), F(-5)), (F(-1, 2), F(4)), (F(3, 4), F(-2)), (F(-2), F(-6))]:
        coeff, const = distribute(p, q)
        for x in test_xs:
            original = p * (x + q)
            simplified = coeff * x + const
            assert original == simplified, (p, q, x, original, simplified)   # symbolic rule vs numeric evaluation
    for a, b in [(F(-3), F(5)), (F(2), F(-7)), (F(-1, 2), F(3, 2)), (F(4), F(-4))]:
        combined = combine_like_terms(a, b)
        for x in test_xs:
            original = a * x + b * x
            simplified = combined * x
            assert original == simplified, (a, b, x, original, simplified)   # symbolic rule vs numeric evaluation
    print("  self-test: distribute/combine toolkit OK (symbolic rule vs multi-point evaluation agree)")


def parse_frac_or_int(s):
    s = s.strip()
    neg = s.startswith("-")
    if neg:
        s = s[1:]
    if "/" in s:
        n, d = s.split("/")
        val = F(int(n), int(d))
    else:
        val = F(int(s))
    return -val if neg else val


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def coeff_label(c):
    """Format an x-coefficient the way standard notation does: omit an explicit 1."""
    if c == 1:
        return "x"
    if c == -1:
        return "-x"
    return f"{frac_label(c)}x"


def parse_distribute(prompt):
    m = re.search(r"(-?\d+/?\d*)\(x\s*([+\-])\s*(\d+/?\d*)\)", prompt)
    if not m:
        return None
    p = parse_frac_or_int(m.group(1))
    sign, qval = m.group(2), parse_frac_or_int(m.group(3))
    q = qval if sign == "+" else -qval
    coeff, const = distribute(p, q)
    return coeff, const


def parse_combine(prompt):
    m = re.search(r"(-?\d+/?\d*)x\s*([+\-])\s*(\d+/?\d*)x", prompt)
    if not m:
        return None
    a = parse_frac_or_int(m.group(1))
    sign, bval = m.group(2), parse_frac_or_int(m.group(3))
    b = bval if sign == "+" else -bval
    return combine_like_terms(a, b)


def parse_evaluate_at(prompt):
    m = re.search(r"evaluate (-?\d+)\(x\s*([+\-])\s*(\d+)\) at x\s*=\s*(-?\d+)", prompt.lower())
    if not m:
        return None
    p = parse_frac_or_int(m.group(1))
    sign, qval = m.group(2), parse_frac_or_int(m.group(3))
    q = qval if sign == "+" else -qval
    x = parse_frac_or_int(m.group(4))
    return p * (x + q)


def parse_distribute_then_combine(prompt):
    m = re.search(r"(-?\d+)\(x\s*([+\-])\s*(\d+)\)\s*([+\-])\s*(\d+)x", prompt)
    if not m:
        return None
    p = parse_frac_or_int(m.group(1))
    inner_sign, qval = m.group(2), parse_frac_or_int(m.group(3))
    q = qval if inner_sign == "+" else -qval
    outer_sign, rval = m.group(4), parse_frac_or_int(m.group(5))
    r = rval if outer_sign == "+" else -rval
    coeff, const = distribute(p, q)
    combined = combine_like_terms(coeff, r)
    return combined, const


def _selftest_parsers():
    assert parse_distribute("Distribute: -3(x + 2)") == (F(-3), F(-6))
    assert parse_distribute("Distribute: 2(x - 5)") == (F(2), F(-10))
    assert parse_combine("Simplify: -3x + 5x") == F(2)
    assert parse_combine("Simplify: 2x - 7x") == F(-5)
    assert parse_evaluate_at("Evaluate -3(x + 2) at x = 1") == -9
    assert parse_evaluate_at("Evaluate 2(x - 5) at x = 2") == -6
    assert parse_distribute_then_combine("Simplify: 2(x + 3) + 4x") == (F(6), F(6))
    assert parse_distribute_then_combine("Simplify: -2(x + 4) + 3x") == (F(1), F(-8))
    assert parse_distribute_then_combine("Simplify: -3(x - 2) + 5x") == (F(2), F(6))
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/two-step-equations/lessons/tse-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            dtc = parse_distribute_then_combine(prompt)
            dist = parse_distribute(prompt) if dtc is None else None
            comb = parse_combine(prompt) if dtc is None else None
            ev = parse_evaluate_at(prompt)
            if ev is not None and w["type"] == "numeric":
                checked += 1
                ok = (F(w["answer"]) == ev and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(F(e["value"]) != ev for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric(evaluate) FAIL want {ev} got {w['answer']}")
            elif dtc is not None and w["type"] == "mcq":
                coeff, const = dtc
                want_label = f"{coeff_label(coeff)} {'+' if const >= 0 else '-'} {frac_label(abs(const))}"
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip() != want_label:
                    fails += 1
                    print(f"  {lid}/{sid} mcq(distribute-combine) FAIL want {want_label!r} got {corr[0]['label']!r}")
            elif dist is not None and w["type"] == "mcq":
                coeff, const = dist
                want_label = f"{coeff_label(coeff)} {'+' if const >= 0 else '-'} {frac_label(abs(const))}"
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip() != want_label:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want_label!r} got {corr[0]['label']!r}")
            elif comb is not None and w["type"] == "mcq":
                want_label = coeff_label(comb)
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip() != want_label:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want_label!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
