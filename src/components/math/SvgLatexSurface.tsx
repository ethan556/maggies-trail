"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { authoredMathParts } from "@/lib/math/authoredMath";
import type { RenderedMath } from "@/lib/math/renderMath";

type Renderer = (tex: string, display: boolean) => RenderedMath;

let rendererPromise: Promise<Renderer> | null = null;

function loadRenderer(): Promise<Renderer> {
  rendererPromise ??= Promise.all([
    import("@/lib/math/renderMath"),
    import("katex/dist/katex.min.css" as string),
  ]).then(([module]) => module.renderMath);
  return rendererPromise;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderedParts(source: string, render: Renderer): string | null {
  const parts = authoredMathParts(source, { includeArithmetic: true });
  if (!parts.some((part) => part.tex)) return null;
  return parts.map((part) => {
    const math = part.tex ? render(part.tex, false).html : "";
    return `${math}${escapeHtml(part.text)}`;
  }).join("");
}

function numericAttribute(node: SVGTextElement, name: string): number | null {
  const raw = node.getAttribute(name);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function hasPositionedTspan(node: SVGTextElement): boolean {
  return Array.from(node.querySelectorAll("tspan")).some((tspan) =>
    ["x", "y", "dx", "dy", "rotate"].some((attribute) => tspan.hasAttribute(attribute))
  );
}

type SvgBounds = { minX: number; minY: number; width: number; height: number };

function svgBounds(svg: SVGSVGElement): SvgBounds | null {
  const values = (svg.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
  const minX = values[0]!;
  const minY = values[1]!;
  const width = values[2]!;
  const height = values[3]!;
  if (width <= 0 || height <= 0) return null;
  return { minX, minY, width, height };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/**
 * A foreignObject clips its HTML to its own rectangle even when CSS overflow is visible.
 * Measure the rendered KaTeX, grow that rectangle, and keep it inside the SVG viewport.
 * Returning false is deliberately fail-safe: the caller leaves the authored SVG text visible.
 */
function fitOverlay(
  svg: SVGSVGElement,
  foreignObject: SVGForeignObjectElement,
  host: HTMLElement,
  box: DOMRect | SVGRect,
  padX: number,
  initialHeight: number,
): boolean {
  const bounds = svgBounds(svg);
  if (!bounds) return false;

  const inset = Math.max(1, padX * 0.25);
  const maxWidth = bounds.width - inset * 2;
  const maxHeight = bounds.height - inset * 2;
  const measuredWidth = Math.max(box.width + padX * 2, host.scrollWidth + padX * 2);
  const measuredHeight = Math.max(initialHeight, host.scrollHeight + Math.max(4, padX));
  if (!Number.isFinite(measuredWidth) || !Number.isFinite(measuredHeight) ||
      measuredWidth <= 0 || measuredHeight <= 0 || measuredWidth > maxWidth || measuredHeight > maxHeight) {
    return false;
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const x = clamp(centerX - measuredWidth / 2, bounds.minX + inset, bounds.minX + bounds.width - inset - measuredWidth);
  const y = clamp(centerY - measuredHeight / 2, bounds.minY + inset, bounds.minY + bounds.height - inset - measuredHeight);
  foreignObject.setAttribute("x", String(x));
  foreignObject.setAttribute("y", String(y));
  foreignObject.setAttribute("width", String(measuredWidth));
  foreignObject.setAttribute("height", String(measuredHeight));
  foreignObject.setAttribute("data-svg-latex-fit", "measured");
  return true;
}

function hydrateText(node: SVGTextElement, render: Renderer): void {
  if (node.closest("foreignObject") || hasPositionedTspan(node)) return;
  const source = (node.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!source) return;
  if (node.getAttribute("data-svg-latex-fallback") === source) return;
  if (node.getAttribute("data-svg-latex-source") === source &&
      node.nextElementSibling?.matches("foreignObject[data-svg-latex-overlay]")) return;

  if (node.hasAttribute("data-svg-latex-source")) {
    if (node.nextElementSibling?.matches("foreignObject[data-svg-latex-overlay]")) {
      node.nextElementSibling.remove();
    }
    const originalOpacity = node.getAttribute("data-svg-latex-original-opacity");
    if (originalOpacity) node.style.opacity = originalOpacity;
    else node.style.removeProperty("opacity");
    const originalAria = node.getAttribute("data-svg-latex-original-aria-hidden");
    if (originalAria === "__missing__") node.removeAttribute("aria-hidden");
    else if (originalAria !== null) node.setAttribute("aria-hidden", originalAria);
  }
  const html = renderedParts(source, render);
  if (!html) return;

  const svg = node.ownerSVGElement;
  const parent = node.parentNode;
  if (!svg || !parent || typeof node.getBBox !== "function") return;

  let box: DOMRect | SVGRect;
  try {
    box = node.getBBox();
  } catch {
    return;
  }
  if (!Number.isFinite(box.x) || !Number.isFinite(box.y)) return;

  const style = window.getComputedStyle(node);
  const fontSize = Number.parseFloat(style.fontSize) || numericAttribute(node, "font-size") || 12;
  const padX = Math.max(4, fontSize * 0.35);
  const originalHeight = Math.max(box.height || fontSize, fontSize);
  const width = Math.max(box.width + padX * 2, fontSize * 2.2);
  const height = Math.max(28, originalHeight * 2.35);

  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("x", String(box.x - padX));
  foreignObject.setAttribute("y", String(box.y - (height - originalHeight) / 2));
  foreignObject.setAttribute("width", String(width));
  foreignObject.setAttribute("height", String(height));
  foreignObject.setAttribute("aria-hidden", "true");
  foreignObject.setAttribute("focusable", "false");
  foreignObject.setAttribute("data-svg-latex-overlay", "true");
  const transform = node.getAttribute("transform");
  if (transform) foreignObject.setAttribute("transform", transform);

  const host = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  host.className = "svg-latex-overlay";
  host.style.color = style.fill && style.fill !== "none" ? style.fill : style.color;
  host.style.fontSize = `${fontSize}px`;
  host.style.fontWeight = style.fontWeight || node.getAttribute("font-weight") || "400";
  host.innerHTML = html;
  foreignObject.appendChild(host);

  // Insert before measuring: scrollWidth/scrollHeight are zero for detached HTML. The
  // original label remains visible until the KaTeX rectangle has been proven to fit.
  parent.insertBefore(foreignObject, node.nextSibling);
  if (!fitOverlay(svg, foreignObject, host, box, padX, height)) {
    foreignObject.remove();
    node.setAttribute("data-svg-latex-fallback", source);
    return;
  }

  if (!node.hasAttribute("data-svg-latex-original-opacity")) {
    node.setAttribute("data-svg-latex-original-opacity", node.style.opacity);
  }
  if (!node.hasAttribute("data-svg-latex-original-aria-hidden")) {
    node.setAttribute("data-svg-latex-original-aria-hidden", node.getAttribute("aria-hidden") ?? "__missing__");
  }
  node.removeAttribute("data-svg-latex-fallback");
  node.setAttribute("data-svg-latex-source", source);
  node.setAttribute("aria-hidden", "true");
  node.style.opacity = "0";
}

function hydrateSurface(root: HTMLElement, render: Renderer): void {
  root.querySelectorAll<SVGTextElement>("svg text").forEach((node) => {
    hydrateText(node, render);
  });
}

/**
 * Turns mathematical labels already drawn with SVG <text> into KaTeX overlays.
 *
 * This is the shared migration boundary for both the illustration registry and
 * interactive widgets. The original text remains in the DOM but is visually
 * hidden after measurement; the SVG's authored title/aria-label continues to
 * own the non-visual description. Positioned multi-line tspans are deliberately
 * left alone until they can be migrated without collapsing their layout.
 */
export function SvgLatexSurface({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let queued = false;
    let observer: MutationObserver | null = null;

    void loadRenderer().then((render) => {
      const root = rootRef.current;
      if (!active || !root) return;
      const refresh = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          if (active && rootRef.current) hydrateSurface(rootRef.current, render);
        });
      };
      hydrateSurface(root, render);
      observer = new MutationObserver((mutations) => {
        if (mutations.every((mutation) =>
          mutation.target instanceof Element && mutation.target.closest("[data-svg-latex-overlay]")
        )) return;
        refresh();
      });
      observer.observe(root, { childList: true, characterData: true, subtree: true });
    });

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, []);

  return <div ref={rootRef} className="svg-latex-surface">{children}</div>;
}
