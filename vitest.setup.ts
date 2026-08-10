// Test-environment setup.
//
// The suite runs `environment: "node"` by default and opts individual component files into jsdom
// with a `// @vitest-environment jsdom` pragma. jsdom implements the DOM but not the handful of
// browser APIs the learner surfaces feel for, so each one is polyfilled here — feature-detected, so
// a real browser (Playwright) is never shadowed, and a node-environment file that has no `window`
// simply skips the block.
//
// Nothing here changes behaviour under test: every shim is the INERT branch the production code
// already guards for (motion.ts checks `typeof window.matchMedia !== "function"` before calling it).

import { afterEach, beforeEach, vi } from "vitest";

// ── S213 Task 3 — fail a test on an UNEXPECTED console.error, opt-in per test file ────────────
//
// A `console.error` during a test is very often a real defect wearing a costume: a React dev
// warning ("Received NaN for the `y1` attribute…") that a green suite happily swallows, because
// nothing asserted on it. This session hunted exactly one of those (S213 Task 2) and it had sat
// there, unnoticed, for at least one prior session.
//
// WHY OPT-IN, NOT GLOBAL. A blanket "any console.error fails the test" hook was tried FIRST, here,
// during this task's own investigation, and it immediately failed an existing, unrelated,
// currently-green file it had no authority to fix at the time: `widgets.aria.test.tsx` cast the raw
// `SAMPLES` corpus straight to `TWidget[]` (`(SAMPLES as TWidget[])`) instead of parsing it through
// `WidgetSpec.parse` first — unlike every sibling sample-sweep test in this suite
// (`allSamples.operability.s119.test.tsx`, `widgets.a11yAudit.s44.test.tsx`, …), which the file's
// own header even names as the convention it departed from. That skipped zod's `.default(...)`, so
// two samples' `derivativeTrace`/`triangleAngleLab` specs reached the widget with `offsetMax`/
// `gridMax` genuinely `undefined`, an arithmetic NaN followed, and React warned on the resulting
// `y1`/`y2`/`cx`/`cy`/`x`/`y` SVG attributes — the exact warning this task was sent to hunt. That
// was a real, pre-existing, fixable defect living in a file outside this session's ownership at the
// time. A global hook would have silently turned an honest "stop and report" into an unreviewed
// failure landing in someone else's file — exactly the overreach file ownership exists to prevent.
// So the trap below is OPT-IN: a named, short list of path prefixes, each one verified clean (zero
// console.error, of any kind, across every test in every file it covers) before being added. Extend
// the list only after doing the same check.
//
// `widgets.aria.test.tsx` itself was fixed in the very next hand-off (ownership was then granted,
// `SAMPLES` is now parsed through `WidgetSpec.parse` like its siblings, and both NaN warnings are
// gone), so it now belongs in this list rather than being the cautionary tale for staying out of it.
//
// Every file under these prefixes is currently console.error-clean, so `CONSOLE_ERROR_ALLOWLIST`
// is empty — there is no currently-noisy-but-legitimate case to allow through yet. If one is ever
// found, it belongs here, as its own entry, with the reason inline: an allowlist entry is a
// deferred defect, and pretending otherwise is how a NaN warning survives a whole session unseen.
const CONSOLE_ERROR_STRICT_PATH_PREFIXES: readonly string[] = [
  "src/lib/mmip/",
  "src/components/widgets.mmip.",
  "src/components/widgets.aria.",
];

const CONSOLE_ERROR_ALLOWLIST: readonly RegExp[] = [];

function formatConsoleArg(arg: unknown): string {
  if (arg instanceof Error) return arg.stack ?? arg.message;
  if (typeof arg === "string") return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function isStrictConsoleErrorPath(fileName: string | undefined): boolean {
  return !!fileName && CONSOLE_ERROR_STRICT_PATH_PREFIXES.some((prefix) => fileName.includes(prefix));
}

let unexpectedConsoleErrors: string[] = [];
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | null = null;

beforeEach((ctx: unknown) => {
  const fileName = (ctx as { task?: { file?: { name?: string } } })?.task?.file?.name;
  if (!isStrictConsoleErrorPath(fileName)) return;
  unexpectedConsoleErrors = [];
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const message = args.map(formatConsoleArg).join(" ");
    // Still visible to a human watching the run — this traps the SILENCE, not the message itself.
    process.stderr.write(`${message}\n`);
    if (!CONSOLE_ERROR_ALLOWLIST.some((re) => re.test(message))) unexpectedConsoleErrors.push(message);
  });
});

afterEach(() => {
  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = null;
  const errors = unexpectedConsoleErrors;
  unexpectedConsoleErrors = [];
  if (errors.length > 0) {
    throw new Error(
      `Unexpected console.error (${errors.length}) in a strict MMIP test file. Fix the root cause, ` +
        `or — only for a confirmed, currently-legitimate case — add a justified entry to ` +
        `CONSOLE_ERROR_ALLOWLIST in vitest.setup.ts.\n\n${errors.join("\n\n")}`
    );
  }
});

if (typeof window !== "undefined") {
  if (typeof window.matchMedia !== "function") {
    // Reduced motion defaults to OFF, matching a stock browser. Tests that need the reduced-motion
    // path override this per-case rather than inheriting a surprising global.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver !== "function") {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // jsdom has no layout, so these are no-ops rather than throws. Widgets call them during drag and
  // during the scroll-to-feedback step; an exception there would fail a test for a reason that has
  // nothing to do with the assertion being made.
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = function scrollIntoView() {};
  }
  if (typeof Element.prototype.setPointerCapture !== "function") {
    Element.prototype.setPointerCapture = function setPointerCapture() {};
    Element.prototype.releasePointerCapture = function releasePointerCapture() {};
    Element.prototype.hasPointerCapture = function hasPointerCapture() {
      return false;
    };
  }
}

// React Testing Library mounts into a shared document; without an unmount between cases the second
// render of the same component finds two copies and `getByRole` throws an ambiguity error that
// looks like a component bug.
afterEach(async () => {
  if (typeof document === "undefined") return;
  try {
    const rtl = await import("@testing-library/react");
    rtl.cleanup();
  } catch {
    /* node-environment file: nothing was mounted */
  }
});
