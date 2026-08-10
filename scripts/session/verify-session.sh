#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
run() { echo "== $* =="; "$@"; }
run npm run typecheck
run npm run test:session129
run npm run test:session130
run npm run test:session131
run npm run test:session132
run npm run test:session133
run npm run test:session136
run npm run test:session137
run npm run test:session138
run npm run test:session139
run npm run test:session140
run npm run test:session141
run npm run test:session142
run npm run test:session143
run npm run test:session144
run npm test
run npm run validate:content
run npm run lint:pedagogy
run npm run validate:native:clean
run npm run check:registration
run npm run check:engine-registration
run npm run audit:player-harness
run npm run audit:excellence
run npm run audit:reuse-wave
run npm run audit:estimate-compare
run npm run audit:grid-read
run npm run audit:distribution-compare
run npm run audit:trial-probability
run npm run audit:compound-event
run npm run audit:composite-area
run npm run audit:geometry-roundup
run npm run audit:percent-change
run npm run audit:signed-fraction
run npm run audit:shape-hierarchy
run npm run audit:equation-outcome
run npm run audit:conditional-table-variants
run npm run audit:conditional-table
run npm run audit:graph-story-variants
run npm run audit:graph-story
run npm run audit:graph-story-mutations
run npm run audit:proportional-reasoning-variants
run npm run audit:proportional-reasoning
run npm run audit:proportional-reasoning-mutations
run npm run audit:source-transpile
run npm run audit:content-json
run npm run lint
run npm run verify:generated
run npm run hash:proof
run npm run build
run npm run verify:browser
run npm run verify:tidy
