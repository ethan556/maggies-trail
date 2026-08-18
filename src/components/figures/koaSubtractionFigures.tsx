/**
 * Visual-first Kindergarten subtraction canary.
 *
 * Each figure models one specific meaning of subtraction. The fixed quantities are
 * worked examples on concept surfaces only; checks and challenges remain answer-neutral.
 */

const INK = "#22314F";
const SKY = "#2E7CD6";
const TANGERINE = "#FF8A3D";
const LEAF = "#2FA36B";
const BERRY = "#D6455D";

function Counter({
  cx,
  cy,
  fill,
  muted = false,
}: {
  cx: number;
  cy: number;
  fill: string;
  muted?: boolean;
}) {
  return (
    <g opacity={muted ? 0.38 : 1}>
      <circle cx={cx} cy={cy + 3} r={17} fill={INK} opacity={0.12} />
      <circle cx={cx} cy={cy} r={16} fill={fill} stroke={INK} strokeWidth={1.5} />
      <circle cx={cx - 5} cy={cy - 6} r={4.5} fill="white" opacity={0.42} />
    </g>
  );
}

function Child({
  x,
  y,
  shirt,
  moving = false,
}: {
  x: number;
  y: number;
  shirt: string;
  moving?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={moving ? 0.76 : 1}>
      <circle cx={0} cy={0} r={10} fill="#B87553" stroke={INK} strokeWidth={1.2} />
      <path d="M -9 12 Q 0 6 9 12 L 12 36 L -12 36 Z" fill={shirt} stroke={INK} strokeWidth={1.2} />
      <path d="M -7 36 L -9 51 M 7 36 L 9 51" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M -8 18 L -18 29 M 8 18 L 18 29" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** A whole group visibly separates into the objects that stay and the objects removed. */
export function KoaTakeAwayRemoval() {
  const staying = [74, 112, 150, 188];
  return (
    <svg
      viewBox="0 0 360 190"
      role="img"
      className="mx-auto w-full max-w-lg"
      data-start-size="6"
      data-removed-size="2"
      data-remaining-size="4"
    >
      <title>
        Six counters begin in one group. Two orange counters move away from the group,
        while four blue counters stay. The picture separates what was removed from what remains.
      </title>
      <defs>
        <linearGradient id="koa-removal-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F8FC" />
        </linearGradient>
        <marker id="koa-removal-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={TANGERINE} />
        </marker>
      </defs>
      <rect x={8} y={10} width={344} height={170} rx={20} fill="url(#koa-removal-paper)" stroke={INK} strokeWidth={1.2} />
      <text x={130} y={34} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>still in the group</text>
      <rect x={36} y={48} width={190} height={92} rx={18} fill="#EAF3FC" stroke={SKY} strokeWidth={1.5} />
      {staying.map((cx) => <Counter key={cx} cx={cx} cy={88} fill={SKY} />)}
      <text x={130} y={164} textAnchor="middle" fontSize={12} fontWeight={900} fill={LEAF}>4 remain</text>
      <path d="M 220 92 Q 248 74 268 78" fill="none" stroke={TANGERINE} strokeWidth={3} markerEnd="url(#koa-removal-arrow)" />
      <rect x={274} y={48} width={58} height={92} rx={18} fill="#FFF3E9" stroke={TANGERINE} strokeWidth={1.5} strokeDasharray="5 4" />
      <Counter cx={303} cy={76} fill={TANGERINE} />
      <Counter cx={303} cy={112} fill={TANGERINE} />
      <text x={303} y={164} textAnchor="middle" fontSize={12} fontWeight={900} fill={TANGERINE}>2 left</text>
    </svg>
  );
}

/** Crossing out preserves the starting drawing while marking exactly what left. */
export function KoaSubtractionCrossOut() {
  const positions = [58, 99, 140, 181, 222, 263, 304];
  return (
    <svg
      viewBox="0 0 360 190"
      role="img"
      className="mx-auto w-full max-w-lg"
      data-start-size="7"
      data-crossed-out-size="3"
      data-remaining-size="4"
    >
      <title>
        A drawing begins with seven round berries. Three berries have a clear cross over them,
        and four berries remain plain. The crossed marks record which objects were taken away.
      </title>
      <defs>
        <linearGradient id="koa-cross-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFDF8" />
          <stop offset="1" stopColor="#F6F0E9" />
        </linearGradient>
      </defs>
      <rect x={8} y={10} width={344} height={170} rx={20} fill="url(#koa-cross-paper)" stroke={INK} strokeWidth={1.2} />
      <text x={180} y={35} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>draw the whole starting group</text>
      <path d="M 35 118 Q 180 151 325 118" fill="none" stroke="#8B674A" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
      {positions.map((cx, index) => (
        <g key={cx}>
          <Counter cx={cx} cy={86} fill={index < 3 ? BERRY : SKY} muted={index < 3} />
          {index < 3 && (
            <g stroke={BERRY} strokeWidth={4} strokeLinecap="round">
              <line x1={cx - 14} y1={72} x2={cx + 14} y2={100} />
              <line x1={cx + 14} y1={72} x2={cx - 14} y2={100} />
            </g>
          )}
        </g>
      ))}
      <text x={100} y={157} textAnchor="middle" fontSize={12} fontWeight={900} fill={BERRY}>3 crossed out</text>
      <text x={246} y={157} textAnchor="middle" fontSize={12} fontWeight={900} fill={LEAF}>4 still here</text>
    </svg>
  );
}

/** Children physically leave a playing group, making the change over time visible. */
export function KoaSubtractionActOut() {
  return (
    <svg
      viewBox="0 0 360 190"
      role="img"
      className="mx-auto w-full max-w-lg"
      data-start-size="5"
      data-leaving-size="2"
      data-remaining-size="3"
    >
      <title>
        Five children begin at play. Two children follow a dotted path toward home,
        while three children remain by the play area. Acting out the leaving makes the group smaller.
      </title>
      <defs>
        <linearGradient id="koa-play-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7F4FF" />
          <stop offset="1" stopColor="#FFFDF8" />
        </linearGradient>
        <marker id="koa-home-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={TANGERINE} />
        </marker>
      </defs>
      <rect x={8} y={10} width={344} height={170} rx={20} fill="url(#koa-play-sky)" stroke={INK} strokeWidth={1.2} />
      <text x={112} y={31} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>3 keep playing</text>
      <path d="M 28 150 Q 160 128 330 150" fill="none" stroke={LEAF} strokeWidth={9} strokeLinecap="round" opacity={0.25} />
      <Child x={62} y={67} shirt={SKY} />
      <Child x={112} y={62} shirt={LEAF} />
      <Child x={162} y={67} shirt={TANGERINE} />
      <path d="M 188 112 Q 236 130 276 95" fill="none" stroke={TANGERINE} strokeWidth={3} strokeDasharray="6 5" markerEnd="url(#koa-home-arrow)" />
      <Child x={221} y={64} shirt={BERRY} moving />
      <Child x={267} y={51} shirt={SKY} moving />
      <path d="M 295 74 L 326 48 L 347 67 V 112 H 305 V 66 Z" fill="#FFF0DD" stroke={INK} strokeWidth={1.5} />
      <rect x={320} y={85} width={12} height={27} rx={2} fill={TANGERINE} />
      <text x={280} y={159} textAnchor="middle" fontSize={12} fontWeight={900} fill={TANGERINE}>2 go home</text>
    </svg>
  );
}

/** Concrete objects, the minus sign, and the three quantities share one reading path. */
export function KoaSubtractionSentence() {
  const positions = [55, 98, 141, 184, 247, 290];
  return (
    <svg
      viewBox="0 0 360 190"
      role="img"
      className="mx-auto w-full max-w-lg"
      data-start-size="6"
      data-subtracted-size="2"
      data-difference-size="4"
    >
      <title>
        Six counters show the starting amount. Two orange counters are moved away,
        leaving four blue counters. Beneath them, the true subtraction sentence reads six minus two equals four.
      </title>
      <defs>
        <linearGradient id="koa-sentence-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F8F4EC" />
        </linearGradient>
      </defs>
      <rect x={8} y={10} width={344} height={170} rx={20} fill="url(#koa-sentence-paper)" stroke={INK} strokeWidth={1.2} />
      <text x={180} y={34} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>6 counters to start</text>
      {positions.map((cx, index) => (
        <Counter key={cx} cx={cx} cy={70} fill={index < 4 ? SKY : TANGERINE} muted={index >= 4} />
      ))}
      <path d="M 226 96 Q 270 82 314 96" fill="none" stroke={TANGERINE} strokeWidth={2.5} strokeDasharray="5 4" />
      <text x={120} y={112} textAnchor="middle" fontSize={11} fontWeight={900} fill={LEAF}>4 still here</text>
      <text x={270} y={112} textAnchor="middle" fontSize={11} fontWeight={900} fill={TANGERINE}>2 left</text>
      <g fontWeight={900} fill={INK} textAnchor="middle">
        <text x={180} y={145} fontSize={24}>6 − 2 = 4</text>
        <text x={180} y={169} fontSize={11} fill={LEAF}>start  −  leave  =  left</text>
      </g>
    </svg>
  );
}

/** A directional number path makes each backward count and the final landing inspectable. */
export function KoaCountBackLeft() {
  const x = (value: number) => 40 + value * 35;
  return (
    <svg
      viewBox="0 0 360 190"
      role="img"
      className="mx-auto w-full max-w-lg"
      data-start-value="7"
      data-count-back="3"
      data-landing-value="4"
    >
      <title>
        A number path starts at seven. Three curved arrows move backward one space at a time,
        from seven to six, six to five, and five to four. The landing point is four.
      </title>
      <defs>
        <linearGradient id="koa-countback-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5FAFF" />
          <stop offset="1" stopColor="#FFFDF8" />
        </linearGradient>
        <marker id="koa-back-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={TANGERINE} />
        </marker>
      </defs>
      <rect x={8} y={10} width={344} height={170} rx={20} fill="url(#koa-countback-paper)" stroke={INK} strokeWidth={1.2} />
      <text x={180} y={31} textAnchor="middle" fontSize={12} fontWeight={900} fill={INK}>count back one space for each object that goes</text>
      {[7, 6, 5].map((from, index) => (
        <path
          key={from}
          d={`M ${x(from) - 2} 98 Q ${x(from) - 17.5} ${54 - index * 7} ${x(from - 1) + 2} 98`}
          fill="none"
          stroke={TANGERINE}
          strokeWidth={3}
          markerEnd="url(#koa-back-arrow)"
        />
      ))}
      <line x1={x(0)} y1={112} x2={x(8)} y2={112} stroke={INK} strokeWidth={2} />
      {Array.from({ length: 9 }, (_, value) => (
        <g key={value}>
          <line x1={x(value)} y1={104} x2={x(value)} y2={121} stroke={INK} strokeWidth={2} />
          <text x={x(value)} y={141} textAnchor="middle" fontSize={12} fontWeight={value === 4 || value === 7 ? 900 : 700} fill={value === 4 ? LEAF : value === 7 ? TANGERINE : INK}>{value}</text>
        </g>
      ))}
      <circle cx={x(7)} cy={112} r={8} fill={TANGERINE} stroke="white" strokeWidth={2} />
      <circle cx={x(4)} cy={112} r={9} fill={LEAF} stroke="white" strokeWidth={2} />
      <text x={x(7)} y={165} textAnchor="middle" fontSize={11} fontWeight={900} fill={TANGERINE}>start</text>
      <text x={x(4)} y={165} textAnchor="middle" fontSize={11} fontWeight={900} fill={LEAF}>land</text>
    </svg>
  );
}
