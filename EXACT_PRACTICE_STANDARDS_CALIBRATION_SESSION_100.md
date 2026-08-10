# Session 100 — Exact Practice, Standards Evidence, and Diagnostic Field Calibration

## Executive result

Session 100 closes the two principal evidence gaps remaining after the Session 98 mastery architecture:

1. every canonical objective now has a defensible minimum exact-practice bank; and
2. standards and diagnostic claims now have explicit human/field evidence seams instead of being inferred from software structure alone.

The release does **not** claim that provisional standards mappings are verified or that diagnostic parameters are field-calibrated. It provides the auditable records, collection model, estimators, uncertainty, longitudinal linkage, and promotion controls required to reach those states honestly.

## 1. Exact-practice certification

### Baseline

- Canonical objectives: **1,165**
- Objectives already producing at least 20 exact-skill states: **1,078**
- Objectives below the exact-practice threshold: **87**

### Session 100 implementation

`content/mastery/exact-practice-certification.json` adds **2,088 objective-state assignments**, exactly **24 per thin objective**. Every objective has 24 distinct widget states within its own bank. Closely related or duplicate curriculum objectives may intentionally share mathematical tasks, so this release does not mislabel all 2,088 assignments as globally unique problems; there are **1,836 globally distinct state hashes**.

Each certified bank includes:

- 8 support, 8 core, and 8 stretch states;
- 6 symbolic, 6 verbal, 6 table-demand, and 6 diagram-demand states;
- 12 contextual and 12 non-contextual states;
- 8 near-, 8 medium-, and 8 far-transfer states;
- explicit misconception feedback;
- deterministic state hashes;
- at least 24 distinct complete widget states and at least 12 distinct prompt structures per objective.

### Runtime integration

The Mastery Studio now selects certified practice deliberately rather than simply appending it to a generic bank:

- three exact independent states from support/core and near/medium transfer;
- two interleaved generated family states;
- two stretch/far-transfer states;
- representation metadata carried into the CML contract;
- round-dependent deterministic rotation so later missions produce fresh states.

### Final practice-depth result

- Objectives with 20+ exact states: **1,165/1,165 (100%)**
- Objectives with 20+ mixed-family states: **1,165/1,165 (100%)**
- Newly certified objectives: **87**
- Certified state assignments: **2,088**

The authored lesson curriculum remains byte-for-byte unchanged. Certification lives in a reusable runtime bank and evidence layer rather than inflating lesson JSON.

## 2. Human-verifiable standards evidence

### Official-source registry

`content/standards/source-registry.json` records eight official-authority sources:

- Common Core Mathematics;
- California CCSS Mathematics;
- New York Next Generation Mathematics Learning Standards;
- Florida B.E.S.T. Mathematics;
- Texas TEKS Mathematics;
- AP Precalculus;
- AP Calculus AB/BC;
- AP Statistics.

Each record includes authority, official URL, version label, locator rule, claim boundary, verification date, and SHA-256 fingerprint.

### Review dossiers

`content/standards/evidence-dossiers.json` converts all **6,119 candidate objective-framework edges** into checksum-protected review dossiers. Every dossier contains:

- objective, course, and grade;
- candidate framework code and intended depth;
- official source and version;
- exact source locator or an explicit notice that a benchmark must be imported;
- linked lesson and step evidence;
- construction, independent-practice, transfer, and retrieval checks;
- representation and manipulation evidence;
- mapping rationale;
- claim limit;
- reviewer decision slot;
- dossier hash.

### Human review boundary

- Review-ready dossiers: **6,119**
- Human-approved edges: **0**
- Human-rejected edges: **0**
- Edges still requiring exact benchmark/full-intent comparison: **6,119**

This is intentional. The app now distinguishes:

1. an official source being verified;
2. a candidate mapping being reviewable; and
3. a human reviewer approving a bounded alignment claim.

The review command refuses approval unless the reviewer supplies the exact official-text snapshot, approved evidence depth, identity, and rationale. Decisions are stored separately in `human-review-decisions.json`, signed against the dossier hash, and then regenerated into the public evidence graph.

## 3. Diagnostic field-calibration infrastructure

### Runtime instrument state

- Instrument: `maggies-diagnostic-2026.1`
- Bank: 28 items
- Administration: 12 adaptive, domain-balanced items
- Runtime status: **awaiting-field-data**
- Active parameters: **provisional**

No synthetic or software-only result can promote the runtime bank.

### Explicit-consent collection

The placement result now offers an optional contribution flow. A contribution requires a deliberate learner/guardian click and sends only:

- item IDs and order;
- correctness and selected choice;
- confidence;
- bounded response time;
- provisional item parameters;
- domain score summaries and uncertainty;
- versioned consent and instrument metadata.

It excludes names, email addresses, IP addresses, prompt text, and free-text responses.

Authenticated deployments can store packets through `/api/diagnostic-calibration`. Device-local or database-unavailable deployments can export a portable research packet instead. Collection does not alter placement or mastery.

### Durable evidence schema

Migration `004_diagnostic_calibration.sql` adds:

- `diagnostic_field_sessions`;
- `diagnostic_field_responses`;
- `diagnostic_calibration_runs`;
- `diagnostic_item_calibrations`;
- `diagnostic_scale_links`.

Learner authorization uses the existing database relationship and account-deletion cascade. Research exports replace the raw learner key with a required salted study identifier so repeated administrations can be linked without exporting the account identifier.

### Calibration pipeline

`scripts/calibrate-diagnostic.cjs` produces research candidates from consented JSON or NDJSON packets. It calculates:

- item sample size and p-value;
- point-biserial discrimination;
- candidate 2PL difficulty and discrimination;
- Fisher/Wald standard errors and 95% intervals;
- distractor frequencies;
- quality flags;
- optional group-based DIF screening;
- candidate anchor-item vertical scale link;
- longitudinal growth estimates and uncertainty when repeated administrations are available.

The declared promotion gates include:

- at least 500 usable sessions;
- at least 200 responses per item for estimation;
- at least 500 responses per item for promotion;
- acceptable p-values;
- minimum point-biserial discrimination;
- bounded item-parameter standard errors;
- at least eight anchor items;
- rapid-response quality limits;
- DIF review when group labels are available;
- explicit human psychometric approval.

### Promotion boundary

`promote-diagnostic-calibration.cjs` is the only route to the runtime overlay. It requires:

- a candidate run with every automated gate passed;
- all 28 items present and promotion-ready;
- reviewer identity;
- a substantive psychometric rationale;
- a preserved run checksum.

Even after promotion, the claim boundary explicitly excludes national norms, predictive validity, subgroup fairness, or high-stakes suitability unless separately established.

### Growth measurement

The field export requires a 16+ character secret salt and emits a stable pseudonymous study key. The estimator can then re-score repeated administrations, calculate first-to-latest change, report average theta/scaled-point change, standard error, and 95% confidence interval, while retaining a research-only claim boundary until vertical invariance and longitudinal sensitivity are validated.

## 4. Reproducible commands

```bash
npm run practice:certify
node scripts/measure-practice-depth.cjs
npm run standards:evidence
npm run standards:review -- --edge=<id> --decision=approve|reject ...
node scripts/verify-session100-readiness.cjs

# On a deployment with a durable database and an export salt
npm run diagnostic:export -- --db=data/app.db --output=data/field.json --salt=<secret>
npm run diagnostic:calibrate -- --input=data/field.json --output=data/run.json
npm run diagnostic:promote -- --input=data/run.json --reviewer="..." --notes="..."
```

## 5. Honest completion assessment

### Recommendation 3: deep fluency

The structural coverage is now **above 95%**:

- every objective clears the 20-state exact threshold;
- every thin objective has a reviewed certification schema;
- mixed representation, context, difficulty, misconception, interleaving, delayed retrieval, and transfer are explicit runtime dimensions.

Remaining empirical work concerns whether state difficulty and transfer distance behave as intended with real learners—not whether the states exist.

### Recommendation 4: standards and assessment infrastructure

Technical and review readiness is now approximately **75–80%**, but verified claims remain lower:

- the many-to-many evidence system, official-source provenance, review queue, diagnostic collection, calibration, uncertainty, vertical-linking, growth, and promotion controls are implemented;
- all standards edges still await human full-intent review;
- diagnostic parameters still await real field data and psychometric approval.

That remaining boundary cannot be crossed honestly through additional code alone.
