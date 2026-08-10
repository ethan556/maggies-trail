#!/usr/bin/env node
/** Dependency-free, generated engine-registration contract. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const schema = read("src/lib/schema.ts");
const evaluate = read("src/lib/evaluate.ts");
const pedagogy = read("src/lib/pedagogy.ts");
const widgets = read("src/components/widgets.tsx");
const stageWidth = read("src/components/stageWidth.ts");
const samples = read("src/components/widgetSamples.ts");
const describe = read("src/lib/describeState.ts");
const caps = JSON.parse(read("scripts/engine-capabilities.json")).types;
const types = Object.keys(caps).sort();

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasCase = (source, type) => new RegExp(`case\\s+["']${escape(type)}["']\\s*:`).test(source);
const hasQuoted = (source, type) => new RegExp(`["']${escape(type)}["']`).test(source);
const hasKey = (source, type) => new RegExp(`(?:^|\\n)\\s*${escape(type)}\\s*:`).test(source);

function specName(type) {
  const literal = `type: z.literal("${type}")`;
  const at = schema.indexOf(literal);
  if (at < 0) return null;
  const before = schema.slice(Math.max(0, at - 1200), at);
  const matches = [...before.matchAll(/export const (\w+Spec)\s*=\s*z\./g)];
  return matches.at(-1)?.[1] ?? null;
}

const unionStart = schema.indexOf('export const WidgetSpec = z.discriminatedUnion("type", [');
const unionEnd = schema.indexOf("\n]);", unionStart);
const unionBlock = unionStart >= 0 && unionEnd >= 0 ? schema.slice(unionStart, unionEnd) : "";
const registeredStart = widgets.indexOf("export const REGISTERED_WIDGETS = [");
const registeredEnd = widgets.indexOf("\n] as const", registeredStart);
const registeredBlock = registeredStart >= 0 && registeredEnd >= 0 ? widgets.slice(registeredStart, registeredEnd) : "";

const rows = types.map((type) => {
  const spec = specName(type);
  const surfaces = {
    schemaSpec: Boolean(spec),
    schemaUnion: Boolean(spec && new RegExp(`\\b${escape(spec)}\\b`).test(unionBlock)),
    schemaTypeExport: Boolean(spec && new RegExp(`z\\.infer<typeof ${escape(spec)}>`).test(schema)),
    evaluateCases: (evaluate.match(new RegExp(`case\\s+["']${escape(type)}["']\\s*:`, "g")) ?? []).length,
    pedagogyWrongPaths: hasCase(pedagogy, type),
    rendererSwitch: hasCase(widgets, type),
    registeredWidgets: hasQuoted(registeredBlock, type),
    stageWidth: hasKey(stageWidth, type),
    widgetSamples: new RegExp(`type:\\s*["']${escape(type)}["']`).test(samples),
    describeState: hasCase(describe, type),
    engineCapabilities: Object.hasOwn(caps, type)
  };
  const coreMissing = [];
  for (const field of ["schemaSpec", "schemaUnion", "schemaTypeExport", "pedagogyWrongPaths", "rendererSwitch", "registeredWidgets", "stageWidth", "widgetSamples", "engineCapabilities"]) {
    if (!surfaces[field]) coreMissing.push(field);
  }
  if (surfaces.evaluateCases < 1) coreMissing.push("evaluateCases");
  return { type, spec, surfaces, coreMissing };
});

const failures = rows.filter((row) => row.coreMissing.length);
const report = {
  generatedAt: "deterministic-no-wall-clock",
  registryAuthority: "scripts/engine-capabilities.json (cross-checked against source surfaces)",
  types: rows.length,
  completeCore: rows.length - failures.length,
  incompleteCore: failures.length,
  definitions: {
    core: "schema spec + discriminated union + inferred type + evaluator + pedagogy wrong paths + renderer + registered list + stage tier + sample + capability row",
    conditional: "describeState is required for engines with a meaningful nonvisual state description; evaluator case count records the multiple grading/canCheck/correct-answer surfaces without hard-coding a total"
  },
  rows
};
writeFileSync(join(root, "ENGINE_REGISTRATION_CONTRACT_S126.json"), JSON.stringify(report, null, 2) + "\n");
const md = [
  "# ENGINE_REGISTRATION_CONTRACT_S126 — generated",
  "",
  "Regenerate with `npm run check:engine-registration`. The contract is discovered from the current registry and source; it does not freeze an obsolete ‘8/11/12-file’ count.",
  "",
  `- Widget types: **${rows.length}**`,
  `- Core-complete: **${rows.length - failures.length}**`,
  `- Core-incomplete: **${failures.length}**`,
  "",
  "| type | spec | eval cases | pedagogy | renderer | registered | stage | sample | describe | missing core |",
  "|---|---|--:|---|---|---|---|---|---|---|",
  ...rows.map((row) => `| ${row.type} | ${row.spec ?? "—"} | ${row.surfaces.evaluateCases} | ${row.surfaces.pedagogyWrongPaths ? "✓" : "—"} | ${row.surfaces.rendererSwitch ? "✓" : "—"} | ${row.surfaces.registeredWidgets ? "✓" : "—"} | ${row.surfaces.stageWidth ? "✓" : "—"} | ${row.surfaces.widgetSamples ? "✓" : "—"} | ${row.surfaces.describeState ? "✓" : "—"} | ${row.coreMissing.join(", ") || "—"} |`),
  ""
];
writeFileSync(join(root, "ENGINE_REGISTRATION_CONTRACT_S126.md"), md.join("\n"));
if (failures.length) {
  console.error(`engine registration failed: ${failures.length} incomplete type(s)`);
  for (const row of failures) console.error(`- ${row.type}: ${row.coreMissing.join(", ")}`);
  process.exit(1);
}
console.log(`engine registration passed: ${rows.length}/${rows.length} core-complete; describeState ${rows.filter((r) => r.surfaces.describeState).length}/${rows.length}`);
