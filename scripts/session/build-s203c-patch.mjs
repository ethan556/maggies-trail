#!/usr/bin/env node
/**
 * Builds content/patches/s203c-expressions.json — Batch C of the grades 6-8 Wave 1 expansion.
 *
 * TARGETS. Two chapters, six lessons, closing the two remaining UNCOVERED expressions-and-equations
 * sub-standards and advancing one incomplete one:
 *   6.EE.A.2b  identify the parts of an expression using mathematical terms   (uncovered -> covered)
 *   7.EE.A.2   rewriting an expression in a different form sheds light        (uncovered -> covered)
 *   7.EE.A.1   ... factor ... linear expressions with rational coefficients   (incomplete -> served)
 *
 * TIER FLOOR (HANDOVER §12). `flagship-tier.mjs` scores d.manip as the MAX over the engines a
 * lesson uses, and numeric/mcq are manip 0. S203B shipped four lessons built only from those and
 * they all landed Tier C. Every lesson here therefore carries at least one manip>=2 engine:
 *   algebraTiles     manip 2, conseq 3  — build the expression, see the grouping
 *   percentChangeLab manip 2, conseq 3  — the a + 0.05a = 1.05a moment, made physical
 *   balanceScale     manip 2, conseq 3
 * `buildExpression` is manip 1 and is used only as a supporting entry surface, never alone.
 *
 * SKELETON. c1 i1 k1 k2 c2 i2 k3 ch1 r1 — nine steps, six of them action (67%, floor is 60%),
 * no two concepts adjacent, each concept followed immediately by an interactive, challenge in the
 * final third, recap last. This is the shape S203B's lessons passed the pedagogy lint with.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Assemble one lesson from the nine-step spec. */
function lesson({ id, slug, title, courseId, chapterId, minutes, standards, tag, c1, i1, k1, k2, c2, i2, k3, ch1, recap, remedial }) {
  const steps = [
    { id: "c1", kind: "concept", body: c1.body, figure: c1.figure },
    { id: "i1", kind: "interactive", body: i1.body, widget: i1.widget },
    { id: "k1", kind: "check", body: k1.body, conceptTag: tag, explanationVariants: k1.variants, widget: k1.widget },
    { id: "k2", kind: "check", body: k2.body, conceptTag: tag, explanationVariants: k2.variants, widget: k2.widget },
    { id: "c2", kind: "concept", body: c2.body, figure: c2.figure },
    { id: "i2", kind: "interactive", body: i2.body, widget: i2.widget },
    { id: "k3", kind: "check", body: k3.body, conceptTag: tag, explanationVariants: k3.variants, widget: k3.widget },
    { id: "ch1", kind: "challenge", body: ch1.body, conceptTag: tag, explanationVariants: ch1.variants, hints: ch1.hints, widget: ch1.widget },
    { id: "r1", kind: "recap", body: recap.body, takeaways: recap.takeaways, teaser: recap.teaser }
  ];
  return { id, slug, title, courseId, chapterId, minutes, standards, steps, remedials: remedial ? [remedial] : [] };
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
const tiles = (prompt, targetX, targetConst, maxTiles, success, xFb, constFb) => ({
  type: "algebraTiles", prompt, targetX, targetConst, maxTiles, xStart: 0, constStart: 0,
  successFeedback: success, xFeedback: xFb, constFeedback: constFb
});

/* ============================================================ G7 — factoring & structure */

const tse01b01 = lesson({
  id: "tse-01b-01", slug: "factoring-a-linear-expression", title: "Factoring: Distribution Run Backwards",
  courseId: "two-step-equations", chapterId: "ch1b-factoring-and-structure", minutes: 11,
  standards: ["7.EE.A.1"], tag: "factor-linear",
  c1: {
    figure: "tse7-factor-two-ways",
    body: "Distributing takes 3(x + 4) apart into 3x + 12. **Factoring** runs the same road the other way: it takes 3x + 12 and finds the equal groups hiding inside it.\n\nThe question factoring asks is always the same — *what does every term share?* Here both 3x and 12 are divisible by 3, so three equal rows of (x + 4) can be built."
  },
  i1: {
    body: "Lay out the expression and look for the rows.",
    widget: tiles("Build 3x + 12 with tiles: three x-tiles and twelve unit tiles.", 3, 12, 16,
      "Now arrange them as three equal rows: each row holds one x and four units, so 3x + 12 = 3(x + 4). The 3 outside is what every term had in common.",
      "Check the x-tiles: 3x means three of them.",
      "Check the unit tiles: twelve, which is what splits into three fours.")
  },
  k1: {
    body: "Find the shared factor first — it is the whole job.",
    variants: [
      "8 and 12 are both divisible by 4, and no larger number divides both, so the greatest common factor is 4: 8x + 12 = 4(2x + 3).",
      "List what divides both 8 and 12: 1, 2, 4. The largest is 4, so 4 comes out front."
    ],
    widget: num("What is the greatest common factor of the terms in 8x + 12?", 4,
      [[2, "2 does divide both, but so does 4 — and 4 is larger. Factoring is only finished when the GREATEST common factor comes out."],
       [8, "8 divides 8x but not 12. The factor has to divide EVERY term."]],
      "Both 8 and 12 are divisible by 4, and nothing bigger divides both: the GCF is 4.")
  },
  k2: {
    body: "Now write the factored form.",
    variants: [
      "Pull out 5: 10x ÷ 5 = 2x and 15 ÷ 5 = 3, so 10x + 15 = 5(2x + 3).",
      "Ask what 5 must be multiplied by to reach each term: 5 · 2x = 10x and 5 · 3 = 15."
    ],
    widget: mcq("Which is 10x + 15 written in factored form?", [
      ["a", "5(2x + 3)", true, "5 · 2x = 10x and 5 · 3 = 15. Distributing back returns the original, which is how you check any factoring."],
      ["b", "5(2x + 15)", false, "Distributing this gives 10x + 75. The 15 also has to be divided by 5, giving 3."],
      ["c", "10(x + 15)", false, "Distributing this gives 10x + 150. 10 does not divide 15, so it cannot be the common factor."],
      ["d", "5(10x + 15)", false, "This multiplies the whole expression by 5 instead of pulling 5 out. Divide each term by 5 first."]
    ])
  },
  c2: {
    figure: "tse7-factor-gcf-choice",
    body: "A common factor is not always **the** common factor. 12x + 18 really does equal 2(6x + 9) — but a 3 is still hiding inside that bracket, so the job is half done.\n\nTaking out the *greatest* common factor, 6, leaves 6(2x + 3) with nothing left to pull. That is what \"fully factored\" means."
  },
  i2: {
    body: "Build one and read the grouping off the tiles.",
    widget: tiles("Build 4x + 10 with tiles: four x-tiles and ten unit tiles.", 4, 10, 16,
      "Split them into two equal rows and each row holds 2x + 5, so 4x + 10 = 2(2x + 5). Note that 2 is as far as this one goes — 5 is odd, so no larger factor is shared.",
      "Check the x-tiles: 4x means four.",
      "Check the unit tiles: ten, which splits evenly into two fives.")
  },
  k3: {
    body: "One more, and watch the size of the factor.",
    variants: [
      "3 divides both 9x and 6, and nothing larger does (6 is not divisible by 9), so 9x + 6 = 3(3x + 2).",
      "9 = 3 · 3 and 6 = 3 · 2. The 3 they share comes out front, leaving 3x + 2."
    ],
    widget: num("Factor 9x + 6. What number goes outside the bracket?", 3,
      [[9, "9 divides 9x but not 6. A common factor must divide every term."],
       [2, "2 divides 6 but not 9x. Check both terms before choosing."]],
      "Both terms are divisible by 3 and by nothing larger: 9x + 6 = 3(3x + 2).")
  },
  ch1: {
    body: "Negatives do not change the method — only the bookkeeping.",
    variants: [
      "−6x and 15 are both divisible by 3: −6x ÷ 3 = −2x and 15 ÷ 3 = 5, so −6x + 15 = 3(−2x + 5).",
      "Take out 3 and ask what is left of each term: −2x from the first, +5 from the second."
    ],
    hints: [
      "Ignore the signs for a moment and ask what number divides both 6 and 15.",
      "That number is 3. Now divide EACH term by 3, keeping its sign.",
      "−6x ÷ 3 = −2x and 15 ÷ 3 = 5, so the bracket holds −2x + 5."
    ],
    widget: mcq("Factor −6x + 15 completely.", [
      ["a", "3(−2x + 5)", true, "Distributing back: 3 · (−2x) = −6x and 3 · 5 = 15. Correct, and fully factored — 2 and 5 share nothing."],
      ["b", "3(−2x + 15)", false, "Distributing gives −6x + 45. The 15 must be divided by 3 as well, giving 5."],
      ["c", "−3(2x + 5)", false, "Distributing gives −6x − 15, but the second term is +15. Pulling out a negative flips BOTH signs inside."],
      ["d", "6(−x + 2.5)", false, "6 does not divide 15 into a whole number. Common factors of an integer expression should leave integers behind."]
    ])
  },
  recap: {
    body: "Factoring is the undo button for distributing.",
    takeaways: [
      "Factoring asks one question: what do all the terms share?",
      "Only the GREATEST common factor leaves a bracket with nothing left to pull out.",
      "Check any factoring by distributing back — it must return the original."
    ],
    teaser: "Next: the same value written two ways, and why one of the forms tells you the story."
  },
  remedial: {
    conceptTag: "factor-linear",
    concept: { id: "rem-fl-c", kind: "concept", body: "Rewind. To factor, divide **every** term by the shared number and write that number outside the bracket. 6x + 8: both are divisible by 2, so it is 2(3x + 4)." },
    check: {
      id: "rem-fl-k", kind: "check", body: "", conceptTag: "factor-linear",
      explanationVariants: ["Both 6 and 8 are divisible by 2, and nothing larger divides both, so the GCF is 2.", "2 is the largest number dividing 6 and 8, giving 2(3x + 4)."],
      widget: num("What is the greatest common factor of the terms in 6x + 8?", 2,
        [[6, "6 divides 6x but not 8. It must divide every term."],
         [4, "4 divides 8 but not 6. Check both terms."]],
        "2 divides both 6 and 8 and nothing larger does.")
    }
  }
});

const tse01b02 = lesson({
  id: "tse-01b-02", slug: "the-multiplier-inside-a-percent-increase", title: "The Multiplier Inside a Percent Increase",
  courseId: "two-step-equations", chapterId: "ch1b-factoring-and-structure", minutes: 11,
  standards: ["7.EE.A.2"], tag: "structure-multiplier",
  c1: {
    figure: "tse7-one-step-multiplier",
    body: "Raise a price *a* by 5% and the natural way to write it is two moves: the price, plus 5% of the price. That is a + 0.05a.\n\nBut a is really 1a, so a + 0.05a is 1a + 0.05a — like terms. Combined, they are **1.05a**. Same value, one move instead of two."
  },
  i1: {
    body: "Do it the two-step way first, and watch where the total lands.",
    widget: {
      type: "percentChangeLab",
      prompt: "A jacket costs $40. The shop raises the price by 5%. What is the new price?",
      base: 40, percent: 5, direction: "markup", currency: "$",
      choices: [
        { id: "correct", label: "$42.00", value: 42, feedback: "5% of $40 is $2, so the new price is $42. Notice: 40 × 1.05 = 42 as well — one multiplication reaches the same place." },
        { id: "wrong-1", label: "$40.05", value: 40.05, feedback: "5% of $40 is $2.00, not $0.05. The percent is of the PRICE, not five cents." },
        { id: "wrong-2", label: "$2.00", value: 2, feedback: "$2 is the increase alone. The question asks for the new price: 40 + 2 = 42." },
        { id: "wrong-3", label: "$60.00", value: 60, feedback: "That is a 50% increase. 5% of 40 is 2, not 20." }
      ],
      fallbackFeedback: "5% of $40 is $2, so the new price is $42 — which is also 40 × 1.05.",
      successFeedback: "5% of $40 is $2, so the new price is $42. And 40 × 1.05 = 42: the two-step route and the one-step multiplier agree."
    }
  },
  k1: {
    body: "Write the combined form.",
    variants: [
      "a is 1a, so a + 0.08a = 1a + 0.08a = 1.08a.",
      "Both terms carry a, so add the coefficients: 1 + 0.08 = 1.08."
    ],
    widget: num("Combine a + 0.08a into a single term. What is the coefficient?", 1.08,
      [[0.08, "0.08a is only the increase. The original a is still there, so the coefficient is 1 + 0.08."],
       [1.8, "Careful with place value: 8% is 0.08, not 0.8. That would be an 80% increase."]],
      "a is 1a, so a + 0.08a = 1.08a.")
  },
  k2: {
    body: "Read a multiplier backwards.",
    variants: [
      "1.12a is 1a + 0.12a — the original plus 12% of it, so the increase is 12%.",
      "Subtract the 1 that represents the original amount: 1.12 − 1 = 0.12 = 12%."
    ],
    widget: mcq("A total is written as 1.12p. What does that say about p?", [
      ["a", "p was increased by 12%", true, "1.12p = 1p + 0.12p: the whole original plus 12% of it."],
      ["b", "p was increased by 112%", false, "An increase of 112% would more than double p, giving 2.12p. The leading 1 is the original itself."],
      ["c", "p was decreased by 12%", false, "A 12% decrease would be 0.88p. Multipliers above 1 grow the amount."],
      ["d", "p was multiplied by 12", false, "That would be 12p. Read the decimal carefully: 1.12 is just over one."]
    ])
  },
  c2: {
    figure: "pr7-percent-multiplier",
    body: "The multiplier form is not merely shorter — it is more **useful**. Two increases in a row become 1.05 × 1.05 instead of a two-line calculation done twice, and a decrease of 20% becomes × 0.80.\n\nThat is what the standard means by rewriting an expression to shed light: the second form makes the rate visible as a single number."
  },
  i2: {
    body: "A markdown, so the multiplier drops below 1.",
    widget: {
      type: "percentChangeLab",
      prompt: "A $60 coat is marked down 20%. What is the sale price?",
      base: 60, percent: 20, direction: "markdown", currency: "$",
      choices: [
        { id: "correct", label: "$48.00", value: 48, feedback: "20% of $60 is $12, so the sale price is $48 — and 60 × 0.80 = 48. Keeping 80% is the one-step version of removing 20%." },
        { id: "wrong-1", label: "$12.00", value: 12, feedback: "$12 is the discount itself. Subtract it from the price: 60 − 12 = 48." },
        { id: "wrong-2", label: "$40.00", value: 40, feedback: "That is a one-third reduction. 20% of 60 is 12, not 20." },
        { id: "wrong-3", label: "$58.00", value: 58, feedback: "20% of $60 is $12, not $2. Percent is per hundred, so 20% is a fifth." }
      ],
      fallbackFeedback: "20% of $60 is $12, so the sale price is $48 — the same as 60 × 0.80.",
      successFeedback: "20% of $60 is $12, giving $48. As a multiplier: keeping 80% means × 0.80."
    }
  },
  k3: {
    body: "Name the multiplier for a decrease.",
    variants: [
      "Removing 15% leaves 85%, so the multiplier is 0.85.",
      "b − 0.15b = 0.85b: the coefficient is 1 − 0.15."
    ],
    widget: num("Write b − 0.15b as a single term. What is the coefficient?", 0.85,
      [[0.15, "0.15b is the part removed, not what remains. What is left is 1 − 0.15."],
       [1.15, "1.15 would be an INCREASE of 15%. This is a subtraction, so the multiplier drops below 1."]],
      "b is 1b, so b − 0.15b = 0.85b.")
  },
  ch1: {
    body: "Two moves in a row — and this is where the multiplier form earns its keep.",
    variants: [
      "A 10% rise then another 10% rise is × 1.10 twice: 1.10 × 1.10 = 1.21, a 21% increase overall.",
      "The second rise applies to the already-raised amount, so the increases do not simply add to 20%."
    ],
    hints: [
      "Write each increase as a multiplier first.",
      "A 10% increase is × 1.10, so two of them in a row is 1.10 × 1.10.",
      "1.10 × 1.10 = 1.21, which is 1 + 0.21 — an increase of 21%, not 20%."
    ],
    widget: mcq("A price rises 10%, then rises 10% again. By what percent has it risen overall?", [
      ["a", "21%", true, "1.10 × 1.10 = 1.21. The second rise is charged on the already-raised price, so the extra 1% is the growth on the growth."],
      ["b", "20%", false, "That would be right if both increases applied to the ORIGINAL price. The second one applies to the new, larger price."],
      ["c", "100%", false, "The price has not doubled. Doubling would be a multiplier of 2."],
      ["d", "11%", false, "That adds 10% and 1%. Multipliers compound by multiplying: 1.10 × 1.10 = 1.21."]
    ])
  },
  recap: {
    body: "One expression, two forms, different amounts of light.",
    takeaways: [
      "a + 0.05a and 1.05a are the same value — a is 1a, so the coefficients simply add.",
      "A multiplier above 1 is an increase; below 1, a decrease. 0.80 means 20% off.",
      "Repeated changes multiply their multipliers, which is why 10% twice is 21%, not 20%."
    ],
    teaser: "Next: when the question changes, the useful form changes with it."
  }
});

const tse01b03 = lesson({
  id: "tse-01b-03", slug: "choosing-the-form-that-answers-the-question", title: "Choosing the Form That Answers the Question",
  courseId: "two-step-equations", chapterId: "ch1b-factoring-and-structure", minutes: 11,
  standards: ["7.EE.A.2"], tag: "structure-choose-form",
  c1: {
    figure: "tse7-form-chooses-story",
    body: "8n + 8 and 8(n + 1) are the same number for every n. They are not equally **useful**.\n\nIf you want the total cost, 8n + 8 is already arithmetic you can do. If you want to know how many things were bought at $8 each, 8(n + 1) says it outright: n + 1 of them. The question picks the form."
  },
  i1: {
    body: "Build the total, then look at it as groups.",
    widget: tiles("A club charges $8 per member plus an $8 room fee. Build 8n + 8 for n = 3: three groups of 8, plus 8 more.", 8, 8, 20,
      "24 + 8 = 32. Written as 8(n + 1) it reads 8(3 + 1) = 8 × 4 = 32 — four lots of $8, because the room fee costs the same as one extra member.",
      "Check the x-tiles: 8n means eight per member.",
      "Check the unit tiles: the flat $8 room fee.")
  },
  k1: {
    body: "Which form answers *this* question?",
    variants: [
      "6(w + 2) shows the number of equal groups directly: w + 2 of them, each worth 6.",
      "The factored form puts the group count inside the bracket, so it is the one to read."
    ],
    widget: mcq("You want to know how many equal groups of 6 there are. Which form shows it immediately?", [
      ["a", "6(w + 2)", true, "The bracket holds the number of groups: w + 2 of them, each of size 6."],
      ["b", "6w + 12", false, "This is the same value, but it shows the two pieces of the total rather than the group count."],
      ["c", "6w + 2", false, "This is not even equal to 6(w + 2) — distributing gives 6w + 12."],
      ["d", "w + 8", false, "This is a different expression entirely; it is not equivalent."]
    ])
  },
  k2: {
    body: "Same value, checked by substitution.",
    variants: [
      "5(t + 3) at t = 4 is 5 × 7 = 35, and 5t + 15 at t = 4 is 20 + 15 = 35. Equivalent forms agree at every value.",
      "Substitute into either: both give 35, which is what equivalent means."
    ],
    widget: num("Evaluate 5(t + 3) when t = 4.", 35,
      [[23, "23 comes from 5 × 4 + 3 — the 5 must reach BOTH parts of the bracket. Add inside first: 5 × 7."],
       [20, "20 is 5t alone. The +3 inside the bracket is still waiting."]],
      "Inside the bracket first: 4 + 3 = 7, then 5 × 7 = 35.")
  },
  c2: {
    figure: "ee-equivalence",
    body: "There is a test, and it is not opinion: two forms are equivalent when they agree for **every** value of the variable, not just the one you tried.\n\nOne substitution can fool you — 2x and x² both give 4 at x = 2. Distributing or factoring is what proves equivalence; substitution only ever disproves it."
  },
  i2: {
    body: "Build both sides of a claimed equivalence and compare.",
    widget: tiles("Build 2(3x + 5) by laying out two groups of three x-tiles and five units.", 6, 10, 20,
      "6x + 10 — so 2(3x + 5) = 6x + 10. Both the 3x and the 5 were doubled, which is exactly what distributing means.",
      "Check the x-tiles: two groups of 3x is 6x.",
      "Check the unit tiles: two groups of 5 is 10, not 5.")
  },
  k3: {
    body: "Spot the impostor.",
    variants: [
      "Distributing 4(x + 3) gives 4x + 12, not 4x + 3 — the 4 must reach the 3 as well.",
      "Test at x = 1: 4(1 + 3) = 16 but 4(1) + 3 = 7. They disagree, so they are not equivalent."
    ],
    widget: mcq("Which expression is NOT equivalent to 4(x + 3)?", [
      ["a", "4x + 3", true, "Correct — this is the impostor. Distributing 4(x + 3) gives 4x + 12; the 4 reaches both terms."],
      ["b", "4x + 12", false, "This IS equivalent — it is the distributed form."],
      ["c", "2(2x + 6)", false, "This IS equivalent — distributing gives 4x + 12."],
      ["d", "x + x + x + x + 12", false, "This IS equivalent — four x's is 4x, plus 12."]
    ])
  },
  ch1: {
    body: "Now use the structure rather than grinding the arithmetic.",
    variants: [
      "99(k + 1) = 99k + 99. At k = 1 that is 198, and the factored form gets there as 99 × 2 with no multi-digit work.",
      "Reading it as 99 groups of (k + 1) turns a hard multiplication into 99 × 2."
    ],
    hints: [
      "Do not multiply out 99 × anything yet — look at the bracket first.",
      "Substitute k = 1 INSIDE the bracket: what does (k + 1) become?",
      "(1 + 1) = 2, so the whole thing is 99 × 2 = 198."
    ],
    widget: num("Evaluate 99(k + 1) when k = 1, using the structure rather than expanding.", 198,
      [[100, "100 is 99 + 1 — that adds the bracket instead of multiplying by it. The 99 multiplies the whole (k + 1)."],
       [99, "99 is 99k alone at k = 1. The bracket holds k + 1 = 2, so it is 99 × 2."]],
      "The bracket becomes 1 + 1 = 2, so the value is 99 × 2 = 198.")
  },
  recap: {
    body: "The form is a choice, and the question makes it.",
    takeaways: [
      "Equivalent forms agree for every value; distributing or factoring is what proves it.",
      "The factored form shows the number of groups; the expanded form shows the separate pieces.",
      "Reading structure first often replaces a hard calculation with an easy one."
    ],
    teaser: "Next chapter: equations with two steps to undo, and the order to undo them in."
  }
});

/* ============================================================ G6 — the language of expressions */

const ee02b01 = lesson({
  id: "ee-02b-01", slug: "naming-the-parts-of-an-expression", title: "Naming the Parts",
  courseId: "expressions-equations", chapterId: "ch2b-the-language-of-expressions", minutes: 10,
  standards: ["6.EE.A.2b"], tag: "expression-parts",
  c1: {
    figure: "ee-expression-anatomy",
    body: "Mathematics has exact words for the pieces of an expression, and using them saves a lot of pointing.\n\nIn 5x + 3y − 7, the **terms** are the pieces the + and − signs separate: 5x, 3y and 7. The 5 multiplying x is called its **coefficient**. The 7, with no variable attached, is the **constant**."
  },
  i1: {
    body: "Build one and count what you see.",
    widget: tiles("Build the expression 4x + 6: four x-tiles and six unit tiles.", 4, 6, 12,
      "Two terms: 4x and 6. The coefficient of x is 4 — that is how many x-tiles you laid down — and 6 is the constant term, the tiles with no x attached.",
      "Check the x-tiles: the coefficient 4 tells you how many.",
      "Check the unit tiles: the constant term is 6.")
  },
  k1: {
    body: "Count the terms.",
    variants: [
      "Terms are separated by + and − signs: 2m, 5n and 9 — that is three.",
      "Reading left to right, each + or − starts a new term, giving three."
    ],
    widget: num("How many terms are in 2m + 5n − 9?", 3,
      [[2, "The variables are two, but terms include the constant: 2m, 5n and 9 make three."],
       [4, "Count the pieces between the signs, not the symbols: 2m, 5n, 9."]],
      "The + and − signs separate three terms: 2m, 5n and 9.")
  },
  k2: {
    body: "Name a coefficient.",
    variants: [
      "The coefficient is the number multiplying the variable, so in 7y it is 7.",
      "7y means 7 · y; the numeric factor 7 is the coefficient."
    ],
    widget: num("In the expression 7y + 2, what is the coefficient of y?", 7,
      [[2, "2 is the constant term — it has no variable attached. The coefficient of y is the number multiplying y."],
       [1, "1 would be the coefficient if the term were just y. Here 7 is written in front."]],
      "7y means 7 times y, so the coefficient is 7.")
  },
  c2: {
    figure: "ee-term-vs-factor",
    body: "**Terms** and **factors** are easy to mix up, and the difference is the operation.\n\nTerms are added: in 4a + 9, the terms are 4a and 9. Factors are multiplied: inside the single term 4a, the factors are 4 and a. Added pieces are terms; multiplied pieces are factors."
  },
  i2: {
    body: "One term, two factors — build it and see.",
    widget: tiles("Build 3x + 5: three x-tiles and five unit tiles.", 3, 5, 12,
      "Two terms: 3x and 5. Inside the term 3x live two factors, 3 and x — that is why three separate x-tiles appear. Added pieces are terms; multiplied pieces are factors.",
      "Check the x-tiles: 3x means three of them, because 3 and x are multiplied.",
      "Check the unit tiles: the second term is 5.")
  },
  k3: {
    body: "Terms or factors?",
    variants: [
      "6n is one term made of the factors 6 and n, because 6 and n are multiplied.",
      "There is no + or − inside 6n, so it is a single term; its parts are factors."
    ],
    widget: mcq("In the expression 6n, what are 6 and n?", [
      ["a", "factors of a single term", true, "6n means 6 · n. Multiplied pieces are factors, and the whole thing is one term."],
      ["b", "two separate terms", false, "Terms are separated by + or −. There is no such sign here, so 6n is one term."],
      ["c", "two constants", false, "n is a variable, not a constant — a constant has no letter."],
      ["d", "coefficients", false, "Only 6 is the coefficient. n is the variable it multiplies."]
    ])
  },
  ch1: {
    body: "Put every name to work at once.",
    variants: [
      "8p + p + 4 has three terms. The coefficient of the first p is 8, the second p has an invisible coefficient of 1, and 4 is the constant.",
      "Count between the signs: 8p, p and 4 — three terms, with 4 the only one carrying no variable."
    ],
    hints: [
      "Start by marking where each + or − sign falls.",
      "Each sign starts a new term — including the bare p on its own.",
      "8p, p and 4: that is three terms, and only 4 is constant."
    ],
    widget: num("How many terms are in 8p + p + 4?", 3,
      [[2, "The bare p is a term of its own, even without a number in front. Count 8p, p and 4."],
       [4, "Count the pieces, not the symbols: 8p, p, 4."]],
      "Three terms: 8p, p and 4.")
  },
  recap: {
    body: "Exact words for exact pieces.",
    takeaways: [
      "Terms are separated by + and −; factors are multiplied inside a term.",
      "A coefficient is the number multiplying a variable; a constant has no variable at all.",
      "Naming the parts is what lets you say precisely which piece you mean."
    ],
    teaser: "Next: the coefficients you cannot see, and why every term has one."
  },
  remedial: {
    conceptTag: "expression-parts",
    concept: { id: "rem-ep-c", kind: "concept", body: "Rewind. **Terms** are the pieces the + and − signs separate. In 3x + 8 there are two terms: 3x and 8." },
    check: {
      id: "rem-ep-k", kind: "check", body: "", conceptTag: "expression-parts",
      explanationVariants: ["The + sign separates 3x from 8, so there are two terms.", "Count the pieces between the signs: 3x, then 8."],
      widget: num("How many terms are in 3x + 8?", 2,
        [[1, "The + sign splits the expression into two pieces: 3x and 8."],
         [3, "Count the pieces, not the symbols: 3x and 8 make two."]],
        "Two terms: 3x and 8.")
    }
  }
});

const ee02b02 = lesson({
  id: "ee-02b-02", slug: "the-coefficients-you-cannot-see", title: "The Coefficients You Cannot See",
  courseId: "expressions-equations", chapterId: "ch2b-the-language-of-expressions", minutes: 10,
  standards: ["6.EE.A.2b"], tag: "coefficient-naming",
  c1: {
    figure: "ee-coefficient-spotlight",
    body: "A term like m looks as though it has no coefficient. It does — an invisible **1**, because m means 1 · m.\n\nThe same goes for signs: −m has coefficient −1, not 1. The minus belongs to the number in front, and forgetting that is the single most common slip in all of algebra."
  },
  i1: {
    body: "Lay out a bare variable and count what is really there.",
    widget: tiles("Build x + 7: a single x-tile and seven unit tiles.", 1, 7, 10,
      "One x-tile. Written out in full the term is 1x, so the coefficient is 1 even though nobody writes it. The constant term is 7.",
      "Check the x-tiles: x on its own means exactly one.",
      "Check the unit tiles: the constant is 7.")
  },
  k1: {
    body: "Name the invisible one.",
    variants: [
      "w means 1 · w, so the coefficient is 1.",
      "Nothing written in front of a variable means one of it."
    ],
    widget: num("What is the coefficient of w in the expression w + 12?", 1,
      [[12, "12 is the constant term. The coefficient of w is the number multiplying w."],
       [0, "0 would mean there is no w at all. A bare w means one w."]],
      "w means 1 · w, so the coefficient is 1.")
  },
  k2: {
    body: "Now with a sign attached.",
    variants: [
      "In 5 − k the second term is −k, whose coefficient is −1.",
      "Subtracting k is the same as adding −1k, so the coefficient carries the minus."
    ],
    widget: mcq("In the expression 5 − k, what is the coefficient of k?", [
      ["a", "−1", true, "Subtracting k means adding −1k. The sign in front belongs to the coefficient."],
      ["b", "1", false, "That would be the coefficient in 5 + k. Here the term is being subtracted, so the coefficient is −1."],
      ["c", "5", false, "5 is the constant term, not the number multiplying k."],
      ["d", "−5", false, "The 5 is positive and separate; it is not the coefficient of k at all."]
    ])
  },
  c2: {
    figure: "expression-machine",
    body: "Knowing the coefficient is not trivia — it is what makes combining possible.\n\n3x + x is not 3x. Written in full it is 3x + 1x, and once both coefficients are visible they add to 4x. The invisible 1 is the whole reason the answer is not 3."
  },
  i2: {
    body: "Combine, and let the tiles keep the count honest.",
    widget: tiles("Build 3x + x by laying out three x-tiles and then one more, with no unit tiles.", 4, 0, 10,
      "Four x-tiles: 3x + x = 4x. The lone x brought a coefficient of 1 to the sum, which is why the answer is 4x and not 3x.",
      "Check the x-tiles: three plus one more makes four.",
      "There are no unit tiles in this expression — the constant is 0.")
  },
  k3: {
    body: "Combine with a subtraction.",
    variants: [
      "6y − y is 6y − 1y = 5y, because the lone y carries a coefficient of 1.",
      "Subtract the coefficients: 6 − 1 = 5."
    ],
    widget: num("Simplify 6y − y. What is the coefficient of the result?", 5,
      [[6, "The − y removes one y. Since y means 1y, the count drops from 6 to 5."],
       [0, "0 would mean every y was removed. Only one was: 6 − 1 = 5."]],
      "y means 1y, so 6y − 1y = 5y.")
  },
  ch1: {
    body: "Three terms, two of them wearing disguises.",
    variants: [
      "x + 4x − x is 1x + 4x − 1x = 4x. Both bare x terms carry coefficient 1, one positive and one negative.",
      "Add the coefficients in order: 1 + 4 − 1 = 4."
    ],
    hints: [
      "Rewrite every bare x with its invisible coefficient in front.",
      "That gives 1x + 4x − 1x. Now you are only adding and subtracting numbers.",
      "1 + 4 − 1 = 4, so the expression simplifies to 4x."
    ],
    widget: num("Simplify x + 4x − x. What is the coefficient of the result?", 4,
      [[5, "5 comes from 1 + 4 and forgets the final − x, which removes one more."],
       [3, "3 comes from 4 − 1 and forgets the leading x, which contributes 1."]],
      "Write the invisible ones: 1 + 4 − 1 = 4, so the result is 4x.")
  },
  recap: {
    body: "Nothing written still means something.",
    takeaways: [
      "A bare variable has coefficient 1; a subtracted one has coefficient −1.",
      "The sign in front of a term belongs to its coefficient.",
      "Making the invisible 1 visible is what makes combining like terms reliable."
    ],
    teaser: "Next: saying an expression out loud without changing what it means."
  }
});

const ee02b03 = lesson({
  id: "ee-02b-03", slug: "reading-an-expression-aloud", title: "Reading an Expression Aloud",
  courseId: "expressions-equations", chapterId: "ch2b-the-language-of-expressions", minutes: 11,
  standards: ["6.EE.A.2b"], tag: "expression-language",
  c1: {
    figure: "ee-read-aloud-tree",
    body: "Words carry grouping, and the wrong words change the expression.\n\n3(n + 2) is read *three times the **sum** of n and 2* — the bracket is one object, and the 3 multiplies all of it. Say instead *three times n, plus 2* and you have described 3n + 2, a different expression entirely."
  },
  i1: {
    body: "Build the one the words describe.",
    widget: tiles("Build 'three times the sum of x and 2': three groups, each holding one x and two units.", 3, 6, 14,
      "3x + 6. Each of the three groups carried its own 2, so the units came to six. That is 3(x + 2) — the bracket travelled with the multiplication.",
      "Check the x-tiles: three groups means three x-tiles.",
      "Check the unit tiles: each of the three groups holds 2, so six in all — not two.")
  },
  k1: {
    body: "Match words to symbols.",
    variants: [
      "'The sum of x and 5, doubled' groups the sum first, then doubles it: 2(x + 5).",
      "Doubling applies to the whole sum, so the sum needs a bracket."
    ],
    widget: mcq("Which expression is 'the sum of x and 5, doubled'?", [
      ["a", "2(x + 5)", true, "The sum is formed first and the doubling applies to all of it."],
      ["b", "2x + 5", false, "This doubles only the x. The phrase doubles the whole sum."],
      ["c", "x + 10", false, "This doubles only the 5 and leaves the x alone — the phrase doubles the whole sum, both parts together."],
      ["d", "2x + 10x", false, "This is not equivalent to either reading; it simplifies to 12x."]
    ])
  },
  k2: {
    body: "Now the other way round.",
    variants: [
      "4n − 1 is 'one less than four times n' — the multiplication happens first, then 1 is removed.",
      "There is no bracket, so the 4 reaches only the n."
    ],
    widget: mcq("Which phrase describes 4n − 1?", [
      ["a", "one less than four times n", true, "4n is formed first, then 1 is subtracted from it."],
      ["b", "four times one less than n", false, "That is 4(n − 1), which distributes to 4n − 4."],
      ["c", "four less than n", false, "That would be n − 4, which subtracts 4 from n. Here n is multiplied by 4 first, and only 1 is taken away."],
      ["d", "one less than n, times four", false, "That is 4(n − 1) again — the words put the subtraction inside a group."]
    ])
  },
  c2: {
    figure: "ee-like-terms",
    body: "The bracket also lets you treat a whole expression as a **single entity**.\n\nIn 3(n + 2) you can view (n + 2) as one thing being tripled, without ever looking inside it. That view is what makes 3(n + 2) + 4(n + 2) = 7(n + 2) obvious — seven of the same object — no distributing required."
  },
  i2: {
    body: "Two of one object, plus three more.",
    widget: tiles("Build 5(x + 1): five groups, each with one x and one unit.", 5, 5, 14,
      "5x + 5. Seen the other way, this is five copies of the single object (x + 1) — which is why 2(x + 1) + 3(x + 1) would come to exactly this.",
      "Check the x-tiles: five groups, one x each.",
      "Check the unit tiles: five groups, one unit each.")
  },
  k3: {
    body: "Count the objects instead of expanding.",
    variants: [
      "2(y + 3) + 5(y + 3) is 2 of the object plus 5 of it, so 7(y + 3).",
      "Treat (y + 3) as a single thing: 2 + 5 = 7 of them."
    ],
    widget: num("2(y + 3) + 5(y + 3) equals ?(y + 3). What number goes in the blank?", 7,
      [[10, "10 multiplies 2 and 5. Here they are being ADDED — two of the object plus five more makes seven."],
       [3, "3 is inside the bracket, not a count of the objects. Count the copies: 2 + 5."]],
      "Treating (y + 3) as one object: 2 of them plus 5 of them is 7 of them.")
  },
  ch1: {
    body: "Words into symbols, with the grouping doing real work.",
    variants: [
      "'Five times the sum of a number and 4' is 5(n + 4); distributed that is 5n + 20.",
      "The sum is grouped first, so the 5 reaches both the n and the 4."
    ],
    hints: [
      "Which part of the phrase is grouped? Look for the word 'sum'.",
      "The sum of a number and 4 is (n + 4), and five times it is 5(n + 4).",
      "Distributing gives 5n + 20 — the 5 reaches the 4 as well."
    ],
    widget: mcq("'Five times the sum of a number and 4' — which pair of forms is correct?", [
      ["a", "5(n + 4), which equals 5n + 20", true, "The sum is grouped, so the 5 multiplies both parts."],
      ["b", "5n + 4, which equals 5(n + 4)", false, "These two are not equal: 5n + 4 leaves the 4 untouched by the 5."],
      ["c", "5(n + 4), which equals 5n + 4", false, "The first form is right but distributing must reach the 4: 5 × 4 = 20."],
      ["d", "n + 20, which equals 5(n + 4)", false, "n + 20 only multiplies the 4 by five and leaves n alone."]
    ])
  },
  recap: {
    body: "Say it precisely and the symbols follow.",
    takeaways: [
      "'The sum of' groups what follows — that is where brackets come from.",
      "3(n + 2) and 3n + 2 are different expressions, and the words tell them apart.",
      "A bracket can be viewed as one object, which makes counting copies easier than expanding."
    ],
    teaser: "Next chapter: equivalent expressions, and how to prove two of them really do match."
  }
});

/* ============================================================ patch */

const patch = {
  label: "S203C expressions batch — factoring (7.EE.A.1), structure (7.EE.A.2), expression vocabulary (6.EE.A.2b)",
  totalLessons: 6,
  chapterInsertions: [
    {
      courseSlug: "two-step-equations",
      chapter: {
        id: "ch1b-factoring-and-structure",
        title: "Factoring & Choosing a Form",
        lessonIds: ["tse-01b-01", "tse-01b-02", "tse-01b-03"]
      },
      position: { after: "ch1-distributing-and-combining-with-rational-coefficients" },
      lessons: [tse01b01, tse01b02, tse01b03],
      seamEdit: {
        lessonId: "tse-01-03",
        field: "recap.teaser",
        expect: "next chapter: solving two-step equations with these skills.",
        newValue: "next chapter: running distribution backwards — pulling out a common factor, then choosing the form that answers the question."
      }
    },
    {
      courseSlug: "expressions-equations",
      chapter: {
        id: "ch2b-the-language-of-expressions",
        title: "The Language of Expressions",
        lessonIds: ["ee-02b-01", "ee-02b-02", "ee-02b-03"]
      },
      position: { after: "ch2-variables" },
      lessons: [ee02b01, ee02b02, ee02b03],
      seamEdit: {
        lessonId: "ee-02-03",
        field: "recap.teaser",
        expect: "next chapter: when two different-looking expressions are secretly the same.",
        newValue: "next chapter: the exact words for the pieces of an expression — terms, factors, coefficients — and the grouping that words carry."
      }
    }
  ]
};

mkdirSync(join(root, "content/patches"), { recursive: true });
const out = join(root, "content/patches/s203c-expressions.json");
writeFileSync(out, JSON.stringify(patch, null, 2) + "\n");
const n = patch.chapterInsertions.reduce((t, c) => t + c.lessons.length, 0);
console.log(`wrote ${out}: ${n} lessons across ${patch.chapterInsertions.length} chapter insertions`);
