"use client";
import { useState, useEffect, useRef } from "react";

const ITEM_TYPES = [
  { value: "kurta", label: "Kurta", genders: ["men", "unisex", "non-binary"] },
  { value: "kurti", label: "Kurti", genders: ["women", "non-binary"] },
  { value: "shirt", label: "Shirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "tshirt", label: "T-Shirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "trousers", label: "Trousers / Pants", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "saree", label: "Saree", genders: ["women"] },
  { value: "lehenga", label: "Lehenga", genders: ["women", "non-binary"] },
  { value: "anarkali", label: "Anarkali", genders: ["women", "non-binary"] },
  { value: "sharara", label: "Sharara", genders: ["women", "non-binary"] },
  { value: "salwar_suit", label: "Salwar Suit", genders: ["women", "non-binary"] },
  { value: "dress", label: "Dress", genders: ["women", "non-binary"] },
  { value: "gown", label: "Gown", genders: ["women"] },
  { value: "skirt", label: "Skirt", genders: ["women", "non-binary"] },
  { value: "blazer", label: "Blazer", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "suit", label: "Suit", genders: ["men", "women", "non-binary"] },
  { value: "sherwani", label: "Sherwani", genders: ["men"] },
  { value: "jacket", label: "Jacket / Coat", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "hoodie", label: "Hoodie / Sweatshirt", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "co_ord", label: "Co-ord Set", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "jumpsuit", label: "Jumpsuit", genders: ["women", "non-binary"] },
  { value: "activewear", label: "Activewear", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "loungewear", label: "Loungewear", genders: ["men", "women", "non-binary", "unisex"] },
  { value: "top", label: "Top", genders: ["women", "non-binary"] },
  { value: "kaftan", label: "Kaftan", genders: ["women", "non-binary"] },
  { value: "dungaree", label: "Dungaree", genders: ["women", "non-binary", "unisex"] },
];

const API = "http://localhost:8000";

const PRICE_OPTIONS = [
  { value: "all", label: "All Budgets" },
  { value: "budget", label: "Budget (Rs 500-2000)" },
  { value: "mid", label: "Mid (Rs 2000-8000)" },
  { value: "premium", label: "Premium (Rs 8000+)" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "non-binary", label: "Non-Binary" },
  { value: "unisex", label: "Unisex" },
];

function ScoreBadge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#94a3b8";
  return (
    <span style={{ background: color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>
      {pct}% match
    </span>
  );
}

function ColourDots({ palette }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
      {palette.map((hex, i) => (
        <span key={i} title={hex} style={{ width: 18, height: 18, borderRadius: "50%", background: hex, border: "1px solid #e2e8f0", display: "inline-block" }} />
      ))}
    </div>
  );
}

function Tag({ children, accent }) {
  return (
    <span style={{ background: accent ? "#ede9fe" : "#f1f5f9", color: accent ? "#7c3aed" : "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 500, textTransform: "capitalize" }}>
      {children}
    </span>
  );
}

function OutfitCard({ outfit }) {
  const [expanded, setExpanded] = useState(false);
  const s = outfit.scores;
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 180, overflow: "hidden", position: "relative", background: "#f1f5f9" }}>
        <img src={outfit.image_url} alt={outfit.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
        <div style={{ display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, background: `linear-gradient(135deg, ${outfit.colour_palette[0]}22, ${outfit.colour_palette[1] || outfit.colour_palette[0]}44)` }}>
          <span style={{ fontSize: 48 }}>👗</span>
          <span style={{ fontSize: 11, color: "#94a3b8", background: "#fff", borderRadius: 6, padding: "2px 8px" }}>{outfit.colour_families[0]?.replace(/_/g, " ")}</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{outfit.name}</h3>
          <ScoreBadge score={s.final} />
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{outfit.description}</p>
        <ColourDots palette={outfit.colour_palette} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <Tag>{outfit.fabric}</Tag>
          <Tag>{outfit.price_range}</Tag>
          <Tag>{outfit.coverage}</Tag>
          {outfit.gender_tags.map((g) => <Tag key={g} accent>{g}</Tag>)}
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 10, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#475569" }}>
          {expanded ? "Hide details" : "Why this works"}
        </button>
        {expanded && (
          <div style={{ marginTop: 10, background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
              <strong>For you:</strong> {outfit.why_it_works_personalised}
            </p>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b" }}>
              <strong>Perfect for:</strong> {outfit.occasion_ids.join(", ").replace(/_/g, " ")}
            </p>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#94a3b8" }}>
              <span>Occasion: {Math.round(s.occasion_match * 100)}%</span>
              <span>Colour: {Math.round(s.colour_compatibility * 100)}%</span>
              <span>Formality: {Math.round(s.formality_match * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        const video = videoRef.current;
        video.srcObject = s;
        video.onloadedmetadata = () => {
          if (!cancelled) video.play().then(() => setReady(true)).catch(() => {});
        };
      })
      .catch(() => setError("Camera access denied. Please allow camera permission and try again."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onCapture(blob);
    }, "image/jpeg", 0.92);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Analyse Your Look</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>x</button>
        </div>
        {error ? (
          <p style={{ color: "#dc2626", fontSize: 13, textAlign: "center", padding: "20px 0" }}>{error}</p>
        ) : (
          <>
            <video ref={videoRef} style={{ width: "100%", borderRadius: 12, background: "#000", display: "block" }} muted playsInline />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "10px 0" }}>
              Position yourself clearly in frame
            </p>
            <button onClick={capture} disabled={!ready}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: ready ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#c7d2fe", color: "#fff", fontSize: 14, fontWeight: 700, cursor: ready ? "pointer" : "not-allowed" }}>
              Capture & Analyse
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, color: value ? "#1e293b" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

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
    fetch(`${API}/api/occasions`)
      .then((r) => r.json())
      .then((d) => setOccasions(d.occasions || []))
      .catch(() => setError("Cannot connect to backend. Make sure it's running on port 8000."));
  }, []);

  const currentOccasion = occasions.find((o) => o.id === selectedOccasion);
  const currentEventType = currentOccasion?.event_types?.find((e) => e.id === selectedEventType);
  const currentDressCode = currentEventType?.dress_codes?.find((d) => d.id === selectedDressCode);

  function handleOccasionChange(val) { setSelectedOccasion(val); setSelectedEventType(""); setSelectedDressCode(""); setSelectedVenue(""); }
  function handleEventTypeChange(val) { setSelectedEventType(val); setSelectedDressCode(""); setSelectedVenue(""); }
  function handleDressCodeChange(val) { setSelectedDressCode(val); setSelectedVenue(""); }

  async function sendImageForDetection(blob) {
    setDetecting(true);
    setAnalysed(false);
    setCameraOpen(false);
    const form = new FormData();
    form.append("file", blob, "capture.jpg");
    try {
      const res = await fetch(`${API}/api/detect-skin-tone`, { method: "POST", body: form });
      const data = await res.json();
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendImageForDetection(file);
  }

  async function handleRecommend() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion_id: selectedOccasion,
          event_type_id: selectedEventType,
          dress_code: selectedDressCode,
          venue_type: selectedVenue,
          tone_value: toneValue,
          price_range: priceRange,
          gender_preference: gender,
          body_type: bodyType,
          limit: 12,
        }),
      });
      const data = await res.json();
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
      const res = await fetch(`${API}/api/wardrobe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: wardrobeItems,
          tone_value: toneValue,
          price_range: priceRange,
          gender_preference: gender,
        }),
      });
      const data = await res.json();
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

  function removeWardrobeItem(idx) {
    setWardrobeItems(wardrobeItems.filter((_, i) => i !== idx));
  }

  function updateWardrobeItem(idx, field, value) {
    setWardrobeItems(wardrobeItems.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  // Shared analyse section used in both tabs
  function AnalyseSection() {
    return (
      <Section title="Analyse Your Look">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={() => setCameraOpen(true)} disabled={detecting}
            style={{ padding: "9px 0", borderRadius: 8, border: "1.5px solid #a5b4fc", background: detecting ? "#e0e7ff" : "#eef2ff", color: "#4338ca", cursor: detecting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
            {detecting ? "Analysing..." : "Use Camera"}
          </button>
          <button onClick={() => fileRef.current.click()} disabled={detecting}
            style={{ padding: "9px 0", borderRadius: 8, border: "1.5px dashed #cbd5e1", background: detecting ? "#f1f5f9" : "#f8fafc", color: "#475569", cursor: detecting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
            {detecting ? "Analysing..." : "Upload Photo"}
          </button>
        </div>
        {analysed && (
          <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            Analysis complete — recommendations personalised for you
          </p>
        )}
        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
          Upload a photo for personalised recommendations based on your unique look
        </p>
      </Section>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {cameraOpen && <CameraModal onCapture={sendImageForDetection} onClose={() => setCameraOpen(false)} />}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", color: "#fff", padding: "32px 24px 0", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>DRAPE</h1>
        <p style={{ margin: "6px 0 20px", opacity: 0.75, fontSize: 15 }}>AI-powered outfit recommendations for every occasion</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {[{ id: "occasion", label: "Occasion Finder" }, { id: "wardrobe", label: "Wardrobe Builder" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "10px 24px", borderRadius: "10px 10px 0 0", border: "none", background: activeTab === tab.id ? "#f8fafc" : "rgba(255,255,255,0.15)", color: activeTab === tab.id ? "#1e1b4b" : "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
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

        {/* Global Gender Filter */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Style Preference:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GENDER_OPTIONS.map(g => (
              <button key={g.value} onClick={() => {
                setGender(g.value);
                const filtered = g.value === "all" ? ITEM_TYPES : ITEM_TYPES.filter(t => t.genders.includes(g.value));
                setWardrobeItems([{ item_type: filtered[0]?.value || "shirt", quantity: 1 }]);
              }}
                style={{ padding: "5px 16px", borderRadius: 20, border: "1.5px solid", borderColor: gender === g.value ? "#6366f1" : "#e2e8f0", background: gender === g.value ? "#eef2ff" : "#fff", color: gender === g.value ? "#4338ca" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: gender === g.value ? 700 : 400 }}>
                {g.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>Style guidance only</span>
        </div>

        {/* Occasion Finder Tab */}
        {activeTab === "occasion" && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Section title="Occasion">
                <Select label="Occasion" value={selectedOccasion} onChange={handleOccasionChange}
                  options={occasions.map((o) => ({ value: o.id, label: o.label }))} placeholder="Select occasion" />
                {currentOccasion && (
                  <Select label="Event Type" value={selectedEventType} onChange={handleEventTypeChange}
                    options={currentOccasion.event_types.map((e) => ({ value: e.id, label: e.label }))} placeholder="Select event type" />
                )}
                {currentEventType && (
                  <Select label="Dress Code" value={selectedDressCode} onChange={handleDressCodeChange}
                    options={currentEventType.dress_codes.map((d) => ({ value: d.id, label: d.label }))} placeholder="Select dress code" />
                )}
                {currentDressCode && (
                  <Select label="Venue Type" value={selectedVenue} onChange={setSelectedVenue}
                    options={currentDressCode.venue_types.map((v) => ({ value: v, label: v.replace(/_/g, " ") }))} placeholder="Select venue" />
                )}
              </Section>

              <AnalyseSection />

              <Section title="Budget">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PRICE_OPTIONS.map((p) => (
                    <label key={p.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: priceRange === p.value ? "#4338ca" : "#475569", fontWeight: priceRange === p.value ? 600 : 400 }}>
                      <input type="radio" name="price" value={p.value} checked={priceRange === p.value} onChange={() => setPriceRange(p.value)} style={{ accentColor: "#6366f1" }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </Section>

              <button onClick={handleRecommend} disabled={loading || !selectedOccasion}
                style={{ padding: "13px 0", borderRadius: 10, border: "none", background: loading || !selectedOccasion ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading || !selectedOccasion ? "not-allowed" : "pointer" }}>
                {loading ? "Finding outfits..." : "Get Recommendations"}
              </button>
            </div>

            <div>
              {results.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>👗</div>
                  <p style={{ fontSize: 16, margin: 0 }}>Select an occasion and click <strong>Get Recommendations</strong></p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>Upload a photo for personalised recommendations</p>
                </div>
              )}
              {loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#6366f1" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
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
        )}

        {/* Wardrobe Builder Tab */}
        {activeTab === "wardrobe" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Section title="What do you need?">
                {wardrobeItems.map((item, idx) => {
                  const filteredTypes = gender === "all" ? ITEM_TYPES : ITEM_TYPES.filter(t => t.genders.includes(gender));
                  return (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 32px", gap: 8, alignItems: "center" }}>
                      <select value={item.item_type} onChange={e => updateWardrobeItem(idx, "item_type", e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                        {filteredTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button onClick={() => updateWardrobeItem(idx, "quantity", Math.max(1, item.quantity - 1))}
                          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14 }}>-</button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateWardrobeItem(idx, "quantity", Math.min(5, item.quantity + 1))}
                          style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14 }}>+</button>
                      </div>
                      {wardrobeItems.length > 1 && (
                        <button onClick={() => removeWardrobeItem(idx)}
                          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 14 }}>x</button>
                      )}
                    </div>
                  );
                })}
                <button onClick={addWardrobeItem}
                  style={{ padding: "8px 0", borderRadius: 8, border: "1.5px dashed #a5b4fc", background: "#eef2ff", color: "#4338ca", cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  + Add another item
                </button>
              </Section>

              <AnalyseSection />

              <Section title="Budget">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PRICE_OPTIONS.map(p => (
                    <label key={p.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: priceRange === p.value ? "#4338ca" : "#475569", fontWeight: priceRange === p.value ? 600 : 400 }}>
                      <input type="radio" name="price2" value={p.value} checked={priceRange === p.value} onChange={() => setPriceRange(p.value)} style={{ accentColor: "#6366f1" }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </Section>

              <button onClick={handleWardrobeBuild} disabled={wardrobeLoading}
                style={{ padding: "13px 0", borderRadius: 10, border: "none", background: wardrobeLoading ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: wardrobeLoading ? "not-allowed" : "pointer" }}>
                {wardrobeLoading ? "Building wardrobe..." : "Build My Wardrobe"}
              </button>
            </div>

            <div>
              {Object.keys(wardrobeResults).length === 0 && !wardrobeLoading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>👔</div>
                  <p style={{ fontSize: 16, margin: 0 }}>Add items and click <strong>Build My Wardrobe</strong></p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>We'll find the best options based on your look and budget</p>
                </div>
              )}
              {wardrobeLoading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#6366f1" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                  <p>Building your wardrobe...</p>
                </div>
              )}
              {Object.entries(wardrobeResults).map(([itemType, outfits]) => (
                <div key={itemType} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", textTransform: "capitalize" }}>
                      {ITEM_TYPES.find(t => t.value === itemType)?.label || itemType}
                    </h2>
                    <span style={{ background: "#eef2ff", color: "#4338ca", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                      {outfits.length} option{outfits.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {outfits.map(outfit => <OutfitCard key={outfit.id} outfit={outfit} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
