#!/usr/bin/env node
// S189: build add-subtract-10-k (20 lessons) — the largest K course in the K5 spec, and the
// first Kindergarten content to feed the item-grain fluency architecture: its five K.OA.A.5
// lessons carry additive factFamily keys, so sums within 5 land in the same leech box
// (Profile.factItems) that Grade-2 and Grade-3 fluency already use.
//
// Same factory contract as its five predecessors: per-lesson packs, the 9-step A-tier shape
// (c1 · i1+predict · k1 · c2 · i2 · k2 · k3 · ch1 · r1) + a remedial derived from k1, every
// number derived and asserted abort-before-write.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "add-subtract-10-k");
if (!spec || spec.lessons.length !== 20) throw new Error("spec course missing or wrong size");

const CAP = 10;
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
const inCap = (...ns) => ns.forEach((n) => must(Number.isInteger(n) && n >= 0 && n <= CAP, `out of K cap: ${n}`));
const sfam = (a, b) => `${Math.min(a, b)}+${Math.max(a, b)}`;

/* ------------------------------------------------------------------ widget builders */

function frame(prompt, target, preFilled, success, traps = []) {
  inCap(target, preFilled);
  must(target >= 1 && target <= 10, `tenFrame target ${target}`);
  // preFilled must be strictly less than target: an already-complete frame gives the learner
  // nothing to do, which the pedagogy linter rejects. Caught here so it never reaches the gate.
  must(preFilled >= 0 && preFilled < target, `tenFrame preFilled ${preFilled} must be < target ${target}`);
  for (const [count, feedback] of traps) {
    must(count !== target && count >= 0 && count <= 10, `frame trap ${count}`);
    must(feedback.length >= 25, `frame trap feedback short`);
  }
  return {
    type: "tenFrame", prompt, target, preFilled, addColor: "tangerine",
    commonCounts: traps.map(([count, feedback]) => ({ count, feedback })),
    missFeedback: "Fill one square at a time, counting as you go, until the frame shows the number you need.",
    successFeedback: success,
  };
}

function hop(prompt, start, hops, direction, success, traps = []) {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hops;
  inCap(start, land);
  const pts = [start, land, ...traps.map((t) => t[0])];
  const min = Math.max(0, Math.min(...pts) - 1);
  const max = Math.min(CAP, Math.max(...pts) + 1);
  must(land >= min && land <= max, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value} (land ${land}, ${min}..${max})`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return {
    type: "numberLineHop", prompt, min, max, start, hop: 1, hops, direction,
    commonLandings,
    missFeedback: `Start at ${start} and count ${direction === "back" ? "back" : "on"} ${hops === 1 ? "one" : hops}: you land on ${land}.`,
    successFeedback: success,
  };
}

function numeric(prompt, answer, traps, fallback, success) {
  inCap(answer);
  const commonErrors = traps.map(([value, feedback]) => {
    must(value !== answer, `numeric trap equals answer ${value}: ${prompt}`);
    must(Number.isInteger(value) && value >= 0, `numeric trap negative/non-int ${value}`);
    must(feedback.length >= 25, `numeric trap feedback short: ${prompt}`);
    return { value, feedback };
  });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `numeric traps distinct: ${prompt}`);
  return { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback: fallback, successFeedback: success };
}

function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  for (const o of opts) must(o.feedback.length >= 25, `mcq feedback short: ${prompt}`);
  // Same reasoning as the generator (S189): these K prompts embed single-digit numbers, so
  // prompt.length is constant across sibling checks and the correct option would park in one
  // slot for the whole lesson. Fold the digits in so the rotation actually varies.
  const rotKey = prompt.length + [...prompt].reduce((t, ch) => t + (ch >= "0" && ch <= "9" ? ch.charCodeAt(0) : 0), 0);
  const rot = rotKey % opts.length;
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
  fadeLevel: 0, transferFamily: `add-subtract-10-k:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});

const V = (form, family) => (family ? { gen: "k0-add-subtract", form, factFamily: family } : { gen: "k0-add-subtract", form });
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* -------------------------------------------------------------- reusable check packs */

const joinPack = (a, b, thing) => {
  const one = { apples: "apple", blocks: "block", ducks: "duck", bears: "bear" }[thing];
  const n = (x) => `${x} ${x === 1 ? one : thing}`;
  must(a + b <= CAP, `join ${a}+${b} over cap`);
  return {
    body: "Put the groups together.",
    ev: [`${a} and ${b} together make ${a + b}.`, `Counting every object in both groups gives ${a + b}.`],
    widget: numeric(`One group has ${n(a)}. Another group has ${n(b)}. Put them together. How many ${thing} in all?`, a + b,
      [[a, `That counts only the first group. Putting together means counting BOTH groups.`],
       [Math.abs(a - b), `That compares the groups instead of joining them. Count every object in both groups.`]],
      `Count every object in both groups, one at a time.`,
      `Correct — ${a} and ${b} together make ${a + b}.`),
    hints: [`Count both groups.`, `Start at ${a} and count on ${b}.`, `${a} and ${b} make ${a + b}.`],
    variant: V("KoaJoinNumeric"),
  };
};

const takeAwayPack = (total, away) => {
  must(away >= 1 && away < total && total <= CAP, `takeaway ${total}-${away}`);
  return {
    body: "Take some away.",
    ev: [`${total} take away ${away} leaves ${total - away}.`, `Crossing off ${away} of the ${total} leaves ${total - away}.`],
    widget: numeric(`There are ${total} cookies. You eat ${away}. How many cookies are left?`, total - away,
      [[total, `That is how many there were BEFORE eating. ${away} are gone now.`],
       [away, `That counts the cookies eaten, not the ones left on the plate.`]],
      `Start at ${total} and count back ${away}.`,
      `Correct — ${total} take away ${away} leaves ${total - away}.`),
    hints: [`Count back from ${total}.`, `Take away ${away}.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaTakeAwayNumeric"),
  };
};

const sums5Pack = (a, b) => {
  must(a + b <= 5 && a >= 1 && b >= 1, `sums5 ${a}+${b}`);
  return {
    body: "Recall the sum.",
    ev: [`${a} + ${b} = ${a + b}.`, `${a} and ${b} more makes ${a + b}.`],
    widget: numeric(`${a} + ${b} = ?`, a + b,
      [[a + b - 1, `That stops one short. Count on ${b} from ${a} and land on ${a + b}.`],
       [Math.abs(a - b), `That finds the difference instead of the total.`]],
      `Count on from the bigger number.`,
      `Correct — ${a} + ${b} = ${a + b}.`),
    hints: [`Start at ${a}.`, `Count on ${b}.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaSums5Numeric", sfam(a, b)),
  };
};

const diffs5Pack = (total, away) => {
  must(total <= 5 && away >= 1 && away < total, `diffs5 ${total}-${away}`);
  return {
    body: "Recall the difference.",
    ev: [`${total} − ${away} = ${total - away}.`, `Taking ${away} from ${total} leaves ${total - away}.`],
    widget: numeric(`${total} − ${away} = ?`, total - away,
      [[total, `That repeats the starting number instead of taking ${away} away.`],
       [away, `That repeats the number taken away, not the number left.`]],
      `Count back ${away} from ${total}.`,
      `Correct — ${total} − ${away} = ${total - away}.`),
    hints: [`Start at ${total}.`, `Count back ${away}.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaDiffs5Numeric", sfam(away, total - away)),
  };
};

const plusMinusOnePack = (n, plus) => {
  must(n >= 1 && n <= (plus ? 9 : 10), `plusMinusOne ${n}`);
  if (plus) return {
    body: "One more.",
    ev: [`One more than ${n} is ${n + 1}.`, `Adding one moves to the next counting number.`],
    widget: numeric(`${n} + 1 = ?`, n + 1,
      [[n, `Adding one moves to the NEXT number, so it does not stay ${n}.`],
       [n + 2, `That counts on two. Adding one moves exactly one step.`]],
      `Say the next counting number after ${n}.`,
      `Correct — one more than ${n} is ${n + 1}.`),
    hints: [`Adding one is the next number.`, `What comes after ${n}?`, `${n} + 1 = ${n + 1}.`],
    variant: V("KoaPlusMinusOneNumeric", sfam(n, 1)),
  };
  return {
    body: "One less.",
    ev: [`One less than ${n} is ${n - 1}.`, `Taking one away moves back one counting number.`],
    widget: numeric(`${n} − 1 = ?`, n - 1,
      [[n, `Taking one away moves to the number BEFORE, so it does not stay ${n}.`],
       [n + 1, `That adds one instead of taking one away.`]],
      `Say the counting number just before ${n}.`,
      `Correct — one less than ${n} is ${n - 1}.`),
    hints: [`Taking one is the number before.`, `What comes before ${n}?`, `${n} − 1 = ${n - 1}.`],
    variant: V("KoaPlusMinusOneNumeric", sfam(1, n - 1)),
  };
};

const zeroPack = (n, plus) => ({
  body: "Zero changes nothing.",
  ev: [`Adding or taking away zero leaves ${n} unchanged.`, `Zero means no objects moved, so the count stays ${n}.`],
  widget: numeric(plus ? `${n} + 0 = ?` : `${n} − 0 = ?`, n,
    [[0, `Zero does not empty the group — nothing moved, so ${n} remain.`],
     plus ? [n + 1, `Zero means NO objects were added, so the total does not grow.`]
          : [n - 1 >= 0 ? n - 1 : n + 1, `Zero means NO objects were taken, so the total does not shrink.`]],
    `Zero means nothing was added or taken away.`,
    `Correct — ${plus ? "adding" : "taking away"} zero changes nothing: ${n}.`),
  hints: [`Zero means none.`, `Nothing moved.`, `The answer is ${n}.`],
  variant: V("KoaZeroFactNumeric", sfam(n, 0)),
});

const speedyPack = (a, b, sub) => {
  if (sub) {
    must(a <= 5 && b >= 1 && b < a, `speedy sub ${a}-${b}`);
    return {
      body: "Answer fast.",
      ev: [`${a} − ${b} = ${a - b}.`, `Known differences within 5 come back without counting.`],
      widget: numeric(`Answer fast: ${a} − ${b} = ?`, a - b,
        [[a, `That repeats the starting number instead of taking ${b} away.`],
         [b, `That repeats the number taken away, not the number left.`]],
        `Count back ${b} from ${a}.`,
        `Correct — ${a} − ${b} = ${a - b}.`),
      hints: [`Count back.`, `${a} take away ${b}.`, `${a} − ${b} = ${a - b}.`],
      variant: V("KoaSpeedy5Numeric", sfam(b, a - b)),
    };
  }
  must(a + b <= 5 && a >= 1 && b >= 1, `speedy add ${a}+${b}`);
  return {
    body: "Answer fast.",
    ev: [`${a} + ${b} = ${a + b}.`, `Known sums within 5 come back without counting.`],
    widget: numeric(`Answer fast: ${a} + ${b} = ?`, a + b,
      [[a + b - 1, `That stops one count short of ${a + b}.`],
       [Math.abs(a - b), `That finds the difference between ${a} and ${b} instead of their total.`]],
      `Count on from the bigger number.`,
      `Correct — ${a} + ${b} = ${a + b}.`),
    hints: [`Count on.`, `${a} and ${b} more.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaSpeedy5Numeric", sfam(a, b)),
  };
};

const chooseOpPack = (a, b, add) => (add ? {
  body: "Add or take away?",
  ev: [`More arriving means the group grows, so add.`, `Joining groups is addition.`],
  widget: mcq(`${a} ducks swim in a pond. ${b} more ducks swim over. What should you do to find how many ducks are in the pond?`,
    ["Add", `Correct — more ducks arriving means the group grows, so add.`],
    [["Subtract", `Subtracting would make the group smaller, but these ducks ARRIVED.`],
     ["Count only the new ducks", `That leaves out the ${a} ducks already swimming there.`]]),
  hints: [`Did the group grow or shrink?`, `More ducks came.`, `Add.`],
  variant: V("KoaChooseOpMcq"),
} : {
  body: "Add or take away?",
  ev: [`Leaving means the group shrinks, so subtract.`, `Taking from a group is subtraction.`],
  widget: mcq(`${a + b} ducks swim in a pond. ${b} ducks fly away. What should you do to find how many ducks are left?`,
    ["Subtract", `Correct — ducks leaving means the group shrinks, so subtract.`],
    [["Add", `Adding would make the group bigger, but these ducks LEFT.`],
     ["Count only the ducks that flew away", `That counts what is gone, not what is still on the pond.`]]),
  hints: [`Did the group grow or shrink?`, `Ducks flew away.`, `Subtract.`],
  variant: V("KoaChooseOpMcq"),
});

const writeAddPack = (a, b) => {
  must(a + b <= CAP, `writeAdd ${a}+${b}`);
  return {
    body: "Write the sentence.",
    ev: [`Joining is written with a plus sign: ${a} + ${b} = ${a + b}.`, `The sentence records what happened to the group.`],
    widget: mcq(`${a} birds sit on a branch. ${b} more birds land. Which sentence shows this?`,
      [`${a} + ${b} = ${a + b}`, `Correct — joining ${a} and ${b} is written with a plus sign, and the total is ${a + b}.`],
      [[`${a} − ${b} = ${a - b >= 0 ? a - b : 0}`, `The minus sign means taking away, but these birds are ARRIVING.`],
       [`${a} + ${b} = ${a + b + 1}`, `The plus sign is right, but the total is off by one — count again: ${a + b}.`],
       [`${b} + ${a} = ${a + b + 1}`, `Either order gives the same total, but that total is wrong: ${b} and ${a} make ${a + b}.`]]),
    hints: [`Did birds arrive or leave?`, `Arriving means plus.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaWriteAddMcq"),
  };
};

const writeSubPack = (total, away) => {
  must(away >= 1 && away < total, `writeSub ${total}-${away}`);
  return {
    body: "Write the sentence.",
    ev: [`Taking away is written with a minus sign: ${total} − ${away} = ${total - away}.`, `The sentence records the frogs leaving.`],
    widget: mcq(`${total} frogs sit on a log. ${away} hop away. Which sentence shows this?`,
      [`${total} − ${away} = ${total - away}`, `Correct — hopping away is taking away, written with a minus sign.`],
      [[`${total} + ${away} = ${total + away}`, `The plus sign means more frogs arrived, but these frogs LEFT.`],
       [`${total} − ${away} = ${total - away + 1}`, `The minus sign is right, but the answer is one too many — count again.`]]),
    hints: [`Did frogs arrive or leave?`, `Leaving means minus.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaWriteSubMcq"),
  };
};

const putTogetherPack = (a, b) => {
  must(a + b <= CAP, `putTogether ${a}+${b}`);
  return {
    body: "Both parts, one bowl.",
    ev: [`${a} red and ${b} green make ${a + b} grapes.`, `Both colors sit in the same bowl, so count them all.`],
    widget: numeric(`A bowl has ${a} red grapes and ${b} green grapes. How many grapes are in the bowl?`, a + b,
      [[a, `That counts the red grapes only. Both colors are in the same bowl.`],
       [Math.abs(a - b), `That compares the two colors. "How many in the bowl" counts them all together.`]],
      `Count both colors together.`,
      `Correct — ${a} red and ${b} green make ${a + b} grapes in all.`),
    hints: [`Count both colors.`, `${a} and ${b} more.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaPutTogetherNumeric"),
  };
};

const storyAddPack = (a, b, thing) => {
  const one = { apples: "apple", blocks: "block", bears: "bear" }[thing];
  must(a + b <= CAP, `storyAdd ${a}+${b}`);
  return {
    body: "The basket grows.",
    ev: [`${a} plus ${b} more makes ${a + b}.`, `Adding to a group makes it bigger.`],
    widget: numeric(`A basket holds ${a} ${a === 1 ? one : thing}. Someone puts in ${b} more. How many ${thing} are in the basket now?`, a + b,
      [[a, `That is the number before anything was added.`],
       [b, `That counts only what was put in. The basket already held ${a}.`]],
      `Start at ${a} and count on ${b}.`,
      `Correct — ${a} plus ${b} more makes ${a + b}.`),
    hints: [`The basket got fuller.`, `Count on ${b} from ${a}.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaAddToStoryNumeric"),
  };
};

const storySubPack = (total, away, thing) => {
  const one = { apples: "apple", blocks: "block", bears: "bear" }[thing];
  must(away >= 1 && away <= total - 2, `storySub ${total}-${away}`);
  return {
    body: "The basket empties.",
    ev: [`${total} take away ${away} leaves ${total - away}.`, `Taking from a group makes it smaller.`],
    widget: numeric(`A basket holds ${total} ${total === 1 ? one : thing}. Someone takes out ${away}. How many ${thing} are in the basket now?`, total - away,
    // When exactly half is removed, "what was removed" EQUALS what remains, so that trap would
    // be the right answer. Swap in an off-by-one count-back diagnosis for that case.
      [[total, `That is the number before any were taken out.`],
       away !== total - away
         ? [away, `That counts what was removed, not what remains in the basket.`]
         : [total - away + 1, `That counts back one too few. Take away all ${away} to land on ${total - away}.`]],
      `Start at ${total} and count back ${away}.`,
      `Correct — ${total} take away ${away} leaves ${total - away}.`),
    hints: [`The basket got emptier.`, `Count back ${away} from ${total}.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaTakeFromStoryNumeric"),
  };
};

const modelStoryPack = (a, b) => ({
  body: "Which drawing?",
  ev: [`Crossing out shows the ${b} cats that left.`, `A drawing must show both the start and the change.`],
  widget: mcq(`"${a} cats sit on a wall. ${b} jump down." Which drawing shows this story?`,
    [`${a} cats drawn, with ${b} crossed out`, `Correct — crossing out shows the ${b} cats that jumped down and left.`],
    [[`${a} cats drawn, with ${b} more added`, `Adding more cats would show cats ARRIVING, but these cats left.`],
     [`${a + b} cats drawn, none crossed out`, `That draws the wrong starting number and never shows the cats leaving.`]]),
  hints: [`How many started?`, `What happened to them?`, `Draw ${a}, cross out ${b}.`],
  variant: V("KoaModelStoryMcq"),
});

const fingersPack = (a, b) => {
  must(a >= 1 && a <= 5 && b >= 1 && b <= 5, `fingers ${a},${b}`);
  return {
    body: "Count the fingers.",
    ev: [`${a} fingers and ${b} fingers make ${a + b}.`, `Both hands together show the total.`],
    // The "fingers still down" trap (10 - total) can coincide with the "one hand only" trap (a) —
    // e.g. 4 + 2 makes both 4. Fall back to a count-off-by-one diagnosis so both traps stay
    // distinct AND each still names a different real mistake.
    widget: numeric(`Hold up ${a} fingers on one hand and ${b} on the other. How many fingers are up?`, a + b,
      [[a, `That counts one hand only. Count the fingers on BOTH hands.`],
       10 - (a + b) !== a
         ? [10 - (a + b), `That counts the fingers still DOWN. The question asks how many are up.`]
         : [a + b - 1, `That stops one finger short. Touch each raised finger once as you count.`]],
      `Count every raised finger, one at a time.`,
      `Correct — ${a} fingers and ${b} fingers make ${a + b}.`),
    hints: [`Count both hands.`, `Start at ${a}.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaFingersNumeric"),
  };
};

const drawingsPack = (a, b) => {
  must(a + b <= CAP, `drawings ${a}+${b}`);
  return {
    body: "Count the circles.",
    ev: [`${a} circles and ${b} more make ${a + b}.`, `Every circle on the page counts.`],
    widget: numeric(`Draw ${a} circles. Then draw ${b} more circles. How many circles did you draw?`, a + b,
      [[a, `That counts only the first drawing. The ${b} new circles count too.`],
       [b, `That counts only the circles drawn second. Count every circle on the page.`]],
      `Count every circle you drew.`,
      `Correct — ${a} circles and ${b} more make ${a + b}.`),
    hints: [`Count them all.`, `${a} then ${b} more.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaDrawingsNumeric"),
  };
};

const actOutPack = (a, b) => {
  must(a + b <= CAP, `actOut ${a}+${b}`);
  return {
    body: "More children join.",
    ev: [`${a} children and ${b} more make ${a + b}.`, `Joining makes the group bigger.`],
    widget: numeric(`${a} children are playing. ${b} more children join them. How many children are playing now?`, a + b,
      [[a, `That is how many started. ${b} more joined, so the group grew.`],
       [a - b >= 0 ? a - b : a + 1, `That takes children away. "Join" means MORE children, so the total goes up.`]],
      `Start at ${a} and count on ${b}.`,
      `Correct — ${a} children and ${b} more make ${a + b}.`),
    hints: [`Did the group grow?`, `Count on ${b}.`, `${a} + ${b} = ${a + b}.`],
    variant: V("KoaActOutNumeric"),
  };
};

const subActOutPack = (total, away) => {
  must(away >= 1 && away < total, `subActOut ${total}-${away}`);
  return {
    body: "Some go home.",
    ev: [`${total} children with ${away} gone leaves ${total - away}.`, `Leaving makes the group smaller.`],
    widget: numeric(`${total} children are playing. ${away} go home. How many children are still playing?`, total - away,
      [[total, `That is how many started. ${away} have left, so fewer are playing now.`],
       [away, `That counts the children who went home, not the ones still playing.`]],
      `Start at ${total} and count back ${away}.`,
      `Correct — ${total} children with ${away} gone leaves ${total - away}.`),
    hints: [`Did the group shrink?`, `Count back ${away}.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaSubActOutNumeric"),
  };
};

const subDrawingsPack = (total, away) => {
  must(away >= 1 && away < total, `subDrawings ${total}-${away}`);
  return {
    body: "Cross some out.",
    ev: [`${total} circles with ${away} crossed out leaves ${total - away}.`, `The plain circles are what is left.`],
    widget: numeric(`Draw ${total} circles, then cross out ${away}. How many circles are NOT crossed out?`, total - away,
      [[away, `That counts the crossed-out circles. The question asks about the ones still plain.`],
       [total, `That counts every circle drawn, including the crossed-out ones.`]],
      `Count only the circles with no cross on them.`,
      `Correct — ${total} circles with ${away} crossed out leaves ${total - away}.`),
    hints: [`Count the plain ones.`, `Skip the crossed ones.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaSubDrawingsNumeric"),
  };
};

const howManyLeftPack = (total, away) => {
  must(away >= 2 && away < total, `howManyLeft ${total}-${away}`);
  return {
    body: "What is left?",
    ev: [`${total} balloons with ${away} gone leaves ${total - away}.`, `Each balloon that floats away is one fewer held.`],
    widget: numeric(`${total} balloons float away one at a time until ${away} have gone. How many balloons are left?`, total - away,
      [[away, `That counts the balloons that floated away, not the ones still held.`],
       [total, `That is the starting number. ${away} have gone since then.`]],
      `Start at ${total} and count back ${away}.`,
      `Correct — ${total} balloons with ${away} gone leaves ${total - away}.`),
    hints: [`Count back from ${total}.`, `${away} floated off.`, `${total} − ${away} = ${total - away}.`],
    variant: V("KoaHowManyLeftNumeric"),
  };
};

/* ------------------------------------------------------------------ lesson definitions */

const L = [];
const def = (n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  L.push({ n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

// ---- Chapter 1: Putting Together (lessons 1-5) ----
def(1, 1,
  "When two groups come together, count every object in both groups to find how many there are in all.",
  "Nothing is left out and nothing is counted twice — every object gets exactly one number.",
  { body: "Fill the frame.", rep: "diagram",
    widget: () => frame("Fill the frame to show 3 counters, then 2 more. How many in all?", 5, 0,
      "Five squares filled — 3 and 2 together make 5.",
      [[3, "That fills only the first group. Two more counters still need a square each."],
       [2, "That fills only the second group. The first 3 counters count too."]]),
    predict: P("One group has 3 blocks. Another has 2. What happens when you put them together?",
      [{ id: "more", label: "There will be more than 3" }, { id: "same", label: "There will still be 3" }, { id: "fewer", label: "There will be fewer than 3" }], "more",
      "Putting groups together always makes MORE, because the second group's objects join the first.") },
  joinPack(3, 2, "blocks"), joinPack(4, 3, "apples"), joinPack(2, 5, "ducks"), joinPack(5, 4, "bears"),
  { body: "Fill a bigger frame.", widget: () => frame("Fill the frame to show 4 counters, then 3 more.", 7, 0, "Seven filled — 4 and 3 make 7.") },
  ["Putting together means counting both groups.", "Every object gets one number.", "The total is bigger than either group."],
  "next: adding with your fingers.");

def(2, 1,
  "Your fingers are always with you. Hold up one group on one hand and the other group on the other hand.",
  "Then count every raised finger, starting from one, to find the total.",
  { body: "Show it on the frame.", rep: "diagram",
    widget: () => frame("Show 4 fingers and 2 fingers on the frame. How many in all?", 6, 0,
      "Six filled — 4 and 2 make 6.",
      [[4, "That shows one hand only. The other hand's 2 fingers count too."]]),
    predict: P("You hold up 4 fingers on one hand and 2 on the other. How many are up?",
      [{ id: "six", label: "6 — count both hands" }, { id: "four", label: "4 — the bigger hand" }, { id: "two", label: "2 — the smaller hand" }], "six",
      "Both hands count. Starting from one and counting every raised finger gives 6.") },
  fingersPack(4, 2), fingersPack(3, 3), fingersPack(5, 1), fingersPack(2, 4),
  { body: "Another finger count.", widget: () => frame("Show 3 fingers and 3 fingers on the frame.", 6, 0, "Six filled — 3 and 3 make 6.") },
  ["Fingers are a counting tool.", "One group per hand.", "Count every raised finger."],
  "next: adding with drawings.");

def(3, 1,
  "A drawing keeps a group still so you can count it carefully.",
  "Draw the first group, then draw the second group beside it, then count everything you drew.",
  { body: "Count the drawing.", rep: "diagram",
    widget: () => frame("Draw 2 circles, then 4 more. Show the total on the frame.", 6, 0,
      "Six filled — 2 circles and 4 more make 6.",
      [[2, "That counts only the first drawing. The 4 new circles count too."]]),
    predict: P("You draw 2 circles, then draw 4 more. How many circles are on the page?",
      [{ id: "six", label: "6 — all of them" }, { id: "four", label: "4 — the new ones" }, { id: "two", label: "2 — the first ones" }], "six",
      "Every circle on the page counts, whether you drew it first or second: 6 in all.") },
  drawingsPack(2, 4), drawingsPack(5, 3), drawingsPack(3, 4), drawingsPack(6, 2),
  { body: "Draw more.", widget: () => frame("Draw 5 circles, then 3 more. Show the total.", 8, 0, "Eight filled — 5 and 3 make 8.") },
  ["Drawings hold a group still.", "Draw both groups.", "Count every mark on the page."],
  "next: acting out a sum.");

def(4, 1,
  "A sum can be acted out: start with a group of children, then let more children join them.",
  "The group grows as each child joins, so the total is larger than the group you started with.",
  { body: "Hop to the total.", rep: "diagram",
    widget: () => hop("3 children are playing. 2 more join. Hop to show how many are playing now.", 3, 2, "forward",
      "Landed on 5 — 3 children and 2 more make 5.",
      [[3, "That never moved. Two more children joined, so the count grows past 3."],
       [4, "That hopped only once. Two children joined, so hop twice."]]),
    predict: P("3 children are playing. 2 more join. Which way does the count move?",
      [{ id: "up", label: "Up — the group grows" }, { id: "down", label: "Down — the group shrinks" }, { id: "still", label: "It stays at 3" }], "up",
      "Children joining makes the group bigger, so the count moves up the number line.") },
  actOutPack(3, 2), actOutPack(4, 4), actOutPack(6, 3), actOutPack(2, 6),
  { body: "Act out another.", widget: () => hop("4 children are playing. 4 more join. Hop to the new total.", 4, 4, "forward", "Landed on 8 — 4 and 4 make 8.") },
  ["Acting out shows the change.", "Joining makes the group grow.", "Count on from the start."],
  "next: writing it down.");

def(5, 1,
  "A number sentence records what happened. The plus sign means groups came together.",
  "The equals sign says both sides name the same amount: 3 + 2 and 5 are the same number.",
  { body: "Match the sentence.", rep: "diagram",
    widget: () => frame("Show 3 + 2 on the frame.", 5, 0, "Five filled — that is what 3 + 2 = 5 records.",
      [[3, "That shows only the 3. The sentence adds 2 more to it."]]),
    predict: P("Birds are ARRIVING on a branch. Which sign will the sentence use?",
      [{ id: "plus", label: "Plus — more are coming" }, { id: "minus", label: "Minus — some are leaving" }, { id: "none", label: "No sign is needed" }], "plus",
      "Arriving means the group grows, and growth is written with a plus sign.") },
  writeAddPack(3, 2), joinPack(5, 4, "blocks"), writeAddPack(2, 6), joinPack(4, 3, "apples"),
  { body: "Show another sentence.", widget: () => frame("Show 4 + 3 on the frame.", 7, 0, "Seven filled — 4 + 3 = 7.") },
  ["A sentence records the action.", "Plus means joining.", "Equals means the same amount."],
  "next: taking some away.");

// ---- Chapter 2: Taking Away (lessons 6-10) ----
def(6, 2,
  "Taking away removes objects from a group. What is left is always less than what you started with.",
  "Count what remains, not what was removed — those are two different numbers.",
  { body: "Hop back.", rep: "diagram",
    widget: () => hop("There are 7 cookies. You eat 3. Hop back to show how many are left.", 7, 3, "back",
      "Landed on 4 — 7 take away 3 leaves 4.",
      [[7, "That never moved. Three cookies are gone, so the count drops below 7."],
       [3, "That is how many were eaten, not how many are left."]]),
    predict: P("There are 7 cookies and you eat 3. Which way does the count move?",
      [{ id: "down", label: "Down — cookies are gone" }, { id: "up", label: "Up — more cookies" }, { id: "still", label: "It stays at 7" }], "down",
      "Eating removes cookies, so the count moves DOWN the number line, from 7 to 4.") },
  takeAwayPack(7, 3), takeAwayPack(9, 4), takeAwayPack(6, 2), takeAwayPack(10, 6),
  { body: "Take away more.", widget: () => hop("There are 9 cookies. You eat 4. Hop back to the total left.", 9, 4, "back", "Landed on 5 — 9 take away 4 leaves 5.") },
  ["Taking away makes less.", "Count what is left.", "What is gone is a different number."],
  "next: showing it with drawings.");

def(7, 2,
  "To show taking away in a drawing, cross out the objects that leave.",
  "The crossed-out marks stay on the page as a record, but only the plain ones are still in the group.",
  { body: "Cross some out.", rep: "diagram",
    widget: () => hop("Draw 8 circles and cross out 3. Hop back to show how many are plain.", 8, 3, "back",
      "Landed on 5 — 8 circles with 3 crossed out leaves 5 plain.",
      [[3, "That counts the crossed-out circles. Count the plain ones instead."]]),
    predict: P("You draw 8 circles and cross out 3. How many are NOT crossed out?",
      [{ id: "five", label: "5 — the plain ones" }, { id: "three", label: "3 — the crossed ones" }, { id: "eight", label: "8 — all of them" }], "five",
      "The crossed circles have left the group. Counting only the plain ones gives 5.") },
  subDrawingsPack(8, 3), subDrawingsPack(6, 4), subDrawingsPack(9, 2), subDrawingsPack(7, 5),
  { body: "Cross out again.", widget: () => hop("Draw 6 circles and cross out 4. Hop to the plain count.", 6, 4, "back", "Landed on 2 — 6 with 4 crossed out leaves 2.") },
  ["Crossing out shows leaving.", "Count the plain marks.", "Crossed marks are no longer in the group."],
  "next: acting out a take-away.");

def(8, 2,
  "A take-away can be acted out too: children stop playing and go home, one at a time.",
  "Each child leaving makes the playing group one smaller.",
  { body: "Watch them leave.", rep: "diagram",
    widget: () => hop("6 children are playing. 2 go home. Hop back to show how many still play.", 6, 2, "back",
      "Landed on 4 — 6 children with 2 gone leaves 4.",
      [[6, "That never moved. Two children left, so fewer are playing."],
       [2, "That counts the children who went home, not the ones still playing."]]),
    predict: P("6 children are playing and 2 go home. What happens to the playing group?",
      [{ id: "smaller", label: "It gets smaller" }, { id: "bigger", label: "It gets bigger" }, { id: "same", label: "It stays the same" }], "smaller",
      "Children leaving makes the playing group smaller: 6 drops to 4.") },
  subActOutPack(6, 2), subActOutPack(8, 3), subActOutPack(5, 4), subActOutPack(9, 5),
  { body: "More go home.", widget: () => hop("8 children are playing. 3 go home. Hop back.", 8, 3, "back", "Landed on 5 — 8 with 3 gone leaves 5.") },
  ["Acting out shows the leaving.", "The group shrinks.", "Count who is still there."],
  "next: writing a subtraction sentence.");

def(9, 2,
  "The minus sign records taking away, just as the plus sign records joining.",
  "The first number is what you started with, and the second is what left.",
  { body: "Show the take-away.", rep: "diagram",
    widget: () => hop("Show 7 − 2 by hopping back from 7.", 7, 2, "back", "Landed on 5 — that is what 7 − 2 = 5 records.",
      [[7, "That never moved. The minus sign says 2 must come off."]]),
    predict: P("Frogs are HOPPING AWAY from a log. Which sign will the sentence use?",
      [{ id: "minus", label: "Minus — some are leaving" }, { id: "plus", label: "Plus — more are coming" }, { id: "none", label: "No sign is needed" }], "minus",
      "Leaving makes the group smaller, and shrinking is written with a minus sign.") },
  writeSubPack(7, 2), writeSubPack(9, 3), writeSubPack(5, 1), writeSubPack(8, 6),
  { body: "Show another.", widget: () => hop("Show 9 − 3 by hopping back from 9.", 9, 3, "back", "Landed on 6 — 9 − 3 = 6.") },
  ["Minus records taking away.", "The first number is the start.", "The second number is what left."],
  "next: how many are left?");

def(10, 2,
  "Whatever the story, the question \"how many are left?\" always asks about what remains.",
  "Start at the number you had and count back once for each object that goes.",
  { body: "Count them down.", rep: "diagram",
    widget: () => hop("10 balloons float away until 4 have gone. Hop back to show how many are left.", 10, 4, "back",
      "Landed on 6 — 10 balloons with 4 gone leaves 6.",
      [[4, "That counts the balloons that floated away, not the ones still held."]]),
    predict: P("You hold 10 balloons and 4 float away. Will you have more or fewer than 10?",
      [{ id: "fewer", label: "Fewer than 10" }, { id: "more", label: "More than 10" }, { id: "ten", label: "Still exactly 10" }], "fewer",
      "Each balloon that floats away is one fewer held, so 10 drops to 6.") },
  howManyLeftPack(10, 4), howManyLeftPack(8, 5), howManyLeftPack(9, 3), howManyLeftPack(7, 2),
  { body: "More float off.", widget: () => hop("8 balloons float away until 5 have gone. Hop back.", 8, 5, "back", "Landed on 3 — 8 with 5 gone leaves 3.") },
  ["\"How many left\" means what remains.", "Count back one per object.", "What is gone is a different number."],
  "next: stories that add to a group.");

// ---- Chapter 3: Stories and Fluency (lessons 11-20) ----
def(11, 3,
  "An add-to story starts with a group and puts more into it.",
  "The starting amount and the amount added are both known, so the total is what is missing.",
  { body: "Fill the basket.", rep: "diagram",
    widget: () => frame("A basket holds 4 apples. 3 more go in. Show the new total.", 7, 4,
      "Seven filled — 4 apples and 3 more make 7.",
      [[4, "That is the number before anything was added. Three more went in."]]),
    predict: P("A basket holds 4 apples and someone puts in 3 more. What is missing from the story?",
      [{ id: "total", label: "The new total" }, { id: "start", label: "How many it held first" }, { id: "added", label: "How many were added" }], "total",
      "The story tells you both the start (4) and what was added (3). The TOTAL is what must be worked out.") },
  storyAddPack(4, 3, "apples"), storyAddPack(5, 2, "blocks"), storyAddPack(2, 6, "bears"), storyAddPack(6, 3, "apples"),
  { body: "Fill it more.", widget: () => frame("A basket holds 5 blocks. 2 more go in. Show the total.", 7, 5, "Seven filled — 5 and 2 make 7.") },
  ["Add-to stories start with a group.", "More goes in.", "The total is what is missing."],
  "next: stories that take from a group.");

def(12, 3,
  "A take-from story starts with a group and removes part of it.",
  "The start and the amount removed are known, so what remains is the missing number.",
  { body: "Empty the basket.", rep: "diagram",
    widget: () => hop("A basket holds 8 apples. 3 are taken out. Hop back to the new total.", 8, 3, "back",
      "Landed on 5 — 8 take away 3 leaves 5.",
      [[8, "That is the number before any were taken out."],
       [3, "That counts what was removed, not what stayed in the basket."]]),
    predict: P("A basket holds 8 apples and 3 are taken out. Will the basket hold more or fewer?",
      [{ id: "fewer", label: "Fewer than 8" }, { id: "more", label: "More than 8" }, { id: "eight", label: "Still 8" }], "fewer",
      "Taking apples out leaves fewer in the basket: 8 drops to 5.") },
  storySubPack(8, 3, "apples"), storySubPack(9, 4, "blocks"), storySubPack(7, 2, "bears"), storySubPack(10, 5, "apples"),
  { body: "Take out more.", widget: () => hop("A basket holds 9 blocks. 4 are taken out. Hop back.", 9, 4, "back", "Landed on 5 — 9 take away 4 leaves 5.") },
  ["Take-from stories remove part.", "The group gets smaller.", "What remains is missing."],
  "next: put-together stories.");

def(13, 3,
  "A put-together story has two parts that were never apart — they simply make up one whole.",
  "Nothing is added or removed; the two parts are counted together to name the whole.",
  { body: "Both parts, one bowl.", rep: "diagram",
    widget: () => frame("A bowl has 3 red grapes and 4 green grapes. Show the total.", 7, 3,
      "Seven filled — 3 red and 4 green make 7 grapes.",
      [[3, "That counts the red grapes only. Both colors are in the same bowl."]]),
    predict: P("A bowl has 3 red grapes and 4 green grapes. Did anything join or leave the bowl?",
      [{ id: "neither", label: "Neither — both parts were already there" }, { id: "joined", label: "Grapes joined" }, { id: "left", label: "Grapes left" }], "neither",
      "Put-together stories have no action: the two parts already sit in one bowl, and counting them names the whole.") },
  putTogetherPack(3, 4), putTogetherPack(5, 2), putTogetherPack(4, 5), putTogetherPack(6, 3),
  { body: "Another bowl.", widget: () => frame("A bowl has 5 red grapes and 2 green grapes. Show the total.", 7, 5, "Seven filled — 5 and 2 make 7.") },
  ["Put-together stories have two parts.", "Nothing joins or leaves.", "Counting both names the whole."],
  "next: deciding which one it is.");

def(14, 3,
  "Before you can solve a story, decide what happened: did the group grow, or did it shrink?",
  "Growing means adding. Shrinking means subtracting. The words of the story tell you which.",
  { body: "Which way?", rep: "diagram",
    widget: () => hop("5 ducks swim. 2 more swim over. Hop to show the new total.", 5, 2, "forward",
      "Landed on 7 — ducks arriving makes the group grow.",
      [[5, "That never moved. Two more ducks arrived, so the group grew."],
       [3, "That hopped backward. Arriving ducks make the count go UP."]]),
    predict: P("5 ducks swim in a pond and 2 more swim over. Which way does the count move?",
      [{ id: "up", label: "Up — ducks arrived" }, { id: "down", label: "Down — ducks left" }, { id: "still", label: "It stays at 5" }], "up",
      "Arriving means MORE ducks, so the count moves up from 5 to 7.") },
  chooseOpPack(5, 2, true), chooseOpPack(6, 3, false), chooseOpPack(4, 4, true), chooseOpPack(7, 2, false),
  { body: "The other way.", widget: () => hop("7 ducks swim. 2 fly away. Hop to the new total.", 7, 2, "back", "Landed on 5 — ducks leaving makes the group shrink.") },
  ["Decide what happened first.", "Growing means add.", "Shrinking means subtract."],
  "next: drawing the story.");

def(15, 3,
  "A drawing of a story must show two things: how many there were, and what happened to them.",
  "A drawing that shows only the start, or only the change, does not tell the whole story.",
  { body: "Draw and cross.", rep: "diagram",
    widget: () => hop("\"5 cats sit on a wall. 2 jump down.\" Hop back to show how many stay.", 5, 2, "back",
      "Landed on 3 — 5 cats with 2 gone leaves 3 on the wall.",
      [[5, "That never moved. Two cats jumped down, so fewer remain."],
       [2, "That counts the cats that jumped down, not the ones still sitting."]]),
    predict: P("\"5 cats sit on a wall. 2 jump down.\" What must the drawing show?",
      [{ id: "both", label: "Both the 5 cats and the 2 leaving" }, { id: "start", label: "Only the 5 cats" }, { id: "change", label: "Only the 2 that jumped" }], "both",
      "A story drawing needs the starting group AND the change, or it cannot show what happened.") },
  modelStoryPack(5, 2), modelStoryPack(4, 3), modelStoryPack(3, 1), modelStoryPack(5, 3),
  { body: "Draw another.", widget: () => hop("\"4 cats sit on a wall. 3 jump down.\" Hop back.", 4, 3, "back", "Landed on 1 — 4 with 3 gone leaves 1.") },
  ["Show the start.", "Show the change.", "Both together tell the story."],
  "next: knowing sums to 5 by heart.");

def(16, 3,
  "Some sums are worth knowing by heart, so you do not have to count them every time.",
  "The sums that make 5 or less come back quickly with practice.",
  { body: "Make the sum.", rep: "diagram",
    widget: () => frame("Show 2 + 3 on the frame.", 5, 2, "Five filled — 2 and 3 make 5.",
      [[2, "That shows only the first part. Three more counters still go in."]]),
    predict: P("You will practise sums like 2 + 3 until they come back on their own. What changes with practice?",
      [{ id: "faster", label: "You stop needing to count" }, { id: "bigger", label: "The answers get bigger" }, { id: "harder", label: "The sums get harder" }], "faster",
      "Practice does not change the answers — it changes how you get them: recall instead of counting.") },
  sums5Pack(2, 3), sums5Pack(1, 4), sums5Pack(3, 2), sums5Pack(1, 3),
  { body: "Make another.", widget: () => frame("Show 1 + 4 on the frame.", 5, 1, "Five filled — 1 and 4 make 5.") },
  ["Known sums save counting.", "Sums to 5 come back fast.", "Practice builds recall."],
  "next: differences within 5.");

def(17, 3,
  "Differences within 5 are worth knowing by heart too.",
  "Each one is the partner of a sum you already know: if 2 and 3 make 5, then 5 take away 3 leaves 2.",
  { body: "Take it back.", rep: "diagram",
    widget: () => hop("Show 5 − 3 by hopping back from 5.", 5, 3, "back", "Landed on 2 — 5 take away 3 leaves 2.",
      [[5, "That never moved. Three must come off."],
       [3, "That counts what was taken, not what is left."]]),
    predict: P("You know 2 + 3 = 5. What is 5 − 3?",
      [{ id: "two", label: "2 — the other part" }, { id: "five", label: "5 — the whole" }, { id: "three", label: "3 — the part taken" }], "two",
      "The parts of 5 are 2 and 3. Taking one part away always leaves the other: 5 − 3 = 2.") },
  diffs5Pack(5, 3), diffs5Pack(4, 1), diffs5Pack(5, 2), diffs5Pack(3, 1),
  { body: "Another difference.", widget: () => hop("Show 4 − 1 by hopping back from 4.", 4, 1, "back", "Landed on 3 — 4 take away 1 leaves 3.") },
  ["Differences within 5 are known facts.", "Each is a sum's partner.", "Taking one part leaves the other."],
  "next: plus one and minus one.");

def(18, 3,
  "Adding one moves to the very next counting number. Taking one away moves back to the number before.",
  "These two facts work for every number, so they never need counting out.",
  { body: "One step.", rep: "diagram",
    widget: () => hop("Hop forward one from 6.", 6, 1, "forward", "Landed on 7 — one more than 6 is 7.",
      [[6, "That never moved. Adding one always takes one step forward."],
       [8, "That hopped twice. Adding one is exactly one step."]]),
    predict: P("What is 6 + 1?",
      [{ id: "next", label: "7 — the next number" }, { id: "same", label: "6 — it does not change" }, { id: "two", label: "8 — two steps on" }], "next",
      "Adding one is exactly one step forward, which lands on the next counting number: 7.") },
  plusMinusOnePack(6, true), plusMinusOnePack(9, false), plusMinusOnePack(3, true), plusMinusOnePack(7, false),
  { body: "Step back.", widget: () => hop("Hop back one from 9.", 9, 1, "back", "Landed on 8 — one less than 9 is 8.") },
  ["Plus one is the next number.", "Minus one is the number before.", "These work for every number."],
  "next: what zero does.");

def(19, 3,
  "Zero means none. Adding zero puts nothing in, and taking zero away removes nothing.",
  "Either way the group is untouched, so the number stays exactly the same.",
  { body: "Nothing moves.", rep: "diagram",
    widget: () => hop("Hop forward zero times from 6 — that is, do not move.", 6, 1, "forward",
      "Adding zero would leave you on 6; one hop shows what adding ONE looks like instead.",
      [[8, "That hopped twice. Even adding one is a single step."]]),
    predict: P("What is 6 + 0?",
      [{ id: "six", label: "6 — nothing changes" }, { id: "zero", label: "0 — the group empties" }, { id: "seven", label: "7 — it grows by one" }], "six",
      "Zero means NO objects were added, so the group is untouched and the count stays 6.") },
  zeroPack(6, true), zeroPack(4, false), zeroPack(9, true), zeroPack(7, false),
  { body: "Take away nothing.", widget: () => frame("Show 7 counters on the frame. Then take away zero — leave it exactly as it is.", 7, 0, "Seven filled, and taking away zero leaves all seven right where they are.") },
  ["Zero means none.", "Adding zero changes nothing.", "Taking zero away changes nothing."],
  "next: putting the fast facts together.");

def(20, 3,
  "Now the sums and differences within 5 come back together, mixed up and out of order.",
  "Mixing them removes the rhythm of a single page, so each fact must be recalled on its own.",
  { body: "Quick sum.", rep: "diagram",
    widget: () => frame("Show 3 + 2 on the frame.", 5, 3, "Five filled — 3 and 2 make 5.",
      [[3, "That shows only the first part. Two more go in."]]),
    predict: P("The facts now come mixed up instead of in order. What makes that harder?",
      [{ id: "own", label: "Each fact must be recalled on its own" }, { id: "bigger", label: "The numbers get bigger" }, { id: "new", label: "The rules change" }], "own",
      "A single-page pattern lets you settle into a rhythm. Mixing removes that, so each fact stands alone.") },
  speedyPack(3, 2, false), speedyPack(5, 1, true), speedyPack(1, 2, false), speedyPack(4, 3, true),
  { body: "Quick difference.", widget: () => hop("Show 5 − 1 by hopping back from 5.", 5, 1, "back", "Landed on 4 — 5 take away 1 leaves 4.") },
  ["Mixed facts stand alone.", "Sums and differences within 5.", "Recall, not counting."],
  "next course: teen numbers.");

/* ------------------------------------------------------------------------- assembly */

must(L.length === 20, `20 lessons defined, got ${L.length}`);
const chapterTitles = ["Putting Together", "Taking Away", "Stories and Fast Facts"];
const perChapter = [5, 5, 10];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const outDir = join(root, "content/courses/add-subtract-10-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
  const id = `koa-0${d.ch}-${String(seq).padStart(2, "0")}`;
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
    id, slug, title: row.title, courseId: "add-subtract-10-k",
    chapterId: chapters[d.ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      check("k1", d.k1),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
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

  // ---- structural assertions ----
  let tagged = 0;
  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
    if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
    if (w.type === "tenFrame") must(w.preFilled < w.target, `${id}/${s.id} frame prefill ${w.preFilled} must be < ${w.target}`);
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land ${land} outside ${w.min}..${w.max}`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === "k0-add-subtract", `${id}/${s.id} variant gen`);
      if (s.variant.factFamily) {
        must(/^\d+\+\d+$/.test(s.variant.factFamily), `${id}/${s.id} factFamily shape ${s.variant.factFamily}`);
        const [lo, hi] = s.variant.factFamily.split("+").map(Number);
        must(lo <= hi, `${id}/${s.id} factFamily not canonical ${s.variant.factFamily}`);
        tagged++;
      }
    }
  }
  // The K.OA.A.5 fluency lessons (16-20) must exercise the fact-grain architecture; the
  // K.OA.A.1/2 modelling lessons must NOT (modelling evidence does not belong in a recall box).
  const isFluency = d.n >= 16;
  must(isFluency ? tagged >= 1 : tagged === 0,
    `${id}: fluency=${isFluency} but ${tagged} steps carry a factFamily`);
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "add-subtract-10-k", slug: "add-subtract-10-k", title: spec.title,
  tagline: "Put groups together, take some away, and make the facts within 5 come back on their own.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 20 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
