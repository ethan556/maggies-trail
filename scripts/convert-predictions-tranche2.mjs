// Tranche-2 flagship conversion: adds predict blocks whose OUTCOME IS COMPUTED
// from the widget's own parameters — correct by construction, or skipped.
// Rules enforced here:
//  - interactive steps only, widget present, no existing predict in the lesson
//  - at most ONE generated prediction per lesson (predict is a ritual, not a toll booth)
//  - every family template checks its mathematical premise per instance and
//    SKIPS when it doesn't hold (e.g. non-monotone arcs, midpoint ties)
// Run once, then gates: node scripts/convert-predictions-tranche2.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "content", "courses");
const fmt = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

/** Per-family generators: (widget) → predict block or null (premise not met). */
const GEN = {
  balanceScale(w) {
    const left = w.a * (w.xStart ?? 0) + w.b;
    if (left === w.c) return null;
    const lighter = left < w.c;
    return {
      prompt: `The scale starts with x = ${fmt(w.xStart ?? 0)}. Right now the left pan (${w.a === 1 ? "" : fmt(w.a)}x + ${fmt(w.b)}) is…`,
      options: [
        { id: "light", label: "Lighter than the right pan" },
        { id: "heavy", label: "Heavier than the right pan" },
        { id: "level", label: "Already balanced" }
      ],
      outcomeId: lighter ? "light" : "heavy",
      reveal: `At x = ${fmt(w.xStart ?? 0)} the left pan weighs ${fmt(left)} against ${fmt(w.c)} on the right — ${fmt(Math.abs(w.c - left))} ${lighter ? "short" : "over"}. Every unit you ${lighter ? "add to" : "take from"} x moves only that pan, which is why exactly one value levels the scale.`
    };
  },
  dilationExplore(w) {
    const k = w.targetK;
    if (!k || k === 1) return null;
    const k2 = k * k;
    const grow = k > 1;
    return {
      prompt: `You'll scale every length by k = ${fmt(k)}. What happens to the shape's AREA?`,
      options: [
        { id: "k", label: `It ${grow ? "grows" : "shrinks"} by ×${fmt(k)}` },
        { id: "k2", label: `It ${grow ? "grows" : "shrinks"} by ×${fmt(k2)}` },
        { id: "same", label: "It stays the same" }
      ],
      outcomeId: "k2",
      reveal: `Width AND height both scale by ${fmt(k)}, so area picks up that factor twice: k² = ${fmt(k2)}. Lengths scale by k, areas always by k² — watch the two figures to see it.`
    };
  },
  riemannSum(w) {
    if (w.a < 0) return null; // 2x and x² are only guaranteed rising for x ≥ 0
    const rule = w.ruleStart ?? "left";
    if (rule !== "left" && rule !== "right") return null;
    const under = rule === "left";
    const name = w.fn === "line" ? "y = 2x" : "y = x²";
    return {
      prompt: `${name} rises across [${fmt(w.a)}, ${fmt(w.b)}]. Using the ${rule.toUpperCase()} rule, your first estimate will land…`,
      options: [
        { id: "under", label: "Under the true area" },
        { id: "over", label: "Over the true area" },
        { id: "exact", label: "Exactly on it" }
      ],
      outcomeId: under ? "under" : "over",
      reveal: under
        ? "On a rising curve every left-hand strip is only as tall as its shortest edge, so left sums always undershoot — and raising n squeezes the gap toward zero."
        : "On a rising curve every right-hand strip stands as tall as its tallest edge, so right sums always overshoot — and raising n squeezes the excess toward zero."
    };
  },
  unitCircleExplore(w) {
    const a0 = w.angleStart ?? 0, a1 = w.targetAngle, step = Math.max(1, w.angleStep ?? 15);
    if (!(a1 > a0) || a1 - a0 > 360) return null;
    const sin = (d) => Math.sin((d * Math.PI) / 180);
    const dirs = [];
    for (let a = a0; a + step <= a1; a += step) {
      const d = sin(a + step) - sin(a);
      if (Math.abs(d) > 1e-9) dirs.push(d > 0 ? 1 : -1);
    }
    if (dirs.length === 0) return null;
    const changes = dirs.filter((d, i) => i > 0 && d !== dirs[i - 1]).length;
    if (changes > 1) return null;
    const kind = changes === 0 ? (dirs[0] > 0 ? "up" : "down") : dirs[0] > 0 ? "updown" : "downup";
    const opts = {
      up: [["climb", "Climbs the whole way"], ["updown", "Climbs, then falls back"], ["fall", "Falls the whole way"]],
      down: [["fall", "Falls the whole way"], ["downup", "Falls, then climbs back"], ["climb", "Climbs the whole way"]],
      updown: [["updown", "Climbs, then falls back"], ["climb", "Climbs the whole way"], ["fall", "Falls the whole way"]],
      downup: [["downup", "Falls, then climbs back"], ["fall", "Falls the whole way"], ["climb", "Climbs the whole way"]]
    }[kind];
    const outcomeId = opts[0][0];
    const reveal = {
      up: `From ${a0}° to ${a1}° the height — the sine — only rises; the fall doesn't begin until past 90° (or past 270° coming out of the trough).`,
      down: `From ${a0}° to ${a1}° the height — the sine — only falls; it can't turn back up until the trough at 270°.`,
      updown: `The height rises until the top of the circle at 90°, then falls — the sine's peak is exactly where the point is highest.`,
      downup: `The height falls until the bottom of the circle at 270°, then climbs — the sine's trough is exactly where the point is lowest.`
    }[kind];
    return {
      prompt: `You'll rotate from ${a0}° to ${a1}°. What does the point's HEIGHT do along the way?`,
      options: opts.map(([id, label]) => ({ id, label })),
      outcomeId,
      reveal
    };
  },
  fractionBar(w) {
    const cross = w.numStart * w.targetDen - w.targetNum * w.denStart; // start − target
    if (cross === 0) return null;
    const s = `${w.numStart}/${w.denStart}`, t = `${w.targetNum}/${w.targetDen}`;
    const more = cross > 0;
    return {
      prompt: `The bar starts at ${s}. Before you touch it: is ${s} more or less of the bar than ${t}?`,
      options: [
        { id: "more", label: `${s} is more` },
        { id: "less", label: `${s} is less` },
        { id: "same", label: "They're the same amount" }
      ],
      outcomeId: more ? "more" : "less",
      reveal: `With the same whole, the bar settles it: ${s} covers ${more ? "more" : "less"} than ${t}. Count of pieces and size of pieces work together — neither alone decides the amount.`
    };
  },
  expLogExplore(w) {
    if (w.mode !== "exponential") return null;
    const s = w.startBase, t = w.targetBase;
    if (s === t) return null;
    const crosses = (s - 1) * (t - 1) < 0;
    if (crosses) {
      const goingDown = t < s;
      return {
        prompt: `You'll slide the base ${goingDown ? "DOWN" : "UP"} past b = 1. What happens to the curve as you cross?`,
        options: [
          { id: "flip", label: goingDown ? "It flips from rising to falling" : "It flips from falling to rising" },
          { id: "steeper", label: `It just ${goingDown ? "rises less steeply" : "falls less steeply"}` },
          { id: "nothing", label: "Nothing special happens at 1" }
        ],
        outcomeId: "flip",
        reveal: "A base above 1 multiplies numbers up; a base below 1 multiplies them down. b = 1 is the hinge — cross it and the curve changes character, flat exactly at the hinge."
      };
    }
    if (s > 1 && t > 1) {
      const faster = t > s;
      return {
        prompt: `Both bases are above 1. Moving the base from ${fmt(s)} to ${fmt(t)}, the curve will…`,
        options: [
          { id: "faster", label: "Rise faster" },
          { id: "slower", label: "Rise more slowly" },
          { id: "shift", label: "Slide sideways without changing steepness" }
        ],
        outcomeId: faster ? "faster" : "slower",
        reveal: `A bigger base multiplies by more at every step, so ${fmt(Math.max(s, t))} outruns ${fmt(Math.min(s, t))} — the base IS the growth factor per unit of x, not a sideways shift.`
      };
    }
    return null;
  },
  systemsExplore(w) {
    if (w.m1 === w.m2) return null;
    return {
      prompt: "Two lines with different slopes are on the grid. How many points can satisfy BOTH equations at once?",
      options: [
        { id: "one", label: "Exactly one" },
        { id: "two", label: "Two" },
        { id: "many", label: "Every point on either line" }
      ],
      outcomeId: "one",
      reveal: "Lines with different slopes cross exactly once, so exactly one pair sits in both solution sets — the crossing point. Being on ONE line is not enough; the system demands both."
    };
  },
  quadraticExplore(w) {
    const a0 = w.aStart, a1 = w.targetA, h0 = w.hStart, h1 = w.targetH;
    if (h0 !== h1) {
      const right = h1 > h0;
      return {
        prompt: `You'll move h ${right ? "UP" : "DOWN"} in y = a(x − h)² + k. Which way does the parabola slide?`,
        options: [
          { id: "right", label: "To the right" },
          { id: "left", label: "To the left" },
          { id: "upward", label: "Straight up" }
        ],
        outcomeId: right ? "right" : "left",
        reveal: `Raising h moves the vertex RIGHT even though h is subtracted — (x − h)² is smallest exactly when x = h, so the low point chases h. The minus sign is why so many people guess the wrong direction.`
      };
    }
    if (a0 !== 0 && a1 !== 0 && Math.sign(a0) !== Math.sign(a1)) {
      return {
        prompt: "You'll flip the sign of a. What happens to the parabola?",
        options: [
          { id: "flip", label: "It opens the other way" },
          { id: "shift", label: "It slides sideways" },
          { id: "narrow", label: "It gets narrower but keeps opening the same way" }
        ],
        outcomeId: "flip",
        reveal: "a's sign decides which way the arms open: positive cups upward, negative caps downward. Width comes from a's SIZE; direction comes from its sign."
      };
    }
    return null;
  },
  numberLineHop(w) {
    const hop = w.hop, hops = w.hops;
    if (!(hops >= 2 && hop >= 2)) return null;
    const total = hop * hops, add = hop + hops, off = hop * (hops - 1);
    if (new Set([total, add, off]).size < 3) return null;
    const dir = w.direction === "left" ? "left" : "right";
    return {
      prompt: `You'll take ${hops} equal hops of ${hop}, ${dir} from ${fmt(w.start)}. How far from ${fmt(w.start)} will you end up in total?`,
      options: [
        { id: "total", label: `${total} away` },
        { id: "add", label: `${add} away` },
        { id: "off", label: `${off} away` }
      ],
      outcomeId: "total",
      reveal: `${hops} equal hops of ${hop} cover ${hop} × ${hops} = ${total} — repeated equal jumps ARE multiplication. Adding ${hop} + ${hops} = ${add} mixes up the jump size with the number of jumps.`
    };
  },
  numberLinePlace(w) {
    const dMin = Math.abs(w.target - w.min), dMax = Math.abs(w.max - w.target);
    if (dMin === dMax) return null;
    const closerMin = dMin < dMax;
    return {
      prompt: `Before you place it: is ${fmt(w.target)} closer to ${fmt(w.min)} or to ${fmt(w.max)}?`,
      options: [
        { id: "min", label: `Closer to ${fmt(w.min)}` },
        { id: "max", label: `Closer to ${fmt(w.max)}` },
        { id: "half", label: "Exactly halfway" }
      ],
      outcomeId: closerMin ? "min" : "max",
      reveal: `${fmt(w.target)} sits ${fmt(dMin)} from ${fmt(w.min)} and ${fmt(dMax)} from ${fmt(w.max)} — ${closerMin ? `the ${fmt(w.min)} side` : `the ${fmt(w.max)} side`} wins. Judging position from the endpoints first makes the exact placement easier to defend.`
    };
  },
  transformExplore(w) {
    if (w.allowReflect) return null;
    const [sx, sy] = w.shape[0], [tx, ty] = w.target[0];
    const dx = tx - sx, dy = ty - sy;
    if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) return null;
    const word = (d, pos, neg) => `${d > 0 ? pos : neg} ${Math.abs(d)}`;
    const right = word(dx, "Right", "Left"), up = word(dy, "up", "down");
    const swapped = `${word(dy, "Right", "Left")} and ${word(dx, "up", "down")}`;
    const flipped = `${word(-dx, "Right", "Left")} and ${up}`;
    return {
      prompt: "Compare one corner of the shape with the SAME corner of its target. Which slide lands it?",
      options: [
        { id: "ok", label: `${right} and ${up}` },
        { id: "swap", label: swapped },
        { id: "flip", label: flipped }
      ],
      outcomeId: "ok",
      reveal: `Corner (${sx}, ${sy}) must reach (${tx}, ${ty}): that's ${right.toLowerCase()} and ${up} — and a translation applies that SAME vector to every vertex, which is why matching one corner settles all of them.`
    };
  },
  accumulateArea(w) {
    if (w.fn === "shifted") return null; // crosses zero — the story is subtler than one option
    if ((w.start ?? 0) < 0) return null;
    if (w.fn === "const") {
      return {
        prompt: "You'll sweep out area under a FLAT function. As x moves right, the accumulated area grows…",
        options: [
          { id: "steady", label: "At a steady rate" },
          { id: "faster", label: "Faster and faster" },
          { id: "slower", label: "Slower and slower" }
        ],
        outcomeId: "steady",
        reveal: "Area pours in at exactly the current height of f — and a flat function's height never changes, so the accumulation climbs in a straight line. The rate area grows IS the function's height."
      };
    }
    const name = w.fn === "line" ? "f(x) = 2x" : "f(x) = x²";
    return {
      prompt: `You'll sweep out area under ${name} from the left. As x moves right, the accumulated area grows…`,
      options: [
        { id: "faster", label: "Faster and faster" },
        { id: "steady", label: "At a steady rate" },
        { id: "slower", label: "Slower and slower" }
      ],
      outcomeId: "faster",
      reveal: `Area pours in at exactly the current height of ${name} — and that height keeps rising, so the accumulation curve bends upward. The rate the area grows IS the function's height.`
    };
  }
};

let converted = 0, skippedPremise = 0;
const byFamily = {};
for (const courseDir of readdirSync(ROOT)) {
  const lessonsDir = path.join(ROOT, courseDir, "lessons");
  if (!existsSync(lessonsDir)) continue;
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const fp = path.join(lessonsDir, f);
    const l = JSON.parse(readFileSync(fp, "utf8"));
    if (l.steps.some((s) => s.predict)) continue; // one ritual per lesson, and never double-convert
    let done = false;
    for (const s of l.steps) {
      if (done || s.kind !== "interactive" || !s.widget) continue;
      const gen = GEN[s.widget.type];
      if (!gen) continue;
      const p = gen(s.widget);
      if (!p) { skippedPremise++; continue; }
      s.predict = p;
      byFamily[s.widget.type] = (byFamily[s.widget.type] ?? 0) + 1;
      converted++;
      done = true;
    }
    if (done) writeFileSync(fp, JSON.stringify(l, null, 1));
  }
}
console.log(`converted ${converted} lessons; premise-skipped ${skippedPremise} candidate steps`);
console.log(byFamily);
