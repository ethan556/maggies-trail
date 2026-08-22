import type { JSX } from "react";

type Spec = { title: string; panels: readonly [string, string, string]; labels: readonly [string, string, string]; rule: string };

const INK = "#22314F";
const BLUE = "#2E7CD6";
const ORANGE = "#FF8A3D";
const GREEN = "#2FA36B";

function Panel({ x, text, label, color }: { x: number; text: string; label: string; color: string }) {
  return <g>
    <rect x={x + 3} y={28} width={82} height={76} rx={18} fill={INK} opacity={0.1} />
    <rect x={x} y={23} width={82} height={76} rx={18} fill="#fff" stroke={color} strokeWidth={2.5} />
    <rect x={x + 8} y={31} width={66} height={7} rx={3.5} fill={color} opacity={0.24} />
    <text x={x + 41} y={67} textAnchor="middle" fontSize={text.length > 10 ? 12 : text.length > 6 ? 15 : 22} fontWeight={900} fill={INK}>{text}</text>
    <text x={x + 41} y={88} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{label}</text>
  </g>;
}

function HowManyFigure({ spec }: { spec: Spec }) {
  return <svg viewBox="0 0 330 150" role="img" className="mx-auto w-full max-w-lg" data-how-many-figure="true">
    <title>{spec.title}</title>
    <defs><linearGradient id="khm-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#FFF6E8" /></linearGradient></defs>
    <rect x={4} y={4} width={322} height={142} rx={24} fill="url(#khm-paper)" stroke={INK} strokeWidth={1.2} />
    <Panel x={22} text={spec.panels[0]} label={spec.labels[0]} color={BLUE} />
    <Panel x={124} text={spec.panels[1]} label={spec.labels[1]} color={ORANGE} />
    <Panel x={226} text={spec.panels[2]} label={spec.labels[2]} color={GREEN} />
    <path d="M108 61h11M210 61h11" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    <text x={165} y={130} textAnchor="middle" fontSize={11.5} fontWeight={900} fill={INK}>{spec.rule}</text>
  </svg>;
}

const SPECS = {
  "khm-toy-one-to-one": { title: "Four toys are paired with the count words one through four, once each.", panels: ["4 toys", "1 2 3 4", "4"], labels: ["touch", "say once", "total"], rule: "one toy ↔ one number word" },
  "khm-touch-tracks-count": { title: "A touch marker moves across four toys so none is skipped or counted twice.", panels: ["waiting", "touch 1×", "all ✓"], labels: ["start", "track", "finish"], rule: "touch shows what was counted" },
  "khm-skip-repeat-errors": { title: "Skipping makes a count too small, repeating makes it too large, and touching once gives the exact total.", panels: ["skip → 5", "once → 6", "repeat → 7"], labels: ["too small", "exact", "too large"], rule: "each object exactly once" },
  "khm-exactly-once": { title: "Six buttons each receive exactly one count mark.", panels: ["6 buttons", "6 marks", "6"], labels: ["objects", "one each", "total"], rule: "no skips and no repeats" },
  "khm-row-start-end": { title: "A row is counted from one end to the other without jumping over an object.", panels: ["START", "● ● ● ●", "STOP"], labels: ["one end", "in order", "other end"], rule: "a row gives the count a path" },
  "khm-counted-vs-waiting": { title: "A moving finger separates counted objects behind it from objects still waiting ahead.", panels: ["✓ ✓", "finger", "○ ○"], labels: ["counted", "boundary", "waiting"], rule: "the finger keeps the two sets apart" },
  "khm-circle-start-marker": { title: "A marked bead creates a starting point on a circle of seven beads.", panels: ["★ start", "7 beads", "around once"], labels: ["mark", "count", "return"], rule: "remember where the circle count began" },
  "khm-stop-before-start": { title: "After every bead is counted once, stop before counting the marked starting bead again.", panels: ["start ★", "touch each", "STOP"], labels: ["remember", "one lap", "before repeat"], rule: "one trip around, not two" },
  "khm-mark-fixed-pictures": { title: "Eight fixed stars receive one visible tick as each is counted.", panels: ["8 stars", "✓ each", "8"], labels: ["picture", "mark", "total"], rule: "a mark records each counted star" },
  "khm-marked-vs-unmarked": { title: "Marked pictures are already counted and unmarked pictures are still waiting.", panels: ["✓ ✓ ✓", "|", "☆ ☆"], labels: ["counted", "split", "waiting"], rule: "marks prevent skips and repeats" },
  "khm-last-word-total": { title: "The final count word five names the whole set of five shells.", panels: ["count 1–5", "last: 5", "5 shells"], labels: ["count", "final word", "whole set"], rule: "the last number tells how many" },
  "khm-five-shells-total": { title: "Five belongs to all five shells together, not only to the last shell touched.", panels: ["5 shells", "five", "whole group"], labels: ["objects", "count word", "meaning"], rule: "cardinality names the set" },
  "khm-unchanged-group-count": { title: "The same six-shell group keeps its total when nothing is added or removed.", panels: ["6 shells", "no change", "still 6"], labels: ["counted", "wait", "remember"], rule: "same group → same count" },
  "khm-recount-only-change": { title: "Recount only after an object is added or removed; an unchanged group keeps its known count.", panels: ["same", "+ or −", "recount"], labels: ["remember", "change", "check again"], rule: "a changed group needs a new count" },
  "khm-any-order-same-total": { title: "The same five toys give total five whether counted left to right or right to left.", panels: ["1→5", "5 toys", "5←1"], labels: ["right", "same set", "left"], rule: "order changes; amount does not" },
  "khm-both-directions-five": { title: "Two counting paths pair with the same five objects exactly once and both end at five.", panels: ["→ ends 5", "●●●●●", "← ends 5"], labels: ["path A", "objects", "path B"], rule: "every object once gives the same total" },
  "khm-spacing-conservation": { title: "Five close buttons and the same five spread buttons have equal totals.", panels: ["●●●●●", "spread", "● ● ● ● ●"], labels: ["close", "move only", "far apart"], rule: "spacing does not change how many" },
  "khm-amount-not-space": { title: "Only adding or removing buttons changes the count; empty space is not another button.", panels: ["5 close", "no + / −", "5 spread"], labels: ["before", "same objects", "after"], rule: "space is not amount" },
  "khm-scattered-marking": { title: "Nine scattered stickers are marked one at a time so each is counted exactly once.", panels: ["scattered", "✓ as counted", "9 marks"], labels: ["find", "track", "finish"], rule: "marking organizes a scattered set" },
  "khm-clean-waits": { title: "A clean sticker is waiting to be counted; a ticked sticker is already counted.", panels: ["clean", "touch + tick", "counted"], labels: ["waiting", "action", "done"], rule: "visible states keep the count honest" },
  "khm-one-more-object": { title: "Adding one toy to a group of five makes a group of six.", panels: ["5 toys", "+ 1 toy", "6 toys"], labels: ["known", "one more", "new total"], rule: "one more means the next number" },
  "khm-next-number": { title: "Each number in the counting sequence is exactly one more than the number before it.", panels: ["5", "+1", "6"], labels: ["before", "one more", "next"], rule: "the count grows by one" },
  "khm-known-plus-new": { title: "Start with a known group of six and count only the three newcomers: seven, eight, nine.", panels: ["known 6", "+3 new", "9 total"], labels: ["do not restart", "count on", "finish"], rule: "known amount + newcomers" },
  "khm-count-on-not-over": { title: "Counting on begins at the known total and says one new number for each added object.", panels: ["start 10", "11 12 13", "13"], labels: ["known", "new objects", "total"], rule: "continue instead of starting at one" },
  "khm-paired-groups-leftover": { title: "Ana's six grapes pair with six of Ben's seven grapes, leaving one grape unmatched.", panels: ["Ana: 6", "6 pairs", "Ben: 7"], labels: ["group A", "match", "one left"], rule: "one leftover proves one more" },
  "khm-one-more-compare": { title: "Ben has one more grape than Ana because every grape pairs and Ben has one extra.", panels: ["6", "+1", "7"], labels: ["Ana", "extra", "Ben"], rule: "seven is one more than six" },
  "khm-count-out-from-pile": { title: "Objects are moved from a larger pile one at a time until seven have been selected.", panels: ["big pile", "count 1…7", "7 chosen"], labels: ["source", "move", "target"], rule: "count out to the requested number" },
  "khm-stop-and-remainder": { title: "Stop selecting at seven even though more crayons remain in the source pile.", panels: ["many crayons", "STOP at 7", "some remain"], labels: ["start", "chosen", "left over"], rule: "the target supplies the stopping point" },
  "khm-subitize-patterns": { title: "Familiar small dot patterns such as two and dice-style four can be named without counting each dot.", panels: ["● ●", "● ● / ● ●", "2 or 4"], labels: ["two", "four", "quick look"], rule: "familiar shape → known amount" },
  "khm-quick-look-shapes": { title: "A stable arrangement helps the eye recognize a small amount quickly and accurately.", panels: ["pattern", "quick look", "number"], labels: ["see shape", "recognize", "name"], rule: "structure supports subitizing" },
  "khm-five-and-two-frame": { title: "A ten-frame showing one full row and two more spaces represents seven as five and two.", panels: ["5 filled", "+2 filled", "7"], labels: ["full row", "extras", "total"], rule: "five and two make seven" },
  "khm-frame-patterns": { title: "The fixed rows of a ten-frame turn amounts up to ten into recognizable five-and-some-more patterns.", panels: ["5", "+ extras", "≤ 10"], labels: ["anchor", "pattern", "amount"], rule: "the frame organizes the dots" },
} as const satisfies Record<string, Spec>;

export const HOW_MANY_FIGURES: Record<string, () => JSX.Element> = Object.fromEntries(
  Object.entries(SPECS).map(([id, spec]) => [id, () => <HowManyFigure spec={spec} />]),
) as Record<string, () => JSX.Element>;
