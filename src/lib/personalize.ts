import { COPY } from "@/lib/copy";
import { progressStore } from "@/lib/progress";
import { getRoster } from "@/lib/roster";
import type { IconName } from "@/components/ui";
import type { SubjectIllustrationId } from "@/lib/curriculumIcons";

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
const ICON_RULES: Array<{
  match: RegExp;
  icon: IconName;
  subject: SubjectIllustrationId;
}> = [
  { match: /\bangle|lines & angles/i, icon: "icon-908", subject: "subject-angles-construction" },
  { match: /triangle|shape|polygon|quadrilateral|geometry|similar|congruen|circle theorems|construct|coordinate proofs|solid|transformation/i, icon: "icon-907", subject: "subject-geometry-shapes" },
  { match: /probab|sampling|chance|dice/i, icon: "icon-912", subject: "subject-probability-chance" },
  { match: /statist|data|distribution|bivariate|inference/i, icon: "icon-805", subject: "subject-statistics-data" },
  { match: /fraction|ratio|rate|proportion|percent|equal shares/i, icon: "icon-904", subject: "subject-fractions-ratios" },
  { match: /clock|time\b/i, icon: "icon-906", subject: "subject-time" },
  { match: /measure|measurement|volume|length|convert/i, icon: "icon-905", subject: "subject-measurement" },
  { match: /calculus|derivative|integral|limit/i, icon: "icon-911", subject: "subject-calculus-change" },
  { match: /function|quadratic|polynomial|exponential|logarithm|sequence|series|trig|conic|vector|matri|polar|parametric|graph/i, icon: "icon-910", subject: "subject-functions-graphs" },
  { match: /equation|expression|inequal|system|algebra|balance/i, icon: "icon-909", subject: "subject-algebra-equations" },
  { match: /count|place value|number|tens|million|120|1,000|decimal|integer|exponent|root|scientific|array|odd/i, icon: "icon-902", subject: "subject-number-place-value" },
  { match: /word problem|story problem|multi-step/i, icon: "icon-903", subject: "subject-operations" },
  { match: /add|subtract|multipl|divi|operation|fluency/i, icon: "icon-903", subject: "subject-operations" },
  // S198 Batch G kindergarten titles; exact-anchored so no earlier routing changes
  { match: /^how many\?$|^comparing$/i, icon: "icon-902", subject: "subject-number-place-value" },
  { match: /^measuring & sorting$/i, icon: "icon-905", subject: "subject-measurement" },
];

/**
 * Map a course title to a content-related icon. Deterministic and total —
 * anything the rules miss falls back to the brand's route mark.
 */
export function courseIcon(title: string): IconName {
  for (const rule of ICON_RULES) if (rule.match.test(title)) return rule.icon;
  return "icon-807";
}

/** Stable semantic art family for a course title. Shares the exact ordered rules above, so the
 * legacy 24px AppIcon fallback and the premium painterly tile can never tell different stories. */
export function courseSubjectId(title: string): SubjectIllustrationId {
  for (const rule of ICON_RULES) if (rule.match.test(title)) return rule.subject;
  // The shipped catalog is guarded as total in personalize.test.ts. The route-like default makes
  // an unexpected title visibly generic without fabricating a mathematical domain.
  return "subject-number-place-value";
}
