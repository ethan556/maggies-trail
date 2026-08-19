import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "teen-numbers-k", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const contracts = [
  ["knb-01-01", "k2", null, "09785b6f51b660ea864bdd4c24a5268d28e276481dd7ace9c93dfd1b7e3d5a81", "411f8ffcf83521a9e440e8f7b4985834039bac896313ab4e1bd38d1a10480c35"],
  ["knb-01-01", "ch1", null, "7a5b0a497f019a73526fb338c63617156f14104efe308a00d61349bb73ef4f39", "d17b2d78f350ba0efdb2f264fc10625593d1b1713d67db0013c1eb97d1d2f83f"],
  ["knb-01-02", "k2", null, "3f31481939a1cfdebaa01de737dba6034318300511e288d86151f96c334f9437", "cb7103a964c54d4e6b2d90c20df96edf051900447001a24c45365ef4569a2b89"],
  ["knb-01-02", "ch1", null, "7ec4c91c2aad20611e6776c38644bdb437e5a5626d9655d1c2140e4219638a00", "ca10b91480d986fbfae9147af74ce6371014dc863f9c5e18395e1744c85e2d9f"],
  ["knb-01-03", "k2", null, "9f3588e32cd65aed2b3a8a26d6253ed140b299ee0d2c498f91163e85e9bd0b45", "91ad1f34226cc2c193a2104ee80ff57e5d7a10eae8832a7e2446def5c3039d8a"],
  ["knb-01-04", "k1", null, "7a5b0a497f019a73526fb338c63617156f14104efe308a00d61349bb73ef4f39", "d17b2d78f350ba0efdb2f264fc10625593d1b1713d67db0013c1eb97d1d2f83f"],
  ["knb-01-04", "k2", null, "09785b6f51b660ea864bdd4c24a5268d28e276481dd7ace9c93dfd1b7e3d5a81", "411f8ffcf83521a9e440e8f7b4985834039bac896313ab4e1bd38d1a10480c35"],
  ["knb-02-01", "k2", null, "7ec4c91c2aad20611e6776c38644bdb437e5a5626d9655d1c2140e4219638a00", "ca10b91480d986fbfae9147af74ce6371014dc863f9c5e18395e1744c85e2d9f"],
  ["knb-02-01", "ch1", null, "bbf569239a30922869918c041c2afc2e0b685f93ec39c66c6432872a559fe8c8", "9f3cc8e778e273d2b7a191bd516afe8df7638a40e3e93b8d895a4a404c97d093"],
  ["knb-02-02", "k2", null, "cc94fe3098eaea08bc73a04be2f347b303d1aa1cfc4996221fdd0c16f3534b98", "e83bc0fadc793227b953af4a699bab657c87131a513484d2337ac8d365baea83"],
  ["knb-02-02", "ch1", null, "7797c2152d8603541c87e93b9e596b2cdcf17a08bda1a475126593c61f66badb", "e0999411c7e7c1a97bcc1f9d19a955d9f560e4b6ed26f82d869ba915c8b1f3a9"],
  ["knb-02-03", "k1", null, "7797c2152d8603541c87e93b9e596b2cdcf17a08bda1a475126593c61f66badb", "e0999411c7e7c1a97bcc1f9d19a955d9f560e4b6ed26f82d869ba915c8b1f3a9"],
  ["knb-02-03", "k2", null, "d824ada3a9de7646895d8e85dc966ef2da263cac4ae47ada951124bdce8f981b", "c2592999e181b5d3a936cd5517c61925f69095b3d82f679c5d64e68196ac3dfb"],
  ["knb-02-03", "ch1", null, "6b2080df40f0ec5919377936e4914389932d3c7d51643c00fb22f026b5964e17", "f8ad8499dfca49c53b31a6d1a1949b71eeff9bbe681511c7e02f10ecafaf1cf8"],
  ["knb-02-04", "k1", null, "03437c4a21110636be82a1eb5f980147f966f403575901be6e655e8ece244357", "2049252d668503a222bab6e9f9bbb62d74e3646724e918a293a57072a6874684"],
  ["knb-02-04", "k2", null, "06a024e126c58078201ac3dfc696f310600b4bc2be2fc312a4b4cb5d00615535", "bf9fed320804274ad19c00a0f7a9a49ea2d7bc8505741de316aff4d4a0903178"],
  ["knb-02-04", "ch1", null, "31b5e1795eaea745546c2d9667e53e59ddaf424e8a7259e7b531df32fa8f7a20", "8373da781715bfc15a9d82a0ee7bfe431f4c6729850ad3a6d057c025e0eb1e8f"],
  ["knb-03-01", "k1", null, "d824ada3a9de7646895d8e85dc966ef2da263cac4ae47ada951124bdce8f981b", "c2592999e181b5d3a936cd5517c61925f69095b3d82f679c5d64e68196ac3dfb"],
  ["knb-03-01", "k2", null, "41e67a390528fd4dae012f50080d565c876c5aeeef2e741d04e4ba89a1b067f7", "b602b5ff83bfbc7b0a0a210f31dea4a415123e9d84578965ed79298a2e1ea6c2"],
  ["knb-03-01", "ch1", null, "5c216ec842d4ff1792709868068ba1b762232ed42a957f9a1dd8d67fe48095f8", "568b35b476802cdfc0e9e033a4243e52a11f83f80029182cba887eded4412b29"],
  ["knb-03-02", "ch1", null, "bbf569239a30922869918c041c2afc2e0b685f93ec39c66c6432872a559fe8c8", "9f3cc8e778e273d2b7a191bd516afe8df7638a40e3e93b8d895a4a404c97d093"],
  ["knb-03-03", "k1", null, "5c216ec842d4ff1792709868068ba1b762232ed42a957f9a1dd8d67fe48095f8", "568b35b476802cdfc0e9e033a4243e52a11f83f80029182cba887eded4412b29"],
  ["knb-03-03", "k2", null, "9f3588e32cd65aed2b3a8a26d6253ed140b299ee0d2c498f91163e85e9bd0b45", "91ad1f34226cc2c193a2104ee80ff57e5d7a10eae8832a7e2446def5c3039d8a"],
  ["knb-03-04", "k1", null, "e9d6b32b5b2b7132580e9499405d924b8f4ada1d9b748a8ec1ef4a73e53b98c1", "478d894c077e5682b857dfaf51116aae3d27a63f3c35bf655f73452d572f0230"],
  ["knb-03-04", "k2", null, "06a024e126c58078201ac3dfc696f310600b4bc2be2fc312a4b4cb5d00615535", "e5cf3747a975c875991c1ef18afbd7ab57d5134fe57f1a1ae5fb67484254e8ae"],
  ["knb-03-04", "ch1", null, "7797c2152d8603541c87e93b9e596b2cdcf17a08bda1a475126593c61f66badb", "e0999411c7e7c1a97bcc1f9d19a955d9f560e4b6ed26f82d869ba915c8b1f3a9"],
] as const;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S307 Teen Numbers Kindergarten choice-order repair", () => {
  it("removes the course-wide fixed-answer position while retaining every semantic and evaluator contract", () => {
    expect(contracts).toHaveLength(26);
    const correctIndices = contracts.map(([lessonId, stepId, figure, promptHash, optionsHash], index) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(step?.figure ?? null, `${lessonId}/${stepId} figure`).toBe(figure);
      expect(hash(widget.prompt), `${lessonId}/${stepId} prompt`).toBe(promptHash);
      expect(hash(JSON.stringify(widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${stepId} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId} correct ID`).toEqual(["o0"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(9);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(9);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(8);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(12);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => `${lesson.id}/${step.id}`));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId]) => `${lessonId}/${stepId}`));
  });
});
