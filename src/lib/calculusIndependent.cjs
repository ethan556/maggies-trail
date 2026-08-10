const answers = require('./calculusIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
module.exports = { solvePrompt: makeSolver(answers) };
