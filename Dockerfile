# ==============================================================================
# CompliScan (SIH 26034) - Backend Production Dockerfile
# Optimized for Hugging Face Spaces (CPU / Debian Linux)
# ==============================================================================

FROM python:3.10-slim

# Prevent interactive prompts during apt-get
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python \
    FLAGS_use_mkldnn=0 \
    PORT=7860 \
    HOST=0.0.0.0

# 1. Install OS-level dependencies for OpenCV, PaddleOCR (OpenMP/GLib), and PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup non-root user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Pre-create writable directories for PaddleOCR models & runtime cache
RUN mkdir -p /home/user/.paddleocr /home/user/.cache /home/user/app \
    && chown -R user:user /home/user

WORKDIR /home/user/app

# 3. Install Python dependencies as non-root user
COPY --chown=user:user backend/requirements.txt requirements.txt
USER user

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copy backend application source
COPY --chown=user:user backend/ .

# Hugging Face Spaces listens on port 7860 by default
EXPOSE 7860

# 5. Launch FastAPI via Uvicorn with single worker to conserve RAM on free CPU tier
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
