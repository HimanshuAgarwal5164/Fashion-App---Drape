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
    <div className="flow-grid flow-grid-occasion">
      <div className="control-column">
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
          <div className="radio-list">
            {PRICE_OPTIONS.map((option) => (
              <label key={option.value} className={`radio-option${priceRange === option.value ? " active" : ""}`}>
                <input type="radio" name="price" value={option.value} checked={priceRange === option.value} onChange={() => onPriceRangeChange(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        </Section>

        <button onClick={onRecommend} disabled={loading || !selectedOccasion} className="button-primary">
          {loading ? "Finding outfits..." : "Get Recommendations"}
        </button>
      </div>

      <div>
        {results.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-mark">DRAPE</div>
            <p className="empty-state-title">Select an occasion and click <strong>Get Recommendations</strong></p>
            <p className="empty-state-subtitle">Upload a photo for personalised recommendations</p>
          </div>
        )}
        {loading && (
          <div className="loading-state">
            <div className="loading-state-mark">...</div>
            <p>Finding your perfect outfits...</p>
          </div>
        )}
        {results.length > 0 && (
          <>
            <div className="result-heading">
              <h2>
                {results.length} outfits for you
              </h2>
            </div>
            <div className="result-grid">
              {results.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
