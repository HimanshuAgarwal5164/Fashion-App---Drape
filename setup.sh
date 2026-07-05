#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

echo "Creating Python virtual environment..."
python3 -m venv .venv

echo "Installing Python backend dependencies..."
"$ROOT_DIR/.venv/bin/python" -m pip install --upgrade pip
"$ROOT_DIR/.venv/bin/python" -m pip install -r backend/requirements.txt

echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --no-audit --no-fund

echo "Setup complete."
