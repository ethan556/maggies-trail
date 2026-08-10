"""Dual-route verifier — conditional-probability, Chapter 1 (events, sets, sample spaces).

Route A (this file, "closed form"): inclusion–exclusion, complement rule, floor-division counts.
Route B (this file, "enumeration"): brute-force the sample space and count with a predicate.
The two routes are coded independently; they must agree with each other AND with the answer
values read back off the shipped JSON. Any disagreement fails the run.
"""

from fractions import Fraction as F
from itertools import product
import json
import sys

ROOT = "content/courses/conditional-probability/lessons"
fails = []


def load(lid):
    with open(f"{ROOT}/{lid}.json") as fh:
        return json.load(fh)


def step(les, sid):
    for s in les["steps"]:
        if s["id"] == sid:
            return s
    for r in les["remedials"]:
        for s in (r["concept"], r["check"]):
            if s["id"] == sid:
                return s
    raise KeyError(sid)


def expect(label, got, want):
    if got != want:
        fails.append(f"{label}: shipped {got!r} != re-derived {want!r}")


# ---------------------------------------------------------------- cpr-01-01
l1 = load("cpr-01-01")

# route A: closed form
A_count_a = 20 // 3                      # multiples of 3 up to 20
B_count_a = 20 - 15                      # cards 16..20
AB_count_a = 20 // 3 - 15 // 3           # multiples of 3 in 16..20
union_a = A_count_a + B_count_a - AB_count_a

# route B: enumeration
cards = range(1, 21)
A_count_b = sum(1 for c in cards if c % 3 == 0)
B_count_b = sum(1 for c in cards if c > 15)
AB_count_b = sum(1 for c in cards if c % 3 == 0 and c > 15)
union_b = sum(1 for c in cards if c % 3 == 0 or c > 15)

assert (A_count_a, B_count_a, AB_count_a, union_a) == (A_count_b, B_count_b, AB_count_b, union_b), "cpr-01-01 routes disagree"

# probabilityArea i1: shaded cells must equal P(multiple of 3) = 6/20 = 3/10
w = step(l1, "i1")["widget"]
cells = w["rows"] * w["cols"] * w["targetNum"] // w["targetDen"]
expect("cpr-01-01/i1 shaded cells", cells, A_count_b)
expect("cpr-01-01/i1 fraction", F(w["targetNum"], w["targetDen"]), F(A_count_b, 20))

expect("cpr-01-01/k2 |A∪B|", step(l1, "k2")["widget"]["answer"], union_b)

# challenge: |C ∪ D| for even / multiple of 5
C_a, D_a = 20 // 2, 20 // 5
CD_a = 20 // 10                          # multiples of lcm(2,5) = 10
unionCD_a = C_a + D_a - CD_a
unionCD_b = sum(1 for c in cards if c % 2 == 0 or c % 5 == 0)
assert unionCD_a == unionCD_b, "cpr-01-01 challenge routes disagree"
expect("cpr-01-01/ch1 |C∪D|", step(l1, "ch1")["widget"]["answer"], unionCD_b)

# dragBucket placements: b1 = A∩B, b2 = union only, b3 = neither
truth = {}
for c in (18, 9, 17, 20, 7, 4):
    inA, inB = c % 3 == 0, c > 15
    truth[str(c)] = "b1" if (inA and inB) else ("b2" if (inA or inB) else "b3")
for item in step(l1, "k3")["widget"]["items"]:
    expect(f"cpr-01-01/k3 card {item['label']}", item["bucketId"], truth[item["label"]])

# ---------------------------------------------------------------- cpr-01-02
l2 = load("cpr-01-02")

# route A: complement rule with closed forms
three_heads_a = 2 ** 3 - 1               # at least one head = total - (all tails)
two_dice_a = 6 ** 2 - 5 ** 2             # at least one six
four_heads_a = 2 ** 4 - 1
three_dice_a = 6 ** 3 - 5 ** 3
two_coin_a = 2 ** 2 - 1

# route B: enumeration over the product space
three_heads_b = sum(1 for t in product("HT", repeat=3) if "H" in t)
two_dice_b = sum(1 for t in product(range(1, 7), repeat=2) if 6 in t)
four_heads_b = sum(1 for t in product("HT", repeat=4) if "H" in t)
three_dice_b = sum(1 for t in product(range(1, 7), repeat=3) if 6 in t)
two_coin_b = sum(1 for t in product("HT", repeat=2) if "H" in t)

for name, a, b in [
    ("3 coins", three_heads_a, three_heads_b),
    ("2 dice", two_dice_a, two_dice_b),
    ("4 coins", four_heads_a, four_heads_b),
    ("3 dice", three_dice_a, three_dice_b),
    ("2 coins", two_coin_a, two_coin_b),
]:
    assert a == b, f"cpr-01-02 routes disagree on {name}: {a} vs {b}"

w = step(l2, "i1")["widget"]
cells = w["rows"] * w["cols"] * w["targetNum"] // w["targetDen"]
expect("cpr-01-02/i1 shaded cells", cells, three_heads_b)
expect("cpr-01-02/i1 fraction", F(w["targetNum"], w["targetDen"]), F(three_heads_b, 8))
expect("cpr-01-02/k2 two dice", step(l2, "k2")["widget"]["answer"], two_dice_b)
expect("cpr-01-02/k3 four coins", step(l2, "k3")["widget"]["answer"], four_heads_b)
expect("cpr-01-02/ch1 three dice", step(l2, "ch1")["widget"]["answer"], three_dice_b)
expect("cpr-01-02/rk1 two coins", step(l2, "rk1")["widget"]["answer"], two_coin_b)

# the "no six" distractor really is the complement count
ch_errors = {e["value"] for e in step(l2, "ch1")["widget"]["commonErrors"]}
assert 5 ** 3 in ch_errors, "cpr-01-02/ch1: complement-count distractor missing"

# ---------------------------------------------------------------- cpr-01-03
l3 = load("cpr-01-03")

# spinner: multiples of 3 or 4 on 1..12
spin_a = 12 // 3 + 12 // 4 - 12 // 12     # inclusion–exclusion with lcm(3,4)=12
spin_b = sum(1 for n in range(1, 13) if n % 3 == 0 or n % 4 == 0)
assert spin_a == spin_b, "cpr-01-03 spinner routes disagree"
expect("cpr-01-03/i1 favourable sectors", step(l3, "i1")["widget"]["targetFavourable"], spin_b)

# survey: at least one of sport/instrument
atleast_a = 18 + 12 - 7
only_sport, only_inst, both = 18 - 7, 12 - 7, 7
atleast_b = only_sport + only_inst + both          # partition route
assert atleast_a == atleast_b, "cpr-01-03 k2 routes disagree"
expect("cpr-01-03/k2 at least one", step(l3, "k2")["widget"]["answer"], atleast_b)

# coffee/tea: solve for the overlap
both_a = 25 + 18 - (40 - 5)
# route B: solve (25 - b) + (18 - b) + b + 5 = 40 for b
both_b = None
for b in range(0, 19):
    if (25 - b) + (18 - b) + b + 5 == 40:
        both_b = b
assert both_a == both_b, "cpr-01-03 challenge routes disagree"
expect("cpr-01-03/ch1 both", step(l3, "ch1")["widget"]["answer"], both_b)

# exclusivity sorting: b1 = mutually exclusive, b2 = can co-occur
excl_truth = {"p1": "b1", "p2": "b2", "p3": "b1", "p4": "b2", "p5": "b1", "p6": "b2"}
for item in step(l3, "k3")["widget"]["items"]:
    expect(f"cpr-01-03/k3 {item['id']}", item["bucketId"], excl_truth[item["id"]])

# remedial: 6 is even and above 4 -> not exclusive
assert any(o["correct"] and o["id"] == "o1" for o in step(l3, "rk1")["widget"]["options"]), \
    "cpr-01-03/rk1: the 'no, 6 is in both' option must be the correct one"

# ---------------------------------------------------------------- report
if fails:
    print("VERIFY FAILED")
    for f in fails:
        print("  ✗", f)
    sys.exit(1)
print("verify cpr ch1: all answers re-derived by two independent routes — OK")
