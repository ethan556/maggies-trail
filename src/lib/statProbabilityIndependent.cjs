const answers = require('./statProbabilityIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
module.exports = { solvePrompt: makeSolver(answers) };
