import Link from 'next/link';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface CalibrationContract {
  instrumentVersion: string;
  algorithmVersion: string;
  claimBoundary: string;
  qualityGates: Record<string, number | boolean | [number, number]>;
  collection: { storedEvidence: string[]; excludedEvidence: string[] };
}
interface ActiveCalibration {
  status: string;
  runId: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  claimBoundary: string;
}

export default async function DiagnosticMethodologyPage() {
  const root=process.cwd();
  const [contract,active]=await Promise.all([
    fs.readFile(path.join(root,'content/assessment/diagnostic-calibration-contract.json'),'utf8').then((text)=>JSON.parse(text) as CalibrationContract),
    fs.readFile(path.join(root,'content/assessment/calibration/active.json'),'utf8').then((text)=>JSON.parse(text) as ActiveCalibration)
  ]);
  const gates=Object.entries(contract.qualityGates);
  return <main className="mx-auto w-full max-w-4xl px-4 py-8">
    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-ink">Measurement integrity</p>
    <h1 className="mt-2 text-3xl font-extrabold">Diagnostic calibration methodology</h1>
    <p className="mt-3 text-ink/70 dark:text-paper/70">The adaptive diagnostic separates software readiness from psychometric evidence. The instrument can route learners with provisional parameters today, but no seed parameter becomes field-calibrated until real consented responses pass sample, fit, uncertainty, fairness-review, and human-approval gates.</p>

    <section className="mt-7 rounded-card border border-ink/10 bg-surface p-5 dark:border-paper/12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-extrabold">Current runtime state</h2><p className="mt-1 text-sm text-ink/70 dark:text-paper/70">Instrument {contract.instrumentVersion} · algorithm {contract.algorithmVersion}</p></div>
        <span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-extrabold">{active.status.replaceAll('-',' ')}</span>
      </div>
      <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{active.claimBoundary}</p>
      {active.runId ? <p className="mt-2 text-xs">Approved run: {active.runId} · {active.approvedBy} · {active.approvedAt}</p> : null}
    </section>

    <section className="mt-7 grid gap-4 md:grid-cols-2">
      <div className="rounded-card border border-leaf/25 bg-leaf/5 p-5"><h2 className="font-extrabold">Collected with explicit consent</h2><ul className="mt-3 space-y-1 text-sm">{contract.collection.storedEvidence.map((item)=><li key={item}>• {item}</li>)}</ul></div>
      <div className="rounded-card border border-ink/10 bg-surface p-5 dark:border-paper/12"><h2 className="font-extrabold">Deliberately excluded</h2><ul className="mt-3 space-y-1 text-sm">{contract.collection.excludedEvidence.map((item)=><li key={item}>• {item}</li>)}</ul></div>
    </section>

    <section className="mt-7 rounded-card border border-ink/10 bg-surface p-5 dark:border-paper/12">
      <h2 className="text-xl font-extrabold">Promotion gates</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{gates.map(([name,value])=><div key={name} className="rounded-card bg-surface-2 p-3"><p className="text-xs font-bold uppercase tracking-wide text-ink/70 dark:text-paper/70">{name.replaceAll(/([A-Z])/g,' $1')}</p><p className="mt-1 font-extrabold">{Array.isArray(value)?value.join('–'):String(value)}</p></div>)}</div>
      <p className="mt-4 text-sm text-ink/70 dark:text-paper/70">{contract.claimBoundary}</p>
    </section>

    <section className="mt-7 rounded-card border border-sky/25 bg-sky/5 p-5">
      <h2 className="font-extrabold">Field workflow</h2>
      <p className="mt-2 text-sm">Consent → secure or portable packet → de-identified export → classical statistics and 2PL candidate estimation → uncertainty and distractor review → optional DIF screening → anchor-scale linking → psychometric review → explicit promotion. Synthetic data may test this pipeline but cannot satisfy the evidence gates.</p>
    </section>
    <Link href="/placement" className="mt-6 inline-block font-extrabold text-sky-ink underline underline-offset-2">Back to diagnostic</Link>
  </main>;
}
