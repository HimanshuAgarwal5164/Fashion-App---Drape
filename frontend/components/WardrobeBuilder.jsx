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
    <div className="flow-grid flow-grid-wardrobe">
      <div className="control-column">
        <Section title="What do you need?">
          {wardrobeItems.map((item, idx) => (
            <div key={`${item.item_type}-${idx}`} className="wardrobe-row">
              <select value={item.item_type} onChange={(event) => onUpdateItem(idx, "item_type", event.target.value)}
                className="wardrobe-select">
                {filteredTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <div className="quantity-control">
                <button onClick={() => onUpdateItem(idx, "quantity", Math.max(1, item.quantity - 1))}
                  className="stepper-button">-</button>
                <span className="quantity-value">{item.quantity}</span>
                <button onClick={() => onUpdateItem(idx, "quantity", Math.min(5, item.quantity + 1))}
                  className="stepper-button">+</button>
              </div>
              {wardrobeItems.length > 1 && (
                <button onClick={() => onRemoveItem(idx)}
                  className="remove-button">x</button>
              )}
            </div>
          ))}
          <button onClick={onAddItem} className="add-item-button">
            + Add another item
          </button>
        </Section>

        <AnalyseSection analysed={analysed} detecting={detecting} onCameraOpen={onCameraOpen} onUploadClick={onUploadClick} />

        <Section title="Budget">
          <div className="radio-list">
            {PRICE_OPTIONS.map((option) => (
              <label key={option.value} className={`radio-option${priceRange === option.value ? " active" : ""}`}>
                <input type="radio" name="price2" value={option.value} checked={priceRange === option.value} onChange={() => onPriceRangeChange(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        </Section>

        <button onClick={onBuild} disabled={wardrobeLoading} className="button-primary">
          {wardrobeLoading ? "Building wardrobe..." : "Build My Wardrobe"}
        </button>
      </div>

      <div>
        {Object.keys(wardrobeResults).length === 0 && !wardrobeLoading && (
          <div className="empty-state">
            <div className="empty-state-mark">DRAPE</div>
            <p className="empty-state-title">Add items and click <strong>Build My Wardrobe</strong></p>
            <p className="empty-state-subtitle">We will find the best options based on your look and budget</p>
          </div>
        )}
        {wardrobeLoading && (
          <div className="loading-state">
            <div className="loading-state-mark">...</div>
            <p>Building your wardrobe...</p>
          </div>
        )}
        {Object.entries(wardrobeResults).map(([itemType, outfits]) => (
          <div key={itemType} className="wardrobe-result-section">
            <div className="wardrobe-result-heading">
              <h2>
                {ITEM_TYPES.find((type) => type.value === itemType)?.label || itemType}
              </h2>
              <span className="count-pill">
                {outfits.length} option{outfits.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="wardrobe-grid">
              {outfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
