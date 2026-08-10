// Tranche 4 — fourteenth session. 30 flagship conversions (ranks 1–30 of the
// post-300 FLAGSHIP.md regeneration): 29 verified predict blocks + 1 engine
// replacement (pv1000-03-03 i2: mcq → dragOrder with its own predict).
// Every outcome verified by computation before authoring — see comments.
import fs from "node:fs";
import path from "node:path";


const byId = {};
const files = [];
for (const c of fs.readdirSync("content/courses")) {
  const dir = path.join("content/courses", c, "lessons");
  if (fs.existsSync(dir)) for (const n of fs.readdirSync(dir)) if (n.endsWith(".json")) files.push(path.join(dir, n));
}
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  byId[d.id] = { f, d };
}

const P = (lessonId, stepId, predict) => ({ lessonId, stepId, predict });

const edits = [
  // 50 ÷ 9 = 5 r 5; a remainder ≥ 9 admits another full group.
  P("ns-02-01", "i2", {
    prompt: "50 ÷ 9: nine fits into 50 five times (45). Could the remainder ever be 9 or more?",
    options: [
      { id: "no", label: "No — a leftover of 9 would still fit another group" },
      { id: "yes", label: "Yes — any leftover count is possible" }
    ],
    outcomeId: "no",
    reveal:
      "The remainder is what's left AFTER every full group of 9 is pulled out — 50 − 45 = 5. If 9 or more remained, another group of 9 would still fit and the quotient wasn't finished. Remainders always sit strictly below the divisor."
  }),
  // Right-aligning 8.6 against 0.75 places the 6 in the hundredths: 0.86, sum 1.61 ≠ 9.35.
  P("ns-02-02", "i2", {
    prompt: "The classic slip in 8.6 + 0.75 is lining up the RIGHT ends (6 under the 5). Doing that treats 8.6 as…",
    options: [
      { id: "small", label: "0.86 — the 8 gets demoted to tenths" },
      { id: "same", label: "8.60 — alignment can't change a number" },
      { id: "big", label: "86 — the digits shift up instead" }
    ],
    outcomeId: "small",
    reveal:
      "Right-aligning puts the 6 under the 5 — the hundredths column — dragging the 8 into the tenths: the work silently computes 0.86 + 0.75 = 1.61. Stacking the decimal POINTS keeps the 8 worth eight wholes: 8.60 + 0.75 = 9.35."
  }),
  // 0.6 × 0.7 = 0.42 (6×7=42, two places).
  P("ns-02-03", "i2", {
    prompt: "For 0.6 × 0.7 you'll compute 6 × 7 = 42. The final answer will be…",
    options: [
      { id: "two", label: "0.42 — one decimal place from each factor" },
      { id: "one", label: "4.2 — one place total is enough" },
      { id: "whole", label: "42 — the zeros drop away" }
    ],
    outcomeId: "two",
    reveal:
      "Each factor carries one decimal place, and places ADD in multiplication: 42 needs two, giving 0.42. Notice it's smaller than either factor — six-tenths OF seven-tenths is a piece of a piece."
  }),
  // f(g(x)) with f = square, g = add 1: g runs first, (x+1)²; at x=1 the orders differ (4 vs 2).
  P("ft-04-03", "i1", {
    prompt: "f(g(x)) with f squaring and g adding 1. When x flows through, which operation happens FIRST?",
    options: [
      { id: "inner", label: "Add 1 first — the inside function acts first" },
      { id: "outer", label: "Square first — read f before g" }
    ],
    outcomeId: "inner",
    reveal:
      "Composition works inside-out: x picks up the +1 from g, THEN gets squared — (x + 1)². Squaring first builds x² + 1, which is g(f(x)), a genuinely different curve: at x = 1 they read 4 and 2."
  }),
  // −6 − (−10) = −6 + 10 = 4 > 0.
  P("rno-02-03", "i3", {
    prompt: "−6 − (−10): before computing, which side of zero does the answer land on?",
    options: [
      { id: "pos", label: "Positive — removing a bigger debt lifts you past zero" },
      { id: "neg", label: "Negative — it starts negative and stays there" },
      { id: "zero", label: "Exactly zero — the negatives cancel" }
    ],
    outcomeId: "pos",
    reveal:
      "Subtracting −10 adds 10: from −6, ten steps right crosses zero with room to spare, landing at +4. 'Subtraction makes smaller' fails the moment the number being taken away is negative."
  }),
  // −4 × 5 = −20; different signs → negative; commutativity kills order-dependence.
  P("rno-03-01", "i1", {
    prompt: "−4 × 5: before any arithmetic, the product's sign must be…",
    options: [
      { id: "neg", label: "Negative — the signs differ" },
      { id: "pos", label: "Positive — the bigger factor is positive" },
      { id: "order", label: "It depends on which factor is written first" }
    ],
    outcomeId: "neg",
    reveal:
      "Different signs always produce a negative: −4 × 5 is five groups of −4, a debt of 20. Size doesn't vote — only signs do — and since multiplication commutes, 5 × (−4) is the same −20."
  }),
  // 2⁴ = 16 ≠ 2 × 4 = 8.
  P("ee-01-02", "i1", {
    prompt: "2⁴ — will it come out equal to 2 × 4?",
    options: [
      { id: "no", label: "No — repeated multiplying outgrows it" },
      { id: "yes", label: "Yes — the exponent just multiplies the base" }
    ],
    outcomeId: "no",
    reveal:
      "The exponent counts FACTORS, not a multiplier: 2 × 2 × 2 × 2 = 16, double 2 × 4 = 8. Each extra factor of 2 doubles everything so far — that compounding is what makes powers grow so fast."
  }),
  // −12 ÷ 3: the missing factor in 3 × ? = −12 must be negative (−4).
  P("rno-03-02", "i2", {
    prompt: "−12 ÷ 3 asks: 3 times WHAT gives −12. That missing factor's sign is…",
    options: [
      { id: "neg", label: "Negative — a positive times it must land negative" },
      { id: "pos", label: "Positive — division washes signs out" },
      { id: "either", label: "Either sign works" }
    ],
    outcomeId: "neg",
    reveal:
      "3 × (+4) = +12, the wrong side of zero — only 3 × (−4) reaches −12. Division inherits multiplication's sign rule because it IS a multiplication question in reverse: different signs in, negative out."
  }),
  // (−1)⁴ = +1: two cancelling pairs.
  P("rno-03-03", "i3", {
    prompt: "−1 × −1 × −1 × −1: four negative factors. The result's sign will be…",
    options: [
      { id: "pos", label: "Positive — the minuses cancel in pairs" },
      { id: "neg", label: "Negative — four minuses is deeply negative" },
      { id: "zero", label: "Zero — they wipe each other out" }
    ],
    outcomeId: "pos",
    reveal:
      "Each PAIR of negatives multiplies to +1, and four negatives make exactly two pairs: +1. Count the minus signs — even count means positive, odd leaves one unpaired minus standing. Cancelling never means zero: these are factors, not opposites being added."
  }),
  // −2.5 + 1.75 = −0.75: the larger magnitude wins.
  P("rno-04-02", "i1", {
    prompt: "−2.5 + 1.75: which side of zero does the sum land on?",
    options: [
      { id: "neg", label: "Negative — 2.5 outweighs 1.75" },
      { id: "pos", label: "Positive — adding a positive ends positive" },
      { id: "zero", label: "Exactly zero — they cancel" }
    ],
    outcomeId: "neg",
    reveal:
      "Different-sign addition is a tug-of-war of magnitudes: 2.5 beats 1.75, so the negative side keeps the difference — −0.75. Adding a positive moves you right, but 1.75 of movement can't cover a 2.5 deficit."
  }),
  // Converse of a true statement need not be true (6 | 2 but 6 ∤ 4).
  P("cp-05-03", "i2", {
    prompt: "A TRUE theorem is about to meet its converse. Must the converse be true as well?",
    options: [
      { id: "no", label: "No — truth doesn't automatically flow backward" },
      { id: "yes", label: "Yes — same facts, same truth" }
    ],
    outcomeId: "no",
    reveal:
      "'Divisible by 4 ⇒ divisible by 2' is true, yet 6 is divisible by 2 and not by 4 — the reverse arrow fails. A statement and its converse are separate claims, and each direction must earn its own proof."
  }),
  // 3² + 4² = 9 + 16 = 25 = 5², exactly.
  P("rt-01-01", "i1", {
    prompt: "Legs 3 and 4, hypotenuse 5. Will 3² + 4² land exactly on 5², or only close?",
    options: [
      { id: "exact", label: "Exactly — the theorem is an identity" },
      { id: "close", label: "Close — it's a good approximation" }
    ],
    outcomeId: "exact",
    reveal:
      "9 + 16 = 25, on the nose. The theorem isn't a measurement or an estimate — the squares built on the two legs carry exactly as much area as the square on the hypotenuse, in every right triangle without exception."
  }),
  // x² + 6x = −5: add 9 → k = 4 > 0; (x+3)² = 4 → x = −1, −5 (both check).
  P("cn-01-02", "i1", {
    prompt: "To complete x² + 6x = −5 you'll add (6/2)² = 9 to both sides. The resulting k will be…",
    options: [
      { id: "pos", label: "Positive — the added 9 outweighs the −5" },
      { id: "neg", label: "Negative — the right side started at −5" },
      { id: "zero", label: "Exactly zero" }
    ],
    outcomeId: "pos",
    reveal:
      "The right side becomes −5 + 9 = 4. A positive k is good news: (x + 3)² = 4 unwinds to x + 3 = ±2, handing over two real solutions, x = −1 and x = −5 — both check in the original."
  }),
  // Parallelogram b=9, h=5 rearranges to a 9×5 rectangle: area exactly 45, no ½.
  P("asv-01-02", "i1", {
    prompt: "A parallelogram with base 9 and height 5 — same base and height as a 9 × 5 rectangle. Its area will be…",
    options: [
      { id: "same", label: "Exactly the rectangle's — the slant doesn't cost area" },
      { id: "less", label: "Less — slanting squeezes it thinner" },
      { id: "half", label: "Half — slanted shapes take the ½ like triangles" }
    ],
    outcomeId: "same",
    reveal:
      "Slice the overhanging triangle off one end and slide it to the other: the parallelogram reassembles into the 9 × 5 rectangle exactly, so the area is the full 45. The ½ belongs to triangles alone — a parallelogram is two of them."
  }),
  // Hyp 13, leg 5: other leg = √(169−25) = 12, not 13 − 5 = 8.
  P("tc-02-01", "i1", {
    prompt: "Hypotenuse 13, one leg 5. How is the missing leg found?",
    options: [
      { id: "squares", label: "Subtract SQUARES: √(13² − 5²)" },
      { id: "linear", label: "Subtract lengths: 13 − 5 = 8" },
      { id: "add", label: "Add squares: √(13² + 5²)" }
    ],
    outcomeId: "squares",
    reveal:
      "Pythagoras trades in squares, never bare lengths: 169 − 25 = 144, so the leg is 12 — not the tempting 13 − 5 = 8. Adding the squares is for finding a HYPOTENUSE; here 13 already is one, so its square is the total the legs must share."
  }),
  // Legs 1,1: c² = 2, and 1² < 2 < 2², so c = √2 is not whole.
  P("rt-01-03", "i1", {
    prompt: "Legs 1 and 1. Will the hypotenuse come out a whole number?",
    options: [
      { id: "no", label: "No — nothing whole squares to 2" },
      { id: "yes", label: "Yes — 1 + 1 = 2 exactly" }
    ],
    outcomeId: "no",
    reveal:
      "c² = 1 + 1 = 2, and 2 sits strictly between 1² = 1 and 2² = 4 — no whole number squares to it. The diagonal of a unit square is √2 ≈ 1.414, the first length in this course that refuses to be a fraction at all."
  }),
  // Rooms 7×4=28 and 3×6=18: total 46 ≠ (7+3)(4+6)=100.
  P("asv-02-03", "i1", {
    prompt: "Two rooms, 7 × 4 and 3 × 6. Can you total the floor by combining dimensions first — (7 + 3) × (4 + 6)?",
    options: [
      { id: "no", label: "No — areas add, dimensions don't" },
      { id: "yes", label: "Yes — 10 × 10 covers both rooms" }
    ],
    outcomeId: "no",
    reveal:
      "Gluing the rooms doesn't build a 10 × 10 square — that phantom square holds 100, more than double the truth. Each room's area is computed on its own — 28 and 18 — and only the AREAS are added: 46."
  }),
  // Hyp = 2 × short = 2 × (long/√3) ≈ 1.155 × long, so doubling the long leg (2√3 ≈ 3.46 vs true 2) overshoots.
  P("rt-01-04", "i2", {
    prompt: "The long leg is √3 times the short one. Doubling the LONG leg will give…",
    options: [
      { id: "over", label: "Too much — doubling is the short leg's move" },
      { id: "hyp", label: "Exactly the hypotenuse" },
      { id: "perim", label: "The whole perimeter" }
    ],
    outcomeId: "over",
    reveal:
      "The hypotenuse is 2 × the SHORT leg. From the long leg you must first step down (divide by √3), then double: in the 1-√3-2 triangle that's √3 → 1 → 2, while doubling √3 itself gives about 3.46 — well past the true 2."
  }),
  // Same 35° angle ⇒ AA-similar ⇒ ratio identical across sizes.
  P("rt-02-01", "i1", {
    prompt: "Three right triangles all hold a 35° angle, with hypotenuses 70, 110, and 150. Across the three, opposite ÷ hypotenuse will…",
    options: [
      { id: "same", label: "Match exactly — same angle, same shape" },
      { id: "shrink", label: "Shrink as the triangle grows" },
      { id: "grow", label: "Grow with the triangle" }
    ],
    outcomeId: "same",
    reveal:
      "The 35° (plus the right angle) fixes the SHAPE — all three are similar by AA. Scaling multiplies opposite and hypotenuse by the same factor, which cancels in the ratio. That constancy is precisely what lets 'sin 35°' name a single number."
  }),
  // Apex 40°: base angles = (180−40)/2 = 70 > 40.
  P("tc-03-01", "i1", {
    prompt: "The apex is 40°. Each base angle will come out…",
    options: [
      { id: "bigger", label: "Bigger than 40° — they split the lion's share" },
      { id: "equal", label: "Exactly 40° — all three match" },
      { id: "smaller", label: "Smaller than 40° — the apex dominates" }
    ],
    outcomeId: "bigger",
    reveal:
      "The apex takes only 40 of the triangle's 180 degrees, leaving 140 for the two base angles to split equally — 70 each, well above the apex. Equal legs force equal base angles, but nothing forces them to match the apex."
  }),
  // 5×2 base, 3 tall: 3 layers of 10 = 30.
  P("asv-05-01", "i1", {
    prompt: "The bottom layer holds 5 × 2 = 10 cubes, and the box is 3 tall. It will hold…",
    options: [
      { id: "layers", label: "Three full layers of 10" },
      { id: "add", label: "10 cubes plus 3 more for the height" },
      { id: "flat", label: "Still 10 — height doesn't add cubes" }
    ],
    outcomeId: "layers",
    reveal:
      "The height counts identical LAYERS, each a full copy of the 10-cube floor: 10 + 10 + 10 = 30. That's why the formula multiplies all three dimensions — l × w builds one layer, × h stacks it."
  }),
  // Equilateral: 3 equal angles must each be 180/3 = 60; a 90° is impossible.
  P("tc-03-02", "i2", {
    prompt: "Could an equilateral triangle contain a 90° angle?",
    options: [
      { id: "no", label: "No — three equal 90s would burst past 180" },
      { id: "yes", label: "Yes — one right angle is allowed" }
    ],
    outcomeId: "no",
    reveal:
      "Equal sides force ALL THREE angles equal, so each must be exactly a third of 180°. Three 90s would total 270 — impossible — and even one 90° would leave the other two only 90 to share, breaking the equality. The three-way split is forced."
  }),
  // Midsegment = half the parallel side (similar triangle, ratio 1/2): 18 → 9.
  P("tc-03-03", "i1", {
    prompt: "The midsegment joins the MIDPOINTS of two sides. Compared to the 18-unit base it parallels, it will be…",
    options: [
      { id: "half", label: "Exactly half as long" },
      { id: "same", label: "The same length — parallel means equal" },
      { id: "depends", label: "It depends on the triangle's shape" }
    ],
    outcomeId: "half",
    reveal:
      "Cutting both sides at their midpoints creates a small triangle similar to the whole with ratio 1/2 (SAS about the apex), so the midsegment is always exactly half its parallel side — 9 here, and in every triangle, whatever its shape."
  }),
  // x² = −36 has no real solutions; ±6i off the line.
  P("cn-04-01", "i1", {
    prompt: "x² = −36. How many REAL numbers solve it?",
    options: [
      { id: "none", label: "None — no real square is negative" },
      { id: "two", label: "Two — plus and minus 6" },
      { id: "one", label: "One — just −6" }
    ],
    outcomeId: "none",
    reveal:
      "Squaring a real number never lands below zero — positives square positive, negatives square positive, zero squares to zero. The real line offers nothing, so the solutions step off it: x = ±6i, since (6i)² = 36i² = −36."
  }),
  // x² − 4x + 13: b² − 4ac = 16 − 52 = −36 < 0.
  P("cn-04-02", "i1", {
    prompt: "For x² − 4x + 13 = 0 you'll compute b² − 4ac. Its sign will be…",
    options: [
      { id: "neg", label: "Negative — 16 can't beat 52" },
      { id: "pos", label: "Positive — b² is a square" },
      { id: "zero", label: "Exactly zero" }
    ],
    outcomeId: "neg",
    reveal:
      "b² = 16 but 4ac = 52, so the discriminant sinks to −36. Below zero means the parabola never touches the x-axis — the square root goes imaginary and both roots turn complex: x = 2 ± 3i."
  }),
  // 20 is strictly between 16 = 4² and 25 = 5²; 20 = 4 × 5 hides the square factor.
  P("rad-01-01", "i3", {
    prompt: "Is 20 itself a perfect square?",
    options: [
      { id: "no", label: "No — it falls between two squares" },
      { id: "yes", label: "Yes — 4 × 5 counts" }
    ],
    outcomeId: "no",
    reveal:
      "20 sits strictly between 4² = 16 and 5² = 25, so √20 is not whole. But a perfect square hides INSIDE it — 20 = 4 × 5 — and pulling that 4 out through the root is exactly where √20 = 2√5 will come from."
  }),
  // Only sine names opposite AND hypotenuse together.
  P("rt-03-01", "i1", {
    prompt: "You hold θ and the hypotenuse, and want the side OPPOSITE θ. How many of the three ratios connect exactly those two sides?",
    options: [
      { id: "one", label: "Exactly one" },
      { id: "all", label: "All three — any works with enough algebra" },
      { id: "two", label: "Two of them" }
    ],
    outcomeId: "one",
    reveal:
      "Only sine mentions both players: sin θ = opposite/hypotenuse. Cosine drags in the adjacent side you don't know, and tangent never touches the hypotenuse at all. The sides in play choose the ratio — not habit."
  }),
  // 6 × 1 = 6 (identity) vs 6 × 0 = 0 (annihilator): different buckets.
  P("mult-02-05", "i2", {
    prompt: "6 × 0 and 6 × 1 — will these two land in the same bucket?",
    options: [
      { id: "no", label: "No — one keeps the 6, the other erases it" },
      { id: "yes", label: "Yes — both leave the 6 alone" }
    ],
    outcomeId: "no",
    reveal:
      "×1 hands back exactly what it was given — one group of 6 is 6. ×0 makes ZERO groups of 6: nothing at all. The two strangers look like neighbors but do opposite jobs: one is the identity, the other the annihilator."
  }),
  // √2 · √8 = √16 = 4: irrational × irrational can be whole.
  P("rad-02-02", "i1", {
    prompt: "√2 · √8 — two irrational numbers. Their product will be…",
    options: [
      { id: "whole", label: "A whole number — the radicands merge" },
      { id: "irr", label: "Irrational — irrationals stay irrational" },
      { id: "sixteen", label: "Exactly 16" }
    ],
    outcomeId: "whole",
    reveal:
      "The product rule merges the insides: √2 · √8 = √16 = 4 — the root of the product, not the product itself. Two irrationals can land square on a whole number whenever their radicands multiply to a perfect square."
  })
];

// ---- pv1000-03-03: engine replacement. i2's mcq (compare 580 vs 508) becomes a
// dragOrder over 267/276/627/672 — the ordering the lesson is actually about —
// with a predict committing to WHAT decides the order. 276 < 627 verified: place
// beats digit inventory (both use only 2,6,7).
const pvSwap = () => {
  const { f, d } = byId["pv1000-03-03"];
  const step = d.steps.find((s) => s.id === "i2");
  step.widget = {
    type: "dragOrder",
    prompt: "Drag the four numbers into order, least to greatest. Every one uses only the digits 2, 6, and 7.",
    items: [
      { id: "n267", label: "267" },
      { id: "n276", label: "276" },
      { id: "n627", label: "627" },
      { id: "n672", label: "672" }
    ],
    correctOrder: ["n267", "n276", "n627", "n672"],
    misorderFeedback: [
      {
        first: "n627",
        second: "n276",
        feedback:
          "627 has 6 hundreds; 276 has only 2. Hundreds are checked first, and 2 hundreds loses to 6 no matter how the other digits look."
      },
      {
        first: "n276",
        second: "n267",
        feedback:
          "Both start with 2 hundreds, so the TENS decide: 267 carries 6 tens, 276 carries 7 — so 267 comes first."
      },
      {
        first: "n672",
        second: "n627",
        feedback:
          "Both hold 6 hundreds — the tens break the tie: 2 tens (627) sits before 7 tens (672)."
      }
    ],
    missFeedback:
      "Sort by hundreds first (the 2-hundreds pair before the 6-hundreds pair), then let tens order each pair: 267, 276, 627, 672.",
    successFeedback:
      "267 < 276 < 627 < 672 — hundreds split the pairs, tens ordered within. Same digits, four different sizes."
  };
  step.body = "Order a whole set at once — same digits, different spots.";
  step.predict = {
    prompt: "All four numbers use only the digits 2, 6, and 7. What will decide their order?",
    options: [
      { id: "hundreds", label: "The hundreds spot — the biggest spot speaks first" },
      { id: "digits", label: "The biggest digit anywhere in the number" },
      { id: "ones", label: "The ones spot — start where adding starts" }
    ],
    outcomeId: "hundreds",
    reveal:
      "Place beats digit size: 276 sits below 627 even though both use the very same digits, because 2 hundreds can't touch 6 hundreds. Only when hundreds tie do the tens get a vote — comparison scans left to right, the opposite end from addition."
  };
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + "\n");
  console.log("engine swap: pv1000-03-03 i2 mcq → dragOrder + predict");
};

let applied = 0;
for (const { lessonId, stepId, predict } of edits) {
  const entry = byId[lessonId];
  if (!entry) throw new Error(`missing lesson ${lessonId}`);
  const step = entry.d.steps.find((s) => s.id === stepId);
  if (!step) throw new Error(`missing step ${lessonId}/${stepId}`);
  if (step.kind !== "interactive") throw new Error(`${lessonId}/${stepId} is not interactive`);
  if (!step.widget) throw new Error(`${lessonId}/${stepId} has no widget`);
  if (step.predict) throw new Error(`${lessonId}/${stepId} already has a predict`);
  step.predict = predict;
  fs.writeFileSync(entry.f, JSON.stringify(entry.d, null, 2) + "\n");
  applied++;
}
pvSwap();
console.log(`applied ${applied} predict blocks + 1 engine replacement (30 lessons)`);
