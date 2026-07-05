from __future__ import annotations

import cv2
import math
import numpy as np
from PIL import Image
import io
import os
import urllib.request

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

# ── Model paths ───────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
FACE_MODEL_PATH = os.path.join(MODEL_DIR, "face_landmarker.task")
HAND_MODEL_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
FACE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
HAND_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"


def _ensure_model(path: str, url: str):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Downloading model: {url}")
        urllib.request.urlretrieve(url, path)
        print(f"Model saved: {path}")


# ── Monk Scale (Google's published standard RGB values) ───────────────────────
MONK_SCALE = {
    1:  (246, 237, 228),   # Very Fair - pale pink/white (Caucasian fair)
    2:  (243, 231, 219),   # Very Fair - warm ivory
    3:  (247, 234, 208),   # Fair - light beige
    4:  (234, 218, 186),   # Fair - warm beige
    5:  (215, 189, 150),   # Medium - light tan (South Asian fair)
    6:  (160, 126,  86),   # Medium - wheatish/olive (South Asian medium)
    7:  (130,  92,  67),   # Deep - brown (South Asian deep / Latino)
    8:  ( 96,  65,  52),   # Deep - dark brown (African medium)
    9:  ( 58,  38,  26),   # Very Deep - deep brown (African deep)
    10: ( 41,  28,  18),   # Very Deep - darkest (African very deep)
}

MONK_TO_TONE = {1:5, 2:15, 3:25, 4:35, 5:45, 6:55, 7:65, 8:75, 9:88, 10:97}
MONK_TO_LABEL = {
    1: "Very Fair", 2: "Very Fair",
    3: "Fair",      4: "Fair",
    5: "Medium / Wheatish", 6: "Medium / Wheatish",
    7: "Deep / Brown",      8: "Deep / Brown",
    9: "Very Deep",         10: "Very Deep",
}

# FaceLandmarker indices — forehead, cheeks, nose bridge
# These avoid eyes, eyebrows, lips, hairline
FOREHEAD_IDX    = [10, 67, 69, 104, 108, 151, 299, 337, 338]
LEFT_CHEEK_IDX  = [116, 117, 118, 119, 100, 126, 142, 203]
RIGHT_CHEEK_IDX = [345, 346, 347, 348, 329, 355, 371, 423]
NOSE_IDX        = [6, 197, 195, 5]


def _pil_to_bgr(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((640, 640))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def _normalize_white_balance(img: np.ndarray) -> np.ndarray:
    """
    Gentle white balance — only corrects strong colour casts (>15 units off neutral).
    Does NOT apply full gray-world correction which over-darkens fair skin.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2Lab).astype(np.float32)
    avg_a = np.mean(lab[:, :, 1])
    avg_b = np.mean(lab[:, :, 2])
    # Only correct if cast is significant (avoids over-correcting natural warm tones)
    shift_a = avg_a - 128
    shift_b = avg_b - 128
    if abs(shift_a) > 15:
        lab[:, :, 1] = np.clip(lab[:, :, 1] - shift_a * 0.5, 0, 255)
    if abs(shift_b) > 15:
        lab[:, :, 2] = np.clip(lab[:, :, 2] - shift_b * 0.5, 0, 255)
    return cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_Lab2BGR)


def _filter_skin_pixels(pixels: np.ndarray) -> np.ndarray | None:
    """
    LAB-space skin filter covering ALL ethnicities:

    Caucasian fair:   L=170-240, a=5-18,  b=5-20   (pink/cool undertone, low b*)
    South Asian:      L=100-200, a=8-25,  b=10-40  (warm golden undertone)
    East Asian:       L=150-220, a=5-20,  b=8-30   (neutral-warm)
    Latino/Hispanic:  L=100-190, a=8-28,  b=12-45  (warm olive)
    African medium:   L=60-140,  a=8-30,  b=10-40  (warm brown)
    African deep:     L=30-90,   a=5-25,  b=5-30   (deep brown/blue-black)

    Combined range that covers all:
    L: 25-245  (very deep to very fair)
    a: 3-50    (slight warmth to strong warmth — skin always has +a)
    b: 2-60    (low for cool fair skin, high for warm deep skin)
    a+b: 6     (minimum combined warmth — filters out grey/blue/green)
    """
    if pixels is None or len(pixels) == 0:
        return None

    lab = cv2.cvtColor(
        pixels.reshape(-1, 1, 3).astype(np.uint8),
        cv2.COLOR_BGR2Lab
    ).reshape(-1, 3).astype(float)

    L = lab[:, 0]
    a = lab[:, 1] - 128
    b = lab[:, 2] - 128

    mask = (
        (L > 25) & (L < 245) &   # covers very deep (25) to very fair (245)
        (a > 3)  & (a < 50)  &   # skin always has positive a* (warm/red)
        (b > -5) & (b < 65)  &   # fair skin can have near-zero b*, deep skin higher
        (a + b > 6)               # filters grey, blue, green — not skin
    )

    clean = pixels[mask]
    return clean if len(clean) >= 10 else None


def _grade_tone(clean: np.ndarray) -> dict:
    """Match mean skin colour to nearest Monk shade using RGB Euclidean distance."""
    mean_bgr = np.mean(clean, axis=0)
    b_val = float(mean_bgr[0])
    g_val = float(mean_bgr[1])
    r_val = float(mean_bgr[2])

    # Monk comparison is in RGB space
    monk = min(
        MONK_SCALE,
        key=lambda k: (r_val - MONK_SCALE[k][0])**2 +
                      (g_val - MONK_SCALE[k][1])**2 +
                      (b_val - MONK_SCALE[k][2])**2
    )

    # ITA° — Individual Typology Angle (dermatology standard numeric score)
    lab_px = cv2.cvtColor(
        np.array([[[int(b_val), int(g_val), int(r_val)]]], dtype=np.uint8),
        cv2.COLOR_BGR2Lab
    )[0][0]
    L = float(lab_px[0])
    b_lab = float(lab_px[2]) - 128
    ita = math.degrees(math.atan2(L - 50, b_lab)) if abs(b_lab) > 1 else 0

    return {
        "monk_shade": monk,
        "tone_value": MONK_TO_TONE[monk],
        "tone_label": MONK_TO_LABEL[monk],
        "ita": round(ita, 1),
        "rgb": (int(r_val), int(g_val), int(b_val)),
    }


def _patches(img: np.ndarray, landmarks, indices: list, h: int, w: int, pad: int = 8) -> np.ndarray:
    """Extract pixel patches around landmark points."""
    parts = []
    for i in indices:
        lm = landmarks[i]
        x, y = int(lm.x * w), int(lm.y * h)
        p = img[max(0, y-pad):y+pad, max(0, x-pad):x+pad]
        if p.size > 0:
            parts.append(p.reshape(-1, 3))
    return np.vstack(parts) if parts else np.array([])


def _detect_from_face(img_bgr: np.ndarray) -> dict | None:
    """Primary: MediaPipe FaceLandmarker — forehead (3x), cheeks (2x each), nose (1x)."""
    _ensure_model(FACE_MODEL_PATH, FACE_MODEL_URL)
    h, w = img_bgr.shape[:2]
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    opts = mp_vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=FACE_MODEL_PATH),
        num_faces=1,
        min_face_detection_confidence=0.4,
        min_face_presence_confidence=0.4,
    )
    with mp_vision.FaceLandmarker.create_from_options(opts) as det:
        res = det.detect(mp_img)

    if not res.face_landmarks:
        return None

    lms = res.face_landmarks[0]
    parts = []
    for idx_list, weight in [
        (FOREHEAD_IDX,    3),
        (LEFT_CHEEK_IDX,  2),
        (RIGHT_CHEEK_IDX, 2),
        (NOSE_IDX,        1),
    ]:
        p = _patches(img_bgr, lms, idx_list, h, w)
        if len(p):
            parts.extend([p] * weight)

    if not parts:
        return None

    clean = _filter_skin_pixels(np.vstack(parts))
    if clean is None:
        return None

    grade = _grade_tone(clean)
    grade.update({"source": "face", "confidence": "high"})
    return grade


def _detect_from_hands(img_bgr: np.ndarray) -> dict | None:
    """Fallback: MediaPipe HandLandmarker — wrist and knuckle bases."""
    _ensure_model(HAND_MODEL_PATH, HAND_MODEL_URL)
    h, w = img_bgr.shape[:2]
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    opts = mp_vision.HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=HAND_MODEL_PATH),
        num_hands=2,
        min_hand_detection_confidence=0.4,
    )
    with mp_vision.HandLandmarker.create_from_options(opts) as det:
        res = det.detect(mp_img)

    if not res.hand_landmarks:
        return None

    pixels = []
    for hand in res.hand_landmarks:
        for idx in [0, 1, 5, 9, 13, 17]:  # wrist + knuckle bases
            lm = hand[idx]
            x, y = int(lm.x * w), int(lm.y * h)
            p = img_bgr[max(0, y-6):y+6, max(0, x-6):x+6]
            if p.size > 0:
                pixels.append(p.reshape(-1, 3))

    if not pixels:
        return None

    clean = _filter_skin_pixels(np.vstack(pixels))
    if clean is None:
        return None

    grade = _grade_tone(clean)
    grade.update({"source": "hands", "confidence": "medium"})
    return grade


def detect_skin_tone(image_bytes: bytes) -> dict:
    """
    Full pipeline:
    1. Gentle white balance (only corrects strong casts, preserves natural tones)
    2. Face detection → forehead + cheeks + nose sampling
    3. Hand detection fallback
    4. LAB pixel filter (covers all ethnicities: Caucasian to African)
    5. Monk scale grading + ITA° score
    """
    img_bgr = _pil_to_bgr(image_bytes)
    img_bgr = _normalize_white_balance(img_bgr)

    result = _detect_from_face(img_bgr)
    if result:
        result["auto_detected"] = True
        return result

    result = _detect_from_hands(img_bgr)
    if result:
        result["auto_detected"] = True
        return result

    return {
        "tone_value": 50,
        "tone_label": "Medium / Wheatish",
        "monk_shade": 5,
        "confidence": "low",
        "auto_detected": False,
        "error": "No skin region detected. Try a selfie in natural light with your face clearly visible."
    }
