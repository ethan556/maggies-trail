import Link from 'next/link';
import { loadStandardsData } from '@/lib/standards.server';

export default async function StandardsReviewPage({
  searchParams
}: {
  searchParams: Promise<{ framework?: string; objective?: string; status?: string }>;
}) {
  const filters=await searchParams;
  const { evidenceDossiers, officialSources }=await loadStandardsData();
  const rows=evidenceDossiers.filter((row)=>
    (!filters.framework || row.framework===filters.framework) &&
    (!filters.objective || row.objectiveId.includes(filters.objective)) &&
    (!filters.status || row.review.status===filters.status)
  ).slice(0,100);
  return <div className="mx-auto w-full max-w-6xl px-4 py-8">
    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-ink">Auditable alignment</p>
    <h1 className="mt-2 text-3xl font-extrabold">Standards evidence review queue</h1>
    <p className="mt-3 max-w-4xl text-sm text-ink/70 dark:text-paper/70">These dossiers are review instruments, not alignment claims. A human reviewer must open the official source, replace scope placeholders with the exact standard or benchmark, compare the full intent, inspect lesson-step evidence, and sign a bounded approval or rejection.</p>
    <div className="mt-6 overflow-x-auto rounded-card border border-ink/10 bg-surface dark:border-paper/12">
      <table className="w-full min-w-[1000px] text-left text-xs">
        <thead className="bg-surface-2 uppercase tracking-wide text-ink/70 dark:text-paper/70"><tr><th className="p-3">Objective</th><th className="p-3">Framework / locator</th><th className="p-3">Evidence</th><th className="p-3">Review state</th><th className="p-3">Official source</th></tr></thead>
        <tbody>{rows.map((row)=>{
          const source=officialSources.find((s)=>s.id===row.sourceId);
          return <tr key={row.edgeId} className="border-t border-ink/8 align-top dark:border-paper/10">
            <td className="p-3"><p className="font-extrabold">{row.objectiveTitle}</p><p className="mt-1 font-mono text-[10px]">{row.objectiveId}</p><p className="mt-1">{row.courseId}</p></td>
            <td className="p-3"><p className="font-extrabold">{row.framework}</p><p className="mt-1 font-mono">{row.candidateCode}</p><p className="mt-1 text-amber-700 dark:text-amber-300">{row.sourceTextStatus.replaceAll('-',' ')}</p></td>
            <td className="p-3"><p>{row.stepEvidence.length} linked steps</p><p className="mt-1">Practice: {row.checks.independentPracticePresent?'yes':'no'} · transfer: {row.checks.transferEvidencePresent?'yes':'no'} · retrieval: {row.checks.retrievalEvidencePresent?'yes':'no'}</p><p className="mt-2 max-w-md text-ink/70 dark:text-paper/70">{row.mappingRationale}</p></td>
            <td className="p-3"><span className="rounded-full bg-amber/15 px-2 py-1 font-extrabold">{row.review.status.replaceAll('-',' ')}</span><p className="mt-2 max-w-xs">{row.claimLimit}</p><p className="mt-2 font-mono text-[10px]">{row.edgeId}</p></td>
            <td className="p-3"><a className="font-extrabold text-sky-ink underline underline-offset-2" href={source?.officialUrl ?? row.officialUrl} target="_blank" rel="noreferrer">Open official authority</a><p className="mt-2">{source?.versionLabel}</p></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <p className="mt-4 text-xs text-ink/70 dark:text-paper/70">Showing the first {rows.length} matching dossiers. Review decisions are written through the repository review command so each decision carries the dossier hash and required official-text snapshot.</p>
    <Link href="/standards" className="mt-5 inline-block font-extrabold text-sky-ink underline underline-offset-2">Back to standards map</Link>
  </div>;
}
