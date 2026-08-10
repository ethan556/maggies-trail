import templates from "./calculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

export const CALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 13 Calculus isomorphic authored variants"
);
