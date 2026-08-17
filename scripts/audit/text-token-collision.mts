/**
 * S242 — `text-content` AND `text-content-2` WERE A COLOUR AND A FONT SIZE AT ONCE, AND ONLY SOME
 * OF THE SITES LOST.
 *
 * Found by `e2e/s242-reflow.spec.ts` the moment the CSP stopped blocking hydration: `/notebook` at
 * 320px with textScale xl put the bottom bar's "More" button 19px past the right edge, failing WCAG
 * 1.4.4 and 1.4.10. The button asks for `text-[11px]` and the browser painted it at 18px.
 *
 * `tailwind.config.ts` declared `content` and `content-2` in BOTH scales:
 *
 *     colors:   { content: channel("text"), "content-2": channel("text-2") }
 *     fontSize: { content: ["1rem", …],     "content-2": ["1.125rem", …] }
 *
 * so Tailwind emitted two rules per class, of equal specificity:
 *
 *     .text-content-2{color:rgb(var(--text-2)/…)}
 *     .text-content-2{font-size:1.125rem;line-height:1.6}
 *
 * The colour was never lost. The font size was an ambush.
 *
 * ── THE FIRST VERSION OF THIS SCRIPT OVERSTATED THE DAMAGE BY 20× ───────────────────────────────
 * It counted every className naming the token AND a size utility — 81 sites across 21 files — and
 * called all 81 overridden. Then the before/after screenshots were pixel-diffed and only the nav
 * bar moved: `atlas-1024` differed by ZERO pixels, and the 390px pages differed only in y 784–839,
 * which is the tab bar. The eyebrows the first draft named as the headline case had never changed
 * size at all.
 *
 * The reason is CSS ORDER, which the first draft never modelled. Equal specificity means the LAST
 * rule wins, and Tailwind emits font-size utilities sorted lexicographically by the class suffix.
 * Measured from the built stylesheet:
 *
 *     29141 .text-2xl   29185 .text-3xl   29234 .text-4xl   29281 .text-[10px]  29311 .text-[11px]
 *     29341 .text-[8px] 29369 .text-[9px] 29397 .text-base   ← everything above LOSES to `content`
 *     ─────────────────────────────── `content` / `content-2` sort in here ───────────────────────
 *     29491 .text-display  29563 .text-lg  29611 .text-sm  29658 .text-xl  29705 .text-xs
 *                                                          ← everything below WINS, size intact
 *
 * `[` is 0x5B and `c` is 0x63, so every arbitrary size sorts before `content`. `base`, `compute`
 * and the numeric `Nxl` sizes do too. `sm`, `xs`, `lg`, `xl`, `display` and `equation` do not — and
 * those are 77 of the 81 the first draft accused.
 *
 * So this script compares the size suffix against the token suffix the way the cascade does, and
 * reports only the sites where the token actually won. The rename in `tailwind.config.ts` fixes the
 * class of bug rather than the five instances of it: with `body` / `body-lg` there is no second
 * meaning for a `text-*` class to resolve to, whatever anyone writes next.
 *
 * Run: npx tsx scripts/audit/text-token-collision.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" }).trim().split("\n");

/* THIS SCRIPT MEASURES A COLLISION THAT NO LONGER EXISTS, and must say so rather than print a
 * number. Run against fixed source it would count the six deliberate `text-body-lg` additions as
 * overrides — `body-lg` sorts before `content` — and a reader would take that for live damage.
 * So the config is checked first: if `content` is gone from the fontSize scale there is nothing to
 * collide with, and the counts below describe history. Reproduce them with `git stash`. */
const config = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8");
const fontSizeBlock = config.slice(config.indexOf("fontSize: {"));
const stillColliding = /^\s*"?content(-2)?"?:/m.test(fontSizeBlock.slice(0, fontSizeBlock.indexOf("},")));

/* `\b` AFTER `\]` NEVER MATCHES — `]` and the following space are both non-word characters, so the
 * first draft of this regex silently skipped every arbitrary size, including the `text-[11px]` on
 * the tab bar that started all of this. A lookahead for "not a class character" is the boundary
 * that actually holds, and the longer alternatives are listed first so `display-lg` is not eaten
 * by `display`. */
const SIZE = /\btext-(\[[^\]]*\]|(?:display-lg|display|body-lg|body|equation|compute|[2-9]xl|xs|sm|base|lg|xl)(?![\w-]))/;
const TOKEN = /\btext-(content-2|content)(?![\w-])/;

/** Equal specificity, so the later rule wins — and Tailwind sorts these by class suffix. */
const tokenWins = (sizeSuffix: string, tokenSuffix: string) => sizeSuffix < tokenSuffix;

interface Hit { file: string; line: number; token: string; size: string; snippet: string }
const overridden: Hit[] = [];
const survived: Hit[] = [];
let tokenSites = 0;

for (const file of files) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  lines.forEach((text, i) => {
    for (const m of text.matchAll(/class(?:Name)?\s*=\s*[{"'`]([\s\S]*?)["'`}]/g)) {
      const cls = m[1];
      const token = cls.match(TOKEN);
      if (!token) continue;
      tokenSites++;
      const size = cls.match(SIZE);
      if (!size) continue;
      const hit: Hit = { file, line: i + 1, token: token[0], size: size[0], snippet: cls.trim().slice(0, 100) };
      (tokenWins(size[1], token[1]) ? overridden : survived).push(hit);
    }
  });
}

mkdirSync(OUT, { recursive: true });
const out = join(OUT, "TEXT_TOKEN_COLLISION.csv");
writeFileSync(out, [
  `# sourceSeal=${seal} — S242. \`content\`/\`content-2\` were declared in BOTH tailwind colors and`,
  "# fontSize, so `text-content-2` emitted a colour rule AND `font-size:1.125rem`. Equal specificity,",
  "# so the LATER rule won, and Tailwind sorts font-size utilities lexicographically by class suffix.",
  "# verdict=overridden -> the size the author wrote never took effect. verdict=survived -> it did.",
  "file,line,token,sizeAsked,verdict,snippet",
  ...[...overridden.map((h) => ({ h, v: "overridden" })), ...survived.map((h) => ({ h, v: "survived" }))]
    .map(({ h, v }) => [h.file, h.line, h.token, h.size, v, `"${h.snippet.replace(/"/g, "'")}"`].join(","))
].join("\n") + "\n");

console.log(`text-token-collision @ ${seal}`);
if (!stillColliding) {
  console.log("  tailwind.config.ts no longer declares `content` in BOTH colors and fontSize —");
  console.log("  THE COLLISION IS FIXED. The counts below are what this script would have found");
  console.log("  before the rename, and are historical. `git stash` to reproduce them live.\n");
}
console.log(`  className sites naming text-content or text-content-2   ${tokenSites}`);
console.log(`  …also naming a size, which the token OVERRODE           ${overridden.length}   ← the real damage`);
console.log(`  …also naming a size that SURVIVED (sorts after)         ${survived.length}   ← unaffected, and the first draft's false positives`);
console.log("\n── the sites where the size never took effect ──");
for (const h of overridden) console.log(`  ${h.file}:${h.line}  asked ${h.size}, got ${h.token}\n      ${h.snippet}`);
console.log(`\n  wrote ${relative(ROOT, out)}`);
