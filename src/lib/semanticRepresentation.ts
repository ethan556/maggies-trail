import { z } from "zod";

/**
 * Semantic-representation foundation.
 *
 * This is deliberately an annotation contract, not a review ledger. It names what a future
 * migration may declare about a mathematical representation, but it contains no approval,
 * quality, completion, or reviewer-status field. Those judgements belong to evidence workflows,
 * never to the source inventory.
 */
export const SemanticRepresentationModalitySchema = z.enum([
  "concrete",
  "diagram",
  "number-line",
  "table",
  "symbolic",
  "graph",
  "language",
]);

export const SemanticRepresentationRoleSchema = z.enum([
  "given",
  "model",
  "operation",
  "comparison",
  "relationship",
  "transformation",
  "conclusion",
]);

/** A future explicit declaration attached to source; no current lesson is migrated by this file. */
export const SemanticRepresentationSchema = z
  .object({
    modality: SemanticRepresentationModalitySchema,
    role: SemanticRepresentationRoleSchema,
    description: z.string().min(1),
  })
  .strict();

export type SemanticRepresentation = z.infer<typeof SemanticRepresentationSchema>;

/** Where a measured source observation lives. */
export const SemanticRepresentationLocationSchema = z.enum([
  "main",
  "remedial-concept",
  "remedial-check",
]);

/** The structural surface observed by the source-only migration inventory. */
export const SemanticRepresentationSurfaceSchema = z.enum([
  "instructional-step",
  "figure",
  "widget",
  "widget-panel",
  "stepped-reveal-panel",
]);

/** Source facts only: an authored surface exists, is absent, or is structurally malformed. */
export const SemanticRepresentationMeasuredStateSchema = z.enum([
  "present",
  "absent",
  "malformed",
]);

export const SemanticRepresentationInventoryRecordSchema = z
  .object({
    sourcePath: z.string().min(1),
    courseId: z.string().min(1),
    lessonId: z.string().min(1),
    stepId: z.string().min(1),
    location: SemanticRepresentationLocationSchema,
    stepKind: z.string().min(1),
    surface: SemanticRepresentationSurfaceSchema,
    state: SemanticRepresentationMeasuredStateSchema,
    reference: z.string().min(1).optional(),
    panelIndex: z.number().int().nonnegative().optional(),
  })
  .strict()
  .superRefine((record, ctx) => {
    const panel = record.surface === "widget-panel" || record.surface === "stepped-reveal-panel";
    if (panel && record.state === "present" && record.panelIndex === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "present panel records require panelIndex" });
    }
    if ((record.surface === "figure" || record.surface === "widget") && record.state === "present" && !record.reference) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "present figure/widget records require reference" });
    }
  });

export type SemanticRepresentationInventoryRecord = z.infer<typeof SemanticRepresentationInventoryRecordSchema>;

export const SemanticRepresentationSourceFileSchema = z
  .object({
    path: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

export const SemanticRepresentationSourceSealSchema = z
  .object({
    algorithm: z.literal("sha256"),
    sourceRoot: z.literal("content/courses"),
    fileCount: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    files: z.array(SemanticRepresentationSourceFileSchema),
  })
  .strict();

export const SemanticRepresentationInventoryCountSchema = z
  .object({
    location: SemanticRepresentationLocationSchema,
    stepKind: z.string().min(1),
    surface: SemanticRepresentationSurfaceSchema,
    state: SemanticRepresentationMeasuredStateSchema,
    count: z.number().int().positive(),
  })
  .strict();

export const SemanticRepresentationInventorySchema = z
  .object({
    version: z.literal(1),
    sourceSeal: SemanticRepresentationSourceSealSchema,
    records: z.array(SemanticRepresentationInventoryRecordSchema),
    counts: z.array(SemanticRepresentationInventoryCountSchema),
  })
  .strict();

export type SemanticRepresentationInventory = z.infer<typeof SemanticRepresentationInventorySchema>;
