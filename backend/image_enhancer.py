"""
Industrial-Grade Packaging Image Enhancement Engine (backend/image_enhancer.py)
Path B Preprocessing for Split-Path Tri-Core Architecture (SIH 26034)

Applies ALL essential packaging enhancement techniques:
1. CLAHE (Contrast Limited Adaptive Histogram Equalization) for specular glare removal on shiny plastics/pouches.
2. Bilateral Filtering to suppress substrate grain while preserving razor-sharp typography edges.
3. Adaptive Gaussian Binarization to isolate printed ink from packaging shadows and curved substrates.
4. Morphological Closing to connect broken dot-matrix continuous inkjet (CIJ) batch stamps (MRP, Dates, Batch IDs).
"""

import cv2
import numpy as np
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger("image_enhancer")


def apply_clahe_glare_removal(image: np.ndarray, clip_limit: float = 2.0) -> np.ndarray:
    """
    Technique 1: CLAHE Glare Removal on Shiny Plastics & Foils.
    Operates strictly on the Luminance (L) channel in CIELAB color space
    to suppress specular highlights without causing chromatic distortion of brand typography.
    """
    if image is None or image.size == 0:
        raise ValueError("Invalid image input for CLAHE glare removal.")

    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)

    merged_lab = cv2.merge((cl, a_channel, b_channel))
    return cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)


def apply_bilateral_filtering(image: np.ndarray, d: int = 5, sigma_color: float = 35.0, sigma_space: float = 35.0) -> np.ndarray:
    """
    Technique 2: Bilateral Filtering.
    Smooths packaging substrate noise and plastic grain while strictly preserving
    high-contrast typographical edges required for small Rule 7 font detection.
    """
    if image is None or image.size == 0:
        raise ValueError("Invalid image input for bilateral filtering.")
    return cv2.bilateralFilter(image, d=d, sigmaColor=sigma_color, sigmaSpace=sigma_space)


def sharpen_edges(image: np.ndarray, amount: float = 1.5) -> np.ndarray:
    """
    Unsharp masking to boost typographical high-frequency edges.
    """
    blurred = cv2.GaussianBlur(image, (0, 0), sigmaX=3.0)
    return cv2.addWeighted(image, amount, blurred, -(amount - 1.0), 0)


def apply_adaptive_binarization(image: np.ndarray, block_size: int = 15, c: int = 7) -> np.ndarray:
    """
    Technique 3: Adaptive Thresholding / Binarization.
    Converts to inverted binary where ink dots become white foreground pixels against
    dark background, resilient to dynamic lighting gradients on curved bottles/cans.
    """
    if image is None or image.size == 0:
        raise ValueError("Invalid image input for adaptive binarization.")

    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Normalize to maximize dynamic range
    normalized = cv2.normalize(gray, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

    # Inverted adaptive Gaussian thresholding
    binary_inv = cv2.adaptiveThreshold(
        normalized,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=block_size,
        C=c
    )
    return binary_inv


def apply_morphological_closing(binary_inv: np.ndarray, kernel_size: Tuple[int, int] = (2, 2)) -> np.ndarray:
    """
    Technique 4: Morphological Closing.
    Bridges inter-dot gaps in disconnected dot-matrix Continuous Inkjet (CIJ) stamps
    (e.g., MRP, Mfg Date, Batch No.) without merging adjacent alphanumeric characters.
    """
    if binary_inv is None or binary_inv.size == 0:
        raise ValueError("Invalid binary input for morphological closing.")

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel_size)
    closed = cv2.morphologyEx(binary_inv, cv2.MORPH_CLOSE, kernel)
    return closed


def process_dot_matrix_inkjet(image: np.ndarray) -> np.ndarray:
    """
    Combined Techniques 1-4 for Dot-Matrix Inkjet Prints:
    Bilateral Filter -> Adaptive Binarization -> 2x2 Morphological Closing -> Invert to black-on-white.
    """
    denoised = apply_bilateral_filtering(image, d=5, sigma_color=25.0, sigma_space=25.0)
    binary_inv = apply_adaptive_binarization(denoised, block_size=15, c=7)
    closed = apply_morphological_closing(binary_inv, kernel_size=(2, 2))

    # Invert back to standard black text on clean white background for OCR engines
    fused_inkjet_binary = cv2.bitwise_not(closed)
    return cv2.cvtColor(fused_inkjet_binary, cv2.COLOR_GRAY2BGR)


def remove_glare_and_equalize(image: np.ndarray, clip_limit: float = 2.0) -> np.ndarray:
    """Backward compatibility alias for apply_clahe_glare_removal."""
    return apply_clahe_glare_removal(image, clip_limit=clip_limit)


def sharpen_small_text(image: np.ndarray, amount: float = 1.5) -> np.ndarray:
    """Backward compatibility alias for sharpen + bilateral filter."""
    sharpened = sharpen_edges(image, amount=amount)
    return apply_bilateral_filtering(sharpened, d=5, sigma_color=35.0, sigma_space=35.0)


def enhance_dual_pass(image_bytes: bytes) -> Tuple[np.ndarray, np.ndarray]:
    """
    Executes Path B full enhancement pipeline on raw packaging image bytes:
    - Pre-downsamples high-resolution camera images to optimal processing resolution (<= 800px)
      to eliminate 90+ seconds of heavy CPU filtering delay while preserving typography.
    - Pass 1 (Enhanced Color):
        1. CLAHE Glare Removal (CIELAB L-channel)
        2. Unsharp Mask Typography Edge Sharpening
        3. Bilateral Filtering (Edge-preserving noise suppression)
    - Pass 2 (Fused Dot-Matrix Inkjet Binary):
        1. CLAHE Glare Removal
        2. Bilateral Filtering
        3. Adaptive Gaussian Binarization (inverted foreground)
        4. 2x2 Morphological Closing (bridging broken dot-matrix characters)
        5. Inverted to standard black-on-white 3-channel frame
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Provided byte payload could not be decoded as an image.")

    orig_h, orig_w = img.shape[:2]

    # Pre-downsample so maximum dimension is at most 800px BEFORE applying OpenCV filters.
    # On an 800px frame, bilateral filtering and CLAHE take ~10ms (saving minutes of CPU time).
    max_dim = 800.0
    if max(orig_h, orig_w) > max_dim:
        scale = max_dim / float(max(orig_h, orig_w))
        img = cv2.resize(img, (int(orig_w * scale), int(orig_h * scale)), interpolation=cv2.INTER_AREA)

    logger.info(f"[Image Enhancer] Processing packaging image: original=({orig_h}, {orig_w}), scaled={img.shape}")

    # Step 1: CLAHE glare removal on shiny plastics
    glare_free = apply_clahe_glare_removal(img, clip_limit=2.0)

    # Step 2: Unsharp masking + Bilateral filtering (preserves edges, removes noise)
    sharpened = sharpen_edges(glare_free, amount=1.5)
    pass1_frame = apply_bilateral_filtering(sharpened, d=5, sigma_color=35.0, sigma_space=35.0)

    # Steps 3 & 4: Adaptive Binarization + 2x2 Morphological Closing for dot-matrix stamps
    pass2_frame = process_dot_matrix_inkjet(glare_free)

    logger.info("[Image Enhancer] Completed 4-technique enhancement pipeline.")
    return pass1_frame, pass2_frame
