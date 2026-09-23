"""
Multi-Pass Packaging OCR Pipeline (backend/ocr_pipeline.py)
Path B OCR Engine for Split-Path Tri-Core Architecture (SIH 26034)

Dual-Frame Optical Character Recognition using PaddleOCR PP-OCRv4 with Oriented Angle Classification (use_angle_cls=True).
Runs across:
  - Pass 1 (Enhanced Color via CLAHE + Bilateral filter)
  - Pass 2 (Fused Dot-Matrix Inkjet Binary via Adaptive Binarization + Morphological Closing)
Deduplicates statutory text lines and extracts raw text strings + bounding box coordinates.
"""

import os
# Prevent PIR / oneDNN attribute mismatch on Windows CPU
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

import cv2
import numpy as np
import logging
import threading
from typing import List, Dict, Any, Tuple, Optional
from difflib import SequenceMatcher

from image_enhancer import enhance_dual_pass

logger = logging.getLogger("ocr_pipeline")

CONFIDENCE_THRESHOLD = 0.40

# Mutex lock to strictly guarantee PaddlePaddle C++ memory safety
_paddle_lock = threading.Lock()


class MultiPassPackagingOCR:
    def __init__(self):
        self.paddle_engine = None
        self._easyocr_reader = None
        self._init_paddle()

    def _init_paddle(self):
        try:
            from paddleocr import PaddleOCR
            # Initialize PaddleOCR engine (use_angle_cls=False, enable_mkldnn=False to prevent ONEDNN layout crash on CPU)
            self.paddle_engine = PaddleOCR(use_angle_cls=False, lang='en', show_log=False, enable_mkldnn=False)
            logger.info("PaddleOCR engine initialized successfully.")
        except Exception as e:
            logger.error(f"PaddleOCR failed to initialize: {e}. Fallback OCR engines will be checked.")
            self.paddle_engine = None

    def _ocr_single_frame(self, frame: np.ndarray, is_batch_panel: bool = False) -> List[Dict[str, Any]]:
        """
        Runs optimized OCR on a single frame with dynamic coordinate rescaling.
        """
        if frame is None or frame.size == 0:
            return []

        orig_h, orig_w = frame.shape[:2]

        # Dynamic Downsampling: scale so max dimension <= 800px
        max_dim = 800.0
        scale = 1.0
        if max(orig_h, orig_w) > max_dim:
            scale = max_dim / float(max(orig_h, orig_w))
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            ocr_frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            ocr_frame = frame

        detected: List[Dict[str, Any]] = []

        if self.paddle_engine is not None:
            try:
                # cls=False runs 2x faster by bypassing redundant angle classifier
                with _paddle_lock:
                    results = self.paddle_engine.ocr(ocr_frame, cls=False)
                if results and results[0]:
                    inv_scale = 1.0 / scale
                    for item in results[0]:
                        bbox = item[0]  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                        # Rescale coordinates back to original packaging coordinate space for Rule 7 calibration
                        orig_bbox = [[float(pt[0] * inv_scale), float(pt[1] * inv_scale)] for pt in bbox]
                        text = str(item[1][0]).strip()
                        confidence = float(item[1][1])
                        if confidence >= CONFIDENCE_THRESHOLD and len(text) > 0:
                            detected.append({
                                "text": text,
                                "confidence": confidence,
                                "bbox": orig_bbox
                            })
                return detected
            except Exception as err:
                logger.warning(f"PaddleOCR execution error: {err}")

        # Fallback 1: EasyOCR if installed (cached singleton to avoid multi-minute reloading)
        if self._easyocr_reader is None:
            try:
                import easyocr
                self._easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            except Exception:
                self._easyocr_reader = False

        if self._easyocr_reader:
            try:
                res = self._easyocr_reader.readtext(ocr_frame)
                inv_scale = 1.0 / scale
                for bbox, text, conf in res:
                    text_clean = str(text).strip()
                    if float(conf) >= CONFIDENCE_THRESHOLD and len(text_clean) > 0:
                        orig_bbox = [[float(pt[0] * inv_scale), float(pt[1] * inv_scale)] for pt in bbox]
                        detected.append({
                            "text": text_clean,
                            "confidence": float(conf),
                            "bbox": orig_bbox
                        })
                if detected:
                    return detected
            except Exception as e:
                logger.warning(f"EasyOCR error: {e}")

        # Fallback 2: PyTesseract if installed
        try:
            import pytesseract
            data = pytesseract.image_to_data(frame, output_type=pytesseract.Output.DICT)
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                w_text = data['text'][i].strip()
                w_conf = float(data['conf'][i]) / 100.0 if float(data['conf'][i]) > 0 else 0.0
                if w_text and w_conf >= CONFIDENCE_THRESHOLD:
                    x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                    bbox = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
                    detected.append({
                        "text": w_text,
                        "confidence": w_conf,
                        "bbox": bbox
                    })
        except Exception:
            pass

        return detected

    def _merge_and_deduplicate(
        self,
        pass1_items: List[Dict[str, Any]],
        pass2_items: List[Dict[str, Any]]
    ) -> Tuple[List[str], List[Dict[str, Any]]]:
        """
        Merges items from Pass 1 and Pass 2, deduplicating using similarity matching
        while retaining higher-confidence and clearer line representations.
        Returns: (merged_text_lines, merged_item_objects)
        """
        all_candidates = pass1_items + pass2_items
        merged_lines: List[str] = []
        merged_items: List[Dict[str, Any]] = []

        for item in all_candidates:
            clean = item["text"].strip()
            if not clean:
                continue

            # Check if this line is already closely matched in merged list
            is_duplicate = False
            for idx, existing in enumerate(merged_lines):
                # Check exact match (case-insensitive)
                if clean.lower() == existing.lower():
                    is_duplicate = True
                    # If current candidate has more information or higher confidence, keep current
                    if len(clean) > len(existing) or item["confidence"] > merged_items[idx]["confidence"]:
                        merged_lines[idx] = clean
                        merged_items[idx] = item
                    break

                # Check string similarity ratio
                sim = SequenceMatcher(None, clean.lower(), existing.lower()).ratio()
                if sim > 0.85:
                    is_duplicate = True
                    num_digits_curr = sum(c.isdigit() for c in clean)
                    num_digits_exist = sum(c.isdigit() for c in existing)
                    if num_digits_curr > num_digits_exist or len(clean) > len(existing):
                        merged_lines[idx] = clean
                        merged_items[idx] = item
                    break

            if not is_duplicate:
                merged_lines.append(clean)
                merged_items.append(item)

        return merged_lines, merged_items

    def scan_dual_pass(self, pass1_frame: np.ndarray, pass2_frame: np.ndarray, is_batch_panel: bool = False) -> Dict[str, Any]:
        """
        Targeted Dual-Pass:
        - Pass 1 runs on the enhanced color frame.
        - Pass 2 (Dot-Matrix Inkjet binary) runs only for MRP_BATCH panel or if Pass 1 found < 3 lines.
        """
        logger.info("[OCR Pipeline] Starting Pass 1: Enhanced Color Frame OCR...")
        pass1_items = self._ocr_single_frame(pass1_frame)
        pass1_lines = [item["text"] for item in pass1_items]
        logger.info(f"[OCR Pipeline] Pass 1 completed: {len(pass1_lines)} lines detected.")

        pass2_lines: List[str] = []
        pass2_items: List[Dict[str, Any]] = []

        # Selective Pass 2: only run dot-matrix binary OCR for MRP_BATCH or if Pass 1 missed text
        if is_batch_panel or len(pass1_lines) < 3:
            logger.info("[OCR Pipeline] Starting Pass 2: Fused Dot-Matrix Inkjet Binary OCR...")
            pass2_items = self._ocr_single_frame(pass2_frame, is_batch_panel=True)
            pass2_lines = [item["text"] for item in pass2_items]
            logger.info(f"[OCR Pipeline] Pass 2 completed: {len(pass2_lines)} lines detected.")

        # Merge and deduplicate
        merged_lines, merged_items = self._merge_and_deduplicate(pass1_items, pass2_items)
        logger.info(f"[OCR Pipeline] Merged & deduplicated to {len(merged_lines)} final text lines.")

        return {
            "pass1_lines": pass1_lines,
            "pass2_lines": pass2_lines,
            "pass1_count": len(pass1_lines),
            "pass2_count": len(pass2_lines),
            "all_lines": merged_lines,
            "rawTextStrings": merged_lines,
            "boundingBoxes": merged_items,
        }

    def scan_package(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Main entry point: executes dual-pass enhancement then dual-pass OCR.
        """
        pass1_frame, pass2_frame = enhance_dual_pass(image_bytes)
        return self.scan_dual_pass(pass1_frame, pass2_frame)


# Global singleton instance for high-throughput reuse
default_ocr_pipeline = MultiPassPackagingOCR()


def extract_text_lines(image_matrix: np.ndarray) -> List[str]:
    """
    Backwards compatibility helper: runs single frame through pipeline.
    """
    items = default_ocr_pipeline._ocr_single_frame(image_matrix)
    return [item["text"] for item in items]
