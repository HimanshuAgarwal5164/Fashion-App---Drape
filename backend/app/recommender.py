from __future__ import annotations

import json
import os
from functools import lru_cache

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


@lru_cache(maxsize=None)
def _load(filename):
    with open(os.path.join(DATA_DIR, filename), encoding="utf-8") as f:
        return json.load(f)


def _get_tone_segment(tone_value: float, colour_rules: dict) -> dict | None:
    for seg in colour_rules["segments"]:
        lo, hi = seg["tone_range"]
        if lo <= tone_value <= hi:
            return seg
    return colour_rules["segments"][-1]


def _colour_score(outfit: dict, tone_segment: dict) -> float:
    """Score 0-1 based on how well outfit colours match the skin tone segment."""
    if not tone_segment:
        return 0.5

    best_colours = {c["hex"].upper(): c["score"] for c in tone_segment["best_colours"]}
    avoid_colours = {c["hex"].upper(): c["score"] for c in tone_segment["avoid_colours"]}
    best_families = set(tone_segment["best_colour_families"])
    avoid_families = set(tone_segment["avoid_colour_families"])

    outfit_families = set(outfit.get("colour_families", []))
    outfit_palette = [h.upper() for h in outfit.get("colour_palette", [])]

    scores = []

    # Check colour families
    for fam in outfit_families:
        if fam in best_families:
            scores.append(90)
        elif fam in avoid_families:
            scores.append(20)
        else:
            scores.append(60)

    # Check specific hex colours
    for hex_col in outfit_palette:
        if hex_col in best_colours:
            scores.append(best_colours[hex_col])
        elif hex_col in avoid_colours:
            scores.append(avoid_colours[hex_col])

    if not scores:
        return 0.6

    return round(sum(scores) / len(scores) / 100, 3)


def _occasion_score(outfit: dict, occasion_id: str, event_type_id: str,
                    dress_code: str, venue_type: str) -> float:
    score = 0.0
    if occasion_id and occasion_id in outfit.get("occasion_ids", []):
        score += 0.4
    if event_type_id and event_type_id in outfit.get("event_type_ids", []):
        score += 0.3
    if dress_code and dress_code in outfit.get("dress_codes", []):
        score += 0.2
    if venue_type and venue_type in outfit.get("venue_types", []):
        score += 0.1
    return min(score, 1.0)


def _formality_score(outfit: dict, occasion_id: str) -> float:
    """Simple formality match based on occasion type."""
    formal_occasions = {"wedding_ceremonies", "work_professional", "milestones_celebrations"}
    casual_occasions = {"casual_everyday", "sports_active", "travel"}
    level = outfit.get("formality_level", 5)

    if occasion_id in formal_occasions:
        return level / 10
    elif occasion_id in casual_occasions:
        return (10 - level) / 10
    return 0.5


def _build_why(outfit: dict, tone_segment: dict, occasion_id: str) -> str:
    base = outfit.get("why_it_works", "")
    tone_note = ""
    if tone_segment:
        label = tone_segment["label"]
        best_fams = ", ".join(tone_segment["best_colour_families"][:3])
        outfit_fams = outfit.get("colour_families", [])
        matching = [f for f in outfit_fams if f in tone_segment["best_colour_families"]]
        if matching:
            tone_note = f" The {', '.join(matching)} colour palette is especially flattering for {label} skin tones."
        else:
            tone_note = f" Works well across a range of skin tones including {label}."
    return base + tone_note


def recommend_by_item_type(
    item_type: str,
    quantity: int,
    tone_value: float,
    price_range: str,
    gender_preference: str,
) -> list:
    inventory = _load("inventory.json")["outfits"]
    colour_rules = _load("colour_rules.json")
    tone_segment = _get_tone_segment(tone_value, colour_rules)

    results = []
    for outfit in inventory:
        if outfit.get("item_type") != item_type:
            continue
        if price_range and price_range != "all":
            if outfit.get("price_range") != price_range:
                continue
        if gender_preference and gender_preference != "all":
            tags = outfit.get("gender_tags", [])
            if "unisex" not in tags and gender_preference not in tags:
                continue

        colour_sc = _colour_score(outfit, tone_segment)
        final_score = round(colour_sc, 3)

        results.append({
            **outfit,
            "scores": {"final": final_score, "colour_compatibility": round(colour_sc, 3)},
            "why_it_works_personalised": _build_why(outfit, tone_segment, ""),
            "tone_label": tone_segment["label"] if tone_segment else "Medium / Wheatish"
        })

    results.sort(key=lambda x: x["scores"]["final"], reverse=True)
    return results[:quantity]


def recommend(
    occasion_id: str,
    event_type_id: str,
    dress_code: str,
    venue_type: str,
    tone_value: float,
    price_range: str,
    gender_preference: str,
    body_type: str = "all",
    limit: int = 12
) -> list:
    inventory = _load("inventory.json")["outfits"]
    colour_rules = _load("colour_rules.json")
    tone_segment = _get_tone_segment(tone_value, colour_rules)

    results = []

    for outfit in inventory:
        if price_range and price_range != "all":
            if outfit.get("price_range") != price_range:
                continue
        if gender_preference and gender_preference != "all":
            tags = outfit.get("gender_tags", [])
            if "unisex" not in tags and gender_preference not in tags:
                continue
        # Body type soft filter — only exclude if outfit explicitly doesn't support it
        if body_type and body_type != "all":
            suitable = outfit.get("body_types_suitable", ["all"])
            if "all" not in suitable and body_type not in suitable:
                continue

        occ_score = _occasion_score(outfit, occasion_id, event_type_id, dress_code, venue_type)
        colour_sc = _colour_score(outfit, tone_segment)
        formality_sc = _formality_score(outfit, occasion_id)

        final_score = round(
            (occ_score * 0.5) + (colour_sc * 0.4) + (formality_sc * 0.1), 3
        )

        results.append({
            **outfit,
            "scores": {
                "final": final_score,
                "occasion_match": round(occ_score, 3),
                "colour_compatibility": round(colour_sc, 3),
                "formality_match": round(formality_sc, 3)
            },
            "why_it_works_personalised": _build_why(outfit, tone_segment, occasion_id),
            "tone_label": tone_segment["label"] if tone_segment else "Medium / Wheatish"
        })

    results.sort(key=lambda x: x["scores"]["final"], reverse=True)
    return results[:limit]
