from __future__ import annotations

import cv2
import numpy as np
from PIL import Image
import io
import os
import urllib.request

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
POSE_MODEL_PATH = os.path.join(MODEL_DIR, "pose_landmarker.task")
POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"


def _ensure_model(path: str, url: str):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Downloading model: {url}")
        urllib.request.urlretrieve(url, path)
        print(f"Model saved: {path}")


def _pil_to_bgr(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((640, 640))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def _get_pose_landmarks(img_bgr: np.ndarray):
    """Run MediaPipe Pose and return landmarks."""
    _ensure_model(POSE_MODEL_PATH, POSE_MODEL_URL)
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    opts = mp_vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=POSE_MODEL_PATH),
        num_poses=1,
        min_pose_detection_confidence=0.4,
        min_pose_presence_confidence=0.4,
    )
    with mp_vision.PoseLandmarker.create_from_options(opts) as det:
        result = det.detect(mp_img)

    if not result.pose_landmarks:
        return None
    return result.pose_landmarks[0]


def _dist(a, b):
    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5


def _classify_body_type(landmarks) -> dict:
    """
    Classify body type using key pose landmarks.

    MediaPipe Pose landmark indices:
    11 = left shoulder, 12 = right shoulder
    23 = left hip,      24 = right hip
    25 = left knee,     26 = right knee
    15 = left wrist,    16 = right wrist

    Body type rules based on shoulder-to-hip ratio and waist estimation:
    - Hourglass:          shoulders ≈ hips, waist significantly narrower
    - Pear:               hips > shoulders
    - Inverted Triangle:  shoulders > hips significantly
    - Rectangle:          shoulders ≈ hips ≈ waist (all similar)
    - Apple:              waist ≈ or > hips, shoulders ≈ hips
    """
    lm = landmarks

    shoulder_width = _dist(lm[11], lm[12])
    hip_width = _dist(lm[23], lm[24])

    # Estimate waist as midpoint between shoulders and hips
    waist_left_x = (lm[11].x + lm[23].x) / 2
    waist_left_y = (lm[11].y + lm[23].y) / 2
    waist_right_x = (lm[12].x + lm[24].x) / 2
    waist_right_y = (lm[12].y + lm[24].y) / 2

    class _P:
        def __init__(self, x, y):
            self.x = x
            self.y = y

    waist_width = _dist(_P(waist_left_x, waist_left_y), _P(waist_right_x, waist_right_y))

    # Ratios
    sh_ratio = shoulder_width / hip_width if hip_width > 0 else 1.0
    waist_to_hip = waist_width / hip_width if hip_width > 0 else 1.0
    waist_to_shoulder = waist_width / shoulder_width if shoulder_width > 0 else 1.0

    # Classification logic
    if sh_ratio >= 1.05 and waist_to_hip < 0.85:
        body_type = "hourglass"
        confidence = "high" if sh_ratio < 1.15 else "medium"
    elif hip_width > shoulder_width * 1.05:
        body_type = "pear"
        confidence = "high"
    elif shoulder_width > hip_width * 1.1:
        body_type = "inverted_triangle"
        confidence = "high"
    elif waist_to_hip > 0.9 and waist_to_shoulder > 0.88:
        body_type = "apple"
        confidence = "medium"
    else:
        body_type = "rectangle"
        confidence = "medium"

    return {
        "body_type": body_type,
        "confidence": confidence,
        "auto_detected": True,
        "ratios": {
            "shoulder_to_hip": round(sh_ratio, 3),
            "waist_to_hip": round(waist_to_hip, 3),
            "waist_to_shoulder": round(waist_to_shoulder, 3),
        }
    }


BODY_TYPE_LABELS = {
    "hourglass": "Hourglass",
    "pear": "Pear",
    "inverted_triangle": "Inverted Triangle",
    "rectangle": "Rectangle",
    "apple": "Apple",
}

BODY_TYPE_DESCRIPTIONS = {
    "hourglass": "Shoulders and hips are balanced with a defined waist",
    "pear": "Hips are wider than shoulders",
    "inverted_triangle": "Shoulders are broader than hips",
    "rectangle": "Shoulders, waist and hips are roughly equal",
    "apple": "Fuller midsection with narrower hips and shoulders",
}


def detect_body_type(image_bytes: bytes) -> dict:
    """
    Detect body type from image using MediaPipe Pose.
    Works best with full body or at least torso-to-hip visible photos.
    """
    img_bgr = _pil_to_bgr(image_bytes)
    landmarks = _get_pose_landmarks(img_bgr)

    if landmarks is None:
        return {
            "body_type": None,
            "confidence": "low",
            "auto_detected": False,
            "error": "Could not detect body pose. Try a full body photo in good lighting."
        }

    result = _classify_body_type(landmarks)
    result["label"] = BODY_TYPE_LABELS.get(result["body_type"], result["body_type"])
    result["description"] = BODY_TYPE_DESCRIPTIONS.get(result["body_type"], "")
    return result
