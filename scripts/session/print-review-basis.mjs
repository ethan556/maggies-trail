/**
 * Cowork S316 helper — print the current lesson review basis hash for given lesson IDs.
 * Usage: node scripts/session/print-review-basis.mjs <lessonId> [<lessonId> ...]
 * Output: one JSON line per lesson: {"lessonId","reviewBasisHash","source"}
 * Read-only; computed by the same authority module the queue consolidator uses.
 */
import { loadLessonReviewAuthority } from "../audit/lesson-review-authority-s246.mjs";

const ids = process.argv.slice(2);
if (!ids.length) { console.error("usage: print-review-basis.mjs <lessonId...>"); process.exit(2); }
const authority = loadLessonReviewAuthority(process.cwd());
const byId = new Map(authority.lessons.map((l) => [l.lessonId, l]));
let missing = 0;
for (const id of ids) {
  const l = byId.get(id);
  if (!l) { console.error(`unknown lesson: ${id}`); missing += 1; continue; }
  console.log(JSON.stringify({ lessonId: id, reviewBasisHash: l.reviewBasisHash, source: l.source }));
}
process.exit(missing ? 1 : 0);
