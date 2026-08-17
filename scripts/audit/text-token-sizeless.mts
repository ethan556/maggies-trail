/**
 * S242 — WHICH `text-content` / `text-content-2` SITES WERE RELYING ON THE TOKEN FOR THEIR SIZE?
 *
 * Companion to `text-token-collision.mts`. That script found the sites where an explicit size was
 * being overridden. This one finds the opposite population: sites with NO size utility anywhere in
 * the same className, which are the ones that would change appearance when the fontSize keys are
 * renamed — so each gets `text-body` / `text-body-lg` added explicitly and paints as before.
 *
 * It reads a WINDOW, not a line. A className written as a template literal splits across lines:
 *
 *     className={`relative flex … text-[11px] font-bold ${
 *       active ? "text-sky-ink" : "text-content-2"
 *     }`}
 *
 * — the token and the size it competes with are three lines apart. A line-scoped search calls that
 * size-less and is wrong. The window is the enclosing `className=…` expression, found by scanning
 * back to the nearest `class(Name)=` and forward to its balancing brace or quote.
 *
 * ── THE ELEVEN THAT REMAIN ARE DELIBERATE ───────────────────────────────────────────────────────
 * Six page subtitles took `text-body-lg` and paint exactly as before. The rest were READ and left,
 * because in each the token's size was overriding an inherited size the author had set, and losing
 * it is the correction:
 *
 *   · `page.tsx:117` — a `<strong>` inside `<p class="text-lg …">` was being pulled DOWN to 1rem;
 *     it now inherits the 1.125rem its parent states.
 *   · `ProofStrip.tsx:67,71,74,76` — emphasised counts inside a `text-base` paragraph were smaller
 *     than the prose around them; they now match it.
 *   · `Trailhead.tsx:164` — a `<span>` mid-sentence inside `text-sm` was painting 1.125rem, so one
 *     clause of one sentence was visibly larger than the rest of it.
 *   · `ProfileClient.tsx:473` — only the INACTIVE branch carried the token, so the text-scale pills
 *     changed size when selected.
 *   · `ui.tsx:498,500` — `secondary` and `ghost` buttons ignored `BTN_SIZE` while `primary` and
 *     `danger` honoured it, so two variants of the same `size` prop rendered differently.
 *   · `SiteNav.tsx:101,222` — icon-only controls and a wrapper whose label sets its own size;
 *     nothing visible depends on either.
 *
 * Run: npx tsx scripts/audit/text-token-sizeless.mts
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
/* See the note in `text-token-collision.mts`: `\b` after `\]` never matches, so a trailing-`\b`
 * form silently skips every `text-[…]` arbitrary size and reports those sites as size-less. */
const SIZE = /\btext-(\[[^\]]*\]|(?:display-lg|display|body-lg|body|equation|compute|[2-9]xl|xs|sm|base|lg|xl)(?![\w-]))/;
const TOKEN = /\btext-content(-2)?\b/;

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" }).trim().split("\n");

let total = 0;
const sizeless: string[] = [];

for (const file of files) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    if (!TOKEN.test(line)) return;
    total++;
    // Scan back to the nearest className= (at most 8 lines) and forward the same, then test the
    // whole window. Generous on purpose: a false "has a size" is safe, a false "size-less" is not.
    let start = i;
    for (let k = i; k >= Math.max(0, i - 8); k--) {
      if (/class(Name)?\s*=/.test(lines[k])) { start = k; break; }
    }
    const window = lines.slice(start, Math.min(lines.length, i + 4)).join(" ");
    if (!SIZE.test(window)) sizeless.push(`${file}:${i + 1}  ${line.trim().slice(0, 110)}`);
  });
}

console.log(`  lines naming text-content or text-content-2   ${total}`);
console.log(`  …with NO size utility in the className window ${sizeless.length}   ← these need text-body / text-body-lg\n`);
for (const s of sizeless) console.log("  " + s);
