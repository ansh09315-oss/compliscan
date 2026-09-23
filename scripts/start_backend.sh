#!/usr/bin/env bash
# ==============================================================================
# CompliScan — Start FastAPI Backend Server
# Configured for GitHub Codespaces & Cloud Linux VM environments
# ==============================================================================

set -e

export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
export FLAGS_use_mkldnn=0
export PYTHONPATH=.
export PYTHONUNBUFFERED=1

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo "=========================================================="
echo "⚖️  CompliScan AI Legal Metrology Engine (SIH 26034)"
echo "📡 Binding to http://${HOST}:${PORT}"
echo "=========================================================="

python3 -m uvicorn backend.main:app --host "${HOST}" --port "${PORT}" --reload
