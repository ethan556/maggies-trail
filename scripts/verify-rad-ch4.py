#!/usr/bin/env python3
"""Independent re-derivation of radicals-and-exponents Chapter 4 (Applications).

Exact integer arithmetic, SELF-TESTED. Pythagorean: c^2 = a^2 + b^2 (and missing leg
b^2 = c^2 - a^2); distance^2 = (dx)^2 + (dy)^2. Integer results (perfect-square sums)
authored as numerics; irrational results as simplified-radical mcq labels, confirmed by
re-squaring the label (p^2*q == the exact squared length). Reuses simplify().
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


def isqrt_exact(n):
    a, b = simplify(n)
    return a if b == 1 else None


def parse_rad(label):
    s = label.replace(" ", "")
    m = re.fullmatch(r"(\d*)" + RT + r"(\d+)", s)
    if m:
        return (int(m.group(1)) if m.group(1) else 1, int(m.group(2)))
    m = re.fullmatch(r"(\d+)", s)
    if m:
        return (int(m.group(1)), 1)
    return None


def squared_length(prompt):
    """return the exact squared length the prompt asks about, and which quantity."""
    s = prompt
    low = s.lower()
    mlegs = re.search(r"legs (\d+) and (\d+)", low)
    mhyp = re.search(r"hypotenuse (\d+), one leg (\d+)", low)
    pts = re.findall(r"\((\d+),\s*(\d+)\)", s)
    if "distance" in low and len(pts) >= 2:
        (x1, y1), (x2, y2) = (int(pts[0][0]), int(pts[0][1])), (int(pts[1][0]), int(pts[1][1]))
        return (x2 - x1) ** 2 + (y2 - y1) ** 2, "dist"
    if mhyp:
        c, leg = int(mhyp.group(1)), int(mhyp.group(2))
        return c * c - leg * leg, "leg"
    if mlegs:
        a, b = int(mlegs.group(1)), int(mlegs.group(2))
        return a * a + b * b, "hyp"
    return None, None


def _selftest():
    for a, b, c in [(3, 4, 5), (6, 8, 10), (5, 12, 13), (8, 15, 17), (9, 12, 15)]:
        assert a * a + b * b == c * c
        assert isqrt_exact(a * a + b * b) == c
    assert isqrt_exact(13 * 13 - 5 * 5) == 12
    assert isqrt_exact(10 * 10 - 6 * 6) == 8
    # radical hypotenuses
    for a, b, lab in [(2, 2, (2, 2)), (2, 4, (2, 5)), (1, 2, (1, 5)), (3, 3, (3, 2)), (1, 1, (1, 2))]:
        n = a * a + b * b
        p, q = lab
        assert p * p * q == n, (a, b, n, lab)
        assert isqrt_exact(n) is None                      # genuinely irrational
    # distances
    assert isqrt_exact((3 - 0) ** 2 + (4 - 0) ** 2) == 5
    assert isqrt_exact((4 - 1) ** 2 + (6 - 2) ** 2) == 5
    assert (2 - 0) ** 2 + (2 - 0) ** 2 == 8 and simplify(8) == (2, 2)
    assert isqrt_exact((10 - 2) ** 2 + (9 - 3) ** 2) == 10
    print("  self-test: applications toolkit OK (pythagorean + distance, integer & radical)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/radicals-and-exponents/lessons/rad-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            sq, _ = squared_length(prompt)
            if w["type"] == "numeric":
                if "c\u00b2" in prompt or "before the root" in low or "squared" in low:
                    if sq is not None:
                        checked += 1
                        ok = (int(w["answer"]) == sq and all(e["value"] != sq for e in w["commonErrors"]) and len(w["commonErrors"]) >= 2)
                        if not ok:
                            fails += 1; print(f"  {lid}/{sid} c2 FAIL want {sq} got {w['answer']}")
                    continue
                if sq is None:
                    continue
                val = isqrt_exact(sq)
                if val is None:
                    continue
                checked += 1
                ok = (int(w["answer"]) == val and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != val for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {val} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if sq is not None:
                    pr = parse_rad(corr[0]["label"])
                    if pr:
                        p, q = pr
                        if p * p * q != sq:
                            fails += 1
                            print(f"  {lid}/{sid} mcq FAIL {corr[0]['label']!r} p^2q={p*p*q} target={sq}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
