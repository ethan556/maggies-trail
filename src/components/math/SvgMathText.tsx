"use client";

import { MathInline } from "./MathText";

type SvgMathTextProps = {
  x: number;
  y: number;
  tex: string;
  fallback: string;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  align?: "left" | "center" | "right";
  opacity?: number;
  testId?: string;
};

/**
 * KaTeX inside an SVG figure.
 *
 * SVG <text> has no mathematical layout engine: it prints `x^2`, fractions,
 * roots, and limits as ordinary characters. A foreignObject gives the same
 * figure a small HTML island, allowing the app's single sanctioned KaTeX path
 * to render the expression. The enclosing SVG owns the accessible title or
 * aria-label, so this visual copy is hidden from assistive technology to avoid
 * announcing the same expression twice.
 */
export function SvgMathText({
  x,
  y,
  tex,
  fallback,
  width = 180,
  height = 28,
  fontSize = 14,
  fontWeight = 700,
  color = "currentColor",
  anchor = "middle",
  align = anchor === "start" ? "left" : anchor === "end" ? "right" : "center",
  opacity = 1,
  testId,
}: SvgMathTextProps) {
  const left = anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2;
  return (
    <foreignObject
      x={left}
      y={y - height * 0.72}
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      className="svg-math-text"
      data-testid={testId}
      style={{ color, opacity, overflow: "visible" }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize,
          fontWeight,
          height: "100%",
          justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
          lineHeight: 1,
          textAlign: align,
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        <MathInline tex={tex} fallback={fallback} />
      </div>
    </foreignObject>
  );
}

