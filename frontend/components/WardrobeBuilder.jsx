import AnalyseSection from "./AnalyseSection";
import OutfitCard from "./OutfitCard";
import { Section } from "./ui";
import { ITEM_TYPES, PRICE_OPTIONS } from "../lib/constants";

export default function WardrobeBuilder({
  analysed,
  detecting,
  gender,
  priceRange,
  wardrobeItems,
  wardrobeLoading,
  wardrobeResults,
  onAddItem,
  onBuild,
  onCameraOpen,
  onPriceRangeChange,
  onRemoveItem,
  onUpdateItem,
  onUploadClick,
}) {
  const filteredTypes = gender === "all" ? ITEM_TYPES : ITEM_TYPES.filter((type) => type.genders.includes(gender));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 360px) 1fr", gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Section title="What do you need?">
          {wardrobeItems.map((item, idx) => (
            <div key={`${item.item_type}-${idx}`} style={{ display: "grid", gridTemplateColumns: "1fr 80px 32px", gap: 8, alignItems: "center" }}>
              <select value={item.item_type} onChange={(event) => onUpdateItem(idx, "item_type", event.target.value)}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                {filteredTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => onUpdateItem(idx, "quantity", Math.max(1, item.quantity - 1))}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14 }}>-</button>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                <button onClick={() => onUpdateItem(idx, "quantity", Math.min(5, item.quantity + 1))}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14 }}>+</button>
              </div>
              {wardrobeItems.length > 1 && (
                <button onClick={() => onRemoveItem(idx)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 14 }}>x</button>
              )}
            </div>
          ))}
          <button onClick={onAddItem}
            style={{ padding: "8px 0", borderRadius: 8, border: "1.5px dashed #a5b4fc", background: "#eef2ff", color: "#4338ca", cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            + Add another item
          </button>
        </Section>

        <AnalyseSection analysed={analysed} detecting={detecting} onCameraOpen={onCameraOpen} onUploadClick={onUploadClick} />

        <Section title="Budget">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRICE_OPTIONS.map((option) => (
              <label key={option.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: priceRange === option.value ? "#4338ca" : "#475569", fontWeight: priceRange === option.value ? 600 : 400 }}>
                <input type="radio" name="price2" value={option.value} checked={priceRange === option.value} onChange={() => onPriceRangeChange(option.value)} style={{ accentColor: "#6366f1" }} />
                {option.label}
              </label>
            ))}
          </div>
        </Section>

        <button onClick={onBuild} disabled={wardrobeLoading}
          style={{ padding: "13px 0", borderRadius: 10, border: "none", background: wardrobeLoading ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: wardrobeLoading ? "not-allowed" : "pointer" }}>
          {wardrobeLoading ? "Building wardrobe..." : "Build My Wardrobe"}
        </button>
      </div>

      <div>
        {Object.keys(wardrobeResults).length === 0 && !wardrobeLoading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>DRAPE</div>
            <p style={{ fontSize: 16, margin: 0 }}>Add items and click <strong>Build My Wardrobe</strong></p>
            <p style={{ fontSize: 13, marginTop: 8 }}>We will find the best options based on your look and budget</p>
          </div>
        )}
        {wardrobeLoading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6366f1" }}>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>...</div>
            <p>Building your wardrobe...</p>
          </div>
        )}
        {Object.entries(wardrobeResults).map(([itemType, outfits]) => (
          <div key={itemType} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                {ITEM_TYPES.find((type) => type.value === itemType)?.label || itemType}
              </h2>
              <span style={{ background: "#eef2ff", color: "#4338ca", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {outfits.length} option{outfits.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
