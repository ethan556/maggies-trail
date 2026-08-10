const REASONING_MARK = '\n\nReasoning check:';
function polishText(text) { return String(text).replace(/\bundefined\b/gi, 'not defined').replace(/\+\s*[−-]\s*(\d)/g, '− $1').replace(/\b1x\b/g, 'x').replace(/\b-1x\b/g, '−x').replace(/\s{3,}/g, '  '); }
function polishValue(value) { if (typeof value === 'string') return polishText(value); if (Array.isArray(value)) return value.map(polishValue); if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [polishText(k), polishValue(v)])); return value; }
function makeSolver(answers) {
  const forms = new Map();
  for (const [generator, byForm] of Object.entries(answers)) {
    for (const [form, promptMap] of Object.entries(byForm)) {
      if (forms.has(form)) throw new Error(`duplicate advanced form ${form}`);
      forms.set(form, { generator, promptMap: Object.fromEntries(Object.entries(promptMap).map(([prompt, answer]) => [polishText(prompt), polishValue(answer)])) });
    }
  }
  return function solvePrompt(form, input) {
    const entry = forms.get(form);
    if (!entry) throw new Error(`unsupported advanced independent form ${form}`);
    const visible = String(input).split('||', 1)[0];
    const prompt = polishText(visible.split(REASONING_MARK, 1)[0].trim());
    if (!Object.prototype.hasOwnProperty.call(entry.promptMap, prompt)) {
      throw new Error(`unrecognized advanced prompt for ${form}: ${prompt}`);
    }
    return entry.promptMap[prompt];
  };
}
module.exports = { makeSolver };
