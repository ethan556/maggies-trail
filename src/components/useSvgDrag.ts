"use client";

import { useCallback, useRef, useState, type PointerEvent, type RefObject } from "react";

/**
 * Direct manipulation for SVG manipulatives — one shared pointer-drag utility
 * so every draggable handle in the product behaves identically:
 *
 * - Pointer events with capture: a drag that leaves the handle keeps tracking.
 * - `touch-action: none` on the HANDLE ONLY — the page (and the rest of the
 *   stage) still scrolls natively; only the thing you grabbed opts out.
 * - Client → viewBox mapping from the live bounding rect, so the same drag
 *   works at every rendered size (the stage scales with the width tier).
 * - Safe under SSR/jsdom: zero-size rects and missing capture APIs no-op.
 *
 * Accessibility contract: a drag handle is always a REDUNDANT input. Every
 * widget that adopts this hook keeps its existing keyboard control (slider or
 * buttons) as the accessible, keyboard-parity path; the handle itself is
 * presentation (`aria-hidden`) and never the only way to reach a state. The
 * grading value flows through the same `onChange` either way, so evaluation
 * cannot tell (and does not care) which input produced the state.
 */
export interface SvgDragOptions {
  /** Ref to the <svg> whose viewBox coordinates the drag reports in. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** viewBox width/height (the coordinate space widgets already draw in). */
  viewW: number;
  viewH: number;
  disabled?: boolean;
  /** Called with viewBox coordinates on press and on every move while dragging. */
  onDrag: (vx: number, vy: number) => void;
  /** Optional notification when a drag ends (for settle animations). */
  onEnd?: () => void;
}

export interface SvgDragHandle {
  dragging: boolean;
  /** Spread onto the drag handle element (a fat, invisible hit target). */
  handleProps: {
    onPointerDown: (e: PointerEvent<SVGElement>) => void;
    onPointerMove: (e: PointerEvent<SVGElement>) => void;
    onPointerUp: (e: PointerEvent<SVGElement>) => void;
    onPointerCancel: (e: PointerEvent<SVGElement>) => void;
    style: { touchAction: "none"; cursor: string };
  };
}

export function useSvgDrag({ svgRef, viewW, viewH, disabled, onDrag, onEnd }: SvgDragOptions): SvgDragHandle {
  const [dragging, setDragging] = useState(false);
  const activeId = useRef<number | null>(null);

  const report = useCallback(
    (e: PointerEvent<SVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return; // SSR/jsdom or hidden — nothing to map
      const vx = ((e.clientX - rect.left) / rect.width) * viewW;
      const vy = ((e.clientY - rect.top) / rect.height) * viewH;
      onDrag(vx, vy);
    },
    [svgRef, viewW, viewH, onDrag]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (disabled) return;
      activeId.current = e.pointerId;
      setDragging(true);
      const el = e.currentTarget as Element & { setPointerCapture?: (id: number) => void };
      try {
        el.setPointerCapture?.(e.pointerId);
      } catch {
        /* capture is an enhancement; jsdom and some SVG impls lack it */
      }
      e.preventDefault();
      report(e);
    },
    [disabled, report]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (disabled || activeId.current !== e.pointerId) return;
      report(e);
    },
    [disabled, report]
  );

  const end = useCallback(
    (e: PointerEvent<SVGElement>) => {
      if (activeId.current !== e.pointerId) return;
      activeId.current = null;
      setDragging(false);
      onEnd?.();
    },
    [onEnd]
  );

  return {
    dragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      style: { touchAction: "none", cursor: dragging ? "grabbing" : "grab" }
    }
  };
}

/** Clamp + snap a raw value to a min/max/step lattice (the discrete move set
 * that keeps every reachable drag state a valid, gradable widget state). */
export function snapToStep(raw: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, raw));
  const snapped = min + Math.round((clamped - min) / step) * step;
  // kill float dust (0.30000000000000004) so readouts and grading see clean values
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number(snapped.toFixed(Math.min(decimals, 6)));
}
