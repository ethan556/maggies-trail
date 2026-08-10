import templates from "./statProbabilityVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

export const STAT_PROBABILITY_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 10 Statistics and Probability isomorphic authored variants"
);
