"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { WidgetSpec, type TCovariationScrubber } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { linScale } from "@/components/plotUtils";
import { snapToStep, useSvgDrag } from "@/components/useSvgDrag";
import { MathProse } from "@/components/math/MathText";
import { COPY } from "@/lib/copy";

/**
 * LandingHero is a landing-only rendering of the hours-to-miles covariation canary. It keeps the
 * real evaluator contract and one shared input, without pulling the lesson widget monolith into
 * the marketing route. Its coordinate plane is intentionally complete at this compact size:
 * graph paper, scales, units, origin, data marks, and accessible state all describe one truth.
 */
const HERO_SPEC = WidgetSpec.parse({
  type: "covariationScrubber",
  prompt: "Drag the point until the trip covers 24 miles.",
  a: 4,
  b: 0,
  inputMin: 0,
  inputMax: 10,
  inputStart: 1,
  targetInput: 6,
  inputLabel: "hours",
  outputLabel: "miles",
  contextTemplate: "In {x} hours, the rider travels {y} miles.",
  successFeedback:
    "6 hours, 24 miles — the table, the graph, and the equation all agree. That's the whole product: one honest state, every representation in sync.",
  lowFeedback: "Not there yet — drag right to cover more miles.",
  highFeedback: "That's past it — drag back toward 6 hours.",
}) as TCovariationScrubber;

/** Exported so the focused contrast regression checks the exact shipped marks. */
export const LANDING_GRAPH_COLORS = {
  paper: "#FFFFFF",
  ink: "#22314F",
  data: "#2069BF",
  current: "#BA4A00",
  majorGrid: "#A9B8CB",
  minorGrid: "#DCE4EF",
} as const;

const W = 460;
const H = 320;
const LEFT = 62;
const RIGHT = 424;
const TOP = 34;
const BOTTOM = 248;
const X_MAX = 10;
const Y_MAX = 40;
const sx = linScale(0, X_MAX, LEFT, RIGHT);
const sy = linScale(0, Y_MAX, BOTTOM, TOP);
const xValues = Array.from({ length: X_MAX + 1 }, (_, index) => index);
const yValues = Array.from({ length: 11 }, (_, index) => index * 4);
const xMajor = xValues.filter((number) => number % 2 === 0);
const yMajor = yValues.filter((number) => number % 8 === 0);

function nearbyRows(x: number) {
  const start = Math.max(
    HERO_SPEC.inputMin,
    Math.min(x - 2, HERO_SPEC.inputMax - 4),
  );
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function Readout({
  label,
  children,
  good = false,
}: {
  label: string;
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center ${good ? "border-leaf/35 bg-leaf/10 text-leaf-ink" : "border-ink/10 bg-white/80 text-ink"}`}
    >
      <dt className="text-[11px] font-extrabold uppercase tracking-wide opacity-70">
        {label}
      </dt>
      <dd className="text-base font-black tabular-nums">{children}</dd>
    </div>
  );
}

export default function LandingHero() {
  const [value, setValue] = useState<number>(HERO_SPEC.inputStart);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replaceAll(":", "");
  const titleId = `landing-graph-title-${uid}`;
  const descriptionId = `landing-graph-description-${uid}`;
  const contextId = `landing-graph-context-${uid}`;
  const sliderLabelId = `landing-graph-slider-${uid}`;
  const y = HERO_SPEC.a * value + HERO_SPEC.b;
  const rows = nearbyRows(value);
  const set = (next: number) => {
    setValue(next);
    setFeedback(null);
  };
  const drag = useSvgDrag({
    svgRef,
    viewW: W,
    viewH: H,
    onDrag: (vx) =>
      set(
        snapToStep(
          ((vx - LEFT) / (RIGHT - LEFT)) * X_MAX,
          HERO_SPEC.inputMin,
          HERO_SPEC.inputMax,
          1,
        ),
      ),
  });
  const pointLabelX = sx(value) + (value >= 8 ? -10 : 10);
  const pointLabelY = sy(y) + (y >= 32 ? 19 : -11);

  return (
    <div className="stage rounded-card border border-ink/10 p-5 shadow-e2">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-tangerine-ink">
        Try it — a real course widget, not a mockup
      </p>

      <div className="grid min-w-0 gap-4">
        <p className="text-lg font-bold">
          <MathProse text={HERO_SPEC.prompt} />
        </p>
        <p
          id={contextId}
          aria-live="polite"
          className="rounded-2xl border border-sky/20 bg-sky/5 p-4 text-center text-lg font-black"
        >
          In {value} {value === 1 ? "hour" : "hours"}, the rider travels {y}{" "}
          miles.
        </p>

        <label className="grid gap-1 text-sm font-bold">
          <span id={sliderLabelId}>Trip time (hours)</span>
          <input
            type="range"
            min={HERO_SPEC.inputMin}
            max={HERO_SPEC.inputMax}
            step="1"
            value={value}
            aria-labelledby={sliderLabelId}
            aria-describedby={contextId}
            aria-valuetext={`${value} ${value === 1 ? "hour" : "hours"}, ${y} miles`}
            onChange={(event) => set(Number(event.target.value))}
            className="h-11 w-full accent-sky"
          />
          <span className="text-xs font-semibold text-muted">
            Drag the orange point or use the slider. Each step is 1 hour.
          </span>
        </label>

        <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(9.5rem,0.72fr)_minmax(0,1.55fr)] sm:items-start">
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-ink/15 bg-white">
            <table className="w-full min-w-[9.5rem] text-center text-sm text-ink">
              <caption className="border-b border-ink/10 bg-ink/5 px-2 py-2 text-xs font-extrabold uppercase tracking-wide">
                Nearby trip values
              </caption>
              <thead className="bg-ink/5">
                <tr>
                  <th scope="col" className="p-2">
                    Time (hours)
                  </th>
                  <th scope="col" className="p-2">
                    Distance (miles)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row}
                    aria-current={row === value ? "true" : undefined}
                    className={
                      row === value
                        ? "border-l-4 border-sky-ink bg-sky/10 font-black"
                        : "border-l-4 border-transparent"
                    }
                  >
                    <td className="p-2 tabular-nums">{row}</td>
                    <td className="p-2 tabular-nums">
                      {HERO_SPEC.a * row + HERO_SPEC.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="min-w-0 rounded-2xl border border-ink/15 bg-white p-1.5">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              className="h-auto w-full min-w-0"
              role="img"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              data-testid="landing-trip-graph"
            >
              <title id={titleId}>Distance traveled over time</title>
              <desc id={descriptionId}>
                A coordinate graph with time from 0 to 10 hours and distance
                from 0 to 40 miles. The blue line starts at the origin and rises
                4 miles each hour. The current orange point is {value}{" "}
                {value === 1 ? "hour" : "hours"} and {y} miles.
              </desc>
              <defs>
                <marker
                  id={`axis-arrow-${uid}`}
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 0 L 8 4 L 0 8 z"
                    fill={LANDING_GRAPH_COLORS.ink}
                  />
                </marker>
              </defs>

              <text
                x={W / 2}
                y="19"
                textAnchor="middle"
                fontSize="14"
                fontWeight="800"
                fill={LANDING_GRAPH_COLORS.ink}
              >
                Distance traveled over time
              </text>

              <g aria-hidden="true" data-layer="grid">
                {xValues
                  .filter((tick) => tick % 2 !== 0)
                  .map((tick) => (
                    <line
                      key={`xm-${tick}`}
                      data-grid="minor"
                      x1={sx(tick)}
                      x2={sx(tick)}
                      y1={TOP}
                      y2={BOTTOM}
                      stroke={LANDING_GRAPH_COLORS.minorGrid}
                      strokeWidth="0.75"
                    />
                  ))}
                {yValues
                  .filter((tick) => tick % 8 !== 0)
                  .map((tick) => (
                    <line
                      key={`ym-${tick}`}
                      data-grid="minor"
                      x1={LEFT}
                      x2={RIGHT}
                      y1={sy(tick)}
                      y2={sy(tick)}
                      stroke={LANDING_GRAPH_COLORS.minorGrid}
                      strokeWidth="0.75"
                    />
                  ))}
                {xMajor
                  .filter((tick) => tick !== 0)
                  .map((tick) => (
                    <line
                      key={`xM-${tick}`}
                      data-grid="major"
                      x1={sx(tick)}
                      x2={sx(tick)}
                      y1={TOP}
                      y2={BOTTOM}
                      stroke={LANDING_GRAPH_COLORS.majorGrid}
                      strokeWidth="1.15"
                    />
                  ))}
                {yMajor
                  .filter((tick) => tick !== 0)
                  .map((tick) => (
                    <line
                      key={`yM-${tick}`}
                      data-grid="major"
                      x1={LEFT}
                      x2={RIGHT}
                      y1={sy(tick)}
                      y2={sy(tick)}
                      stroke={LANDING_GRAPH_COLORS.majorGrid}
                      strokeWidth="1.15"
                    />
                  ))}
              </g>

              <g
                aria-hidden="true"
                data-layer="axes"
                fill={LANDING_GRAPH_COLORS.ink}
                stroke={LANDING_GRAPH_COLORS.ink}
              >
                <line
                  x1={LEFT}
                  x2={RIGHT + 10}
                  y1={BOTTOM}
                  y2={BOTTOM}
                  strokeWidth="2.25"
                  markerEnd={`url(#axis-arrow-${uid})`}
                />
                <line
                  x1={LEFT}
                  x2={LEFT}
                  y1={BOTTOM}
                  y2={TOP - 10}
                  strokeWidth="2.25"
                  markerEnd={`url(#axis-arrow-${uid})`}
                />
                {xValues.map((tick) => (
                  <line
                    key={`xt-${tick}`}
                    data-axis-tick="x"
                    x1={sx(tick)}
                    x2={sx(tick)}
                    y1={BOTTOM - 4}
                    y2={BOTTOM + 5}
                    strokeWidth={tick % 2 === 0 ? "1.5" : "1"}
                  />
                ))}
                {yValues.map((tick) => (
                  <line
                    key={`yt-${tick}`}
                    data-axis-tick="y"
                    x1={LEFT - 5}
                    x2={LEFT + 4}
                    y1={sy(tick)}
                    y2={sy(tick)}
                    strokeWidth={tick % 8 === 0 ? "1.5" : "1"}
                  />
                ))}
              </g>

              <g aria-hidden="true" data-layer="data">
                <line
                  x1={sx(0)}
                  y1={sy(0)}
                  x2={sx(10)}
                  y2={sy(40)}
                  stroke={LANDING_GRAPH_COLORS.data}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {xValues.map((mark) => (
                  <circle
                    key={`mark-${mark}`}
                    data-testid="landing-data-mark"
                    cx={sx(mark)}
                    cy={sy(HERO_SPEC.a * mark)}
                    r="3.25"
                    fill={LANDING_GRAPH_COLORS.paper}
                    stroke={LANDING_GRAPH_COLORS.data}
                    strokeWidth="2"
                  />
                ))}
                <circle
                  cx={sx(value)}
                  cy={sy(y)}
                  r="10"
                  fill={LANDING_GRAPH_COLORS.paper}
                  stroke={LANDING_GRAPH_COLORS.paper}
                  strokeWidth="4"
                />
                <circle
                  data-testid="landing-current-point"
                  cx={sx(value)}
                  cy={sy(y)}
                  r="7"
                  fill={LANDING_GRAPH_COLORS.current}
                  stroke={LANDING_GRAPH_COLORS.ink}
                  strokeWidth="1.4"
                />
              </g>

              <g
                aria-hidden="true"
                data-layer="labels"
                fill={LANDING_GRAPH_COLORS.ink}
                fontSize="11"
                fontWeight="700"
              >
                {xMajor.map((tick) => (
                  <text
                    key={`xl-${tick}`}
                    data-axis-label="x"
                    x={sx(tick)}
                    y={BOTTOM + 20}
                    textAnchor={tick === 0 ? "end" : "middle"}
                  >
                    {tick}
                  </text>
                ))}
                {yMajor
                  .filter((tick) => tick !== 0)
                  .map((tick) => (
                    <text
                      key={`yl-${tick}`}
                      data-axis-label="y"
                      x={LEFT - 10}
                      y={sy(tick) + 4}
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  ))}
                <text
                  x={(LEFT + RIGHT) / 2}
                  y="303"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                >
                  Time (hours)
                </text>
                <text
                  x="17"
                  y={(TOP + BOTTOM) / 2}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  transform={`rotate(-90 17 ${(TOP + BOTTOM) / 2})`}
                >
                  Distance (miles)
                </text>
                <text
                  x={RIGHT + 8}
                  y={BOTTOM - 9}
                  fontSize="12"
                  fontStyle="italic"
                >
                  t
                </text>
                <text x={LEFT + 9} y={TOP - 5} fontSize="12" fontStyle="italic">
                  d
                </text>
                <text
                  x={pointLabelX}
                  y={pointLabelY}
                  textAnchor={value >= 8 ? "end" : "start"}
                  fontSize="11"
                  fontWeight="800"
                  fill={LANDING_GRAPH_COLORS.current}
                >
                  ({value} h, {y} mi)
                </text>
              </g>

              <rect
                data-testid="landing-graph-drag"
                x={LEFT - 8}
                y={TOP - 8}
                width={RIGHT - LEFT + 16}
                height={BOTTOM - TOP + 16}
                fill="transparent"
                aria-hidden="true"
                {...drag.handleProps}
              />
            </svg>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
          <Readout label="Equation">
            <MathProse text="d = 4t" />
          </Readout>
          <Readout label="Unit rate" good>
            4 miles per hour
          </Readout>
          <Readout label="Current point" good={value === HERO_SPEC.targetInput}>
            ({value} h, {y} mi)
          </Readout>
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canCheck(HERO_SPEC, value)}
          onClick={() => {
            const result = evaluate(HERO_SPEC, value);
            setFeedback({ correct: result.correct, text: result.feedback });
          }}
          className="pressable min-h-11 rounded-pill bg-cta px-6 font-bold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-50"
        >
          {COPY.check}
        </button>
        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm font-bold ${feedback.correct ? "text-leaf-ink" : "text-berry-ink"}`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
