import templates from "./precalculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

export const PRECALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 12 Precalculus isomorphic authored variants"
);
