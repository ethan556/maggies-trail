// Tranche-3 flagship conversion — same contract as tranche 2: outcomes COMPUTED
// from the widget's own parameters, premise-checked per instance or skipped,
// one prediction max per lesson, never touching a lesson that already has one.
// Run once, then gates: node scripts/convert-predictions-tranche3.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "content", "courses");
const fmt = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

const GEN = {
  secantSlope(w) {
    if (w.mode !== "limit") return null; // "average" is the MVT family, hand-authored where it matters
    const fp = w.curve === "square" ? 2 * w.a : 3 * w.a * w.a; // f′(a) for x² / x³
    return {
      prompt: `You'll squeeze the gap h toward 0, dragging B into A at x = ${fmt(w.a)}. What does the secant's slope do?`,
      options: [
        { id: "settles", label: `Settles toward one number (${fmt(fp)})` },
        { id: "blows", label: "Grows without bound" },
        { id: "bounces", label: "Keeps changing — no single value" }
      ],
      outcomeId: "settles",
      reveal: `The secant slopes home in on ${fmt(fp)} — the tangent slope at x = ${fmt(w.a)}. A derivative is not a new kind of slope; it is the number the secant slopes were already approaching.`
    };
  },
  derivativeTrace(w) {
    if (w.mode === "point") {
      const x = w.targetX;
      if (w.fn === "abs" && x === 0) return null; // no tangent at the corner
      const slope = w.fn === "square" ? 2 * x : w.fn === "cubic" ? 3 * x * x : Math.sign(x);
      const id = slope > 0 ? "up" : slope < 0 ? "down" : "flat";
      return {
        prompt: `You'll ride the tangent to x = ${fmt(x)}. When you arrive, the tangent line will be tilting…`,
        options: [
          { id: "up", label: "Uphill (positive slope)" },
          { id: "down", label: "Downhill (negative slope)" },
          { id: "flat", label: "Perfectly flat (slope 0)" }
        ],
        outcomeId: id,
        reveal:
          slope === 0
            ? `At x = ${fmt(x)} the tangent lies flat — slope exactly 0. Flat tangents are where a curve turns: the derivative's zeros mark the hilltops and valley floors.`
            : `At x = ${fmt(x)} the tangent's slope is ${fmt(slope)} — ${slope > 0 ? "uphill" : "downhill"}. The tangent's tilt at each point IS the derivative's value there.`
      };
    }
    if (w.fn !== "square") return null; // slope mode: only x² has one x per slope
    const need = w.targetSlope / 2;
    if (need === w.start) return null;
    const right = need > w.start;
    return {
      prompt: `On y = x², you need the tangent slope to read ${fmt(w.targetSlope)}. Starting from x = ${fmt(w.start)}, you'll find it…`,
      options: [
        { id: "right", label: "To the right of where you start" },
        { id: "left", label: "To the left of where you start" },
        { id: "both", label: "In two places — either direction works" }
      ],
      outcomeId: right ? "right" : "left",
      reveal: `On x² the slope at x is 2x — it climbs steadily left to right, so slope ${fmt(w.targetSlope)} lives at exactly one spot: x = ${fmt(need)}. One slope, one place; that's what makes 2x a function of x.`
    };
  },
  vectorExplore(w) {
    if (w.mode !== "dot") return null;
    const d0 = w.ux * w.vxStart + w.uy * w.vyStart;
    const id = d0 > 0 ? "pos" : d0 < 0 ? "neg" : "zero";
    return {
      prompt: `Look at the two arrows before you move anything. The dot product u · v of the STARTING pair is…`,
      options: [
        { id: "pos", label: "Positive — they lean the same way" },
        { id: "neg", label: "Negative — they lean apart" },
        { id: "zero", label: "Zero — they're perpendicular" }
      ],
      outcomeId: id,
      reveal: `u · v = ${fmt(w.ux)}·${fmt(w.vxStart)} + ${fmt(w.uy)}·${fmt(w.vyStart)} = ${fmt(d0)}. One number tells the geometry: positive means the angle is under 90°, zero means exactly 90°, negative means past it.`
    };
  },
  spinnerSim(w) {
    const cmp = w.targetFavourable * 2 - w.sectors; // >0 ⇒ more than half
    if (cmp === 0) return null;
    return {
      prompt: `You'll shade ${w.targetFavourable} of the ${w.sectors} equal sectors. Is that chance more or less than a coin flip?`,
      options: [
        { id: "more", label: "More than 1/2" },
        { id: "less", label: "Less than 1/2" },
        { id: "half", label: "Exactly 1/2" }
      ],
      outcomeId: cmp > 0 ? "more" : "less",
      reveal: `Half of ${w.sectors} sectors is ${fmt(w.sectors / 2)}, and ${w.targetFavourable} is ${cmp > 0 ? "more" : "less"} — so the chance ${w.targetFavourable}/${w.sectors} sits ${cmp > 0 ? "above" : "below"} 1/2. Benchmarking against a coin flip is the fastest sanity check a probability has.`
    };
  },
  probabilityArea(w) {
    const cmp = w.targetNum * 2 - w.targetDen;
    if (cmp === 0) return null;
    return {
      prompt: `You'll shade ${w.targetNum}/${w.targetDen} of the grid. Will that cover more or less than half of it?`,
      options: [
        { id: "more", label: "More than half" },
        { id: "less", label: "Less than half" },
        { id: "half", label: "Exactly half" }
      ],
      outcomeId: cmp > 0 ? "more" : "less",
      reveal: `Half means the numerator is half the denominator — ${fmt(w.targetDen / 2)}/${w.targetDen} here — and ${w.targetNum} is ${cmp > 0 ? "more" : "less"}. Probability as shaded area makes the benchmark visible before you count a single cell.`
    };
  },
  circleAngleExplore(w) {
    if (w.mode !== "inscribed" && w.mode !== "tangentChord") return null;
    const arc = w.startArc ?? 100;
    const name = w.mode === "inscribed" ? "inscribed angle that watches it" : "angle between the tangent and the chord";
    return {
      prompt: `The arc starts at ${arc}°. The ${name} measures…`,
      options: [
        { id: "half", label: `Half the arc (${fmt(arc / 2)}°)` },
        { id: "same", label: `The same as the arc (${arc}°)` },
        { id: "double", label: `Double the arc (${fmt(arc * 2)}°)` }
      ],
      outcomeId: "half",
      reveal: `It reads ${fmt(arc / 2)}° — half. Only the CENTRAL angle matches its arc; every angle whose vertex sits on the circle gets exactly half, and dragging the arc will hold that ratio pinned.`
    };
  },
  graphZoom(w) {
    if (w.behaviour === "infinite") {
      return {
        prompt: `You'll zoom in at x = ${fmt(w.a)}. What will the two sides of the graph do?`,
        options: [
          { id: "blow", label: "Climb off the screen" },
          { id: "agree", label: "Close in on the same height" },
          { id: "differ", label: "Settle on two different heights" }
        ],
        outcomeId: "blow",
        reveal: `Zooming never tames it — the graph climbs off every window near x = ${fmt(w.a)}. When the values grow without bound, there is no height to agree on, so the limit does not exist.`
      };
    }
    const agree = w.leftValue === w.rightValue;
    if (w.behaviour === "jump" && agree) return null; // inconsistent authoring — skip, never guess
    if ((w.behaviour === "continuous" || w.behaviour === "removable") && !agree) return null;
    return {
      prompt: `You'll zoom in at x = ${fmt(w.a)}. What will the two sides of the graph do?`,
      options: [
        { id: "agree", label: "Close in on the same height" },
        { id: "differ", label: "Settle on two different heights" },
        { id: "blow", label: "Climb off the screen" }
      ],
      outcomeId: agree ? "agree" : "differ",
      reveal: agree
        ? `Both sides close in on ${fmt(w.leftValue)}${w.fAtA === null ? " — even though the point itself is missing" : ""}. A limit only asks where the sides are HEADING, so it exists here${w.fAtA === null ? " despite the hole" : ""}.`
        : `The left side settles at ${fmt(w.leftValue)} and the right at ${fmt(w.rightValue)} — they never agree, no matter how far you zoom. Disagreeing sides is exactly what "the limit does not exist" means.`
    };
  }
};

let converted = 0, skipped = 0;
const byFamily = {};
for (const courseDir of readdirSync(ROOT)) {
  const lessonsDir = path.join(ROOT, courseDir, "lessons");
  if (!existsSync(lessonsDir)) continue;
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const fp = path.join(lessonsDir, f);
    const l = JSON.parse(readFileSync(fp, "utf8"));
    if (l.steps.some((s) => s.predict)) continue;
    let done = false;
    for (const s of l.steps) {
      if (done || s.kind !== "interactive" || !s.widget) continue;
      const gen = GEN[s.widget.type];
      if (!gen) continue;
      const p = gen(s.widget);
      if (!p) { skipped++; continue; }
      s.predict = p;
      byFamily[s.widget.type] = (byFamily[s.widget.type] ?? 0) + 1;
      converted++;
      done = true;
    }
    if (done) writeFileSync(fp, JSON.stringify(l, null, 1));
  }
}
console.log(`converted ${converted} lessons; premise-skipped ${skipped} candidate steps`);
console.log(byFamily);
