#!/bin/bash
# seal — the whole release seal as ONE command, encoding every trap this session paid to learn.
#
#   bash scripts/session/seal.sh <TAG> [--fast] [--skip-reprove]
#
#   default        full recorder (all four groups fresh) + full Playwright — THE RELEASE STANDARD.
#   --fast         per-batch mode for content-only changes: recorder reuses source-unchanged
#                  groups under fingerprint proof (--reuse-unchanged) and Playwright runs the
#                  player+world projects only. A --fast seal is a BATCH seal; the session's final
#                  tarball must come from a default (full) seal.
#
# Traps encoded, each learned the expensive way in S205:
#   * rm -rf .next before EVERY build              (dirty .next -> /_document PageNotFoundError)
#   * kill next-server, then VERIFY the port free   (orphan child -> EADDRINUSE -> green run
#                                                    against a STALE build, worse than red)
#   * ledger verified INSIDE the tarball            (a heredoc eaten by & shipped a batch
#                                                    without its ledger)
#   * reprove from the tarball, not the tree        (proves the artifact, not the workspace)
#   * every stage logged with EXIT; one VERDICT line at the end
set -u
TAG="${1:?usage: seal.sh <TAG> [--fast] [--skip-reprove]}"; shift || true
FAST=0; REPROVE=1
for a in "$@"; do case "$a" in --fast) FAST=1;; --skip-reprove) REPROVE=0;; esac; done
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
L=/tmp/seal; mkdir -p $L
CH=$L/chain.log
say(){ echo "[$TAG $(date -u +%H:%M:%S)] $*" | tee -a $CH; }
STAGE_FAIL=0
run(){ local name="$1"; shift; "$@" > "$L/$TAG-$name.log" 2>&1; local e=$?;
       say "$name EXIT=$e"; [ $e -ne 0 ] && STAGE_FAIL=1; return $e; }

cd "$ROOT"
say "SEAL START fast=$FAST"

# ---- 1. static gates (cheap, fail fast) ----
run tsc            npx tsc --noEmit                            || true
run eslint         npx eslint --ext .ts,.tsx src               || true
run validate       npx tsx scripts/content-check.ts schema     || true
run pedagogy       npx tsx scripts/content-check.ts pedagogy   || true
run registration   node scripts/check-registration.mjs         || true
run gates bash -c 'node scripts/verify-visual-explanations.mjs && node scripts/verify-trail-voice.mjs && node scripts/verify-instructional-colors.mjs && node scripts/verify-math-format.mjs && node scripts/verify-world.mjs' || true
[ $STAGE_FAIL -ne 0 ] && { say "VERDICT: FAIL (static gates) — stopping before tests"; exit 1; }

# ---- 2. tests, dependency-aware in --fast ----
if [ $FAST -eq 1 ]; then
  run recorder node scripts/session/run-test-groups.mjs --tag "$TAG" --reuse-unchanged || true
else
  run recorder node scripts/session/run-test-groups.mjs --tag "$TAG" || true
fi
[ $STAGE_FAIL -ne 0 ] && { say "VERDICT: FAIL (tests) — nothing recorded, stopping"; exit 1; }

# ---- 3. snapshots and derived state ----
run hash-snapshot  node scripts/session/hash-proof.mjs snapshot SESSION210_LESSON_HASHES.json || true
run product-state  timeout 300 node scripts/gen-product-state.mjs || true
run step-mix       node scripts/measure/step-mix.mjs || true

# ---- 4. build: ALWAYS from a clean .next ----
rm -rf .next
run build          npx next build || true
[ $STAGE_FAIL -ne 0 ] && { say "VERDICT: FAIL (pre-serve stages)"; exit 1; }

# ---- 5. serve + Playwright: port verified free, server killed by PID ----
pkill -x next-server 2>/dev/null; sleep 2
if ss -ltn 2>/dev/null | grep -q ':3100 '; then say "port 3100 STILL HELD — refusing to start"; exit 1; fi
npx next start --port 3100 > "$L/$TAG-server.log" 2>&1 & SRV=$!
ok=0; for i in $(seq 1 30); do curl -sf http://localhost:3100 > /dev/null 2>&1 && { ok=1; break; }; sleep 2; done
say "curl=$( [ $ok -eq 1 ] && echo 200 || echo FAIL )"
[ $ok -ne 1 ] && { kill $SRV 2>/dev/null; say "VERDICT: FAIL (server)"; exit 1; }
if [ $FAST -eq 1 ]; then
  # Fast subset = every surface that renders lesson STEPS: the six player viewport projects plus
  # player-state. A step insertion cannot reach the world/theme/a11y suites — world-manifest keys
  # regions/courses/landmarks/instruments and never step ids (verified), and light/dark duplicate
  # chromium's world specs. Anything touching src/ must use a full seal; --fast is content-only.
  run playwright bash -c "PW_BASE_URL=http://localhost:3100 npx playwright test --project=player-phone-360 --project=player-phone-390 --project=player-tablet-768 --project=player-tablet-1024 --project=player-desktop-1440 --project=player-short-landscape --project=player-state-desktop" || true
else
  run playwright bash -c "PW_BASE_URL=http://localhost:3100 npx playwright test" || true
fi
kill $SRV 2>/dev/null; sleep 1; kill -9 $SRV 2>/dev/null
[ $STAGE_FAIL -ne 0 ] && { say "VERDICT: FAIL (playwright)"; exit 1; }

# ---- 6. package, with the ledger checked INSIDE the archive ----
rm -rf .next/cache test-results playwright-report data/app.db-shm data/app.db-wal tsconfig.tsbuildinfo 2>/dev/null
TARBALL="/tmp/maggies-trail-$TAG.tar.gz"
( cd "$ROOT/.." && tar --exclude=node_modules --exclude=.next --exclude='.git' -czf "$TARBALL" "$(basename "$ROOT")" )
SHA=$(sha256sum "$TARBALL" | cut -c1-64)
say "tarball $TARBALL sha256=$SHA"
LEDGER=$(ls SESSION*"${TAG#S}"*_CONTENT_CHANGE_LEDGER.md 2>/dev/null | head -1)
if ls content/patches/*"$(echo "$TAG" | tr 'A-Z' 'a-z')"* > /dev/null 2>&1; then
  if [ -z "$LEDGER" ] || ! tar -tzf "$TARBALL" | grep -q "$(basename "$LEDGER")"; then
    say "VERDICT: FAIL — this tag has a content patch but NO LEDGER INSIDE THE TARBALL"; exit 1;
  fi
  say "ledger-in-archive: $(basename "$LEDGER") ✓"
fi

# ---- 7. fresh-extraction reprove (the artifact, not the workspace) ----
if [ $REPROVE -eq 1 ]; then
  R=/tmp/reprove-$TAG; rm -rf "$R"; mkdir -p "$R"
  tar -xzf "$TARBALL" -C "$R"
  D="$R/$(basename "$ROOT")"
  ( cd "$D" && npm ci > "$L/$TAG-rp-npmci.log" 2>&1 ); say "reprove npm-ci EXIT=$?"
  ( cd "$D" && node -e 'const D=require("better-sqlite3");new D(":memory:").exec("create table t(a)")' ) && say "reprove sqlite OK" || { say "VERDICT: FAIL (reprove sqlite)"; exit 1; }
  for s in "tsc|npx tsc --noEmit" "validate|npx tsx scripts/content-check.ts schema" "hash|node scripts/session/hash-proof.mjs verify SESSION210_LESSON_HASHES.json" "registration|node scripts/check-registration.mjs"; do
    n="${s%%|*}"; c="${s#*|}"
    ( cd "$D" && eval "$c" > "$L/$TAG-rp-$n.log" 2>&1 ); e=$?; say "reprove $n EXIT=$e"; [ $e -ne 0 ] && STAGE_FAIL=1
  done
  ( cd "$D" && NODE_OPTIONS="--max-old-space-size=2048" npx vitest run --pool=forks --maxWorkers=1 $(node scripts/session/test-groups.mjs list content) > "$L/$TAG-rp-content.log" 2>&1 ); e=$?; say "reprove content EXIT=$e"; [ $e -ne 0 ] && STAGE_FAIL=1
  ( cd "$D" && rm -rf .next && npx next build > "$L/$TAG-rp-build.log" 2>&1 ); e=$?; say "reprove build EXIT=$e"; [ $e -ne 0 ] && STAGE_FAIL=1
  rm -rf "$R"
  [ $STAGE_FAIL -ne 0 ] && { say "VERDICT: FAIL (reprove)"; exit 1; }
fi

say "VERDICT: PASS — $TARBALL sha256=$SHA $( [ $FAST -eq 1 ] && echo '(FAST batch seal — final session tarball still requires a full seal)' )"
