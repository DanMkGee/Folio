#!/usr/bin/env bash
# Local preview server. Run ./serve.sh then open http://localhost:8000
#
# Uses Python (built into macOS) so there's no Node.js dependency.
#
# One difference from production: this server does NOT strip .html the way
# Vercel's cleanUrls does, so locally you'll need /about.html rather than
# /about. Everything else behaves the same.

set -euo pipefail

cd "$(dirname "$0")"

PORT="${1:-8000}"

echo "Serving $(pwd)"
echo "→ http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

exec python3 -m http.server "$PORT"
