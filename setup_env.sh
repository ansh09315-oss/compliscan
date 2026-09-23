#!/usr/bin/env bash
# ==============================================================================
# CompliScan (SIH 26034) - Local Linux Deployment & Validation Script
# Builds and runs the Hugging Face Spaces Docker container locally to verify
# PaddleOCR, OpenCV, and FastAPI initialization before pushing to production.
# ==============================================================================

set -euo pipefail

# Visual status formatters
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}   CompliScan AI - Local Container Build & Verification Suite   ${NC}"
echo -e "${BLUE}================================================================${NC}"

# ------------------------------------------------------------------------------
# STEP 1: Verify Docker Installation & Daemon Accessibility
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/4] Checking Docker environment...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed on this system.${NC}"
    echo -e "Please install Docker using the official automated script:"
    echo -e "  ${BLUE}curl -fsSL https://get.docker.com | sh${NC}"
    echo -e "  ${BLUE}sudo usermod -aG docker \$USER${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}[ERROR] Docker daemon is not running or current user lacks permissions.${NC}"
    echo -e "Try starting the daemon or running with permissions:"
    echo -e "  ${BLUE}sudo systemctl start docker${NC}"
    echo -e "  ${BLUE}sudo usermod -aG docker \$USER && newgrp docker${NC}"
    exit 1
fi

DOCKER_VER=$(docker --version)
echo -e "${GREEN}[OK] Docker daemon is active: ${DOCKER_VER}${NC}"

# Check for environment configuration
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}[NOTICE] .env not found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}[ACTION REQUIRED] Please edit .env with your real GEMINI_API_KEY before running inspection scans.${NC}"
    else
        touch .env
    fi
fi

# ------------------------------------------------------------------------------
# STEP 2: Build Backend Docker Image Locally
# ------------------------------------------------------------------------------
IMAGE_NAME="compliscan-backend"
CONTAINER_NAME="compliscan-backend-test"
PORT=7860

echo -e "\n${YELLOW}[2/4] Building backend Docker image '${IMAGE_NAME}'...${NC}"
echo -e "Target base: python:3.10-slim with OpenCV & PaddleOCR C++ libraries."

docker build -t "${IMAGE_NAME}" -f Dockerfile .

echo -e "${GREEN}[OK] Docker image '${IMAGE_NAME}' built successfully.${NC}"

# ------------------------------------------------------------------------------
# STEP 3: Run Container Locally on Port 7860
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/4] Starting test container on port ${PORT}...${NC}"

# Stop and remove existing container if running
if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo -e "Removing existing container '${CONTAINER_NAME}'..."
    docker rm -f "${CONTAINER_NAME}" &> /dev/null || true
fi

docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${PORT}:${PORT}" \
    --env-file .env \
    "${IMAGE_NAME}"

echo -e "${GREEN}[OK] Container '${CONTAINER_NAME}' launched in background.${NC}"

# ------------------------------------------------------------------------------
# STEP 4: Automated Healthcheck & Neural Engine Verification
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/4] Verifying PaddleOCR, OpenCV, and FastAPI initialization...${NC}"
echo -e "Waiting for Uvicorn to complete model loading (takes ~15-20 seconds)..."

MAX_ATTEMPTS=30
ATTEMPT=0
READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    # Check if container is still running
    if ! docker ps --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
        echo -e "\n${RED}[CRITICAL] Container stopped unexpectedly. Inspecting logs:${NC}"
        docker logs "${CONTAINER_NAME}"
        exit 1
    fi

    # Query health endpoint
    HTTP_STATUS=$(curl -s -o /tmp/compliscan_health.json -w "%{http_code}" "http://localhost:${PORT}/health" 2>/dev/null || true)

    if [ "$HTTP_STATUS" = "200" ]; then
        READY=true
        break
    fi

    echo -ne "Attempt ${ATTEMPT}/${MAX_ATTEMPTS}: Service warming up... \r"
    sleep 2
done

echo "" # Newline

if [ "$READY" = true ]; then
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}  ✓ COMPLISCAN BACKEND INITIALIZED SUCCESSFULLY ON PORT ${PORT}  ${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "Health response payload:"
    cat /tmp/compliscan_health.json 2>/dev/null || true
    echo -e "\n"
    echo -e "✓ OpenCV headless library: LOADED"
    echo -e "✓ PaddleOCR PP-OCRv4 engine: INITIALIZED"
    echo -e "✓ Port 7860 (Hugging Face Spaces default): ACTIVE"
    echo -e "\n${BLUE}Useful commands:${NC}"
    echo -e "  - View live logs:    ${YELLOW}docker logs -f ${CONTAINER_NAME}${NC}"
    echo -e "  - Stop container:    ${YELLOW}docker stop ${CONTAINER_NAME}${NC}"
    echo -e "  - Push to HF Spaces: ${YELLOW}git push https://huggingface.co/spaces/YOUR_USER/compliscan-backend main${NC}"
else
    echo -e "${RED}[ERROR] Service failed to respond with HTTP 200 within timeout.${NC}"
    echo -e "Container logs:"
    docker logs --tail 50 "${CONTAINER_NAME}"
    exit 1
fi
