"use client";
/**
 * Phase C — RegionMap (§11/§23). A cartographic overview built from ONE mathematical motif:
 * the regions ascend as a topographic path, and each region's marker count is its trail count,
 * so the picture is made of the data rather than decorated with it.
 *
 * Deliberately NOT interactive and `aria-hidden`: AccessibleRegionList carries every link and
 * label. That keeps §28's "maps get semantic alternatives" true by construction instead of by
 * a parallel implementation that can drift. No animation, so there is nothing to disable under
 * reduced motion — the base render is already the final state.
 */
export interface AtlasRegion {
  id: string; name: string; gradeBand: number; description: string;
  environmentalGrammar: string; accessibilityLabel: string; primaryDomains: string[];
  courseCount: number; waypointCount: number;
}

const W = 720;
const H = 200;

/**
 * S203: `matchedRegionIds` dims the regions a filter excludes; it never removes them.
 *
 * The layout is positional — x comes from array index, y from grade band — so handing this
 * component a filtered list moves every remaining region to a new place on the map. A world map
 * whose landmass rearranges while a child types is not a map; the stable ground IS the
 * affordance, and it is the only reason a cartographic view earns its space next to the list.
 * Filtering is therefore emphasis, and the excluded regions stay exactly where they were.
 *
 * The dimming is safely colour-only here BECAUSE this svg is `aria-hidden`: the same
 * match/no-match state is carried as text in AccessibleRegionList, which is the semantic path.
 */
export function RegionMap({
  regions,
  activeRegionId,
  matchedRegionIds
}: {
  regions: AtlasRegion[];
  activeRegionId: string;
  matchedRegionIds?: ReadonlySet<string>;
}) {
  const n = Math.max(regions.length, 1);
  const step = W / (n + 1);
  const points = regions.map((r, i) => {
    const x = step * (i + 1);
    // Elevation rises with grade band: the trail climbs from Kindergarten to Calculus.
    const y = H - 28 - (r.gradeBand / 13) * (H - 70);
    return { r, x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    // data-region-map is a stable hook for the mode-equivalence specs: "the map is absent" has
    // to be assertable without counting every aria-hidden icon on the page.
    <div data-region-map className="stage overflow-x-auto rounded-card border border-ink/10 p-3 dark:border-paper/12">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="presentation"
        aria-hidden="true"
        className="min-w-[520px]"
      >
        <line x1="0" y1={H - 16} x2={W} y2={H - 16} stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
        <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map(({ r, x, y }) => {
          const active = r.id === activeRegionId;
          const matched = matchedRegionIds === undefined || matchedRegionIds.has(r.id);
          const dim = matched ? 1 : 0.25;
          return (
            <g key={r.id} data-region-point={r.id} data-matched={matched ? "true" : "false"}>
              <circle cx={x} cy={y} r={active ? 8 : 5} fill="currentColor" fillOpacity={(active ? 0.9 : 0.45) * dim} />
              {active && <circle cx={x} cy={y} r={13} fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity={0.7 * dim} />}
              <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.65 * dim}>
                {r.gradeBand === 0 ? "K" : r.gradeBand <= 8 ? String(r.gradeBand) : ["A1", "Geo", "A2", "Pre", "Calc"][r.gradeBand - 9]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
