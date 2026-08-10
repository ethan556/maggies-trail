#!/usr/bin/env python3
"""Independent re-derivation of radicals-and-exponents Chapter 2 (Operations).

Exact integer arithmetic, SELF-TESTED. Reuses simplify(n). Parses c√r terms and either
adds/subtracts like radicals (simplify each term, combine when radicands match) or
multiplies (c1√r1 · c2√r2 = c1·c2·√(r1·r2), then simplify). DUAL-ROUTE: products are
cross-checked by squaring the reported result against the product of the term-squares in
the self-test. Content pass re-derives the asked integer (combined coefficient a, product
coefficient a, or an integer product value).
"""
import json, glob, re, sys

RT = "\u221a"


def simplify(n):
    a, d = 1, 1
    while d * d <= n:
        if n % (d * d) == 0:
            a = d
        d += 1
    b = n // (a * a)
    assert a * a * b == n
    return a, b


def terms(expr):
    """all c√r terms in order -> list of (c, r)."""
    out = []
    for m in re.finditer(r"(\d*)" + RT + r"(\d+)", expr.replace(" ", "")):
        out.append((int(m.group(1)) if m.group(1) else 1, int(m.group(2))))
    return out


def full(c, r):
    """c√r fully simplified -> (coeff, radicand)."""
    a, b = simplify(r)
    return c * a, b


def multiply(t1, t2):
    (c1, r1), (c2, r2) = t1, t2
    a, b = simplify(r1 * r2)
    return c1 * c2 * a, b          # coeff, radicand


def combine(t1, t2, sign):
    (co1, b1), (co2, b2) = full(*t1), full(*t2)
    if b1 != b2:
        return None
    return (co1 + sign * co2, b1)


def _selftest():
    # add / subtract
    assert combine((2, 3), (5, 3), +1) == (7, 3)
    assert combine((6, 5), (2, 5), -1) == (4, 5)
    assert combine((1, 8), (1, 2), +1) == (3, 2)      # √8=2√2, +√2 -> 3√2
    assert combine((4, 3), (2, 3), +1) == (6, 3)
    assert combine((1, 12), (1, 3), +1) == (3, 3)     # √12=2√3, +√3 -> 3√3
    assert combine((1, 18), (1, 2), +1) == (4, 2)     # √18=3√2, +√2 -> 4√2
    # multiply (coeff, radicand); radicand 1 => integer
    for t1, t2, exp in [((1, 2), (1, 8), (4, 1)), ((1, 3), (1, 12), (6, 1)),
                        ((2, 3), (4, 2), (8, 6)), ((1, 6), (1, 2), (2, 3)),
                        ((1, 5), (1, 20), (10, 1)), ((3, 2), (2, 5), (6, 10)),
                        ((1, 3), (1, 6), (3, 2)), ((1, 6), (1, 6), (6, 1)),
                        ((1, 8), (1, 2), (4, 1)), ((1, 6), (1, 10), (2, 15)),
                        ((1, 2), (1, 2), (2, 1))]:
        r = multiply(t1, t2)
        assert r == exp, (t1, t2, r, exp)
        # dual route: (coeff)^2 * radicand == (c1^2 r1)(c2^2 r2)
        c, rad = r
        (c1, r1), (c2, r2) = t1, t2
        assert c * c * rad == (c1 * c1 * r1) * (c2 * c2 * r2), (t1, t2)
    print("  self-test: operations toolkit OK (combine like radicals; multiply + dual-route re-square)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/radicals-and-exponents/lessons/rad-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            if w["type"] == "mcq":
                if sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1 correct")
                continue
            if w["type"] != "numeric":
                continue
            prompt = w.get("prompt", ""); s = prompt.replace(" ", ""); low = prompt.lower()
            ts = terms(prompt)
            want = None
            if len(ts) >= 2:
                is_mul = ("\u00b7" in s) or ("*" in s) or ("times" in low)
                if is_mul:
                    coeff, rad = multiply(ts[0], ts[1])
                    if "coefficient" in low:
                        want = coeff
                    elif rad == 1:
                        want = coeff
                else:
                    # add unless a minus sits between the two radical terms
                    sign = -1 if re.search(RT + r"\d+\s*-\s*\d*" + RT, prompt) else 1
                    res = combine(ts[0], ts[1], sign)
                    if res is not None and ("coefficient" in low or "what is a" in low):
                        want = res[0]
            if want is not None:
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
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
