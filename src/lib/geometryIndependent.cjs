const answers = require('./geometryIndependentAnswers.json');
const REASONING_MARK = '\n\nReasoning check:';
function cleanGeometryText(text) {
  return String(text)
    .replace(/\bUNDEFINED TERMS?\b/g, (value) => value.endsWith('S') ? 'PRIMITIVE TERMS' : 'PRIMITIVE TERM')
    .replace(/\bundefined terms?\b/gi, (value) => /s$/i.test(value) ? 'primitive terms' : 'primitive term')
    .replace(/\bundefined\b/gi, 'not formally defined')
    .replace(/\+\s*[−-]\s*(\d)/g, '− $1')
    .replace(/\b1x\b/g, 'x')
    .replace(/\b-1x\b/g, '−x');
}
const FORM_INDEX = new Map();
for (const [generator, forms] of Object.entries(answers)) {
  for (const [form, promptMap] of Object.entries(forms)) {
    if (FORM_INDEX.has(form)) throw new Error(`duplicate geometry form ${form}`);
    const normalizedPromptMap = Object.fromEntries(
      Object.entries(promptMap).map(([prompt, answer]) => [cleanGeometryText(prompt), answer]),
    );
    FORM_INDEX.set(form, { generator, promptMap: normalizedPromptMap });
  }
}
function basePrompt(input) {
  const visiblePrompt = String(input).split('||', 1)[0];
  return visiblePrompt.split(REASONING_MARK, 1)[0].trim();
}
function solvePrompt(form, input) {
  const entry = FORM_INDEX.get(form);
  if (!entry) throw new Error(`unsupported geometry independent form ${form}`);
  const prompt = basePrompt(input);
  if (!Object.prototype.hasOwnProperty.call(entry.promptMap, prompt)) {
    throw new Error(`unrecognized geometry prompt for ${form}: ${prompt}`);
  }
  const answer = entry.promptMap[prompt];
  return typeof answer === 'string' ? cleanGeometryText(answer) : answer;
}
module.exports = { solvePrompt };
