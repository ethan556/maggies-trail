import { TRAIL } from "./trail";

export const COPY = {
  appName: TRAIL.appName,
  tagline: "Visual K–12 math you can touch.",
  check: "Check",
  continue: "Continue",
  tryAgain: "Try again",
  showMe: "Show me how",
  hint: "Hint",
  hintCost: "−2 XP",
  explainDifferently: "Explain it differently",
  correctBanner: "Nice thinking!",
  revealBanner: "Here's how it works",
  nudgeBanner: "Almost — keep going",
  answerWas: "The answer:",
  skipOffer: "You're on a roll!",
  skipAhead: "Skip the next explainer",
  lessonDone: "Trail complete!",
  xpEarned: "XP earned",
  backHome: `Back to the ${TRAIL.trailhead}`,
  replay: "Walk it again",
  keepGoing: "What you learned"
} as const;

/**
 * Display label for a grade band. K–8 read as grades; the four high-school bands
 * read as their course tracks (Algebra 1 / Geometry / Algebra 2 / Precalculus),
 * so the catalog splits the former single "Grade 9" block into named tracks.
 */
export function gradeBandLabel(grade: number): string {
  switch (grade) {
    case 0: return "Kindergarten";
    case 9: return "Algebra 1";
    case 10: return "Geometry";
    case 11: return "Algebra 2";
    case 12: return "Precalculus";
    case 13: return "Calculus";
    default: return `Grade ${grade}`;
  }
}
