#!/usr/bin/env python3
"""Independent re-derivation of measure-money-time Chapter 3 (Money: Coins & Dollars).

Exact integer cents. SELF-TESTED dual-route: total value from a coin combination is
cross-checked between (a) grouping identical coins and multiplying by count, and
(b) a flat per-coin summation loop -- two independent accumulation orders.
"""
import json, glob, re, sys

COIN_VALUE = {"penny": 1, "nickel": 5, "dime": 10, "quarter": 25}


def total_from_counts(counts):
    """counts: list of (coin_name, n). Route A: multiply-then-sum by type."""
    return sum(COIN_VALUE[name] * n for name, n in counts)


def total_flat(counts):
    """Route B: expand to a flat list of individual coin values, sum one at a time."""
    flat = []
    for name, n in counts:
        flat.extend([COIN_VALUE[name]] * n)
    total = 0
    for v in flat:
        total += v
    return total


def _selftest():
    cases = [
        [("quarter", 1), ("dime", 1)],
        [("dime", 2), ("penny", 3)],
        [("nickel", 5)],
        [("quarter", 2), ("nickel", 1), ("penny", 4)],
        [("dime", 3), ("nickel", 2)],
    ]
    for c in cases:
        a, b = total_from_counts(c), total_flat(c)
        assert a == b, (c, a, b)                          # two accumulation orders agree
    assert total_from_counts([("nickel", 5)]) == 25 and 25 // COIN_VALUE["nickel"] == 5
    print("  self-test: coin toolkit OK (grouped-multiply vs flat-sum agree)")


def parse_counts(text):
    pairs = re.findall(r"(\d+)\s+(penny|pennies|nickel|nickels|dime|dimes|quarter|quarters)", text.lower())
    out = []
    for n, word in pairs:
        name = word.rstrip("s")
        if name == "pennie":
            name = "penny"
        out.append((name, int(n)))
    return out


def cents_answer(prompt):
    low = prompt.lower()
    if "how many cents is" in low:
        counts = parse_counts(low)
        return total_from_counts(counts) if counts else None
    m = re.search(r"how many (nickels|dimes|quarters|pennies) make (\d+) cents", low)
    if m:
        word, total = m.group(1), int(m.group(2))
        name = {"nickels": "nickel", "dimes": "dime", "quarters": "quarter", "pennies": "penny"}[word]
        return total // COIN_VALUE[name] if total % COIN_VALUE[name] == 0 else None
    return None


def coin_name_answer(prompt):
    low = prompt.lower()
    m = re.search(r"which coin is worth (\d+) cents", low)
    if m:
        val = int(m.group(1))
        for name, v in COIN_VALUE.items():
            if v == val:
                return name
    return None


def _selftest_parsers():
    assert cents_answer("How many cents is 1 quarter and 1 dime?") == 35
    assert cents_answer("How many cents is 2 dimes and 3 pennies?") == 23
    assert cents_answer("How many cents is 5 nickels?") == 25
    assert cents_answer("How many nickels make 25 cents?") == 5
    assert coin_name_answer("Which coin is worth 10 cents?") == "dime"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/measure-money-time/lessons/mmt-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = cents_answer(prompt)
                if want is None:
                    continue
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                want = coin_name_answer(prompt)
                if want is None:
                    continue
                checked += 1
                if want not in corr[0]["label"].strip().lower():
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want!r} in {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
