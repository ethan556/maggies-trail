#!/usr/bin/env bash
# S200 diagnostic: run the advance-latch e2e test N times against a production
# server on an otherwise idle box, to separate a real regression from a
# load-induced race between two keyboard presses and the 350ms latch.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
LOG=/tmp/pw2.log
: > "$LOG"

pkill -f 'next-server' 2>/dev/null || true
sleep 1

if [ -z "${PW_CHROMIUM_EXE:-}" ]; then
  if [ -x /tmp/chromium ]; then
    export PW_CHROMIUM_EXE=/tmp/chromium
  else
    PW_CHROMIUM_EXE="$(node -e 'import("@sparticuz/chromium").then(async ({default:c})=>console.log(await c.executablePath()))')"
    export PW_CHROMIUM_EXE
  fi
fi
echo "chromium: $PW_CHROMIUM_EXE" >> "$LOG"

node node_modules/next/dist/bin/next start -p 3100 > /tmp/srv.log 2>&1 &
SRV=$!
cleanup() { kill "$SRV" 2>/dev/null || true; }
trap cleanup EXIT

CODE=000
for i in $(seq 1 40); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3100/ || echo 000)
  if [ "$CODE" = "200" ]; then echo "server 200 after ${i} probes" >> "$LOG"; break; fi
  sleep 2
done
if [ "$CODE" != "200" ]; then echo "SERVER NEVER CAME UP ($CODE)" >> "$LOG"; echo ALLDONE >> "$LOG"; exit 99; fi

for run in 1 2 3; do
  echo "===== RUN $run =====" >> "$LOG"
  ./node_modules/.bin/playwright test --project=player-state-desktop -g "rapid Enter cannot skip" --reporter=list >> "$LOG" 2>&1
  echo "RUN_${run}_EXIT=$?" >> "$LOG"
done
echo ALLDONE >> "$LOG"
