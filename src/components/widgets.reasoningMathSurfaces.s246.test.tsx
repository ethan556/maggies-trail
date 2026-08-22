import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/components/widgets.tsx"), "utf8");

describe("S246 reasoning-lab mathematical text surfaces", () => {
  it("renders derived stage bodies through MathProse instead of exposing caret notation", () => {
    expect(source).toContain(
      '<MathProse text={stageBody(true,stage,truth,tone,"",undefined)} includeArithmetic />'
    );
    expect(source).toContain(
      '<MathProse text={stageBody(open,stage,truth,tone,"Closed — activate to derive this state.",authored?.body)} includeArithmetic />'
    );
    expect(source.match(/<MathProse text=\{body\} includeArithmetic \/>/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("naturalizes mathematical stage text and selected choices in accessible announcements", () => {
    expect(source).toContain("accessibleMathText(stage.label)");
    expect(source).toContain("accessibleMathText(body)");
    expect(source).toContain("accessibleMathText(String(body))");
    expect(source).toContain(
      "accessibleMathText(spec.choices.find(choice=>choice.id===v.choiceId)?.label??v.choiceId)"
    );
  });

  it("keeps exact derived states in the same shared mathematical renderer", () => {
    expect(source.match(/Exact state: <MathProse text=\{String\(stage\.value\)\} includeArithmetic \/>/g)?.length)
      .toBeGreaterThanOrEqual(4);
  });
});
