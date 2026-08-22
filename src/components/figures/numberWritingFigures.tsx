import type { JSX } from "react";

const INK = "#22314F";
const SKY = "#2E7CD6";
const TANGERINE = "#FF8A3D";
const LEAF = "#2FA36B";
const IVORY = "#FFF9EF";

type FigureSpec = {
  title: string;
  cards: readonly [string, string, string];
  captions: readonly [string, string, string];
  relation: string;
};

function Card({ x, value, caption, accent }: { x: number; value: string; caption: string; accent: string }) {
  return (
    <g>
      <rect x={x + 2} y={25} width={82} height={82} rx={18} fill={INK} opacity={0.1} />
      <rect x={x} y={20} width={82} height={82} rx={18} fill="white" stroke={accent} strokeWidth={2.5} />
      <rect x={x + 8} y={28} width={66} height={8} rx={4} fill={accent} opacity={0.22} />
      <text x={x + 41} y={71} textAnchor="middle" fontSize={value.length > 8 ? 13 : value.length > 4 ? 18 : 28} fontWeight={900} fill={INK}>
        {value}
      </text>
      <text x={x + 41} y={93} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={accent}>
        {caption}
      </text>
    </g>
  );
}

function NumberWritingFigure({ spec }: { spec: FigureSpec }) {
  return (
    <svg viewBox="0 0 330 150" role="img" className="mx-auto w-full max-w-lg" data-number-writing-figure="true">
      <title>{spec.title}</title>
      <defs>
        <linearGradient id="nwk-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={IVORY} />
        </linearGradient>
      </defs>
      <rect x={4} y={4} width={322} height={142} rx={24} fill="url(#nwk-paper)" stroke={INK} strokeWidth={1.2} opacity={0.98} />
      <Card x={22} value={spec.cards[0]} caption={spec.captions[0]} accent={SKY} />
      <Card x={124} value={spec.cards[1]} caption={spec.captions[1]} accent={TANGERINE} />
      <Card x={226} value={spec.cards[2]} caption={spec.captions[2]} accent={LEAF} />
      <path d="M 108 61 L 119 61 M 210 61 L 221 61" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <text x={165} y={132} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>{spec.relation}</text>
    </svg>
  );
}

const SPECS = {
  "nwk-123-amount": {
    title: "One dot, two dots, and three dots match the written numerals one, two, and three exactly.",
    cards: ["●", "●●", "●●●"], captions: ["1", "2", "3"], relation: "each numeral names an exact amount",
  },
  "nwk-write-3-path": {
    title: "Writing the numeral three follows a stable path: begin at the top, curve to the middle, then curve to the bottom.",
    cards: ["start", "curve", "finish"], captions: ["top", "middle", "bottom"], relation: "same path → readable 3",
  },
  "nwk-456-amount": {
    title: "The numerals four, five, and six each name one more object than the numeral before.",
    cards: ["●●●●", "●●●●●", "●●●●●●"], captions: ["4", "5", "6"], relation: "4, 5, 6 grow by one",
  },
  "nwk-six-nine-orientation": {
    title: "Six and nine use similar curves, but six closes its loop at the bottom while nine closes its loop at the top.",
    cards: ["6", "↕", "9"], captions: ["loop low", "turn", "loop high"], relation: "direction changes the numeral",
  },
  "nwk-789-to-ten": {
    title: "Seven, eight, and nine are the last one-digit numerals; the next number, ten, needs two digits.",
    cards: ["7 8 9", "→", "10"], captions: ["one digit", "next", "two digits"], relation: "after 9 comes 10",
  },
  "nwk-readable-orientation": {
    title: "A numeral must face the agreed direction so another reader sees the intended number rather than a flipped mark.",
    cards: ["right way", "check", "reader"], captions: ["write", "face", "understands"], relation: "clear shape carries the count",
  },
  "nwk-zero-and-ten": {
    title: "Zero records no objects; ten records one full ten and zero extra ones.",
    cards: ["empty", "0", "10"], captions: ["no objects", "zero", "1 ten, 0 ones"], relation: "0 and 10 use zero differently",
  },
  "nwk-empty-is-zero": {
    title: "An empty plate still has a count: no cookies is zero cookies, written with the numeral zero.",
    cards: ["plate", "no cookies", "0"], captions: ["look", "count", "write"], relation: "empty means zero",
  },
  "nwk-match-both-ways": {
    title: "Matching works both ways: count a group to find its numeral, or read a numeral to build its group.",
    cards: ["●●●●●", "↔", "5"], captions: ["group", "match", "numeral"], relation: "group and numeral carry one amount",
  },
  "nwk-exact-match": {
    title: "A numeral matches only an exact count: six objects do not satisfy a card that says seven.",
    cards: ["●●●●●●", "≠", "7"], captions: ["six", "not", "seven"], relation: "close is not an exact match",
  },
  "nwk-count-then-write": {
    title: "Count every object once, keep the count in order, then write the final number said.",
    cards: ["count", "last word", "write"], captions: ["objects", "how many", "numeral"], relation: "finish the count before writing",
  },
  "nwk-no-early-guess": {
    title: "Writing before the count finishes is a guess; the reliable numeral comes after every object has been counted.",
    cards: ["all objects", "finish", "numeral"], captions: ["count", "then", "record"], relation: "no early guessing",
  },
  "nwk-teen-ten-four": {
    title: "Fourteen is one full ten and four extra ones, written with a one in the tens place and a four in the ones place.",
    cards: ["10", "+ 4", "14"], captions: ["one ten", "four ones", "teen numeral"], relation: "10 + 4 = 14",
  },
  "nwk-leading-one-ten": {
    title: "In a teen numeral the front one occupies the tens place, so it represents one ten rather than one loose object.",
    cards: ["1", "tens place", "10"], captions: ["digit", "position", "value"], relation: "place gives the digit its value",
  },
  "nwk-eleven-twelve": {
    title: "Eleven and twelve hide the word teen, but their numerals still show one ten plus one or two extras.",
    cards: ["10 + 1", "11", "12"], captions: ["structure", "eleven", "twelve"], relation: "names differ; place value stays",
  },
  "nwk-name-vs-numeral": {
    title: "The words eleven and twelve sound unusual, while the written numerals reveal the shared leading one for one ten.",
    cards: ["eleven", "11", "1 ten + 1"], captions: ["word", "numeral", "meaning"], relation: "trust the place-value structure",
  },
  "nwk-teens-pattern": {
    title: "From thirteen through nineteen the front one stays fixed while the ones digit climbs from three through nine.",
    cards: ["13 14", "15 16", "17 18 19"], captions: ["start", "continue", "finish"], relation: "one ten; changing extras",
  },
  "nwk-ten-plus-extra": {
    title: "To write a teen number, write one for the full ten and then write the number of extra ones beside it.",
    cards: ["1 ten", "+ extras", "1_"], captions: ["front digit", "ones", "write"], relation: "ten first, extras second",
  },
  "nwk-twenty-regroup": {
    title: "Nineteen plus one more regroups ten ones into a second ten, making two tens and no extra ones: twenty.",
    cards: ["19 + 1", "2 tens", "20"], captions: ["fill ten", "regroup", "write"], relation: "two tens, zero ones",
  },
  "nwk-zero-placeholder": {
    title: "The zero in twenty keeps the ones place open and reports that there are no extra ones after the two tens.",
    cards: ["2", "0", "20"], captions: ["two tens", "no ones", "together"], relation: "zero holds the ones place",
  },
  "nwk-teen-count-on": {
    title: "For a teen amount, recognize the full ten, count the extra objects, and write one followed by the extras digit.",
    cards: ["full 10", "+ 7", "17"], captions: ["see", "count on", "write"], relation: "ten and seven becomes seventeen",
  },
  "nwk-ones-digit-count": {
    title: "After the full ten, the number of extra counting steps becomes the ones digit of the teen numeral.",
    cards: ["10", "4 hops", "14"], captions: ["start", "extras", "ones digit"], relation: "four extras → final digit 4",
  },
  "nwk-numeral-orders-group": {
    title: "Reading a numeral can direct a build: the card seven tells the builder to make exactly seven objects.",
    cards: ["7", "build", "●●●●●●●"], captions: ["read", "act", "seven"], relation: "numeral → exact group",
  },
  "nwk-stop-at-number": {
    title: "When building a group, stop as soon as the running count reaches the number named on the card.",
    cards: ["card 7", "count 1…7", "stop"], captions: ["target", "build", "exact"], relation: "the numeral supplies the stopping rule",
  },
  "nwk-draw-and-count": {
    title: "Draw one circle and say one number for it, repeating until the count reaches the numeral on the card.",
    cards: ["draw ○", "say 1", "repeat"], captions: ["make", "count", "to target"], relation: "one count for each new circle",
  },
  "nwk-count-during-drawing": {
    title: "Counting while drawing pairs every new circle with one number word and prevents extra or missing circles.",
    cards: ["○", "○○", "○○○"], captions: ["one", "two", "three"], relation: "count each circle as it appears",
  },
  "nwk-three-costumes": {
    title: "The numeral four, the word four, and a picture of four dots are three representations of the same amount.",
    cards: ["4", "four", "●●●●"], captions: ["numeral", "word", "picture"], relation: "three forms, one amount",
  },
  "nwk-translate-forms": {
    title: "Translation moves between numeral, number word, and quantity picture without changing the amount.",
    cards: ["5", "five", "●●●●●"], captions: ["read", "say", "show"], relation: "the amount stays five",
  },
} as const satisfies Record<string, FigureSpec>;

export const NUMBER_WRITING_FIGURES: Record<string, () => JSX.Element> = Object.fromEntries(
  Object.entries(SPECS).map(([id, spec]) => [id, () => <NumberWritingFigure spec={spec} />]),
) as Record<string, () => JSX.Element>;
