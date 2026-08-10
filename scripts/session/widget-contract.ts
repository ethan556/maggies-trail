/* Runs as: npx tsx scripts/session/widget-contract.ts <engineType> [<engineType>…]
 *
 * Prints an engine's REAL contract — required fields, optional fields, defaults, and enum values —
 * read out of `WidgetSpec` itself rather than inferred from a donor lesson.
 *
 * WHY THIS EXISTS. Two batches of the high-school Tier C repair each lost gate cycles to the same
 * failure: a donor config printed to the terminal is TRUNCATED, so a required field below the cut
 * is invisible until `validate:content` rejects the write.
 *   S203F  `plotPoint.missFeedback`      — two lessons rejected
 *   S203K  `volumeBuilder.low/highFeedback` — three lessons rejected
 * A worse variant costs more than a cycle: `shapeFamilyBuilder.targetName` is an enum with no
 * `parallelogram` in it, so a lesson about the general parallelogram cannot be modelled by that
 * engine at all. That is a FIT decision, and discovering it after authoring the config wastes the
 * authoring.
 *
 * So: read the contract first, author once. Enum values are the fit test; required fields are the
 * gate test; this prints both in one place.
 */
import { WidgetSpec } from "../../src/lib/schema";
import type { ZodTypeAny } from "zod";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: npx tsx scripts/session/widget-contract.ts <engineType> [...]");
  process.exit(2);
}

/* Unwrap the layers Zod stacks around a field so we can name what it really is. */
function describe(schema: ZodTypeAny): { kind: string; detail?: string; optional: boolean; def?: unknown } {
  let s: any = schema;
  let optional = false;
  let def: unknown;
  for (;;) {
    const t = s?._def?.typeName;
    if (t === "ZodOptional") { optional = true; s = s._def.innerType; continue; }
    if (t === "ZodDefault") { optional = true; def = s._def.defaultValue(); s = s._def.innerType; continue; }
    if (t === "ZodEffects") { s = s._def.schema; continue; }
    break;
  }
  const t = s?._def?.typeName;
  switch (t) {
    case "ZodEnum": return { kind: "enum", detail: s._def.values.join(" | "), optional, def };
    case "ZodLiteral": return { kind: "literal", detail: JSON.stringify(s._def.value), optional, def };
    case "ZodString": return { kind: "string", optional, def };
    case "ZodNumber": return { kind: "number", optional, def };
    case "ZodBoolean": return { kind: "boolean", optional, def };
    case "ZodArray": {
      const inner = describe(s._def.type);
      return { kind: "array", detail: `of ${inner.kind}${inner.detail ? ` (${inner.detail})` : ""}`, optional, def };
    }
    case "ZodObject": return { kind: "object", detail: `{ ${Object.keys(s._def.shape()).join(", ")} }`, optional, def };
    case "ZodTuple": return { kind: "tuple", optional, def };
    case "ZodUnion": return { kind: "union", optional, def };
    default: return { kind: String(t ?? "unknown"), optional, def };
  }
}

const options: any[] = (WidgetSpec as any)._def.options;
const byType = new Map<string, any>();
for (const opt of options) {
  const lit = opt?._def?.shape?.()?.type?._def?.value;
  if (typeof lit === "string") byType.set(lit, opt);
}

for (const name of args) {
  const spec = byType.get(name);
  if (!spec) {
    console.error(`\n${name}: NOT a registered widget type.`);
    const near = [...byType.keys()].filter((k) => k.toLowerCase().includes(name.toLowerCase().slice(0, 5)));
    if (near.length) console.error(`  did you mean: ${near.join(", ")}`);
    continue;
  }
  const shape = spec._def.shape();
  const rows = Object.entries(shape).map(([k, v]) => [k, describe(v as ZodTypeAny)] as const);
  const required = rows.filter(([, d]) => !d.optional);
  const optional = rows.filter(([, d]) => d.optional);

  console.log(`\n=== ${name} ===`);
  console.log(`REQUIRED (${required.length}) — omit any of these and validate:content rejects the write:`);
  for (const [k, d] of required) {
    console.log(`  ${k.padEnd(22)}${d.kind}${d.detail ? `  ${d.detail}` : ""}`);
  }
  if (optional.length) {
    console.log(`optional (${optional.length}):`);
    for (const [k, d] of optional) {
      const dv = d.def === undefined ? "" : `  = ${JSON.stringify(d.def)}`;
      console.log(`  ${k.padEnd(22)}${d.kind}${d.detail ? `  ${d.detail}` : ""}${dv}`);
    }
  }
  const enums = rows.filter(([, d]) => d.kind === "enum" && d.detail !== `"${name}"`);
  if (enums.length) {
    console.log(`ENUMS — these are the FIT test. If the mathematics you need is not in the list, the`);
    console.log(`engine cannot model this lesson honestly and the lesson should be refused:`);
    for (const [k, d] of enums) console.log(`  ${k}: ${d.detail}`);
  }
}
