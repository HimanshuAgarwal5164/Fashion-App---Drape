"use client";

import { useState } from "react";
import { ColourDots, ScoreBadge, Tag } from "./ui";

function ScoreDetail({ label, value }) {
  if (typeof value !== "number") return null;
  return <span>{label}: {Math.round(value * 100)}%</span>;
}

export default function OutfitCard({ outfit }) {
  const [expanded, setExpanded] = useState(false);
  const scores = outfit.scores || {};
  const palette = outfit.colour_palette || ["#f1f5f9"];
  const colourFamilies = outfit.colour_families || [];

  return (
    <div className="outfit-card">
      <div className="outfit-media">
        <img
          src={outfit.image_url}
          alt={outfit.name}
          className="outfit-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div className="outfit-fallback" style={{ background: `linear-gradient(135deg, ${palette[0]}22, ${palette[1] || palette[0]}44)` }}>
          <span className="outfit-fallback-brand">DRAPE</span>
          <span className="outfit-fallback-tag">{colourFamilies[0]?.replace(/_/g, " ")}</span>
        </div>
      </div>
      <div className="outfit-body">
        <div className="outfit-head">
          <h3 className="outfit-name">{outfit.name}</h3>
          <ScoreBadge score={scores.final} />
        </div>
        <p className="outfit-description">{outfit.description}</p>
        <ColourDots palette={palette} />
        <div className="tag-list">
          <Tag>{outfit.fabric}</Tag>
          <Tag>{outfit.price_range}</Tag>
          <Tag>{outfit.coverage}</Tag>
          {(outfit.gender_tags || []).map((gender) => <Tag key={gender} accent>{gender}</Tag>)}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="details-button">
          {expanded ? "Hide details" : "Why this works"}
        </button>
        {expanded && (
          <div className="outfit-details">
            <p className="outfit-details-copy">
              <strong>For you:</strong> {outfit.why_it_works_personalised}
            </p>
            {outfit.occasion_ids?.length > 0 && (
              <p className="outfit-details-meta">
                <strong>Perfect for:</strong> {outfit.occasion_ids.join(", ").replace(/_/g, " ")}
              </p>
            )}
            <div className="score-details">
              <ScoreDetail label="Occasion" value={scores.occasion_match} />
              <ScoreDetail label="Colour" value={scores.colour_compatibility} />
              <ScoreDetail label="Formality" value={scores.formality_match} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
