"use client";

/**
 * covariationScrubber — the renderer for `CovariationScrubberSpec` (schema.ts:4463-4479, own
 * docstring: "one input controls context, table, graph, equation, and unit rate").
 *
 * SECOND WIDGET IN ITS OWN MODULE (after `numberLineRay.tsx`, S215) — same standing mandate (§21)
 * of "new isolated module → tests → thin central integration" over growing the `widgets.tsx`
 * monolith, and the same one-line dispatch cost to that file. Moved out for WS-H (S240+): this
 * engine is the landing-page hero widget. It is one of only seven engines that cleared the "hero"
 * stage tier under S240's evidence-driven 1440px pixel QA (`stageWidth.ts:69`), and — critically —
 * it is the ONE-drag match for the marketing brief ("drag ONE object → graph, equation, and number
 * readout all change in sync"): there is exactly one control surface here (the shared input), never
 * a second independently-draggable handle the way `lineExplore` needs two. Shipping the hero as its
 * own module with its own dynamic import (see `LandingHero.tsx`) means the marketing page never
 * pulls in the full ~129-widget catalog — the same reason a past version of this hero was pulled
 * OUT of the shared catalog once already, at S111 (see `WidgetView.tsx`'s own doc comment).
 *
 * WHAT THE LEARNER DIRECTLY MANIPULATES: the POINT ON THE LINE. One shared input — dragged on the
 * graph, or moved by the slider — drives every representation in lockstep: the plain-language
 * context sentence, the input/output table, the graph point, and the equation/unit-rate/current-
 * pair readouts. Nothing here is a proxy for the mathematics; the number IS the point IS the table
 * row IS the sentence's blank.
 *
 * `AxisCaptions` and `LabReadout` below are COPIES of the same-named helpers in `widgets.tsx`
 * (verified at extraction time: 27 and 36 other call sites there respectively — genuinely shared,
 * not covariation-local). Do not delete the originals from `widgets.tsx`; they are still
 * load-bearing for every other engine that calls them there. If this shared behavior ever needs to
 * change, change it in both places (or take that as the trigger to finally lift them into a real
 * shared module).
 *
 * The component body below (from the `export function CovariationScrubberW` line down) is a
 * character-for-character move of `widgets.tsx`'s former lines 17899-17906 — dense, eight lines,
 * unreformatted on purpose so a diff against git history shows a pure relocation, not a rewrite.
 */

import { useEffect, useRef } from "react";
import { gridScales } from "@/components/plotUtils";
import { snapToStep, useSvgDrag } from "@/components/useSvgDrag";
import { moveRelation, type ProcessEvent } from "@/lib/processEvents";
import { MathProse } from "@/components/math/MathText";
import { PALETTE } from "@/lib/palette";
import type { TCovariationScrubber } from "@/lib/schema";

/** Structurally the shared `WProps<TCovariationScrubber>` of `widgets.tsx`, restated here so this
 * module has no import edge back into the monolith (same rationale as `numberLineRay.tsx`). */
export interface CovariationScrubberProps {
  spec: TCovariationScrubber;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
  tone?: "neutral" | "success" | "error" | "info";
  onEvent?: (e: ProcessEvent) => void;
  locks?: readonly string[];
  seed?: string;
}

/* ── copied, not moved — see header comment ─────────────────────────────────────────────────── */

function AxisCaptions({ w, h, x = "x", y = "y" }: { w: number; h: number; x?: string; y?: string }) {
  const style = { fontSize: 11, fontWeight: 800, fill: PALETTE.ink, fillOpacity: 0.55 } as const;
  return (
    <g aria-hidden="true" data-testid="axis-captions">
      {x ? <text x={w - 4} y={h - 4} textAnchor="end" {...style}>{x}</text> : null}
      {y ? <text x={4} y={12} textAnchor="start" {...style}>{y}</text> : null}
    </g>
  );
}

function LabReadout({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "warn" }) {
  const cls = tone === "good" ? "border-leaf/35 bg-leaf/10 text-leaf-ink" : tone === "warn" ? "border-berry/35 bg-berry/10 text-berry-ink" : "border-ink/10 bg-white/80 text-ink";
  return <div className={`rounded-xl border px-3 py-2 text-center ${cls}`}><div className="text-[11px] font-extrabold uppercase tracking-wide opacity-65">{label}</div><div className="text-base font-black tabular-nums">{value}</div></div>;
}

/* ── the component — moved verbatim from widgets.tsx:17899-17906 ────────────────────────────── */

export function CovariationScrubberW({spec,value,onChange,disabled,onEvent}:CovariationScrubberProps){const x=typeof value==='number'?value:spec.inputStart;useEffect(()=>{if(typeof value!=='number')onChange(x);/* eslint-disable-next-line react-hooks/exhaustive-deps */},[]);const y=spec.a*x+spec.b,set=(nx:number)=>{const d=moveRelation(x,nx,spec.targetInput);if(d)onEvent?.({control:'input',dir:d,kind:'efficient'});onChange(nx)};// S119: the window must be five DISTINCT inputs. Clamping each cell independently collapsed the window near a bound (x=0 with inputMin=0 gave [0,0,0,1,2]) — duplicate React keys, and three identical rows in a table whose whole job is showing neighbouring values. Slide the window instead of squashing it.
  const lo=Math.max(spec.inputMin,Math.min(x-2,spec.inputMax-4));const rows=Array.from({length:5},(_,i)=>lo+i).filter(v=>v>=spec.inputMin&&v<=spec.inputMax);const W=340,H=220,G=Math.max(6,spec.inputMax),{sx,sy}=gridScales({xMin:0,xMax:G,yMin:0,yMax:Math.max(6,spec.a*G+spec.b),W,H,pad:24});
  // WS-C (S239): the POINT ON THE LINE is the learner's object — the slider's own label says
  // "drag". A press or sweep on the graph pulls the shared input to the integer lattice point
  // under the pointer; the slider stays as the keyboard-parity path.
  const svgRef=useRef<SVGSVGElement>(null);
  const drag=useSvgDrag({svgRef,viewW:W,viewH:H,disabled,onDrag:(vx)=>{const next=snapToStep(((vx-24)/(W-48))*G,spec.inputMin,spec.inputMax,1);if(next!==x)set(next);}});
  return <div className="grid gap-4"><p className="text-lg font-bold"><MathProse text={spec.prompt} /></p><div className="rounded-2xl border border-sky/20 bg-sky/5 p-4 text-center text-lg font-black">{spec.contextTemplate.replace('{x}',String(x)).replace('{y}',String(y))}</div><label className="grid gap-1 text-sm font-bold"><span>Drag the shared input</span><input type="range" min={spec.inputMin} max={spec.inputMax} step="1" value={x} disabled={disabled} onChange={e=>set(Number(e.target.value))} className="h-11 w-full accent-sky"/></label><div className="grid gap-3 md:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-ink/10"><table className="w-full text-center text-sm"><thead className="bg-ink/5"><tr><th className="p-2">{spec.inputLabel}</th><th className="p-2">{spec.outputLabel}</th></tr></thead><tbody>{rows.map(r=><tr key={r} className={r===x?'bg-sky/10 font-black':''}><td className="p-2">{r}</td><td className="p-2">{spec.a*r+spec.b}</td></tr>)}</tbody></table></div><svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border border-ink/10 bg-white" role="img" aria-label={`Graph of y equals ${spec.a} x plus ${spec.b}, current point ${x}, ${y}.`}><line x1={sx(0)} y1={sy(0)} x2={sx(G)} y2={sy(spec.a*G+spec.b)} stroke={PALETTE.sky} strokeWidth="4"/><circle cx={sx(x)} cy={sy(y)} r="8" fill={PALETTE.tangerine}/><AxisCaptions w={W} h={H} x={spec.inputLabel} y={spec.outputLabel} />{!disabled&&<rect className="mt-drag-hit" data-testid="cvs-drag" x={0} y={0} width={W} height={H-16} aria-hidden="true" {...drag.handleProps}/>}</svg></div><div className="grid grid-cols-3 gap-2"><LabReadout label="equation" value={`y=${spec.a}x${spec.b>=0?'+':''}${spec.b}`}/><LabReadout label="unit rate" value={String(spec.a)} tone="good"/><LabReadout label="current pair" value={`(${x}, ${y})`} tone={x===spec.targetInput?'good':'neutral'}/></div></div>;
}

export default CovariationScrubberW;
