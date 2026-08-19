import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson, Prediction } from "./schema";

const directory = join(process.cwd(), "content", "courses", "place-value-1000", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const contracts = [
  ["pv1000-01-01", "i1", ["h", "t", "o"], "h", "Hundreds", "e682853d0747a6bee795f500e08356857ce8c1cccb29fa6c3290353cfbc89b7d", "e9ec08d9ade82dc93a5854f9cdd74f34386f967b0ceee4ae282ce024d48788f4"],
  ["pv1000-01-02", "i1", ["maya", "leo", "same"], "same", "They have the same amount", "f5302a42cbedcb42d821290964998ba7f0d872dd2bb33a56e797694be98416b2", "58813285d4ce28efb02ec894ee85542d4af6ee92f0f09402e5f6defcb1f8aaac"],
  ["pv1000-01-03", "i1", ["six", "four", "one"], "six", "The 6", "ee2830186844e6b9784d2cb0fcddfa3102e3726b65734a95240cee146d3bad9b", "880fccb6fa978a70cc2bbd2314991f86e24bf53de5f0d44fab97df19a1d3ac0f"],
  ["pv1000-02-01", "i1", ["tens", "ones", "hundreds"], "tens", "The tens digit", "888f4ac4527ab448bc15546ac286f4e2a22fb67dfd98e98b7d5fd3bc879e677a", "872dd3eec4e5039d8f95417237038f8b1f2fb151617ef500c5d0e682221744cb"],
  ["pv1000-02-02", "i1", ["five", "zero", "three"], "five", "5", "09768d3545f80246d3dc3d47d7e509ba0695093919c5f9a0e9183c0bdcdf1100", "5c16a05cdbdde007675234c35e3c6d1e1d1b40ec72ef201d640c17237aea4c07"],
  ["pv1000-02-03", "i1", ["thirty", "thirteen", "three"], "thirty", "30 away", "0279461873039d2960453f5442a4081925369fa403779c789565aa259b4add4d", "eb73dde822f206759b07e3be7498e912977d99ee999d687e0d9674c845a3b092"],
  ["pv1000-03-01", "i1", ["zero", "skip", "one"], "zero", "Sit at 0 — but the spot still exists", "c3e73c70493dc4ae125c1bc8d729b26a43dc6ab2118604cb43a672a5b4193a4f", "50eba274eeebf79df1a3af59fcbe1dfe90de5d23aca741f66743995a28026582"],
  ["pv1000-03-02", "i1a", ["hundreds", "tens", "ones"], "hundreds", "Hundreds", "046c7d328609f5453ef721825488b1c0a61726fb43dd7d6412b5bf910e09359e", "96adfbe34ea84fbd1999bd0ce77a7da97d6fe4d8a310fcc89f5647d6ccc57363"],
  ["pv1000-03-03", "i2a", ["hundreds", "tens", "ones"], "hundreds", "Hundreds", "046c7d328609f5453ef721825488b1c0a61726fb43dd7d6412b5bf910e09359e", "fb7c3baf1da16b7ae6709d2594a1307aaecade652f74837f75ebc4b3b20e4dd5"],
  ["pv1000-04-01", "i1", ["no", "ones", "tens"], "no", "No — every pile stays under 10", "651a0a9241557a3512f70973393f67b210abc5608277cdbf4a8bba4764aeb7a7", "b2d1d4ed3ecab5b40b9db67c038c9f9431a601a12b90550595051c6a2e6af044"],
  ["pv1000-04-02", "i1", ["no", "ones", "tens"], "no", "No — every top digit is big enough", "38f877c06908a58e82d8c0ebef28a4331e0f38db01901e28381b4eebfcd166a0", "3edef6423b048a1da350bf4e69c179022e6c201be16195e817c864e55c83a89e"],
  ["pv1000-04-03", "i1", ["more", "less", "cant"], "more", "More than 324", "83c7bc307f793f795c9cf333ddccf54b16463e946cff21f46286f7e0a71a2efc", "6c0cb89a33ad82a4f58029d47c1a4934be0017fbe7dfed6e8036611f245f37e3"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S301 Place Value to 1,000 prediction-order repair", () => {
  it("distributes outcome choices while retaining every option, outcome, and reveal contract", () => {
    expect(contracts).toHaveLength(12);
    const outcomeIndices = contracts.map(([lessonId, stepId, canonicalIds, outcomeId, outcomeLabel, optionsHash, revealHash], index) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const prediction = Prediction.parse(step?.predict);
      expect(prediction.options.map((option) => option.id).sort(), `${lessonId}/${stepId}`).toEqual([...canonicalIds].sort());
      expect(prediction.outcomeId, `${lessonId}/${stepId}`).toBe(outcomeId);
      expect(hash(JSON.stringify(prediction.options.map(({ id, label }) => ({ id, label })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(hash(prediction.reveal), `${lessonId}/${stepId} reveal`).toBe(revealHash);
      expect(prediction.options.find((option) => option.id === prediction.outcomeId)?.label, `${lessonId}/${stepId} outcome lookup`).toBe(outcomeLabel);
      const outcomeIndex = prediction.options.findIndex((option) => option.id === prediction.outcomeId);
      expect(outcomeIndex, `${lessonId}/${stepId}`).toBe(index % 2 + 1);
      return outcomeIndex;
    });

    expect(outcomeIndices.filter((index) => index === 1)).toHaveLength(6);
    expect(outcomeIndices.filter((index) => index === 2)).toHaveLength(6);
  });

  it("keeps all twelve Place Value to 1,000 lessons schema-valid", () => {
    expect(lessons).toHaveLength(12);
    expect(lessons.every((lesson) => lesson.steps.some((step) => step.predict))).toBe(true);
  });
});
