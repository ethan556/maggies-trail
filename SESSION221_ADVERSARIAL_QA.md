# SESSION 221 — ADVERSARIAL QA

## Verdict

**ACCEPT as an execution-blocked/no-product-change session. Wave 02 does not close.**

The session's claim is intentionally narrow: the current environment cannot reconstruct or remotely execute the exact S220 dependency tree, and no product change was justified in the absence of current rendered evidence.

## Falsification questions

### Could this be a Maggie code failure disguised as an environment failure?
No evidence supports that conclusion. Dependency-free native integrity and exact corpus gates pass before any framework package is needed. Package lookup fails directly on core published packages (Zustand, Zod, Next, React), before Maggie compilation.

### Could a remote environment have been used instead?
The connected Vercel account contains zero projects. The connected GitHub installation exposes zero repositories. `@vercel/sandbox` is absent locally and cannot bootstrap without the same package path. No safe remote target exists.

### Could dependency substitution be justified?
No. S220 already proved that removing the first missing dependency simply exposes the next unavailable dependency. In S221 the mirror itself returns 404 for multiple core packages, so a substitution campaign would mutate Maggie without restoring exact-tree certification.

### Could the visual matrix be certified from historical screenshots?
No. The S220 contract requires 90 current-source captures and four manual gates. Historical Session-127 screenshots remain reference material only.

### Did S221 accidentally alter learner/runtime code while probing?
No intentional product writes were performed. Session changes are documentation/ledger only. Final seal verification must confirm `src/**` and `content/courses/**` are byte-identical to S220.

## Process corrections

- Wrong assumption that the visual runner had a `--contract-only` mode: corrected by locating and running the dedicated contract verifier.
- Guessed verifier filenames: corrected by locating and executing the actual S220 verifier scripts.

Both errors were surfaced rather than hidden and produced no code change.

## Learner-value delta

### BEFORE
Wave 02 was blocked by an incompletely characterized runtime environment.

### AFTER
The blocker is now bounded across all available execution routes: local runtime, package registry, Vercel projects, GitHub repositories, and sandbox bootstrap. This prevents risky product refactors masquerading as environment repairs and makes the next executable action unambiguous.

### CAUSAL MECHANISM
No learner interaction changed; this is release-integrity work only.

### MISCONCEPTION
Not applicable.

### TRANSFER
Not applicable.

## Final QA status

- Mathematics: unchanged.
- Curriculum: unchanged.
- Native/source integrity: PASS.
- Exact corpus identity: PASS.
- Visual contract: PASS.
- Exact later-content authorization: PASS.
- Frozen historical ledger: PASS.
- Current runtime/full tests/build/browser/security: BLOCKED, not borrowed.

**No Wave-02 premium claim is authorized.**
