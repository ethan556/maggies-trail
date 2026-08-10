#!/usr/bin/env node
// S185: build the data-graphs-g1 course (12 lessons) — the third K5-expansion course, over the
// S185-extended engines: barBuilder display "tally"/"pictograph"/"bar" (the 1.MD.C.4 DRAW verb)
// and graphRead mode "tally"/"picture"/"bar" (the read side). Checks are variant-backed by the new
// g1-data family. Same factory contract as its two predecessors: per-lesson packs, the 9-step
// A-tier shape, every number derived + asserted abort-before-write.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "data-graphs-g1");
if (!spec || spec.lessons.length !== 12) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

// ——— widget builders ———
function build(prompt, display, categories, target, opts = {}) {
  const maxVal = opts.maxVal ?? Math.max(...target) + 2;
  must(categories.length === target.length && categories.length >= 2, "build shape");
  for (const t of target) must(Number.isInteger(t) && t >= 0 && t <= maxVal, `build target ${t}/${maxVal}`);
  must(new Set(categories).size === categories.length, "build categories distinct");
  return {
    type: "barBuilder", prompt, categories, target, maxVal, step: 1, histogram: false,
    display, icon: opts.icon ?? "●",
    successFeedback: opts.success,
    partialFeedback: opts.partial ?? `Compare each category against its count in the prompt — ${display === "tally" ? "a crossed five-group counts five at once" : display === "pictograph" ? "one picture stands for one" : "the bar's top must sit exactly on its number"}.`,
  };
}
function read(prompt, mode, drawn, categoryLabel, unitNoun, opts = {}) {
  const scaleMax = opts.scaleMax ?? drawn + 3;
  must(Number.isInteger(drawn) && drawn >= 0 && drawn <= scaleMax, `read drawn ${drawn}/${scaleMax}`);
  if (mode === "picture") must(drawn <= 20, "picture cap");
  if (mode === "tally") must(drawn <= 25, "tally cap");
  const commonResults = (opts.traps ?? []).map(([value, feedback]) => {
    must(value !== drawn && value >= 0 && value <= scaleMax, `read trap ${value}`);
    must(feedback.length >= 25, "read trap feedback short");
    return { value, feedback };
  });
  return {
    type: "graphRead", prompt, mode, drawn, unitValue: 1, categoryLabel,
    unitNoun, unitNounPlural: unitNoun + "s", scaleMax, icon: opts.icon ?? "●",
    commonResults,
    fallbackFeedback: opts.fallback ?? `Count what is actually drawn — ${mode === "tally" ? "fives for each crossed group, then ones for the singles" : mode === "picture" ? "one picture at a time" : "the gridline the bar's top touches"} — and move the marker to that number.`,
    successFeedback: opts.success,
  };
}
function bucket(prompt, buckets, items, missFeedback, successFeedback) {
  const ids = new Set(buckets.map((b) => b.id));
  for (const it of items) must(ids.has(it.bucketId), `bucket item ${it.id} targets unknown bucket`);
  return { type: "dragBucket", prompt, buckets, items, missFeedback, successFeedback };
}
function numeric(prompt, answer, traps, fallback) {
  const commonErrors = traps.map(([value, feedback]) => {
    must(value !== answer, `numeric trap equals answer: ${value}`);
    must(feedback.length >= 25, `numeric trap feedback short: ${prompt}`);
    return { value, feedback };
  });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `numeric traps distinct: ${prompt}`);
  return { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback: fallback };
}
function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  for (const o of opts) must(o.feedback.length >= 25, `mcq feedback short: ${prompt}`);
  const rot = (prompt.length % opts.length);
  const shown = [...opts.slice(rot), ...opts.slice(0, rot)].map((o, i) => ({ id: `o${i}`, label: o.label, feedback: o.feedback, correct: o.ok }));
  must(shown.filter((o) => o.correct).length === 1, "exactly one correct");
  return { type: "mcq", prompt, options: shown };
}
const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `data-graphs-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const V = (form) => ({ gen: "g1-data", form });
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

// ——— reusable check packs (each mirrors a g1-data form with FIXED numbers) ———
const total = (nm, ct) => ({
  body: "Count them all.",
  ev: [`${ct[0]} + ${ct[1]} + ${ct[2]} = ${ct[0] + ct[1] + ct[2]} — every category counts.`, `Adding all three counts gives ${ct[0] + ct[1] + ct[2]} in all.`],
  widget: numeric(`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many votes in all?`, ct[0] + ct[1] + ct[2],
    [[ct[0] + ct[1], `That adds only the first two categories and leaves out ${nm[2]}. "In all" means every category counts toward the total.`],
     [Math.max(...ct), `That is the biggest single category, not the total. Add all three counts together.`]],
    `Add every category's count — the total collects all the votes, whichever category holds them.`),
  hints: [`"In all" means every category.`, `Add the three counts.`, `${ct[0]} + ${ct[1]} + ${ct[2]} = ${ct[0] + ct[1] + ct[2]}.`], variant: V("GdTotalNumeric"),
});
const compare = (nm, ct) => {
  const i = ct.indexOf(Math.max(...ct)), j = ct.indexOf(Math.min(...ct));
  return {
    body: "Find the gap.",
    ev: [`${ct[i]} − ${ct[j]} = ${ct[i] - ct[j]} — the difference between the two counts.`, `${nm[i]} is ${ct[i] - ct[j]} votes ahead of ${nm[j]}.`],
    widget: numeric(`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many more votes does ${nm[i]} have than ${nm[j]}?`, ct[i] - ct[j],
      [[ct[i] + ct[j], `That adds the two categories. "How many more" asks for the difference, so subtract the smaller count from the larger.`],
       [ct[i], `That is ${nm[i]}'s whole count. The question asks how far ahead it is, which is the difference between the two counts.`]],
      `Subtract the smaller count from the larger — the difference tells how many more.`),
    hints: [`"How many more" is a difference.`, `Subtract the smaller from the larger.`, `${ct[i]} − ${ct[j]} = ${ct[i] - ct[j]}.`], variant: V("GdCompareNumeric"),
  };
};
const most = (nm, ct) => {
  const i = ct.indexOf(Math.max(...ct)); const rest = [0, 1, 2].filter((x) => x !== i);
  return {
    body: "Find the biggest count.",
    ev: [`${ct[i]} is the biggest count, so ${nm[i]} got the most.`, `Compare the three counts: ${nm[i]}'s ${ct[i]} wins.`],
    widget: mcq(`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which got the MOST votes?`,
      [nm[i], `Correct — ${ct[i]} is the biggest count, so ${nm[i]} got the most votes.`],
      rest.map((x) => [nm[x], `${nm[x]} got ${ct[x]} votes, and ${ct[i]} is bigger. The most votes means the biggest count.`])),
    hints: [`Most means the biggest count.`, `Compare the three numbers.`, `${nm[i]} with ${ct[i]}.`], variant: V("GdMostMcq"),
  };
};
const least = (nm, ct) => {
  const i = ct.indexOf(Math.min(...ct)); const rest = [0, 1, 2].filter((x) => x !== i);
  return {
    body: "Find the smallest count.",
    ev: [`${ct[i]} is the smallest count, so ${nm[i]} got the fewest.`, `Compare the three counts: ${nm[i]}'s ${ct[i]} is smallest.`],
    widget: mcq(`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which got the FEWEST votes?`,
      [nm[i], `Correct — ${ct[i]} is the smallest count, so ${nm[i]} got the fewest votes.`],
      rest.map((x) => [nm[x], `${nm[x]} got ${ct[x]} votes, and ${ct[i]} is smaller. The fewest votes means the smallest count.`])),
    hints: [`Fewest means the smallest count.`, `Compare the three numbers.`, `${nm[i]} with ${ct[i]}.`], variant: V("GdLeastMcq"),
  };
};
const tallyRead = (g, sg) => ({
  body: "Read the marks.",
  ev: [`${g} five-${g === 1 ? "group" : "groups"} is ${5 * g}; ${sg} more singles makes ${5 * g + sg}.`, `Count by fives, then ones: ${5 * g + sg}.`],
  widget: numeric(`A tally row shows ${g} crossed five-${g === 1 ? "group" : "groups"} and ${sg} single ${sg === 1 ? "mark" : "marks"}. How many does it count?`, 5 * g + sg,
    [[g + sg, `That counts each crossed group as one mark, but a crossed group holds FIVE marks. Count the groups by fives, then add the singles.`],
     [5 * g, `That counts only the five-groups and skips the single marks after them. Count on from ${5 * g} by ones.`]],
    `Count the crossed groups by fives, then count on by ones for the singles.`),
  hints: [`A crossed group holds five.`, `Count fives first, then ones.`, `${5 * g} and ${sg} more: ${5 * g + sg}.`], variant: V("GdTallyReadNumeric"),
});
const tallyMake = (n) => ({
  body: "Bundle by fives.",
  ev: [`${n} votes make ${Math.floor(n / 5)} full five-${Math.floor(n / 5) === 1 ? "group" : "groups"}.`, `Count fives inside ${n}: ${Math.floor(n / 5)} crossed groups fit.`],
  widget: numeric(`${n} students voted. When you tally the votes in five-groups, how many CROSSED groups will there be?`, Math.floor(n / 5),
    [[n, `That is the whole count of votes. Each crossed group bundles five of them; the question asks how many full bundles fit.`],
     [n % 5 === Math.floor(n / 5) ? n - 1 : n % 5, `That is the number of leftover single marks after the five-groups, not the number of crossed groups.`]],
    `Bundle the count into fives — each full bundle becomes one crossed group.`),
  hints: [`Each crossed group holds five.`, `How many fives fit in ${n}?`, `${Math.floor(n / 5)} groups.`], variant: V("GdTallyMakeNumeric"),
});
const tallySingles = (n) => {
  must(n % 5 !== 0 && n % 5 !== Math.floor(n / 5), `tallySingles ${n} degenerate`);
  return {
    body: "The leftover marks.",
    ev: [`After ${Math.floor(n / 5)} five-groups, ${n % 5} single ${n % 5 === 1 ? "mark stands" : "marks stand"} alone.`, `${n} is ${Math.floor(n / 5)} fives and ${n % 5} more.`],
    widget: numeric(`${n} students voted. After the crossed five-groups, how many SINGLE marks will the tally show?`, n % 5,
      [[Math.floor(n / 5), `That is the number of crossed five-groups, not the leftover single marks.`],
       [n, `That is the whole count. Only the marks left over after bundling fives stand alone.`]],
      `Take out the full fives first — the marks that do not fill a five-group stand alone.`),
    hints: [`Bundle fives first.`, `What is left after the fives?`, `${n % 5} singles.`], variant: V("GdTallySinglesNumeric"),
  };
};
const notCat = (nm, ct) => {
  const t = ct[0] + ct[1] + ct[2];
  return {
    body: "Everything else.",
    ev: [`${t} in all, ${ct[0]} are ${nm[0]}: ${t} − ${ct[0]} = ${t - ct[0]} are not.`, `"Not ${nm[0]}" collects the other two categories: ${ct[1]} + ${ct[2]} = ${t - ct[0]}.`],
    widget: numeric(`${t} answers were sorted: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many are NOT ${nm[0]}?`, t - ct[0],
      [[ct[0], `That is the count that IS ${nm[0]}. "Not ${nm[0]}" means everything in the other categories.`],
       [t, `That is the whole collection. Take away the ${nm[0]} count to find what is left.`]],
      `Add the other categories, or take the ${nm[0]} count away from the total — both find what is not ${nm[0]}.`),
    hints: [`"Not" means the other groups.`, `Total minus the ${nm[0]} count.`, `${t} − ${ct[0]} = ${t - ct[0]}.`], variant: V("GdNotCategoryNumeric"),
  };
};
const question = (topic) => {
  const q = { pets: "Which pet do you like best?", fruits: "Which fruit do you like best?", colors: "Which color do you like best?", sports: "Which sport do you like best?" }[topic];
  return {
    body: "Pick the survey question.",
    ev: [`A survey question gives each person one choice that can be sorted and counted.`, `"${q}" produces countable category answers.`],
    widget: mcq(`A class wants to collect data about favorite ${topic}. Which is a good survey question?`,
      [q, `Correct — it asks every person for one answer that can be sorted into categories and counted.`],
      [["Do you like things?", `That question is too vague to sort — the answers would not fall into countable categories about ${topic}.`],
       ["What is 3 + 4?", `That is an arithmetic problem with one right answer, not a survey question that collects different people's choices.`],
       ["Why is the sky blue?", `That asks for an explanation, not a choice that can be tallied into categories.`]]),
    hints: [`Answers must sort into groups.`, `Each person picks one choice.`, `"${q}"`], variant: V("GdQuestionMcq"),
  };
};
const sortPick = (kindIdx) => {
  const kinds = [
    ["a red apple", "color", "Red things",
      ["Round things", "Round describes the apple\u2019s shape, and this sort goes by COLOR \u2014 check what color it is first."],
      ["Big things", "Big describes size, not color. The sorting rule here asks only about the color."]],
    ["a toy car", "what it does", "Things that roll",
      ["Things that fly", "A toy car rolls on its wheels \u2014 it has no wings and cannot fly."],
      ["Things that swim", "A toy car has wheels for rolling, not fins for swimming."]],
    ["a triangle", "shape", "Shapes with 3 sides",
      ["Shapes with 4 sides", "A triangle has exactly 3 sides \u2014 one short of this group\u2019s rule."],
      ["Round shapes", "Every side of a triangle is straight; nothing about it is round."]],
  ];
  const k = kinds[kindIdx];
  return {
    body: "Sort it.",
    ev: [`Sorted by ${k[1]}, ${k[0]} matches "${k[2]}".`, `The sorting rule is ${k[1]}, so check that feature first.`],
    widget: mcq(`You are sorting by ${k[1]}. Where does ${k[0]} belong?`,
      [k[2], `Correct — sorted by ${k[1]}, ${k[0]} matches this group's rule.`],
      [k[3], k[4]]),
    hints: [`Check the sorting rule first.`, `Which rule does ${k[0]} match?`, `${k[2]}.`], variant: V("GdSortMcq"),
  };
};
const interpret = (nm, ct) => {
  const i = ct.indexOf(Math.max(...ct)), j = ct.indexOf(Math.min(...ct));
  return {
    body: "Tell it truthfully.",
    ev: [`${nm[i]}'s ${ct[i]} is the biggest count — that sentence matches the data.`, `Check each sentence against the counts before choosing.`],
    widget: mcq(`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which sentence tells the data's story truthfully?`,
      [`${nm[i]} got the most votes`, `Correct — ${ct[i]} is the biggest count, so that sentence matches the data.`],
      [[`${nm[j]} got the most votes`, `${nm[j]} got ${ct[j]} votes — the SMALLEST count. The data says the opposite.`],
       [`Every category got the same votes`, `The three counts are all different, so no two categories tied.`],
       [`${nm[i]} got the fewest votes`, `${nm[i]} has the biggest count, ${ct[i]}. It got the most, not the fewest.`]]),
    hints: [`Test each sentence against the counts.`, `Which count is biggest?`, `${nm[i]} got the most.`], variant: V("GdInterpretMcq"),
  };
};
const barCompare = (h, d) => ({
  body: "Shorter by how much?",
  ev: [`${d} shorter than ${h} is ${h - d}.`, `Shorter bars reach smaller numbers: ${h} − ${d} = ${h - d}.`],
  widget: numeric(`On a bar graph, the Dogs bar reaches ${h}. The Cats bar is ${d} shorter. How tall is the Cats bar?`, h - d,
    [[h + d, `That makes the Cats bar TALLER by ${d}. "Shorter" means the bar reaches a smaller number.`],
     [h, `That is the Dogs bar's height. The Cats bar is ${d} below it.`]],
    `Shorter means a smaller number — subtract the difference from the taller bar's height.`),
  hints: [`Shorter means smaller.`, `Subtract the difference.`, `${h} − ${d} = ${h - d}.`], variant: V("GdBarCompareNumeric"),
});

// ——— the 12 lessons ———
const L = [];
const def = (n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  L.push({ n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

def(1, 1,
  "Data starts with a question. A good survey question gives every person one choice you can sort and count.",
  "\u201CWhich pet do you like best?\u201D works because each answer lands in a category: cat, dog, or fish.",
  { body: "See what a question collects.", rep: "diagram",
    widget: () => read("The class asked \u201CWhich pet do you like best?\u201D and drew one picture per vote for Cats. How many chose Cats? Move the marker.", "picture", 6, "Cats", "vote",
      { traps: [[5, "That misses one picture. Touch each picture once as you count \u2014 there are six."], [7, "That counts one picture twice. Each picture stands for exactly one vote."]],
        success: "Six pictures, six votes \u2014 the question turned choices into countable data." }),
    predict: P("The class will ask \u201CWhich pet do you like best?\u201D What kind of answers will they collect?",
      [{ id: "cat", label: "One pet choice from each person" }, { id: "num", label: "A number from each person" }, { id: "story", label: "A long story from each person" }], "cat",
      "A survey question collects one choice per person. Choices sort into categories \u2014 and categories can be counted.") },
  question("pets"), sortPick(0), question("fruits"), question("colors"),
  { body: "Read another category's votes.", widget: () => read("Dogs got some votes too. Count the pictures and move the marker.", "picture", 4, "Dogs", "vote", { success: "Four pictures \u2014 four votes for Dogs." }) },
  ["Data begins with a question.", "Good questions give one sortable choice.", "Choices become categories to count."],
  "next: sorting answers into groups.")
def(2, 1,
  "Before counting, data gets sorted: everything that matches a rule goes in the same group.",
  "The sorting rule decides the groups. Sorting fruit by TYPE puts every apple together, every banana together.",
  { body: "Sort the fruit.", rep: "diagram",
    widget: () => bucket("Drag each fruit into its group.",
      [{ id: "ap", label: "Apples" }, { id: "ba", label: "Bananas" }],
      [{ id: "f1", label: "red apple", bucketId: "ap", feedback: "An apple belongs with the apples, whatever its color \u2014 the rule sorts by TYPE of fruit." },
       { id: "f2", label: "green apple", bucketId: "ap", feedback: "Green or red, an apple is still an apple. The rule sorts by type, not color." },
       { id: "f3", label: "yellow banana", bucketId: "ba", feedback: "A banana belongs in the banana group \u2014 match the fruit's type." },
       { id: "f4", label: "spotted banana", bucketId: "ba", feedback: "Spots do not change what fruit it is. Sort by type: banana." }],
      "Check each fruit's TYPE against the group labels \u2014 color and spots do not matter here.",
      "Every fruit sits with its own kind \u2014 sorted data is ready to count."),
    predict: P("You will sort fruit into Apples and Bananas. Where does a GREEN apple go?",
      [{ id: "ap", label: "With the apples" }, { id: "ba", label: "With the bananas" }, { id: "new", label: "It needs its own group" }], "ap",
      "The rule sorts by TYPE of fruit. A green apple is still an apple, so it joins the apple group.") },
  sortPick(1), question("sports"), sortPick(2), sortPick(0),
  { body: "Build the counts you sorted.", widget: () => build("You sorted 5 apples and 3 bananas. Show each group's count.", "pictograph", ["Apples", "Bananas"], [5, 3], { icon: "\u25CF", success: "Five and three \u2014 the sorted groups, now shown as counts." }) },
  ["Sorting puts matches together.", "The rule decides the groups.", "Sorted groups are ready to count."],
  "next: a fast way to count \u2014 tally marks.")
def(3, 1,
  "A tally mark counts one. Every fifth mark crosses the four before it, bundling them into a five-group.",
  "Five-groups make big counts fast to read: count the crossed groups by fives, then the leftover singles by ones.",
  { body: "Make the tally.", rep: "diagram",
    widget: () => build("Tally the votes: Cats 7, Dogs 4.", "tally", ["Cats", "Dogs"], [7, 4],
      { success: "Cats shows one crossed five-group and two singles; Dogs shows four singles \u2014 the counts, drawn." }),
    predict: P("You will tally 7 votes for Cats. What will the row look like?",
      [{ id: "g", label: "One crossed five-group and 2 singles" }, { id: "s", label: "7 separate single marks" }, { id: "two", label: "Two crossed five-groups" }], "g",
      "Every fifth mark crosses its group: 7 becomes one crossed five and two singles \u2014 5, then 6, 7.") },
  tallyMake(7), tallySingles(8), tallyMake(13), tallySingles(13),
  { body: "Tally a bigger count.", widget: () => build("Tally the votes: Fish 11, Birds 3.", "tally", ["Fish", "Birds"], [11, 3], { maxVal: 14, success: "Fish shows two crossed five-groups and one single; Birds shows three singles \u2014 both counts, bundled for fast reading." }) },
  ["Each mark counts one.", "The fifth mark crosses its group.", "Five-groups make counts fast to read."],
  "next: reading a finished tally chart.")
def(4, 1,
  "To read a tally, count the crossed groups by fives \u2014 5, 10, 15 \u2014 then count on by ones for the singles.",
  "A crossed group is never one mark. It always holds exactly five.",
  { body: "Read the tally.", rep: "diagram",
    widget: () => read("How many votes does this tally row show? Move the marker.", "tally", 12, "Monday", "vote",
      { traps: [[4, "That counts the visual clusters \u2014 two groups and two singles \u2014 as four things. Each crossed group holds FIVE marks."], [10, "That counts only the two five-groups. Two single marks follow them: count on 11, 12."]],
        success: "Two five-groups and two singles: 5, 10, 11, 12 votes." }),
    predict: P("The row shows 2 crossed five-groups and 2 single marks. About how many is that?",
      [{ id: "twelve", label: "12 \u2014 count fives, then ones" }, { id: "four", label: "4 \u2014 count the bunches" }, { id: "ten", label: "10 \u2014 just the groups" }], "twelve",
      "Each crossed group is five: 5, 10 \u2014 then the singles: 11, 12. Counting bunches as ones loses the fives.") },
  tallyRead(2, 2), tallyRead(1, 3), tallyRead(3, 1), tallyRead(2, 4),
  { body: "Read one more row.", widget: () => read("How many votes does this row show? Move the marker.", "tally", 9, "Tuesday", "vote", { success: "One five-group and four singles: 5, 6, 7, 8, 9." }) },
  ["Count crossed groups by fives.", "Count singles on by ones.", "A crossed group always holds five."],
  "next: turning counts into pictures.")
def(5, 2,
  "A picture graph draws one picture for each one counted. A row's pictures ARE its count.",
  "Rows line up so counts can be compared at a glance: the longer row has more.",
  { body: "Build the picture graph.", rep: "diagram",
    widget: () => build("Draw the votes: Cats 6, Dogs 3, Fish 5.", "pictograph", ["Cats", "Dogs", "Fish"], [6, 3, 5],
      { icon: "\u25CF", success: "Six, three, and five pictures \u2014 the survey drawn so anyone can read it." }),
    predict: P("Cats got 6 votes and Dogs got 3. After you draw the pictures, which row will be longer?",
      [{ id: "cats", label: "Cats \u2014 more votes, more pictures" }, { id: "dogs", label: "Dogs" }, { id: "same", label: "The rows will match" }], "cats",
      "One picture per vote: 6 pictures beat 3. The graph turns bigger counts into longer rows.") },
  most(["Cats", "Dogs", "Fish"], [6, 3, 5]), total(["Cats", "Dogs", "Fish"], [6, 3, 5]), notCat(["Apples", "Pears", "Plums"], [4, 3, 2]), most(["Red", "Blue", "Green"], [7, 4, 2]),
  { body: "Add a late vote.", widget: () => build("One more vote for Dogs arrives. Show the new counts: Cats 6, Dogs 4, Fish 5.", "pictograph", ["Cats", "Dogs", "Fish"], [6, 4, 5], { icon: "\u25CF", success: "Dogs grows to four \u2014 the graph updates one picture at a time." }) },
  ["One picture stands for one.", "A row's pictures are its count.", "Longer rows mean bigger counts."],
  "next: reading picture graphs.")
def(6, 2,
  "Reading a picture graph is counting a row: touch each picture once, and the count is the row's value.",
  "Careful counting matters \u2014 missing a picture or counting one twice changes the data's story.",
  { body: "Read the row.", rep: "diagram",
    widget: () => read("How many students chose Soccer? Move the marker.", "picture", 8, "Soccer", "vote",
      { traps: [[7, "That misses one picture. Touch each picture exactly once as you count."], [9, "That counts one picture twice. Eight pictures are drawn."]],
        success: "Eight pictures \u2014 eight votes for Soccer." }),
    predict: P("You will count the Soccer row's pictures. What does the count tell you?",
      [{ id: "votes", label: "How many chose Soccer" }, { id: "rows", label: "How many rows the graph has" }, { id: "kids", label: "How many students are in the class" }], "votes",
      "One picture per vote means the row's count IS the Soccer votes. The whole class would need every row's total.") },
  total(["Soccer", "Tag", "Jump rope"], [8, 5, 3]), notCat(["Soccer", "Tag", "Jump rope"], [8, 5, 4]), most(["Soccer", "Tag", "Jump rope"], [8, 5, 3]), total(["Grapes", "Melon", "Kiwi"], [5, 4, 2]),
  { body: "Read a shorter row.", widget: () => read("How many students chose Jump rope? Move the marker.", "picture", 3, "Jump rope", "vote", { success: "Three pictures \u2014 three votes." }) },
  ["Reading a row is counting it.", "Touch each picture once.", "Miscounts change the story."],
  "next: bars \u2014 pictures grown solid.")
def(7, 2,
  "A bar graph grows one solid bar per category. The bar's top touches its count on the number scale.",
  "Bars trade pictures for height: taller bar, bigger count, no counting needed once the scale is read.",
  { body: "Raise the bars.", rep: "diagram",
    widget: () => build("Build the bar graph: Cats 6, Dogs 3, Fish 5.", "bar", ["Cats", "Dogs", "Fish"], [6, 3, 5],
      { maxVal: 8, success: "Each bar's top sits exactly on its count \u2014 6, 3, and 5." }),
    predict: P("Cats got 6 votes and Fish got 5. After you raise the bars, how will they compare?",
      [{ id: "cats", label: "Cats' bar will be one gridline taller" }, { id: "same", label: "The bars will match" }, { id: "fish", label: "Fish's bar will be taller" }], "cats",
      "The bar's top touches its count: 6 sits one gridline above 5. Height IS the count.") },
  barCompare(6, 3), most(["Cats", "Dogs", "Fish"], [6, 3, 5]), barCompare(7, 2), barCompare(8, 3),
  { body: "Raise a second graph.", widget: () => build("Build the bars: Red 4, Blue 7.", "bar", ["Red", "Blue"], [4, 7], { maxVal: 9, success: "Four and seven \u2014 Blue's bar stands three gridlines taller." }) },
  ["One bar per category.", "The bar's top touches its count.", "Taller bar, bigger count."],
  "next: reading heights off the scale.")
def(8, 2,
  "To read a bar, follow its top straight across to the number scale. That number is the category's count.",
  "The scale does the counting for you \u2014 but only if you read the gridline the top actually touches.",
  { body: "Read the bar.", rep: "diagram",
    widget: () => read("How many votes does the Pizza bar show? Move the marker.", "bar", 7, "Pizza", "vote",
      { scaleMax: 10, traps: [[6, "That reads one gridline low. Follow the bar's TOP straight across to the scale."], [8, "That reads one gridline high. The top touches 7, not the line above it."]],
        success: "The bar's top touches 7 \u2014 seven votes for Pizza." }),
    predict: P("The Pizza bar's top touches the 7 line. How many votes is that?",
      [{ id: "seven", label: "7 \u2014 the line the top touches" }, { id: "count", label: "You must count the bar's stripes" }, { id: "ten", label: "10 \u2014 the top of the scale" }], "seven",
      "A bar graph's scale replaces counting: the top's gridline IS the count. The scale's maximum is just the chart's ceiling.") },
  barCompare(7, 4), least(["Pizza", "Tacos", "Soup"], [7, 5, 2]), barCompare(9, 5), barCompare(6, 1),
  { body: "Read a second bar.", widget: () => read("How many votes does the Soup bar show? Move the marker.", "bar", 2, "Soup", "vote", { scaleMax: 10, success: "The top touches 2 \u2014 two votes." }) },
  ["Follow the top to the scale.", "The touched gridline is the count.", "The scale counts for you."],
  "next: adding whole graphs up.")
def(9, 3,
  "A graph can answer \u201Chow many in all?\u201D \u2014 add every category's count to collect the total.",
  "The total counts every vote once, whichever category holds it. Leaving a category out loses its votes.",
  { body: "Build, then total.", rep: "diagram",
    widget: () => build("Build the graph: Vans 4, Bikes 6, Cars 3.", "bar", ["Vans", "Bikes", "Cars"], [4, 6, 3],
      { maxVal: 8, success: "Four, six, and three \u2014 thirteen wheels' worth of data in all." }),
    predict: P("Vans 4, Bikes 6, Cars 3. Before adding \u2014 will the total be more or less than 10?",
      [{ id: "more", label: "More than 10" }, { id: "less", label: "Less than 10" }, { id: "exact", label: "Exactly 10" }], "more",
      "4 + 6 already makes 10, and Cars adds 3 more: 13 in all. Estimating first catches missed categories.") },
  total(["Vans", "Bikes", "Cars"], [4, 6, 3]), total(["Ants", "Bees", "Moths"], [7, 2, 4]), total(["Milk", "Juice", "Water"], [3, 5, 6]), total(["Oak", "Pine", "Elm"], [8, 4, 5]),
  { body: "One more graph to total.", widget: () => build("Build the graph: Milk 3, Juice 5, Water 6.", "bar", ["Milk", "Juice", "Water"], [3, 5, 6], { maxVal: 8, success: "Three, five, six \u2014 fourteen drinks counted in all." }) },
  ["\u201CIn all\u201D adds every category.", "Every vote counts exactly once.", "Skipping a category loses votes."],
  "next: how far apart two categories are.")
def(10, 3,
  "\u201CHow many more?\u201D compares two categories: subtract the smaller count from the larger.",
  "On the graph, the difference is the gap between the two bar tops \u2014 the part of the taller bar with nothing beside it.",
  { body: "See the gap.", rep: "diagram",
    widget: () => read("Bikes got 6 votes; the Vans bar reaches 4. Read the BIKES bar. Move the marker.", "bar", 6, "Bikes", "vote",
      { scaleMax: 8, traps: [[4, "That reads the Vans bar. The question asks for Bikes \u2014 the taller one."], [2, "That is the GAP between the bars, not the Bikes count itself."]],
        success: "Bikes reaches 6 \u2014 two gridlines above Vans' 4. That two-line gap is the \u201Chow many more.\u201D" }),
    predict: P("Bikes 6, Vans 4. How many more votes did Bikes get?",
      [{ id: "two", label: "2 \u2014 the difference" }, { id: "ten", label: "10 \u2014 the two together" }, { id: "six", label: "6 \u2014 the Bikes count" }], "two",
      "\u201CHow many more\u201D is a difference: 6 \u2212 4 = 2. Adding gives the total instead, and 6 alone is just one bar's count.") },
  compare(["Bikes", "Vans", "Cars"], [6, 4, 3]), compare(["Ants", "Bees", "Moths"], [7, 2, 4]), compare(["Milk", "Juice", "Water"], [3, 5, 6]), compare(["Oak", "Pine", "Elm"], [8, 4, 5]),
  { body: "Build both, watch the gap.", widget: () => build("Build the two bars: Bikes 6, Vans 4.", "bar", ["Bikes", "Vans"], [6, 4], { maxVal: 8, success: "The Bikes bar stands two gridlines taller \u2014 the difference, visible." }) },
  ["\u201CHow many more\u201D is a difference.", "Subtract the smaller from the larger.", "The gap between bar tops shows it."],
  "next: crowning the biggest and smallest.")
def(11, 3,
  "The MOST is the biggest count \u2014 the tallest bar, the longest row. The FEWEST is the smallest.",
  "Compare counts, not category names or positions: the winner can sit anywhere in the graph.",
  { body: "Crown the winner.", rep: "diagram",
    widget: () => build("Build the votes: Red 7, Blue 4, Green 2.", "pictograph", ["Red", "Blue", "Green"], [7, 4, 2],
      { icon: "\u25CF", success: "Seven, four, two \u2014 Red's row runs longest, Green's shortest." }),
    predict: P("Red 7, Blue 4, Green 2. Once drawn, which row will be LONGEST?",
      [{ id: "red", label: "Red \u2014 the biggest count" }, { id: "green", label: "Green" }, { id: "first", label: "Whichever row is on top" }], "red",
      "Row length follows count, not position: 7 pictures run longest wherever the row sits.") },
  most(["Red", "Blue", "Green"], [7, 4, 2]), least(["Red", "Blue", "Green"], [7, 4, 2]), most(["Ham", "Egg", "Jam"], [3, 6, 5]), least(["Ham", "Egg", "Jam"], [3, 6, 5]),
  { body: "A new contest.", widget: () => build("Build the votes: Ham 3, Egg 6, Jam 5.", "pictograph", ["Ham", "Egg", "Jam"], [3, 6, 5], { icon: "\u25CF", success: "Egg's six leads; Ham's three trails \u2014 most and fewest, drawn." }) },
  ["Most means the biggest count.", "Fewest means the smallest.", "Position never decides \u2014 counts do."],
  "next: telling the whole story.")
def(12, 3,
  "Data tells a story: who got the most, who got the fewest, how many in all. True sentences match the counts.",
  "Check every claim against the graph before believing it \u2014 the counts are the judges.",
  { body: "Read the story's source.", rep: "diagram",
    widget: () => read("The story starts here: how many votes does this tally row for Cats show? Move the marker.", "tally", 8, "Cats", "vote",
      { traps: [[5, "That reads only the crossed five-group. Three single marks follow it: 6, 7, 8."], [3, "That counts only the singles and skips the five-group entirely."]],
        success: "One five-group and three singles \u2014 8 votes. Now the story about Cats can be checked." }),
    predict: P("A classmate says \u201CCats got the most votes\u201D. How do you check the claim?",
      [{ id: "counts", label: "Compare every category's count" }, { id: "trust", label: "Believe it \u2014 they sound sure" }, { id: "first", label: "See which row is listed first" }], "counts",
      "Claims about data are checked against the counts, not confidence or position. The biggest count decides \u201Cmost.\u201D") },
  interpret(["Cats", "Dogs", "Fish"], [8, 5, 3]), interpret(["Sun", "Rain", "Snow"], [9, 4, 2]), interpret(["Ants", "Bees", "Moths"], [2, 7, 4]), interpret(["Oak", "Pine", "Elm"], [5, 8, 3]),
  { body: "Draw the story you told.", widget: () => build("Build the graph the story described: Cats 8, Dogs 5, Fish 3.", "bar", ["Cats", "Dogs", "Fish"], [8, 5, 3], { maxVal: 10, success: "Eight, five, three \u2014 the story and the graph agree." }) },
  ["Data tells a checkable story.", "True sentences match the counts.", "The counts are the judges."],
  "next course: comparing lengths and measuring.")

// ——— assembly ———
must(L.length === 12, "12 lessons defined");
const chapters = [
  { id: "ch1-sort-and-tally", title: "Sort and Tally", lessonIds: [] },
  { id: "ch2-picture-and-bar-graphs", title: "Picture and Bar Graphs", lessonIds: [] },
  { id: "ch3-what-the-data-says", title: "What the Data Says", lessonIds: [] },
];
const chCount = [0, 0, 0];
const outDir = join(root, "content/courses/data-graphs-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });
const lessonIds = [];

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
  const id = `dgr1-0${d.ch}-0${seq}`;
  lessonIds.push(id);
  chapters[d.ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const check = (sid, pack, kind = "check") => ({
    id: sid, kind, body: pack.body, conceptTag: tag,
    explanationVariants: pack.ev, widget: pack.widget, hints: pack.hints,
    variant: pack.variant, cml: cml(tag, "diagram"),
  });
  const i1w = d.i1.widget();
  const i2w = d.i2.widget();
  const lesson = {
    id, slug, title: row.title, courseId: "data-graphs-g1",
    chapterId: chapters[d.ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "bar-compare", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      check("k1", d.k1),
      { id: "c2", kind: "concept", figure: "bar-compare", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: d.i2.body, conceptTag: tag, widget: i2w, cml: cml(tag, "diagram") },
      check("k2", d.k2),
      check("k3", d.k3),
      check("ch1", d.ch1, "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: {
        id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.k1.ev,
        widget: d.k1.widget.type === "numeric"
          ? { ...d.k1.widget, commonErrors: d.k1.widget.commonErrors.slice(0, 2) }
          : d.k1.widget,
      },
    }],
  };
  // structural asserts
  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "barBuilder") {
      must(w.target.every((t) => t <= w.maxVal), `${id}/${s.id} bar target within max`);
      must(["bar", "tally", "pictograph"].includes(w.display), `${id}/${s.id} display`);
    }
    if (w.type === "graphRead") {
      must(w.drawn <= w.scaleMax, `${id}/${s.id} drawn within scale`);
      for (const t of w.commonResults) must(t.value !== w.drawn, `${id}/${s.id} read trap`);
    }
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
    if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1 && (w.options.length === 3 || w.options.length === 4), `${id}/${s.id} mcq`);
    if (w.type === "dragBucket") must(w.items.length >= 2 && w.buckets.length >= 2, `${id}/${s.id} bucket`);
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(s.variant.gen === "g1-data", `${id}/${s.id} variant tag`);
  }
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget type ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c) => c === 4), "3 chapters x 4 lessons");
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "data-graphs-g1", slug: "data-graphs-g1", title: spec.title,
  tagline: "Ask a question, sort the answers, tally them fast, and draw graphs that tell the story.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons + course.json; ${asserts} internal assertions all passed`);
console.log("ids:", lessonIds.join(" "));
