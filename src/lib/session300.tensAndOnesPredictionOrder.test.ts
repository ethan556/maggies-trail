import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson, Prediction } from "./schema";

const directory = join(process.cwd(), "content", "courses", "tens-and-ones", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const contracts = [
  ["tno-01-01", "i1", ["maya", "leo", "same"], "same", "They have the same amount", "f5302a42cbedcb42d821290964998ba7f0d872dd2bb33a56e797694be98416b2", "f8fcee644edcb8552e1a452a2e982637c8f7dff7e77060f75a58f607691f8a2f"],
  ["tno-01-02", "i2", ["four", "six", "either"], "four", "The 4", "a238dcb0fdd7ac31c93b36ebb3b75a01be1c0e72407e57119387d4efccdbf968", "27cb061028dc9cbb2b4d2309d00c8a2e72bda3b5fb25bf74e1cf9611edfef924"],
  ["tno-01-03", "i1", ["split", "cubes", "rods"], "split", "The cubes are more pieces, but the rods are worth more", "13f4c25be288409059d5abecb7ed72474a9ce3fb0742b8a30ac3b9657622f5b1", "09cfe4cd8ec25cc8a65b8432468a175fe78774b7f533aad2f99b2e81ea3ef111"],
  ["tno-02-01", "i1", ["sixty", "six", "swap"], "sixty", "60 + 3", "a3e9ab257e1e880af3626e8f025324e0b2a1db8972678aa8a42429baac84652e", "b88b6645b5d2e0f18e5a7860219b7a5ff41a997c0ff90bb3584209a6489e8b26"],
  ["tno-02-02", "i1", ["two", "three", "depends"], "two", "Two digits", "38d9765ab8887380146f8ed8d8f45eda021d37ef3d00fe2f09d593a7d2b1c6e0", "2a83e784448ab735edecd8ccabff918d9cb88b5f41528a7da47a6f2f7529d0a2"],
  ["tno-02-03", "i1", ["five", "two", "equal"], "five", "The 5", "832c5c307777035a33321eda79087a94a428c89d10d6ccf2801e660685a3f25f", "65bfd2dcdfcdc4726fa91665f17e2d878c9823b1b7c953f132c1a64b7a5bb1ae"],
  ["tno-03-01", "i1", ["tens", "both", "ones"], "tens", "Tens digit changes, ones stays: 44", "b833700b1d4cba825ca60152317f77001d6f363b17723fd04c75ce9ce38bd085", "1104027f634c1bf8cf3302cd12e52cfcfcfc873b9540087fb9f56146e288b51e"],
  ["tno-03-02", "i1", ["stays", "grows", "becomes"], "stays", "It stays 0", "6d4827a558862d6e9e26eb27a78103f3ff2b0b45e36a737d7afd6d519b156126", "77f01910bb93b34fae5a5f826a3f68e9f8eb629a8e7318c7b638cc445ae9bc97"],
  ["tno-03-03", "i1", ["stays", "shrinks", "gone"], "stays", "It stays 5", "b69d2e9e3a61103947796d10d10af8afb0c3394c2e5c07b1a00393b2144ca002", "3b601ecc80854f5b8fb66298a3c47b303226bbd628e77c821a97fb1e8383cb2a"],
  ["tno-04-01", "i1a", ["right", "left", "same"], "right", "Right", "6d1d61ab3600fb204a746d0e8981f89de1e944dbe3a71671b7651d9ea3fad197", "32929a6d54d78979c5d172f12e854fc94d2492b1c7c9fe6896dc614bfc1371dd"],
  ["tno-04-02", "i1a", ["right", "left", "same"], "right", "To the right", "4a451de31bf914d498648350927445ce222bf4de5101d5469ffb37f67b0ea6e2", "efc7336842d57612cd6817e1ff5ec1460131c9df81ef96f648c4631017d8086e"],
  ["tno-04-03", "i1a", ["right", "left", "same"], "right", "To the right of 48", "7051420cca7a2d2c58b0f5482c0139ac1e3f2d78be858da0f4514a9f6fe01701", "f4037cfcb1a3f884085049a0b58c73e1be935fc2747e286241ca2f73a62e1949"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S300 Tens and Ones prediction-order repair", () => {
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

  it("keeps all twelve Tens and Ones lessons schema-valid", () => {
    expect(lessons).toHaveLength(12);
    expect(lessons.every((lesson) => lesson.steps.some((step) => step.predict))).toBe(true);
  });
});
