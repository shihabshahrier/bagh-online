#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -d "$ROOT_DIR/.venv" ]]; then
  source "$ROOT_DIR/.venv/bin/activate"
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting Bagh Online backend..."
(
  cd "$ROOT_DIR/Backend/app"
  bagh-api
) &
BACKEND_PID=$!

echo "Starting Bagh Online frontend..."
(
  cd "$ROOT_DIR/Frontend"
  npm run dev
) &
FRONTEND_PID=$!

wait
