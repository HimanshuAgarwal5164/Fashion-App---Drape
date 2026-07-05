import AnalyseSection from "./AnalyseSection";
import OutfitCard from "./OutfitCard";
import { Section, Select } from "./ui";
import { PRICE_OPTIONS } from "../lib/constants";

export default function OccasionFinder({
  analysed,
  detecting,
  loading,
  occasions,
  priceRange,
  results,
  selectedDressCode,
  selectedEventType,
  selectedOccasion,
  selectedVenue,
  onCameraOpen,
  onDressCodeChange,
  onEventTypeChange,
  onOccasionChange,
  onPriceRangeChange,
  onRecommend,
  onUploadClick,
  onVenueChange,
}) {
  const currentOccasion = occasions.find((occasion) => occasion.id === selectedOccasion);
  const currentEventType = currentOccasion?.event_types?.find((eventType) => eventType.id === selectedEventType);
  const currentDressCode = currentEventType?.dress_codes?.find((dressCode) => dressCode.id === selectedDressCode);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Section title="Occasion">
          <Select label="Occasion" value={selectedOccasion} onChange={onOccasionChange}
            options={occasions.map((occasion) => ({ value: occasion.id, label: occasion.label }))} placeholder="Select occasion" />
          {currentOccasion && (
            <Select label="Event Type" value={selectedEventType} onChange={onEventTypeChange}
              options={currentOccasion.event_types.map((eventType) => ({ value: eventType.id, label: eventType.label }))} placeholder="Select event type" />
          )}
          {currentEventType && (
            <Select label="Dress Code" value={selectedDressCode} onChange={onDressCodeChange}
              options={currentEventType.dress_codes.map((dressCode) => ({ value: dressCode.id, label: dressCode.label }))} placeholder="Select dress code" />
          )}
          {currentDressCode && (
            <Select label="Venue Type" value={selectedVenue} onChange={onVenueChange}
              options={currentDressCode.venue_types.map((venue) => ({ value: venue, label: venue.replace(/_/g, " ") }))} placeholder="Select venue" />
          )}
        </Section>

        <AnalyseSection analysed={analysed} detecting={detecting} onCameraOpen={onCameraOpen} onUploadClick={onUploadClick} />

        <Section title="Budget">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRICE_OPTIONS.map((option) => (
              <label key={option.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: priceRange === option.value ? "#4338ca" : "#475569", fontWeight: priceRange === option.value ? 600 : 400 }}>
                <input type="radio" name="price" value={option.value} checked={priceRange === option.value} onChange={() => onPriceRangeChange(option.value)} style={{ accentColor: "#6366f1" }} />
                {option.label}
              </label>
            ))}
          </div>
        </Section>

        <button onClick={onRecommend} disabled={loading || !selectedOccasion}
          style={{ padding: "13px 0", borderRadius: 10, border: "none", background: loading || !selectedOccasion ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading || !selectedOccasion ? "not-allowed" : "pointer" }}>
          {loading ? "Finding outfits..." : "Get Recommendations"}
        </button>
      </div>

      <div>
        {results.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>DRAPE</div>
            <p style={{ fontSize: 16, margin: 0 }}>Select an occasion and click <strong>Get Recommendations</strong></p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Upload a photo for personalised recommendations</p>
          </div>
        )}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6366f1" }}>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>...</div>
            <p>Finding your perfect outfits...</p>
          </div>
        )}
        {results.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
                {results.length} outfits for you
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {results.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
