#!/usr/bin/env python3
"""Independent re-derivation of radicals-and-exponents Chapter 1 (Simplifying Radicals).

Exact integer arithmetic, SELF-TESTED. simplify(n) returns (a, b) with a the largest
factor whose square divides n and b square-free, so a**2 * b == n. DUAL-ROUTE: every
simplification is confirmed by re-squaring (a**2 * b == n), and mcq radical labels are
confirmed by re-squaring the label (p**2 * q == target). Content pass re-derives the
asked integer: largest perfect-square factor / coefficient a / radicand b / √(perfect
square). Non-integer results (a√b) are authored as mcq exact labels, not numeric.
"""
import json, glob, re, sys

RT = "\u221a"  # √


def simplify(n):
    a = 1
    d = 1
    while d * d <= n:
        if n % (d * d) == 0:
            a = d
        d += 1
    b = n // (a * a)
    assert a * a * b == n, (n, a, b)          # re-square (constructive check)
    return a, b


def parse_rad(s):
    s = s.replace(" ", "")
    m = re.fullmatch(r"(\d*)" + RT + r"(\d+)", s)
    if m:
        return (int(m.group(1)) if m.group(1) else 1, int(m.group(2)))
    m = re.fullmatch(r"(\d+)", s)
    if m:
        return (int(m.group(1)), 1)
    return None


def outer_radical(prompt):
    """the radical being simplified: optional outer coefficient then √n -> (c, n)."""
    m = re.search(r"(\d*)" + RT + r"(\d+)", prompt.replace(" ", ""))
    if m:
        return (int(m.group(1)) if m.group(1) else 1, int(m.group(2)))
    return None


def _selftest():
    for n, exp in [(49, (7, 1)), (81, (9, 1)), (144, (12, 1)), (100, (10, 1)),
                   (20, (2, 5)), (18, (3, 2)), (72, (6, 2)), (50, (5, 2)),
                   (48, (4, 3)), (98, (7, 2)), (200, (10, 2)), (12, (2, 3)),
                   (75, (5, 3)), (45, (3, 5)), (288, (12, 2))]:
        assert simplify(n) == exp, (n, simplify(n), exp)
    # mcq re-square: label (p,q) matches target c^2*n
    assert parse_rad("6" + RT + "2") == (6, 2)
    assert parse_rad(RT + "2") == (1, 2)
    for label, c, n in [("6" + RT + "2", 1, 72), ("3" + RT + "2", 1, 18),
                        ("7" + RT + "2", 1, 98), ("10" + RT + "2", 1, 200),
                        ("4" + RT + "2", 2, 8), ("6" + RT + "2", 3, 8),
                        ("12" + RT + "2", 1, 288)]:
        p, q = parse_rad(label)
        assert p * p * q == c * c * n, (label, c, n)
    print("  self-test: radical toolkit OK (simplify + re-square, label re-square)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/radicals-and-exponents/lessons/rad-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            if w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1 correct"); continue
                checked += 1
                oc = outer_radical(prompt); pr = parse_rad(corr[0]["label"])
                if oc and pr:
                    c, n = oc; p, q = pr
                    if p * p * q != c * c * n:
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL {corr[0]['label']!r} p^2q={p*p*q} target={c*c*n}")
                continue
            if w["type"] != "numeric":
                continue
            want = None
            if "perfect-square factor" in low or "perfect square factor" in low:
                m = re.search(r"of (\d+)", low)
                if m:
                    a, _ = simplify(int(m.group(1))); want = a * a
            else:
                oc = outer_radical(prompt)
                if oc:
                    c, n = oc; a, b = simplify(n)
                    if "coefficient" in low:
                        want = a
                    elif "radicand" in low or "under the root" in low:
                        want = b
                    elif b == 1:
                        want = a
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
