function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function number(value, digits = 0) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function renderBacklogPortfolioHtml(model) {
  const maxRowsPerScope = Math.max(...model.portfolioClasses.map((row) => row.rowsPerScope), 1);
  const bars = model.portfolioClasses.map((row) => {
    const width = Math.max(2, (row.rowsPerScope / maxRowsPerScope) * 100);
    return `<li><div class="bar-label"><span>${escapeHtml(row.label)}</span><strong>${number(row.rowsPerScope, 2)}</strong></div><div class="track" aria-hidden="true"><span style="width:${width.toFixed(2)}%"></span></div><span class="sr-only">${escapeHtml(row.label)}: ${number(row.rowsPerScope, 2)} queue rows per portfolio</span></li>`;
  }).join("");
  const workstreamRows = model.workstreams.map((row) => `<tr><th scope="row">${escapeHtml(row.workstream.replaceAll("_", " ").toLowerCase())}</th><td>${number(row.queueRows)}</td><td>${number(row.p0)}</td><td>${number(row.uniqueLessons)}</td></tr>`).join("");
  const courseRows = model.topCourses.slice(0, 12).map((row) => `<tr><th scope="row">${escapeHtml(row.portfolioKey)}</th><td>${number(row.queueRows)}</td><td>${number(row.priorities.P0)}</td><td>${number(row.uniqueLessons)}</td></tr>`).join("");
  const generatorRows = model.generatorDomains.map((row) => `<tr><th scope="row">${escapeHtml(row.generatorDomain)}</th><td>${number(row.queueRows)}</td><td>${number(row.exactTagContracts)}</td><td>${number(row.microBatchesAt40)}</td><td>${number(row.maximumTagRows)}</td></tr>`).join("");
  const delta = model.queueRows - model.referenceRows;
  const deltaText = delta === 0 ? "matches" : `${number(Math.abs(delta))} ${delta < 0 ? "below" : "above"}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maggie's Trail backlog breakthrough</title>
<style>
:root{color-scheme:light dark;--navy:#0d1b2a;--orange:#f08a24;--ivory:#f7f3ec;--paper:#fffdf8;--ink:#13223a;--muted:#607087;--line:#d9dee7;--soft:#edf3f8}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}main{width:min(1120px,calc(100% - 32px));margin:32px auto 56px}.hero{padding:clamp(24px,5vw,56px);border-radius:28px;background:linear-gradient(135deg,var(--navy),#14395f);color:#fff;box-shadow:0 20px 55px #0d1b2a24}.eyebrow{margin:0 0 8px;color:#ffd0a1;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}h1{margin:0;font:600 clamp(2rem,5vw,4rem)/1.05 Georgia,serif}.lead{max-width:760px;margin:18px 0 0;color:#eaf0f7;font-size:1.08rem}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:28px}.metric{padding:18px;border:1px solid #ffffff2e;border-radius:16px;background:#ffffff0d}.metric span{display:block;color:#dce7f2;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}.metric strong{display:block;margin-top:4px;font-size:clamp(1.35rem,3vw,2.2rem);font-variant-numeric:tabular-nums}.section{margin-top:26px;padding:clamp(20px,4vw,36px);border:1px solid var(--line);border-radius:22px;background:var(--paper);box-shadow:0 10px 30px #0d1b2a0d}h2{margin:0 0 18px;font:600 clamp(1.35rem,3vw,2rem)/1.2 Georgia,serif}.bars{display:grid;gap:18px;margin:0;padding:0;list-style:none}.bar-label{display:flex;justify-content:space-between;gap:16px;margin-bottom:6px}.bar-label strong{font-variant-numeric:tabular-nums}.track{height:13px;overflow:hidden;border-radius:999px;background:var(--soft)}.track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--orange),#ffb15f)}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse}th,td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left}thead th{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.06em}tbody th{font-weight:500;text-transform:capitalize}td{text-align:right;font-variant-numeric:tabular-nums}.source{margin:26px 4px 0;color:var(--muted);font-size:.82rem;overflow-wrap:anywhere}.source code{color:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:760px){main{width:min(100% - 20px,1120px);margin-top:10px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.hero,.section{border-radius:18px}}@media(prefers-color-scheme:dark){:root{--ivory:#08111d;--paper:#0f1d2d;--ink:#edf3fb;--muted:#aab9cc;--line:#2c3d52;--soft:#203249}.section{box-shadow:none}}
</style>
</head>
<body>
<main>
<section class="hero">
<p class="eyebrow">Source-sealed execution view</p>
<h1>Maggie's Trail backlog breakthrough</h1>
<p class="lead">${number(model.queueRows)} live obligations compile into ${number(model.primaryPortfolios)} coherent portfolios—${number(model.compression, 2)}× fewer context scopes while preserving row-level evidence and independent review.</p>
<div class="metrics">
<div class="metric"><span>Live queue</span><strong>${number(model.queueRows)}</strong></div>
<div class="metric"><span>Primary portfolios</span><strong>${number(model.primaryPortfolios)}</strong></div>
<div class="metric"><span>Standards families</span><strong>${number(model.standardsFamilyPortfolios)}</strong></div>
<div class="metric"><span>Exact standards codes</span><strong>${number(model.standardsExactCodeContracts)}</strong></div>
<div class="metric"><span>Generator domains</span><strong>${number(model.generatorDomainPortfolios)}</strong></div>
<div class="metric"><span>Exact generator tags</span><strong>${number(model.generatorExactTagContracts)}</strong></div>
<div class="metric"><span>Generator microbatches</span><strong>${number(model.generatorMicroBatchesAt40)}</strong></div>
<div class="metric"><span>Current lesson reviews</span><strong>${number(model.reviewedLessons)}</strong></div>
<div class="metric"><span>Reference delta</span><strong>${escapeHtml(deltaText)}</strong></div>
</div>
</section>
<section class="section" aria-labelledby="compression-heading">
<h2 id="compression-heading">Queue rows represented by one portfolio</h2>
<ul class="bars">${bars}</ul>
</section>
<section class="section" aria-labelledby="generators-heading">
<h2 id="generators-heading">Generator domains preserve exact-tag contracts</h2>
<p>${number(model.generatorExactTagContracts)} exact tags and all ${number(model.generatorDomains.reduce((sum, row) => sum + row.queueRows, 0))} generator rows remain explicit inside ${number(model.generatorDomainPortfolios)} coherent parent domains. Every execution microbatch is tag-bounded and capped at 40 rows.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Generator domain</th><th scope="col">Rows</th><th scope="col">Exact tags</th><th scope="col">Batches ≤40</th><th scope="col">Largest tag</th></tr></thead><tbody>${generatorRows}</tbody></table></div>
</section>
<section class="section" aria-labelledby="workstreams-heading">
<h2 id="workstreams-heading">Open work by evidence stream</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">Workstream</th><th scope="col">Rows</th><th scope="col">P0</th><th scope="col">Lessons</th></tr></thead><tbody>${workstreamRows}</tbody></table></div>
</section>
<section class="section" aria-labelledby="courses-heading">
<h2 id="courses-heading">Highest-leverage course portfolios</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">Course</th><th scope="col">Rows</th><th scope="col">P0</th><th scope="col">Lessons</th></tr></thead><tbody>${courseRows}</tbody></table></div>
</section>
<p class="source">Source: <code>PREMIUM_PENDING_WORKLOAD_QUEUE.csv</code> · SHA-256 <code>${escapeHtml(model.queueSha256)}</code> · commit <code>${escapeHtml(model.sourceCommit)}</code> · candidate timestamp ${escapeHtml(model.generatedAt)}. Standards execution preserves ${number(model.standardsExactCodeContracts)} required exact-code contracts inside ${number(model.standardsFamilyPortfolios)} parent-family portfolio${model.standardsFamilyPortfolios === 1 ? "" : "s"}; decisions remain edge-level. Generator execution preserves ${number(model.generatorExactTagContracts)} exact tags in ${number(model.generatorDomainPortfolios)} parent domains and ${number(model.generatorMicroBatchesAt40)} tag-bounded batches. Review-card authority: ${number(model.reviewedLessons)} current decisions, ${number(model.pendingLessons)} pending; ${number(model.currentRevisionRows)} revision/escalation rows.</p>
</main>
</body>
</html>
`;
}
