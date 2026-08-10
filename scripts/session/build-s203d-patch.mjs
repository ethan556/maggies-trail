#!/usr/bin/env node
/**
 * Builds content/patches/s203d-exponents-percent.json — Batch D of the grades 6-8 Wave 1 expansion.
 *
 * TARGETS.
 *   8.EE.A.1  properties of integer exponents, GENERAL BASE, including zero and negative
 *             (uncovered -> covered). Grade 8 currently teaches powers of TEN only; the general
 *             rules live a year late in G9 `exponents-polynomials`. This chapter brings them home.
 *   7.RP.A.3  simple interest, commissions and fees, percent error — three applications the
 *             standard names explicitly and the corpus never mentions (0 hits corpus-wide).
 *
 * ENGINE CHOICE (HANDOVER §12 — author against the tier floor, don't repair to it).
 *   placeValueTransformLab  manip 3, conseq 3 — its `exponentChain` task IS the exponent rule.
 *       Its schema allows only "add"/"subtract" ops with exponentOps.length === values.length - 1,
 *       which is not a limitation here: a power of a power is repeated multiplication, so (2³)²
 *       becomes the chain 2³ · 2³ with values [3,3] and op ["add"], and 3² · 3⁻⁵ is values [2,-5].
 *       The audit that pins this engine (place-value-transform-s145) is scoped to seven fixed
 *       target lessons, so new usages elsewhere do not disturb its count===50 pin.
 *   percentBar / percentChangeLab  manip 2 — carry the interest, commission and error work.
 *       percent-change-s138 is scoped to pr-04-02 alone, so new usages are safe.
 *
 * SKELETON. c1 i1 k1 k2 c2 i2 k3 ch1 r1 — the shape S203B/C passed the pedagogy lint with.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function lesson({ id, slug, title, courseId, chapterId, minutes, standards, tag, c1, i1, k1, k2, c2, i2, k3, ch1, recap, remedial }) {
  return {
    id, slug, title, courseId, chapterId, minutes, standards,
    steps: [
      { id: "c1", kind: "concept", body: c1.body, figure: c1.figure },
      { id: "i1", kind: "interactive", body: i1.body, widget: i1.widget },
      { id: "k1", kind: "check", body: k1.body, conceptTag: tag, explanationVariants: k1.variants, widget: k1.widget },
      { id: "k2", kind: "check", body: k2.body, conceptTag: tag, explanationVariants: k2.variants, widget: k2.widget },
      { id: "c2", kind: "concept", body: c2.body, figure: c2.figure },
      { id: "i2", kind: "interactive", body: i2.body, widget: i2.widget },
      { id: "k3", kind: "check", body: k3.body, conceptTag: tag, explanationVariants: k3.variants, widget: k3.widget },
      { id: "ch1", kind: "challenge", body: ch1.body, conceptTag: tag, explanationVariants: ch1.variants, hints: ch1.hints, widget: ch1.widget },
      { id: "r1", kind: "recap", body: recap.body, takeaways: recap.takeaways, teaser: recap.teaser }
    ],
    remedials: remedial ? [remedial] : []
  };
}

const num = (prompt, answer, errs, fallback, unit = "") => ({
  type: "numeric", prompt, answer, tolerance: 0, unit,
  commonErrors: errs.map(([value, feedback]) => ({ value, feedback })),
  fallbackFeedback: fallback
});
const mcq = (prompt, opts) => ({
  type: "mcq", prompt,
  options: opts.map(([id, label, correct, feedback]) => ({ id, label, correct, feedback }))
});
/** exponentChain: values are the exponents in order, ops join them. */
const chain = (prompt, values, ops, answer, errs, success) => ({
  type: "placeValueTransformLab", task: "exponentChain", answerMode: "numeric",
  prompt, values, exponentOps: ops, choices: [],
  numericErrors: errs.map(([value, feedback]) => ({ value, feedback })),
  requiredExplorations: 2, tolerance: 0,
  successFeedback: success,
  explorationFeedback: "Step through at least 2 stages of the chain before checking.",
  fallbackFeedback: success
});
const bar = (whole, targetPercent, percentStep, unit, prompt, success, low, high) => ({
  type: "percentBar", whole, targetPercent, percentStep, startPercent: 0, unit, prompt,
  successFeedback: success, lowFeedback: low, highFeedback: high
});

/* ==================================================== G8 — exponent rules for any base */

const esn01b01 = lesson({
  id: "esn-01b-01", slug: "same-base-add-the-exponents", title: "Same Base, Add the Exponents",
  courseId: "exponents-scientific-notation", chapterId: "ch1b-exponent-rules-any-base", minutes: 11,
  standards: ["8.EE.A.1"], tag: "exponent-product-rule",
  c1: {
    figure: "exponent-repeat",
    body: "Powers of ten were the warm-up. The rules work for **any** base, and the reason is just counting.\n\na³ means three a's multiplied; a² means two more. Push them together and you are multiplying five a's, so a³ · a² = a⁵. Nothing was memorised — the exponents added because the factors were counted."
  },
  i1: {
    body: "Step through a chain and watch the count.",
    widget: chain("Simplify 2³ · 2⁴ to a single power 2^?. What is the exponent?", [3, 4], ["add"], 7,
      [[12, "12 multiplies the exponents. Multiplying powers means COUNTING factors, so 3 + 4 = 7."],
       [128, "128 is the value of 2⁷. The question asks for the exponent itself: 7."]],
      "Same base, so the factors accumulate: 3 + 4 = 7, giving 2⁷.")
  },
  k1: {
    body: "A different base, the same counting.",
    variants: [
      "5² · 5⁶ has 2 + 6 = 8 factors of 5, so the exponent is 8.",
      "The base never changes when you multiply powers of it — only the count of factors does."
    ],
    widget: num("Simplify 5² · 5⁶ to a single power 5^?. What is the exponent?", 8,
      [[12, "12 multiplies 2 and 6. Multiplying powers adds the exponents: 2 + 6 = 8."],
       [10, "The base stays 5. Adding the base into the arithmetic gives 10; only the exponents combine."]],
      "2 factors of 5 followed by 6 more makes 8 in all.")
  },
  k2: {
    body: "Division takes factors away.",
    variants: [
      "7⁵ ÷ 7² cancels two 7's from five, leaving 3.",
      "Dividing powers of the same base subtracts exponents: 5 − 2 = 3."
    ],
    widget: num("Simplify 7⁵ ÷ 7² to a single power 7^?. What is the exponent?", 3,
      [[7, "7 adds the exponents, which is the rule for MULTIPLYING. Division cancels factors: 5 − 2 = 3."],
       [2.5, "Dividing the exponents is not the rule. Cancelling two 7's from five leaves three: 5 − 2 = 3."]],
      "Two of the five 7's cancel, leaving 7³.")
  },
  c2: {
    figure: "esn-exponent-rules",
    body: "Two rules, one idea: **multiply adds, divide subtracts** — and both only work when the base is the same.\n\n2³ · 5² cannot be combined at all. There is no shared factor to count, so it stays as it is. The base is the thing being counted; if it differs, there is nothing to add up."
  },
  i2: {
    body: "A longer chain, mixing both directions.",
    widget: chain("Simplify 3⁶ ÷ 3² to a single power 3^?. What is the exponent?", [6, 2], ["subtract"], 4,
      [[3, "3 divides the exponents. Division of powers SUBTRACTS them: 6 − 2 = 4."],
       [8, "8 adds them, which is the multiplication rule. Dividing cancels factors: 6 − 2 = 4."]],
      "Two of the six 3's cancel, leaving 3⁴.")
  },
  k3: {
    body: "Spot the one that cannot be combined.",
    variants: [
      "2⁴ · 3² has different bases, so there is no common factor to count and the rule does not apply.",
      "The exponent rules need a shared base; 2 and 3 are different, so nothing combines."
    ],
    widget: mcq("Which expression CANNOT be written as a single power?", [
      ["a", "2⁴ · 3²", true, "Different bases. There is no shared factor to count, so it stays as it is — the rules need a common base."],
      ["b", "2⁴ · 2²", false, "Same base, so this is 2⁶."],
      ["c", "9⁵ ÷ 9³", false, "Same base, so this is 9²."],
      ["d", "x⁷ · x", false, "Same base, and x is x¹, so this is x⁸."]
    ])
  },
  ch1: {
    body: "The invisible exponent is where this one hides.",
    variants: [
      "m is m¹, so m⁶ · m = m⁶ · m¹ = m⁷.",
      "A variable with nothing written has exponent 1, so the count goes from 6 to 7."
    ],
    hints: [
      "Write the exponent that is not shown on the bare m.",
      "m means m¹, so the product is m⁶ · m¹.",
      "6 + 1 = 7, so the answer is m⁷."
    ],
    widget: num("Simplify m⁶ · m to a single power m^?. What is the exponent?", 7,
      [[6, "The lone m adds one more factor. Since m = m¹, the count goes 6 + 1 = 7."],
       [12, "12 doubles the 6. The bare m contributes exponent 1, not 6."]],
      "m is m¹, so 6 + 1 = 7.")
  },
  recap: {
    body: "Count factors and the rules write themselves.",
    takeaways: [
      "Multiplying powers of the same base adds exponents; dividing subtracts them.",
      "The rules only apply when the base matches — 2⁴ · 3² cannot be combined.",
      "A base with no written exponent has exponent 1."
    ],
    teaser: "Next: what happens when a power is itself raised to a power."
  },
  remedial: {
    conceptTag: "exponent-product-rule",
    concept: { id: "rem-epr-c", kind: "concept", body: "Rewind. a³ · a² means three a's times two more a's — five in all, so a⁵. Multiplying powers of the same base **adds** the exponents." },
    check: {
      id: "rem-epr-k", kind: "check", body: "", conceptTag: "exponent-product-rule",
      explanationVariants: ["4² · 4³ is 2 factors then 3 more, so 5 in all.", "Same base, so add: 2 + 3 = 5."],
      widget: num("Simplify 4² · 4³ to a single power 4^?. What is the exponent?", 5,
        [[6, "6 multiplies 2 and 3. Multiplying powers adds them: 2 + 3 = 5."],
         [1, "1 subtracts them, which is the DIVISION rule. This is multiplication: 2 + 3 = 5."]],
        "Two factors of 4 followed by three more makes five.")
    }
  }
});

const esn01b02 = lesson({
  id: "esn-01b-02", slug: "a-power-of-a-power", title: "A Power of a Power",
  courseId: "exponents-scientific-notation", chapterId: "ch1b-exponent-rules-any-base", minutes: 11,
  standards: ["8.EE.A.1"], tag: "exponent-power-rule",
  c1: {
    figure: "esn8-power-of-power",
    body: "(2³)² looks new but is not. The outer 2 says *take two copies of the block*, so it is 2³ · 2³ — and the product rule takes over: 3 + 3 = 6.\n\nAdding the same number twice is multiplying it by 2, which is why the shortcut reads **(a^m)^n = a^(m·n)**. The multiplication is repeated addition in disguise."
  },
  i1: {
    body: "Unfold the block first, then let the chain do the work.",
    widget: chain("(2³)² means 2³ · 2³. Simplify that to a single power 2^?. What is the exponent?", [3, 3], ["add"], 6,
      [[5, "5 adds 3 and 2 — the outer exponent is a COUNT of blocks, not another factor. Two blocks of three is 3 + 3 = 6."],
       [9, "9 would be 3², treating the exponents as a power. Two copies of three factors is 3 + 3 = 6."]],
      "Two copies of 2³ is 3 + 3 = 6 factors, so (2³)² = 2⁶ — which is 3 × 2.")
  },
  k1: {
    body: "Use the shortcut directly.",
    variants: [
      "(5⁴)³ is three copies of four factors: 4 × 3 = 12.",
      "Power of a power multiplies exponents, so the answer is 5¹²."
    ],
    widget: num("Simplify (5⁴)³ to a single power 5^?. What is the exponent?", 12,
      [[7, "7 adds 4 and 3. Adding is for multiplying two powers; raising a power to a power multiplies: 4 × 3 = 12."],
       [64, "64 is 4³, applying the exponent to the wrong number. The exponents multiply: 4 × 3 = 12."]],
      "Three copies of four factors is 4 × 3 = 12.")
  },
  k2: {
    body: "Now a product inside the bracket.",
    variants: [
      "(ab)³ means abababab regrouped: three a's and three b's, so a³b³.",
      "A power outside a product reaches every factor inside it."
    ],
    widget: mcq("Which is equal to (ab)³?", [
      ["a", "a³b³", true, "Three copies of ab is aaa · bbb once regrouped — the exponent reaches every factor inside."],
      ["b", "ab³", false, "This raises only b. The bracket puts BOTH factors under the exponent."],
      ["c", "3ab", false, "That is ab added three times. The exponent means multiplied three times."],
      ["d", "(ab)(ab)", false, "That is only two copies, which is (ab)². Three copies are needed."]
    ])
  },
  c2: {
    figure: "ep-power-of-product",
    body: "The bracket is the whole story. **(ab)^n = a^n · b^n** because the exponent applies to everything inside it.\n\nThat is why (3x)² = 9x², not 3x². The 3 is inside the bracket and gets squared along with the x — a slip that costs more marks than any other rule in this chapter."
  },
  i2: {
    body: "Unfold a bigger block.",
    widget: chain("(4²)³ means 4² · 4² · 4². Simplify to a single power 4^?. What is the exponent?", [2, 2, 2], ["add", "add"], 6,
      [[5, "5 adds 2 and 3 instead of counting the blocks. Three copies of two factors is 2 + 2 + 2 = 6."],
       [8, "8 is 2³, which raises the wrong number. Three blocks of two factors is 6."]],
      "Three copies of 4² is 2 + 2 + 2 = 6, so (4²)³ = 4⁶ — the same as 2 × 3.")
  },
  k3: {
    body: "Watch the coefficient inside the bracket.",
    variants: [
      "(3x)² = 3x · 3x = 9x², because the 3 is squared too.",
      "Everything inside the bracket gets the exponent, including the 3."
    ],
    widget: mcq("Simplify (3x)².", [
      ["a", "9x²", true, "3x · 3x = 9x². The 3 is inside the bracket, so it is squared as well."],
      ["b", "3x²", false, "This squares only the x. The bracket puts the 3 under the exponent too."],
      ["c", "6x²", false, "6 doubles the 3 instead of squaring it. 3² = 9."],
      ["d", "9x", false, "The x is squared as well: 3x · 3x has two x's."]
    ])
  },
  ch1: {
    body: "Two rules in one expression.",
    variants: [
      "(2³)² · 2 = 2⁶ · 2¹ = 2⁷.",
      "First multiply exponents for the bracket (3 × 2 = 6), then add for the product (6 + 1 = 7)."
    ],
    hints: [
      "Deal with the bracket before the multiplication outside it.",
      "(2³)² multiplies exponents: 3 × 2 = 6, giving 2⁶.",
      "Then 2⁶ · 2 adds exponents: 6 + 1 = 7."
    ],
    widget: num("Simplify (2³)² · 2 to a single power 2^?. What is the exponent?", 7,
      [[12, "12 multiplies 6 by 2 again. After the bracket gives 2⁶, the outside factor ADDS one: 6 + 1 = 7."],
       [6, "6 is the value of the bracket alone. The lone 2 outside contributes one more factor."]],
      "The bracket gives 2⁶; multiplying by 2 adds one more factor, so 2⁷.")
  },
  recap: {
    body: "Brackets multiply, products add.",
    takeaways: [
      "(a^m)^n = a^(m·n) — the outer exponent counts copies of the block.",
      "(ab)^n = a^n b^n — the exponent reaches every factor inside the bracket.",
      "(3x)² = 9x², not 3x²: the coefficient is inside, so it is squared too."
    ],
    teaser: "Next: what an exponent of zero means, and what a negative one does."
  }
});

const esn01b03 = lesson({
  id: "esn-01b-03", slug: "zero-and-negative-exponents", title: "Zero and Negative Exponents",
  courseId: "exponents-scientific-notation", chapterId: "ch1b-exponent-rules-any-base", minutes: 12,
  standards: ["8.EE.A.1"], tag: "exponent-zero-negative",
  c1: {
    figure: "esn8-zero-exponent",
    body: "Walk down the powers of 2: 16, 8, 4, 2 — each step divides by 2. Keep going and 2¹ = 2 becomes **2⁰ = 1**.\n\nThat is not a convention someone invented; it is forced. Anything else would break the pattern, and it would break the quotient rule too: 2³ ÷ 2³ is obviously 1, and the rule says it is 2⁰."
  },
  i1: {
    body: "Let the quotient rule land on zero.",
    widget: chain("Simplify 6⁴ ÷ 6⁴ to a single power 6^?. What is the exponent?", [4, 4], ["subtract"], 0,
      [[1, "1 is the VALUE of 6⁰. The exponent itself is 4 − 4 = 0."],
       [8, "8 adds the exponents, which is the multiplication rule. Division subtracts: 4 − 4 = 0."]],
      "4 − 4 = 0, so the answer is 6⁰ — and since the top and bottom are identical, that must equal 1.")
  },
  k1: {
    body: "Any base at all.",
    variants: [
      "Every non-zero base to the power 0 is 1, so 9⁰ = 1.",
      "The descending pattern forces it: the step below 9¹ = 9 is 9 ÷ 9 = 1."
    ],
    widget: num("What is the value of 9⁰?", 1,
      [[0, "0 would be the answer if the exponent multiplied the base. An exponent of zero means no factors at all, which leaves 1."],
       [9, "9 is 9¹. Dropping the exponent by one divides by 9, giving 1."]],
      "Any non-zero base raised to 0 is 1.")
  },
  k2: {
    body: "Now step below zero.",
    variants: [
      "Continuing the halving past 2⁰ = 1 gives 2⁻¹ = ½, so a negative exponent is a reciprocal.",
      "2⁻² = 1 ÷ 2² = ¼."
    ],
    widget: mcq("What does 2⁻² equal?", [
      ["a", "1/4", true, "A negative exponent flips the base: 2⁻² = 1 ÷ 2² = 1/4."],
      ["b", "−4", false, "The exponent's sign does not make the value negative. It signals a reciprocal: 1/2² = 1/4."],
      ["c", "4", false, "That is 2². The minus sign flips it to 1/4."],
      ["d", "−1/4", false, "The reciprocal is positive. 2⁻² = 1/2² = 1/4."]
    ])
  },
  c2: {
    figure: "ep-negative-exp",
    body: "A negative exponent is **not** a negative number. It is an instruction to flip: a⁻ⁿ = 1 / aⁿ.\n\nAnd the rules keep working across the sign. 3² · 3⁻⁵ adds exponents to 3⁻³, which is 1/3³ = 1/27. No special case is needed — the arithmetic of the exponents simply runs into negative territory."
  },
  i2: {
    body: "Add exponents straight through zero.",
    widget: chain("Simplify 3² · 3⁻⁵ to a single power 3^?. What is the exponent?", [2, -5], ["add"], -3,
      [[3, "3 ignores the minus sign. Adding a negative moves the other way: 2 + (−5) = −3."],
       [-10, "−10 multiplies the exponents. Multiplying powers ADDS them: 2 + (−5) = −3."]],
      "2 + (−5) = −3, so the result is 3⁻³ — which is 1/3³ = 1/27.")
  },
  k3: {
    body: "Convert the answer to a plain number.",
    variants: [
      "3⁻³ = 1/3³ = 1/27, so the denominator is 27.",
      "Flip the base and evaluate: 3³ = 27."
    ],
    widget: num("3⁻³ equals 1/n. What is n?", 27,
      [[9, "9 is 3². The exponent is 3, so the denominator is 3³ = 27."],
       [-27, "The reciprocal is positive: a negative exponent flips the base but does not change its sign."]],
      "3⁻³ = 1/3³, and 3³ = 27.")
  },
  ch1: {
    body: "One expression, every rule in the chapter.",
    variants: [
      "4³ · 4⁻³ = 4⁰ = 1 — the two powers are reciprocals, so they cancel exactly.",
      "3 + (−3) = 0, and any non-zero base to the power 0 is 1."
    ],
    hints: [
      "Add the exponents first, before evaluating anything.",
      "3 + (−3) = 0, so the expression is 4⁰.",
      "Any non-zero base to the power 0 equals 1."
    ],
    widget: num("What is the value of 4³ · 4⁻³?", 1,
      [[0, "0 would need the exponent to reach the value. Adding the exponents gives 4⁰, and 4⁰ = 1."],
       [64, "64 is 4³ alone. The second factor is its reciprocal, 1/64, and the two cancel to 1."]],
      "3 + (−3) = 0, so this is 4⁰ = 1 — the two factors are reciprocals.")
  },
  recap: {
    body: "The rules never needed a special case.",
    takeaways: [
      "a⁰ = 1 for any non-zero a — the descending pattern and the quotient rule both force it.",
      "A negative exponent means a reciprocal: a⁻ⁿ = 1/aⁿ, never a negative value.",
      "Adding exponents works straight through zero and into the negatives."
    ],
    teaser: "Next chapter: square and cube roots, and solving x² = p."
  }
});

/* ==================================================== G7 — interest, commission, error */

const pr04b01 = lesson({
  id: "pr-04b-01", slug: "simple-interest", title: "Simple Interest",
  courseId: "proportional-relationships", chapterId: "ch4b-interest-commission-and-error", minutes: 11,
  standards: ["7.RP.A.3"], tag: "simple-interest",
  c1: {
    figure: "pr7-simple-interest",
    body: "Borrow money and you pay rent on it. That rent is **interest**, and the simple kind is a percent of the original amount, charged once per year.\n\nThe formula is just that sentence: **I = P · r · t** — principal times rate times time. Borrow $500 at 4% for 3 years and each year costs 4% of $500, which is $20, so three years cost $60."
  },
  i1: {
    body: "Find one year's interest by shading it.",
    widget: bar(500, 4, 1, "dollars", "A $500 loan charges 4% interest per year. Shade one year's interest.",
      "$20 for one year. Three years at simple interest is just three of these: $60. The rate always applies to the original $500, never to the growing total.",
      "That is under 4% of the principal.",
      "That is over 4% of the principal.")
  },
  k1: {
    body: "Now the whole term.",
    variants: [
      "I = P · r · t = 800 × 0.05 × 2 = 80.",
      "5% of $800 is $40 per year, and two years is $80."
    ],
    widget: num("Find the simple interest on $800 at 5% per year for 2 years.", 80,
      [[40, "40 is one year's interest. The term is 2 years, so double it."],
       [880, "880 is the total amount owed. The question asks for the interest alone: $80."]],
      "800 × 0.05 × 2 = 80.", "dollars")
  },
  k2: {
    body: "Interest and total are different questions.",
    variants: [
      "The interest is 1000 × 0.06 × 1 = $60, so the total owed is 1000 + 60 = $1,060.",
      "Total = principal + interest, so add the $60 back onto the $1,000."
    ],
    widget: num("$1,000 is borrowed at 6% per year. What is the TOTAL owed after 1 year?", 1060,
      [[60, "60 is the interest alone. The total owed adds it to the principal: 1000 + 60."],
       [1006, "6% of $1,000 is $60, not $6. Percent means per hundred, so 6% of 1000 is 10 × 6."]],
      "Interest is $60, so the total owed is $1,060.", "dollars")
  },
  c2: {
    figure: "pr7-interest-over-time",
    body: "\"Simple\" is doing real work in that name. The rate applies to the **principal** every single year, never to the money that has already piled up.\n\nSo the interest grows in equal steps — a straight staircase, $20 then $40 then $60. That is what separates it from compound interest, where each year's interest earns interest of its own."
  },
  i2: {
    body: "A different rate, same structure.",
    widget: bar(1200, 10, 5, "dollars", "A $1,200 loan charges 10% interest per year. Shade one year's interest.",
      "$120 per year. Over 4 years that is 4 × $120 = $480 — four equal steps, because the 10% never applies to anything but the original $1,200.",
      "That is under 10% of the principal.",
      "That is over 10% of the principal.")
  },
  k3: {
    body: "Read the formula backwards.",
    variants: [
      "I = P · r · t, so 90 = 600 × 0.05 × t, giving t = 90 ÷ 30 = 3 years.",
      "One year costs 5% of $600 = $30, and $90 is three of those."
    ],
    widget: num("$600 at 5% per year earned $90 in simple interest. How many years was that?", 3,
      [[18, "18 divides 90 by 5 and ignores the principal. One YEAR costs 5% of 600 = $30, so 90 ÷ 30 = 3."],
       [2, "Two years would give $60. Three years of $30 makes $90."]],
      "One year is 5% of $600 = $30, and 90 ÷ 30 = 3 years.", "years")
  },
  ch1: {
    body: "Half a year is still just a slice of the rate.",
    variants: [
      "I = 2000 × 0.03 × 0.5 = $30. Half a year earns half the annual interest.",
      "One year would be $60, so six months is $30."
    ],
    hints: [
      "Work out one full year's interest first.",
      "3% of $2,000 is $60 for a whole year.",
      "Six months is half a year, so the interest is half of $60."
    ],
    widget: num("Find the simple interest on $2,000 at 3% per year for 6 months.", 30,
      [[60, "60 is a full year's interest. Six months is half of that."],
       [600, "600 is 30% of the principal. 3% of $2,000 is $60 per year, and half a year is $30."]],
      "A year would be $60, so half a year is $30.", "dollars")
  },
  recap: {
    body: "Rent on borrowed money, charged on the original amount.",
    takeaways: [
      "I = P · r · t — principal times rate times time, with the rate as a decimal.",
      "Interest and total owed are different questions: the total adds the principal back.",
      "Simple interest grows in equal steps because the rate never touches the accumulated interest."
    ],
    teaser: "Next: percents paid to a person for making a sale."
  }
});

const pr04b02 = lesson({
  id: "pr-04b-02", slug: "commission-and-fees", title: "Commission and Fees",
  courseId: "proportional-relationships", chapterId: "ch4b-interest-commission-and-error", minutes: 11,
  standards: ["7.RP.A.3"], tag: "commission-fees",
  c1: {
    figure: "pr7-commission-split",
    body: "A **commission** is a percent of a sale, paid to the person who made it. Sell $2,000 of equipment on 6% commission and you earn 0.06 × 2000 = $120.\n\nThe skill is old — it is *percent of a quantity* — but the trap is new: the percent is always of the **sale**, not of your existing pay and not of what is left over."
  },
  i1: {
    body: "Shade the seller's share.",
    widget: bar(2000, 6, 1, "dollars", "A salesperson earns 6% commission on a $2,000 sale. Shade the commission.",
      "$120. Six percent of the SALE — the customer still paid $2,000, and $1,880 goes to the business.",
      "That is under 6% of the sale.",
      "That is over 6% of the sale.")
  },
  k1: {
    body: "A straightforward one, then the twist.",
    variants: [
      "0.04 × 3500 = 140.",
      "4% of $3,500 is $140 — divide by 100 and multiply by 4."
    ],
    widget: num("An agent earns 4% commission on a $3,500 sale. What is the commission?", 140,
      [[3360, "3360 is what is LEFT after commission. The question asks for the commission itself: $140."],
       [875, "875 divides by 4 instead of taking 4%. A percent means per hundred: 3500 ÷ 100 × 4 = 140."]],
      "4% of $3,500 is $140.", "dollars")
  },
  k2: {
    body: "Base pay plus commission.",
    variants: [
      "Commission is 0.05 × 4000 = $200, so total pay is 300 + 200 = $500.",
      "The percent applies only to the sales, then the flat base pay is added on."
    ],
    widget: num("A clerk earns $300 base pay plus 5% commission on $4,000 of sales. What is the total pay?", 500,
      [[200, "200 is the commission alone. Base pay of $300 is added to it."],
       [515, "515 takes 5% of the base pay as well. The commission is only on the SALES."]],
      "Commission is $200, plus $300 base pay, giving $500.", "dollars")
  },
  c2: {
    figure: "pr7-flat-fee",
    body: "A **fee** behaves differently from a commission, and the difference is proportionality.\n\nA 6% commission doubles when the sale doubles — it is proportional. A flat $5 fee does not: it is the same on a $20 sale and a $2,000 one. Mixing the two gives a relationship that is *not* proportional, which is exactly why the graph of pay-plus-fee misses the origin."
  },
  i2: {
    body: "A larger sale at a smaller rate.",
    widget: bar(5000, 2, 1, "dollars", "A broker charges a 2% fee on a $5,000 transaction. Shade the fee.",
      "$100. Small rate, large sale — 2% of $5,000 still comes to a hundred dollars, which is why rates on big transactions matter so much.",
      "That is under 2% of the transaction.",
      "That is over 2% of the transaction.")
  },
  k3: {
    body: "Tell the flat fee from the percent.",
    variants: [
      "A flat fee is the same whatever the size, so it does not double when the amount doubles.",
      "Only the percentage-based charge scales with the sale."
    ],
    widget: mcq("A service charges a flat $5 fee plus 3% of the order. The order doubles from $100 to $200. What happens to the total charge?", [
      ["a", "It rises from $8 to $11 — less than double", true, "The 3% doubles ($3 → $6) but the flat $5 does not, so the total grows by less than a factor of two."],
      ["b", "It doubles from $8 to $16", false, "That would need every part to double. The flat $5 stays $5 however large the order."],
      ["c", "It stays at $8", false, "The percentage part grows with the order: 3% of $200 is $6, not $3."],
      ["d", "It rises from $8 to $13", false, "Check the percent: 3% of $200 is $6, so the total is 5 + 6 = $11."]
    ])
  },
  ch1: {
    body: "Work backwards from the commission to the sale.",
    variants: [
      "If 8% of the sale is $240, the sale is 240 ÷ 0.08 = $3,000.",
      "1% would be $30, so 100% — the whole sale — is $3,000."
    ],
    hints: [
      "You know the part and the percent; you need the whole.",
      "If 8% is $240, then 1% is 240 ÷ 8 = $30.",
      "The whole sale is 100%, so 100 × $30 = $3,000."
    ],
    widget: num("A salesperson earned $240 at an 8% commission rate. What was the sale amount?", 3000,
      [[1920, "1920 takes 8% OF 240. Here 240 IS the 8%, so divide instead: 240 ÷ 0.08."],
       [30, "30 is 1% of the sale. The full sale is 100 of those: $3,000."]],
      "1% is 240 ÷ 8 = $30, so the whole sale is $3,000.", "dollars")
  },
  recap: {
    body: "A percent of the sale, and a fee that does not care.",
    takeaways: [
      "Commission is a percent of the SALE, not of pay or of what remains.",
      "Base pay plus commission means the percent applies only to the sales part.",
      "A flat fee is not proportional — it does not double when the amount does."
    ],
    teaser: "Next: measuring how badly an estimate missed."
  }
});

const pr04b03 = lesson({
  id: "pr-04b-03", slug: "percent-error", title: "Percent Error",
  courseId: "proportional-relationships", chapterId: "ch4b-interest-commission-and-error", minutes: 11,
  standards: ["7.RP.A.3"], tag: "percent-error",
  c1: {
    figure: "pr7-percent-error",
    body: "Guess 44 when the answer is 50 and you missed by 6. But *how badly* is 6?\n\n**Percent error** answers that: the size of the miss divided by the actual value, as a percent. Here 6 ÷ 50 = 0.12, so 12% error. The denominator is always the actual value — the truth you are being judged against."
  },
  i1: {
    body: "See the miss as a share of the truth.",
    widget: bar(50, 12, 2, "units", "The actual value is 50 and the estimate missed it by 6. Shade the error as a percent of the actual value.",
      "12%. The gap of 6 is 12% of 50 — that is the whole calculation, and it is why percent error is just 'part out of whole' wearing different clothes.",
      "That is under 12% of the actual value.",
      "That is over 12% of the actual value.")
  },
  k1: {
    body: "Compute one end to end.",
    variants: [
      "The miss is |180 − 200| = 20, and 20 ÷ 200 = 0.10 = 10%.",
      "Divide the gap by the ACTUAL value: 20 ÷ 200."
    ],
    widget: num("An estimate of 180 was made when the actual value was 200. What is the percent error?", 10,
      [[11.1, "11.1 divides by the ESTIMATE (20 ÷ 180). Percent error always divides by the actual value: 20 ÷ 200 = 10%."],
       [20, "20 is the size of the miss, not its percent. Divide it by 200 first."]],
      "The gap is 20, and 20 ÷ 200 = 10%.", "percent")
  },
  k2: {
    body: "Over or under does not matter to the size.",
    variants: [
      "Percent error uses the size of the gap, so overestimating by 5 gives the same error as underestimating by 5.",
      "The absolute value is taken before dividing, so the sign disappears."
    ],
    widget: mcq("An estimate of 105 and an estimate of 95 are both compared to an actual value of 100. What are their percent errors?", [
      ["a", "Both 5%", true, "Percent error uses the SIZE of the gap. Both missed by 5, so both are 5 ÷ 100 = 5%."],
      ["b", "5% and −5%", false, "Percent error is never negative — the size of the gap is taken before dividing."],
      ["c", "5% and 5.3%", false, "Both divide by the actual value of 100, not by the estimates, so both give exactly 5%."],
      ["d", "105% and 95%", false, "Those are the estimates as percents of the actual. The ERROR is the gap: 5 out of 100."]
    ])
  },
  c2: {
    figure: "pr7-error-vs-size",
    body: "Percent error exists because a raw miss means nothing on its own.\n\nMissing by 2 when the answer is 10 is a 20% error — serious. Missing by 2 when the answer is 1,000 is 0.2% — barely worth mentioning. Same gap, completely different verdicts, and only the percent tells them apart."
  },
  i2: {
    body: "A small gap on a large quantity.",
    widget: bar(400, 5, 1, "units", "An estimate missed an actual value of 400 by 20. Shade the error as a percent of the actual value.",
      "5%. Twenty sounds like a lot until you compare it to 400 — that is what percent error is for.",
      "That is under 5% of the actual value.",
      "That is over 5% of the actual value.")
  },
  k3: {
    body: "Judge two estimates fairly.",
    variants: [
      "The first is 3 ÷ 30 = 10%; the second is 10 ÷ 500 = 2%. The second is the better estimate despite the larger raw miss.",
      "Compare percents, not gaps: 10% against 2%."
    ],
    widget: mcq("Estimate A misses 30 by 3. Estimate B misses 500 by 10. Which is the better estimate?", [
      ["a", "B, because 2% error beats 10%", true, "3 ÷ 30 = 10% and 10 ÷ 500 = 2%. B's raw miss is bigger but far smaller relative to what was measured."],
      ["b", "A, because 3 is a smaller miss than 10", false, "Raw gaps cannot be compared across different quantities — that is exactly the problem percent error solves."],
      ["c", "They are equally good", false, "10% and 2% are very different. Divide each gap by its own actual value."],
      ["d", "B, because 500 is larger than 30", false, "The size of the quantity alone does not decide it. Compare the percent errors: 2% against 10%."]
    ])
  },
  ch1: {
    body: "Work back from the percent to the estimate.",
    variants: [
      "4% of 250 is 10, so an estimate that is too low reads 250 − 10 = 240.",
      "Find the gap first: 0.04 × 250 = 10, then subtract because the estimate was under."
    ],
    hints: [
      "Turn the percent into an actual gap first.",
      "4% of 250 is 0.04 × 250 = 10.",
      "The estimate was too LOW, so subtract: 250 − 10 = 240."
    ],
    widget: num("A measurement has 4% error and is too low. The actual value is 250. What was the measurement?", 240,
      [[260, "260 is too HIGH. The question says the measurement was under, so subtract the gap of 10."],
       [246, "246 subtracts 4 rather than 4% of 250. The gap is 0.04 × 250 = 10."]],
      "The gap is 4% of 250 = 10, and the estimate was low: 250 − 10 = 240.")
  },
  recap: {
    body: "How wrong, relative to what?",
    takeaways: [
      "Percent error = size of the gap ÷ ACTUAL value, written as a percent.",
      "It is never negative — over and under by the same amount give the same error.",
      "It is what makes estimates of different sizes comparable at all."
    ],
    teaser: "Next chapter: scale drawings, and what happens to area when lengths change."
  }
});

/* ==================================================== patch */

const patch = {
  label: "S203D exponents & percent applications — general-base exponent rules (8.EE.A.1), simple interest / commission / percent error (7.RP.A.3)",
  totalLessons: 6,
  chapterInsertions: [
    {
      courseSlug: "exponents-scientific-notation",
      chapter: {
        id: "ch1b-exponent-rules-any-base",
        title: "Exponent Rules for Any Base",
        lessonIds: ["esn-01b-01", "esn-01b-02", "esn-01b-03"]
      },
      position: { after: "ch1-powers-of-ten" },
      lessons: [esn01b01, esn01b02, esn01b03],
      seamEdit: {
        lessonId: "esn-01-03",
        field: "recap.teaser",
        expect: "Next chapter: square and cube roots.",
        newValue: "Next chapter: the same exponent rules, freed from base ten — and what a zero or negative exponent means."
      }
    },
    {
      courseSlug: "proportional-relationships",
      chapter: {
        id: "ch4b-interest-commission-and-error",
        title: "Interest, Commission & Error",
        lessonIds: ["pr-04b-01", "pr-04b-02", "pr-04b-03"]
      },
      position: { after: "ch4-percent-problems" },
      lessons: [pr04b01, pr04b02, pr04b03],
      seamEdit: {
        lessonId: "pr-04-03",
        field: "recap.teaser",
        expect: "you've completed unit rates, proportionality, graphing, and percent problems — the full 7.RP domain!",
        newValue: "next: percents at work — interest on a loan, commission on a sale, and how far an estimate missed."
      }
    }
  ]
};

mkdirSync(join(root, "content/patches"), { recursive: true });
const out = join(root, "content/patches/s203d-exponents-percent.json");
writeFileSync(out, JSON.stringify(patch, null, 2) + "\n");
console.log(`wrote ${out}: ${patch.chapterInsertions.reduce((t, c) => t + c.lessons.length, 0)} lessons`);
