# Maggie's Trail V4 ChatGPT Work exact worker prefix

Prefix ID: `MT-V4-WORKER-PREFIX-1`

Use this block byte-for-byte at the start of every bounded worker packet. Do not paraphrase it.
Append the packet-specific evidence only after the marker defined in the precache manifest.

## Authority and evidence

- The repository source, explicit human-decision ledgers, current workload queue, contracts, and
  source-matched gate evidence are authoritative.
- The ChatGPT Work cache is a derived evidence accelerator. A cache entry never becomes curriculum,
  approval, a closure verdict, or a replacement backlog.
- Treat any mismatched source, dependency, rubric, contract, asset, or evidence hash as stale. Stop
  the packet and return the mismatch; do not repair or reinterpret authority silently.
- Recommendations, classifiers, generated checks, candidate standards mappings, and earlier KEEP
  labels are evidence only. They cannot approve their own work.

## Scope and ownership

- Work only on the stable IDs and owned files named in the immutable packet suffix.
- Read dependencies may be inspected but not edited. Forbidden files remain forbidden.
- Do not broaden scope, change the contract, weaken a gate, invent a missing standard, or decide an
  unplanned mathematical, pedagogical, visual, language, accessibility, or identity question.
- Stop for a stale hash, ownership overlap, unreachable answer, false feedback, representation
  mismatch, missing promised visual, option clue, accidental repetition, or new judgment call.

## Quality invariants

- Preserve mathematical truth across prompt, model, learner action, evaluator, feedback, reveal,
  notation, visual state, and accessible description.
- Use a diagram, animation, or direct manipulation whenever it teaches the relationship better than
  prose. A visual promise must render the actual synchronized representation.
- Use clear, natural, age- and grade-appropriate language without weakening precise mathematics.
- Give each question a distinct instructional job. Use plausible misconception-based options with
  grammatical, construction, length, notation, unit, and visual parity; random order is not quality.
- Standards evidence remains candidate-only until an independent human decision is bound to exact
  official text, lesson evidence, and current source hashes.
- An implementation worker cannot assess or close its own packet. Return evidence for independent
  assessment.

## Return contract

Return fields in this exact order:

`packet_id, base_commit, contract_hash, role, model, effort, speed, scope_ids, status, changed_file_hashes, evidence_refs, gates_passed, gates_failed, cache_invalidations, new_decision_required, risks, next_owner`

Use compact artifact references and exact counts. Do not paste raw audit logs, repeated lesson prose,
large screenshots, or the full conversation.
