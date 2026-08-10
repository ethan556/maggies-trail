import type { RepresentationKind } from "@/lib/cml/contracts";
import { exactNumberTruth, exactNumberKey, affineRelationshipTruth, proportionalReasoningTruth, placeValueTransformTruth, quotientReasoningTruth, pointSetReasoningTruth, geometricConstraintTruth, graphStoryTruth, type TWidget } from "@/lib/schema";

export interface CMLMeshCard {
  readonly kind: RepresentationKind;
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
}

export interface CMLMeshSnapshot {
  readonly narration: string;
  readonly cards: readonly CMLMeshCard[];
}

const fmt = (n: number): string => Number(n.toFixed(3)).toString();
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const field = (value: Record<string, unknown>, key: string, fallback: number): number =>
  num(value[key], fallback);
const cmlQuadName = (pts: Array<[number, number]>): string => {
  const d = (i: number, j: number) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
  const side = [d(0, 1), d(1, 2), d(2, 3), d(3, 0)];
  const diag = [d(0, 2), d(1, 3)];
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  const oppEqual = near(side[0], side[2]) && near(side[1], side[3]);
  const allEqual = side.every((x) => near(x, side[0]));
  const diagEqual = near(diag[0], diag[1]);
  if (allEqual && diagEqual) return "a square";
  if (allEqual) return "a rhombus";
  if (oppEqual && diagEqual) return "a rectangle";
  if (oppEqual) return "a parallelogram";
  if (near(side[0], side[1]) && near(side[2], side[3])) return "a kite";
  return "just a quadrilateral";
};

export function buildCMLMesh(spec: TWidget, value: unknown): CMLMeshSnapshot {
  const v = obj(value);
  switch (spec.type) {
    case "lengthCompare": {
      const picked = typeof value === "string"
        ? value
        : value && typeof value === "object" && typeof (value as Record<string, unknown>).picked === "string"
          ? String((value as Record<string, unknown>).picked)
          : "";
      const items = spec.items.map((item) => `${item.label}: ${fmt(item.length)}${spec.unitLabel ? ` ${spec.unitLabel}` : ""}`);
      const answer = spec.items.find((item) => item.id === spec.answerId);
      return {
        narration: `The comparison uses ${spec.items.length} measured objects${spec.unitLabel ? ` in ${spec.unitLabel}` : ""}.`,
        cards: [
          { kind: "diagram", label: "Visible lengths", value: items.join(" · ") },
          { kind: "table", label: "Measurement list", value: items.join(" | ") },
          { kind: "language", label: "Defining comparison", value: answer ? `${answer.label} is the target comparison` : picked || "compare after alignment" }
        ]
      };
    }
    case "tapDiagram": {
      const selected = Array.isArray(value) ? value.map(String) : [];
      const correct = spec.hotspots.filter((spot) => spot.correct).map((spot) => spot.label);
      return {
        narration: `The learner is classifying ${spec.hotspots.length} visible candidates by a defining attribute.`,
        cards: [
          { kind: "diagram", label: "Candidates", value: spec.hotspots.map((spot) => spot.label).join(" · ") },
          { kind: "table", label: "Selected", value: selected.length ? selected.join(", ") : "none yet" },
          { kind: "language", label: "Attribute set", value: correct.join(", ") }
        ]
      };
    }
    case "tenFrame": {
      const total = num(value, spec.preFilled);
      return {
        narration: `${total} counters are arranged inside a ten-frame, leaving ${10 - total} empty spaces.`,
        cards: [
          { kind: "concrete", label: "Frame", value: `${total} filled · ${10 - total} empty` },
          { kind: "symbolic", label: "Number bond", value: `${total} + ${10 - total} = 10` },
          { kind: "language", label: "Structure", value: total === 10 ? "one complete ten" : `${total} is ${10 - total} away from ten` }
        ]
      };
    }
    case "numberLineHop": {
      const landing = num(value, spec.start);
      const operation = spec.direction === "back" ? "−" : "+";
      const signedDistance = landing - spec.start;
      return {
        narration: `The marker starts at ${spec.start} and is currently at ${landing}.`,
        cards: [
          { kind: "number-line", label: "Displacement", value: `${signedDistance >= 0 ? "+" : ""}${signedDistance}` },
          { kind: "symbolic", label: "Operation", value: `${spec.start} ${operation} ${spec.hop} × ${spec.hops} = ${spec.start + (spec.direction === "back" ? -1 : 1) * spec.hop * spec.hops}` },
          { kind: "language", label: "Action", value: `${spec.hops} hop${spec.hops === 1 ? "" : "s"} of ${spec.hop} ${spec.direction === "back" ? "left" : "right"}` }
        ]
      };
    }
    case "numberLinePlace": {
      const current = num(value, spec.start);
      const shown = spec.fractionDen ? `${current}/${spec.fractionDen}` : fmt(current);
      return {
        narration: `The marker is placed at ${shown} on the ordered line.`,
        cards: [
          { kind: "number-line", label: "Position", value: shown },
          { kind: "symbolic", label: "Distance from start", value: fmt(current - spec.min) },
          { kind: "language", label: "Magnitude", value: current < spec.target ? "below the target" : current > spec.target ? "above the target" : "at the target" }
        ]
      };
    }
    case "baseTenCompose": {
      const hundreds = field(v, "hundreds", 0);
      const tens = field(v, "tens", 0);
      const ones = field(v, "ones", 0);
      const total = hundreds * 100 + tens * 10 + ones;
      return {
        narration: `${hundreds} hundreds, ${tens} tens, and ${ones} ones represent ${total}.`,
        cards: [
          { kind: "concrete", label: "Units", value: `${hundreds} flats · ${tens} rods · ${ones} ones` },
          { kind: "table", label: "Place-value chart", value: `H ${hundreds} | T ${tens} | O ${ones}` },
          { kind: "symbolic", label: "Expanded form", value: `${hundreds * 100} + ${tens * 10} + ${ones} = ${total}` }
        ]
      };
    }
    case "placeValue": {
      const h = field(v, "h", spec.hStart);
      const t = field(v, "t", spec.tStart);
      const o = field(v, "o", spec.oStart);
      const total = 100 * h + 10 * t + o;
      return {
        narration: `${h} hundreds, ${t} tens, and ${o} ones currently represent ${total}.`,
        cards: [
          { kind: "concrete", label: "Base-ten units", value: `${h} flats · ${t} rods · ${o} units` },
          { kind: "table", label: "Place-value chart", value: `H ${h} | T ${t} | O ${o}` },
          { kind: "symbolic", label: "Expanded form", value: `${100 * h} + ${10 * t} + ${o} = ${total}` }
        ]
      };
    }
    case "clockSet": {
      const hour = field(v, "hour", 12);
      const minute = field(v, "minute", 0);
      const shown = `${hour}:${String(minute).padStart(2, "0")}`;
      return {
        narration: `The clock shows ${shown}; the minute hand has turned ${minute * 6} degrees and the hour hand has advanced between hour marks.`,
        cards: [
          { kind: "diagram", label: "Analog hand positions", value: `hour ${fmt(((hour % 12) + minute / 60) * 30)}° · minute ${minute * 6}°` },
          { kind: "number-line", label: "Minutes after the hour", value: `${minute} of 60` },
          { kind: "symbolic", label: "Digital time", value: shown }
        ]
      };
    }
    case "plotPoint": {
      const points = Array.isArray(value)
        ? value.filter((point): point is { x: number; y: number } => Boolean(point && typeof point === "object" && Number.isFinite((point as { x?: number }).x) && Number.isFinite((point as { y?: number }).y)))
        : [];
      const pointText = points.length ? points.map((point) => `(${point.x}, ${point.y})`).join(" · ") : "none yet";
      const matched = spec.targets.filter((target) => points.some((point) => point.x === target.x && point.y === target.y)).length;
      return {
        narration: `${points.length} point${points.length === 1 ? " is" : "s are"} plotted; ${matched} of ${spec.targets.length} target coordinates match.`,
        cards: [
          { kind: "graph", label: "Plotted coordinates", value: pointText },
          { kind: "table", label: "Ordered-pair rows", value: pointText },
          { kind: "language", label: "Coordinate order", value: "x moves across first; y moves up second" }
        ]
      };
    }
    case "moneyBoard": {
      if (spec.mode === "count") {
        const counted = Array.isArray(v.counted) ? v.counted.filter((coin): coin is number => typeof coin === "number") : [];
        const running = counted.reduce((sum, coin) => sum + coin, 0);
        const shown = (spec.show ?? []).reduce((sum, group) => sum + group.cents * group.count, 0);
        return {
          narration: `${counted.length} coins have been counted for a running value of ${running} cents.`,
          cards: [
            { kind: "concrete", label: "Counted denominations", value: counted.length ? counted.map((coin) => `${coin}¢`).join(" + ") : "none yet" },
            { kind: "table", label: "Running total", value: `${running}¢ of ${shown}¢` },
            { kind: "symbolic", label: "Entered total", value: typeof v.entry === "number" ? `${v.entry}¢` : "not entered" }
          ]
        };
      }
      const tray = spec.tray ?? [];
      const total = tray.reduce((sum, denomination) => sum + denomination.cents * field(v, String(denomination.cents), 0), 0);
      const target = spec.mode === "change" ? (spec.paidCents ?? 0) - (spec.priceCents ?? 0) : spec.targetCents ?? 0;
      return {
        narration: `The current collection is worth ${total} cents, ${Math.abs(target - total)} cents from the target.`,
        cards: [
          { kind: "concrete", label: "Denomination counts", value: tray.map((denomination) => `${field(v, String(denomination.cents), 0)} × ${denomination.label}`).join(" · ") },
          { kind: "table", label: "Value contributions", value: tray.map((denomination) => `${denomination.cents}×${field(v, String(denomination.cents), 0)}`).join(" + ") },
          { kind: "symbolic", label: "Total value", value: `${total}¢ = $${(total / 100).toFixed(2)}` }
        ]
      };
    }
    case "oddEvenPairs": {
      const ones = spec.mode === "onesDigit" ? spec.n % 10 : spec.n;
      const paired = field(v, "paired", 0);
      const unpaired = Math.max(0, ones - 2 * paired);
      return {
        narration: `${paired} complete pair${paired === 1 ? "" : "s"} use ${2 * paired} objects, leaving ${unpaired} unpaired.`,
        cards: [
          { kind: "concrete", label: "Pair structure", value: `${paired} pairs · ${unpaired} left` },
          { kind: "symbolic", label: "Decomposition", value: `${ones} = 2 × ${paired} + ${unpaired}` },
          { kind: "language", label: "Parity evidence", value: unpaired === 0 ? "even: no singleton" : unpaired === 1 ? "odd: one singleton" : "pairing is not finished" }
        ]
      };
    }
    case "evalOrder": {
      const tokens = Array.isArray(v.tokens) ? v.tokens.map(String) : spec.tokens;
      const history = Array.isArray(v.history) ? v.history.length : 0;
      return {
        narration: `${history} legal collapse${history === 1 ? " has" : "s have"} been made while preserving the expression's value.`,
        cards: [
          { kind: "diagram", label: "Current expression tree", value: tokens.join(" ") },
          { kind: "symbolic", label: "Invariant value", value: `${spec.target}` },
          { kind: "language", label: "Completed transformations", value: `${history}` }
        ]
      };
    }
    case "inversePipeline": {
      const built = Array.isArray(value) ? value.map(String) : [];
      const byId = new Map(spec.tray.map((operation) => [operation.id, operation] as const));
      const operationText = (id: string) => {
        const operation = byId.get(id);
        return operation ? `${operation.op} ${Math.abs(operation.n)}` : id;
      };
      return {
        narration: `${built.length} of ${spec.forward.length} inverse operations have been placed.`,
        cards: [
          { kind: "diagram", label: "Forward pipeline", value: spec.forward.map((operation) => `${operation.op} ${Math.abs(operation.n)}`).join(" → ") },
          { kind: "symbolic", label: "Inverse so far", value: built.length ? built.map(operationText).join(" → ") : "empty" },
          { kind: "language", label: "Structural rule", value: "undo the last forward operation first" }
        ]
      };
    }
    case "percentBar": {
      const percent = num(value, spec.startPercent);
      const amount = spec.whole * percent / 100;
      return {
        narration: `${percent} percent of ${fmt(spec.whole)} corresponds to ${fmt(amount)}${spec.unit ? ` ${spec.unit}` : ""}.`,
        cards: [
          { kind: "diagram", label: "Bar fill", value: `${percent} of 100 parts` },
          { kind: "number-line", label: "Percent position", value: `${percent}%` },
          { kind: "symbolic", label: "Scaled amount", value: `${fmt(spec.whole)} × ${fmt(percent / 100)} = ${fmt(amount)}` }
        ]
      };
    }
    case "solveBalance": {
      const leftX = field(v, "leftX", spec.a);
      const leftUnits = field(v, "leftUnits", spec.b);
      const rightUnits = field(v, "rightUnits", spec.c);
      const solution = (spec.c - spec.b) / spec.a;
      const leftValue = leftX * solution + leftUnits;
      const balanced = leftValue === rightUnits;
      return {
        narration: `At the true solution x = ${fmt(solution)}, the left pan weighs ${fmt(leftValue)} and the right pan weighs ${rightUnits}.`,
        cards: [
          { kind: "diagram", label: "Balance state", value: balanced ? "equal pans" : leftValue > rightUnits ? "left pan heavier" : "right pan heavier" },
          { kind: "symbolic", label: "Current equation", value: `${leftX}x + ${leftUnits} = ${rightUnits}` },
          { kind: "language", label: "Solution-set invariant", value: balanced ? "the legal moves still preserve the solution" : "an unequal move changed the solution set" }
        ]
      };
    }
    case "estimateSlider": {
      const estimate = num(value, spec.start ?? spec.min);
      const ratio = estimate >= spec.target ? estimate / spec.target : spec.target / estimate;
      return {
        narration: `The estimate is ${fmt(estimate)}${spec.unitLabel ? ` ${spec.unitLabel}` : ""}, a multiplicative factor of ${fmt(ratio)} from the target.`,
        cards: [
          { kind: "number-line", label: "Order-of-magnitude position", value: fmt(estimate) },
          { kind: "symbolic", label: "Multiplicative distance", value: `×${fmt(ratio)}` },
          { kind: "language", label: "Direction", value: estimate < spec.target ? "below the target" : estimate > spec.target ? "above the target" : "at the target" }
        ]
      };
    }
    case "fractionBar": {
      const n = field(v, "n", spec.numStart);
      const d = field(v, "d", spec.denStart);
      const decimal = d ? n / d : 0;
      const target = spec.targetNum / spec.targetDen;
      return {
        narration: `${n} of ${d} equal parts are shaded, locating the value ${fmt(decimal)}.`,
        cards: [
          { kind: "diagram", label: "Partition", value: `${n} shaded of ${d}` },
          { kind: "number-line", label: "Point", value: fmt(decimal), detail: decimal === target ? "same point as target" : decimal < target ? "left of target" : "right of target" },
          { kind: "symbolic", label: "Equivalent value", value: `${n}/${d} = ${fmt(decimal)}` }
        ]
      };
    }
    case "fractionGrid": {
      const rows = field(v, "rows", 1);
      const cols = field(v, "cols", 1);
      const shadedRows = field(v, "shadeR", 0);
      const shadedCols = field(v, "shadeC", 0);
      const total = Math.max(1, rows * cols);
      const overlap = Math.max(0, shadedRows * shadedCols);
      return {
        narration: `A ${rows} by ${cols} grid has ${overlap} overlap cells out of ${total}.`,
        cards: [
          { kind: "diagram", label: "Grid", value: `${rows} × ${cols} = ${total} cells` },
          { kind: "symbolic", label: "Overlap fraction", value: `${overlap}/${total}` },
          { kind: "language", label: "Product meaning", value: "the overlap is the part selected by both factors" }
        ]
      };
    }
    case "areaModel": {
      if (spec.countGrid) {
        const count = typeof value === "number" ? num(value, 0) : field(v, "count", 0);
        return {
          narration: `The fixed grid has ${spec.hStart} rows and ${spec.wStart} columns. ${count} of its unit squares are marked as counted.`,
          cards: [
            { kind: "diagram", label: "Given grid", value: `${spec.hStart} rows of ${spec.wStart}` },
            { kind: "table", label: "Counted so far", value: `${count} squares` },
            { kind: "symbolic", label: "Row structure", value: `${spec.hStart} groups of ${spec.wStart}` }
          ]
        };
      }
      const w = field(v, "w", spec.wStart);
      const h = field(v, "h", spec.hStart);
      const area = w * h;
      return {
        narration: `The rectangle is ${w} units wide and ${h} units high, so it contains ${area} unit squares.`,
        cards: [
          { kind: "diagram", label: "Rows and columns", value: `${h} rows of ${w}` },
          { kind: "table", label: "Dimensions", value: `width ${w} · height ${h}` },
          { kind: "symbolic", label: "Product", value: `${w} × ${h} = ${area}` }
        ]
      };
    }
    case "volumeBuilder": {
      const l = field(v, "l", spec.lStart);
      const w = field(v, "w", spec.wStart);
      const h = field(v, "h", spec.hStart);
      return {
        narration: `${h} layers each contain ${l * w} cubes, for ${l * w * h} cubes altogether.`,
        cards: [
          { kind: "concrete", label: "Layer", value: `${l} × ${w} = ${l * w} cubes` },
          { kind: "diagram", label: "Stack", value: `${h} layer${h === 1 ? "" : "s"}` },
          { kind: "symbolic", label: "Volume", value: `${l} × ${w} × ${h} = ${l * w * h}` }
        ]
      };
    }
    case "ratioTable": {
      const b = num(value, spec.bStart);
      const base = spec.rows[0] ?? [1, 1];
      const unitRate = base[0] === 0 ? 0 : base[1] / base[0];
      const currentRate = spec.askA === 0 ? 0 : b / spec.askA;
      return {
        narration: `The pair ${spec.askA} to ${fmt(b)} has a unit rate of ${fmt(currentRate)}.`,
        cards: [
          { kind: "table", label: "Current pair", value: `${spec.askA} ↔ ${fmt(b)}` },
          { kind: "symbolic", label: "Unit rate", value: `${fmt(b)} ÷ ${spec.askA} = ${fmt(currentRate)}` },
          { kind: "graph", label: "Proportional test", value: Math.abs(currentRate - unitRate) < 1e-9 ? "lies on the same line through the origin" : "breaks the original line" }
        ]
      };
    }
    case "doubleNumberLine": {
      const top = num(value, 0);
      const bottom = spec.askAtStep * spec.bottomPerStep;
      const rate = bottom === 0 ? 0 : top / bottom;
      return {
        narration: `At the marked tick, ${fmt(top)} on the top line is paired with ${fmt(bottom)} on the bottom line.`,
        cards: [
          { kind: "number-line", label: "Aligned pair", value: `${fmt(top)} ↔ ${fmt(bottom)}` },
          { kind: "table", label: "Pair row", value: `[${fmt(top)}, ${fmt(bottom)}]` },
          { kind: "symbolic", label: "Rate", value: `${fmt(top)} ÷ ${fmt(bottom)} = ${fmt(rate)}` }
        ]
      };
    }
    case "integerChips": {
      const pos = field(v, "pos", spec.posStart);
      const neg = field(v, "neg", spec.negStart);
      const pairs = Math.min(pos, neg);
      const total = pos - neg;
      return {
        narration: `${pairs} positive-negative pairs cancel, leaving a value of ${total}.`,
        cards: [
          { kind: "concrete", label: "Chips", value: `+${pos} and −${neg}` },
          { kind: "diagram", label: "Zero pairs", value: `${pairs}` },
          { kind: "symbolic", label: "Net value", value: `${pos} − ${neg} = ${total}` }
        ]
      };
    }
    case "balanceScale": {
      const x = field(v, "x", spec.xStart);
      const left = spec.a * x + spec.b;
      return {
        narration: `With x equal to ${x}, the left side is ${left} and the right side is ${spec.c}.`,
        cards: [
          { kind: "diagram", label: "Pan comparison", value: left === spec.c ? "balanced" : left > spec.c ? "left is heavier" : "right is heavier" },
          { kind: "symbolic", label: "Equation state", value: `${spec.a}(${x}) ${spec.b >= 0 ? "+" : "−"} ${Math.abs(spec.b)} = ${left}` },
          { kind: "language", label: "Difference", value: fmt(left - spec.c) }
        ]
      };
    }
    case "functionMachine": {
      const input = num(value, spec.inputStart);
      const output = spec.a * input + spec.b;
      return {
        narration: `Input ${input} is transformed by the rule into output ${output}.`,
        cards: [
          { kind: "table", label: "Input → output", value: `${input} → ${output}` },
          { kind: "symbolic", label: "Rule", value: `y = ${spec.a}x ${spec.b >= 0 ? "+" : "−"} ${Math.abs(spec.b)}` },
          { kind: "graph", label: "Point", value: `(${input}, ${output})` }
        ]
      };
    }
    case "lineExplore": {
      const m = field(v, "m", spec.slopeStart);
      const b = field(v, "b", spec.interceptStart);
      return {
        narration: `The line has slope ${m} and vertical intercept ${b}.`,
        cards: [
          { kind: "graph", label: "Movement", value: `rise ${m} for run 1` },
          { kind: "table", label: "Two points", value: `(0, ${b}) · (1, ${m + b})` },
          { kind: "symbolic", label: "Equation", value: `y = ${m}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)}` }
        ]
      };
    }
    case "quadraticExplore": {
      const a = field(v, "a", spec.aStart), h = field(v, "h", spec.hStart), k = field(v, "k", spec.kStart);
      const x1 = h - 1, x2 = h, x3 = h + 1;
      const y1 = a * (x1 - h) ** 2 + k, y2 = k, y3 = a * (x3 - h) ** 2 + k;
      return {
        narration: `The parabola has vertex (${fmt(h)}, ${fmt(k)}); a = ${fmt(a)} controls its opening and width.`,
        cards: [
          { kind: "graph", label: "Graph state", value: `vertex (${fmt(h)}, ${fmt(k)}) · ${a < 0 ? "opens down" : "opens up"}` },
          { kind: "table", label: "Symmetric values", value: `(${fmt(x1)}, ${fmt(y1)}) | (${fmt(x2)}, ${fmt(y2)}) | (${fmt(x3)}, ${fmt(y3)})` },
          { kind: "symbolic", label: "Vertex form", value: `y = ${fmt(a)}(x − ${fmt(h)})² + ${fmt(k)}` }
        ]
      };
    }
    case "expLogExplore": {
      const b = typeof value === "number" ? value : spec.startBase;
      const output = spec.mode === "exponential" ? b ** spec.x : Math.log(spec.x) / Math.log(b);
      const relation = Math.abs(b - 1) < 1e-9 ? "boundary" : b > 1 ? "growth" : "decay";
      const table = [-1, 0, 1, 2].map((x) => `${x}:${fmt(b ** x)}`).join(" | ");
      return {
        narration: `Base ${fmt(b)} produces ${relation}; equal input steps multiply outputs by the same factor ${fmt(b)}.`,
        cards: [
          { kind: "graph", label: "Curve behavior", value: relation },
          { kind: "table", label: "Exponential table", value: table },
          { kind: "symbolic", label: "Current readout", value: spec.mode === "exponential" ? `${fmt(b)}^${fmt(spec.x)} = ${fmt(output)}` : `log_${fmt(b)}(${fmt(spec.x)}) = ${fmt(output)}` }
        ]
      };
    }
    case "systemsExplore": {
      const x = field(v, "x", spec.xStart);
      const y = field(v, "y", spec.yStart);
      const on1 = y === spec.m1 * x + spec.b1;
      const on2 = y === spec.m2 * x + spec.b2;
      const parallel = spec.m1 === spec.m2;
      const sx = parallel ? null : (spec.b2 - spec.b1) / (spec.m1 - spec.m2);
      const sy = sx === null ? null : spec.m1 * sx + spec.b1;
      return {
        narration: `The selected point ${x}, ${y} satisfies ${Number(on1) + Number(on2)} of the two constraints.`,
        cards: [
          { kind: "table", label: "Candidate point", value: `(${x}, ${y})` },
          { kind: "symbolic", label: "Constraint test", value: `line 1 ${on1 ? "✓" : "✗"} · line 2 ${on2 ? "✓" : "✗"}` },
          { kind: "graph", label: "Shared solution", value: parallel ? (spec.b1 === spec.b2 ? "infinitely many" : "none") : `(${fmt(sx ?? 0)}, ${fmt(sy ?? 0)})` }
        ]
      };
    }
    case "scatterFit": {
      const m = field(v, "m", spec.mStart);
      const b = field(v, "b", spec.bStart);
      const mse = spec.points.reduce((sum, [x, y]) => sum + (y - (m * x + b)) ** 2, 0) / spec.points.length;
      const above = spec.points.filter(([x, y]) => y > m * x + b).length;
      const below = spec.points.filter(([x, y]) => y < m * x + b).length;
      return {
        narration: `The fitted line has mean squared miss ${fmt(mse)}, with ${above} points above and ${below} below.`,
        cards: [
          { kind: "graph", label: "Residual balance", value: `${above} above · ${below} below` },
          { kind: "symbolic", label: "Model", value: `y = ${fmt(m)}x ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b))}` },
          { kind: "table", label: "Mean squared miss", value: fmt(mse) }
        ]
      };
    }
    case "angleMeasure": {
      const angle = num(value, spec.angleStart);
      return {
        narration: `The opening measures ${angle} degrees regardless of how long the rays are drawn.`,
        cards: [
          { kind: "diagram", label: "Turn", value: `${angle}°` },
          { kind: "language", label: "Class", value: angle < 90 ? "acute" : angle === 90 ? "right" : angle < 180 ? "obtuse" : "straight" },
          { kind: "symbolic", label: "Difference from target", value: `${Math.abs(spec.targetAngle - angle)}°` }
        ]
      };
    }
    case "algebraTiles": {
      const x = field(v, "x", spec.xStart);
      const c = field(v, "c", spec.constStart);
      return {
        narration: `${Math.abs(x)} x-tile${Math.abs(x) === 1 ? "" : "s"} and ${Math.abs(c)} unit tile${Math.abs(c) === 1 ? "" : "s"} represent ${x}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)}.`,
        cards: [
          { kind: "concrete", label: "Tile inventory", value: `${x} x-tiles · ${c} unit tiles` },
          { kind: "table", label: "Like-unit coefficients", value: `x: ${x} | units: ${c}` },
          { kind: "symbolic", label: "Expression", value: `${x}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)}` }
        ]
      };
    }
    case "mixedRegroup": {
      const whole = field(v, "whole", spec.aWhole);
      const parts = field(v, "num", spec.aNum);
      const assembledWhole = typeof v.wholes === "number" ? v.wholes : whole;
      const assembledParts = typeof v.parts === "number" ? v.parts : parts;
      return {
        narration: `${whole} whole${whole === 1 ? "" : "s"} and ${parts}/${spec.den} preserve the same amount while wholes are exchanged for ${spec.den} equal parts.`,
        cards: [
          { kind: "diagram", label: "Current units", value: `${whole} whole · ${parts} parts of size 1/${spec.den}` },
          { kind: "symbolic", label: "Improper value", value: `${whole * spec.den + parts}/${spec.den}` },
          { kind: "language", label: "Assembled result", value: `${assembledWhole} and ${assembledParts}/${spec.den}` }
        ]
      };
    }
    case "columnCalc": {
      const written = Array.isArray(v.written) ? v.written : [];
      const completed = written.filter((digit) => typeof digit === "number").length;
      const truth = spec.op === "add" ? spec.a + spec.b : spec.op === "subtract" ? spec.a - spec.b : spec.a * spec.b;
      return {
        narration: `${completed} place-value column${completed === 1 ? " is" : "s are"} resolved; carries and borrows must move into the adjacent unit column.`,
        cards: [
          { kind: "table", label: "Resolved columns", value: `${completed} of ${written.length || String(spec.a).length}` },
          { kind: "symbolic", label: "Operation", value: `${spec.a} ${spec.op === "add" ? "+" : spec.op === "subtract" ? "−" : "×"} ${spec.b}` },
          { kind: "language", label: "Target value", value: `${truth}`, detail: "Every written digit keeps its place value." }
        ]
      };
    }
    case "netFold": {
      const l = field(v, "l", spec.lStart);
      const w = field(v, "w", spec.wStart);
      const h = field(v, "h", spec.hStart);
      const sa = 2 * (l * w + l * h + w * h);
      return {
        narration: `The six faces occur in three congruent pairs and total ${sa} square units.`,
        cards: [
          { kind: "concrete", label: "Face pairs", value: `2(${l}×${w}) · 2(${l}×${h}) · 2(${w}×${h})` },
          { kind: "table", label: "Face areas", value: `${l * w}, ${l * h}, ${w * h} — each twice` },
          { kind: "symbolic", label: "Surface area", value: `2(${l * w} + ${l * h} + ${w * h}) = ${sa}` }
        ]
      };
    }
    case "fractionOfSet": {
      const selected = num(value, 0);
      const target = (spec.setSize * spec.num) / spec.den;
      return {
        narration: `${selected} of ${spec.setSize} objects are selected; the target fraction selects ${fmt(target)} objects.`,
        cards: [
          { kind: "concrete", label: "Selected set", value: `${selected} chosen · ${spec.setSize - selected} not chosen` },
          { kind: "diagram", label: "Equal groups", value: `${spec.den} groups of ${fmt(spec.setSize / spec.den)}` },
          { kind: "symbolic", label: "Fraction of a set", value: `${spec.num}/${spec.den} × ${spec.setSize} = ${fmt(target)}` }
        ]
      };
    }
    case "dotPlot": {
      const counts = Array.isArray(value) ? value.map((n) => num(n, 0)) : spec.values.map(() => 0);
      const total = counts.reduce((a, b) => a + b, 0);
      const weighted = counts.reduce((sum, count, i) => sum + count * spec.values[i], 0);
      return {
        narration: `${total} data point${total === 1 ? " is" : "s are"} distributed across ${spec.values.length} values.`,
        cards: [
          { kind: "diagram", label: "Stack heights", value: spec.values.map((x, i) => `${x}:${counts[i]}`).join(" · ") },
          { kind: "table", label: "Frequency table", value: spec.values.map((x, i) => `${x}→${counts[i]}`).join(" | ") },
          { kind: "symbolic", label: "Current mean", value: total ? fmt(weighted / total) : "not defined yet" }
        ]
      };
    }
    case "boxPlot": {
      const min = field(v, "min", spec.startMin), q1 = field(v, "q1", spec.startQ1), med = field(v, "med", spec.startMed), q3 = field(v, "q3", spec.startQ3), max = field(v, "max", spec.startMax);
      return {
        narration: `The five-number summary spans ${max - min} units; the middle half spans ${q3 - q1}.`,
        cards: [
          { kind: "diagram", label: "Five-number skeleton", value: `${min} — [${q1} | ${med} | ${q3}] — ${max}` },
          { kind: "table", label: "Ordered summary", value: `min ${min} | Q1 ${q1} | median ${med} | Q3 ${q3} | max ${max}` },
          { kind: "symbolic", label: "Spread", value: `range ${max - min} · IQR ${q3 - q1}` }
        ]
      };
    }
    case "dilationExplore": {
      const k = field(v, "k", spec.kStart);
      const [cx, cy] = spec.center;
      const first = spec.shape[0];
      const image = [cx + k * (first[0] - cx), cy + k * (first[1] - cy)];
      return {
        narration: `A scale factor of ${fmt(k)} multiplies every distance from the center while preserving angle measures.`,
        cards: [
          { kind: "graph", label: "One vertex image", value: `(${first[0]}, ${first[1]}) → (${fmt(image[0])}, ${fmt(image[1])})` },
          { kind: "table", label: "Scale consequences", value: `length ×${fmt(k)} | area ×${fmt(k * k)}` },
          { kind: "symbolic", label: "Coordinate rule", value: `(x, y) → (${cx} + ${fmt(k)}(x−${cx}), ${cy} + ${fmt(k)}(y−${cy}))` }
        ]
      };
    }
    case "barBuilder": {
      const heights = Array.isArray(value) ? value.map((n) => num(n, 0)) : spec.categories.map(() => 0);
      return {
        narration: `Each bar height is a frequency measured on one shared scale.`,
        cards: [
          { kind: "diagram", label: spec.histogram ? "Touching bin heights" : "Category bar heights", value: heights.join(" · ") },
          { kind: "table", label: "Category-frequency pairs", value: spec.categories.map((c, i) => `${c}: ${heights[i]}`).join(" | ") },
          { kind: "symbolic", label: "Total frequency", value: `${heights.reduce((a, b) => a + b, 0)}` }
        ]
      };
    }
    case "probabilityArea": {
      const shaded = num(value, spec.start);
      const total = spec.rows * spec.cols;
      return {
        narration: `${shaded} of ${total} equal-area cells are favorable.`,
        cards: [
          { kind: "diagram", label: "Favorable region", value: `${shaded} shaded · ${total - shaded} unshaded` },
          { kind: "table", label: "Part and whole", value: `favorable ${shaded} | total ${total}` },
          { kind: "symbolic", label: "Probability", value: `${shaded}/${total} = ${fmt(total ? shaded / total : 0)}` }
        ]
      };
    }
    case "transformExplore": {
      const dx = field(v, "dx", 0), dy = field(v, "dy", 0);
      const reflect = typeof v.reflect === "string" ? v.reflect : "none";
      const first = spec.shape[0];
      return {
        narration: `The figure is reflected by ${reflect} and translated by (${dx}, ${dy}); rigid moves preserve side lengths and angles.`,
        cards: [
          { kind: "diagram", label: "Transformation recipe", value: `${reflect === "none" ? "no reflection" : `reflect ${reflect}`} · shift ${dx}, ${dy}` },
          { kind: "table", label: "Control values", value: `dx ${dx} | dy ${dy} | reflect ${reflect}` },
          { kind: "symbolic", label: "Translation component", value: `(${first[0]}, ${first[1]}) + (${dx}, ${dy})` }
        ]
      };
    }
    case "distanceGrid": {
      const x = field(v, "x", spec.startX), y = field(v, "y", spec.startY);
      const dx = x - spec.anchor[0], dy = y - spec.anchor[1];
      return {
        narration: `The horizontal and vertical displacements are ${dx} and ${dy}; together they determine the straight-line distance.`,
        cards: [
          { kind: "graph", label: "Endpoints", value: `(${spec.anchor[0]}, ${spec.anchor[1]}) → (${x}, ${y})` },
          { kind: "table", label: "Displacement components", value: `Δx ${dx} | Δy ${dy}` },
          { kind: "symbolic", label: "Distance", value: `√(${dx}² + ${dy}²) = ${fmt(Math.hypot(dx, dy))}` }
        ]
      };
    }
    case "treeDiagram": {
      const a = field(v, "a", spec.aStart), b = field(v, "b", spec.bStart);
      return {
        narration: `${a} first-stage branches followed by ${b} branches each create ${a * b} complete paths.`,
        cards: [
          { kind: "diagram", label: "Branch structure", value: `${a} × ${b} leaves` },
          { kind: "table", label: "Outcome count", value: `${spec.stage1Label}: ${a} | ${spec.stage2Label}: ${b}` },
          { kind: "symbolic", label: "Fundamental count", value: `${a} × ${b} = ${a * b}` }
        ]
      };
    }
    case "spinnerSim": {
      const favorable = num(value, spec.favourableStart);
      return {
        narration: `${favorable} of ${spec.sectors} equal sectors are favorable.`,
        cards: [
          { kind: "concrete", label: "Spinner sectors", value: `${favorable} winning · ${spec.sectors - favorable} other` },
          { kind: "table", label: "Outcome counts", value: `favorable ${favorable} | total ${spec.sectors}` },
          { kind: "symbolic", label: "Theoretical probability", value: `${favorable}/${spec.sectors} = ${fmt(favorable / spec.sectors)}` }
        ]
      };
    }
    case "argandExplore": {
      const re = field(v, "re", spec.reStart), im = field(v, "im", spec.imStart);
      const productRe = spec.mode === "multiply" ? re * spec.mulRe - im * spec.mulIm : re;
      const productIm = spec.mode === "multiply" ? re * spec.mulIm + im * spec.mulRe : im;
      const zMag = Math.hypot(re, im), wMag = Math.hypot(spec.mulRe, spec.mulIm), productMag = Math.hypot(productRe, productIm);
      const arg = (x: number, y: number) => ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
      return {
        narration: spec.mode === "multiply"
          ? `The input ${fmt(re)} + ${fmt(im)}i is rotated and scaled to ${fmt(productRe)} + ${fmt(productIm)}i.`
          : `The complex number ${fmt(re)} + ${fmt(im)}i is the point (${fmt(re)}, ${fmt(im)}) on the Argand plane.`,
        cards: [
          { kind: "graph", label: "Complex-plane position", value: `z = (${fmt(re)}, ${fmt(im)})${spec.mode === "multiply" ? ` → zw = (${fmt(productRe)}, ${fmt(productIm)})` : ""}` },
          { kind: "table", label: "Magnitude and direction", value: `|z| ${fmt(zMag)} · arg z ${fmt(arg(re, im))}°${spec.mode === "multiply" ? ` | |w| ${fmt(wMag)} · |zw| ${fmt(productMag)}` : ""}` },
          { kind: "symbolic", label: spec.mode === "multiply" ? "Product rule" : "Coordinate form", value: spec.mode === "multiply" ? `(${fmt(re)} + ${fmt(im)}i)(${fmt(spec.mulRe)} + ${fmt(spec.mulIm)}i) = ${fmt(productRe)} + ${fmt(productIm)}i` : `${fmt(re)} + ${fmt(im)}i` }
        ]
      };
    }
    case "signChart": {
      const signs = Array.isArray(value) ? value : [];
      const roots = spec.roots.map((r) => `${r.x} (m=${r.mult})`).join(" · ");
      return {
        narration: `The roots split the line into ${spec.roots.length + 1} intervals; odd multiplicity flips the sign and even multiplicity preserves it.`,
        cards: [
          { kind: "graph", label: "Current interval signs", value: signs.length ? signs.join(" | ") : "choose every interval sign" },
          { kind: "table", label: "Roots and multiplicities", value: roots },
          { kind: "symbolic", label: "Cross-or-bounce rule", value: "odd m → sign flips · even m → sign stays" }
        ]
      };
    }
    case "radicalCheck": {
      const x = typeof value === "number" ? value : spec.start;
      const squaredPass = x * x === x + spec.inside;
      const originalPass = x + spec.inside >= 0 && Math.abs(Math.sqrt(x + spec.inside) - x) < 1e-9;
      return {
        narration: `Candidate x = ${fmt(x)} ${squaredPass ? "passes" : "fails"} the squared equation and ${originalPass ? "passes" : "fails"} the original equation.`,
        cards: [
          { kind: "diagram", label: "Two-stage validity check", value: `squared ${squaredPass ? "✓" : "✗"} · original ${originalPass ? "✓" : "✗"}` },
          { kind: "table", label: "Substitution values", value: `x² = ${fmt(x * x)} | x + ${spec.inside} = ${fmt(x + spec.inside)} | √(x + ${spec.inside}) = ${x + spec.inside >= 0 ? fmt(Math.sqrt(x + spec.inside)) : "not real"}` },
          { kind: "symbolic", label: "Solution-set rule", value: "a transformed equation may create candidates; only the original equation certifies a solution" }
        ]
      };
    }
    case "graphZoom": {
      const zoom = field(v, "zoom", 0);
      const verdict = typeof v.verdict === "string" ? v.verdict : "not chosen";
      const nearby = spec.behaviour === "infinite" ? "magnitudes grow without bound" : `left → ${fmt(spec.leftValue)} · right → ${fmt(spec.rightValue)}`;
      return {
        narration: `After ${zoom} magnifications around x = ${fmt(spec.a)}, the nearby behavior is ${nearby}.`,
        cards: [
          { kind: "graph", label: "Magnified neighborhood", value: `zoom ${zoom}/${spec.requiredZoom} · ${spec.behaviour}` },
          { kind: "table", label: "Point versus approach", value: `f(${fmt(spec.a)}) = ${spec.fAtA === null ? "not defined" : fmt(spec.fAtA)} | ${nearby}` },
          { kind: "symbolic", label: "Current limit verdict", value: verdict }
        ]
      };
    }
    case "sequenceBuild": {
      const dial = typeof value === "number" ? value : spec.start;
      if (spec.mode === "arithmetic") {
        const terms = Array.from({ length: 5 }, (_, i) => spec.first + i * dial);
        const nth = spec.first + (spec.atPosition - 1) * dial;
        return {
          narration: `A common difference of ${fmt(dial)} produces equal additive change and term ${spec.atPosition} = ${fmt(nth)}.`,
          cards: [
            { kind: "diagram", label: "First terms", value: terms.map(fmt).join(" → ") },
            { kind: "table", label: "Position and term", value: terms.map((t, i) => `${i + 1}:${fmt(t)}`).join(" | ") },
            { kind: "symbolic", label: "Explicit rule", value: `aₙ = ${fmt(spec.first)} + (n−1)(${fmt(dial)})` }
          ]
        };
      }
      const r = dial / 10;
      const terms = Array.from({ length: 5 }, (_, i) => spec.first * Math.pow(r, i));
      const partial = terms.reduce((a, b) => a + b, 0);
      const limit = Math.abs(r) < 1 ? spec.first / (1 - r) : null;
      return {
        narration: `A common ratio of ${fmt(r)} creates multiplicative change; the first five terms sum to ${fmt(partial)}${limit === null ? " and the series does not converge" : ` toward ${fmt(limit)}`}.`,
        cards: [
          { kind: "diagram", label: "Term sizes", value: terms.map(fmt).join(" → ") },
          { kind: "graph", label: "Partial-sum behavior", value: limit === null ? "no finite ceiling" : `approaches ${fmt(limit)}` },
          { kind: "symbolic", label: "Infinite-sum condition", value: limit === null ? "|r| ≥ 1 → divergent" : `S = ${fmt(spec.first)}/(1−${fmt(r)}) = ${fmt(limit)}` }
        ]
      };
    }
    case "unitCircleExplore": {
      const angle = field(v, "angle", spec.angleStart);
      const rad = angle * Math.PI / 180;
      const c = Math.cos(rad), s = Math.sin(rad);
      const normalized = ((angle % 360) + 360) % 360;
      const quadrant = normalized === 0 || normalized === 90 || normalized === 180 || normalized === 270 ? "axis" : normalized < 90 ? "I" : normalized < 180 ? "II" : normalized < 270 ? "III" : "IV";
      const ref = quadrant === "axis" ? 0 : normalized < 90 ? normalized : normalized < 180 ? 180 - normalized : normalized < 270 ? normalized - 180 : 360 - normalized;
      return {
        narration: `At ${fmt(angle)}°, the unit-circle point is (${fmt(c)}, ${fmt(s)}); quadrant ${quadrant} sets the signs and the reference angle is ${fmt(ref)}°.`,
        cards: [
          { kind: "diagram", label: "Angle and reference triangle", value: `θ ${fmt(angle)}° · reference ${fmt(ref)}° · quadrant ${quadrant}` },
          { kind: "table", label: "Coordinates", value: `x = cos θ = ${fmt(c)} | y = sin θ = ${fmt(s)}` },
          { kind: "symbolic", label: "Unit-circle invariant", value: `cos²θ + sin²θ = ${fmt(c * c + s * s)}` }
        ]
      };
    }
    case "sampleSim": {
      const size = field(v, "size", spec.sizes[0]);
      const draws = field(v, "draws", 0);
      return {
        narration: `${draws} samples of size ${size} have been drawn from a population with proportion ${fmt(spec.populationP)}.`,
        cards: [
          { kind: "table", label: "Simulation design", value: `n = ${size} · repeats = ${draws}` },
          { kind: "graph", label: "Sampling-distribution prediction", value: `center near ${fmt(spec.populationP)}; larger n → tighter pile` },
          { kind: "symbolic", label: "Typical standard error", value: `≈ ${fmt(Math.sqrt(spec.populationP * (1 - spec.populationP) / size))}` }
        ]
      };
    }
    case "shuffleTest": {
      const shuffles = field(v, "shuffles", 0);
      const verdict = typeof v.verdict === "string" ? v.verdict : "not chosen";
      const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
      const observed = mean(spec.groupA) - mean(spec.groupB);
      return {
        narration: `${shuffles} random relabellings test whether chance alone can reproduce the observed gap of ${fmt(observed)}.`,
        cards: [
          { kind: "graph", label: "Null-distribution progress", value: `${shuffles} shuffled gaps` },
          { kind: "table", label: "Observed groups", value: `${spec.groupALabel} − ${spec.groupBLabel} = ${fmt(observed)}` },
          { kind: "symbolic", label: "Current verdict", value: verdict }
        ]
      };
    }
    case "triangleConstraintLab": {
      const criterion=typeof v.criterion==="string"?v.criterion:spec.startCriterion;
      const angle=field(v,"angle",spec.angleStart), ratio=spec.sideB*Math.sin(angle*Math.PI/180)/spec.sideA;
      const b1=Math.asin(Math.min(1,Math.max(-1,ratio))),b2=Math.PI-b1,c2=Math.PI-angle*Math.PI/180-b2;
      const candidates=criterion==="SSA"?(ratio>1+1e-9?0:c2>1e-9?2:1):1;
      return { narration:`${criterion} at ${fmt(angle)}° leaves ${candidates} possible ${candidates===1?"triangle":candidates===0?"triangles":"noncongruent triangles"}.`, cards:[{kind:"diagram",label:"Constraint experiment",value:`${criterion} · ${candidates} candidate${candidates===1?"":"s"}`},{kind:"table",label:"Degrees of freedom",value:candidates===1?"0 — shape is locked":candidates===0?"inconsistent givens":"1 unresolved branch"},{kind:"symbolic",label:"Congruence verdict",value:candidates===1?`${criterion} ⇒ unique triangle`:candidates===0?"no triangle exists":"SSA ⇏ congruence"}] };
    }
    case "coordinateProofLab": {
      const x=field(v,"x",spec.start[0]),y=field(v,"y",spec.start[1]),evidence=Array.isArray(v.evidence)?v.evidence.join(", "):"none";
      const [A,B,C]=spec.fixed,D:[number,number]=[x,y];
      const slope=(p:[number,number],q:[number,number])=>Math.abs(q[0]-p[0])<1e-9?"vertical":fmt((q[1]-p[1])/(q[0]-p[0]));
      const mid=(p:[number,number],q:[number,number])=>`(${fmt((p[0]+q[0])/2)}, ${fmt((p[1]+q[1])/2)})`;
      return { narration:`D = (${fmt(x)}, ${fmt(y)}); the proof currently inspects ${evidence}.`, cards:[{kind:"graph",label:"Coordinate figure",value:`A${A} B${B} C${C} D(${fmt(x)},${fmt(y)})`},{kind:"table",label:"Opposite-side slopes",value:`AB ${slope(A,B)} / CD ${slope(C,D)} · BC ${slope(B,C)} / AD ${slope(A,D)}`},{kind:"symbolic",label:"Diagonal midpoints",value:`M_AC ${mid(A,C)} · M_BD ${mid(B,D)}`}] };
    }
    case "solidSliceLab": {
      const f=field(v,"fraction",spec.startFraction),base=spec.baseArea??Math.PI*spec.radius*spec.radius;
      const area=spec.solid==="cylinder"||spec.solid==="prism"?base:spec.solid==="cone"?base*(1-f)*(1-f):Math.PI*Math.max(0,spec.radius*spec.radius-Math.pow(-spec.radius+2*spec.radius*f,2));
      return { narration:`At ${fmt(f*100)}% of the ${spec.solid}'s height, the cross-section area is ${fmt(area)}.`, cards:[{kind:"diagram",label:"Section plane",value:`height fraction ${fmt(f)}`},{kind:"table",label:"Area comparison",value:`current ${fmt(area)} | base ${fmt(base)}`},{kind:"symbolic",label:"Cavalieri test",value:spec.solid==="cylinder"||spec.solid==="prism"?"A(h) = constant":"A(h) changes with height"}] };
    }
    case "triangleSolve": {
      const dial=typeof value==="number"?value:spec.start;
      return { narration:`The ${spec.mode.toUpperCase()} triangle is controlled by ${fmt(dial)}° while side and angle consequences update together.`, cards:[{kind:"diagram",label:"Triangle givens",value:`sides ${fmt(spec.a)}, ${fmt(spec.b)} · dial ${fmt(dial)}°`},{kind:"table",label:"Target measurement",value:fmt(spec.target)},{kind:"symbolic",label:"Law of cosines",value:"c² = a² + b² − 2ab cos C"}] };
    }
    case "circleMeasureExplore": {
      const dial=typeof value==="number"?value:spec.start;
      return { narration:`The ${spec.mode} measurement is controlled at ${fmt(dial)} while the circle relationships remain exact.`, cards:[{kind:"diagram",label:"Circle configuration",value:`${spec.mode} · radius ${fmt(spec.radius)}`},{kind:"table",label:"Current control",value:fmt(dial)},{kind:"symbolic",label:"Invariant",value:spec.mode==="tangentLength"?"radius ⟂ tangent; PA = PB":"circle relationship preserved"}] };
    }
    case "compassConstruct": {
      const radius=typeof value==="number"?value:spec.start;
      return { narration:`The compass is opened to ${fmt(radius)} across a span of ${fmt(spec.span)}; equal-radius arcs carry exact distance evidence.`, cards:[{kind:"concrete",label:"Compass opening",value:fmt(radius)},{kind:"diagram",label:"Arc intersection",value:radius>spec.span/2?"two intersections":"arcs do not cross"},{kind:"symbolic",label:"Construction guarantee",value:"PA = PB and QA = QB"}] };
    }
    case "lineRelationLab": {
      const angle=field(v,"angle",spec.angleStart), offset=field(v,"offset",spec.offsetStart);
      const raw=Math.abs(((angle-spec.baseAngle)%180+180)%180), diff=Math.min(raw,180-raw);
      const relation=diff===0?"parallel":diff===90?"perpendicular":"intersecting";
      return { narration:`The active line is ${relation}; rotation changes the angle while translation changes position without changing direction.`, cards:[{kind:"diagram",label:"Line relation",value:`${relation} · smallest angle ${fmt(diff)}°`},{kind:"table",label:"Controls",value:`rotation ${fmt(angle)}° | offset ${fmt(offset)}`},{kind:"symbolic",label:"Invariant test",value:relation==="parallel"?"same direction, constant distance":relation==="perpendicular"?"intersection angle = 90°":"neither invariant is satisfied"}] };
    }
    case "triangleAngleLab": {
      const x=field(v,"x",spec.startC[0]),y=field(v,"y",spec.startC[1]);
      return { narration:"Dragging one vertex changes all three angles while their sum remains fixed.", cards:[{kind:"diagram",label:"Draggable vertex",value:`C = (${fmt(x)}, ${fmt(y)})`},{kind:"table",label:"Target condition",value:`angle A ≈ ${fmt(spec.targetAngleA)}°`},{kind:"symbolic",label:"Invariant",value:"A + B + C = 180°"}] };
    }
    case "verticalLineScanner": {
      const x=field(v,"x",spec.scanStart),max=field(v,"maxIntersections",0),sweeps=field(v,"sweeps",0);
      return { narration:`The scanner at x = ${fmt(x)} has recorded at most ${fmt(max)} intersections after ${fmt(sweeps)} sweeps.`, cards:[{kind:"graph",label:"Vertical-line evidence",value:`max intersections = ${fmt(max)}`},{kind:"table",label:"Search progress",value:`${fmt(sweeps)} sweeps`},{kind:"language",label:"Definition",value:"a function gives each input no more than one output"}] };
    }
    case "covariationScrubber": {
      const x=typeof value==="number"?value:spec.inputStart, y=spec.a*x+spec.b;
      return { narration:`One input controls every representation: (${fmt(x)}, ${fmt(y)}).`, cards:[{kind:"table",label:"Current pair",value:`${spec.inputLabel} ${fmt(x)} | ${spec.outputLabel} ${fmt(y)}`},{kind:"graph",label:"Point on relationship",value:`(${fmt(x)}, ${fmt(y)})`},{kind:"symbolic",label:"Rule and unit rate",value:`y = ${fmt(spec.a)}x + ${fmt(spec.b)} · rate ${fmt(spec.a)}`}] };
    }
    case "samplingBiasLab": {
      const method=typeof v.method==="string"?v.method:"convenience",size=field(v,"size",spec.sizeStart),draws=field(v,"draws",0);
      return { narration:`A ${method} design of size ${fmt(size)} has been repeated ${fmt(draws)} times.`, cards:[{kind:"diagram",label:"Selection design",value:method},{kind:"graph",label:"Variability prediction",value:`larger n (${fmt(size)}) → tighter random spread`},{kind:"language",label:"Bias principle",value:"sample size reduces variability; representative selection reduces bias"}] };
    }
    case "shapeFamilyBuilder": {
      const sides=field(v,"sides",spec.startSides),r=field(v,"rightAngles",0),e=field(v,"equalSides",0),p=field(v,"parallelPairs",0);
      return { narration:"The shape is identified from its attributes rather than its orientation or appearance.", cards:[{kind:"diagram",label:"Current build",value:`${fmt(sides)}-sided shape`},{kind:"table",label:"Attributes",value:`right ${fmt(r)} | equal ${fmt(e)} | parallel pairs ${fmt(p)}`},{kind:"language",label:"Target family",value:spec.targetName}] };
    }
    case "unitRuler": {
      const aligned=Boolean(v.zeroAligned),unit=field(v,"unitSize",spec.startUnitSize),placements=field(v,"placements",0),spacing=typeof v.spacing==="string"?v.spacing:"exact";
      return { narration:`The object is covered by ${fmt(placements)} units of size ${fmt(unit)} with ${spacing} spacing; zero is ${aligned?"aligned":"not aligned"}.`, cards:[{kind:"concrete",label:"Unit iteration",value:`${fmt(placements)} equal units`},{kind:"number-line",label:"Ruler interval",value:`${fmt(spec.objectStart)} to ${fmt(spec.objectEnd)}`},{kind:"symbolic",label:"Measured length",value:`${fmt(placements)} × ${fmt(unit)} = ${fmt(placements*unit)}`}] };
    }
    case "proportionalReasoningLab": {
      const truth=proportionalReasoningTruth(spec);
      const series=truth.series.map((entry)=>`${entry.label}: ${entry.pairs.map(([x,y])=>`(${fmt(x)}, ${fmt(y)})`).join(", ")}`).join(" | ");
      const rates=truth.series.map((entry)=>`${entry.label}: ${entry.rates.map(fmt).join(", ")}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerClaim??"undetermined";
      return { narration:"One proportional chain coordinates the quantities, normalized rates, and requested conclusion.", cards:[{kind:"table",label:"Paired quantities",value:series},{kind:"graph",label:"Multiplicative relationship",value:rates},{kind:"symbolic",label:"Derived truth",value:answer},{kind:"language",label:"Task",value:spec.task}] };
    }
    case "placeValueTransformLab": {
      const truth=placeValueTransformTruth(spec);
      const source=spec.values.map(fmt).join(" | ");
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerClaim??"undetermined";
      return { narration:"One base-ten place model coordinates aligned digits, power shifts, rounding boundaries, and equivalent scaling.", cards:[{kind:"table",label:"Aligned source values",value:source},{kind:"diagram",label:"Inspectable place stages",value:stages},{kind:"symbolic",label:"Derived truth",value:answer},{kind:"language",label:"Task mode",value:spec.task}] };
    }
    case "exactNumberLab": {
      const truth=exactNumberTruth(spec);
      const sources=spec.values.map((source)=>`${source.label}: ${exactNumberKey(source)}`).join(" | ") || (spec.group?"grouped expression":spec.inequality?`inequality boundary ${spec.inequality.boundary}`:"exact ordered-number state");
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerRelation??truth.answerClaim??"exploration complete";
      return { narration:"One exact ordered-number state coordinates grouping, powers, rational operations, inequalities, and radicals without replacing their distinct learner actions.", cards:[{kind:"number-line",label:"Ordered source values",value:sources},{kind:"table",label:"Inspectable exact states",value:stages},{kind:"symbolic",label:"Derived truth",value:String(answer)},{kind:"language",label:"Task mode",value:spec.task}] };
    }
    case "affineRelationshipLab": {
      const truth=affineRelationshipTruth(spec);
      const sources=spec.lines.map((line)=>`${line.label}: ${line.sourceText}`).join(" | ");
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerPoint?`(${fmt(truth.answerPoint[0])}, ${fmt(truth.answerPoint[1])})`:truth.answerClaim??"exploration complete";
      return { narration:"One affine state coordinates rate, initial value, evaluation, verification, and intersection across representations.", cards:[{kind:"graph",label:"Affine relationships",value:sources},{kind:"table",label:"Inspectable affine stages",value:stages},{kind:"symbolic",label:"Derived truth",value:answer},{kind:"language",label:"Task mode",value:spec.task}] };
    }
    case "quotientReasoningLab": {
      const truth=quotientReasoningTruth(spec);
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const source=spec.repeatBlock?`0.(${spec.repeatBlock})`:spec.dividend&&spec.divisor?`${spec.dividend.num}/${spec.dividend.den} ÷ ${spec.divisor.num}/${spec.divisor.den}`:spec.dividend?`${spec.dividend.num}/${spec.dividend.den}`:spec.candidates.map((candidate)=>candidate.label).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerClaim??(truth.answerFraction?`${truth.answerFraction.num}/${truth.answerFraction.den}`:"exploration complete");
      return { narration:"One exact quotient state coordinates grouping, reciprocals, remainder cycles, and the requested conclusion.", cards:[{kind:"table",label:"Source quotient",value:source},{kind:"diagram",label:"Exact quotient states",value:stages},{kind:"symbolic",label:"Derived truth",value:answer},{kind:"language",label:"Task mode",value:spec.task}] };
    }
    case "pointSetReasoningLab": {
      const truth=pointSetReasoningTruth(spec);
      const sets=spec.sets.map((set)=>`${set.label}: ${set.points.map((point)=>point.y===undefined?fmt(point.x):`(${fmt(point.x)}, ${fmt(point.y)})`).join(" | ")}`).join(" || ");
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerClaim??"exploration complete";
      return { narration:"One finite point-set state coordinates axis meaning, observation reading, coordinate change, endpoint spread, and range updates.", cards:[{kind:spec.yLabel?"graph":"number-line",label:"Observation sets",value:sets},{kind:"table",label:"Inspectable point-set states",value:stages},{kind:"symbolic",label:"Derived truth",value:String(answer)},{kind:"language",label:"Task mode",value:spec.task}] };
    }
    case "geometricConstraintLab": {
      const truth=geometricConstraintTruth(spec);
      const stages=truth.stages.map((stage)=>`${stage.label}: ${stage.value}`).join(" | ");
      const answer=truth.answerNumber!==undefined?fmt(truth.answerNumber):truth.answerClaim??"exploration complete";
      return { narration:"One exact geometric constraint state coordinates named quantities and the invariant relation required by the task.", cards:[{kind:"diagram",label:"Geometric configuration",value:spec.task},{kind:"table",label:"Inspectable quantities",value:stages},{kind:"symbolic",label:"Derived truth",value:String(answer)},{kind:"language",label:"Constraint mode",value:spec.task}] };
    }
    case "graphStoryLab": {
      const segmentIds = spec.mode === "build" && value && typeof value === "object" && Array.isArray((value as { segmentIds?: unknown }).segmentIds)
        ? (value as { segmentIds: unknown[] }).segmentIds
        : undefined;
      const chosen = segmentIds
        ? segmentIds.map(String).map((id) => spec.bank.find((segment) => segment.id === id)?.kind).filter((kind): kind is NonNullable<typeof kind> => Boolean(kind))
        : undefined;
      const truth = graphStoryTruth(spec, chosen);
      return { narration: truth.narration, cards:[{kind:"graph",label:"Qualitative graph",value:truth.activeKinds.join(" → ") || "no stages yet"},{kind:"table",label:"Ordered stages",value:(spec.mode === "build" ? chosen : truth.targetKinds)?.join(" | ") || "none"},{kind:"symbolic",label:"Derived truth",value:spec.mode === "read" ? truth.answerClaim : `sequence:${truth.targetKinds.join(">")}`},{kind:"language",label:"Axis meaning",value:`${spec.yAxisLabel} versus ${spec.xAxisLabel}`} ] };
    }
    case "conditionalTableLab": {
      const condition=typeof v.condition==="string"?v.condition:spec.startCondition,cell=typeof v.cell==="string"?v.cell:"none",switches=field(v,"switches",0);
      const names: Record<string, string|undefined>={row0:spec.rowLabels[0],row1:spec.rowLabels[1],col0:spec.colLabels[0],col1:spec.colLabels[1]};
      return { narration:`The condition ${names[condition] ?? condition} selects the denominator; intersection ${cell} is the candidate numerator after ${fmt(switches)} comparisons.`, cards:[{kind:"table",label:"Conditioned sample space",value:String(names[condition] ?? condition)},{kind:"diagram",label:"Selected joint cell",value:cell},{kind:"symbolic",label:"Conditional structure",value:"P(target | condition) = joint / condition total"}] };
    }
    case "conicLocusLab": {
      const eTenths=field(v,"eTenths",spec.startEccentricityTenths),e=eTenths/10;
      const family=e===0?"circle":e<1?"ellipse":e===1?"parabola":"hyperbola";
      return { narration:`Eccentricity ${fmt(e)} generates a ${family} from one focus-directrix distance ratio.`, cards:[{kind:"diagram",label:"Current locus",value:family},{kind:"table",label:"Classification boundary",value:"0 circle | 0<e<1 ellipse | e=1 parabola | e>1 hyperbola"},{kind:"symbolic",label:"Defining ratio",value:`PF / PD = ${fmt(e)}`}] };
    }
    case "derivativeRuleLab": {
      const h=field(v,"h",spec.startH),inner=field(v,"innerRate",spec.startInnerRate),outer=field(v,"outerRate",spec.startOuterRate);
      if(spec.mode==="quotient") return { narration:`Rates u prime ${fmt(inner)} and v prime ${fmt(outer)} produce the ordered quotient numerator u prime v minus u v prime over v squared.`, cards:[{kind:"diagram",label:"Competing changes",value:"u′v minus uv′"},{kind:"table",label:"Current rates",value:`u′ ${fmt(inner)} | v′ ${fmt(outer)}`},{kind:"symbolic",label:"Quotient structure",value:"(u′v − uv′) / v²"}] };
      if(spec.mode==="substitution") return { narration:`The x-world factor ${fmt(inner)}x becomes ${fmt(inner/2)} du while the outside power ${fmt(outer)} becomes u to that same power; no x remains.`, cards:[{kind:"diagram",label:"Two synchronized worlds",value:"x-world ↔ u-world"},{kind:"table",label:"Receipt conversion",value:`${fmt(inner)}x dx → ${fmt(inner/2)} du | power ${fmt(outer)}`},{kind:"symbolic",label:"Reverse chain rule",value:`u = x² + 1 | du = 2x dx | ∫ ${fmt(inner/2)}u^${fmt(outer)} du`}] };
      if(spec.mode==="product") return { narration:`At h = ${fmt(h)}, the divided second-order corner still contributes ${fmt(h)} and shrinks toward zero.`, cards:[{kind:"diagram",label:"Changing product",value:"base rectangle + two strips + one corner"},{kind:"table",label:"Orders of change",value:`first-order strips ∝ h | corner ∝ h²`},{kind:"symbolic",label:"Limit mechanism",value:`Δ(fg)/h = f′g + fg′ + f′g′h`}] };
      return { narration:`The nested rates ${fmt(inner)} and ${fmt(outer)} transmit a total rate of ${fmt(inner*outer)}.`, cards:[{kind:"diagram",label:"Function pipeline",value:"x → inner u → outer f(u)"},{kind:"table",label:"Local scales",value:`du/dx ${fmt(inner)} | df/du ${fmt(outer)}`},{kind:"symbolic",label:"Composed rate",value:`df/dx = ${fmt(outer)} × ${fmt(inner)} = ${fmt(inner*outer)}`}] };
    }
    case "relatedRatesLab": {
      const x=field(v,"x",spec.startX),y=Math.sqrt(Math.max(0,spec.ladderLength*spec.ladderLength-x*x)),dy=-(x/y)*spec.horizontalRate;
      return { narration:`A fixed ${fmt(spec.ladderLength)}-unit ladder at x = ${fmt(x)} has height ${fmt(y)} and vertical rate ${fmt(dy)}.`, cards:[{kind:"diagram",label:"Coupled geometry",value:`foot ${fmt(x)} | top ${fmt(y)}`},{kind:"table",label:"Current rates",value:`dx/dt ${fmt(spec.horizontalRate)} | dy/dt ${fmt(dy)}`},{kind:"symbolic",label:"Differentiated invariant",value:"2x dx/dt + 2y dy/dt = 0"}] };
    }
    case "secantSlope": {
      const h=typeof value==="number"?value:spec.startH;
      const f=(x:number)=>{const z=x-spec.shiftX;return (spec.curve==="square"?z*z:z*z*z)+spec.shiftY;};
      const slope=h===0?NaN:(f(spec.a+h)-f(spec.a))/h;
      const tangentX=spec.mode==="rolle"?spec.shiftX:spec.a;
      const tangent=spec.curve==="square"?2*(tangentX-spec.shiftX):3*(tangentX-spec.shiftX)*(tangentX-spec.shiftX);
      if(spec.mode==="rolle") return { narration:`Endpoint heights ${fmt(f(spec.a))} and ${fmt(f(spec.a+h))} give secant slope ${Number.isFinite(slope)?fmt(slope):"undefined"}; the interior tangent at c = ${fmt(tangentX)} has slope ${fmt(tangent)}.`, cards:[{kind:"graph",label:"Movable Rolle interval",value:`[${fmt(spec.a)}, ${fmt(spec.a+h)}]`},{kind:"table",label:"Endpoint heights",value:`f(A) ${fmt(f(spec.a))} | f(B) ${fmt(f(spec.a+h))}`},{kind:"symbolic",label:"Guaranteed flat spot",value:`f′(${fmt(tangentX)}) = ${fmt(tangent)}`}] };
      return { narration:`A secant over h = ${fmt(h)} has slope ${Number.isFinite(slope)?fmt(slope):"undefined"}; the limiting tangent slope is ${fmt(tangent)}.`, cards:[{kind:"graph",label:"Two-point line",value:`x = ${fmt(spec.a)} and ${fmt(spec.a+h)}`},{kind:"table",label:"Slope comparison",value:`secant ${Number.isFinite(slope)?fmt(slope):"undefined"} | tangent ${fmt(tangent)}`},{kind:"symbolic",label:"Difference quotient",value:"[f(a+h) − f(a)] / h"}] };
    }
    case "vectorExplore": {
      const vx=field(v,"vx",spec.vxStart),vy=field(v,"vy",spec.vyStart),dot=spec.ux*vx+spec.uy*vy;
      return { narration:`The fixed vector (${spec.ux}, ${spec.uy}) interacts with v = (${fmt(vx)}, ${fmt(vy)}).`, cards:[{kind:"graph",label:"Vector arrows",value:`u (${spec.ux},${spec.uy}) · v (${fmt(vx)},${fmt(vy)})`},{kind:"table",label:"Components",value:`x: ${spec.ux}, ${fmt(vx)} | y: ${spec.uy}, ${fmt(vy)}`},{kind:"symbolic",label:spec.mode==="dot"?"Dot product":"Vector sum",value:spec.mode==="dot"?`${spec.ux}(${fmt(vx)}) + ${spec.uy}(${fmt(vy)}) = ${fmt(dot)}`:`(${fmt(spec.ux+vx)}, ${fmt(spec.uy+vy)})`}] };
    }
    case "matrixTransform": {
      const a=field(v,"a",spec.sa),b=field(v,"b",spec.sb),c=field(v,"c",spec.sc),d=field(v,"d",spec.sd),det=a*d-b*c;
      return { narration:`The matrix sends the basis vectors to (${fmt(a)}, ${fmt(c)}) and (${fmt(b)}, ${fmt(d)}), scaling oriented area by ${fmt(det)}.`, cards:[{kind:"graph",label:"Basis images",value:`î→(${fmt(a)},${fmt(c)}) · ĵ→(${fmt(b)},${fmt(d)})`},{kind:"table",label:"Matrix entries",value:`${fmt(a)} ${fmt(b)} | ${fmt(c)} ${fmt(d)}`},{kind:"symbolic",label:"Determinant",value:`${fmt(a)}(${fmt(d)}) − ${fmt(b)}(${fmt(c)}) = ${fmt(det)}`}] };
    }
    case "polarTrace": {
      const parameter=typeof value==="number"?value:spec.start;
      const consequence=spec.mode==="rose"?(parameter%2===0?2*parameter:parameter):parameter;
      return { narration:spec.mode==="rose"?`Parameter n = ${fmt(parameter)} traces ${fmt(consequence)} petals.`:`Parameter a = ${fmt(parameter)} controls the limaçon family.`, cards:[{kind:"graph",label:"Polar trace",value:spec.mode==="rose"?`${fmt(consequence)} petals`:`a = ${fmt(parameter)}`},{kind:"table",label:"Parameter consequence",value:spec.mode==="rose"?`n ${fmt(parameter)} | petals ${fmt(consequence)}`:`a ${fmt(parameter)} | family changes at 1 and 2`},{kind:"symbolic",label:"Polar rule",value:spec.mode==="rose"?`r = cos(${fmt(parameter)}θ)`:`r = ${fmt(parameter)} + 2cos θ`}] };
    }
    case "derivativeTrace": {
      const x=typeof value==="number"?value:spec.start;
      const slope=spec.fn==="square"?2*x:spec.fn==="cubic"?3*x*x:x===0?null:x>0?1:-1;
      return { narration:`At x = ${fmt(x)}, the derivative trace records local slope ${slope===null?"undefined":fmt(slope)}.`, cards:[{kind:"graph",label:"Tracked point",value:`x = ${fmt(x)}`},{kind:"table",label:"Local behavior",value:`slope ${slope===null?"undefined":fmt(slope)}`},{kind:"symbolic",label:"Derivative value",value:slope===null?"f′(0) does not exist":`f′(${fmt(x)}) = ${fmt(slope)}`}] };
    }
    case "riemannSum": {
      const n=field(v,"n",spec.nStart),rule=typeof v.rule==="string"?v.rule:spec.ruleStart;
      return { narration:`The interval is partitioned into ${fmt(n)} ${rule}-rule slices.`, cards:[{kind:"diagram",label:"Rectangles",value:`${fmt(n)} strips`},{kind:"table",label:"Sampling rule",value:rule},{kind:"symbolic",label:"Accumulation",value:"Σ f(xᵢ*) Δx"}] };
    }
    case "accumulateArea": {
      const x=typeof value==="number"?value:spec.start;
      const f=spec.fn==="const"?3:spec.fn==="line"?2*x:spec.fn==="square"?x*x:x-2;
      const A=spec.fn==="const"?3*x:spec.fn==="line"?x*x:spec.fn==="square"?x*x*x/3:x*x/2-2*x;
      return { narration:`At upper bound x = ${fmt(x)}, accumulated signed area is ${fmt(A)} and its current rate is ${fmt(f)}.`, cards:[{kind:"graph",label:"Filled interval",value:`0 to ${fmt(x)}`},{kind:"table",label:"Linked values",value:`A(x) ${fmt(A)} | f(x) ${fmt(f)}`},{kind:"symbolic",label:"FTC relationship",value:"A′(x) = f(x)"}] };
    }
    case "sliceSum": {
      const n=field(v,"n",spec.nStart),rule=typeof v.rule==="string"?v.rule:spec.ruleStart;
      return { narration:`The ${spec.mode} solid is approximated with ${fmt(n)} ${rule}-sampled slices.`, cards:[{kind:"diagram",label:"Highlighted slice",value:spec.mode},{kind:"table",label:"Refinement",value:`n = ${fmt(n)} | ${rule}`},{kind:"symbolic",label:"Volume sum",value:"Σ A(xᵢ*) Δx"}] };
    }
    case "slopeField": {
      const y0=typeof value==="number"?value:spec.startY0;
      return { narration:`A solution begins at y(0) = ${fmt(y0)} and follows the ${spec.equation} direction field.`, cards:[{kind:"graph",label:"Initial condition",value:`(0, ${fmt(y0)})`},{kind:"table",label:"Field family",value:spec.equation},{kind:"symbolic",label:"Constraint",value:"solution tangent = field slope at every point"}] };
    }
    case "taylorApprox": {
      const control=typeof value==="number"?value:(spec.mode==="terms"?spec.nStart:spec.xStart);
      return { narration:spec.mode==="terms"?`${fmt(control)} Taylor terms currently encode local derivative information.`:`The approximation is tested at x = ${fmt(control/10)} against its convergence boundary.`, cards:[{kind:"graph",label:"Approximation trace",value:spec.fn},{kind:"table",label:"Current control",value:spec.mode==="terms"?`terms ${fmt(control)}`:`x ${fmt(control/10)}`},{kind:"symbolic",label:"Local model",value:"Pₙ(x) matches successive derivatives at the center"}] };
    }
    case "quadDrag": {
      const x = field(v, "x", spec.startX), y = field(v, "y", spec.startY);
      const pts = [...spec.fixed, [x, y] as [number, number]] as Array<[number, number]>;
      const d = (a: number, b: number) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
      const sides = [d(0, 1), d(1, 2), d(2, 3), d(3, 0)].map(fmt);
      return {
        narration: `Moving the fourth vertex changes the shape's attributes; it currently names itself ${cmlQuadName(pts)}.`,
        cards: [
          { kind: "graph", label: "Vertices", value: pts.map(([px, py]) => `(${px}, ${py})`).join(" · ") },
          { kind: "table", label: "Side lengths", value: sides.join(" | ") },
          { kind: "language", label: "Most specific family", value: cmlQuadName(pts) }
        ]
      };
    }
    default:
      return { narration: "This model links a learner action to a visible mathematical consequence.", cards: [] };
  }
}
