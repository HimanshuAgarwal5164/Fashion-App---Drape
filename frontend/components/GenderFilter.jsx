import { GENDER_OPTIONS, ITEM_TYPES } from "../lib/constants";

export default function GenderFilter({ gender, onGenderChange, onWardrobeReset }) {
  function handleChange(value) {
    onGenderChange(value);
    const filtered = value === "all" ? ITEM_TYPES : ITEM_TYPES.filter((type) => type.genders.includes(value));
    onWardrobeReset([{ item_type: filtered[0]?.value || "shirt", quantity: 1 }]);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Style Preference:</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            style={{ padding: "5px 16px", borderRadius: 20, border: "1.5px solid", borderColor: gender === option.value ? "#6366f1" : "#e2e8f0", background: gender === option.value ? "#eef2ff" : "#fff", color: gender === option.value ? "#4338ca" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: gender === option.value ? 700 : 400 }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>Style guidance only</span>
    </div>
  );
}
