/** Multi-character unit symbols whose spacing can be audited without guessing at prose. */
const MULTI_CHARACTER_UNITS = "cm|mm|km|kg|mg|ml|ft|yd|mi|lb|oz|min|hr";

const WELDED_UNIT = new RegExp(`\\b\\d+(?:${MULTI_CHARACTER_UNITS})\\b`);
const PLURALISED_UNIT = new RegExp(
  `\\b\\d+\\s(?:${MULTI_CHARACTER_UNITS})s(?=$|[\\s,.;:!?…)}\\]])`,
);

/** Return the learner-visible unit-notation defect, or null when the text is ordinary prose. */
export function unitNotationResidue(residue: string): string | null {
  if (WELDED_UNIT.test(residue)) return "number welded to its unit";
  // The explicit token terminator prevents `935 mis-adds` being parsed as `935 mi` + plural `s`.
  if (PLURALISED_UNIT.test(residue)) return "unit symbol pluralised";
  return null;
}

export type CanonicalFormContext = {
  source: string;
  owner: string;
  unit: string;
  field: string;
};

/* S245: these strings explicitly TEACH the normally hidden unit coefficient. Rewriting or
 * queueing the `1x`/`1y`/`1a` would erase the contrast the explanation asks the learner to notice.
 * Exact evidence keys keep this exception from becoming a phrase-based licence for unrelated text. */
const UNIT_COEFFICIENT_TEACHING_FIELDS = new Set([
  "bt-02-01|i1|widget.successFeedback",
  "ep-02-03|i1|widget.xFeedback",
  "ee-02b-02|i1|widget.successFeedback",
  "ee-02b-02|k3|widget.commonErrors[0].feedback",
  "ee-02b-02|k3|widget.fallbackFeedback",
  "fg-03-01|k3|widget.commonBuilds[0].feedback",
  "ep-02-03|ch1|explanationVariants[1]",
  "rf-04-03|rem-rf0403-k|widget.commonErrors[0].feedback",
  "tse-01b-02|c1|body",
  "tse-01b-02|k1|explanationVariants[0]",
  "tse-01b-02|k1|widget.fallbackFeedback",
  "tse-01b-02|k3|widget.fallbackFeedback",
  "tse-01b-02|r1|takeaways[0]",
]);

/* These five generated prompts expose coefficient 1 deliberately: standard form presents A and B,
 * elimination aligns both variable coefficients, and the recurrence item exposes common ratio 1.
 * The form-level key is stable across seeds while remaining narrow enough that a new form is
 * audited rather than silently inheriting the exception. */
const UNIT_COEFFICIENT_GENERATED_FORMS = new Set([
  "a1-linear-functions|standard-form__mcq|widget.prompt",
  "a1-linear-functions|standard-form__numeric|widget.prompt",
  "a1-systems|eliminate-add-subtract__numeric|widget.prompt",
  "a1-systems|eliminate-scale-both__numeric|widget.prompt",
  "a2-series|sr-convert__mcq|widget.prompt",
]);

function intentionalUnitCoefficient(context: CanonicalFormContext): boolean {
  const fieldKey = `${context.owner}|${context.unit}|${context.field}`;
  if (
    context.source === "authored" &&
    UNIT_COEFFICIENT_TEACHING_FIELDS.has(fieldKey)
  )
    return true;
  if (
    context.source === "generated" &&
    UNIT_COEFFICIENT_GENERATED_FORMS.has(fieldKey)
  )
    return true;

  /* `lines[*].sourceText` is the explicit-coefficient source model consumed by the affine/system
   * engines. The separate numeric m/b or a/b/c fields carry the mathematics; sourceText mirrors
   * that coefficient model so learners can align terms and the plot can identify each line. Only
   * the two proven owner families receive this disposition. */
  if (!/^widget\.lines\[\d+\]\.sourceText$/.test(context.field)) return false;
  return (
    (context.source === "authored" && /^se-/.test(context.owner)) ||
    (context.source === "generated" && context.owner === "a1-systems")
  );
}

/** Return a genuine canonical-form presentation defect, excluding evidence-backed coefficient-1 instruction. */
export function canonicalFormResidue(
  residue: string,
  _raw: string,
  context: CanonicalFormContext,
): string | null {
  if (/\b\d+\s*\*\s*[A-Za-z]\b/.test(residue))
    return "coefficient written with an explicit *";
  if (/\b[A-Za-z]\s*\*\s*\d+\b/.test(residue))
    return "variable before coefficient (machine order)";
  // Restricted to the letters this corpus uses as variables: `\b1[A-Za-z]\b` matched "1D".
  if (
    /\b1[xyznab](?![A-Za-z])/.test(residue) &&
    !intentionalUnitCoefficient(context)
  ) {
    return "redundant unit coefficient (1x)";
  }
  return null;
}

/* Exact terminating decimals used to teach scientific-notation conversion. The digits are the
 * mathematical value, not an approximation. Generated `sci-notation/small` varies the exponent by
 * seed, so its form-and-field contract is the stable evidence key. */
const EXACT_LONG_DECIMAL_FIELDS = new Set([
  "authored|esn-03-02|k1|widget.prompt",
  "authored|esn-03-02|c2|body",
  "authored|esn-03-02|k1|explanationVariants[0]",
  "authored|esn-03-02|i2|widget.commonErrors[0].feedback",
  "authored|esn-03-02|i2|widget.commonErrors[1].feedback",
  "authored|esn-03-02|i2|widget.fallbackFeedback",
  "authored|esn-03-02|i3|widget.prompt",
  // i3's options-feedback contrasts 0.4 × 10⁻⁷ = 0.00000004 (8 places) against 0.4 × 10⁻⁶ =
  // 0.0000004 (7 places) — the same exact scientific-notation expansion i3's prompt already covers,
  // just in the wrong-answer feedback rather than the prompt itself. Missed by the original review
  // pass alongside the prompt; added on round-2 gate discovery (S330).
  "authored|esn-03-02|i3|widget.options[1].feedback",
  "authored|esn-03-02|i3|widget.options[2].feedback",
  "authored|esn-03-02|ch1|widget.prompt",
  "authored|esn-03-02|ch1|hints[1]",
  "authored|esn-03-02|ch1|explanationVariants[0]",
  // ch1's commonBuilds feedback states how many places 0.0000406 -> 4.06 moves (5, exactly counted,
  // not rounded) — same exact-value category as ch1's other already-exempted fields above. Added on
  // round-2 gate discovery (S330).
  "authored|esn-03-02|ch1|widget.commonBuilds[2].feedback",
  "authored|lg-04-01|i1|widget.fallbackFeedback",
  "authored|si-02-03|rk1|explanationVariants[0]",
  "generated|sci-notation|small|widget.prompt",
]);

/* The quoted over-precise calculator output is the misconception the learner must identify, not a
 * recommended display convention. Keep that disposition tied to the reviewed challenge field. */
const DECIMAL_POLICY_COUNTEREXAMPLE_FIELDS = new Set([
  "authored|dm-03-01|ch1|widget.prompt",
]);

/* Repeating and deliberately nonrepeating decimal demonstrations. Every value carries an ellipsis,
 * but an ellipsis alone is not made a blanket exemption: only these reviewed family/field contracts
 * are disposed. A new decimal family or field must provide its own mathematical evidence. */
const DECIMAL_PATTERN_DEMONSTRATION_FIELDS = new Set([
  "authored|sr-05-03|i1|widget.choices[3].feedback",
  "authored|rns-01-01|ch1|hints[2]",
  "authored|rns-01-01|ch1|explanationVariants[0]",
  "authored|rns-01-01|ch1|widget.choices[0].label",
  "authored|rns-01-03|k2|body",
  "authored|rns-01-03|k2|widget.prompt",
  "authored|rns-01-03|k3|body",
  "authored|rns-01-03|k3|widget.prompt",
  "authored|rns-01-03|ch1|widget.prompt",
  "authored|rns-02-02|k1|widget.items[2].label",
  "authored|rns-02-02|c2|body",
  "authored|rns-02-02|k3|widget.prompt",
  "authored|rns-02-02|ch1|widget.options[3].label",
  "authored|rns-03-03|k2|widget.options[3].feedback",
  "generated|repeat-decimal|twoDigit|widget.prompt",
  "generated|repeat-decimal|threeDigit|widget.prompt",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[0].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[1].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[2].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[3].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[0].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[1].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[2].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[3].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.successFeedback",
  "generated|g8-rns-root-classify|rnsClassifyMixed|widget.items[2].label",
  "generated|g8-rns-root-classify|rnsClassifyGrowingDecimal|widget.prompt",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[0].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[1].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[2].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[3].label",
]);

const evidenceKey = (context: CanonicalFormContext): string =>
  `${context.source}|${context.owner}|${context.unit}|${context.field}`;

/** Return an unstated long-decimal approximation, excluding only reviewed exact/pattern contexts. */
export function decimalFractionPolicyResidue(
  residue: string,
  raw: string,
  context: CanonicalFormContext,
): string | null {
  const key = evidenceKey(context);
  if (EXACT_LONG_DECIMAL_FIELDS.has(key)) return null;
  if (DECIMAL_POLICY_COUNTEREXAMPLE_FIELDS.has(key)) return null;
  if (DECIMAL_PATTERN_DEMONSTRATION_FIELDS.has(key)) return null;

  const candidates = [...residue.matchAll(/\d+\.\d{6,}/g)];
  let rawCursor = 0;
  for (const match of candidates) {
    const token = match[0];
    if (/^0\.0*1$/.test(token) || /^\d+\.0+$/.test(token)) continue;

    // A precision word elsewhere in the same prompt is not evidence for this value. Associate the
    // convention with the displayed decimal itself, so “estimate the first value; compare with
    // 1.234567” still reports the unstated second expansion.
    let rawIndex = raw.indexOf(token, rawCursor);
    if (rawIndex < 0) rawIndex = raw.indexOf(token);
    if (rawIndex >= 0) rawCursor = rawIndex + token.length;
    const left =
      rawIndex < 0 ? "" : raw.slice(Math.max(0, rawIndex - 96), rawIndex);
    const right =
      rawIndex < 0
        ? ""
        : raw.slice(rawIndex + token.length, rawIndex + token.length + 96);
    const directlyQualified =
      /(?:≈|â‰ˆ)\s*$/.test(left) ||
      /\b(?:about|approximately)\s*$/.test(left) ||
      /\b(?:estimate(?:d)?|approximat(?:e|ed))(?:(?:\s+\w+){0,4})?\s+(?:is|as)\s*[:=]?\s*$/i.test(
        left,
      ) ||
      /\bround(?:ed)?(?:\s+(?:the\s+)?(?:value|answer|result))?\s+to\s+(?:the\s+)?(?:nearest\s+\w+|\w+\s+decimal\s+places?|\d+\s+significant\s+(?:figures?|digits?))\s*[:=]?\s*$/i.test(
        left,
      ) ||
      /^\s*(?:,?\s*(?:rounded|reported)\s+to\s+(?:the\s+)?(?:nearest\s+\w+|\w+\s+decimal\s+places?|\d+\s+significant\s+(?:figures?|digits?)))/i.test(
        right,
      );
    if (directlyQualified) continue;

    return `${token.split(".")[1].length} decimal places, no stated convention`;
  }
  return null;
}
