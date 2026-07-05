import { Section } from "./ui";

export default function AnalyseSection({ analysed, detecting, onCameraOpen, onUploadClick }) {
  return (
    <Section title="Analyse Your Look">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          onClick={onCameraOpen}
          disabled={detecting}
          style={{ padding: "9px 0", borderRadius: 8, border: "1.5px solid #a5b4fc", background: detecting ? "#e0e7ff" : "#eef2ff", color: "#4338ca", cursor: detecting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}
        >
          {detecting ? "Analysing..." : "Use Camera"}
        </button>
        <button
          onClick={onUploadClick}
          disabled={detecting}
          style={{ padding: "9px 0", borderRadius: 8, border: "1.5px dashed #cbd5e1", background: detecting ? "#f1f5f9" : "#f8fafc", color: "#475569", cursor: detecting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}
        >
          {detecting ? "Analysing..." : "Upload Photo"}
        </button>
      </div>
      {analysed && (
        <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
          Analysis complete - recommendations personalised for you
        </p>
      )}
      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
        Upload a photo for personalised recommendations based on your unique look
      </p>
    </Section>
  );
}
