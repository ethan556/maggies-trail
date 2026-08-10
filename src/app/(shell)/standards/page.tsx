import Link from 'next/link';
import { loadStandardsData } from '@/lib/standards.server';
import { designedEvidenceLevel, summarizeStandards } from '@/lib/standards';

const pct = (n:number,d:number) => d ? `${(100*n/d).toFixed(1)}%` : '0%';

export default async function StandardsPage() {
  const { frameworks, objectives, metrics, officialSources } = await loadStandardsData();
  const summary = summarizeStandards(objectives);
  const byGrade = new Map<number, typeof objectives>();
  for (const objective of objectives) byGrade.set(objective.gradeLevel,[...(byGrade.get(objective.gradeLevel) ?? []),objective]);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-ink">Evidence, not tags</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Standards & mastery map</h1>
        <p className="mt-3 text-ink/70 dark:text-paper/70">
          Every canonical concept has a many-to-many candidate map across national, state, and advanced-course frameworks. Every generated edge remains visibly provisional until reviewed against the full intent of the official standard; the app never converts a planning edge into a mastery claim without verified alignment plus independent practice, transfer, and retrieval evidence.
        </p>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Standards summary">
        {[
          ['Canonical objectives',summary.objectives.toLocaleString()],
          ['Runtime mastery arcs',`${metrics.runtimeMasteryArcPct.toFixed(0)}%`],
          ['Exact direct manipulation',`${metrics.exactDirectManipulationPct.toFixed(1)}%`],
          ['20+ exact states',`${metrics.exactPracticeDepthPct.toFixed(1)}%`],
          ['Review-ready standards edges',metrics.reviewReadyEdges.toLocaleString()],
          ['Official source registries',metrics.officialSourceRegistryCount.toLocaleString()]
        ].map(([label,value])=>(
          <div key={label} className="rounded-card border border-ink/10 bg-surface p-4 shadow-e1 dark:border-paper/12">
            <p className="text-2xl font-extrabold tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-bold text-ink/70 dark:text-paper/70">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
        <h2 className="text-xl font-extrabold">Evidence ladder</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[0,1,2,3,4,5].map((level)=>(
            <div key={level} className="rounded-card bg-surface-2 p-3">
              <p className="text-lg font-extrabold">Level {level}</p>
              <p className="text-sm text-ink/70 dark:text-paper/70">{summary.levels[level as 0|1|2|3|4|5]} objectives</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink/70 dark:text-paper/70">Level 1 exposed · 2 constructed · 3 independently practiced · 4 transferred · 5 retrieval-ready and cumulative. Learner mastery is reported only after the student—not merely the curriculum—produces the evidence.</p>
      </section>

      <section className="mt-8 rounded-card border border-amber/30 bg-amber/10 p-4">
        <h2 className="font-extrabold">Crosswalk verification state</h2>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          {metrics.reviewReadyEdges.toLocaleString()} evidence dossiers are ready for human review; {metrics.humanApprovedEdges.toLocaleString()} are reviewer-approved and {metrics.humanRejectedEdges.toLocaleString()} are rejected. Every approval must preserve an official-text snapshot, reviewer identity, source locator, approved depth, evidence steps, and a dossier checksum. Scope-level placeholders cannot be approved as full intent.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Frameworks</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {frameworks.map((framework)=>{
            const source=officialSources.find((row)=>row.framework===framework.id);
            return (
            <article key={framework.id} className="rounded-card border border-ink/10 bg-surface p-4 dark:border-paper/12">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">{framework.name}</h3>
                  <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">{framework.authority} · {framework.version}</p>
                </div>
                <span className="rounded-pill bg-leaf/12 px-2.5 py-1 text-xs font-extrabold text-leaf-ink">{source?.authorityVerified ? 'official source verified' : framework.status}</span>
              </div>
              {source ? <><p className="mt-3 text-xs text-ink/70 dark:text-paper/70">{source.versionLabel}</p><a className="mt-2 inline-block text-sm font-extrabold text-sky-ink underline underline-offset-2" href={source.officialUrl} target="_blank" rel="noreferrer">Open official source</a><p className="mt-2 text-xs text-ink/70 dark:text-paper/70">{source.claimBoundary}</p></> : null}
            </article>
          );})}
        </div>
      </section>

      <section className="mt-8 rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
        <h2 className="text-xl font-extrabold">Human review workflow</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">Each candidate edge is packaged as a review dossier. Reviewers compare the objective with the complete official expectation, inspect linked lesson and step evidence, confirm grade limits and required representations, then approve only the supported depth. The command-line reviewer refuses approval without an official-text snapshot and signed rationale.</p>
        <Link className="mt-4 inline-flex rounded-full bg-cta px-5 py-2.5 font-extrabold text-white" href="/standards/review">Open evidence review queue</Link>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Grade and course evidence</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-ink/10 bg-surface dark:border-paper/12">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-ink/70 dark:text-paper/70">
              <tr><th className="px-4 py-3">Band</th><th className="px-4 py-3">Objectives</th><th className="px-4 py-3">Direct/family labs</th><th className="px-4 py-3">Transfer-ready</th><th className="px-4 py-3">Mastery Studio</th></tr>
            </thead>
            <tbody>
              {[...byGrade.entries()].sort((a,b)=>a[0]-b[0]).map(([grade, rows])=>{
                const labs=rows.filter((o)=>o.directManipulation.coverage!=='none').length;
                const transfer=rows.filter((o)=>designedEvidenceLevel(o.evidence)>=4).length;
                const example=rows.find((o)=>o.practiceStates>=20) ?? rows[0];
                return <tr key={grade} className="border-t border-ink/8 dark:border-paper/10">
                  <td className="px-4 py-3 font-extrabold">{grade===0?'Kindergarten':grade===13?'Calculus':`Grade ${grade}`}</td>
                  <td className="px-4 py-3 tabular-nums">{rows.length}</td>
                  <td className="px-4 py-3 tabular-nums">{labs} · {pct(labs,rows.length)}</td>
                  <td className="px-4 py-3 tabular-nums">{transfer} · {pct(transfer,rows.length)}</td>
                  <td className="px-4 py-3"><Link className="font-extrabold text-sky-ink underline underline-offset-2" href={`/mastery/${encodeURIComponent(example.id)}`}>Open example</Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
