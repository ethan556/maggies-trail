import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const parseCsv = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted && c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (!quoted && c === ",") { row.push(field); field = ""; }
    else if (!quoted && (c === "\n" || c === "\r")) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};

const walkJson = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walkJson(path) : entry.name.endsWith(".json") ? [path] : [];
});

describe("S248 engine reversible-play authority", () => {
  const root = process.cwd();
  const contracts = JSON.parse(readFileSync(resolve(root, "scripts/audit/engine-reversible-play-contracts-s248.json"), "utf8")) as Array<{
    widget_type: string;
    contract: string;
    reversible_manipulation: string;
    authored_domain: string;
  }>;
  const audit = parseCsv(readFileSync(resolve(root, "PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv"), "utf8"));

  it("source-closes exactly the 17 former remediation rows with a named evidence contract", () => {
    expect(contracts).toHaveLength(17);
    expect(new Set(contracts.map((entry) => entry.widget_type)).size).toBe(17);
    for (const contract of contracts) {
      const row = audit.find((candidate) => candidate.widget_type === contract.widget_type);
      expect(row, contract.widget_type).toBeDefined();
      expect(row?.exploration_decision, contract.widget_type).toBe("KEEP_WITH_EXPLORATION_REGRESSION");
      expect(row?.exploration_contract, contract.widget_type).toBe(contract.contract);
      expect(row?.reversible_manipulation, contract.widget_type).toBe(contract.reversible_manipulation);
      expect(row?.authored_domain, contract.widget_type).toBe(contract.authored_domain);
      expect(row?.evidence_test, contract.widget_type).toBe("src/components/session248.engineReversiblePlay.test.tsx");
    }
    expect(audit.filter((row) => row.exploration_decision === "REMEDIATE_ENGINE_PLAY")).toEqual([]);
  });

  it("does not misclassify ordered disclosure as reversible answer play", () => {
    const row = contracts.find((entry) => entry.widget_type === "steppedReveal");
    expect(row).toMatchObject({
      contract: "ORDERED_DISCLOSURE_NOT_GRADED_PLAY",
      reversible_manipulation: "NOT_APPLICABLE",
      authored_domain: "ORDERED_DISCLOSURE_DOMAIN",
    });
  });

  it("keeps the two experimental contracts explicitly outside the authored corpus", () => {
    const lessonText = walkJson(resolve(root, "content/courses"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(lessonText).not.toContain('"type": "radicalCheck"');
    expect(lessonText).not.toContain('"type": "toggleExplore"');
    for (const type of ["radicalCheck", "toggleExplore"]) {
      const row = audit.find((candidate) => candidate.widget_type === type);
      expect(row?.authored_uses, type).toBe("0");
      expect(row?.authored_domain, type).toBe("MULTI_STATE_DOMAIN_UNUSED");
    }
  });
});
