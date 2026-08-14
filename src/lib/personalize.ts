import { COPY } from "@/lib/copy";
import { progressStore } from "@/lib/progress";
import { getRoster } from "@/lib/roster";
import type { IconName } from "@/components/ui";

/* ------------------------------------------------------------ Trail name -- */

const MAX_NAME = 20;

/** Sanitize a learner-entered first name: trim, collapse whitespace, cap length. */
export function cleanName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME).trim();
}

/**
 * "David" → "David's Trail" · "" → "Maggie's Trail".
 * Always "'s" (Chicago style — "James's Trail"), so the grammar is predictable
 * and matches the brand's own "Maggie's".
 */
export function trailNameFrom(name: string | null | undefined): string {
  const n = cleanName(name);
  return n ? `${n}'s Trail` : COPY.appName;
}

/** The roster seeds children as "Learner 1", "Learner 2", … — a placeholder, not a name. */
function isPlaceholderName(n: string): boolean {
  return /^Learner \d+$/.test(n.trim());
}

/**
 * Resolve the personalized trail name on the client. Priority:
 * 1. the ACTIVE roster child's name, when a family has actually named them
 *    (switching learners re-titles the trail for whoever is walking it);
 * 2. the first name given in onboarding;
 * 3. the default — Maggie's Trail.
 * Client-only (reads localStorage); callers render COPY.appName on the server
 * and swap after mount.
 */
export function resolveTrailName(): string {
  try {
    const roster = getRoster();
    const active = roster.children.find((c) => c.id === roster.activeId);
    if (active && active.name && !isPlaceholderName(active.name)) {
      return trailNameFrom(active.name);
    }
  } catch {
    /* roster unavailable — fall through */
  }
  try {
    const p = progressStore.load();
    if (p.displayName) return trailNameFrom(p.displayName);
  } catch {
    /* profile unavailable — fall through */
  }
  return COPY.appName;
}

/* ----------------------------------------------------------- Course icons -- */

/**
 * Ordered keyword → icon rules. First match wins, so put the specific before
 * the general (e.g. "triangle" lands shapes before "trig" lands functionCurve;
 * "lines & angles" lands angle before geometry lands shapes).
 */
const ICON_RULES: Array<[RegExp, IconName]> = [
  [/\bangle|lines & angles/i, "icon-908"],
  [/triangle|shape|polygon|quadrilateral|geometry|similar|congruen|circle theorems|construct|coordinate proofs|solid|transformation/i, "icon-907"],
  [/probab|sampling|chance|dice/i, "icon-912"],
  [/statist|data|distribution|bivariate|inference/i, "icon-805"],
  [/fraction|ratio|rate|proportion|percent|equal shares/i, "icon-904"],
  [/clock|time\b/i, "icon-906"],
  [/measure|measurement|volume|length|convert/i, "icon-905"],
  [/calculus|derivative|integral|limit/i, "icon-911"],
  [/function|quadratic|polynomial|exponential|logarithm|sequence|series|trig|conic|vector|matri|polar|parametric|graph/i, "icon-910"],
  [/equation|expression|inequal|system|algebra|balance/i, "icon-909"],
  [/count|place value|number|tens|million|120|1,000|decimal|integer|exponent|root|scientific|array|odd/i, "icon-902"],
  [/word problem|story problem|multi-step/i, "icon-903"],
  [/add|subtract|multipl|divi|operation|fluency/i, "icon-903"],
  // S198 Batch G kindergarten titles; exact-anchored so no earlier routing changes
  [/^how many\?$|^comparing$/i, "icon-902"],
  [/^measuring & sorting$/i, "icon-905"],
];

/**
 * Map a course title to a content-related icon. Deterministic and total —
 * anything the rules miss falls back to the brand's route mark.
 */
export function courseIcon(title: string): IconName {
  for (const [re, icon] of ICON_RULES) if (re.test(title)) return icon;
  return "icon-807";
}
