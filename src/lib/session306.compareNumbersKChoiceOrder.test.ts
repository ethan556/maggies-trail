import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "compare-numbers-k", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const contracts = [
  ["kcm-01-01", "k1", null, "fe70024383b64b4ac7e8aa6f3fb429bff6f9797551afda5380cd9f5cccd8f91a", "64217bde932d38ed00bc13ec33ca46b9642856a9827359ceb7d2c3c872f73bae"],
  ["kcm-01-01", "k2", null, "21c6bdd20408b2329c84b5232abc6771a92155266effef8e81f0c7f89b0d8d88", "6378b04d5853ee3fbe78fd688b51c62bf2c7ced9511760e6a943f95e4c95b5bf"],
  ["kcm-01-01", "ch1", null, "44d033c34c024f8d673659eee65c8991bb865ba4157213eea6ad6ebc983def25", "88fd227fb8d6672fccee860a8b457d1db728407f891ad18ff7c61a7b2ace1664"],
  ["kcm-01-02", "k1", null, "13a3236126144993dd6ea258ac82d44885e9f93a35f5c69958f3427fb2186dd4", "e56b038b464a380e5ded293460713115e53678022a8d49a3944c0bae09c52c26"],
  ["kcm-01-02", "k2", null, "d12d25b6d0a1df29586f08de889d39b6d68d941a49dc0365d46181737978df62", "8adc4764beaccb0fb6b3635c1201d523786248126c4d9587d228ab51f2c4f299"],
  ["kcm-01-02", "ch1", null, "b4eb6404f1d195202b351aac4b12291da082b731f290203ebf4029aea0c55fc8", "8ece6010e892aa14f7083ceaed70c6d851fb16a28c35b0dee7ab93ca88bd0eb8"],
  // Re-pinned: signed S320-IMPL-kcm-01-03 (balloons/kites dedup rewrite) (S326-R1 reconcile).
  ["kcm-01-03", "k1", null, "7a2d838d72c508dfe6ce19660dc05ac1ff72b378a94a6d4d03fedf281e437c85", "b23eab1eacdacf21d48924fc36e56228bb7d9f4720aa70f953f994cfe96b7172"],
  ["kcm-01-03", "k2", null, "e52844af9947d39a514df88b3402f267d53870baad08898969b2cfa80bc95566", "43153c854a759a61a6938f40682e14f6ea7708ff21a6bc1ef5d3709e8920e828"],
  // Re-pinned: signed S322-kcm-01-03 (stale stars/hearts stub-template fix) (S326-R1 reconcile).
  ["kcm-01-03", "ch1", null, "ff0f4b4a0b750649c0bc4ffd40ad7635782d85e1bbddcaf24a8b3f9b96594f21", "10c3aa0cab2e6935b25a9fb57bece8e82c20c7bbb4c1698c220b75343d57d0f3"],
  ["kcm-01-04", "k1", null, "8b1f82ba0355727b155ee5a4be3ffb4f4e5da31818cba9e1ae8800fb4b6b2cfb", "9df49f0309e7e1b44ccf91f597031238fdec18fdac676382981a09de0647e997"],
  // Re-pinned: signed S320-IMPL-kcm-01-04 (smaller-group dedup rewrite) (S326-R1 reconcile).
  ["kcm-01-04", "k3", null, "5259b4859e5eb30e6c91f264746cc6dbd5a4d0442c7416b4b5e7621353c0a5dc", "468f731b5cfc68c70962ba2ad19795b4aedc47060128ac2a8d3624dd07589043"],
  // Re-pinned: signed S322-kcm-01-04 (stale stars/hearts stub-template fix) (S326-R1 reconcile).
  // Options hash further re-pinned per reports/closure/S327_FIX_CH2.md #17 (CHOICE-0033,
  // length-prose-vs-prose): distractors lengthened so the correct "8 is the larger group, not the
  // smaller one" no longer stood alone as the only long/contrastive option; correct answer,
  // prompt, and figure unchanged. Independently re-verified clean against mcq-leakage.mts.
  ["kcm-01-04", "ch1", null, "b198fe4e5e36ca5bda4ba4d6c17114671bdae6a412de83f712b8e6c303a5e0b3", "8322d1602190f4e3dcdcd1f5e60fed86ad4936773280bdfffe28e11d06de622c"],
  ["kcm-02-01", "k1", null, "86161e42b08e71872fe868530bb6326804e133035adf06777a08d25439394c8a", "8ece6010e892aa14f7083ceaed70c6d851fb16a28c35b0dee7ab93ca88bd0eb8"],
  ["kcm-02-01", "k2", null, "203df75b87735e870fa7be9e4fd60c3e4abc3d30c168ab4b13a7f5d195b8c6fa", "a6faf3f3200b82b21a0073bf321a8c00d84facde0c3704e4c5f21a921f03f201"],
  // Re-pinned: signed S322-kcm-02-01 (stale stars/hearts stub-template fix) (S326-R1 reconcile).
  ["kcm-02-01", "ch1", null, "0cce5b75e419e126aab325798bc111d048560af910bec916a404b7db1d61180b", "36f87f29b65fa03184a2b4a899e449875c11e83215f74f5674932f63290a4db0"],
  // Re-pinned: signed S320-IMPL-kcm-02-02 + s326-R1-kcm-02-02 label-parallel trim (S326-R1 reconcile).
  ["kcm-02-02", "k1", null, "0e190b57dcef48bc42d2c327b5785338690589d7e7d3f64a6e1ae55c4331f818", "2cd04c79035b7c0b7bd775749af0a9fee7562451a290b5e5f177fb20c2e31e30"],
  // Re-pinned: signed S320-IMPL-kcm-02-02 (leaves/acorns dedup rewrite) (S326-R1 reconcile).
  ["kcm-02-02", "k2", null, "a663cf150d84c56e6012efb1ce295a08ce535116ad634aaf53a8dcd31c419fe7", "79db4c5052c425ce5d29813cf4893f056f29896653e9fd4cebdd5a8459829df0"],
  // Re-pinned: signed S322-kcm-02-02 (stale stars/hearts stub-template fix) (S326-R1 reconcile).
  ["kcm-02-02", "ch1", null, "9b043eed02e3609b91f2907b7071aae675af0a4c5078115071166fc95e1c4b83", "ca5f743281908f82c6c58ddd7660148f5e9f2cdac27aeba2bded75f4a01f5d4a"],
  ["kcm-02-03", "k1", null, "458fa7f09bc9370521e72ad093cc6420e2a6f492aaf952a010c5d1e06672a7fc", "b97201e0ea7d63e098160c87c8b03a2fcf1f552ea4c45110168521ef1bff7b9e"],
  // Re-pinned: signed S320-IMPL-kcm-02-03 (fish/crabs dedup rewrite) (S326-R1 reconcile).
  ["kcm-02-03", "k2", null, "924844fc5b6997005e6de2a7dcacf878a048b128aea9d3f0a238da665802991d", "988646cb02d28b39cd33ef617c9f93ba02bafbc1212f61ece126033cc502dea5"],
  ["kcm-02-03", "ch1", null, "1c9b281c6b3b0f40a3e4b09385c38e2659d8b031491c7cea4f16c274f8f21510", "66e21b668fba212ee9ca0afd83853f2e8b89f7e05e4d1bd09821089bf093777f"],
  ["kcm-02-04", "k1", null, "8cb902d4b7fc4fa13e6cd43696fe6757ecb0bae6914f5f5778ce6c1c2867d635", "fe59bf59329fa76dd3f913f05360a8a6cae0ec18fad5cf9f78979f2ba1e1f1a7"],
  ["kcm-02-04", "k2", null, "bbf569239a30922869918c041c2afc2e0b685f93ec39c66c6432872a559fe8c8", "3d64d883d937d3ffd5936dbb1ac9657008d22948b8ff04766f944c4725f40ef9"],
  ["kcm-02-04", "ch1", null, "7d6ff5b812269bfe6d43fd9367b8c79fac9b1e9cc76f75410e3cc61575f1697d", "dcaa71ac5332efb49696580253df3b50c3b6895bc57ea392ecb0b059ba091742"],
  ["kcm-03-01", "k2", null, "b7e52eecfc1b82afa597b58c2117c2f20348eaa8480852720005a73683e77919", "2df8a8dddcf27c33d419cf6128c83326ce344183b9a43b2a8021fcaa7a8dcda5"],
  ["kcm-03-01", "k3", null, "8cb902d4b7fc4fa13e6cd43696fe6757ecb0bae6914f5f5778ce6c1c2867d635", "892fe21190b1753205459118c6464012410cf3026fcebd25787d73729e3fe225"],
  ["kcm-03-01", "ch1", null, "459650ddd63feddae60ede914460d3e10e9a67a3424b7c4de1595633f5dd0334", "e01f4ab680e7699a06a4a4ade6b8adf878ab9d2a420c695f91db33c807c727a1"],
  ["kcm-03-02", "k1", null, "a77f301964dca5087ab5f6a09b2b8f0d8ab32f405028886b37aaa7a99e18a363", "c0a2af77b5b839639227988600dc7b4178ce0ec829a1e955053878479286572b"],
  ["kcm-03-02", "k2", null, "85af6342f878ddb3c50edf1815896f69c253a73c712203cc3cda0a778c5200e4", "1539b647acea89755b87b2e35f910eada6911f392aa8d27ae8c76e94cb94e646"],
  // Re-pinned: signed S320-IMPL-kcm-03-02 residual (acorns/pinecones rewrite) (S326-R1 reconcile).
  ["kcm-03-02", "ch1", null, "e946d23f30c6a20160e00726c49e310d156455acbb346cb0095df8886d1a6578", "0c75b1bbe9b702cbf2d261fd76baf89fd06c4c14e56e07d23df7c669e359e98f"],
  ["kcm-03-03", "k2", null, "6fd8eba0908b6d5af0c62b08bbcd65c2480664c6fcf8883bab4781a5054412d6", "b352543e25cdf42b6a622038c0204777eb98464443dad0d3da6d14c12f0c03bb"],
  ["kcm-03-03", "ch1", null, "e96ea4a49adbf65624b19f15e22acdd743aa9b9e7339a5d0e25b47ea1b79ebf8", "d8bbbcce4685b5f1994208f6416c3f7e5f82c7956674159788f3d3aec6c34e1b"],
  ["kcm-03-04", "k1", null, "ea2fe48dd5a1d9fd9811a0c08cf42b0c50ba65e707c4848097a656da2103eec4", "5001941c3fa06b1ce854dbd7fab93da7d634fc81ff16f0a391a8903b800e559f"],
  ["kcm-03-04", "ch1", null, "f46cb91f7305c193eab3553480804bf77878ae71a5fdbd1a2b1b07d25d5801e2", "82d4eccfd567c397418bf9b8c1c8900d13661a0461c34207d6e11ce42aad5d7c"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S306 Compare Numbers Kindergarten choice-order repair", () => {
  it("removes the course-wide fixed-answer position while retaining every semantic and evaluator contract", () => {
    expect(contracts).toHaveLength(34);
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
      for (const option of widget.options)
        expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });

    expect(correctIndices.filter((index) => index === 1)).toHaveLength(12);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(11);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(11);
  });

  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(12);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps
      .filter((step) => step.widget?.type === "mcq")
      .map((step) => `${lesson.id}/${step.id}`));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId]) => `${lessonId}/${stepId}`));
  });
});
