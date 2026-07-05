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
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 180, overflow: "hidden", position: "relative", background: "#f1f5f9" }}>
        <img
          src={outfit.image_url}
          alt={outfit.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div style={{ display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, background: `linear-gradient(135deg, ${palette[0]}22, ${palette[1] || palette[0]}44)` }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#64748b" }}>DRAPE</span>
          <span style={{ fontSize: 11, color: "#94a3b8", background: "#fff", borderRadius: 6, padding: "2px 8px" }}>{colourFamilies[0]?.replace(/_/g, " ")}</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{outfit.name}</h3>
          <ScoreBadge score={scores.final} />
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{outfit.description}</p>
        <ColourDots palette={palette} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <Tag>{outfit.fabric}</Tag>
          <Tag>{outfit.price_range}</Tag>
          <Tag>{outfit.coverage}</Tag>
          {(outfit.gender_tags || []).map((gender) => <Tag key={gender} accent>{gender}</Tag>)}
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 10, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#475569" }}>
          {expanded ? "Hide details" : "Why this works"}
        </button>
        {expanded && (
          <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
              <strong>For you:</strong> {outfit.why_it_works_personalised}
            </p>
            {outfit.occasion_ids?.length > 0 && (
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b" }}>
                <strong>Perfect for:</strong> {outfit.occasion_ids.join(", ").replace(/_/g, " ")}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#94a3b8" }}>
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
