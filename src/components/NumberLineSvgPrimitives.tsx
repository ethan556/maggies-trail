import type { ReactNode } from "react";

type AxisProps = {
  x1: number;
  x2: number;
  y: number;
  color: string;
  strokeWidth?: number;
  opacity?: number;
  testId?: string;
  arrowTestId?: string;
  children?: ReactNode;
};

/**
 * One visible, testable contract for every continuing number-line axis.
 * Arrow tips are inset at the supplied endpoints, so neither stroke nor
 * arrowhead can be clipped by a responsive SVG viewBox.
 */
export function NumberLineAxis({
  x1,
  x2,
  y,
  color,
  strokeWidth = 2,
  opacity = 1,
  testId = "number-line-axis",
  arrowTestId,
  children,
}: AxisProps) {
  const size = Math.max(5, strokeWidth * 3.5);
  return (
    <g
      data-testid={testId}
      data-number-line-axis="continuing"
      data-axis-start={x1}
      data-axis-end={x2}
      aria-hidden="true"
      fill="none"
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <g data-testid={arrowTestId} data-number-line-axis-arrows="both">
        <path data-axis-arrow="left" d={`M ${x1 + size} ${y - size * 0.62} L ${x1} ${y} L ${x1 + size} ${y + size * 0.62}`} />
        <path data-axis-arrow="right" d={`M ${x2 - size} ${y - size * 0.62} L ${x2} ${y} L ${x2 - size} ${y + size * 0.62}`} />
      </g>
      {children}
    </g>
  );
}

type DirectionHeadProps = {
  x: number;
  y: number;
  direction: "left" | "right";
  color: string;
  size?: number;
  strokeWidth?: number;
  testId?: string;
};

/** Explicit direction channel for hop/change/ray paths; no document-global marker IDs. */
export function NumberLineDirectionHead({
  x,
  y,
  direction,
  color,
  size = 7,
  strokeWidth = 2.2,
  testId = "number-line-direction-head",
}: DirectionHeadProps) {
  const sign = direction === "right" ? -1 : 1;
  return (
    <path
      data-testid={testId}
      data-number-line-direction={direction}
      aria-hidden="true"
      d={`M ${x + sign * size} ${y - size * 0.62} L ${x} ${y} L ${x + sign * size} ${y + size * 0.62}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
