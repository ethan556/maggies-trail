#!/usr/bin/env bash
# Unattended variant-generation loop.
#
#   ./scripts/variant-loop.sh 20          # run 20 batches
#
# One batch = one `claude -p` session = 10–30 refreshed steps. State passes between batches
# through VARIANT_STATE.md and VARIANT_LOG.md in the repo, plus git history — NOT through the
# model's context, which is discarded at the end of each session.
#
# Deliberately NOT using --bare: bare mode skips CLAUDE.md discovery, and CLAUDE.md is the entire
# safety mechanism here. It must load.

set -uo pipefail
BATCHES="${1:-1}"
LOGDIR="${LOGDIR:-.variant-runs}"
# Model choice matters more for COST than for quality here. The gate catches the mathematics; what
# the model supplies is care. Route the bulk grind to a cheaper model and reserve the expensive one
# for batches that need NEW machinery (a new gate branch, an unfamiliar widget engine, the G13
# calculus helpers). Fable in particular draws from the same weekly pool as everything else and
# drains it FASTER — spending it on 200 routine batches is poor allocation.
MODEL="${MODEL:-sonnet}"
# Subscription limits are a rolling 5-hour window plus a weekly cap, with no rollover. An
# unpaced loop will simply wall. Sleep between batches so a long run spreads across windows.
PACE_SECONDS="${PACE_SECONDS:-0}"
# HARD SPEND CEILING, in dollars, across this whole run.
#
# This exists because of a specific failure mode: once the plan-included allowance for a model is
# exhausted, usage does NOT stop if usage credits are enabled — billing switches to credits
# automatically and the run keeps going at API rates. An unattended loop has no reason to notice.
# Fable is the dangerous case at $10/$50 per million tokens.
#
# `claude -p --output-format json` reports cost_usd per session; we accumulate and abort.
MAX_SPEND="${MAX_SPEND:-25}"
SPENT=0
mkdir -p "$LOGDIR"

PROMPT='Read CLAUDE.md and VARIANT_STATE.md, then complete ONE batch of variant generation
following the working rhythm exactly, including step 5 (print the generated output and read it).

Target 10-30 refreshed steps. Choose targets by leverage from the measurement tools, not by
whichever looks easiest.

Before you finish you must:
  - run the complete gate sequence and report each result,
  - append this batch to VARIANT_LOG.md including every rejection and every catch,
  - rewrite VARIANT_STATE.md with current coverage and the next three targets.

If any gate is red at the end, revert your uncommitted changes to the last green state and
explain what failed. Do not weaken a test to make it pass. Do not change authored lesson prose.'

for i in $(seq 1 "$BATCHES"); do
  STAMP="$(date +%Y%m%d-%H%M%S)"
  echo "=== batch $i/$BATCHES ($STAMP) ==="

  # Refuse to start from a dirty tree: each batch must begin from a known-green state.
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "working tree dirty — commit or stash before running. stopping." >&2
    exit 1
  fi

  claude -p "$PROMPT" \
    --model "$MODEL" \
    --allowedTools "Read,Edit,Write,Bash,Glob,Grep" \
    --permission-mode acceptEdits \
    --max-turns 200 \
    --output-format json \
    > "$LOGDIR/batch-$STAMP.json" 2> "$LOGDIR/batch-$STAMP.err"
  RC=$?

  if [[ $RC -ne 0 ]]; then
    echo "batch $i: claude exited $RC — see $LOGDIR/batch-$STAMP.err" >&2
    exit "$RC"
  fi

  # Independent verification. Never trust the session's own claim that the gates passed:
  # re-run them here, outside the agent, and refuse to commit if anything is red.
  echo "--- verifying ---"
  npm run typecheck            > "$LOGDIR/g-typecheck-$STAMP.log" 2>&1 || { echo "TYPECHECK RED"; exit 1; }
  npx vitest run               > "$LOGDIR/g-vitest-$STAMP.log"    2>&1 || { echo "VITEST RED";    exit 1; }
  npm run validate:content     > "$LOGDIR/g-content-$STAMP.log"   2>&1 || { echo "CONTENT RED";   exit 1; }
  npm run lint:pedagogy        > "$LOGDIR/g-pedagogy-$STAMP.log"  2>&1 || { echo "PEDAGOGY RED";  exit 1; }
  node scripts/check-registration.mjs > "$LOGDIR/g-reg-$STAMP.log" 2>&1 || { echo "REGISTRATION RED"; exit 1; }
  timeout 850 npm run build    > "$LOGDIR/g-build-$STAMP.log"     2>&1 || { echo "BUILD RED";     exit 1; }

  # Authored prose must be untouched: the ONLY legal content diff is an added "variant" key.
  BAD=$(git diff --unified=0 -- content/ | grep -E '^[-]' | grep -v '^---' \
        | grep -vE '^\-\s*[]}]' | grep -v '"variant"' || true)
  if [[ -n "$BAD" ]]; then
    echo "AUTHORED CONTENT MODIFIED — refusing to commit:" >&2
    echo "$BAD" | head -20 >&2
    exit 1
  fi

  # Accumulate spend and stop before the ceiling, not after it.
  COST=$(jq -r '.cost_usd // .total_cost_usd // 0' "$LOGDIR/batch-$STAMP.json" 2>/dev/null || echo 0)
  SPENT=$(awk -v a="$SPENT" -v b="$COST" 'BEGIN{printf "%.4f", a+b}')
  echo "batch cost: \$$COST   run total: \$$SPENT / \$$MAX_SPEND"
  if awk -v s="$SPENT" -v m="$MAX_SPEND" 'BEGIN{exit !(s>=m)}'; then
    echo "SPEND CEILING REACHED (\$$SPENT >= \$$MAX_SPEND) — committing this batch and stopping." >&2
    STOP_AFTER_COMMIT=1
  fi

  COVERAGE=$(npx tsx scripts/measure/eff2.mts 2>/dev/null | tail -1)
  git add -A
  git commit -q -m "variants: batch $STAMP

$COVERAGE"
  echo "batch $i committed — $COVERAGE"
  if [[ "${STOP_AFTER_COMMIT:-0}" == "1" ]]; then exit 0; fi

  if [[ "$PACE_SECONDS" -gt 0 && "$i" -lt "$BATCHES" ]]; then
    echo "pacing ${PACE_SECONDS}s before next batch"
    sleep "$PACE_SECONDS"
  fi
done

echo "done: $BATCHES batches"
