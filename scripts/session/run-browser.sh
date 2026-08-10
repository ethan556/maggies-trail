#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
pkill -f 'next-server' 2>/dev/null || true
sleep 1
if [ -z "${PW_CHROMIUM_EXE:-}" ]; then
  if [ -x /tmp/chromium ]; then
    export PW_CHROMIUM_EXE=/tmp/chromium
  else
    PW_CHROMIUM_EXE="$(node -e 'import("@sparticuz/chromium").then(async ({default:c})=>console.log(await c.executablePath())).catch(e=>{console.error(e);process.exit(1)})')"
    export PW_CHROMIUM_EXE
  fi
fi
echo "== starting production server =="
node node_modules/next/dist/bin/next start -p 3100 > /tmp/maggies-pw-server.log 2>&1 &
SERVER_PID=$!
cleanup() { kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT
CODE=000
for i in $(seq 1 40); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3100/ || echo 000)
  if [ "$CODE" = "200" ]; then echo "server live after ${i} probes"; break; fi
  sleep 2
done
if [ "$CODE" != "200" ]; then
  echo "SERVER NEVER CAME UP (HTTP $CODE)"; tail -40 /tmp/maggies-pw-server.log; echo "PWEXIT:99"; exit 99
fi
./node_modules/.bin/playwright test --reporter=list
RC=$?
echo "PWEXIT:$RC"
if [ "$RC" -ne 0 ]; then exit "$RC"; fi
node scripts/measure/shots-s127.cjs
SHOT_RC=$?
echo "SHOTEXIT:$SHOT_RC"
exit "$SHOT_RC"
