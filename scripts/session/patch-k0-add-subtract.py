#!/usr/bin/env python3
"""S189: the k0-add-subtract generator family (K.OA.A.1/2/5 — represent, solve, and fluently
add/subtract within 10). One form per authored lesson. The five K.OA.A.5 FLUENCY forms carry an
additive factFamily key, so Kindergarten sums within 5 feed the same leech box (Profile.factItems)
and review surface that Grade-2 and Grade-3 fluency already use. Abort on any anchor miss."""
from pathlib import Path

p = Path("src/lib/g0Variants.ts")
s = p.read_text()

BLOCK = r'''
/* ===================================================== k0-add-subtract (S189, 20 forms) ===== */

const KOA = "k0-add-subtract";
// Additive fact-family key, identical to factFluency.ts's sumFamilyKey. Kept local so this
// generator file stays dependency-free like every other g*Variants module.
const koaFam = (a: number, b: number) => `${Math.min(a, b)}+${Math.max(a, b)}`;

/** Numeric variant carrying an optional additive fact family. Only the K.OA.A.5 fluency forms
 * set it: the K.OA.A.1/2 forms are about REPRESENTING and MODELLING a situation, not recalling a
 * fact, so tagging them would put modelling evidence into a recall leech box. */
const koaNum = (
  prompt: string, answer: number, errs: Array<[number, string]>, success: string, family?: string
) => {
  const seen = new Set<number>([answer]);
  const commonErrors: Array<{ value: number; feedback: string }> = [];
  for (const [value, feedback] of errs) {
    if (!Number.isInteger(value) || value < 0 || seen.has(value)) continue;
    seen.add(value); commonErrors.push({ value, feedback });
  }
  const v: {
    tag: string; answer: number; factFamily?: string;
    widget: Record<string, unknown>;
  } = {
    tag: KOA, answer,
    widget: {
      type: "numeric", prompt, answer, tolerance: 0, unit: "",
      commonErrors,
      fallbackFeedback: "Count the objects one at a time, touching each one exactly once.",
      successFeedback: success
    }
  };
  if (family) v.factFamily = family;
  return v;
};

const koaMcq = (
  r: () => number, prompt: string, correct: [string, string], wrong: Array<[string, string]>
) => {
  const seen = new Set<string>([correct[0]]);
  const ws = wrong.filter((w) => !seen.has(w[0]) && seen.add(w[0]));
  const all = [
    { label: correct[0], feedback: correct[1], correct: true },
    ...ws.map(([label, feedback]) => ({ label, feedback, correct: false }))
  ];
  // Deterministic rotation, no Math.random. NOT by prompt.length alone: these K prompts embed
  // single-digit numbers, so their length is CONSTANT across seeds and the correct option would
  // park in one fixed slot forever — a position the learner could game. Folding in the digit
  // characters makes the rotation vary with the actual numbers while staying fully deterministic.
  const rotKey = prompt.length + [...prompt].reduce((t, ch) => t + (ch >= "0" && ch <= "9" ? ch.charCodeAt(0) : 0), 0);
  const rot = rotKey % all.length;
  const options = [...all.slice(rot), ...all.slice(0, rot)].map((o, i) => ({ id: `o${i}`, ...o }));
  return {
    tag: KOA, answer: options.find((o) => o.correct)!.id,
    widget: { type: "mcq", prompt, options }
  };
};

const kpick = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const kchoose = <T,>(r: () => number, xs: readonly T[]) => xs[kpick(r, 0, xs.length - 1)];
const kThing = (r: () => number) => kchoose(r, ["apples", "blocks", "ducks", "leaves", "stars", "bears"] as const);
/** Singular form of a kThing noun, so a count of 1 never reads "1 blocks". Every prompt that
 * places a NUMBER directly before the noun must go through this. */
const kOne: Record<string, string> = { apples: "apple", blocks: "block", ducks: "duck", leaves: "leaf", stars: "star", bears: "bear" };
const kN = (n: number, thing: string) => `${n} ${n === 1 ? (kOne[thing] ?? thing) : thing}`;

const koaHandlers: Record<string, (r: () => number) => unknown> = {
  /* ---- K.OA.A.1: represent addition and subtraction ---- */
  KoaJoinNumeric: (r) => {
    const a = kpick(r, 1, 5), b = kpick(r, 1, Math.min(5, 10 - a)), t = kThing(r);
    return koaNum(`One group has ${kN(a, t)}. Another group has ${kN(b, t)}. Put them together. How many ${t} in all?`, a + b,
      [[a, `That counts only the first group. Putting together means counting BOTH groups.`],
       [Math.abs(a - b), `That compares the groups instead of joining them. Count every object in both groups.`]],
      `Correct — ${a} and ${b} together make ${a + b}.`);
  },
  KoaFingersNumeric: (r) => {
    const a = kpick(r, 1, 5), b = kpick(r, 1, 5);
    return koaNum(`Hold up ${a} fingers on one hand and ${b} on the other. How many fingers are up?`, a + b,
      [[a, `That counts one hand only. Count the fingers on BOTH hands.`],
       [10 - (a + b), `That counts the fingers still DOWN. The question asks how many are up.`]],
      `Correct — ${a} fingers and ${b} fingers make ${a + b}.`);
  },
  KoaDrawingsNumeric: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaNum(`Draw ${a} circles. Then draw ${b} more circles. How many circles did you draw?`, a + b,
      [[a, `That counts only the first drawing. The ${b} new circles count too.`],
       [b, `That counts only the circles drawn second. Count every circle on the page.`]],
      `Correct — ${a} circles and ${b} more make ${a + b}.`);
  },
  KoaActOutNumeric: (r) => {
    const a = kpick(r, 2, 6), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaNum(`${a} children are playing. ${b} more children join them. How many children are playing now?`, a + b,
      [[a, `That is how many started. ${b} more joined, so the group grew.`],
       [a - b >= 0 ? a - b : a + 1, `That takes children away. "Join" means MORE children, so the total goes up.`]],
      `Correct — ${a} children and ${b} more make ${a + b}.`);
  },
  KoaWriteAddMcq: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaMcq(r, `${a} birds sit on a branch. ${b} more birds land. Which sentence shows this?`,
      [`${a} + ${b} = ${a + b}`, `Correct — joining ${a} and ${b} is written with a plus sign, and the total is ${a + b}.`],
      [[`${a} − ${b} = ${a - b >= 0 ? a - b : 0}`, `The minus sign means taking away, but these birds are ARRIVING.`],
       [`${a} + ${b} = ${a + b + 1}`, `The plus sign is right, but the total is off by one — count again: ${a + b}.`],
       [`${b} − ${a} = 0`, `That both reverses the numbers and takes away instead of joining.`]]);
  },

  /* ---- K.OA.A.1: subtraction ---- */
  KoaTakeAwayNumeric: (r) => {
    const total = kpick(r, 4, 10), away = kpick(r, 1, total - 1);
    return koaNum(`There are ${total} cookies. You eat ${away}. How many cookies are left?`, total - away,
      [[total, `That is how many there were BEFORE eating. ${away} are gone now.`],
       [away, `That counts the cookies eaten, not the ones left on the plate.`]],
      `Correct — ${total} take away ${away} leaves ${total - away}.`);
  },
  KoaSubDrawingsNumeric: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaNum(`Draw ${total} circles, then cross out ${away}. How many circles are NOT crossed out?`, total - away,
      [[away, `That counts the crossed-out circles. The question asks about the ones still plain.`],
       [total, `That counts every circle drawn, including the crossed-out ones.`]],
      `Correct — ${total} circles with ${away} crossed out leaves ${total - away}.`);
  },
  KoaSubActOutNumeric: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaNum(`${total} children are playing. ${away} go home. How many children are still playing?`, total - away,
      [[total, `That is how many started. ${away} have left, so fewer are playing now.`],
       [away, `That counts the children who went home, not the ones still playing.`]],
      `Correct — ${total} children with ${away} gone leaves ${total - away}.`);
  },
  KoaWriteSubMcq: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaMcq(r, `${total} frogs sit on a log. ${away} hop away. Which sentence shows this?`,
      [`${total} − ${away} = ${total - away}`, `Correct — hopping away is taking away, written with a minus sign.`],
      [[`${total} + ${away} = ${total + away}`, `The plus sign means more frogs arrived, but these frogs LEFT.`],
       [`${away} − ${total} = 0`, `That reverses the numbers. The ${total} frogs came first, and ${away} left from them.`],
       [`${total} − ${away} = ${total - away + 1}`, `The minus sign is right, but the answer is one too many — count again.`]]);
  },
  KoaHowManyLeftNumeric: (r) => {
    const total = kpick(r, 5, 10), away = kpick(r, 2, total - 1);
    return koaNum(`${total} balloons float away one at a time until ${away} have gone. How many balloons are left?`, total - away,
      [[away, `That counts the balloons that floated away, not the ones still held.`],
       [total, `That is the starting number. ${away} have gone since then.`]],
      `Correct — ${total} balloons with ${away} gone leaves ${total - away}.`);
  },

  /* ---- K.OA.A.2: word-problem types ---- */
  KoaAddToStoryNumeric: (r) => {
    const a = kpick(r, 2, 6), b = kpick(r, 1, Math.min(4, 10 - a)), t = kThing(r);
    return koaNum(`A basket holds ${kN(a, t)}. Someone puts in ${b} more. How many ${t} are in the basket now?`, a + b,
      [[a, `That is the number before anything was added.`],
       [b, `That counts only what was put in. The basket already held ${a}.`]],
      `Correct — ${a} plus ${b} more makes ${a + b}.`);
  },
  KoaTakeFromStoryNumeric: (r) => {
    const total = kpick(r, 5, 10), away = kpick(r, 1, total - 2), t = kThing(r);
    return koaNum(`A basket holds ${kN(total, t)}. Someone takes out ${away}. How many ${t} are in the basket now?`, total - away,
      [[total, `That is the number before any were taken out.`],
       [away, `That counts what was removed, not what remains in the basket.`]],
      `Correct — ${total} take away ${away} leaves ${total - away}.`);
  },
  KoaPutTogetherNumeric: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 2, Math.min(5, 10 - a));
    return koaNum(`A bowl has ${a} red grapes and ${b} green grapes. How many grapes are in the bowl?`, a + b,
      [[a, `That counts the red grapes only. Both colors are in the same bowl.`],
       [Math.abs(a - b), `That compares the two colors. "How many in the bowl" counts them all together.`]],
      `Correct — ${a} red and ${b} green make ${a + b} grapes in all.`);
  },
  KoaChooseOpMcq: (r) => {
    const addStory = r() < 0.5;
    const a = kpick(r, 3, 6), b = kpick(r, 1, 3);
    if (addStory) {
      return koaMcq(r, `${a} ducks swim in a pond. ${b} more ducks swim over. What should you do to find how many ducks are in the pond?`,
        ["Add", `Correct — more ducks arriving means the group grows, so add.`],
        [["Subtract", `Subtracting would make the group smaller, but these ducks ARRIVED.`],
         ["Count only the new ducks", `That leaves out the ${a} ducks already swimming there.`]]);
    }
    return koaMcq(r, `${a + b} ducks swim in a pond. ${b} ducks fly away. What should you do to find how many ducks are left?`,
      ["Subtract", `Correct — ducks leaving means the group shrinks, so subtract.`],
      [["Add", `Adding would make the group bigger, but these ducks LEFT.`],
       ["Count only the ducks that flew away", `That counts what is gone, not what is still on the pond.`]]);
  },
  KoaModelStoryMcq: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, 3);
    return koaMcq(r, `"${a} cats sit on a wall. ${b} jump down." Which drawing shows this story?`,
      [`${a} cats drawn, with ${b} crossed out`, `Correct — crossing out shows the ${b} cats that jumped down and left.`],
      [[`${a} cats drawn, with ${b} more added`, `Adding more cats would show cats ARRIVING, but these cats left.`],
       [`${a + b} cats drawn, none crossed out`, `That draws the wrong starting number and never shows the cats leaving.`],
       [`${b} cats drawn only`, `That draws only the cats that jumped down, not the ${a} that started on the wall.`]]);
  },

  /* ---- K.OA.A.5: FLUENCY within 5 — these carry additive fact families ---- */
  KoaSums5Numeric: (r) => {
    const total = kpick(r, 2, 5), a = kpick(r, 1, total - 1), b = total - a;
    return koaNum(`${a} + ${b} = ?`, total,
      [[total - 1, `That stops one short. Count on ${b} from ${a} and land on ${total}.`],
       [Math.abs(a - b), `That finds the difference instead of the total.`]],
      `Correct — ${a} + ${b} = ${total}.`, koaFam(a, b));
  },
  KoaDiffs5Numeric: (r) => {
    const total = kpick(r, 2, 5), away = kpick(r, 1, total - 1);
    return koaNum(`${total} − ${away} = ?`, total - away,
      [[total, `That repeats the starting number instead of taking ${away} away.`],
       [away, `That repeats the number taken away, not the number left.`]],
      `Correct — ${total} − ${away} = ${total - away}.`, koaFam(away, total - away));
  },
  KoaPlusMinusOneNumeric: (r) => {
    const plus = r() < 0.5, n = kpick(r, 1, plus ? 9 : 10);
    if (plus) {
      return koaNum(`${n} + 1 = ?`, n + 1,
        [[n, `Adding one moves to the NEXT number, so it does not stay ${n}.`],
         [n + 2, `That counts on two. Adding one moves exactly one step.`]],
        `Correct — one more than ${n} is ${n + 1}.`, koaFam(n, 1));
    }
    return koaNum(`${n} − 1 = ?`, n - 1,
      [[n, `Taking one away moves to the number BEFORE, so it does not stay ${n}.`],
       [n + 1, `That adds one instead of taking one away.`]],
      `Correct — one less than ${n} is ${n - 1}.`, koaFam(1, n - 1));
  },
  KoaZeroFactNumeric: (r) => {
    const plus = r() < 0.5, n = kpick(r, 1, 10);
    if (plus) {
      return koaNum(`${n} + 0 = ?`, n,
        [[0, `Adding zero does not empty the group — nothing was added, so ${n} remain.`],
         [n + 1, `Zero means NO objects were added, so the total does not grow.`]],
        `Correct — adding zero changes nothing: ${n} + 0 = ${n}.`, koaFam(n, 0));
    }
    return koaNum(`${n} − 0 = ?`, n,
      [[0, `Taking zero away does not empty the group — nothing left, so ${n} remain.`],
       [n - 1 >= 0 ? n - 1 : n + 1, `Zero means NO objects were taken, so the total does not shrink.`]],
      `Correct — taking away zero changes nothing: ${n} − 0 = ${n}.`, koaFam(n, 0));
  },
  KoaSpeedy5Numeric: (r) => {
    const sub = r() < 0.5, total = kpick(r, 2, 5);
    if (sub) {
      const away = kpick(r, 1, total - 1);
      return koaNum(`Answer fast: ${total} − ${away} = ?`, total - away,
        [[total, `That repeats the starting number instead of taking ${away} away.`],
         [away, `That repeats the number taken away, not the number left.`]],
        `Correct — ${total} − ${away} = ${total - away}.`, koaFam(away, total - away));
    }
    const a = kpick(r, 1, total - 1), b = total - a;
    return koaNum(`Answer fast: ${a} + ${b} = ?`, total,
      [[total - 1, `That stops one count short of ${total}.`],
       [Math.abs(a - b), `That finds the difference between ${a} and ${b} instead of their total.`]],
      `Correct — ${a} + ${b} = ${total}.`, koaFam(a, b));
  },
};

const KOA_FORMS = Object.keys(koaHandlers);
'''

anchor = "export const G0_GENERATORS: readonly VariantGen[] = ["
assert s.count(anchor) == 1
s = s.replace(anchor, BLOCK.strip("\n") + "\n\n" + anchor)

reg = '  family("g0-counting",'
assert s.count(reg) == 1
s = s.replace(reg, '  family(KOA, "Kindergarten adding and taking away within 10, and fluency within 5", KOA_FORMS, koaHandlers as never),\n' + reg)

# form surfaces: every koa form is numeric except the two mcq ones
surf_anchor = "export const G0_FORM_SURFACES: Readonly<Record<string, string>> = {\n"
assert s.count(surf_anchor) == 1
mcq_forms = {"KoaWriteAddMcq", "KoaWriteSubMcq", "KoaChooseOpMcq", "KoaModelStoryMcq"}
lines = []
import re as _re
for form in _re.findall(r"^  (Koa[A-Za-z0-9]+):", BLOCK, _re.M):
    lines.append(f'{form}: "{"mcq" if form in mcq_forms else "numeric"}"')
s = s.replace(surf_anchor, surf_anchor + "  " + ", ".join(lines) + ",\n")

p.write_text(s)
print(f"g0Variants: k0-add-subtract family with {len(_re.findall(r'^  (Koa[A-Za-z0-9]+):', BLOCK, _re.M))} forms")
