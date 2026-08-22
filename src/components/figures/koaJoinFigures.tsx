/**
 * Visual-first Kindergarten joining canary.
 *
 * These figures deliberately teach five different representations of joining. They are
 * not interchangeable decoration: each accessible title states exactly what the learner
 * can inspect, and every visible quantity agrees with the lesson beside it.
 */

const INK = "#22314F";
const SKY = "#2E7CD6";
const TANGERINE = "#FF8A3D";
const LEAF = "#2FA36B";
const PAPER = "#FFFDF8";

function Counter({
  cx,
  cy,
  fill,
  label,
}: {
  cx: number;
  cy: number;
  fill: string;
  label?: number;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy + 2} r={15} fill={INK} opacity={0.12} />
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill={fill}
        stroke={INK}
        strokeWidth={1.4}
      />
      <circle cx={cx - 4} cy={cy - 5} r={4} fill="white" opacity={0.38} />
      {label !== undefined && (
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize={12}
          fontWeight={900}
          fill="white"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Two separated groups flow into one counted whole. */
export function KoaJoinTwoGroups() {
  return (
    <svg viewBox="0 0 320 156" role="img" className="mx-auto w-full max-w-md">
      <title>
        Two blue counters and three orange counters begin in separate groups.
        Arrows bring the groups together into one row of five counters numbered
        one through five, so every counter is counted once.
      </title>
      <defs>
        <linearGradient id="koa-join-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F4F8FC" />
        </linearGradient>
        <marker
          id="koa-join-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={TANGERINE} />
        </marker>
      </defs>
      <rect
        x={8}
        y={10}
        width={304}
        height={136}
        rx={18}
        fill="url(#koa-join-card)"
        stroke={INK}
        strokeWidth={1.2}
      />
      <text
        x={70}
        y={31}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={INK}
      >
        first group
      </text>
      <text
        x={248}
        y={31}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={INK}
      >
        second group
      </text>
      <Counter cx={52} cy={55} fill={SKY} />
      <Counter cx={84} cy={55} fill={SKY} />
      <Counter cx={216} cy={55} fill={TANGERINE} />
      <Counter cx={248} cy={55} fill={TANGERINE} />
      <Counter cx={280} cy={55} fill={TANGERINE} />
      <path
        d="M 96 66 Q 124 82 142 88"
        fill="none"
        stroke={TANGERINE}
        strokeWidth={2.5}
        markerEnd="url(#koa-join-arrow)"
      />
      <path
        d="M 210 68 Q 188 83 174 88"
        fill="none"
        stroke={TANGERINE}
        strokeWidth={2.5}
        markerEnd="url(#koa-join-arrow)"
      />
      {[1, 2, 3, 4, 5].map((label, index) => (
        <Counter
          key={label}
          cx={96 + index * 32}
          cy={112}
          fill={index < 2 ? SKY : TANGERINE}
          label={label}
        />
      ))}
      <text
        x={160}
        y={142}
        textAnchor="middle"
        fontSize={12}
        fontWeight={900}
        fill={LEAF}
      >
        count both groups: 5 in all
      </text>
    </svg>
  );
}

/** Two simplified hands keep the two groups visible while the count crosses between them. */
export function KoaAddWithFingers() {
  const fingertips = [
    { x: 55, y: 42, fill: SKY, n: 1 },
    { x: 78, y: 30, fill: SKY, n: 2 },
    { x: 101, y: 42, fill: SKY, n: 3 },
    { x: 219, y: 35, fill: TANGERINE, n: 4 },
    { x: 244, y: 35, fill: TANGERINE, n: 5 },
  ];
  return (
    <svg viewBox="0 0 320 156" role="img" className="mx-auto w-full max-w-md">
      <title>
        A left hand holds up three fingers and a right hand holds up two
        fingers. Dots numbered one, two, three, four, five travel across both
        hands, showing that every raised finger belongs to one continuous count.
        Three fingers and two fingers make five fingers in all.
      </title>
      <defs>
        <linearGradient id="koa-hand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6C7A5" />
          <stop offset="1" stopColor="#D99772" />
        </linearGradient>
      </defs>
      <path
        d="M 39 116 C 34 91 39 66 48 57 L 48 43 Q 48 31 57 31 Q 66 31 66 43 L 66 57 L 69 29 Q 70 17 79 18 Q 88 19 87 31 L 86 57 L 93 41 Q 97 30 106 34 Q 114 38 109 49 L 101 72 Q 117 65 124 77 Q 130 91 113 111 L 105 124 Z"
        fill="url(#koa-hand)"
        stroke={INK}
        strokeWidth={1.5}
      />
      <path
        d="M 205 119 C 197 94 200 72 211 60 L 211 36 Q 211 24 220 24 Q 229 24 229 36 L 229 61 L 236 36 Q 239 25 248 27 Q 257 30 253 41 L 246 72 Q 264 67 270 80 Q 276 95 258 113 L 251 125 Z"
        fill="url(#koa-hand)"
        stroke={INK}
        strokeWidth={1.5}
      />
      <path
        d="M 32 133 Q 78 143 122 130"
        fill="none"
        stroke={SKY}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.28}
      />
      <path
        d="M 195 132 Q 233 143 273 130"
        fill="none"
        stroke={TANGERINE}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.28}
      />
      {fingertips.map(({ x, y, fill, n }) => (
        <g key={n}>
          <circle
            cx={x}
            cy={y}
            r={11}
            fill={fill}
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={900}
            fill="white"
          >
            {n}
          </text>
        </g>
      ))}
      <path
        d="M 113 23 Q 160 5 205 23"
        fill="none"
        stroke={LEAF}
        strokeWidth={2.5}
        strokeDasharray="4 4"
      />
      <text
        x={160}
        y={19}
        textAnchor="middle"
        fontSize={11}
        fontWeight={900}
        fill={LEAF}
      >
        keep counting
      </text>
      <text
        x={160}
        y={149}
        textAnchor="middle"
        fontSize={12}
        fontWeight={900}
        fill={INK}
      >
        3 fingers + 2 fingers = 5 fingers
      </text>
    </svg>
  );
}

/** A sketched record freezes both groups and makes the one-to-one count inspectable. */
export function KoaAddWithDrawing() {
  const left = [
    [66, 55],
    [91, 73],
    [55, 83],
  ];
  const right = [
    [196, 58],
    [224, 78],
  ];
  return (
    <svg viewBox="0 0 320 156" role="img" className="mx-auto w-full max-w-md">
      <title>
        A sheet of paper shows three blue circles in one drawn group and two
        orange circles in a second drawn group. A curved counting path labels
        the five circles from one through five. The drawing keeps both groups
        still so none is skipped or counted twice.
      </title>
      <defs>
        <filter
          id="koa-paper-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor={INK}
            floodOpacity="0.16"
          />
        </filter>
      </defs>
      <rect
        x={31}
        y={11}
        width={252}
        height={132}
        rx={10}
        fill={PAPER}
        stroke={INK}
        strokeWidth={1.2}
        filter="url(#koa-paper-shadow)"
      />
      <path
        d="M 48 41 H 267 M 48 108 H 267"
        stroke={SKY}
        strokeWidth={1}
        opacity={0.22}
      />
      <ellipse
        cx={77}
        cy={70}
        rx={48}
        ry={39}
        fill={SKY}
        opacity={0.08}
        stroke={SKY}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <ellipse
        cx={210}
        cy={69}
        rx={45}
        ry={37}
        fill={TANGERINE}
        opacity={0.08}
        stroke={TANGERINE}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {left.map(([cx, cy], index) => (
        <Counter
          key={`l-${index}`}
          cx={cx}
          cy={cy}
          fill={SKY}
          label={index + 1}
        />
      ))}
      {right.map(([cx, cy], index) => (
        <Counter
          key={`r-${index}`}
          cx={cx}
          cy={cy}
          fill={TANGERINE}
          label={index + 4}
        />
      ))}
      <path
        d="M 42 118 Q 158 137 271 116"
        fill="none"
        stroke={LEAF}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <text
        x={157}
        y={132}
        textAnchor="middle"
        fontSize={11}
        fontWeight={900}
        fill={LEAF}
      >
        the picture remembers all 5
      </text>
      <g transform="translate(257 8) rotate(25)">
        <rect
          x={0}
          y={0}
          width={9}
          height={48}
          rx={3}
          fill={TANGERINE}
          stroke={INK}
          strokeWidth={1}
        />
        <polygon
          points="0,48 9,48 4.5,59"
          fill="#E5C09A"
          stroke={INK}
          strokeWidth={1}
        />
      </g>
    </svg>
  );
}

/** People join a starting group; position and colour preserve what changed. */
export function KoaActOutAJoin() {
  const Person = ({ x, fill }: { x: number; fill: string }) => (
    <g>
      <circle
        cx={x}
        cy={54}
        r={10}
        fill={fill}
        stroke={INK}
        strokeWidth={1.2}
      />
      <path
        d={`M ${x - 14} 99 Q ${x - 12} 68 ${x} 67 Q ${x + 12} 68 ${x + 14} 99 Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={1.2}
      />
      <path
        d={`M ${x - 7} 100 L ${x - 9} 122 M ${x + 7} 100 L ${x + 9} 122`}
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg viewBox="0 0 320 156" role="img" className="mx-auto w-full max-w-md">
      <title>
        Three blue children form the starting group. Two orange children follow
        arrows into the group. A bracket then surrounds all five children,
        showing that joining makes the group grow from three children to five
        children.
      </title>
      <defs>
        <marker
          id="koa-people-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={TANGERINE} />
        </marker>
      </defs>
      <text
        x={70}
        y={22}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={SKY}
      >
        start with 3
      </text>
      <text
        x={249}
        y={22}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={TANGERINE}
      >
        2 join
      </text>
      {[42, 76, 110].map((x) => (
        <Person key={x} x={x} fill={SKY} />
      ))}
      {[224, 260].map((x) => (
        <Person key={x} x={x} fill={TANGERINE} />
      ))}
      <path
        d="M 215 37 Q 179 21 134 45"
        fill="none"
        stroke={TANGERINE}
        strokeWidth={2.5}
        strokeDasharray="5 4"
        markerEnd="url(#koa-people-arrow)"
      />
      <path
        d="M 256 37 Q 207 8 139 34"
        fill="none"
        stroke={TANGERINE}
        strokeWidth={2.5}
        strokeDasharray="5 4"
        markerEnd="url(#koa-people-arrow)"
      />
      <path
        d="M 25 132 Q 153 148 283 132"
        fill="none"
        stroke={LEAF}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={154}
        y={151}
        textAnchor="middle"
        fontSize={12}
        fontWeight={900}
        fill={LEAF}
      >
        the group grows to 5
      </text>
    </svg>
  );
}

/** Concrete groups translate into an addition sentence and an equality claim. */
export function KoaAdditionSentence() {
  return (
    <svg viewBox="0 0 320 156" role="img" className="mx-auto w-full max-w-md">
      <title>
        Three blue counters, a plus sign, and two orange counters appear on the
        left of an equals sign. Five green counters appear on the right. The
        plus sign joins the two groups, and the equals sign says both sides name
        the same total of five.
      </title>
      <defs>
        <linearGradient id="koa-equation-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F4F8F4" />
        </linearGradient>
      </defs>
      <rect
        x={9}
        y={12}
        width={302}
        height={132}
        rx={18}
        fill="url(#koa-equation-card)"
        stroke={INK}
        strokeWidth={1.2}
      />
      <text
        x={83}
        y={31}
        textAnchor="middle"
        fontSize={10}
        fontWeight={800}
        fill={INK}
      >
        groups join
      </text>
      <text
        x={239}
        y={31}
        textAnchor="middle"
        fontSize={10}
        fontWeight={800}
        fill={INK}
      >
        same amount
      </text>
      <g data-part-size="3">
        {[43, 69, 95].map((x) => (
          <Counter key={x} cx={x} cy={61} fill={SKY} />
        ))}
      </g>
      <text
        x={122}
        y={69}
        textAnchor="middle"
        fontSize={27}
        fontWeight={900}
        fill={TANGERINE}
      >
        +
      </text>
      <g data-part-size="2">
        {[146, 172].map((x) => (
          <Counter key={x} cx={x} cy={61} fill={TANGERINE} />
        ))}
      </g>
      <text
        x={201}
        y={69}
        textAnchor="middle"
        fontSize={27}
        fontWeight={900}
        fill={LEAF}
      >
        =
      </text>
      <g data-whole-size="5">
        {[
          [226, 55],
          [250, 55],
          [274, 55],
          [238, 82],
          [262, 82],
        ].map(([x, y]) => (
          <Counter key={`${x}-${y}`} cx={x} cy={y} fill={LEAF} />
        ))}
      </g>
      <text
        x={90}
        y={114}
        textAnchor="middle"
        fontSize={18}
        fontWeight={900}
        fill={INK}
      >
        3 + 2
      </text>
      <path
        d="M 132 108 H 184"
        stroke={LEAF}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={158}
        y={103}
        textAnchor="middle"
        fontSize={10}
        fontWeight={800}
        fill={LEAF}
      >
        is worth
      </text>
      <text
        x={241}
        y={114}
        textAnchor="middle"
        fontSize={18}
        fontWeight={900}
        fill={INK}
      >
        5
      </text>
      <text
        x={160}
        y={136}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={INK}
      >
        3 + 2 and 5 name the same amount
      </text>
    </svg>
  );
}
