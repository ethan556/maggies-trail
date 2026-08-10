import { altitudeMeans, widgetIntegrityErrors, WidgetSpec } from "../../src/lib/schema";

const cases: Array<[string, Array<[number, number]>, number, number, number, number]> = [
  // label, shape, k, expected p, expected q, expected h
  ["sy-04-01 (20, k=.2)", [[0, 0], [20, 0], [4, 8]], 0.2, 4, 16, 8],
  ["sy-04-02 (25, k=.36)", [[0, 0], [25, 0], [9, 12]], 0.36, 9, 16, 12],
  ["sy-04-03 (15, k=.2)", [[0, 0], [15, 0], [3, 6]], 0.2, 3, 12, 6]
];
let bad = 0;
for (const [label, shape, k, p, q, h] of cases) {
  const g = altitudeMeans(shape, k);
  const ok =
    Math.abs(g.p - p) < 1e-9 && Math.abs(g.q - q) < 1e-9 && Math.abs(g.h - h) < 1e-9 &&
    Math.abs(g.legA * g.legA - g.c * g.p) < 1e-9 && Math.abs(g.legB * g.legB - g.c * g.q) < 1e-9;
  const [A, B] = shape;
  const dot = (A[0] - g.apex[0]) * (B[0] - g.apex[0]) + (A[1] - g.apex[1]) * (B[1] - g.apex[1]);
  console.log(
    `${ok && Math.abs(dot) < 1e-9 ? "ok  " : "FAIL"} ${label.padEnd(22)} p=${g.p} q=${g.q} h=${g.h} ` +
    `legA²=${(g.legA * g.legA).toFixed(4)} (c·p=${g.c * g.p}) legB²=${(g.legB * g.legB).toFixed(4)} (c·q=${g.c * g.q}) apexDot=${dot.toFixed(12)}`
  );
  if (!ok || Math.abs(dot) > 1e-9) bad++;
}

// The invariant must hold at EVERY reachable position, not just the authored one.
for (let k = 0.05; k < 0.96; k += 0.05) {
  const g = altitudeMeans([[0, 0], [20, 0], [4, 8]], k);
  if (Math.abs(g.h * g.h - g.p * g.q) > 1e-9) { console.log(`FAIL h² ≠ p·q at k=${k.toFixed(2)}`); bad++; }
}
console.log(bad ? `\n${bad} problem(s)` : "\ngeometry verified at the authored targets and across the whole dial");

const spec = WidgetSpec.parse({
  type: "dilationExplore", prompt: "p", shape: [[0, 0], [25, 0], [9, 12]], center: [0, 0],
  targetK: 0.36, kMin: 0.04, kMax: 0.96, kStep: 0.04, kStart: 0.6, gridMin: 0, gridMax: 26,
  showRatios: ["altitude"], successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
console.log("integrity on a lesson-shaped spec:", widgetIntegrityErrors(spec).length ? widgetIntegrityErrors(spec) : "none");
process.exit(bad ? 1 : 0);
