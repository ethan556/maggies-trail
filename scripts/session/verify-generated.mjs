#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const groups = [
  { outputs: ["FLAGSHIP_TIERS.md"], script: "scripts/flagship-tier.mjs" },
  { outputs: ["FLAGSHIP.md"], script: "scripts/flagship-rank.mjs" },
  { outputs: ["PLAYBOOK_STATUS.md"], script: "scripts/measure/playbook-status.mjs" },
  { outputs: ["EXCELLENCE_BACKLOG_S126.md", "EXCELLENCE_BACKLOG_S126.json", "EXCELLENCE_BACKLOG_S126.csv"], script: "scripts/audit/excellence-backlog-s126.mjs" },
  { outputs: ["ENGINE_REGISTRATION_CONTRACT_S126.md", "ENGINE_REGISTRATION_CONTRACT_S126.json"], script: "scripts/audit/engine-registration-contract.mjs" },
  { outputs: ["PLAYER_HARNESS_CONTRACT_S127.md", "PLAYER_HARNESS_CONTRACT_S127.json"], script: "scripts/audit/player-harness-contract-s127.mjs" },
  { outputs: ["REUSE_WAVE_S128.md", "REUSE_WAVE_S128.json"], script: "scripts/audit/reuse-wave-s128.mjs" },
  { outputs: ["ESTIMATE_COMPARE_S129.md", "ESTIMATE_COMPARE_S129.json"], script: "scripts/audit/estimate-compare-s129.mjs" },
  { outputs: ["GRID_READ_S130.md", "GRID_READ_S130.json"], script: "scripts/audit/grid-read-s130.mjs" },
  { outputs: ["DISTRIBUTION_COMPARE_S131.md", "DISTRIBUTION_COMPARE_S131.json"], script: "scripts/audit/distribution-compare-s131.mjs" },
  { outputs: ["TRIAL_PROBABILITY_S132.md", "TRIAL_PROBABILITY_S132.json"], script: "scripts/audit/trial-probability-s132.mjs" },
  { outputs: ["COMPOUND_EVENT_S133.md", "COMPOUND_EVENT_S133.json"], script: "scripts/audit/compound-event-s133.mjs" },
  { outputs: ["COMPOSITE_AREA_S136.md", "COMPOSITE_AREA_S136.json"], script: "scripts/audit/composite-area-s136.mjs" },
  { outputs: ["GEOMETRY_ROUNDUP_S137.md", "GEOMETRY_ROUNDUP_S137.json"], script: "scripts/audit/geometry-roundup-s137.mjs" }
  ,{ outputs: ["PERCENT_CHANGE_S138.md", "PERCENT_CHANGE_S138.json"], script: "scripts/audit/percent-change-s138.mjs" }
  ,{ outputs: ["SIGNED_FRACTION_VARIANT_SWEEP_S139.json"], script: "scripts/audit/signed-fraction-variant-sweep-s139.cjs" }
  ,{ outputs: ["SIGNED_FRACTION_S139.md", "SIGNED_FRACTION_S139.json"], script: "scripts/audit/signed-fraction-s139.mjs" }
  ,{ outputs: ["SHAPE_HIERARCHY_VARIANT_SWEEP_S140.json"], script: "scripts/audit/shape-hierarchy-variant-sweep-s140.cjs" }
  ,{ outputs: ["SHAPE_HIERARCHY_S140.md", "SHAPE_HIERARCHY_S140.json"], script: "scripts/audit/shape-hierarchy-s140.mjs" }
  ,{ outputs: ["EQUATION_OUTCOME_S141.md", "EQUATION_OUTCOME_S141.json"], script: "scripts/audit/equation-outcome-s141.mjs" }
  ,{ outputs: ["CONDITIONAL_TABLE_VARIANT_SWEEP_S142.json"], script: "scripts/audit/conditional-table-variant-sweep-s142.cjs" }
  ,{ outputs: ["CONDITIONAL_TABLE_S142.md", "CONDITIONAL_TABLE_S142.json"], script: "scripts/audit/conditional-table-s142.mjs" }
  ,{ outputs: ["GRAPH_STORY_VARIANT_SWEEP_S143.json"], script: "scripts/audit/graph-story-variant-sweep-s143.cjs" }
  ,{ outputs: ["GRAPH_STORY_S143.md", "GRAPH_STORY_S143.json"], script: "scripts/audit/graph-story-s143.mjs" }
  ,{ outputs: ["SESSION143_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION143_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/graph-story-mutations-s143.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S144.md", "SOURCE_TRANSPILE_S144.json"], script: "scripts/audit/source-transpile-s144.mjs" }
  ,{ outputs: ["CONTENT_JSON_S144.md", "CONTENT_JSON_S144.json"], script: "scripts/audit/content-json-s144.mjs" }
  ,{ outputs: ["PROPORTIONAL_REASONING_VARIANT_SWEEP_S144.json"], script: "scripts/audit/proportional-reasoning-variant-sweep-s144.cjs" }
  ,{ outputs: ["PROPORTIONAL_REASONING_S144.md", "PROPORTIONAL_REASONING_S144.json"], script: "scripts/audit/proportional-reasoning-s144.mjs" }
  ,{ outputs: ["SESSION144_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION144_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/proportional-reasoning-mutations-s144.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S145.md", "SOURCE_TRANSPILE_S145.json"], script: "scripts/audit/source-transpile-s145.mjs" }
  ,{ outputs: ["PLACE_VALUE_TRANSFORM_VARIANT_SWEEP_S145.json"], script: "scripts/audit/place-value-transform-variant-sweep-s145.cjs" }
  ,{ outputs: ["PLACE_VALUE_TRANSFORM_S145.md", "PLACE_VALUE_TRANSFORM_S145.json"], script: "scripts/audit/place-value-transform-s145.mjs" }
  ,{ outputs: ["SESSION145_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION145_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/place-value-transform-mutations-s145.mjs" }
  ,{ outputs: ["CONTENT_JSON_S145.md", "CONTENT_JSON_S145.json"], script: "scripts/audit/content-json-s145.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S146.md", "SOURCE_TRANSPILE_S146.json"], script: "scripts/audit/source-transpile-s146.mjs" }
  ,{ outputs: ["QUOTIENT_REASONING_VARIANT_SWEEP_S146.json"], script: "scripts/audit/quotient-reasoning-variant-sweep-s146.cjs" }
  ,{ outputs: ["QUOTIENT_REASONING_S146.md", "QUOTIENT_REASONING_S146.json"], script: "scripts/audit/quotient-reasoning-s146.py", command: "python" }
  ,{ outputs: ["SESSION146_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION146_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/quotient-reasoning-mutations-s146.mjs" }
  ,{ outputs: ["SESSION146_FAILURE_FIRST_AUDIT.md", "SESSION146_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session146-failure-first.mjs" }
  ,{ outputs: ["CONTENT_JSON_S146.md", "CONTENT_JSON_S146.json"], script: "scripts/audit/content-json-s146.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S147.md", "SOURCE_TRANSPILE_S147.json"], script: "scripts/audit/source-transpile-s147.mjs" }
  ,{ outputs: ["AFFINE_RELATIONSHIP_VARIANT_SWEEP_S147.json"], script: "scripts/audit/affine-relationship-variant-sweep-s147.cjs" }
  ,{ outputs: ["AFFINE_RELATIONSHIP_S147.md", "AFFINE_RELATIONSHIP_S147.json"], script: "scripts/audit/affine-relationship-s147.py", command: "python" }
  ,{ outputs: ["SESSION147_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION147_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/affine-relationship-mutations-s147.mjs" }
  ,{ outputs: ["SESSION147_FAILURE_FIRST_AUDIT.md", "SESSION147_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session147-failure-first.mjs" }
  ,{ outputs: ["CONTENT_JSON_S147.md", "CONTENT_JSON_S147.json"], script: "scripts/audit/content-json-s147.mjs" }
  ,{ outputs: ["SESSION147_CONTENT_CHANGE_LEDGER.json", "SESSION147_AUTHORED_CONTENT_LEDGER.json"], script: "scripts/session/content-change-proof-s147.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S148.md", "SOURCE_TRANSPILE_S148.json"], script: "scripts/audit/source-transpile-s148.mjs" }
  ,{ outputs: ["EXACT_NUMBER_VARIANT_SWEEP_S148.json"], script: "scripts/audit/exact-number-variant-sweep-s148.cjs" }
  ,{ outputs: ["EXACT_NUMBER_S148.md", "EXACT_NUMBER_S148.json"], script: "scripts/audit/exact-number-s148.py", command: "python" }
  ,{ outputs: ["SESSION148_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION148_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/exact-number-mutations-s148.mjs" }
  ,{ outputs: ["SESSION148_FAILURE_FIRST_AUDIT.md", "SESSION148_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session148-failure-first.mjs" }
  ,{ outputs: ["CONTENT_JSON_S148.md", "CONTENT_JSON_S148.json"], script: "scripts/audit/content-json-s148.mjs" }
  ,{ outputs: ["SESSION148_CONTENT_CHANGE_LEDGER.json", "SESSION148_AUTHORED_CONTENT_LEDGER.json"], script: "scripts/session/content-change-proof-s148.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S149.md", "SOURCE_TRANSPILE_S149.json"], script: "scripts/audit/source-transpile-s149.mjs" }
  ,{ outputs: ["GEOMETRIC_CONSTRAINT_VARIANT_SWEEP_S149.json"], script: "scripts/audit/geometric-constraint-variant-sweep-s149.cjs" }
  ,{ outputs: ["GEOMETRIC_CONSTRAINT_S149.md", "GEOMETRIC_CONSTRAINT_S149.json", "SESSION149_AUTHORED_CONTENT_LEDGER.json"], script: "scripts/audit/geometric-constraint-s149.py", command: "python" }
  ,{ outputs: ["SESSION149_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION149_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/geometric-constraint-mutations-s149.mjs" }
  ,{ outputs: ["SESSION149_FAILURE_FIRST_AUDIT.md", "SESSION149_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session149-failure-first.mjs" }
  ,{ outputs: ["CONTENT_JSON_S149.md", "CONTENT_JSON_S149.json"], script: "scripts/audit/content-json-s149.mjs" }
  ,{ outputs: ["SESSION149_CONTENT_CHANGE_LEDGER.json", "SESSION149_AUTHORED_CONTENT_LEDGER_SUMMARY.json"], script: "scripts/session/content-change-proof-s149.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S150.md", "SOURCE_TRANSPILE_S150.json"], script: "scripts/audit/source-transpile-s150.mjs" }
  ,{ outputs: ["CONTENT_JSON_S150.md", "CONTENT_JSON_S150.json"], script: "scripts/audit/content-json-s150.mjs" }
  ,{ outputs: ["POINT_SET_REASONING_VARIANT_SWEEP_S150.json"], script: "scripts/audit/point-set-reasoning-variant-sweep-s150.cjs" }
  ,{ outputs: ["POINT_SET_REASONING_S150.md", "POINT_SET_REASONING_S150.json", "SESSION150_AUTHORED_CONTENT_LEDGER.json"], script: "scripts/audit/point-set-reasoning-s150.py", command: "python" }
  ,{ outputs: ["SESSION150_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION150_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/point-set-reasoning-mutations-s150.mjs" }
  ,{ outputs: ["SESSION150_FAILURE_FIRST_AUDIT.md", "SESSION150_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session150-failure-first.mjs" }
  ,{ outputs: ["SESSION150_CONTENT_CHANGE_LEDGER.json"], script: "scripts/session/content-change-proof-s150.mjs" }
  ,{ outputs: ["SESSION151_HS_TIER_REVIEW.md", "SESSION151_HS_TIER_REVIEW.json", "SESSION151_EXACT_FIT_RERANK.md", "SESSION151_EXACT_FIT_RERANK.json"], script: "scripts/audit/session151-hs-tier-review.mjs" }
  ,{ outputs: ["SESSION151_AUTHORED_ANCHOR_AUDIT.md", "SESSION151_AUTHORED_ANCHOR_AUDIT.json"], script: "scripts/audit/session151-authored-content.mjs" }
  ,{ outputs: ["SESSION151_INTEGRATION_AUDIT.json"], script: "scripts/audit/session151-integration.mjs" }
  ,{ outputs: ["SESSION151_ENGINE_SWEEP.json"], script: "scripts/audit/session151-engine-sweep.cjs" }
  ,{ outputs: ["SESSION151_ADVERSARIAL_MUTATION_MATRIX.md", "SESSION151_ADVERSARIAL_MUTATION_MATRIX.json"], script: "scripts/audit/session151-mutations.mjs" }
  ,{ outputs: ["SOURCE_TRANSPILE_S151.md", "SOURCE_TRANSPILE_S151.json"], script: "scripts/audit/source-transpile-s151.mjs" }
  ,{ outputs: ["CONTENT_JSON_S151.md", "CONTENT_JSON_S151.json"], script: "scripts/audit/content-json-s151.mjs" }
  ,{ outputs: ["SESSION151_CONTENT_CHANGE_LEDGER.json", "SESSION151_AUTHORED_CONTENT_LEDGER.json"], script: "scripts/session/content-change-proof-s151.mjs" }
  ,{ outputs: ["SESSION151_LESSON_HASHES.json"], script: "scripts/session/verify-frozen-s151-ledger.mjs" }
  ,{ outputs: ["SESSION151_FAILURE_FIRST_AUDIT.md", "SESSION151_FAILURE_FIRST_AUDIT.json"], script: "scripts/audit/session151-failure-first.mjs" }
];
groups.splice(2, 0, { outputs: ["PRODUCT_STATE.md", "PRODUCT_STATE.json", "PRODUCT_STATE_VERIFIED.json"], script: "scripts/gen-product-state.mjs" });

const start = Number(process.env.VERIFY_GROUP_START ?? 0);
const end = Number(process.env.VERIFY_GROUP_END ?? groups.length);
const selectedGroups = groups.slice(start, end);
const outputs = selectedGroups.flatMap((group) => group.outputs);
const hash = (path) => createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
const before = Object.fromEntries(outputs.map((path) => [path, hash(path)]));
for (const group of selectedGroups) execFileSync(group.command === "python" ? "python" : process.execPath, [join(root, group.script)], { cwd: root, stdio: "inherit", timeout: 900_000 });
const changed = outputs.filter((path) => hash(path) !== before[path]);
if (changed.length) {
  console.error(`generated freshness failed: regeneration changed ${changed.join(", ")}`);
  console.error("The files were regenerated. Review and rerun this gate; the second run must be clean.");
  process.exit(1);
}
console.log(`generated freshness passed: groups ${start}-${end} · ${outputs.length} artifacts byte-stable after regeneration`);
