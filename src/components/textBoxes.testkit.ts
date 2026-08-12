/**
 * S237 — LABEL-BOX GEOMETRY FOR RENDERED SVG TEXT.
 *
 * Test support only (never imported by app code; the filename is outside vitest's
 * `*.test.ts` include glob on purpose, mirroring `WidgetView.testshim.tsx`).
 *
 * WHY IT EXISTS. jsdom does no layout: `getBBox()` is not implemented and every SVG text
 * node reports a zero-size box, so no unit test can ask the DOM whether two labels
 * overlap. A label's box is therefore MODELLED from the attributes the renderer actually
 * wrote — x, y, font-size, text-anchor — plus the string length.
 *
 * THE APPROXIMATION, stated plainly so a green run can be read honestly:
 *   width    = characters × font-size × 0.72
 *   vertical = 0.98 × font-size above the baseline, 0.28 below
 *   x origin = x, x − w/2, or x − w for text-anchor start / middle / end
 *
 * THE CONSTANTS WERE MEASURED IN CHROMIUM, and the first draft of this file had them wrong:
 * it assumed 0.62em wide and a box exactly one em tall. Chromium at 360px reports a digit at
 * font-size 11 as 7.5px wide and 13.0px tall against a 10.7px rendered em — 0.70em and 1.21em.
 * A model that small MISSES real collisions, which is how `e2e/s237-label-collision.spec.ts`
 * came to fail on a layout this model had already called clean. 0.72 × 1.26 sits just above the
 * measurement for digits. It still UNDER-estimates a wide proportional word ("target"), which is
 * the direction to know about: a word label that is only just clear here may still touch in a
 * browser. That is what the Playwright spec measures with real boxes.
 *
 * ANYTHING THIS MODEL CANNOT PLACE IS SKIPPED AND COUNTED — a rotate/scale/matrix
 * transform anywhere in the ancestor chain, a missing font-size, element children
 * (tspan). A green run means "no overlap among the boxes this model can place", never
 * "no overlap anywhere". Callers assert on the skip list so a widget cannot go quiet by
 * becoming unmeasurable.
 */

export type TextBox = {
  text: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  fontSize: number;
};

export type BoxScan = {
  boxes: TextBox[];
  /** One entry per <text> the model refused to place, with the reason. */
  skipped: string[];
};

const CHAR_EM = 0.72;
const ASCENT_EM = 0.98;
const DESCENT_EM = 0.28;

/** Advance width of a label, in the same user units as the viewBox. */
export function labelWidth(text: string, fontSize: number): number {
  return text.length * fontSize * CHAR_EM;
}

const TRANSLATE = /^\s*translate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?\s*\)\s*$/;

/** Accumulated translate() offset, or null when some ancestor transform is not a pure translate. */
function offsetOf(el: Element): { dx: number; dy: number } | null {
  let dx = 0;
  let dy = 0;
  for (let n: Element | null = el; n; n = n.parentElement) {
    const t = n.getAttribute("transform");
    if (t) {
      const m = TRANSLATE.exec(t);
      if (!m) return null;
      dx += Number(m[1]);
      dy += Number(m[2] ?? 0);
    }
    if (n.tagName.toLowerCase() === "svg") break;
  }
  return { dx, dy };
}

/** Nearest attribute value up the ancestor chain (SVG presentation attributes inherit). */
function inherited(el: Element, attr: string): string | null {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const v = n.getAttribute(attr);
    if (v !== null && v !== "") return v;
    if (n.tagName.toLowerCase() === "svg") break;
  }
  return null;
}

/** Model every <text> inside one SVG element. */
export function scanTextBoxes(svg: Element): BoxScan {
  const boxes: TextBox[] = [];
  const skipped: string[] = [];
  for (const el of Array.from(svg.querySelectorAll("text"))) {
    const text = (el.textContent ?? "").trim();
    if (text === "") continue; // an empty label draws nothing
    if (el.children.length > 0) {
      skipped.push(`element children (tspan?): ${text.slice(0, 24)}`);
      continue;
    }
    const off = offsetOf(el);
    if (!off) {
      skipped.push(`non-translate transform: ${text.slice(0, 24)}`);
      continue;
    }
    const fs = Number(inherited(el, "font-size"));
    if (!Number.isFinite(fs) || fs <= 0) {
      skipped.push(`no font-size: ${text.slice(0, 24)}`);
      continue;
    }
    const x = Number(el.getAttribute("x") ?? "0") + off.dx;
    const y = Number(el.getAttribute("y") ?? "0") + off.dy;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      skipped.push(`non-numeric x/y: ${text.slice(0, 24)}`);
      continue;
    }
    const w = labelWidth(text, fs);
    const anchor = inherited(el, "text-anchor") ?? "start";
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    boxes.push({
      text,
      x0,
      x1: x0 + w,
      y0: y - fs * ASCENT_EM,
      y1: y + fs * DESCENT_EM,
      fontSize: fs
    });
  }
  return { boxes, skipped };
}

export type Collision = { a: TextBox; b: TextBox; dx: number; dy: number };

/**
 * Every pair of boxes that overlaps on BOTH axes by more than `eps` user units.
 * `eps` exists so labels that merely touch — a legitimate tight-but-legible layout —
 * are not reported; 0.5 units is well under a stroke width at these viewBox scales.
 */
export function collisions(boxes: TextBox[], eps = 0.5): Collision[] {
  const out: Collision[] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const dx = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const dy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (dx > eps && dy > eps) out.push({ a, b, dx, dy });
    }
  }
  return out;
}

export function describeCollision(c: Collision): string {
  return (
    `"${c.a.text}" [${c.a.x0.toFixed(1)}..${c.a.x1.toFixed(1)} @${c.a.y0.toFixed(1)}] ` +
    `overlaps "${c.b.text}" [${c.b.x0.toFixed(1)}..${c.b.x1.toFixed(1)} @${c.b.y0.toFixed(1)}] ` +
    `by ${c.dx.toFixed(1)}×${c.dy.toFixed(1)} units`
  );
}
