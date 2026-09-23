#!/usr/bin/env bash
# ==============================================================================
# CompliScan (SIH 26034) - GitHub Codespaces Provisioning Script
# Installs system libraries for OpenCV/PaddleOCR, Python backend, and Node frontend
# ==============================================================================

set -e

echo "🚀 [1/4] Updating Linux system packages..."
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    curl \
    git

echo "🐍 [2/4] Installing Python requirements for CompliScan Tri-Core Backend..."
python3 -m pip install --upgrade pip setuptools wheel
python3 -m pip install -r backend/requirements.txt

echo "🌐 [3/4] Installing Node.js frontend dependencies..."
if [ -f "package.json" ]; then
    npm install
fi

echo "⚙️ [4/4] Setting execution permissions for helper scripts..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x start_backend.sh 2>/dev/null || true

echo "✅ CompliScan GitHub Codespace is fully provisioned and ready!"
echo "➡️  Run './start_backend.sh' to launch the FastAPI server on port 8000."
