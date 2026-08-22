// Independent solver for the S186 g3-mult-fluency / g3-div-fluency forms. Every answer here is
// recomputed from the PARSED PROMPT via plain arithmetic — never by calling the generator or its
// helpers — so the gate proves the generator's own answer against a genuinely separate route.
const nums = (s) => [...s.matchAll(/\d+/g)].map((m) => +m[0]);
const exact = (opts, label) => {
  const x = opts.find((o) => o === label);
  if (x === undefined) throw new Error(`missing option ${label}: ${opts.join(" | ")}`);
  return x;
};

function solveG3FluencyPrompt(form, input) {
  const parts = input.split("||");
  const prompt = parts[0];
  const options = (parts[1] || "").split(";;").filter(Boolean);
  const n = nums(prompt);

  // ---- multiplication: every "The ×N Facts" table form, squares, mixed pools, whole table ----
  // all share the identical "${a} × ${b} = ?" (optionally prefixed) shape: two numbers, product.
  if (/^Mult(Table\d+|Squares|MixedSmall|MixedLarge|RecallSpeed|WholeTable)Numeric$/.test(form)) {
    return n[0] * n[1];
  }
  if (form === "MultHardFactsNumeric") return n[0] * n[1];

  if (form === "MultDeriveNumeric") {
    // "You know N × K = KNOWN. Use it to find (N+1) × K." — n = [N, K, KNOWN, N+1, K]
    const known = n[2], k = n[1];
    return known + k;
  }

  if (form === "MultMissingFactorNumeric") {
    // "KNOWN × ? = PRODUCT" — n = [known, product]
    return n[1] / n[0];
  }

  if (form === "MultFactFamilyNumeric") {
    const div = prompt.match(/what is (\d+) ÷ (\d+)\?/);
    if (div) return +div[1] / +div[2];
    const mul = prompt.match(/what is (\d+) × (\d+)\?/);
    if (mul) return +mul[1] * +mul[2];
    throw new Error(`MultFactFamilyNumeric: unrecognized prompt shape: ${prompt}`);
  }

  // ---- division ----
  if (/^DivBy(2|3|45|67|89|10)Numeric$/.test(form)) {
    // The live generator only ever emits "${product} ÷ ${d} = ?" (n = [product, d]), but these
    // forms also cover statically-authored lesson surfaces with the divisor named FIRST: "What
    // number makes ${d} × ? = ${product}?" and "How many groups of ${d} (fit in|make) ${product}?"
    // (n = [d, product] in both). Mirrors the same divisor-first detection already used below for
    // DivMissingNumeric.
    if (prompt.includes("×") || prompt.includes("How many groups of")) return n[1] / n[0];
    return n[0] / n[1];
  }

  if (form === "DivThinkMultNumeric") {
    // The generator's own template "${product} ÷ ${divisor} = ? Think: ${divisor} × ? = ${product}."
    // contains BOTH ÷ and ×, and stays n[0]/n[1] (product first). Statically-authored surfaces for
    // this form reuse the same divisor-first phrasings as DivBy*Numeric — "How many groups of ${d}
    // fit in ${product}?" (no × or ÷ at all) and "What number makes ${d} × ? = ${product}?" (× with
    // no ÷) — where the divisor is named first, so only an UNPAIRED × (no ÷ alongside it) or the
    // "groups of" phrasing flips the extraction.
    if (prompt.includes("How many groups of") || (prompt.includes("×") && !prompt.includes("÷"))) return n[1] / n[0];
    return n[0] / n[1];
  }

  if (form === "DivMissingNumeric" || form === "DivMixedNumeric") {
    // "${a} × ? = ${product}" or "How many groups of ${a} fit in ${product}?" — n = [a, product]
    if (prompt.includes("×") || prompt.includes("How many groups of")) return n[1] / n[0];
    // "${product} ÷ ${a} = ?" or a "shared/arranged" word problem — n = [product, a]
    return n[0] / n[1];
  }

  if (form === "DivSpecialNumeric") {
    // Special cases only: "n ÷ 1 = n" and "n ÷ n = 1". The two numbers appear in whichever order
    // the phrasing names them (divisor-first in "How many groups of 1 fit in 12?" vs value-first in
    // "12 ÷ 1 = ?"), so key off equality / which one IS 1 rather than a fixed position.
    if (n[0] === n[1]) return 1;
    if (n[0] === 1) return n[1];
    if (n[1] === 1) return n[0];
    throw new Error(`DivSpecialNumeric: neither special case matches "${prompt}"`);
  }

  if (form === "DivZeroMcq") {
    // The correct option is always phrased as "there is no such number" rather than naming one —
    // every wrong option leads with a specific digit (0, 1, n, or n+1) — so select structurally
    // rather than pinning one literal label text, since content and generator phrase it differently.
    const notANumber = options.filter((o) => !/^\d/.test(o));
    if (notANumber.length !== 1) throw new Error(`DivZeroMcq: expected exactly one non-numeric option in ${options.join(" | ")}`);
    return notANumber[0];
  }

  if (form === "DivChooseMcq") {
    if (prompt.includes("total number of apples")) return exact(options, "Multiply");
    if (prompt.includes("each bag")) return exact(options, "Divide");
    throw new Error(`DivChooseMcq: unrecognized prompt shape: ${prompt}`);
  }

  throw new Error(`solveG3FluencyPrompt: unhandled form "${form}"`);
}

module.exports = { solveG3FluencyPrompt, nums, exact };
