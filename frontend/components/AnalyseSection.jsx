import { Section } from "./ui";

export default function AnalyseSection({ analysed, detecting, onCameraOpen, onUploadClick }) {
  return (
    <Section title="Analyse Your Look">
      <div className="choice-grid">
        <button
          onClick={onCameraOpen}
          disabled={detecting}
          className="analysis-button analysis-button-camera"
        >
          {detecting ? "Analysing..." : "Use Camera"}
        </button>
        <button
          onClick={onUploadClick}
          disabled={detecting}
          className="analysis-button analysis-button-upload"
        >
          {detecting ? "Analysing..." : "Upload Photo"}
        </button>
      </div>
      {analysed && (
        <p className="status-success">
          Analysis complete - recommendations personalised for you
        </p>
      )}
      <p className="helper-text">
        Upload a photo for personalised recommendations based on your unique look
      </p>
    </Section>
  );
}
