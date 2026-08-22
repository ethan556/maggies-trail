import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "add-subtract-20", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const contracts = [
  ["as-01-01", "k3", null, ["a", "b", "c"], "e123819ab119ddced4cf692f868855174bd189e84e273aae4d826731c71e247f", "87529b47c8492a711b7e310c4d7e44aaa7cad8c0f3158afe95fea440011b4828"],
  ["as-01-03", "k2", null, ["a", "b", "c"], "bba38ea8a81cb6fb90ecabd66c5b5b2762af5863e15a8fa10c9b738635d1a798", "0eeee77c54867b2df94ba3b51bdeb1e3fb48a5c187e4b87c300a69d782bdf765"],
  ["as-02-01", "k3", null, ["a", "b", "c"], "1a584f4230758607b96c209a286688026effb73cff62876dfcfff414a58b102e", "3c9c98442f15c3103e884d8519209c10d5a5ab0c1519404df682c4355f9ad1e8"],
  ["as-02-02", "k3", null, ["a", "b", "c"], "ddd1c1a61a69d550b71aee4e92b29ba9e04d7321b80b40d052b9e9bb4f253e5f", "93075fa6fb42a5b7fc318d6ed9bfc812c01abde2a906e2741fbc56daa798e86e"],
  ["as-02-04", "k3", null, ["a", "b", "c"], "3c22b446e1c70bd297e8240a2338b682d2f8629018f370dc34ab5508619b7cd8", "0c74f5ab19d2debf6f8df8fce0d213391b955ae1f68bc1c7b6f305ccab9a7f77"],
  ["as-03-01", "k3", null, ["a", "b", "c"], "e98f873206e7e91f4d53b67d1efceef8ba553e674e26b8d45cf16c957927ad44", "7415bab7814c1297901bda2ee2fbab7a26b891fed5409bf4d488929cc07004f7"],
  ["as-03-02", "k3", null, ["a", "b", "c"], "1dd5d22209c0268441a39ddbbbe0e0ecd78eea3c93b89a942429f1dfba9da7bb", "358d2597335cfab2060f46f2b2075dae3186750b5ad70f8c15002f5a3b23d8ab"],
  ["as-03-03", "k3", null, ["a", "b", "c"], "fe147e991d7a9d1aed29410696162d43f28f5aa1ad3e77d8a7adc969090e69d5", "d8984b2e842136bc6ff90853eb26fc31fcbcebf7adb378b1503ab1168790d24b"],
  ["as-03-04", "k3", null, ["a", "b", "c"], "52b4518a90cbcb82d1050112a332229e286dd33000d6284967894af486582214", "610774e2653d253a8cc81bc977bbe601f7ad7b327a6cd63e8aa6ff6ad2083895"],
  ["as-04-01", "k3", null, ["a", "b", "c"], "0513ec25ec3e1ffdb0b1ea62c4505b7d5ea2863f2099a548b4bec91b820cafb8", "13db7b885d1c6a49f7c2f9da17178c5baab735675f922bdf3adef7648ccab28b"],
  ["as-04-01", "ch1", null, ["a", "b", "c"], "6ac8ce38af838b788ffa333d76d3e629d07562da6d9b702bef3d423e1de2b716", "d861dd5bd9cc94e6ca0d601b05e824cfa494f1e004d9df5064af0b66eddd0a4f"],
  ["as-04-02", "k1", null, ["a", "b"], "602663123fed5708c2c8d2d3ca03f677e928db6f8858fd0f4f5538f3c2255e6f", "78db66852e594d26d466fce3065cf3e736032fae21e45e4c03e5c332fffe67b2"],
  ["as-04-02", "k2", null, ["a", "b"], "ee7f8d2e7b56cdc310dba54d3b8dea7d558e24a963b61972de794a326e70809e", "5bfcb12ec6cc732856cb79d39bf0113d7e29d3fedba455de4e5d0603fa46e489"],
  ["as-05-01", "k1", null, ["a", "b", "c"], "74d66935042534452e721dc241e50bfc98f15dac933cdf7465ad681de9b2606f", "d28bd670a54e8b13555d7f77ff39cc526d84d5258c02f942db89d440efcfeca0"],
  ["as-05-01", "k3", null, ["a", "b", "c"], "db21301b0a8f4b1ee0a29a238e02f7bcf4208572014193191a0a088ff68ca7ed", "11addd7d517d0489c1180b316633fc22172f0048e09e8a3038880dbc9b7f3fa0"],
  ["as-05-02", "k3", null, ["a", "b", "c"], "6e1945a471e32cc6ad0377bdeb83c4d12b12eb739000467e4b7138197e2b7bb0", "454c492d9e3dab8fd3e6178a367d00d5e91ec5add913666bf0e2589c68f9d0eb"],
  ["as-05-03", "k3", null, ["a", "b", "c"], "83b94722ed6b3ea426c7e7906433712d965e49750b5045eab8fb6c6894fdff45", "22b897022b9a9beff90b179eabac53e87e177715e01322401f015f5ec291953e"],
] as const;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S311 Grade 1 Addition and Subtraction choice-order repair", () => {
  it("removes every fixed first-answer position while retaining semantic and evaluator contracts", () => {
    expect(contracts).toHaveLength(17);
    let threeOptionOrdinal = 0;
    const threeOptionCorrectIndices: number[] = [];
    for (const [lessonId, stepId, figure, canonicalIds, promptHash, optionsHash] of contracts) {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(step?.figure ?? null, `${lessonId}/${stepId} figure`).toBe(figure);
      expect(hash(widget.prompt), `${lessonId}/${stepId} prompt`).toBe(promptHash);
      expect(hash(JSON.stringify(widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${stepId} IDs`).toEqual([...canonicalIds]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId} correct ID`).toEqual(["a"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBeGreaterThan(0);
      if (canonicalIds.length === 2) expect(correctIndex, `${lessonId}/${stepId}`).toBe(1);
      else {
        expect(correctIndex, `${lessonId}/${stepId}`).toBe(threeOptionOrdinal % 2 + 1);
        threeOptionCorrectIndices.push(correctIndex);
        threeOptionOrdinal += 1;
      }
    }
    expect(threeOptionOrdinal).toBe(15);
    expect(threeOptionCorrectIndices.filter((index) => index === 1)).toHaveLength(8);
    expect(threeOptionCorrectIndices.filter((index) => index === 2)).toHaveLength(7);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(17);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => {
      if (step.widget?.type !== "mcq") return [];
      return [`${lesson.id}/${step.id}:${step.widget.options.map((option) => option.id).sort().join(",")}`];
    }));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId, , ids]) => `${lessonId}/${stepId}:${[...ids].sort().join(",")}`));
  });
});
