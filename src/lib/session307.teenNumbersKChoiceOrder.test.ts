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
  // Re-pinned: signed S320-IMPL-knb-01-04 dedup rewrite (S326-R1 reconcile).
  ["knb-01-04", "k1", null, "5b6094367c354dfeeb605013aff3ee1eaf01ad6e6d5b411d6623ffe996afa76d", "d4bcb0399787a794631763c715b3280b3b267d5a6cce3708e4f227f8f7075b7f"],
  // Re-pinned: signed S320-IMPL-knb-01-04 dedup rewrite (S326-R1 reconcile).
  ["knb-01-04", "k2", null, "bae51f77b5650b0b542ac853dad7b4dcb3b43baed97fe3482498ece8e7a8c347", "c585b1a20f48edc335ada54c224053203a72418320c0009922d0fcdf9974b73d"],
  // Re-pinned: signed S320-IMPL-knb-02-01 dedup rewrite (S326-R1 reconcile).
  ["knb-02-01", "k2", null, "0c07ef15bb8b300b31e0cbfa38449b8511fab03505dd48e5c5bfb92d3e46b868", "288ef5f12c972443ab3856a7e905a4b3b1650f5e8890e3c9fd203835677e0f53"],
  // Re-pinned: signed S320-IMPL-knb-02-01 dedup rewrite (S326-R1 reconcile).
  ["knb-02-01", "ch1", null, "3ade435f12246bef9a90e17b2202efb2d43001d07e43aea29e9f67a6827b8a64", "3c5b1df96ff95255d36d8c67faa7dcf9aa3604a2689083c18e1b57de6aca92bb"],
  ["knb-02-02", "k2", null, "cc94fe3098eaea08bc73a04be2f347b303d1aa1cfc4996221fdd0c16f3534b98", "e83bc0fadc793227b953af4a699bab657c87131a513484d2337ac8d365baea83"],
  ["knb-02-02", "ch1", null, "7797c2152d8603541c87e93b9e596b2cdcf17a08bda1a475126593c61f66badb", "e0999411c7e7c1a97bcc1f9d19a955d9f560e4b6ed26f82d869ba915c8b1f3a9"],
  // Re-pinned: signed S320-IMPL-knb-02-03 dedup rewrite (S326-R1 reconcile).
  ["knb-02-03", "k1", null, "13c471dfcaa0e9a2c789d314c0de8e166d04891256a1717aabe51089be618115", "bcef9bdea026b582a55dd636a769ef55618bdef8894501fa279cd9c145e67535"],
  ["knb-02-03", "k2", null, "d824ada3a9de7646895d8e85dc966ef2da263cac4ae47ada951124bdce8f981b", "c2592999e181b5d3a936cd5517c61925f69095b3d82f679c5d64e68196ac3dfb"],
  ["knb-02-03", "ch1", null, "6b2080df40f0ec5919377936e4914389932d3c7d51643c00fb22f026b5964e17", "f8ad8499dfca49c53b31a6d1a1949b71eeff9bbe681511c7e02f10ecafaf1cf8"],
  ["knb-02-04", "k1", null, "03437c4a21110636be82a1eb5f980147f966f403575901be6e655e8ece244357", "2049252d668503a222bab6e9f9bbb62d74e3646724e918a293a57072a6874684"],
  ["knb-02-04", "k2", null, "06a024e126c58078201ac3dfc696f310600b4bc2be2fc312a4b4cb5d00615535", "bf9fed320804274ad19c00a0f7a9a49ea2d7bc8505741de316aff4d4a0903178"],
  ["knb-02-04", "ch1", null, "31b5e1795eaea745546c2d9667e53e59ddaf424e8a7259e7b531df32fa8f7a20", "8373da781715bfc15a9d82a0ee7bfe431f4c6729850ad3a6d057c025e0eb1e8f"],
  // Re-pinned: signed S320-IMPL-knb-03-01 dedup rewrite (S326-R1 reconcile).
  ["knb-03-01", "k1", null, "acda003516360376565c3a78ed55ab45ae3a3bcff242ba75e03742222be1983e", "24b76951418b365fac08583a7e2978624713480bde30428df5765c52e35fc5f7"],
  ["knb-03-01", "k2", null, "41e67a390528fd4dae012f50080d565c876c5aeeef2e741d04e4ba89a1b067f7", "b602b5ff83bfbc7b0a0a210f31dea4a415123e9d84578965ed79298a2e1ea6c2"],
  // Re-pinned: signed S320-IMPL-knb-03-01 dedup rewrite (S326-R1 reconcile).
  ["knb-03-01", "ch1", null, "830f9937bcdc65ed44dfb95697d1440e0888f5b24a31779a7ccda84d1f5d4fac", "01ce950fd7a53e00a56948261ab11bb70dc9d932229f10fc57e747396196be9f"],
  // Re-pinned: signed S320-IMPL-knb-03-02 dedup rewrite (S326-R1 reconcile).
  ["knb-03-02", "ch1", null, "fcb760271504849f40a5633d9c0439826345008cf14891e722749c3c72476a33", "dce1877f7e1d38fee8946242b0c39c18f545022272b50078031b605c561b94f8"],
  // Re-pinned: signed S320-IMPL-knb-03-03 dedup rewrite (S326-R1 reconcile).
  ["knb-03-03", "k1", null, "f5431e2e57828ae252d1d7f3388629cbd5d9e65d57fea3cb12a27adbabe99ec5", "913efbf33f6b06bc03cfc80dad1115de3596b7ed7ea4cef07c5e05ecfa4107de"],
  // Re-pinned: signed S320-IMPL-knb-03-03 dedup rewrite (S326-R1 reconcile).
  ["knb-03-03", "k2", null, "707933cb50506a628fc19af7e8ebc9e9da945138ba07c5bfd64c8bc64ed5614f", "3e2228878d495eda582ef057eb8efcc1976b264470b13a16f725525dc2b6c7e4"],
  ["knb-03-04", "k1", null, "e9d6b32b5b2b7132580e9499405d924b8f4ada1d9b748a8ec1ef4a73e53b98c1", "478d894c077e5682b857dfaf51116aae3d27a63f3c35bf655f73452d572f0230"],
  ["knb-03-04", "k2", null, "06a024e126c58078201ac3dfc696f310600b4bc2be2fc312a4b4cb5d00615535", "e5cf3747a975c875991c1ef18afbd7ab57d5134fe57f1a1ae5fb67484254e8ae"],
  // Re-pinned: signed S320-IMPL-knb-03-04 dedup rewrite (S326-R1 reconcile).
  ["knb-03-04", "ch1", null, "8078e7aba331526d876dd2232da9183f648e0313d96086480a4218a6b323c0ae", "f006db04044c7c30222f444874021ac750b2a44ebb573406a7b6a8d878f8fb3b"],
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
