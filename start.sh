#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -x "$ROOT_DIR/.venv/bin/python" ]; then
  echo "Python virtual environment not found. Run: bash setup.sh"
  exit 1
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "Starting FastAPI backend on http://localhost:8000 ..."
(
  cd "$ROOT_DIR/backend"
  "$ROOT_DIR/.venv/bin/python" -m uvicorn app.main:app --reload --port 8000
) &
BACKEND_PID=$!

echo "Starting Next.js frontend on http://localhost:3000 ..."
(
  cd "$ROOT_DIR/frontend"
  npm run dev
) &
FRONTEND_PID=$!

echo "DRAPE is running. Press Ctrl+C to stop both servers."
wait
