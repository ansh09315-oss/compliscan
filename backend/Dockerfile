# ==============================================================================
# CompliScan AI — Backend Dockerfile (Standalone Context)
# Target: Hugging Face Spaces / Render / Docker (Python 3.10-slim)
# Deploy: Push backend/ folder as a standalone HF Space (Space SDK: Docker)
# ==============================================================================

FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python \
    FLAGS_use_mkldnn=0 \
    PORT=7860 \
    HOST=0.0.0.0

# System dependencies for OpenCV, PaddleOCR, ReportLab
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libfontconfig1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

RUN mkdir -p /home/user/.paddleocr /home/user/.cache /home/user/app \
    && chown -R user:user /home/user

WORKDIR /home/user/app

# Install Python deps first (Docker cache layer optimization)
COPY --chown=user:user requirements.txt requirements.txt
USER user

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY --chown=user:user . .

# Health check (Hugging Face Spaces monitors this)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

EXPOSE 7860

# Start FastAPI with uvicorn (single worker — HF Spaces free tier)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1", "--timeout-keep-alive", "30"]
