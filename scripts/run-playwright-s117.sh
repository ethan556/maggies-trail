#!/usr/bin/env bash
# Compatibility wrapper. The canonical root-relative runner is session/run-browser.sh.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/session/run-browser.sh" "$@"
