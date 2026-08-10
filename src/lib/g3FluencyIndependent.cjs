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
    // "${product} ÷ ${d} = ?" — n = [product, d]
    return n[0] / n[1];
  }

  if (form === "DivThinkMultNumeric") {
    // "${product} ÷ ${divisor} = ? Think: ${divisor} × ? = ${product}." — n = [product, divisor, divisor, product]
    return n[0] / n[1];
  }

  if (form === "DivMissingNumeric") {
    if (prompt.includes("×")) {
      // "${a} × ? = ${product}" — n = [a, product]
      return n[1] / n[0];
    }
    // "${product} ÷ ${a} = ?" — n = [product, a]
    return n[0] / n[1];
  }

  if (form === "DivSpecialNumeric") {
    // "${n} ÷ 1 = ?" (n=[val,1]) or "${n} ÷ ${n} = ?" (n=[val,val])
    if (n[1] === 1 && n[0] !== 1) return n[0];
    return 1;
  }

  if (form === "DivZeroMcq") {
    return exact(options, "Undefined — division by zero has no answer");
  }

  if (form === "DivMixedNumeric") {
    // "${product} ÷ ${divisor} = ?" — n = [product, divisor]
    return n[0] / n[1];
  }

  if (form === "DivChooseMcq") {
    if (prompt.includes("total number of apples")) return exact(options, "Multiply");
    if (prompt.includes("each bag")) return exact(options, "Divide");
    throw new Error(`DivChooseMcq: unrecognized prompt shape: ${prompt}`);
  }

  throw new Error(`solveG3FluencyPrompt: unhandled form "${form}"`);
}

module.exports = { solveG3FluencyPrompt, nums, exact };
