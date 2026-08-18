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

function hydrateText(node: SVGTextElement, render: Renderer): void {
  if (node.closest("foreignObject") || hasPositionedTspan(node)) return;
  const source = (node.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!source) return;
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

  if (!node.hasAttribute("data-svg-latex-original-opacity")) {
    node.setAttribute("data-svg-latex-original-opacity", node.style.opacity);
  }
  if (!node.hasAttribute("data-svg-latex-original-aria-hidden")) {
    node.setAttribute("data-svg-latex-original-aria-hidden", node.getAttribute("aria-hidden") ?? "__missing__");
  }
  node.setAttribute("data-svg-latex-source", source);
  node.setAttribute("aria-hidden", "true");
  node.style.opacity = "0";
  parent.insertBefore(foreignObject, node.nextSibling);
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

  return <div ref={rootRef} style={{ display: "contents" }}>{children}</div>;
}
