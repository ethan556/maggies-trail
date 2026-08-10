const answers = require('./precalculusIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
module.exports = { solvePrompt: makeSolver(answers) };
