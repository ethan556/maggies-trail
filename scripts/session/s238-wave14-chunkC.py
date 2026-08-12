#!/usr/bin/env python3
# S238 wave 14 chunk C: fix the remaining 64 dirty figures in figures.tsx.
# Scoped per-function edits; assert-all-before-write.
import re, sys

P = "src/components/figures.tsx"
raw = open(P, encoding="utf8").read()
orig = raw

reg = dict(re.findall(r'"([\w-]+)": (\w+),', raw))
failed = []
applied = 0

def body_span(fig_id):
    name = reg.get(fig_id)
    if not name:
        return None
    m = re.search(r'\nfunction ' + name + r'\(', raw)
    if not m:
        return None
    start = m.start()
    nxt = raw.find("\nfunction ", start + 10)
    return (start, nxt if nxt != -1 else len(raw))

def ap(fig_id, o, n):
    global raw, applied
    span = body_span(fig_id)
    if span is None:
        failed.append((fig_id, "NO FUNCTION", o[:60])); return
    s, e = span
    body = raw[s:e]
    if body.count(o) == 1:
        raw = raw[:s] + body.replace(o, n) + raw[e:]; applied += 1; return
    pat = re.escape(o.strip()).replace(r"\ ", r"\s+")
    ms = list(re.finditer(pat, body))
    if len(ms) == 1:
        raw = raw[:s + ms[0].start()] + n.strip() + raw[s + ms[0].end():]; applied += 1
    else:
        failed.append((fig_id, f"count={body.count(o)}/regex={len(ms)}", o[:70]))

E = ap  # alias

# --- axis/tick dodges & simple nudges ---
E("si-moe-vs-n", "<text x={X(p.n)} y={131} fontSize={10} textAnchor=\"middle\" fill={INK} fillOpacity={0.7}>",
  "<text x={X(p.n) + (p.n === 100 ? -2 : p.n === 400 ? 2 : 0)} y={131} fontSize={10} textAnchor=\"middle\" fill={INK} fillOpacity={0.7}>")
E("gf-notation-hats", "x={45} y={35}", "x={40} y={35}")
E("gf-notation-hats", "x={110} y={35}", "x={112} y={35}")
E("gf-notation-hats", "x={180} y={35}", "x={184} y={35}")
E("lf-same-line", "x={70} y={44}", "x={65} y={44}")
E("ssg2-thirds-vs-fourths", 'x={55} y={96} textAnchor="middle" fontSize={11}', 'x={51} y={96} textAnchor="middle" fontSize={10}')
E("ssg2-thirds-vs-fourths", 'x={165} y={96} textAnchor="middle" fontSize={11}', 'x={161} y={96} textAnchor="middle" fontSize={10}')
E("pv1000-placeholder-507", "x={130} y={72}", "x={130} y={86}")
E("smg1-half-ways", 'x={58} y={96} textAnchor="middle" fontSize={11}', 'x={56} y={96} textAnchor="middle" fontSize={10}')
E("smg1-half-ways", 'x={162} y={96} textAnchor="middle" fontSize={11}', 'x={160} y={96} textAnchor="middle" fontSize={10}')
E("smg1-pizza-share", 'x={55} y={98} textAnchor="middle" fontSize={11}', 'x={53} y={98} textAnchor="middle" fontSize={10}')
E("smg1-pizza-share", 'x={160} y={98} textAnchor="middle" fontSize={11}', 'x={158} y={98} textAnchor="middle" fontSize={10}')
E("tno-digits-72", 'x={55} y={66} textAnchor="middle" fontSize={11}', 'x={55} y={66} textAnchor="middle" fontSize={10}')
E("tno-digits-72", 'x={165} y={66} textAnchor="middle" fontSize={11}', 'x={165} y={66} textAnchor="middle" fontSize={10}')
E("tno-add-tens-66", "x={130} y={42}", "x={134} y={42}")
E("tno-add-tens-85", "x={130} y={42}", "x={134} y={42}")
E("tno-sub-tens-50", "x={130} y={42}", "x={134} y={42}")
E("ti-twin-ladder", "lx={32} ly={43.0}", "lx={32} ly={63}")
E("ti-twin-ladder", 'x="186.1" y={44}', 'x="184" y={44}')
E("ti-twin-ladder", 'x="210.4" y={44}', 'x="212" y={44}')
E("ti-six-functions", "x={80} y={120}", "x={77} y={120}")
E("ti-six-functions", "x={232} y={114}", "x={235} y={114}")
E("ti-six-functions", "x={232} y={127}", "x={235} y={127}")
E("pp-limacon", "x={165} y={150}", "x={160} y={150}")
E("pp-limacon", "x={268} y={150}", "x={273} y={150}")
E("vec-components", 'x="120" y="94"', 'x="124" y="94"')
E("vec-tiptotail", 'x="118" y="94"', 'x="118" y="107"')
E("lc-partial-sums", 'x="150" y="28"', 'x="145" y="28"')
E("lc-partial-sums", 'x="14" y="18"', 'x="14" y="14"')
E("odometer-roll", "x={124} y={50}", "x={116} y={50}")
E("odometer-roll", "x={168} y={50}", "x={176} y={50}")
E("odometer-roll", "x={124} y={78}", "x={116} y={78}")
E("odometer-roll", "x={168} y={78}", "x={176} y={78}")
E("regroup-bundle", 'x={60} y={86} textAnchor="middle" fontSize={11}', 'x={55} y={86} textAnchor="middle" fontSize={10}')
E("regroup-bundle", 'x={168} y={86} textAnchor="middle" fontSize={11}', 'x={180} y={86} textAnchor="middle" fontSize={10}')
E("unbundle-break", 'x={60} y={86} textAnchor="middle" fontSize={11}', 'x={50} y={86} textAnchor="middle" fontSize={10}')
E("unbundle-break", 'x={168} y={86} textAnchor="middle" fontSize={11}', 'x={170} y={86} textAnchor="middle" fontSize={10}')
E("unbundle-break", "1 rod → 10 ones: 12 ones</text>", "break 1 rod → 12 ones</text>")
E("lcd-clear", 'x={232} y={60} textAnchor="middle" fontSize={15}', 'x={236} y={60} textAnchor="middle" fontSize={13}')
E("shape-attributes", 'x={52} y={108} textAnchor="middle" fontSize={11}', 'x={125} y={108} textAnchor="middle" fontSize={10}')
E("shape-attributes", 'x={150} y={108} textAnchor="middle" fontSize={11}', 'x={125} y={122} textAnchor="middle" fontSize={10}')
E("shape-attributes", '"0 0 250 120"', '"0 0 250 134"')
E("sp7-prob-scale", 'x="40" y="90"', 'x="35" y="90"')
E("sp7-prob-scale", 'x="110" y="90"', 'x="113" y="90"')
E("sp7-tree", '{[[34,"H"],[46,"T"]].map', '{[[32,"H"],[48,"T"]].map')
E("sp7-tree", "{[68,80].map", "{[66,82].map")
E("sp7-tree", 'x="164" y="37"', 'x="164" y="35"')
E("sp7-tree", 'x="164" y="49"', 'x="164" y="51"')
E("sp7-tree", 'x="164" y="71"', 'x="164" y="69"')
E("sp7-tree", 'x="164" y="83"', 'x="164" y="85"')
E("pr7-flat-fee", 'fontSize="11" fontWeight="700" fill={INK} textAnchor="middle">flat fee → not through (0,0)<',
  'fontSize="10" fontWeight="700" fill={INK} textAnchor="middle">flat fee misses (0,0)<')
E("rns-rational-def", 'x="55" y="84"', 'x="50" y="84"')
E("pr-which-on-top", 'x="105" y="30"', 'x="105" y="26"')
E("pr-which-on-top", 'x="105" y="42"', 'x="105" y="44"')
E("place-value-ladder", "y={oy + 3.5 * (rh + 2) + 12}", "y={oy + 3.5 * (rh + 2) + 14}")
E("kite-diagonals", "x={196} y={112}", "x={196} y={114}")
E("square-vs-cube-solutions", 'x={72} y={130} textAnchor="middle" fontSize={10}', 'x={150} y={130} textAnchor="middle" fontSize={10}')
E("square-vs-cube-solutions", 'x={228} y={130} textAnchor="middle" fontSize={10}', 'x={150} y={144} textAnchor="middle" fontSize={10}')
E("square-vs-cube-solutions", '"0 0 300 170"', '"0 0 300 184"')
E("synthetic-division", "{bot.map((v, i) => (", "{bot.map((v, i) => i === 3 ? null : (")
E("synthetic-division", 'fill={i === 3 ? "white" : INK}', "fill={INK}")
E("hole-vs-asymptote", '<text x={X(5.3)} y={Y(1.5)} textAnchor="middle"', '<text x={336} y={154} textAnchor="end"')
E("partition-ratio", "x={64} y={40}", "x={48} y={40}")
E("perpendicular-rotation", "<text x={140} y={152}", "<text x={66} y={168}")
E("circle-equation-distance", "x={97} y={148}", "x={97} y={152}")
E("thales-right-angle", 'label="diameter through center" dy={14}', 'label="diameter through center" dy={26}')
E("tangent-radius", "x={162} y={54}", "x={174} y={54}")

# --- perpendicular-bisector trio: split over-wide captions, clear the Y label ---
E("perp-bisector-stage2",
  '<text x={150} y={196} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>Same radius from B. The arcs cross at X and Y.</text>',
  '<text x={150} y={204} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>Same radius from B.</text>\n      <text x={150} y={218} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>The arcs cross at X and Y.</text>')
E("perp-bisector-stage2", '"0 0 300 200"', '"0 0 300 224"')
E("perp-bisector-stage3",
  '<text x={150} y={196} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>Line XY ⊥ AB at midpoint M — the perpendicular bisector.</text>',
  '<text x={150} y={204} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>Line XY ⊥ AB at midpoint M —</text>\n      <text x={150} y={218} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>the perpendicular bisector.</text>')
E("perp-bisector-stage3", '"0 0 300 200"', '"0 0 300 224"')
E("perp-bisector-why",
  '<text x={150} y={196} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>XA = XB = YA = YB (same compass setting) — equidistant ⇒ on the bisector.</text>',
  '<text x={150} y={204} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>XA = XB = YA = YB (same compass setting)</text>\n      <text x={150} y={218} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>equidistant ⇒ on the bisector.</text>')
E("perp-bisector-why", '"0 0 300 200"', '"0 0 300 224"')

E("ssa-ambiguous", "x={150} y={164}", "x={150} y={172}")
E("ssa-ambiguous", '"0 0 300 170"', '"0 0 300 180"')
E("tse-balance-same-both", 'x={78} y={116} textAnchor="middle" fontSize={11}', 'x={78} y={116} textAnchor="middle" fontSize={10}')
E("tse-balance-same-both", 'x={230} y={116} textAnchor="middle" fontSize={11}', 'x={225} y={116} textAnchor="middle" fontSize={10}')
E("tse-balance-same-both", "took 3 from one pan only</text>", "took 3 off one pan</text>")
E("tse-undo-order-track", "x={214} y={90}", "x={214} y={84}")
E("tse-undo-order-track", "x={214} y={102}", "x={214} y={98}")
E("avp-same-distance-different-side", "x={150} y={86}", "x={150} y={90}")
E("avp-same-distance-different-side", "x={150} y={100}", "x={150} y={104}")
E("avp-same-distance-different-side", '"0 0 300 106"', '"0 0 300 114"')
E("iar-dashed-solid-rule", "a fence you can&apos;t stand on", "you can&apos;t stand on it")
E("iar-dashed-solid-rule", "the fence is part of the yard</text>", "part of the yard</text>")
E("iar-name-the-failure", "x={93} y={23}", "x={98} y={23}")
E("iar-name-the-failure", "x={93} y={63}", "x={98} y={63}")
E("iar-name-the-failure",
  '<text x={140} y={63} fontSize={10} fontWeight={700} fill={INK} opacity={0.7}>fails before the cap is consulted</text>',
  '<text x={140} y={56} fontSize={10} fontWeight={700} fill={INK} opacity={0.7}>fails before</text>\n      <text x={140} y={70} fontSize={10} fontWeight={700} fill={INK} opacity={0.7}>the cap is consulted</text>')
E("iar-region-corners", "x={200} y={72}", "x={200} y={74}")
E("nls-substitute-recipe",
  '''{[["substitute", SKY], ["solve quadratic", TANGERINE], ["back-substitute", LEAF]].map(([lab, tone], i) => (
        <g key={i}>
          <rect x={10 + i * 98} y={30} width={86} height={34} rx={7} fill={tone as string} opacity={0.15} stroke={tone as string} strokeWidth={1.3} />
          <text x={53 + i * 98} y={51} textAnchor="middle" fontSize={10} fontWeight={800} fill={INK}>{lab as string}</text>
        </g>
      ))}''',
  '''{[[["substitute"], SKY], [["solve", "quadratic"], TANGERINE], [["back-", "substitute"], LEAF]].map(([lines, tone], i) => (
        <g key={i}>
          <rect x={10 + i * 98} y={30} width={86} height={34} rx={7} fill={tone as string} opacity={0.15} stroke={tone as string} strokeWidth={1.3} />
          {(lines as string[]).map((lab, j) => (
            <text key={j} x={53 + i * 98} y={(lines as string[]).length === 1 ? 51 : 44 + j * 14} textAnchor="middle" fontSize={10} fontWeight={800} fill={INK}>{lab}</text>
          ))}
        </g>
      ))}''')
E("nls-no-phantom-here", "you must check each root</text>", "check each root</text>")
E("nls-horizontal-cases", "x={238} y={18}", "x={238} y={16}")
E("sa7-units-squared", "length × length × length</text>", "length used three times</text>")
E("sa7-units-squared", "x={82} y={46}", "x={76} y={46}")
E("sa7-units-squared", "x={218} y={46}", "x={216} y={46}")
E("sa7-lateral-shortcut", "x={150} y={100}", "x={150} y={106}")
E("sa7-lateral-shortcut", '"0 0 300 110"', '"0 0 300 118"')
E("sa7-same-rule-any-base", "x={70} y={57}", "x={62} y={57}")
E("sa7-many-correct-cuts", "x={149} y={98}", "x={149} y={112}")
E("sa7-many-correct-cuts", '"0 0 300 110"', '"0 0 300 122"')
E("si-empirical-rule", "x={155} y={116}", "x={155} y={118}")
E("si-empirical-rule", '"0 0 300 120"', '"0 0 300 128"')
E("sp-same-gap-different-verdict", "const cx = 78, cy = 60;", "const cy = 60;")
E("sp-same-gap-different-verdict", "<rect x={20} y={cy - 34} width={100} height={22}", "<rect x={20} y={cy - 42} width={100} height={30}")
E("sp-same-gap-different-verdict", "<rect x={140} y={cy - 34} width={120} height={22}", "<rect x={140} y={cy - 42} width={120} height={30}")
E("sp-same-gap-different-verdict",
  '<text x={cx - 8} y={cy - 19} textAnchor="middle" fontSize={10} fontWeight={700} fill={BERRY}>under 1 MAD: could be chance</text>',
  '<text x={70} y={cy - 31} textAnchor="middle" fontSize={10} fontWeight={700} fill={BERRY}>under 1 MAD:</text>\n      <text x={70} y={cy - 17} textAnchor="middle" fontSize={10} fontWeight={700} fill={BERRY}>could be chance</text>')
E("sp-same-gap-different-verdict",
  '<text x={200} y={cy - 19} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>2 MADs or more: a real gap</text>',
  '<text x={200} y={cy - 31} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>2 MADs or more:</text>\n      <text x={200} y={cy - 17} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>a real gap</text>')
E("tse7-factor-gcf-choice", "a 3 is still hiding inside</text>", "a 3 still hides inside</text>")
E("tse7-factor-gcf-choice", "x={220} y={82}", "x={224} y={82}")
E("tse7-factor-gcf-choice", "nothing left to pull out</text>", "nothing left over</text>")
E("tse7-factor-two-ways", "y={oy + 3 * cell + 18}", "y={oy + 3 * cell + 14}")
E("pr7-interest-over-time",
  '<text x={150} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>$20 of interest every year — equal steps</text>',
  '<text x={150} y={16} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>interest: $20 a year</text>')
E("pr7-interest-over-time",
  '<text x={150} y={146} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>a straight staircase — the rate applies to the principal, not the total</text>',
  '<text x={150} y={146} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>a straight staircase —</text>\n      <text x={150} y={158} textAnchor="middle" fontSize={10} fontWeight={700} fill={LEAF}>rate × principal, never rate × total</text>')
E("pr7-interest-over-time", '"0 0 300 150"', '"0 0 300 164"')
E("pr7-commission-split", "commission is a percent OF the sale</text>", "a percent OF the sale</text>")
E("pr7-error-vs-size", 'x={80} y={54} textAnchor="middle" fontSize={11}', 'x={76} y={54} textAnchor="middle" fontSize={10}')
E("pr7-error-vs-size", 'x={220} y={54} textAnchor="middle" fontSize={11}', 'x={222} y={54} textAnchor="middle" fontSize={10}')
E("tm8-reflect-rule", "y={py(-2) + 14}", "y={py(-2) - 8}")
E("pr7-k-three-ways", "x={148} y={100}", "x={140} y={100}")
E("sy-dilation-parallel", "miss the center, and the image runs parallel</text>", "miss the center → image runs parallel</text>")
E("sy-dilation-parallel", "x={280} y={26} fontSize={10} fontWeight={700} fill={TANGERINE}", 'x={296} y={32} textAnchor="end" fontSize={10} fontWeight={700} fill={TANGERINE}')

if failed:
    print(f"APPLIED {applied}, FAILED {len(failed)} — ABORTING, nothing written")
    for f in failed:
        print("  FAIL", f)
    sys.exit(1)

open(P, "w", encoding="utf8").write(raw)
print(f"OK: {applied} edits applied, {len(raw) - len(orig):+d} bytes")
