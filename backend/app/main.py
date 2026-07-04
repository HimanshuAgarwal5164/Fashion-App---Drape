from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

from app.skin_tone import detect_skin_tone
from app.body_type import detect_body_type
from app.recommender import recommend

app = FastAPI(title="DRAPE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), encoding="utf-8") as f:
        return json.load(f)


# ── Occasions ──────────────────────────────────────────────────────────────────

@app.get("/api/occasions")
def get_occasions():
    return load_json("occasion_tree.json")


# ── Skin Tone Detection ────────────────────────────────────────────────────────

@app.post("/api/detect-skin-tone")
async def detect_tone(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    image_bytes = await file.read()
    skin = detect_skin_tone(image_bytes)
    body = detect_body_type(image_bytes)
    return {**skin, "body_type": body}


# ── Recommendations ────────────────────────────────────────────────────────────

class WardrobeItem(BaseModel):
    item_type: str
    quantity: int = 1

class WardrobeRequest(BaseModel):
    items: list[WardrobeItem]
    tone_value: float = 50.0
    price_range: str = "all"
    gender_preference: str = "all"

@app.post("/api/wardrobe")
def get_wardrobe(req: WardrobeRequest):
    from app.recommender import recommend_by_item_type
    results = {}
    for item in req.items:
        results[item.item_type] = recommend_by_item_type(
            item_type=item.item_type,
            quantity=item.quantity,
            tone_value=req.tone_value,
            price_range=req.price_range,
            gender_preference=req.gender_preference,
        )
    return {"results": results}

class RecommendRequest(BaseModel):
    occasion_id: str = ""
    event_type_id: str = ""
    dress_code: str = ""
    venue_type: str = ""
    tone_value: float = 50.0
    price_range: str = "all"
    gender_preference: str = "all"
    body_type: str = "all"
    limit: int = 12


@app.post("/api/recommend")
def get_recommendations(req: RecommendRequest):
    results = recommend(
        occasion_id=req.occasion_id,
        event_type_id=req.event_type_id,
        dress_code=req.dress_code,
        venue_type=req.venue_type,
        tone_value=req.tone_value,
        price_range=req.price_range,
        gender_preference=req.gender_preference,
        body_type=req.body_type,
        limit=req.limit,
    )
    return {"results": results, "count": len(results)}


# ── Colour Rules ───────────────────────────────────────────────────────────────

@app.get("/api/colour-rules/{tone_value}")
def get_colour_rules(tone_value: float):
    rules = load_json("colour_rules.json")
    for seg in rules["segments"]:
        lo, hi = seg["tone_range"]
        if lo <= tone_value <= hi:
            return seg
    return rules["segments"][-1]


@app.get("/")
def root():
    return {"status": "DRAPE API running"}
