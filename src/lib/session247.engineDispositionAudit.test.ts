import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) =>
    Object.fromEntries(line.split(",").map((value, index) => [headers[index], value]))
  );
};

describe("S247 engine disposition evidence", () => {
  it("closes the three reviewed multi-state engines only after a post-verdict regression exists", () => {
    const root = process.cwd();
    const audit = parseCsv(readFileSync(resolve(root, "PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv"), "utf8"));
    const reviewed = ["compassConstruct", "matrixTransform", "systemsExplore"];
    for (const type of reviewed) {
      const row = audit.find((candidate) => candidate.widget_type === type);
      expect(row, type).toBeDefined();
      expect(row?.exploration_decision, type).toBe("KEEP_WITH_EXPLORATION_REGRESSION");
      expect(row?.shared_correct_checkpoint, type).toBe("PASS");
      expect(row?.post_verdict_controls_unlocked, type).toBe("PASS");
      expect(row?.ungraded_state_recheck, type).toBe("PASS");
      expect(row?.authored_domain, type).toBe("MULTI_STATE_DOMAIN");
    }

    const regression = readFileSync(
      resolve(root, "src/components/session247.engineDispositionPostVerdict.test.tsx"),
      "utf8"
    );
    for (const type of reviewed) expect(regression, type).toContain(`specOf("${type}")`);
  });
});
