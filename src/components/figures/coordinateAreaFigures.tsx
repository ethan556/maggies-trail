const INK = "#22314F";
const SKY = "#2E7CD6";
const TANGERINE = "#FF8A3D";
const LEAF = "#2FA36B";
const PAPER = "#FFFDF8";

function Grid({ columns = 9, rows = 6 }: { columns?: number; rows?: number }) {
  const x0 = 42;
  const y0 = 178;
  const unit = 20;
  return (
    <g aria-hidden="true">
      <rect x={x0} y={y0 - rows * unit} width={columns * unit} height={rows * unit} rx={8} fill={PAPER} />
      <g stroke={INK} strokeWidth={0.7} opacity={0.17}>
        {Array.from({ length: columns + 1 }, (_, index) => (
          <line key={`v-${index}`} x1={x0 + index * unit} y1={y0 - rows * unit} x2={x0 + index * unit} y2={y0} />
        ))}
        {Array.from({ length: rows + 1 }, (_, index) => (
          <line key={`h-${index}`} x1={x0} y1={y0 - index * unit} x2={x0 + columns * unit} y2={y0 - index * unit} />
        ))}
      </g>
      <path d={`M ${x0} ${y0 - rows * unit - 8} V ${y0} H ${x0 + columns * unit + 8}`} fill="none" stroke={INK} strokeWidth={1.5} />
      <text x={x0 + columns * unit + 14} y={y0 + 4} fontSize={11} fill={INK}>x</text>
      <text x={x0 - 4} y={y0 - rows * unit - 13} fontSize={11} fill={INK}>y</text>
    </g>
  );
}

function Point({ x, y, label, labelX = 0, labelY = -9 }: { x: number; y: number; label: string; labelX?: number; labelY?: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={4.2} fill={TANGERINE} stroke={INK} strokeWidth={1.2} />
      <text x={x + labelX} y={y + labelY} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>{label}</text>
    </g>
  );
}

/** Worked example: coordinate differences produce a 4 by 2 rectangle and area 8. */
export function AsvCoordinateRectangleArea() {
  const x0 = 42;
  const y0 = 178;
  const unit = 20;
  const px = (x: number) => x0 + x * unit;
  const py = (y: number) => y0 - y * unit;
  return (
    <svg
      viewBox="0 0 360 220"
      role="img"
      className="mx-auto w-full max-w-md"
      data-width="4"
      data-height="2"
      data-area="8"
    >
      <title>Rectangle with corners (2,2), (6,2), (6,4), and (2,4): coordinate differences give width 4 and height 2, so area equals 8 square units.</title>
      <Grid />
      <rect x={px(2)} y={py(4)} width={4 * unit} height={2 * unit} rx={3} fill={SKY} fillOpacity={0.24} stroke={SKY} strokeWidth={2.5} />
      {Array.from({ length: 4 }, (_, column) => Array.from({ length: 2 }, (_, row) => (
        <rect
          key={`${column}-${row}`}
          x={px(2) + column * unit}
          y={py(4) + row * unit}
          width={unit}
          height={unit}
          fill="none"
          stroke={SKY}
          strokeWidth={0.7}
          opacity={0.7}
        />
      )))}
      <Point x={px(2)} y={py(2)} label="(2,2)" labelX={-3} labelY={17} />
      <Point x={px(6)} y={py(2)} label="(6,2)" labelY={17} />
      <Point x={px(6)} y={py(4)} label="(6,4)" />
      <Point x={px(2)} y={py(4)} label="(2,4)" />
      <g aria-hidden="true">
        <path d={`M ${px(2)} ${py(4) - 17} H ${px(6)}`} stroke={TANGERINE} strokeWidth={2} />
        <path d={`M ${px(2)} ${py(4) - 22} V ${py(4) - 12} M ${px(6)} ${py(4) - 22} V ${py(4) - 12}`} stroke={TANGERINE} strokeWidth={2} />
        <text x={(px(2) + px(6)) / 2} y={py(4) - 23} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>6 − 2 = 4</text>
        <path d={`M ${px(6) + 20} ${py(4)} V ${py(2)}`} stroke={LEAF} strokeWidth={2} />
        <path d={`M ${px(6) + 15} ${py(4)} H ${px(6) + 25} M ${px(6) + 15} ${py(2)} H ${px(6) + 25}`} stroke={LEAF} strokeWidth={2} />
        <text x={px(6) + 29} y={(py(4) + py(2)) / 2 + 4} fontSize={11} fontWeight={700} fill={INK}>4 − 2 = 2</text>
        <rect x="242" y="75" width="102" height="70" rx="14" fill="#EAF2FC" stroke={SKY} strokeWidth={1.2} />
        <text x="293" y="98" textAnchor="middle" fontSize={11} fill={INK}>width × height</text>
        <text x="293" y="123" textAnchor="middle" fontSize={17} fontWeight={800} fill={INK}>4 × 2 = 8</text>
        <text x="293" y="137" textAnchor="middle" fontSize={10} fill={INK}>square units</text>
      </g>
    </svg>
  );
}

/** General visual scaffold: horizontal and vertical coordinate changes are perpendicular triangle legs. */
export function AsvCoordinateRightTriangleLegs() {
  return (
    <svg viewBox="0 0 360 220" role="img" className="mx-auto w-full max-w-md" data-area-rule="one-half-base-times-height">
      <title>A right triangle on a coordinate grid: one leg is horizontal and one is vertical, so read the base as the change in x and the height as the change in y, then take one half of base times height.</title>
      <Grid columns={8} rows={6} />
      <polygon points="82,158 202,158 82,78" fill={SKY} fillOpacity={0.22} stroke={SKY} strokeWidth={2.5} />
      <Point x={82} y={158} label="A" labelX={-12} labelY={15} />
      <Point x={202} y={158} label="B" labelY={16} />
      <Point x={82} y={78} label="C" labelX={-12} />
      <path d="M 82 142 H 98 V 158" fill="none" stroke={TANGERINE} strokeWidth={2.5} aria-hidden="true" />
      <g aria-hidden="true">
        <path d="M 82 179 H 202" stroke={TANGERINE} strokeWidth={2} />
        <path d="M 82 174 V 184 M 202 174 V 184" stroke={TANGERINE} strokeWidth={2} />
        <text x="142" y="198" textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>base = Δx</text>
        <path d="M 58 78 V 158" stroke={LEAF} strokeWidth={2} />
        <path d="M 53 78 H 63 M 53 158 H 63" stroke={LEAF} strokeWidth={2} />
        <text x="34" y="122" textAnchor="middle" fontSize={12} fontWeight={700} fill={INK} transform="rotate(-90 34 122)">height = Δy</text>
        <rect x="234" y="72" width="112" height="79" rx="14" fill="#EFF8F3" stroke={LEAF} strokeWidth={1.2} />
        <text x="290" y="96" textAnchor="middle" fontSize={11} fill={INK}>perpendicular legs</text>
        <text x="290" y="121" textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>A = ½ × b × h</text>
        <text x="290" y="139" textAnchor="middle" fontSize={10} fill={INK}>halve the rectangle</text>
      </g>
    </svg>
  );
}

/** Capstone setup: identify an attached rectangle and triangle before calculating either area. */
export function AsvCoordinateCompositeSetup() {
  return (
    <svg viewBox="0 0 360 220" role="img" className="mx-auto w-full max-w-md" data-operation="add-attached-pieces">
      <title>Coordinate composite with rectangle corners (1,1), (6,1), (6,4), and (1,4), plus an attached right triangle: find each piece from coordinate differences, then add because the pieces do not overlap.</title>
      <Grid columns={10} rows={6} />
      <rect x="62" y="98" width="100" height="60" rx="3" fill={SKY} fillOpacity={0.24} stroke={SKY} strokeWidth={2.5} />
      <polygon points="162,98 162,158 222,158" fill={TANGERINE} fillOpacity={0.28} stroke={TANGERINE} strokeWidth={2.5} />
      <path d="M 162 142 H 178 V 158" fill="none" stroke={INK} strokeWidth={2} aria-hidden="true" />
      <Point x={62} y={158} label="(1,1)" labelX={-1} labelY={17} />
      <Point x={162} y={158} label="(6,1)" labelY={17} />
      <Point x={162} y={98} label="(6,4)" />
      <Point x={62} y={98} label="(1,4)" />
      <g aria-hidden="true">
        <rect x="75" y="116" width="75" height="25" rx="10" fill="white" fillOpacity={0.9} />
        <text x="112.5" y="133" textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>rectangle</text>
        <text x="192" y="146" textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>triangle</text>
        <path d="M 244 96 H 270" stroke={SKY} strokeWidth={7} strokeLinecap="round" />
        <text x="280" y="100" fontSize={11} fill={INK}>find its area</text>
        <path d="M 244 126 H 270" stroke={TANGERINE} strokeWidth={7} strokeLinecap="round" />
        <text x="280" y="130" fontSize={11} fill={INK}>find its area</text>
        <text x="290" y="162" textAnchor="middle" fontSize={15} fontWeight={800} fill={LEAF}>then add</text>
        <text x="290" y="202" textAnchor="middle" fontSize={10} fill={INK}>attached, not cut out</text>
      </g>
    </svg>
  );
}

/** Capstone conclusion: the already-computed attached piece areas combine by addition. */
export function AsvCoordinateCompositeSum() {
  return (
    <svg viewBox="0 0 360 190" role="img" className="mx-auto w-full max-w-md" data-rectangle-area="15" data-triangle-area="4.5" data-total-area="19.5">
      <title>Attached composite figure: a rectangle of area 15 plus a triangle of area 4.5 equals 19.5 square units.</title>
      <g aria-hidden="true">
        <rect x="28" y="42" width="112" height="82" rx="10" fill={SKY} fillOpacity={0.24} stroke={SKY} strokeWidth={2.5} />
        <text x="84" y="75" textAnchor="middle" fontSize={11} fill={INK}>rectangle</text>
        <text x="84" y="101" textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>15</text>
        <text x="154" y="91" textAnchor="middle" fontSize={24} fontWeight={800} fill={LEAF}>+</text>
        <polygon points="184,124 184,42 286,124" fill={TANGERINE} fillOpacity={0.28} stroke={TANGERINE} strokeWidth={2.5} />
        <path d="M 184 108 H 200 V 124" fill="none" stroke={INK} strokeWidth={2} />
        <rect x="195" y="53" width="84" height="24" rx="10" fill="white" fillOpacity={0.9} />
        <text x="237" y="69" textAnchor="middle" fontSize={10} fill={INK}>attached triangle</text>
        <text x="218" y="105" textAnchor="middle" fontSize={20} fontWeight={800} fill={INK}>4.5</text>
        <path d="M 305 83 H 338" stroke={INK} strokeWidth={2.5} />
        <path d="m 331 75 8 8-8 8" fill="none" stroke={INK} strokeWidth={2.5} />
        <rect x="76" y="143" width="210" height="34" rx="15" fill="#EFF8F3" stroke={LEAF} strokeWidth={1.2} />
        <text x="181" y="166" textAnchor="middle" fontSize={17} fontWeight={800} fill={INK}>15 + 4.5 = 19.5 square units</text>
      </g>
    </svg>
  );
}
