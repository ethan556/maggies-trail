import type { IconName } from "@/components/ui";

/**
 * Premium curriculum-illustration registry.
 *
 * The curriculum has 129 courses and more than 1,700 lessons. Pretending each one needs a
 * one-off icon would produce an incoherent, impossible-to-QA library. These stable semantic ids
 * are the deliberately small visual vocabulary shared by Catalog, Dashboard and Basecamp:
 *
 *   12 subject families + 14 grade/level markers + 5 structural waymarks.
 *
 * `enabled` is a release fence, not an art-progress hint. It flips only after the 512px WebP is
 * present and has passed the contact-sheet review in CURRICULUM_ICON_ART_PRODUCTION_SPEC.md.
 */

export const SUBJECT_ILLUSTRATION_IDS = [
  "subject-number-place-value",
  "subject-operations",
  "subject-fractions-ratios",
  "subject-measurement",
  "subject-time",
  "subject-geometry-shapes",
  "subject-angles-construction",
  "subject-algebra-equations",
  "subject-functions-graphs",
  "subject-statistics-data",
  "subject-probability-chance",
  "subject-calculus-change"
] as const;

export const GRADE_ILLUSTRATION_IDS = [
  "grade-k",
  "grade-01",
  "grade-02",
  "grade-03",
  "grade-04",
  "grade-05",
  "grade-06",
  "grade-07",
  "grade-08",
  "grade-algebra-1",
  "grade-geometry",
  "grade-algebra-2",
  "grade-precalculus",
  "grade-calculus"
] as const;

export const STRUCTURE_ILLUSTRATION_IDS = [
  "structure-course-trail",
  "structure-chapter-landmark",
  "structure-lesson-waypoint",
  "structure-practice-clearing",
  "structure-assessment-summit"
] as const;

export type SubjectIllustrationId = (typeof SUBJECT_ILLUSTRATION_IDS)[number];
export type GradeIllustrationId = (typeof GRADE_ILLUSTRATION_IDS)[number];
export type StructureIllustrationId = (typeof STRUCTURE_ILLUSTRATION_IDS)[number];
export type CurriculumIllustrationId =
  | SubjectIllustrationId
  | GradeIllustrationId
  | StructureIllustrationId;

export type CurriculumIllustrationCategory = "subjects" | "grades" | "structure";

export interface CurriculumIconAsset {
  id: CurriculumIllustrationId;
  category: CurriculumIllustrationCategory;
  label: string;
  src: `/illustrations/icons/${CurriculumIllustrationCategory}/${string}-512.webp`;
  /** Code-native fallback used until the independently reviewed painterly asset is released. */
  fallbackIcon: IconName;
  /** Grade badges use concise live text in their fallback instead of pretending a glyph is grade art. */
  fallbackText?: string;
  enabled: boolean;
}

function subject(
  id: SubjectIllustrationId,
  label: string,
  fallbackIcon: IconName
): CurriculumIconAsset {
  return {
    id,
    category: "subjects",
    label,
    src: `/illustrations/icons/subjects/${id}-512.webp`,
    fallbackIcon,
    enabled: true
  };
}

function grade(
  id: GradeIllustrationId,
  label: string,
  fallbackText: string,
  fallbackIcon: IconName
): CurriculumIconAsset {
  return {
    id,
    category: "grades",
    label,
    src: `/illustrations/icons/grades/${id}-512.webp`,
    fallbackIcon,
    fallbackText,
    enabled: true
  };
}

function structure(
  id: StructureIllustrationId,
  label: string,
  fallbackIcon: IconName,
  enabled = false
): CurriculumIconAsset {
  return {
    id,
    category: "structure",
    label,
    src: `/illustrations/icons/structure/${id}-512.webp`,
    fallbackIcon,
    enabled
  };
}

const ASSETS: Record<CurriculumIllustrationId, CurriculumIconAsset> = {
  "subject-number-place-value": subject("subject-number-place-value", "Numbers and place value", "icon-902"),
  "subject-operations": subject("subject-operations", "Operations and fluency", "icon-903"),
  "subject-fractions-ratios": subject("subject-fractions-ratios", "Fractions, ratios and percent", "icon-904"),
  "subject-measurement": subject("subject-measurement", "Measurement", "icon-905"),
  "subject-time": subject("subject-time", "Time", "icon-906"),
  "subject-geometry-shapes": subject("subject-geometry-shapes", "Geometry and shapes", "icon-907"),
  "subject-angles-construction": subject("subject-angles-construction", "Angles and construction", "icon-908"),
  "subject-algebra-equations": subject("subject-algebra-equations", "Algebra and equations", "icon-909"),
  "subject-functions-graphs": subject("subject-functions-graphs", "Functions and graphs", "icon-910"),
  "subject-statistics-data": subject("subject-statistics-data", "Statistics and data", "icon-805"),
  "subject-probability-chance": subject("subject-probability-chance", "Probability and chance", "icon-912"),
  "subject-calculus-change": subject("subject-calculus-change", "Calculus and change", "icon-911"),

  "grade-k": grade("grade-k", "Kindergarten", "K", "icon-101"),
  "grade-01": grade("grade-01", "Grade 1", "1", "icon-101"),
  "grade-02": grade("grade-02", "Grade 2", "2", "icon-101"),
  "grade-03": grade("grade-03", "Grade 3", "3", "icon-102"),
  "grade-04": grade("grade-04", "Grade 4", "4", "icon-102"),
  "grade-05": grade("grade-05", "Grade 5", "5", "icon-102"),
  "grade-06": grade("grade-06", "Grade 6", "6", "icon-201"),
  "grade-07": grade("grade-07", "Grade 7", "7", "icon-201"),
  "grade-08": grade("grade-08", "Grade 8", "8", "icon-201"),
  "grade-algebra-1": grade("grade-algebra-1", "Algebra 1", "A1", "icon-909"),
  "grade-geometry": grade("grade-geometry", "Geometry", "Geo", "icon-907"),
  "grade-algebra-2": grade("grade-algebra-2", "Algebra 2", "A2", "icon-909"),
  "grade-precalculus": grade("grade-precalculus", "Precalculus", "Pre", "icon-910"),
  "grade-calculus": grade("grade-calculus", "Calculus", "Calc", "icon-911"),

  "structure-course-trail": structure("structure-course-trail", "Course trail", "icon-101", true),
  "structure-chapter-landmark": structure("structure-chapter-landmark", "Chapter landmark", "icon-201", true),
  "structure-lesson-waypoint": structure("structure-lesson-waypoint", "Lesson waypoint", "icon-003", true),
  "structure-practice-clearing": structure("structure-practice-clearing", "Practice clearing", "icon-501", true),
  "structure-assessment-summit": structure(
    "structure-assessment-summit",
    "Assessment summit",
    "icon-205",
    true
  )
};

export const CURRICULUM_ICON_ASSETS = ASSETS;

export function curriculumIconAsset(id: CurriculumIllustrationId): CurriculumIconAsset {
  return ASSETS[id];
}

const GRADE_ID_BY_LEVEL: Record<number, GradeIllustrationId> = {
  0: "grade-k",
  1: "grade-01",
  2: "grade-02",
  3: "grade-03",
  4: "grade-04",
  5: "grade-05",
  6: "grade-06",
  7: "grade-07",
  8: "grade-08",
  9: "grade-algebra-1",
  10: "grade-geometry",
  11: "grade-algebra-2",
  12: "grade-precalculus",
  13: "grade-calculus"
};

export function gradeIllustrationId(gradeLevel: number): GradeIllustrationId {
  const id = GRADE_ID_BY_LEVEL[gradeLevel];
  if (!id) throw new RangeError(`No curriculum illustration is registered for grade level ${gradeLevel}`);
  return id;
}
