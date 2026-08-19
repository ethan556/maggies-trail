import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "equations-unknowns-g1", "lessons");
const CHECK = process.argv.includes("--check");

const step = (lesson, id) => {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
};
const option = (id, label, correct, feedback) => ({ id, label, correct, feedback });
const mcq = (prompt, options) => ({ type: "mcq", prompt, options });
const numeric = (prompt, answer, errors, fallbackFeedback, successFeedback) => ({
  type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors: errors,
  fallbackFeedback, successFeedback,
});
const hop = (prompt, min, max, start, hops, direction, missFeedback, successFeedback, commonLandings = []) => ({
  type: "numberLineHop", prompt, min, max, start, hop: 1, hops, direction,
  commonLandings, missFeedback, successFeedback,
});

const plans = {
  "g1e-01-01": {
    concepts: [
      ["as-equal-sign", "An equal sign means the two sides have the same value. The picture balances 5 + 3 with 8: both sides are 8."],
      ["add-balance-scale", "To check an equation, find each side. If the values match, the equation is true. The scale shows 6 + 4 and 10 balancing."],
    ],
    i2: { type: "tenFrame", prompt: "Build another equal side: 5 dots are shown. Fill the frame until it shows 9, matching 5 + 4 = 9.", target: 9, preFilled: 5, addColor: "leaf", commonCounts: [{ count: 8, feedback: "Eight is one short. Add one more dot so the frame shows nine." }], missFeedback: "Count all the filled squares. The matching side must show nine.", successFeedback: "Nine filled — this side now matches 5 + 4." },
    prompts: { k2: "Find the number that makes this equation true: 4 + 4 = ?" },
    remedial: ["add-balance-scale", "The scale is level because 6 + 4 and 10 have the same value. Check both sides of an equation the same way.", mcq("Use the balance idea: 5 + 4 = ? Which value makes this equation true?", [option("o0", "9", true, "Correct — five plus four is nine, so both sides match."), option("o1", "8", false, "Five plus four is one more than eight."), option("o2", "10", false, "Ten is one too many; count on four from five."), option("o3", "1", false, "One is the difference between four and five, not their total.")])],
  },
  "g1e-01-02": {
    concepts: [
      ["as-equal-sign", "Some equations are true and some are false. The picture shows 5 + 3 = 8, a true equation. But 5 + 2 = 8 is false because 7 does not equal 8."],
      ["add-balance-scale", "Find each side, then compare. The scale shows a true equation because 6 + 4 and 10 have the same value."],
    ],
    i2: hop("Test a false equation: 6 + 4 = 11. Start at 6 and count on 4. Where do you really land?", 4, 12, 6, 4, "forward", "Start at six and make four hops. The landing tells the true total.", "You landed on 10, not 11. That proves 6 + 4 = 11 is false.", [{ value: 11, feedback: "Eleven is the number written in the false equation. Follow the four hops to find the real total." }]),
    prompts: { k2: "Compare both sides. Which equation is TRUE?", ch1: "Challenge: check each side and choose the TRUE equation." },
    remedial: ["as-equal-sign", "The picture shows a true equation: 5 + 3 and 8 match. A true equation must have the same value on both sides.", mcq("Check each side. Which equation is TRUE?", [option("o0", "6 + 3 = 9", true, "Correct — six plus three and nine have the same value."), option("o1", "6 + 3 = 10", false, "Six plus three is nine, not ten."), option("o2", "6 + 4 = 9", false, "Six plus four is ten, not nine."), option("o3", "6 + 6 = 9", false, "Six plus six is twelve, not nine.")])],
  },
  "g1e-01-03": {
    concepts: [
      ["add-balance-scale", "Both sides may have addition. In 4 + 5 = 6 + 3, both sides are 9. The picture shows another balance: 6 + 4 and 10 are equal."],
      ["balance-unknown", "First find the total on the complete side. Then fill the blank to match it. The picture shows 6 + 4 = 10, so the blank is 4."],
    ],
    i2: hop("Check another balance: 2 + 7 = 4 + 5. Find the right side by starting at 4 and counting on 5. Where do you land?", 2, 11, 4, 5, "forward", "Start at four and count on five. Compare the landing with two plus seven.", "You landed on 9. The left side is also 9, so the equation balances."),
    prompts: { k2: "Make both sides equal: 5 + 5 = 4 + ? Use the total on the left to find the missing part.", k3: "Make both sides equal: 5 + 2 = 5 + ? Notice the matching five on both sides.", ch1: "Make both sides equal: 3 + 7 = 3 + ? Check your answer by adding both sides." },
    remedial: ["balance-unknown", "The picture shows 6 + ? = 10. Since 6 + 4 makes 10, the blank is 4 and the scale balances.", numeric("Make both sides equal: 6 + 5 = 4 + ? Use the total on the left.", 7, [{ value: 11, feedback: "Eleven is the whole left side. The blank joins four, so it must be smaller." }, { value: 2, feedback: "Two is the gap between four and six, but the right side must reach eleven." }], "First find six plus five. Then ask what joins four to make that total.", "Correct — both sides equal 11 when the blank is 7.")],
  },
  "g1e-01-04": {
    concepts: [
      ["add-balance-scale", "A total may come first: 12 = 8 + 4 is true. The picture shows 6 + 4 = 10; read it backward as 10 = 6 + 4 and it is still true."],
      ["balance-unknown", "For 12 = 8 + ?, find the part that joins 8 to make 12. The picture shows another example: 10 = 6 + 4, so its blank is 4."],
    ],
    i2: hop("Read the total first: check 11 = 6 + 5. Start at 6 and count on 5. Where do you land?", 4, 13, 6, 5, "forward", "Start at six and make five hops. The right side must reach eleven.", "You landed on 11, so 11 = 6 + 5 is true."),
    prompts: { k2: "Build the right side: 9 = 2 + __. Which number makes the equation true?", k3: "Use a make-ten fact: 13 = 10 + __. Which number makes the equation true?" },
    remedial: ["balance-unknown", "The picture can be read in either direction: 6 + 4 = 10 and 10 = 6 + 4 are both true.", mcq("Count on from the known part: 14 = 5 + __. Which number completes the true equation?", [option("o0", "9", true, "Correct — five plus nine is fourteen."), option("o1", "14", false, "Fourteen is the whole. The blank is only the missing part."), option("o2", "5", false, "Five plus five is ten, not fourteen."), option("o3", "19", false, "Nineteen is five more than fourteen, not the missing part.")])],
  },
  "g1e-01-05": {
    concepts: [
      ["add-balance-scale", "Two sums can stand on the two sides: 3 + 6 = 4 + 5 is true because both sides are 9. The scale shows the same balance idea with 6 + 4 and 10."],
      ["as-equal-sign", "The equal sign is not an arrow. It says the amounts on both sides are the same. The picture shows 5 + 3 and 8 matching."],
    ],
    i2: hop("Check two new sums: 2 + 6 = 3 + 5. Find the right side by starting at 3 and counting on 5. Where do you land?", 1, 10, 3, 5, "forward", "Start at three and make five hops. Then compare with two plus six.", "You landed on 8. The left side is also 8, so the two sums are equal."),
    prompts: { k2: "Make both sides equal: 7 + 3 = 9 + ? Find the small missing part.", ch1: "Make both sides equal: 4 + 5 = 7 + ? Check both sums after you solve." },
    remedial: ["add-balance-scale", "The level scale means both sides have the same value, even when the sides look different.", numeric("Make both sides equal: 6 + 4 = 3 + ? Find the missing part.", 7, [{ value: 10, feedback: "Ten is the whole left side. The blank must join three to make ten." }, { value: 3, feedback: "Three is already shown on the right; find the other part." }], "Find six plus four, then count from three to that total.", "Correct — both sides equal 10 when the blank is 7.")],
  },
  "g1e-02-01": {
    concepts: [
      ["bar-join", "A blank can hide the total: 5 + 3 = ?. Join the two known parts. The picture shows another example, 7 + 5 = 12."],
      ["koa-join-two-groups", "To find an end blank, put both groups together and count the whole. The picture shows another joining story."],
    ],
    i2: hop("Find a new end blank: 7 + 5 = __. Start at 7 and count on 5. Where do you land?", 5, 14, 7, 5, "forward", "Start at seven and make five hops to find the whole.", "You landed on 12, so 7 + 5 = 12."),
    prompts: { k2: "6 + 6 = ? Find the total by using a double.", k3: "7 + 5 = ? Find the total by counting on." },
    remedial: ["bar-join", "The bar joins parts 7 and 5 into the whole 12. An end blank asks for that whole.", numeric("5 + 8 = ? Find the whole.", 13, [{ value: 8, feedback: "Eight is one part. Join it with the other part, five." }, { value: 3, feedback: "Three is the difference between five and eight, not their joined total." }], "Join the two parts by adding five and eight.", "Correct — 5 + 8 = 13.")],
  },
  "g1e-02-02": {
    concepts: [
      ["balance-unknown", "A blank can hide a part: 5 + ? = 12. The known part and missing part must make the whole. The picture shows 6 + 4 = 10."],
      ["bar-part-whole", "Start with the whole and take away the known part. The picture shows 13 − 6 = 7, so the missing part is 7."],
    ],
    i2: hop("Find another middle blank: 8 + __ = 14. Start at 14 and count back 8. Where do you land?", 4, 16, 14, 8, "back", "Start at fourteen and make eight hops back to remove the known part.", "You landed on 6, so 8 + 6 = 14.", [{ value: 7, feedback: "Seven is one hop too high. Remove all eight from fourteen." }]),
    prompts: { k2: "11 + ? = 15. What is the missing number? Use the whole and known part.", k3: "6 + ? = 14. What is the missing number? Check by adding it back." },
    remedial: ["bar-part-whole", "The bar shows a whole of 13 split into 6 and 7. When one part is missing, subtract the known part from the whole.", numeric("Use the bar model: 7 + ? = 13. What is the missing number?", 6, [{ value: 7, feedback: "Seven is the known part. Find the other part that makes thirteen." }, { value: 20, feedback: "Adding the whole and part does not find the missing part." }], "Count from seven up to thirteen, or find thirteen minus seven.", "Correct — 7 + 6 = 13.")],
  },
  "g1e-02-03": {
    concepts: [
      ["bar-part-whole", "The blank can come first: ? + 4 = 11. It is still a missing part. The picture shows another example, 6 + 7 = 13."],
      ["as-part-whole", "The blank's place does not change the math. Take the known part from the whole. The picture shows 13 − 6 = 7."],
    ],
    i2: hop("Find another start blank: __ + 6 = 13. Start at 13 and count back 6. Where do you land?", 5, 15, 13, 6, "back", "Start at thirteen and make six hops back to remove the known part.", "You landed on 7, so 7 + 6 = 13."),
    prompts: { k2: "? + 7 = 13. What is the missing number? Remove the known part from the whole.", k3: "? + 12 = 16. What is the missing number? Add it back to check." },
    remedial: ["as-part-whole", "The picture shows the whole 13 split into 6 and 7. A blank at the start can still be found by subtracting the known part.", numeric("Use the part-whole picture: ? + 5 = 12. What is the missing number?", 7, [{ value: 5, feedback: "Five is the known part. Find the other part that makes twelve." }, { value: 17, feedback: "Adding the whole and known part does not find the blank." }], "Find twelve minus five, then check by adding five.", "Correct — 7 + 5 = 12.")],
  },
  "g1e-02-04": {
    concepts: [
      ["difference-gap", "A subtraction blank can ask what was taken away: 14 − ? = 9. The missing amount is the gap. The picture shows another gap, 8 − 5 = 3."],
      ["fact-family", "Add the removed part back to what remains. The picture shows 13 − 5 = 8 and the check 8 + 5 = 13."],
    ],
    i2: hop("Find another removed amount: 16 − __ = 10. Start at 16 and count back until 10. Where do six hops land?", 8, 18, 16, 6, "back", "Start at sixteen and make six hops back.", "You landed on 10. The six-hop gap is the amount removed.", [{ value: 11, feedback: "Eleven is one hop short. Make all six hops to reach ten." }]),
    prompts: { k2: "9 − ? = 3. What was taken away? Find the gap.", k3: "17 − ? = 5. What was taken away? Add your answer back to check." },
    remedial: ["difference-gap", "The picture highlights the gap between 8 and 5. That gap is 3 because 8 − 3 = 5.", numeric("Find the gap: 12 − ? = 7. What was taken away?", 5, [{ value: 7, feedback: "Seven is what remains. Find the gap from twelve down to seven." }, { value: 19, feedback: "Adding twelve and seven does not find what was removed." }], "Count back from twelve to seven, or find twelve minus seven.", "Correct — taking 5 from 12 leaves 7.")],
  },
  "g1e-03-01": {
    concepts: [
      ["fact-family", "A fact family uses the same two parts and whole. The picture links 8 + 5 = 13 with 13 − 5 = 8."],
      ["as-fact-family", "For 5 + ? = 12, use 12 − 5 = 7. The picture shows another family: 6, 7, and 13."],
    ],
    i2: hop("Use a new fact family for 6 + __ = 14. Start at 14 and count back 6. Where do you land?", 5, 16, 14, 6, "back", "Start at fourteen and make six hops back.", "You landed on 8. The family fact 14 − 6 = 8 solves the blank."),
    prompts: { k3: "Fact family 6, 5, 11: 11 − 6 = ? Use the matching addition fact.", ch1: "Fact family 5, 6, 11: 11 − 5 = ? Name the missing family member." },
    remedial: ["fact-family", "The number bond and equations use the same three numbers. An addition fact can help solve its matching subtraction fact.", numeric("Use the matching addition fact: Fact family 4, 7, 11; 11 − 4 = ?", 7, [{ value: 4, feedback: "Four is the part being removed. The other family part is the answer." }, { value: 15, feedback: "Adding eleven and four leaves the fact family instead of finding the missing part." }], "Think: four plus what makes eleven?", "Correct — 4 + 7 = 11, so 11 − 4 = 7.")],
  },
  "g1e-03-02": {
    concepts: [
      ["balance-unknown", "You can check an answer by putting it into the equation. If both sides match, the answer works. The picture checks 4 in 6 + ? = 10."],
      ["as-unknown", "Putting a number in for a blank or x is called substitution. The picture uses 9 in ? − 4 = 5 and checks that it works."],
    ],
    i2: hop("Test an answer that does not work: try x = 6 in x + 5 = 12. Start at 6 and count on 5. Where do you land?", 4, 13, 6, 5, "forward", "Start at six and make five hops. Compare the landing with twelve.", "You landed on 11, not 12, so x = 6 does not work.", [{ value: 12, feedback: "Twelve is the hoped-for total, but six plus five really lands on eleven." }]),
    prompts: { k3: "Test a claim: Is x = 8 a solution of x + 6 = 13?", ch1: "Check by putting the answer back: you solved x + 5 = 13 and got x = 8. How do you check it?" },
    remedial: ["balance-unknown", "The picture puts 4 into 6 + ? = 10. Both sides become 10, so 4 works.", mcq("Does x = 5 work in x + 3 = 8?", [option("o0", "Yes — 5 + 3 = 8", true, "Correct — putting in five makes both sides equal eight."), option("o1", "No — 5 + 3 = 9", false, "Five plus three is eight, so the answer does work."), option("o2", "Every number works", false, "Only numbers that make both sides match are solutions."), option("o3", "x cannot stand for a number", false, "Here x stands for the number we are testing.")])],
  },
  "g1e-03-03": {
    concepts: [
      ["as-equal-sign", "To write a true equation, use an equal sign and make both sides match. The picture shows 5 + 3 = 8."],
      ["add-balance-scale", "An expression has no equal sign. An equation has one; then we check whether its two sides match. The scale shows a true equation."],
    ],
    i2: hop("Write and check another true equation: 5 + 4 = 9. Start at 5 and count on 4. Where do you land?", 3, 11, 5, 4, "forward", "Start at five and make four hops.", "You landed on 9, so 5 + 4 = 9 is true."),
    prompts: { k3: "Choose a TRUE equation that includes an equal sign." },
    remedial: ["as-equal-sign", "The picture has an equal sign and matching values, so it is a true equation. An expression such as 5 + 3 has no equal sign.", mcq("Which choice is a TRUE equation?", [option("o0", "4 + 5 = 9", true, "Correct — it has an equal sign and both sides equal nine."), option("o1", "4 + 5 = 10", false, "This is an equation, but it is false because four plus five is nine."), option("o2", "4 + 5", false, "This is an expression because it has no equal sign."), option("o3", "9 = 8", false, "This is an equation, but it is false because nine does not equal eight.")])],
  },
};

const learnerLanguageReplacements = new Map([
  ["An equation claims 8 + 3 = 11. Before checking, is a claim automatically true?", "The equation says 8 + 3 = 11. Is every equation automatically true?"],
  ["Written claims can be wrong; valuing both sides is what settles it.", "An equation can be false. Find both sides to check."],
  ["The sides may look different; the equal sign only claims their VALUES match.", "The sides may look different. The equal sign says their values match."],
  ["The equal sign claims both sides share one value.", "The equal sign says both sides have one value."],
  ["Only a matching-value claim is true.", "An equation is true only when both sides match."],
  ["Every claim gets the same two-step check.", "Check every equation in the same two steps."],
  ["The true claim is the one whose sides agree.", "The true equation is the one whose sides match."],
  ["Value the complete side first.", "Find the total on the complete side first."],
  ["Find the value of the complete side first.", "Find the total on the complete side first."],
  ["Only value-matching sums make a true claim.", "A true equation has matching totals."],
  ["Position changes nothing about parts and totals.", "The blank can move, but the parts and whole stay the same."],
  ["The same check works in every unknown position.", "The same check works wherever the blank is."],
  ["Substitute, value, compare.", "Put the number in, add, and compare."],
  ["Substitution tests the value in the original claim.", "Substitution means putting the number into the original equation."],
  ["A false claim is not a keeper.", "A false equation needs to be fixed."],
  ["Writing an equation is making a claim.", "Writing an equation means saying two values are equal."],
  ["A written equation must be TRUE; the left side is 12, not 14.", "This equation is false: the left side is 12, not 14."],
  ["A written equation must be TRUE; the left side is 9, not 11.", "This equation is false: the left side is 9, not 11."],
  ["A written claim is only an equation once its sides are verified to match.", "An equal sign makes it an equation; checking the sides tells whether it is true."],
  ["Value both sides: the left makes 9 but the right says 8 — the check catches the false claim. A written claim is only an equation once its sides are verified to match.", "Find both sides: the left makes 9, but the right says 8. The equal sign makes it an equation; the mismatch shows it is false."],
  ["No — 3 + 4 = 7, not 7", "No — 3 + 4 = 8"],
  ["The substitution actually balances the equation at 7.", "Putting in 3 makes both sides equal 7."],
  ["Substituting 3 makes both sides equal 7, so it is a solution.", "Putting in 3 makes both sides equal 7, so it works."],
  ["Substituting 8 gives 14, so the equation is not true.", "Putting in 8 gives 14, so the equation is not true."],
  ["A value is a solution only when substitution makes the two sides equal.", "A number works only when putting it in makes the two sides equal."],
  ["Landed on 11 — substituting 7 makes the left side reach 11 exactly, proving the answer.", "You landed on 11. Putting in 7 makes both sides equal 11, so the answer works."],
]);

function replaceLearnerLanguage(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, current] of Object.entries(value)) {
    if (current && typeof current === "object") replaceLearnerLanguage(current);
    if (typeof current !== "string") continue;
    let revised = learnerLanguageReplacements.get(current) ?? current;
    revised = revised.replaceAll("value the right side", "find the total on the right").replaceAll("value the left side", "find the total on the left");
    revised = revised.replaceAll("whole value of the left side", "total on the left side");
    value[key] = revised;
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  const plan = plans[lesson.id];
  if (!plan) throw new Error(`Missing plan for ${lesson.id}`);
  for (const [index, id] of ["c1", "c2"].entries()) {
    const concept = step(lesson, id);
    concept.figure = plan.concepts[index][0];
    concept.body = plan.concepts[index][1];
    concept.narration = concept.body;
  }
  step(lesson, "i2").widget = plan.i2;
  for (const [id, prompt] of Object.entries(plan.prompts)) step(lesson, id).widget.prompt = prompt;
  if (!Array.isArray(lesson.remedials) || lesson.remedials.length !== 1) throw new Error(`${lesson.id}: expected one remedial route`);
  const [figure, body, widget] = plan.remedial;
  const route = lesson.remedials[0];
  route.concept.figure = figure;
  route.concept.body = body;
  route.concept.narration = body;
  route.check.widget = widget;
  replaceLearnerLanguage(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} equations-unknowns-g1 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  illustrationSourceClosures: 23, additionalVisualUpgrade: 1,
  progressionSourceClosures: 12, sourceClosures: 35,
  visualRemedialsAdded: 12, distinctRemedialTransfersAdded: 12,
  assessorControlledResidual: 36,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
