// Shared coordinate math for the cartesian-grid manipulatives (lineExplore, quadraticExplore,
// systemsExplore). Pure and framework-free so it is unit-testable; each widget keeps its own grid
// JSX (which legitimately varies) and only borrows the fiddly domain→pixel mapping from here.

export type Scale = (v: number) => number;

/** Linear map from a data domain to a pixel range. */
export function linScale(domainMin: number, domainMax: number, rangeMin: number, rangeMax: number): Scale {
  const span = domainMax - domainMin || 1;
  return (v) => rangeMin + ((v - domainMin) / span) * (rangeMax - rangeMin);
}

export interface GridBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  W: number;
  H: number;
  pad: number;
}

/** sx maps x left→right across [pad, W−pad]; sy maps y bottom→top (yMax at the top of the SVG). */
export function gridScales(b: GridBox): { sx: Scale; sy: Scale } {
  return {
    sx: linScale(b.xMin, b.xMax, b.pad, b.W - b.pad),
    sy: linScale(b.yMin, b.yMax, b.H - b.pad, b.pad)
  };
}

/** Inclusive integer range [min, max]. */
export function integers(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/** Sample y = f(x) across [xMin, xMax] into an SVG polyline points string. Points whose y falls
 * outside `yClip` are dropped (the curve simply doesn't render there), matching how the plotted
 * manipulatives clip a parabola that shoots off the grid. */
export function samplePolyline(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  sx: Scale,
  sy: Scale,
  opts?: { steps?: number; yClip?: [number, number] }
): string {
  const steps = opts?.steps ?? 120;
  const clip = opts?.yClip;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    const y = f(x);
    if (!clip || (y >= clip[0] && y <= clip[1])) pts.push(`${sx(x)},${sy(y)}`);
  }
  return pts.join(" ");
}
