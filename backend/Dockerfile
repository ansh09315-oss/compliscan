# ==============================================================================
# CompliScan (SIH 26034) - Backend Dockerfile (Standalone Context)
# For Hugging Face Spaces when repo root is backend/
# ==============================================================================

FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python \
    FLAGS_use_mkldnn=0 \
    PORT=7860 \
    HOST=0.0.0.0

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

RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

RUN mkdir -p /home/user/.paddleocr /home/user/.cache /home/user/app \
    && chown -R user:user /home/user

WORKDIR /home/user/app

COPY --chown=user:user requirements.txt requirements.txt
USER user

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY --chown=user:user . .

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
