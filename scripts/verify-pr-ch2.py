#!/usr/bin/env python3
"""Independent re-derivation of proportional-relationships Chapter 2 (Is It Proportional?).

7.RP.2a-b: decide whether a table represents a proportional relationship, and if so find the
constant of proportionality k (where y = kx). SELF-TESTED dual-route: proportionality is
checked two genuinely different ways -- (a) all cross products x_i*y_j == x_j*y_i for every
pair, and (b) all ratios y_i/x_i (as exact Fractions) are equal. If both routes agree on every
test table, the check logic is sound.
"""
import json, glob, re, sys
from fractions import Fraction as F


def is_proportional_cross(pairs):
    """Route A: every pair of rows must satisfy x_i*y_j == x_j*y_i (cross products)."""
    for i in range(len(pairs)):
        for j in range(i + 1, len(pairs)):
            xi, yi = pairs[i]; xj, yj = pairs[j]
            if xi * yj != xj * yi:
                return False
    return True


def is_proportional_ratio(pairs):
    """Route B: every ratio y/x (exact Fraction) must be identical."""
    ratios = {F(y, x) for x, y in pairs}
    return len(ratios) == 1


def constant_of_proportionality(pairs):
    return F(pairs[0][1], pairs[0][0])


def _selftest():
    prop_tables = [
        [(2, 6), (3, 9), (5, 15)],           # k=3
        [(1, 4), (2, 8), (10, 40)],          # k=4
        [(3, 2), (6, 4), (9, 6)],            # k=2/3
    ]
    non_prop_tables = [
        [(2, 6), (3, 10), (5, 15)],          # breaks at row 2
        [(1, 4), (2, 9), (3, 12)],
    ]
    for t in prop_tables:
        a, b = is_proportional_cross(t), is_proportional_ratio(t)
        assert a == b == True, (t, a, b)     # two routes agree: proportional
    for t in non_prop_tables:
        a, b = is_proportional_cross(t), is_proportional_ratio(t)
        assert a == b == False, (t, a, b)    # two routes agree: not proportional
    assert constant_of_proportionality([(2, 6), (3, 9), (5, 15)]) == 3
    assert constant_of_proportionality([(3, 2), (6, 4), (9, 6)]) == F(2, 3)
    print("  self-test: proportionality toolkit OK (cross-products vs equal-ratios agree)")


def parse_table(prompt):
    """Parse '(x1, y1), (x2, y2), (x3, y3)' style pairs out of a prompt."""
    pairs = re.findall(r"\((\d+),\s*(\d+)\)", prompt)
    if len(pairs) < 2:
        return None
    return [(int(x), int(y)) for x, y in pairs]


def _selftest_parsers():
    t = parse_table("A table has pairs (2, 6), (3, 9), (5, 15). Is this proportional?")
    assert t == [(2, 6), (3, 9), (5, 15)]
    assert parse_explicit_k_and_x("A proportional table has constant of proportionality 3. When x = 10, what is y?") == 30
    assert parse_explicit_k_and_x("A proportional table has constant of proportionality 4. When x = 5, what is y?") == 20
    print("  self-test: prompt parsers OK")


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def parse_explicit_k_and_x(prompt):
    """Pattern C: 'constant of proportionality N[/D]. When x = X, what is y?' -- k stated
    directly as a literal number, no table involved."""
    m = re.search(r"constant of proportionality (\d+)(?:/(\d+))?\. when x = (\d+), what is y", prompt.lower())
    if not m:
        return None
    kn, kd, x = m.group(1), m.group(2), int(m.group(3))
    k = F(int(kn), int(kd)) if kd else F(int(kn))
    return k * x


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/proportional-relationships/lessons/pr-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            low = prompt.lower()
            pairs = parse_table(prompt)

            # Pattern C: k stated explicitly, no table -- check this FIRST, before pairs-based logic.
            explicit = parse_explicit_k_and_x(prompt)
            if explicit is not None and w["type"] == "numeric":
                checked += 1
                ok = (F(w["answer"]) == explicit and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2)
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric(explicit-k) FAIL want {explicit} got {w['answer']}")
                continue

            if pairs is None:
                continue

            # Pattern A: "is this proportional?" (mcq yes/no)
            if w["type"] == "mcq" and "is this proportional" in low:
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                a, b = is_proportional_cross(pairs), is_proportional_ratio(pairs)
                assert a == b, (lid, sid, "verifier routes disagree", pairs)
                want = "yes" if a else "no"
                if want not in corr[0]["label"].strip().lower():
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want!r} got {corr[0]['label']!r}")

            # Pattern B: "what is the constant of proportionality?" (numeric or mcq, from a table)
            elif "what is the constant of proportionality" in low:
                if not is_proportional_cross(pairs):
                    continue
                want = constant_of_proportionality(pairs)
                checked += 1
                if w["type"] == "numeric":
                    ok = (F(w["answer"]) == want and w["tolerance"] == 0
                          and len(w["commonErrors"]) >= 2)
                    if not ok:
                        fails += 1
                        print(f"  {lid}/{sid} numeric(k) FAIL want {want} got {w['answer']}")
                elif w["type"] == "mcq":
                    corr = [o for o in w["options"] if o.get("correct")]
                    if len(corr) != 1:
                        fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                    if corr[0]["label"].strip() != frac_label(want):
                        fails += 1
                        print(f"  {lid}/{sid} mcq(k) FAIL want {frac_label(want)!r} got {corr[0]['label']!r}")

            # Pattern D: "using the constant of proportionality, what is y when x = X?" (derive k from table, then y=kx)
            elif "using the constant of proportionality" in low and w["type"] == "numeric":
                mx = re.search(r"what is y when x = (\d+)", low)
                if not mx or not is_proportional_cross(pairs):
                    continue
                k = constant_of_proportionality(pairs)
                want = k * int(mx.group(1))
                checked += 1
                ok = (F(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2)
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric(y-from-k) FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
