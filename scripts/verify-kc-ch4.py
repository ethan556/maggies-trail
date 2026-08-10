#!/usr/bin/env python3
"""Independent verification of counting-to-20-k Chapter 4 (Put Together, Take Apart), K.OA.

SELF-TESTED dual-route:
  Add — Route A: a + b. Route B: counting on (successor iteration b times).
  Subtract — Route A: a - b. Route B: counting back (predecessor iteration b times).
  Decompose — Route A: part sums. Route B: count-all over concatenated token lists.
Cross-checked on grids first. Plus disk-read widget integrity: tenFrame preFilled < target,
commonCounts != target; numberLineHop landings on-line, != start, commonLandings != landing.
"""
import sys, json, glob


def add_A(a, b):
    return a + b


def add_B(a, b):
    v = a
    for _ in range(b):
        v += 1
    return v


def sub_A(a, b):
    return a - b


def sub_B(a, b):
    v = a
    for _ in range(b):
        v -= 1
    return v


def decomp_A(p, q):
    return p + q


def decomp_B(p, q):
    return len([1] * p + [1] * q)


def _selftest():
    mism = 0
    for a in range(0, 11):
        for b in range(0, 11):
            if add_A(a, b) != add_B(a, b) or decomp_A(a, b) != decomp_B(a, b):
                mism += 1
            if b <= a and sub_A(a, b) != sub_B(a, b):
                mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: arithmetic vs counting-on adds, counting-back subs, count-all decompositions all agree")


def main():
    _selftest()
    fails = checked = 0

    # authored add facts
    for a, b, e in [(2, 3, 5), (6, 3, 9), (5, 2, 7), (3, 4, 7), (8, 0, 8), (4, 2, 6)]:
        checked += 1
        if add_A(a, b) != e or add_B(a, b) != e:
            fails += 1
            print(f"  ADD FAIL {a}+{b}")
    # three-group challenge: 2+3+4 = 9 (both groupings)
    checked += 1
    if add_A(add_A(2, 3), 4) != 9 or add_B(2, add_B(3, 4)) != 9:
        fails += 1

    # authored subtract facts
    for a, b, e in [(7, 2, 5), (9, 3, 6), (6, 4, 2), (5, 5, 0), (7, 0, 7), (6, 2, 4)]:
        checked += 1
        if sub_A(a, b) != e or sub_B(a, b) != e:
            fails += 1
            print(f"  SUB FAIL {a}-{b}")
    # two-step take-away: 10 - 4 - 2 = 4, and as one 6-hop trip
    checked += 1
    if sub_A(sub_A(10, 4), 2) != 4 or sub_B(10, 6) != 4:
        fails += 1

    # authored decomposition facts: (whole, part, other part)
    for w, p, o in [(5, 1, 4), (6, 4, 2), (7, 3, 4), (6, 3, 3), (8, 6, 2), (5, 2, 3), (5, 0, 5)]:
        checked += 1
        if decomp_A(p, o) != w or decomp_B(p, o) != w:
            fails += 1
            print(f"  DECOMP FAIL {w}={p}+{o}")
    # the NOT-a-split distractor: 1 and 3 must NOT make 5
    checked += 1
    if decomp_A(1, 3) == 5:
        fails += 1

    # disk-read widget integrity
    for f in sorted(glob.glob("content/courses/counting-to-20-k/lessons/kc-04-*.json")):
        d = json.load(open(f))
        allsteps = list(d["steps"]) + [r["check"] for r in d.get("remedials", [])]
        for st in allsteps:
            w = st.get("widget")
            if not w:
                continue
            if w["type"] == "tenFrame":
                checked += 1
                if not (0 <= w["preFilled"] < w["target"] <= 10) or any(c["count"] == w["target"] for c in w["commonCounts"]):
                    fails += 1
                    print(f"  TENFRAME FAIL {f} {st['id']}")
            if w["type"] == "numberLineHop":
                checked += 1
                sign = -1 if w["direction"] == "back" else 1
                land = w["start"] + sign * w["hop"] * w["hops"]
                if not (w["min"] <= land <= w["max"]) or land == w["start"] or \
                   any(c["value"] == land for c in w["commonLandings"]):
                    fails += 1
                    print(f"  HOP FAIL {f} {st['id']}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
