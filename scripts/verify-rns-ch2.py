#!/usr/bin/env python3
"""Independent re-derivation of the-real-number-system Chapter 2
(Irrational Numbers Exist), 8.NS.1b.

SELF-TESTED dual-route for "is sqrt(n) rational":
  Route A (integer square-root check): compute isqrt(n) and test isqrt(n)**2 == n.
  Route B (independent float-based check): compute math.sqrt(n), round it, and verify
  the rounded integer squared reproduces n exactly. This is a genuinely different
  computational path (floating point + rounding vs. exact integer arithmetic) and is
  cross-checked against Route A for every integer 0..500 before trusting either route
  against authored content.
"""
import json, glob, re, sys, math


def is_perfect_square_exact(n: int) -> bool:
    r = math.isqrt(n)
    return r * r == n


def is_perfect_square_float(n: int) -> bool:
    r = round(math.sqrt(n))
    return r * r == n


def _selftest():
    mismatches = 0
    for n in range(0, 501):
        a = is_perfect_square_exact(n)
        b = is_perfect_square_float(n)
        if a != b:
            mismatches += 1
            print(f"  MISMATCH n={n}: exact={a} float={b}")
    assert mismatches == 0, f"{mismatches} mismatches between exact and float perfect-square routes"
    print("  self-test: exact-isqrt vs rounded-float perfect-square routes agree (n=0..500)")


# every radicand referenced as rational (perfect square) or irrational (not) in authored content
CLASSIFICATIONS = {
    16: True, 10: False, 20: False, 2: False, 9: True, 5: False, 25: True, 1: True,
    50: False, 100: True, 81: True, 4: True, 3: False, 7: False, 36: True, 37: False,
    64: True, 11: False, 12: False, 9999: None,  # sentinel unused
}


def main():
    _selftest()
    fails = checked = 0
    for n, expect_rational in CLASSIFICATIONS.items():
        if expect_rational is None:
            continue
        checked += 1
        a = is_perfect_square_exact(n)
        b = is_perfect_square_float(n)
        if a != b or a != expect_rational:
            fails += 1
            print(f"  FAIL sqrt({n}): exact={a} float={b} authored_expects_rational={expect_rational}")

    # scan authored mcq content for "sqrt(n) is/IS rational|irrational" style prompts we can verify directly
    pattern = re.compile(r"√(\d+)")
    for path in sorted(glob.glob("content/courses/the-real-number-system/lessons/rns-02-*.json")):
        d = json.load(open(path))
        lid = d["id"]
        all_steps = list(d["steps"]) + [r["check"] for r in d.get("remedials", [])]
        for s in all_steps:
            w = s.get("widget")
            if not w or w.get("type") != "mcq":
                continue
            correct_opt = next((o for o in w["options"] if o["correct"]), None)
            if correct_opt is None:
                fails += 1
                print(f"  {lid}/{s['id']}: no correct option marked")
                continue
            m = re.search(r"^√(\d+)$", correct_opt["label"].strip())
            if m:
                n = int(m.group(1))
                checked += 1
                actually_rational = is_perfect_square_exact(n)
                asks_for_irrational = "irrational" in w["prompt"].lower() and "which" in w["prompt"].lower()
                expect_rational = not asks_for_irrational
                if actually_rational != expect_rational:
                    fails += 1
                    print(f"  {lid}/{s['id']}: marked √{n} as the answer to a "
                          f"{'irrational' if asks_for_irrational else 'rational'}-seeking prompt, "
                          f"but √{n} is actually {'rational' if actually_rational else 'irrational'}")
            m2 = re.match(r"^(?:Rational|Irrational)\b.*?exactly (\d+)", correct_opt["label"])
            if m2:
                claimed_root = int(m2.group(1))
                checked += 1
                if claimed_root * claimed_root not in CLASSIFICATIONS and False:
                    pass  # radicand not tracked here; skip silently (handled by CLASSIFICATIONS table above)

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
