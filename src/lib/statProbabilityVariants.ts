import templates from "./statProbabilityVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

const AUTHORED_STAT_PROBABILITY_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 10 Statistics and Probability isomorphic authored variants"
);

const JOINT_FORM = "conditional-probability__cpr-joint-prob__numeric";
const MARGINAL_FORM = "conditional-probability__cpr-marginal-prob__numeric";
const COMPLEMENT_FORM = "conditional-probability__cpr-complement-table__numeric";
const CONDITIONAL_FORM = "conditional-probability__cpr-conditional-table__numeric";
const REVERSAL_FORM = "conditional-probability__cpr-reversal-error__numeric";
const UNION_FORM = "conditional-probability__cpr-table-union__numeric";
const INDEP_DISJOINT_FORM = "conditional-probability__cpr-indep-vs-disjoint__numeric";
const JOINT_CASES = [
  { total: 100, first: 60, second: 45, joint: 20, firstLabel: "take the bus", secondLabel: "play a sport" },
  { total: 120, first: 70, second: 50, joint: 30, firstLabel: "study French", secondLabel: "study music" },
  { total: 150, first: 90, second: 65, joint: 35, firstLabel: "use the library", secondLabel: "join a club" },
  { total: 200, first: 110, second: 80, joint: 44, firstLabel: "cycle to school", secondLabel: "eat breakfast" },
  { total: 80, first: 48, second: 34, joint: 18, firstLabel: "choose tea", secondLabel: "choose fruit" },
  { total: 160, first: 92, second: 68, joint: 28, firstLabel: "watch a film", secondLabel: "read a review" },
  { total: 240, first: 132, second: 96, joint: 52, firstLabel: "visit the gallery", secondLabel: "join a workshop" },
  { total: 180, first: 104, second: 75, joint: 39, firstLabel: "use streaming", secondLabel: "use cable" },
] as const;

const round3 = (value: number): number => Math.round(value * 1000) / 1000;

type ErrorCandidate = readonly [number, string];

function numericVariant(prompt: string, answer: number, candidates: readonly ErrorCandidate[], fallbackFeedback: string) {
  const seen = new Set([answer]);
  const commonErrors = candidates.flatMap(([value, feedback]) => {
    const rounded = round3(value);
    if (Math.abs(rounded - answer) <= 0.0005 || seen.has(rounded)) return [];
    seen.add(rounded);
    return [{ value: rounded, feedback }];
  }).slice(0, 3);
  if (commonErrors.length < 2) throw new Error(`Conditional-probability form lacks distinct misconceptions: ${prompt}`);
  return {
    tag: "g10-conditional-probability",
    widget: {
      type: "numeric" as const,
      prompt,
      answer,
      tolerance: 0.0005,
      commonErrors,
      fallbackFeedback,
    },
    answer,
  };
}

function jointProbabilityVariant(rand: () => number) {
  const item = JOINT_CASES[Math.floor(rand() * JOINT_CASES.length)]!;
  const answer = round3(item.joint / item.total);
  const firstConditional = round3(item.joint / item.first);
  const secondConditional = round3(item.joint / item.second);
  const union = round3((item.first + item.second - item.joint) / item.total);
  return {
    tag: "g10-conditional-probability",
    widget: {
      type: "numeric" as const,
      prompt: `Of ${item.total} people, ${item.first} ${item.firstLabel}, ${item.second} ${item.secondLabel}, and ${item.joint} do both. Find the joint probability of both events: “${item.firstLabel}” and “${item.secondLabel}.” Give a decimal rounded to three places.`,
      answer,
      tolerance: 0.0005,
      commonErrors: [
        {
          value: firstConditional,
          feedback: `That divides the overlap by the first group of ${item.first}. A joint probability uses all ${item.total} people as its denominator.`,
        },
        {
          value: secondConditional,
          feedback: `That divides the overlap by the second group of ${item.second}. This question asks for the joint probability in the whole group.`,
        },
        {
          value: union,
          feedback: `That is the probability of at least one event. The joint probability uses only the ${item.joint} people in the overlap.`,
        },
      ],
      fallbackFeedback: `The overlap is ${item.joint} people out of ${item.total}, so the joint probability is ${item.joint}/${item.total} = ${answer.toFixed(3)}.`,
    },
    answer,
  };
}

const TABLE_CASES = [
  { total: 100, first: 60, second: 45, joint: 20, firstLabel: "take the bus", secondLabel: "play a sport" },
  { total: 120, first: 70, second: 50, joint: 30, firstLabel: "study French", secondLabel: "study music" },
  { total: 150, first: 90, second: 65, joint: 35, firstLabel: "use the library", secondLabel: "join a club" },
  { total: 200, first: 110, second: 80, joint: 44, firstLabel: "cycle to school", secondLabel: "eat breakfast" },
  { total: 80, first: 48, second: 34, joint: 18, firstLabel: "choose tea", secondLabel: "choose fruit" },
  { total: 160, first: 92, second: 68, joint: 28, firstLabel: "watch a film", secondLabel: "read a review" },
  { total: 240, first: 132, second: 96, joint: 52, firstLabel: "visit the gallery", secondLabel: "join a workshop" },
  { total: 180, first: 104, second: 75, joint: 39, firstLabel: "use streaming", secondLabel: "use cable" },
] as const;

function marginalProbabilityVariant(rand: () => number) {
  const item = TABLE_CASES[Math.floor(rand() * TABLE_CASES.length)]!;
  const firstCell = item.joint;
  const secondCell = item.second - item.joint;
  const answer = round3(item.second / item.total);
  return numericVariant(
    `Of ${item.total} people, ${firstCell} ${item.firstLabel} and ${item.secondLabel}, while ${secondCell} do not ${item.firstLabel} but do ${item.secondLabel}. Find the marginal probability of belonging to the “${item.secondLabel}” group. Give a decimal rounded to three places.`,
    answer,
    [
      [firstCell / item.total, `That uses only the overlap cell. A marginal probability adds every cell in the ${item.secondLabel} group.`],
      [secondCell / item.total, `That uses only the second cell. Include the ${firstCell} people who satisfy both descriptions as well.`],
      [(item.total - item.second) / item.total, `That is the complementary marginal probability for people who do not ${item.secondLabel}.`],
    ],
    `Add the two cells in the group: ${firstCell} + ${secondCell} = ${item.second}. Then divide by ${item.total}: ${item.second}/${item.total} = ${answer.toFixed(3)}.`,
  );
}

function complementProbabilityVariant(rand: () => number) {
  const item = TABLE_CASES[Math.floor(rand() * TABLE_CASES.length)]!;
  const union = item.first + item.second - item.joint;
  const neither = item.total - union;
  const answer = round3(neither / item.total);
  return numericVariant(
    `Of ${item.total} people, ${item.first} ${item.firstLabel}, ${item.second} ${item.secondLabel}, and ${item.joint} do both. Find the probability that a person does neither. Give a decimal rounded to three places.`,
    answer,
    [
      [union / item.total, "That is the probability of at least one event. The question asks for its complement: neither event."],
      [item.joint / item.total, "That is the overlap probability. Neither lies outside both groups, not in their intersection."],
      [(item.first - item.joint) / item.total, "That counts only people in the first group but not the second. Neither is outside both groups."],
      [(item.second - item.joint) / item.total, "That counts only people in the second group but not the first. Neither excludes both events."],
    ],
    `At least one includes ${item.first} + ${item.second} − ${item.joint} = ${union}. That leaves ${neither}, so P(neither) = ${neither}/${item.total} = ${answer.toFixed(3)}.`,
  );
}

function conditionalProbabilityVariant(rand: () => number) {
  const item = TABLE_CASES[Math.floor(rand() * TABLE_CASES.length)]!;
  const answer = round3(item.joint / item.first);
  return numericVariant(
    `Of ${item.total} people, ${item.first} ${item.firstLabel}, ${item.second} ${item.secondLabel}, and ${item.joint} do both. Among the people who ${item.firstLabel}, find the probability of also ${item.secondLabel}. Give a decimal rounded to three places.`,
    answer,
    [
      [item.joint / item.total, `That is the joint probability in the whole group. The condition restricts the denominator to the ${item.first} people who ${item.firstLabel}.`],
      [item.joint / item.second, `That reverses the condition and divides by the ${item.second} people who ${item.secondLabel}.`],
      [item.first / item.total, `That is the marginal probability of the given group. The numerator must be the ${item.joint} people in both groups.`],
    ],
    `The condition sets a denominator of ${item.first}. Of those people, ${item.joint} also ${item.secondLabel}, so the probability is ${item.joint}/${item.first} = ${answer.toFixed(3)}.`,
  );
}

function reversalProbabilityVariant(rand: () => number) {
  const item = TABLE_CASES[Math.floor(rand() * TABLE_CASES.length)]!;
  const answer = round3(item.joint / item.second);
  return numericVariant(
    `Of ${item.total} people, ${item.first} ${item.firstLabel}, ${item.second} ${item.secondLabel}, and ${item.joint} do both. Among the people who ${item.secondLabel}, find the probability of also ${item.firstLabel}. Give a decimal rounded to three places.`,
    answer,
    [
      [item.joint / item.first, `That computes the reverse conditional. The phrase after “given” supplies the denominator of ${item.second}.`],
      [item.joint / item.total, "That is the joint probability in the full group. A conditional probability divides by the given group."],
      [item.second / item.total, "That is the marginal probability of the given group, not the share of that group in the overlap."],
    ],
    `The given group contains ${item.second} people, and ${item.joint} are also in the first group. The probability is ${item.joint}/${item.second} = ${answer.toFixed(3)}.`,
  );
}

function unionProbabilityVariant(rand: () => number) {
  const item = TABLE_CASES[Math.floor(rand() * TABLE_CASES.length)]!;
  const union = item.first + item.second - item.joint;
  const answer = round3(union / item.total);
  return numericVariant(
    `Of ${item.total} people, ${item.first} ${item.firstLabel}, ${item.second} ${item.secondLabel}, and ${item.joint} do both. Find the probability that a person satisfies at least one of the two descriptions. Give a decimal rounded to three places.`,
    answer,
    [
      [(item.first + item.second) / item.total, `That double-counts the ${item.joint} people in both groups. Subtract the overlap before dividing.`],
      [item.joint / item.total, "That is only the overlap probability. At least one includes both one-group regions as well."],
      [(item.total - union) / item.total, "That is the probability of neither event, the complement of the requested union."],
    ],
    `The union count is ${item.first} + ${item.second} − ${item.joint} = ${union}. Divide by ${item.total}: ${union}/${item.total} = ${answer.toFixed(3)}.`,
  );
}

const INDEP_DISJOINT_CASES = [
  { kind: "exclusiveConditional", a: 0.4, b: 0.3 },
  { kind: "independentIntersection", a: 0.6, b: 0.25 },
  { kind: "exclusiveUnion", a: 0.35, b: 0.45 },
  { kind: "independentConditional", a: 0.55, b: 0.2 },
  { kind: "exclusiveConditional", a: 0.25, b: 0.5 },
  { kind: "independentIntersection", a: 0.4, b: 0.7 },
  { kind: "exclusiveUnion", a: 0.2, b: 0.65 },
  { kind: "independentConditional", a: 0.3, b: 0.8 },
] as const;

function independenceDisjointVariant(rand: () => number) {
  const item = INDEP_DISJOINT_CASES[Math.floor(rand() * INDEP_DISJOINT_CASES.length)]!;
  if (item.kind === "exclusiveConditional") {
    return numericVariant(
      `P(A) = ${item.a}, P(B) = ${item.b}, and A and B are mutually exclusive. Find P(A | B).`,
      0,
      [[item.a, "That would hold for independent events. Exclusive events cannot occur together, so no B outcome is also in A."], [item.a * item.b, "That multiplies as though the events were independent. Exclusive events have zero intersection."], [item.a + item.b, "That is P(A or B) for exclusive events, not the requested conditional probability."]],
      "Inside the B outcomes, none are in A because the events are mutually exclusive. Therefore P(A | B) = 0.",
    );
  }
  if (item.kind === "independentIntersection") {
    const answer = round3(item.a * item.b);
    return numericVariant(
      `P(A) = ${item.a}, P(B) = ${item.b}, and A and B are independent. Find P(A and B).`,
      answer,
      [[item.a + item.b, "That adds the probabilities as if the question asked for a union. Independent intersections use multiplication."], [item.a, "That keeps only P(A) and ignores the independent chance of B."], [item.b, "That keeps only P(B) and ignores the independent chance of A."]],
      `Independent events multiply for an intersection: ${item.a} × ${item.b} = ${answer}.`,
    );
  }
  if (item.kind === "exclusiveUnion") {
    const answer = round3(item.a + item.b);
    return numericVariant(
      `P(A) = ${item.a}, P(B) = ${item.b}, and A and B are mutually exclusive. Find P(A or B).`,
      answer,
      [[item.a * item.b, "That multiplies as though the question asked for an independent intersection. Exclusive unions add."], [0, "Zero is the intersection of exclusive events. Their union still contains every A outcome and every B outcome."], [item.a, "That includes only event A and leaves out every outcome in event B."]],
      `Exclusive events have no overlap to subtract, so P(A or B) = ${item.a} + ${item.b} = ${answer}.`,
    );
  }
  return numericVariant(
    `P(A) = ${item.a}, P(B) = ${item.b}, and A and B are independent. Find P(A | B).`,
    item.a,
    [[item.a * item.b, "That is the joint probability P(A and B). Conditioning divides that joint value by P(B)."], [item.b, "That reports the probability of the given event B, not the conditional chance of A."], [item.a + item.b, "That adds the marginals and does not represent a conditional probability."]],
    `Independence means knowing B does not change the chance of A, so P(A | B) = P(A) = ${item.a}.`,
  );
}

export const STAT_PROBABILITY_GENERATORS = AUTHORED_STAT_PROBABILITY_GENERATORS.map((generator) =>
  generator.tag === "g10-conditional-probability"
    ? {
        ...generator,
        gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
          switch (requestedForm) {
            case JOINT_FORM: return jointProbabilityVariant(rand);
            case MARGINAL_FORM: return marginalProbabilityVariant(rand);
            case COMPLEMENT_FORM: return complementProbabilityVariant(rand);
            case CONDITIONAL_FORM: return conditionalProbabilityVariant(rand);
            case REVERSAL_FORM: return reversalProbabilityVariant(rand);
            case UNION_FORM: return unionProbabilityVariant(rand);
            case INDEP_DISJOINT_FORM: return independenceDisjointVariant(rand);
            default: return generator.gen(rand, band, requestedForm);
          }
        },
      }
    : generator,
);
