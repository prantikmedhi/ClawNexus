#!/usr/bin/env bash
# Frontend dev test start script
# Cleans up old Vite processes to avoid port conflicts, starts on port 5180
set -euo pipefail

PORT=5180
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== OpenClaw Office Test Startup Script ==="

# Cleanup old processes using the target port
kill_old() {
  local pids
  pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "[cleanup] Terminating process occupying port $PORT: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

kill_old

echo "[start] Starting Vite dev server (port=$PORT) ..."
cd "$PROJECT_DIR"
exec npx vite --port "$PORT" --strictPort
