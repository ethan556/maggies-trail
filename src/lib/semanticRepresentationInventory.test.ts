import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SemanticRepresentationSchema } from "./semanticRepresentation";

const projectRoot = resolve(import.meta.dirname, "../..");
const tsxCli = resolve(projectRoot, "node_modules/tsx/dist/cli.mjs");
const inventoryScript = resolve(
  projectRoot,
  "scripts/audit/semantic-representation-inventory.mts",
);
const temporaryRoots: string[] = [];

type InventoryCheck = {
  mode: "check";
  status: "CURRENT";
  sourceSeal: { sourceRoot: string; fileCount: number; sha256: string };
  inventorySha256: string;
  recordCount: number;
  measuredCounts: Array<{
    location: string;
    stepKind: string;
    surface: string;
    state: string;
    count: number;
  }>;
};

function temporaryCourseRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "maggies-semantic-representation-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "content", "courses", "foundation", "lessons"), {
    recursive: true,
  });
  return root;
}

function runInventoryCheck(sources: Record<string, unknown>): InventoryCheck {
  const root = temporaryCourseRoot();
  const lessonsRoot = join(root, "content", "courses", "foundation", "lessons");
  for (const [lessonId, lesson] of Object.entries(sources)) {
    writeFileSync(join(lessonsRoot, `${lessonId}.json`), JSON.stringify(lesson));
  }

  return JSON.parse(
    String(
      execFileSync(process.execPath, [tsxCli, inventoryScript, "--check"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 120_000,
      }),
    ),
  ) as InventoryCheck;
}

function measuredCount(
  inventory: InventoryCheck,
  location: string,
  stepKind: string,
  surface: string,
  state: string,
): number | undefined {
  return inventory.measuredCounts.find(
    (entry) =>
      entry.location === location &&
      entry.stepKind === stepKind &&
      entry.surface === surface &&
      entry.state === state,
  )?.count;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

const fixture = {
  id: "foundation-01",
  steps: [
    { id: "c1", kind: "concept", figure: "array-model" },
    {
      id: "i1",
      kind: "interactive",
      widget: { type: "ratioTable", panels: [{ title: "given" }] },
    },
    {
      id: "i2",
      kind: "interactive",
      widget: {
        type: "steppedReveal",
        panels: [{ title: "first" }, { title: "second" }],
      },
    },
    { id: "k1", kind: "check" },
    { id: "ch1", kind: "challenge" },
  ],
  remedials: [
    {
      concept: { id: "r1", kind: "concept", figure: "ten-frame" },
      check: { id: "r2", kind: "check" },
    },
  ],
};

describe("semantic representation foundation", () => {
  it("keeps the future schema strict and free of approval fields", () => {
    expect(
      SemanticRepresentationSchema.safeParse({
        modality: "diagram",
        role: "model",
        description: "A ten-frame models the quantity.",
        approval: "approved",
      }).success,
    ).toBe(false);
  });

  it("measures each required source surface through the strict CLI boundary", () => {
    const inventory = runInventoryCheck({ "foundation-01": fixture });

    expect(inventory).toMatchObject({
      mode: "check",
      status: "CURRENT",
      recordCount: 24,
      sourceSeal: { sourceRoot: "content/courses", fileCount: 1 },
    });
    expect(inventory.sourceSeal.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(inventory.inventorySha256).toMatch(/^[a-f0-9]{64}$/);
    expect(measuredCount(inventory, "main", "concept", "figure", "present")).toBe(1);
    expect(
      measuredCount(inventory, "main", "interactive", "widget-panel", "present"),
    ).toBe(1);
    expect(
      measuredCount(
        inventory,
        "main",
        "interactive",
        "stepped-reveal-panel",
        "present",
      ),
    ).toBe(2);
    expect(
      measuredCount(
        inventory,
        "remedial-concept",
        "concept",
        "instructional-step",
        "present",
      ),
    ).toBe(1);
    expect(
      measuredCount(inventory, "remedial-check", "check", "widget", "absent"),
    ).toBe(1);
    expect(measuredCount(inventory, "main", "challenge", "figure", "absent")).toBe(1);
    expect(inventory.measuredCounts.some((entry) => entry.state === "malformed")).toBe(false);
  });

  it("is deterministic across source insertion order and seals the full input set", () => {
    const secondFixture = {
      id: "foundation-02",
      steps: [{ id: "c2", kind: "concept", figure: "bar-model" }],
    };
    const first = runInventoryCheck({
      "foundation-02": secondFixture,
      "foundation-01": fixture,
    });
    const second = runInventoryCheck({
      "foundation-01": fixture,
      "foundation-02": secondFixture,
    });

    expect(second).toEqual(first);
    expect(first.sourceSeal.fileCount).toBe(2);
    expect(first.sourceSeal.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});