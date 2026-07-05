"use client";

import { useEffect, useRef, useState } from "react";
import CameraModal from "../components/CameraModal";
import GenderFilter from "../components/GenderFilter";
import OccasionFinder from "../components/OccasionFinder";
import WardrobeBuilder from "../components/WardrobeBuilder";
import { buildWardrobe, detectLook, fetchOccasions, fetchRecommendations } from "../lib/api";

export default function DrapePage() {
  const [occasions, setOccasions] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedDressCode, setSelectedDressCode] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [toneValue, setToneValue] = useState(50);
  const [bodyType, setBodyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [gender, setGender] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("occasion");
  const [wardrobeItems, setWardrobeItems] = useState([{ item_type: "kurta", quantity: 1 }]);
  const [wardrobeResults, setWardrobeResults] = useState({});
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    fetchOccasions()
      .then((data) => setOccasions(data.occasions || []))
      .catch(() => setError("Cannot connect to backend. Make sure it is running on port 8000."));
  }, []);

  function handleOccasionChange(value) {
    setSelectedOccasion(value);
    setSelectedEventType("");
    setSelectedDressCode("");
    setSelectedVenue("");
  }

  function handleEventTypeChange(value) {
    setSelectedEventType(value);
    setSelectedDressCode("");
    setSelectedVenue("");
  }

  function handleDressCodeChange(value) {
    setSelectedDressCode(value);
    setSelectedVenue("");
  }

  async function sendImageForDetection(blob) {
    setDetecting(true);
    setAnalysed(false);
    setCameraOpen(false);
    setError("");

    try {
      const data = await detectLook(blob);
      if (data.tone_value !== undefined) setToneValue(Math.round(data.tone_value));
      if (data.body_type?.body_type) setBodyType(data.body_type.body_type);
      if (data.confidence === "low" && !data.auto_detected) {
        setError(data.error || "Could not analyse clearly. Try better lighting or a clearer photo.");
      } else {
        setAnalysed(true);
      }
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setDetecting(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    await sendImageForDetection(file);
    event.target.value = "";
  }

  async function handleRecommend() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRecommendations({
        occasion_id: selectedOccasion,
        event_type_id: selectedEventType,
        dress_code: selectedDressCode,
        venue_type: selectedVenue,
        tone_value: toneValue,
        price_range: priceRange,
        gender_preference: gender,
        body_type: bodyType,
        limit: 12,
      });
      setResults(data.results || []);
    } catch {
      setError("Failed to fetch recommendations. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleWardrobeBuild() {
    setWardrobeLoading(true);
    setError("");

    try {
      const data = await buildWardrobe({
        items: wardrobeItems,
        tone_value: toneValue,
        price_range: priceRange,
        gender_preference: gender,
      });
      setWardrobeResults(data.results || {});
    } catch {
      setError("Failed to build wardrobe. Is the backend running?");
    } finally {
      setWardrobeLoading(false);
    }
  }

  function addWardrobeItem() {
    setWardrobeItems([...wardrobeItems, { item_type: "shirt", quantity: 1 }]);
  }

  function removeWardrobeItem(index) {
    setWardrobeItems(wardrobeItems.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateWardrobeItem(index, field, value) {
    setWardrobeItems(wardrobeItems.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {cameraOpen && <CameraModal onCapture={sendImageForDetection} onClose={() => setCameraOpen(false)} />}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", color: "#fff", padding: "32px 24px 0", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: 0 }}>DRAPE</h1>
        <p style={{ margin: "6px 0 20px", opacity: 0.75, fontSize: 15 }}>AI-powered outfit recommendations for every occasion</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {[
            { id: "occasion", label: "Occasion Finder" },
            { id: "wardrobe", label: "Wardrobe Builder" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: "10px 24px", borderRadius: "10px 10px 0 0", border: "none", background: activeTab === tab.id ? "#f8fafc" : "rgba(255,255,255,0.15)", color: activeTab === tab.id ? "#1e1b4b" : "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}

        <GenderFilter gender={gender} onGenderChange={setGender} onWardrobeReset={setWardrobeItems} />

        {activeTab === "occasion" && (
          <OccasionFinder
            analysed={analysed}
            detecting={detecting}
            loading={loading}
            occasions={occasions}
            priceRange={priceRange}
            results={results}
            selectedDressCode={selectedDressCode}
            selectedEventType={selectedEventType}
            selectedOccasion={selectedOccasion}
            selectedVenue={selectedVenue}
            onCameraOpen={() => setCameraOpen(true)}
            onDressCodeChange={handleDressCodeChange}
            onEventTypeChange={handleEventTypeChange}
            onOccasionChange={handleOccasionChange}
            onPriceRangeChange={setPriceRange}
            onRecommend={handleRecommend}
            onUploadClick={() => fileRef.current.click()}
            onVenueChange={setSelectedVenue}
          />
        )}

        {activeTab === "wardrobe" && (
          <WardrobeBuilder
            analysed={analysed}
            detecting={detecting}
            gender={gender}
            priceRange={priceRange}
            wardrobeItems={wardrobeItems}
            wardrobeLoading={wardrobeLoading}
            wardrobeResults={wardrobeResults}
            onAddItem={addWardrobeItem}
            onBuild={handleWardrobeBuild}
            onCameraOpen={() => setCameraOpen(true)}
            onPriceRangeChange={setPriceRange}
            onRemoveItem={removeWardrobeItem}
            onUpdateItem={updateWardrobeItem}
            onUploadClick={() => fileRef.current.click()}
          />
        )}
      </div>
    </div>
  );
}
