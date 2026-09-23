---
title: CompliScan Backend
emoji: ⚖️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: AI-driven Legal Metrology Compliance System (SIH 26034)
---

# CompliScan — AI Legal Metrology Backend (SIH 26034)

FastAPI microservice running:
- **Path A**: Multi-Image Gemini VLM Semantic Synthesis
- **Path B**: PaddleOCR PP-OCRv4 + OpenCV 4-Stage Image Enhancement
- **Brain MD**: Deterministic Anti-Hallucination Arbitration Engine

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Service health check |
| `POST` | `/api/v1/inspection/scan` | 4-angle packaging compliance scan |
| `POST` | `/api/v1/inspection/save-dossier` | Save inspection dossier |
| `POST` | `/api/v1/inspection/export-pdf` | Export judicial PDF report |
