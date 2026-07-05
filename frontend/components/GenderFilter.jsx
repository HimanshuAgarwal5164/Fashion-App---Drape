import { GENDER_OPTIONS, ITEM_TYPES } from "../lib/constants";

export default function GenderFilter({ gender, onGenderChange, onWardrobeReset }) {
  function handleChange(value) {
    onGenderChange(value);
    const filtered = value === "all" ? ITEM_TYPES : ITEM_TYPES.filter((type) => type.genders.includes(value));
    onWardrobeReset([{ item_type: filtered[0]?.value || "shirt", quantity: 1 }]);
  }

  return (
    <div className="gender-filter">
      <span className="gender-filter-label">Style Preference:</span>
      <div className="gender-options">
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={`gender-option${gender === option.value ? " active" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="gender-filter-note">Style guidance only</span>
    </div>
  );
}
